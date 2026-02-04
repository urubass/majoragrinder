const $ = (id) => document.getElementById(id);

async function j(url) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

async function refreshHealth() {
  const out = await j('/api/health');
  const txt = JSON.stringify(out, null, 2);
  $('health').textContent = txt;
  $('healthText').textContent = out.ok ? 'ok' : 'error';
  $('statusDot').className = 'dot ' + (out.ok ? 'ok' : 'bad');
}

async function refreshRecent() {
  const out = await j('/api/recent-files');
  $('recent').textContent = (out && out.text) ? out.text : JSON.stringify(out, null, 2);
}

async function loadTail() {
  const path = $('tailPath').value;
  const n = Number($('tailN').value || 200);
  const out = await j(`/api/tail?path=${encodeURIComponent(path)}&n=${encodeURIComponent(n)}`);
  $('tail').textContent = out.text || '';
}

async function initTailOptions() {
  // server exposes allowlisted options via recent-files payload when available
  const options = [
    '/tmp/openclaw/openclaw-2026-02-04.log',
    '/tmp/openclaw',
  ];
  // Keep it simple: user can paste path by editing DOM? no. Provide minimal.
  $('tailPath').innerHTML = '';
  for (const p of options) {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    $('tailPath').appendChild(opt);
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

document.addEventListener('DOMContentLoaded', async () => {
  $('refreshBtn').addEventListener('click', refreshAll);
  $('tailBtn').addEventListener('click', loadTail);
  await initTailOptions();
  await refreshAll();
});
