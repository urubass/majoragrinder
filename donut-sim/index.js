const readline = require('readline');

// Stav Impéria
let state = {
  inventory: 1000,   // Koblihy z Penamu
  popularity: 50,    // Láska ľudu (%)
  budget: 5000000,   // Dotácie (CZK)
  day: 1
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function log(msg, color = "\x1b[0m") {
  console.log(color + msg + "\x1b[0m");
}

function header() {
  console.clear();
  log(`
   🍩  BABIŠ & GRINDER DONUT SIMULATOR  🍩
  =========================================
  DEN: ${state.day}
  KOBLIHY : ${state.inventory} ks
  POPULARITA : ${state.popularity}%
  BUDGET  : ${state.budget.toLocaleString()} CZK
  =========================================
  `, "\x1b[33m\x1b[1m");
}

function campaign() {
  if (state.budget < 1000000) {
    log("❌ Nemáš dosť peňazí na kampaň! Treba dotácie!", "\x1b[31m");
    return;
  }
  state.budget -= 1000000;
  state.popularity = Math.min(100, state.popularity + 20);
  state.inventory -= 500; // Rozdali sme koblihy
  log("📣 Kampaň spustená! Ľudia ťa milujú! (-1M CZK, -500 koblih, +20% pop)", "\x1b[32m");
}

function lobbyBrussels() {
  const gain = Math.floor(Math.random() * 2000000) + 500000;
  state.budget += gain;
  log(`💰 Lobboval si v Bruseli. Cinklo to! (+${gain.toLocaleString()} CZK)`, "\x1b[32m");
}

function bake() {
  const cost = 200000;
  if (state.budget < cost) {
    log("❌ Nemáš na múku! Penam stojí!", "\x1b[31m");
    return;
  }
  state.budget -= cost;
  state.inventory += 1000;
  log("🥖 Penam napiekol čerstvé koblihy! (+1000 ks, -200k CZK)", "\x1b[33m");
}

function kalousekAttack() {
  if (Math.random() < 0.3) {
    log("\n⚠️ POZOR! ÚTOK KALOUSKA! ⚠️", "\x1b[31m\x1b[1m");
    const dmg = Math.floor(Math.random() * 10) + 5;
    state.popularity -= dmg;
    log(`Kalousek povedal, že tvoje koblihy sú zo zhnitej repky! Popularita -${dmg}%`, "\x1b[31m");
  }
}

function nextDay() {
  state.day++;
  // Pasívna spotreba popularity
  state.popularity -= 2;
  // Kalousek
  kalousekAttack();
  
  if (state.popularity <= 0) {
    log("\n💀 GAME OVER! Ľudia ťa vyhnali vidlami. Koniec impéria.", "\x1b[31m");
    process.exit(0);
  }
  loop();
}

function loop() {
  header();
  log("\nČo urobíš, šéfe?");
  log("1) Spustiť KAMPAŇ (Rozdať koblihy)");
  log("2) Lobbovať v BRUSELI (Získať dotácie)");
  log("3) Piecť v PENAME (Doplniť zásoby)");
  log("4) Spať (Ďalší deň)");
  log("X) Koniec");

  rl.question("\nTvoja voľba: ", (choice) => {
    switch(choice.toLowerCase()) {
      case '1': campaign(); break;
      case '2': lobbyBrussels(); break;
      case '3': bake(); break;
      case '4': nextDay(); return; // nextDay calls loop
      case 'x': process.exit(0);
      default: log("Nerozumiem. Skús to znova.");
    }
    
    // Čakanie pred redrawom (okrem nextDay)
    rl.question("\n[Stlač ENTER]", () => {
      loop();
    });
  });
}

// Start
loop();
