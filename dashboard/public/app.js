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
    '/tmp/openclaw/',
    '/tmp/openclaw/openclaw.log'
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

document.addEventListener('DOMContentLoaded', async () => {
  $('refreshBtn').addEventListener('click', refreshAll);
  $('tailBtn').addEventListener('click', loadTail);

  initTailOptions();
  await refreshAll();
});
