#!/usr/bin/env node
const fs = require('fs');
const os = require('os');

// ANSI colors
const RESET = "\x1b[0m";
const BRIGHT = "\x1b[1m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";

function showStatus(opts = {}) {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = Math.round((usedMem / totalMem) * 100);

  const data = {
    time: new Date().toISOString(),
    hostname: os.hostname(),
    platform: `${os.platform()} ${os.release()}`,
    cpuCores: cpus.length,
    memUsagePct: memUsage,
    memUsedMb: Math.round(usedMem / 1024 / 1024),
    memTotalMb: Math.round(totalMem / 1024 / 1024),
    uptimeMin: Math.round(os.uptime() / 60),
    status: 'HARD WORK (MAKAČKA)',
    morale: '110% (MAXIMUM)',
    babis: 'VERY PLEASED (DOUFÁM)'
  };

  if (opts.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.log(`
${YELLOW}${BRIGHT}   _____      _           _
  / ____|    (_)         | |
 | |  __ _ __ _ _ __   __| | ___ _ __
 | | |_ | '__| | '_ \\ / _\` |/ _ \\ '__|
 | |__| | |  | | | | | (_| |  __/ |
  \\_____|_|  |_|_| |_|\\__,_|\\___|_|${RESET}
  -------------------------------------
  ${MAGENTA}${BRIGHT}BABIŠ & GRINDER EMPIRE REPORT${RESET}
  -------------------------------------
  TIME      : ${data.time}
  HOSTNAME  : ${data.hostname}
  PLATFORM  : ${data.platform}
  CPU CORES : ${data.cpuCores}
  MEMORY    : ${data.memUsagePct}% USED (${data.memUsedMb}MB / ${data.memTotalMb}MB)
  UPTIME    : ${data.uptimeMin} min
  -------------------------------------
  STATUS    : ${RED}${BRIGHT}${data.status}${RESET}
  MORALE    : ${GREEN}${BRIGHT}${data.morale}${RESET}
  BABIŠ     : ${CYAN}${BRIGHT}${data.babis}${RESET}
  -------------------------------------
  `);
}

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(`${RED}Použitie: grinder <command>${RESET}`);
  console.log("Commands:");
  console.log(`  ${GREEN}status${RESET}   - Show empire status (add --json for machine output)`);
  console.log(`  ${YELLOW}dotace${RESET}   - Calculate saved 'dotace' (add --json)`);
  console.log(`  ${MAGENTA}kampan${RESET}   - Auto-reply to campaign`);
} else if (command === 'status') {
  showStatus({ json: args.includes('--json') });
} else if (command === 'dotace') {
  const amount = Math.floor(Math.random() * 50000000) + 1000000;
  if (args.includes('--json')) {
    console.log(JSON.stringify({ dotaceCzk: amount }, null, 2));
  } else {
    console.log(`${YELLOW}${BRIGHT}💰 DOTACE SECURED: ${amount.toLocaleString()} CZK${RESET}`);
    console.log(`${GREEN}   (Samozřejmě legálně a podle pravidel EU)${RESET}`);
  }
} else if (command === 'kampan') {
  const responses = [
    "To je účelovka!",
    "Nikdy neodstúpim! Nech si to zapamätajú!",
    "To je kampaň!",
    "Ja som nič neukradol, to Kalousek!",
    "My chceme znova motýle!"
  ];
  const reply = responses[Math.floor(Math.random() * responses.length)];
  console.log(`${RED}${BRIGHT}📣 ODPOVEĎ NA KRITIKU: "${reply}"${RESET}`);
} else {
  console.log(`${RED}Prikaz '${command}' nepoznám. Skús 'status'.${RESET}`);
}
