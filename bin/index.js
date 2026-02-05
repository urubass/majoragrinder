#!/usr/bin/env node
const fs = require('fs');
const os = require('os');

function showStatus() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = Math.round((usedMem / totalMem) * 100);

  console.log(`
   _____      _           _
  / ____|    (_)         | |
 | |  __ _ __ _ _ __   __| | ___ _ __
 | | |_ | '__| | '_ \\ / _\` |/ _ \\ '__|
 | |__| | |  | | | | | (_| |  __/ |
  \\_____|_|  |_|_| |_|\\__,_|\\___|_|
  -------------------------------------
  EMPIRE STATUS REPORT
  -------------------------------------
  TIME      : ${new Date().toISOString()}
  HOSTNAME  : ${os.hostname()}
  PLATFORM  : ${os.platform()} ${os.release()}
  CPU CORES : ${cpus.length}
  MEMORY    : ${memUsage}% USED (${Math.round(usedMem / 1024 / 1024)}MB / ${Math.round(totalMem / 1024 / 1024)}MB)
  UPTIME    : ${Math.round(os.uptime() / 60)} min
  -------------------------------------
  STATUS    : HARD WORK (MAKAČKA)
  MORALE    : HIGH (VYSOKÁ)
  BABIŠ     : PLEASED (SNÁĎ)
  -------------------------------------
  `);
}

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log("Použitie: grinder <command>");
  console.log("Commands:");
  console.log("  status   - Show empire status");
} else if (command === 'status') {
  showStatus();
} else {
  console.log(`Prikaz '${command}' nepoznám. Skús 'status'.`);
}
