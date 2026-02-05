const $ = (id) => document.getElementById(id);

async function j(url) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

function pretty(v) {
  return typeof v === 'string' ? v : JSON.stringify(v, null, 2);
}

async function refreshHealth() {
  const out = await j('/api/health');
  const ok = out && out.status === 'running';

  $('health').textContent = pretty(out);
  $('healthText').textContent = ok ? 'ok' : (out?.status || 'error');
  $('statusDot').className = 'dot ' + (ok ? 'ok' : 'bad');
}

async function refreshRecent() {
  const out = await j('/api/recent-files');

  if (out && Array.isArray(out.files)) {
    $('recent').textContent = out.files.filter(Boolean).join('\n');
  } else if (out && typeof out.text === 'string') {
    $('recent').textContent = out.text;
  } else {
    $('recent').textContent = pretty(out);
  }
}

async function loadTail() {
  const path = $('tailPath').value.trim();
  const n = Number($('tailN').value || 200);

  if (!path) {
    $('tail').textContent = 'Please enter a path.';
    return;
  }

  const out = await j(`/api/tail?path=${encodeURIComponent(path)}&n=${encodeURIComponent(n)}`);
  $('tail').textContent = out.content ?? out.text ?? '';
}

function initTailOptions() {
  const options = [
    '/tmp/openclaw/openclaw.log',
    '/home/parkos/.openclaw/workspace/memory/',
    '/home/parkos/.openclaw/workspace/ai/'
  ];

  const list = $('tailPathList');
  if (!list) return;

  list.innerHTML = '';
  for (const p of options) {
    const opt = document.createElement('option');
    opt.value = p;
    list.appendChild(opt);
  }
}

async function refreshAll() {
  try {
    await refreshHealth();
  } catch (e) {
    $('health').textContent = String(e);
    $('healthText').textContent = 'error';
    $('statusDot').className = 'dot bad';
  }

  try {
    await refreshRecent();
  } catch (e) {
    $('recent').textContent = String(e);
  }
}

function initTvAudio() {
  const playlist = [
    { src: '/audio/segments/seg01.mp3', text: 'INTRO: Babiš & Grinder TV' },
    { src: '/audio/segments/seg02.mp3', text: 'SLIB #1: Dálnice' },
    { src: '/audio/segments/seg03.mp3', text: 'SLIB #2: Máslo' },
    { src: '/audio/segments/seg04.mp3', text: 'SLIB #3: Motýle' },
    { src: '/audio/segments/seg05.mp3', text: 'OUTRO: Nikdy neodstoupím' },
  ];

  const audio = $('tvAudio');
  const state = $('tvState');
  const line = $('tvLine');

  let idx = 0;

  function setState(ok, label) {
    state.textContent = label;
    state.className = 'badge ' + (ok ? 'ok' : 'bad');
  }

  function playIndex(i) {
    idx = i;
    if (idx >= playlist.length) {
      line.textContent = '—';
      setState(true, 'done');
      return;
    }
    const item = playlist[idx];
    line.textContent = item.text;
    audio.src = item.src;
    audio.currentTime = 0;
    audio.play().catch((e) => {
      setState(false, 'audio error');
      console.error(e);
    });
    setState(true, `playing ${idx + 1}/${playlist.length}`);
  }

  audio.addEventListener('ended', () => playIndex(idx + 1));

  $('tvPlay').addEventListener('click', () => playIndex(0));
  $('tvStop').addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
    line.textContent = '—';
    setState(true, 'stopped');
  });

  setState(true, 'idle');
}

document.addEventListener('DOMContentLoaded', async () => {
  $('refreshBtn').addEventListener('click', refreshAll);
  $('tailBtn').addEventListener('click', loadTail);

  initTailOptions();
  initTvAudio();
  await refreshAll();
});
