#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// ANSI colors
const RESET = "\x1b[0m";
const BRIGHT = "\x1b[1m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";

const MEMORY_DIR = path.resolve(__dirname, '../../memory');
const GRINDER_STATS_FILE = path.join(MEMORY_DIR, 'grinder_stats.json');

function loadJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const regularButterfly = String.raw`
  ,-.,-.
 / \\ \\ / /\\
 \\ \\ \\ / / /
  \\ \\ X / /
   \\ / \\ /
    \'   \'
`;

const rareButterfly = String.raw`
***** *****
*   * *   *
*  BABIŠ  *
*  MOTÝLE *
*   * *   *
***** *****
`;

const slogans = [
  'Bude líp!',
  'My chceme znova motýle!',
  'Všichni kradnú, jenom ja makám!',
  'Čistý štít. Tvrdá makačka.',
  'Kobliha pre každého!',
];

function calcButterfliesFromXp(xp) {
  // 0..50
  const base = Math.floor(Number(xp || 0) / 200);
  return clamp(base, 1, 50);
}

function main() {
  const args = process.argv.slice(2);
  const rare = args.includes('--rare');

  const stats = loadJsonSafe(GRINDER_STATS_FILE, { xp: 0 });
  const xp = Number(stats?.xp ?? 0);
  const count = calcButterfliesFromXp(xp);

  const art = rare ? `${YELLOW}${BRIGHT}${rareButterfly}${RESET}` : `${CYAN}${BRIGHT}${regularButterfly}${RESET}`;

  console.log(`${GREEN}${BRIGHT}🦋 MOTÝLE REPORT${RESET}`);
  console.log(`${GREEN}XP: ${Math.round(xp)} → motýle: ${count}${RESET}`);
  console.log('');

  // Print a few butterflies (cap output so it doesn't spam terminal)
  const toPrint = Math.min(count, rare ? 3 : 8);
  for (let i = 0; i < toPrint; i++) {
    console.log(art);
  }

  // Motivation line (Babiš requested)
  const slogan = pick(slogans);
  console.log(`${YELLOW}${BRIGHT}📣 SLOGAN:${RESET} ${BRIGHT}${slogan}${RESET}`);

  // Small random extra line so it's not always same
  if (randInt(0, 100) < 35) {
    console.log(`${GREEN}Tip: Pusť \`node bin/index.js grind\` a nech XP rastú. Žiadne flákanie.${RESET}`);
  }
}

if (require.main === module) main();
