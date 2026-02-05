const readline = require('readline');

const { loadState, saveState } = require('./state');

// Stav Impéria (persistuje sa do ../memory/donut_state.json)
let state = loadState({
  inventory: 1000,   // Koblihy z Penamu
  popularity: 50,    // Láska ľudu (%)
  budget: 5000000,   // Dotácie (CZK)
  mediaPower: 0,     // Sila médií (0-2)
  day: 1
});

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
  if (state.inventory < 500) {
    log("❌ Nemáš dosť koblih! Penam musí makať!", "\x1b[31m");
    return;
  }
  state.budget -= 1000000;
  state.popularity = Math.min(100, state.popularity + 20);
  state.inventory -= 500; // Rozdali sme koblihy
  saveState(state);
  log("📣 Kampaň spustená! Ľudia ťa milujú! (-1M CZK, -500 koblih, +20% pop)", "\x1b[32m");
}

function lobbyBrussels() {
  const gain = Math.floor(Math.random() * 2000000) + 500000;
  state.budget += gain;
  saveState(state);
  log(`💰 Lobboval si v Bruseli. Cinklo to! (+${gain.toLocaleString()} CZK)`, "\x1b[32m");
}

function bake() {
  const cost = 200000;
  if (state.budget < cost) {
    log("❌ Nemáš na múku! Penam musí stáť!", "\x1b[31m");
    return;
  }
  state.budget -= cost;
  state.inventory += 1000;
  saveState(state);
  log("🥖 Penam napiekol čerstvé koblihy! (+1000 ks, -200k CZK)", "\x1b[33m");
}

function workHard() {
  state.inventory += 2000;
  state.popularity -= 10;
  saveState(state);
  log("💪 MAKAČKA! Makal si 18 hodín ako drak! (+2000 koblih, -10% popularita - lidi jsou unavení)", "\x1b[31m\x1b[1m");
}

function grinderStream() {
  const cost = 500000;
  if (state.budget < cost) {
    log("❌ Nemáš na grafiky a streamery! Grinder nemôže vysielať!", "\x1b[31m");
    return;
  }

  state.budget -= cost;
  state.popularity = Math.min(100, state.popularity + 10);
  saveState(state);
  log("🎮 GRINDERREBORN STREAM! Hype je real! (+10% pop, -500k CZK)", "\x1b[34m\x1b[1m");
}

function cauLidiVideo() {
  const cost = 300000;
  if (state.budget < cost) {
    log("❌ Nemáš na kameramana! Čau lidi video nevzniklo.", "\x1b[31m");
    return;
  }

  state.budget -= cost;
  const boost = 12;
  state.popularity = Math.min(100, state.popularity + boost);
  saveState(state);

  const phrases = [
    "Čau lidi, já nespím, já makám a ti tradičníci mi zase chtějí sebrat tyhle krásné koblihy!",
    "Dobré ráno všem, slyšíte mě? My chceme znova motýle a poctivou českou řepku!",
    "Všichni proti mně, ale já se nikoho nebojím, já mám čistý štít a ty nejlepší výsledky!"
  ];
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

  log(`📹 ČAU LIDI VIDEO! (+${boost}% pop, -${cost.toLocaleString()} CZK)`, "\x1b[33m\x1b[1m");
  log(`🎙️ "${randomPhrase}"`, "\x1b[33m");
}

function buyMedia() {
  const cost = 2000000;
  if (state.mediaPower >= 2) {
    log("❌ Už vlastníš všetky dôležité médiá! Viac už nejde.", "\x1b[31m");
    return;
  }
  if (state.budget < cost) {
    log(`❌ Nemáš dosť peňazí na kúpu médií! Potrebuješ ${cost.toLocaleString()} CZK.`, "\x1b[31m");
    return;
  }

  state.budget -= cost;
  state.mediaPower += 1;
  saveState(state);
  log(`📰 KÚPIL SI MÉDIÁ! Teraz budeme písať pravdu! (-${cost.toLocaleString()} CZK, úbytok popularity sa znížil)`, "\x1b[32m\x1b[1m");
}

function kalousekAttack() {
  if (Math.random() < 0.3) {
    log("\n⚠️ POZOR! ÚTOK KALOUSKA! ⚠️", "\x1b[31m\x1b[1m");
    const dmg = Math.floor(Math.random() * 10) + 5;
    state.popularity -= dmg;
    log(`Kalousek povedal, že tvoje koblihy sú zo zhnitej repky! Popularita -${dmg}%`, "\x1b[31m");
  }
}

function butterflyEffect() {
  if (Math.random() < 0.15) {
    state.popularity = Math.min(100, state.popularity + 15);
    saveState(state);
    log("\n🦋 NÁDHERA! MOTÝLE SA VRÁTILI! 🦋", "\x1b[35m\x1b[1m");
    log("Ľudia videli motýľa na poli s repkou a sú nadšení! Popularita +15%", "\x1b[35m");
  }
}

function nextDay() {
  state.day++;
  // Pasívna spotreba popularity (znížená silou médií)
  const drain = Math.max(0, 2 - state.mediaPower);
  state.popularity -= drain;
  
  if (drain < 2) {
    log(`ℹ️ Vďaka médiám dnes klesla popularita len o ${drain}%.`, "\x1b[36m");
  }

  // Eventy
  kalousekAttack();
  butterflyEffect();
  
  saveState(state);
  if (state.popularity <= 0) {
    log("\n💀 GAME OVER! Ľudia ťa vyhnali vidlami. Koniec impéria.", "\x1b[31m");
    process.exit(0);
  }
  if (state.popularity >= 100) {
    log("\n🏆 VÍŤAZSTVO! SI PREZIDENTOM ZEMEGULE! 🏆", "\x1b[32m\x1b[1m");
    log("NIKDY NEODSTÚPIM! NIKDY! NECH SI TO ZAPAMÄTAJÚ!", "\x1b[33m\x1b[1m");
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
  log("4) Spať (Ďalší deadline / deň)");
  log("5) Makaj 18 HODÍN (Zadarmo koblihy, ale nasereš ľudí)");
  log("6) GRINDEROV STREAM (Hype za prachy)");
  log("7) KÚPIŤ MÉDIÁ (Zníži denný úbytok popularity - 2M CZK)");
  log("8) ČAU LIDI VIDEO (Babiš kamera, +pop -300k CZK)");
  log("X) Koniec");

  rl.question("\nTvoja voľba: ", (choice) => {
    switch(choice.toLowerCase()) {
      case '1': campaign(); break;
      case '2': lobbyBrussels(); break;
      case '3': bake(); break;
      case '4': nextDay(); return; // nextDay calls loop
      case '5': workHard(); break;
      case '6': grinderStream(); break;
      case '7': buyMedia(); break;
      case '8': cauLidiVideo(); break;
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
