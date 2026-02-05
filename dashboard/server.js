const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const WORKSPACE = process.env.WORKSPACE || path.join(process.env.HOME, '.openclaw/workspace');

function sendOk(res, data) {
  res.json({ ok: true, ...data });
}

function sendErr(res, statusCode, code, message, extra = {}) {
  res.status(statusCode).json({ ok: false, error: { code, message }, ...extra });
}

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

// 1. Health endpoint - Gateway status
app.get('/api/health', (req, res) => {
  exec('openclaw gateway status', (error, stdout, stderr) => {
    if (error) {
      return sendErr(res, 500, 'HEALTH_CMD_FAILED', error.message);
    }
    const isRunning = stdout.toLowerCase().includes('running') || stdout.toLowerCase().includes('active');
    return sendOk(res, { status: isRunning ? 'running' : 'stopped', raw: stdout });
  });
});

// 2. Recent files endpoint
app.get('/api/recent-files', (req, res) => {
  const cmd = `find "${WORKSPACE}" -type f -mtime -1 ! -path "*/node_modules/*" ! -path "*/.git/*" -printf "%TY-%Tm-%Td %TH:%TM  %p\\n" | sort -r | head -n 50`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return sendErr(res, 500, 'RECENT_FILES_FAILED', error.message);
    }
    const trimmed = stdout.trim();
    return sendOk(res, { files: trimmed ? trimmed.split('\\n') : [] });
  });
});

// 3. Dotace endpoint (reads CLI output)
app.get('/api/dotace', (req, res) => {
  const cmd = `node "${path.join(__dirname, '../bin/index.js')}" dotace --json`;
  exec(cmd, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
    if (error) {
      return sendErr(res, 500, 'DOTACE_CMD_FAILED', error.message, { stderr: String(stderr || '') });
    }
    try {
      const obj = JSON.parse(String(stdout || '{}'));
      return sendOk(res, { verified: true, source: 'cli', ...obj });
    } catch (e) {
      return sendErr(res, 500, 'DOTACE_BAD_JSON', 'Invalid JSON from CLI', { raw: String(stdout || '') });
    }
  });
});

// 4. Tail endpoint with allowlist
app.get('/api/tail', (req, res) => {
  const filePath = req.query.path;
  const n = parseInt(req.query.n) || 100;

  if (!filePath) {
    return sendErr(res, 400, 'TAIL_MISSING_PATH', 'Missing path parameter');
  }

  // Security check: resolve path and check boundary-safe membership in allowed dirs
  const resolvedPath = path.resolve(filePath);
  const isAllowed = ALLOWED_DIRS.some((dir) => isPathUnderDir(resolvedPath, dir));

  if (!isAllowed) {
    return sendErr(res, 403, 'TAIL_ACCESS_DENIED', 'Access denied to this path');
  }

  if (!fs.existsSync(resolvedPath)) {
    return sendErr(res, 404, 'TAIL_NOT_FOUND', 'File not found');
  }

  const cmd = `tail -n ${n} "${resolvedPath}"`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return sendErr(res, 500, 'TAIL_CMD_FAILED', error.message);
    }
    return sendOk(res, { path: resolvedPath, content: stdout });
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Dashboard backend running at http://127.0.0.1:${PORT}`);
  console.log(`Workspace: ${WORKSPACE}`);
});
