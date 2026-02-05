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

function showStatus() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = Math.round((usedMem / totalMem) * 100);

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
  TIME      : ${new Date().toISOString()}
  HOSTNAME  : ${os.hostname()}
  PLATFORM  : ${os.platform()} ${os.release()}
  CPU CORES : ${cpus.length}
  MEMORY    : ${memUsage}% USED (${Math.round(usedMem / 1024 / 1024)}MB / ${Math.round(totalMem / 1024 / 1024)}MB)
  UPTIME    : ${Math.round(os.uptime() / 60)} min
  -------------------------------------
  STATUS    : ${RED}${BRIGHT}HARD WORK (MAKAČKA)${RESET}
  MORALE    : ${GREEN}${BRIGHT}110% (MAXIMUM)${RESET}
  BABIŠ     : ${CYAN}${BRIGHT}VERY PLEASED (DOUFÁM)${RESET}
  -------------------------------------
  `);
}

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(`${RED}Použitie: grinder <command>${RESET}`);
  console.log("Commands:");
  console.log(`  ${GREEN}status${RESET}   - Show empire status`);
  console.log(`  ${YELLOW}dotace${RESET}   - Calculate saved 'dotace'`);
  console.log(`  ${MAGENTA}kampan${RESET}   - Auto-reply to campaign`);
} else if (command === 'status') {
  showStatus();
} else if (command === 'dotace') {
  const amount = Math.floor(Math.random() * 50000000) + 1000000;
  console.log(`${YELLOW}${BRIGHT}💰 DOTACE SECURED: ${amount.toLocaleString()} CZK${RESET}`);
  console.log(`${GREEN}   (Samozřejmě legálně a podle pravidel EU)${RESET}`);
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
