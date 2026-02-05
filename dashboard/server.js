const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const WORKSPACE = process.env.WORKSPACE || path.join(process.env.HOME, '.openclaw/workspace');

// Allowed paths for tailing
const ALLOWED_DIRS = [
  '/tmp/openclaw',
  path.join(WORKSPACE, 'memory'),
  path.join(WORKSPACE, 'ai')
];

function isPathUnderDir(filePath, allowedDir) {
  const dir = path.resolve(allowedDir);
  const file = path.resolve(filePath);
  const rel = path.relative(dir, file);
  // If rel starts with '..' or is absolute, it's outside.
  return rel && !rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel);
}

app.use(express.static('public'));

// Config endpoint for frontend (no secrets)
app.get('/api/config', (req, res) => {
  res.json({
    workspace: WORKSPACE,
    allowedDirs: ALLOWED_DIRS,
  });
});

// 1. Health endpoint - Gateway status
app.get('/api/health', (req, res) => {
  exec('openclaw gateway status', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
    const isRunning = stdout.toLowerCase().includes('running') || stdout.toLowerCase().includes('active');
    res.json({ status: isRunning ? 'running' : 'stopped', raw: stdout });
  });
});

// 2. Recent files endpoint
app.get('/api/recent-files', (req, res) => {
  const cmd = `find "${WORKSPACE}" -type f -mtime -1 ! -path "*/node_modules/*" ! -path "*/.git/*" -printf "%TY-%Tm-%Td %TH:%TM  %p\\n" | sort -r | head -n 50`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
    const trimmed = stdout.trim();
    res.json({ files: trimmed ? trimmed.split('\\n') : [] });
  });
});

// 3. Tail endpoint with allowlist
app.get('/api/tail', (req, res) => {
  const filePath = req.query.path;
  const n = parseInt(req.query.n) || 100;

  if (!filePath) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // Security check: resolve path and check boundary-safe membership in allowed dirs
  const resolvedPath = path.resolve(filePath);
  const isAllowed = ALLOWED_DIRS.some((dir) => isPathUnderDir(resolvedPath, dir));

  if (!isAllowed) {
    return res.status(403).json({ error: 'Access denied to this path' });
  }

  if (!fs.existsSync(resolvedPath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const cmd = `tail -n ${n} "${resolvedPath}"`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
    res.json({ path: resolvedPath, content: stdout });
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Dashboard backend running at http://127.0.0.1:${PORT}`);
  console.log(`Workspace: ${WORKSPACE}`);
});
