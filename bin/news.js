#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// ANSI colors
const RESET = "\x1b[0m";
const BRIGHT = "\x1b[1m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";

const MEMORY_DIR = path.resolve(__dirname, '../../memory');
const GRINDER_STATS_FILE = path.join(MEMORY_DIR, 'grinder_stats.json');
const DONUT_STATE_FILE = path.join(MEMORY_DIR, 'donut_state.json');

function loadJsonSafe(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatCzk(n) {
  try {
    return Number(n).toLocaleString('cs-CZ') + ' CZK';
  } catch {
    return String(n) + ' CZK';
  }
}

function derivePopularity(stats, donut) {
  if (typeof donut?.popularity === 'number') return clamp(Math.round(donut.popularity), 0, 100);
  const xp = Number(stats?.xp ?? 0);
  return clamp(30 + Math.floor(xp / 50), 0, 100);
}

function deriveDotace(stats, donut) {
  if (typeof donut?.budget === 'number') return Math.max(0, Math.floor(donut.budget));
  const xp = Number(stats?.xp ?? 0);
  return 1_000_000 + Math.floor(xp * 12_345);
}

function primeTime(popularity, dotace) {
  const pop90 = [
    'HISTORICKÝ TRIUMF IMPÉRIA!',
    'NÁROD SA KLANIA GOD EMPEROROVI!',
    'MIMORIADNE: 90%+ POPULARITA — ĽUD SA ZBLÁZNIL!',
  ];
  const dot1b = [
    '🪙🪙🪙 DOTAČNÝ MAGNÁT ROKU — BRUSEL NEVERÍ!',
    'DOTAČNÁ BÚRKA: IMPÉRIUM PREKONALO 1 MILIARDU!',
  ];

  const lines = [];
  if (popularity > 90) lines.push(pick(pop90));
  if (dotace > 1_000_000_000) lines.push(pick(dot1b));
  return lines;
}

function main() {
  const stats = loadJsonSafe(GRINDER_STATS_FILE, { xp: 0, level: 1, lastGrind: null, totalCommits: 0 });
  const donut = loadJsonSafe(DONUT_STATE_FILE, null);

  const popularity = derivePopularity(stats, donut);
  const dotace = deriveDotace(stats, donut);
  const prime = primeTime(popularity, dotace);

  const titles = [
    'Babiš & Grinder impérium hlási rekordný rast!',
    `Koblihy idú hore, opozícia plače: ${popularity}% popularita!`,
    `MIMORIADNE: Dotácie tečú jak Dunaj (${formatCzk(dotace)})`,
    'BREAKING: Motýle hlásia návrat, mediálny cartel v panike!',
  ];

  const weather = pick([
    'Bude líp: prívaly dotácií a motýle v každej dedine.',
    'Zamračené, ale stabilné: repka kvitne a PR tím to drží.',
    'Búrky z opozície, ale impérium má dáždnik z koblih.',
  ]);

  const headline = prime.length ? prime[0] : pick(titles);

  console.log(`\n${MAGENTA}${BRIGHT}📺 BABIŠ & GRINDER TV — EMPIRE NEWS NETWORK${RESET}`);
  console.log(`${BLUE}${BRIGHT}═══════════════════════════════════════════════${RESET}`);
  console.log(`${CYAN}${BRIGHT}⏱️  ${new Date().toISOString()}${RESET}`);
  console.log(`${YELLOW}${BRIGHT}📰 TITULEK:${RESET} ${BRIGHT}${headline}${RESET}`);

  if (prime.length > 1) {
    console.log(`\n${RED}${BRIGHT}🔥 PRIME-TIME:${RESET}`);
    prime.slice(1).forEach((l) => console.log(`${RED}${BRIGHT}- ${RESET}${l}`));
  }

  console.log(`\n${GREEN}${BRIGHT}📣 ZPRÁVA:${RESET} Popularita ${popularity}%, dotácie ${formatCzk(dotace)}. Makačka pokračuje, tradičníci plačú.`);

  if (donut) {
    console.log(`\n${YELLOW}${BRIGHT}🍩 DONUT SIM CANON:${RESET} deň ${donut.day ?? '?'} | koblihy ${donut.inventory ?? '?'} | pop ${donut.popularity ?? '?'}% | budget ${formatCzk(donut.budget ?? 0)}`);
  }

  console.log(`\n${CYAN}${BRIGHT}🌦️  POČASIE:${RESET} ${weather}`);
  console.log(`${BLUE}${BRIGHT}═══════════════════════════════════════════════${RESET}\n`);
}

if (require.main === module) main();
