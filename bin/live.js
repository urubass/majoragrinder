#!/usr/bin/env node
// Live ticker: repeats Empire News.

const { spawn } = require('child_process');
const path = require('path');

const newsPath = path.join(__dirname, 'news.js');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { everySec: 60, count: 0 };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--every' || a === '-e') {
      const v = Number(args[i + 1]);
      if (!Number.isNaN(v) && v > 0) out.everySec = v;
      i++;
    } else if (a === '--count' || a === '-c') {
      const v = Number(args[i + 1]);
      if (!Number.isNaN(v) && v >= 0) out.count = Math.floor(v);
      i++;
    }
  }

  return out;
}

function runNewsOnce() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [newsPath], { stdio: 'inherit' });
    child.on('exit', () => resolve());
  });
}

async function main() {
  const { everySec, count } = parseArgs();
  let n = 0;

  while (true) {
    n++;
    await runNewsOnce();
    if (count > 0 && n >= count) break;
    await new Promise((r) => setTimeout(r, everySec * 1000));
  }
}

if (require.main === module) main();
