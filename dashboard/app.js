/*
  Babiš × Grinder — demo dashboard
  Vanilla JS placeholders for:
  - realtime graphs (canvas)
  - subsidy counter
  - campaign button (random quote)

  Replace the synthetic generators with real data (WS/SSE/REST).
*/

const $ = (sel) => document.querySelector(sel);

const state = {
  startTs: performance.now(),
  paused: false,
  // “Subsidy counter” is intentionally abstract here; treat as a KPI.
  subsidy: {
    valueCZK: 0,
    baseCZK: 125_000_000,
    rateCZKPerSec: 12_500, // demo rate
  },
  series: {
    sentiment: [],
    momentum: [],
    reach: [],
    spend: [],
  },
  logSeq: 0,
  fps: { last: performance.now(), frames: 0, value: 0 },
};

const quotes = [
  "Nebojte, já to zařídím.",
  "Já makám. A ostatní ať taky makaj.",
  "Všichni proti mně, ale já jedu dál.",
  "To je kampaň, to je realita.",
  "Musíme to dělat líp než oni.",
  "Já nejsem politik, já jsem manažer.",
  "Zdravý rozum zvítězí.",
];

function formatCZK(n){
  const s = Math.round(n).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Kč";
}

function pad2(n){ return String(n).padStart(2, "0"); }

function nowClock(){
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function uptime(){
  const ms = performance.now() - state.startTs;
  const s = Math.floor(ms/1000);
  const hh = Math.floor(s/3600);
  const mm = Math.floor((s%3600)/60);
  const ss = s%60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
}

function randn(){
  // Box–Muller
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
}

function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

function pushLog(level, msg){
  const el = $("#console");
  if(!el) return;
  const line = document.createElement("div");
  line.className = "line";

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = `[${nowClock()}]`;

  const lvl = document.createElement("span");
  lvl.className = level;
  lvl.textContent = level.toUpperCase();

  const text = document.createElement("span");
  text.textContent = `  ${msg}`;

  line.append(tag, lvl, text);
  el.prepend(line);

  // keep console tidy
  state.logSeq++;
  if(state.logSeq % 20 === 0){
    const nodes = el.querySelectorAll(".line");
    for(let i = 120; i < nodes.length; i++) nodes[i].remove();
  }
}

// --- Canvas chart placeholders ---

function setupSeries(){
  const N = 90;
  state.series.sentiment = Array.from({length:N}, (_,i)=> 50 + Math.sin(i/7)*7 + randn()*1.4);
  state.series.momentum  = Array.from({length:N}, (_,i)=> 50 + Math.cos(i/9)*6 + randn()*1.2);
  state.series.reach     = Array.from({length:N}, (_,i)=> 55 + Math.sin(i/11)*9 + randn()*1.0);
  state.series.spend     = Array.from({length:18}, (_,i)=> 40 + Math.sin(i/3)*18 + Math.random()*12);
}

function getHiDpi(ctx){
  const c = ctx.canvas;
  const rect = c.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(2.25, window.devicePixelRatio || 1));
  const w = Math.floor(rect.width * dpr);
  const h = Math.floor(rect.height * dpr);
  if(c.width !== w || c.height !== h){
    c.width = w; c.height = h;
  }
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return { w: rect.width, h: rect.height, dpr };
}

function drawGrid(ctx, w, h){
  ctx.save();
  ctx.clearRect(0,0,w,h);
  ctx.globalAlpha = 0.9;

  // subtle gradient wash
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0, "rgba(85,224,123,0.06)");
  g.addColorStop(0.6, "rgba(255,255,255,0.00)");
  g.addColorStop(1, "rgba(247,211,74,0.05)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  // grid
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  const step = 36;
  for(let x=0; x<=w; x+=step){
    ctx.beginPath(); ctx.moveTo(x+0.5,0); ctx.lineTo(x+0.5,h); ctx.stroke();
  }
  for(let y=0; y<=h; y+=step){
    ctx.beginPath(); ctx.moveTo(0,y+0.5); ctx.lineTo(w,y+0.5); ctx.stroke();
  }
  ctx.restore();
}

