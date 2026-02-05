const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const WORKSPACE = process.env.WORKSPACE || path.join(process.env.HOME, '.openclaw/workspace');

// Allowed directories for tailing (resolved + boundary-safe)
const ALLOWED_DIRS = [
  '/tmp/openclaw',
  path.join(WORKSPACE, 'memory')
].map((d) => {
  const r = path.resolve(d);
  return r.endsWith(path.sep) ? r : r + path.sep;
});

app.use(express.static('public'));

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
    const out = (stdout || '').trim();
    res.json({ files: out ? out.split('\\n') : [] });
  });
});

// 3. Tail endpoint with allowlist
app.get('/api/tail', (req, res) => {
  const filePath = req.query.path;
  const n = parseInt(req.query.n) || 100;

  if (!filePath) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // Security check: resolve path and check boundary-safe allowed directories
  const resolvedPath = path.resolve(filePath);
  const resolvedWithSep = resolvedPath.endsWith(path.sep) ? resolvedPath : resolvedPath + path.sep;
  const isAllowed = ALLOWED_DIRS.some((dir) => resolvedWithSep.startsWith(dir));

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
