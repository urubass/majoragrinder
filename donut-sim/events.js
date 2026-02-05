const events = [
  {
    name: "Inspekce z Bruselu",
    description: "Ti darmožrouti z EU nám chtějí sebrat dotace! Kampaň!",
    effect: (state) => {
      state.budget -= 5000000;
      state.popularity -= 5;
      return "Audit z EU nám neoprávněně strhl 5 mega! Účelovka!";
    }
  },
  {
    name: "Únik z Průhonic",
    description: "Někdo vynesl fotky, jak jím rohlík od konkurence! Katastrofa!",
    effect: (state) => {
      state.popularity -= 15;
      return "PR katastrofa: Babiš byl viděn s cizím rohlíkem! Popularita letí dolů!";
    }
  },
  {
    name: "Protest tradičníků",
    description: "Kalousek a jeho parta zase demonstrují na náměstí.",
    effect: (state) => {
      state.popularity -= 2;
      state.budget -= 1000000; 
      return "Tradičníci křičí na náměstí, museli jsme zaplatit billboardy, že lžou!";
    }
  },
  {
    name: "Stávka v Penamu",
    description: "Pekaři chtějí víc peněz. Jako by jich neměli dost!",
    effect: (state) => {
      state.inventory -= 5000;
      state.popularity -= 3;
      return "V Penamu se nepeče! Máme o 5000 koblih míň! To je spiknutí!";
    }
  },
  {
    name: "Motýle invaze",
    description: "Na naše pole se slétli tisíce motýlů! Lidi pláčou štěstím!",
    effect: (state) => {
      state.popularity += 20;
      state.budget -= 500000; 
      return "Zázrak přírody! Motýle jsou všude, lidé nás milují! +20 popularity!";
    }
  },
  {
    name: "Vrtulník nad Průhonicemi",
    description: "Novináři zase šmírují z výšky! To je zásah do soukromí!",
    effect: (state) => {
      state.popularity -= 5;
      state.budget -= 2000000; 
      return "Média nás šmírují z vrtulníku! Platíme právníky, aby ty lháře zastavili! Kampaň!";
    }
  },
  {
    name: "Rekordní žatva řepky",
    description: "Naše pole vydala to nejlepší, co mohla! Prosperita!",
    effect: (state) => {
      state.budget += 10000000;
      state.inventory += 20000;
      return "Žatva století! Máme 10 mega navíc a plné sklady té nejlepší řepky! Bude líp!";
    }
  }
];

function rollEvent(state) {
  if (Math.random() > 0.3) return null; 
  const event = events[Math.floor(Math.random() * events.length)];
  return event.effect(state);
}

module.exports = { rollEvent };
