#!/usr/bin/env node
console.log("🏋️‍♂️ GRINDER CLI v0.0.1 - INIT");
console.log("--------------------------------");
console.log("STATUS: BRAINDEAD BUT FUNCTIONAL");
console.log("TIME: " + new Date().toISOString());
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Použitie: grinder <command>");
} else {
  console.log(`Prikaz '${args[0]}' zatiaľ nepoznám, ale pracujem na tom.`);
}