function drawLine(ctx, w, h, data, color, width=2, alpha=1){
  const min = 0, max = 100;
  const pad = 14;
  const dx = (w - pad*2) / (data.length - 1);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  data.forEach((v,i)=>{
    const x = pad + i*dx;
    const y = pad + (1 - (v-min)/(max-min))*(h-pad*2);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
  ctx.restore();
}

function drawArea(ctx, w, h, data, color){
  const min = 0, max = 100;
  const pad = 14;
  const dx = (w - pad*2) / (data.length - 1);
  ctx.save();
  const grad = ctx.createLinearGradient(0,pad,0,h-pad);
  grad.addColorStop(0, color.replace("1)","0.30)"));
  grad.addColorStop(1, color.replace("1)","0.02)"));
  ctx.fillStyle = grad;

  ctx.beginPath();
  data.forEach((v,i)=>{
    const x = pad + i*dx;
    const y = pad + (1 - (v-min)/(max-min))*(h-pad*2);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.lineTo(w-pad, h-pad);
  ctx.lineTo(pad, h-pad);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBars(ctx, w, h, data){
  ctx.save();
  const pad = 14;
  const max = Math.max(...data, 1);
  const bw = (w - pad*2) / data.length;

  for(let i=0;i<data.length;i++){
    const v = data[i];
    const x = pad + i*bw;
    const bh = (v/max) * (h - pad*2);
    const y = h - pad - bh;

    const grad = ctx.createLinearGradient(x,y,x,y+bh);
    grad.addColorStop(0, "rgba(85,224,123,0.42)");
    grad.addColorStop(1, "rgba(247,211,74,0.10)");
    ctx.fillStyle = grad;
    ctx.fillRect(x+2, y, Math.max(4, bw-6), bh);

    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.strokeRect(x+2.5, y+0.5, Math.max(4, bw-6), bh);
  }
  ctx.restore();
}

function tickData(){
  if(state.paused) return;

  const s = state.series.sentiment;
  const m = state.series.momentum;
  const r = state.series.reach;
  const lastS = s[s.length-1];
  const lastM = m[m.length-1];
  const lastR = r[r.length-1];

  const nextS = clamp(lastS + randn()*1.6 + (Math.random()-0.5)*0.9, 10, 90);
  const nextM = clamp(lastM + randn()*1.2 + (Math.random()-0.5)*0.7, 12, 92);
  const nextR = clamp(lastR + randn()*1.0 + (Math.random()-0.5)*0.6, 15, 95);

  s.push(nextS); s.shift();
  m.push(nextM); m.shift();
  r.push(nextR); r.shift();

  // spend bars slowly vary
  const b = state.series.spend;
  for(let i=0;i<b.length;i++) b[i] = clamp(b[i] + randn()*1.3, 8, 95);
}

function render(){
  // FPS meter
  state.fps.frames++;
  const t = performance.now();
  if(t - state.fps.last > 700){
    state.fps.value = Math.round((state.fps.frames*1000) / (t - state.fps.last));
    state.fps.frames = 0;
    state.fps.last = t;
    $("#fps").textContent = String(state.fps.value);
  }

  // clocks
  $("#clock").textContent = nowClock();
  $("#uptime").textContent = uptime();

  // subsidy counter
  if(!state.paused){
    const elapsedSec = (performance.now() - state.startTs) / 1000;
    state.subsidy.valueCZK = state.subsidy.baseCZK + elapsedSec * state.subsidy.rateCZKPerSec;
  }
  $("#subsidyValue").textContent = formatCZK(state.subsidy.valueCZK);
  $("#subsidyRate").textContent = `${formatCZK(state.subsidy.rateCZKPerSec)}/s`;

  // sentiment delta chip
  const s = state.series.sentiment;
  const delta = (s[s.length-1] - s[s.length-6]) / 100;
  const pct = (delta*100).toFixed(1);
  const chip = $("#sentimentChip");
  chip.textContent = `${delta>=0?'+':''}${pct}%`;
  chip.className = "chip " + (delta>=0 ? "chip--good" : "chip--warn");

  // charts
  const cs = $("#chartSentiment")?.getContext("2d");
  const csp = $("#chartSpend")?.getContext("2d");
  const cr = $("#chartReach")?.getContext("2d");

  if(cs){
    const {w,h} = getHiDpi(cs);
    drawGrid(cs,w,h);
    drawArea(cs,w,h,state.series.sentiment,"rgba(247,211,74,1)");
    drawLine(cs,w,h,state.series.sentiment,"rgba(247,211,74,0.95)",2.2,1);
    drawLine(cs,w,h,state.series.momentum,"rgba(85,224,123,0.85)",2.0,1);
    // baseline
    cs.strokeStyle = "rgba(255,255,255,0.18)";
    cs.lineWidth = 1;
    cs.beginPath(); cs.moveTo(14,h/2); cs.lineTo(w-14,h/2); cs.stroke();
  }

  if(csp){
    const {w,h} = getHiDpi(csp);
    drawGrid(csp,w,h);
    drawBars(csp,w,h,state.series.spend);
  }

  if(cr){
    const {w,h} = getHiDpi(cr);
    drawGrid(cr,w,h);
    drawArea(cr,w,h,state.series.reach,"rgba(85,224,123,1)");
    drawLine(cr,w,h,state.series.reach,"rgba(85,224,123,0.90)",2.2,1);
  }

  requestAnimationFrame(render);
}

function init(){
  // build stamp
  const build = new Date();
  $("#build").textContent = `${build.getFullYear()}-${pad2(build.getMonth()+1)}-${pad2(build.getDate())} ${pad2(build.getHours())}:${pad2(build.getMinutes())}`;
  $("#year").textContent = String(build.getFullYear());
  $("#sessionId").textContent = Math.random().toString(16).slice(2, 10).toUpperCase();

  setupSeries();

  pushLog("ok", "Dashboard boot complete (synthetic data mode).");
  pushLog("warn", "Connect WS/SSE feed to replace placeholders.");

  // data ticking
  setInterval(() => {
    tickData();
    if(!state.paused && Math.random() < 0.12){
      const msgs = [
        "Pulse sample ingested",
        "New talking-point cluster detected",
        "Spend pacing within corridor",
        "Reach curve stabilizing",
        "Audience segmentation refresh",
      ];
      pushLog("ok", msgs[Math.floor(Math.random()*msgs.length)]);
    }
  }, 650);

  // buttons
  $("#btnCampaign").addEventListener("click", () => {
    const q = quotes[Math.floor(Math.random()*quotes.length)];
    alert(q);
    pushLog("ok", `Campaign moment fired: “${q}”`);
  });

  $("#btnBoost").addEventListener("click", () => {
    state.subsidy.rateCZKPerSec = Math.round(state.subsidy.rateCZKPerSec * 1.25);
    pushLog("warn", `Narrative boost applied. New rate: ${formatCZK(state.subsidy.rateCZKPerSec)}/s`);
  });

  $("#btnPause").addEventListener("click", (e) => {
    state.paused = !state.paused;
    e.currentTarget.textContent = state.paused ? "Resume" : "Pause";
    $("#subsidyChip").textContent = state.paused ? "PAUSED" : "RUNNING";
    $("#statusDot").style.background = state.paused ? "rgba(255,255,255,.35)" : "var(--g)";
    $("#statusText").textContent = state.paused ? "PAUSED" : "SIMULATED LIVE";
    pushLog(state.paused ? "warn" : "ok", state.paused ? "Demo paused." : "Demo resumed.");
  });

  $("#btnExport").addEventListener("click", async () => {
    // Placeholder: export current state as JSON
    const payload = {
      ts: new Date().toISOString(),
      subsidyValueCZK: Math.round(state.subsidy.valueCZK),
      subsidyRateCZKPerSec: state.subsidy.rateCZKPerSec,
      sentimentTail: state.series.sentiment.slice(-10),
      momentumTail: state.series.momentum.slice(-10),
      reachTail: state.series.reach.slice(-10),
      spend: state.series.spend,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard-snapshot.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    pushLog("ok", "Snapshot exported (dashboard-snapshot.json).");
  });

  $("#btnInject").addEventListener("click", () => {
    const points = [
      "Shift to 'results-first' framing",
      "Highlight efficiency & control",
      "Attack incoherence, not people",
      "Push local wins + concrete numbers",
      "Short clips, high contrast, 6–9 sec",
    ];
    const p = points[Math.floor(Math.random()*points.length)];
    pushLog("ok", `Talking points injected: ${p}`);
  });

  $("#btnReset").addEventListener("click", () => {
    state.startTs = performance.now();
    state.subsidy.baseCZK = 125_000_000;
    state.subsidy.rateCZKPerSec = 12_500;
    setupSeries();
    pushLog("warn", "Demo data reset.");
  });

  requestAnimationFrame(render);
}

init();
