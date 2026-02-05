const DonutMarket = require('./market');
const { BabisBot, SpeculatorBot } = require('./agents');

const market = new DonutMarket();
const agents = [
  new BabisBot("Andrej", 1000000),
  new SpeculatorBot("Laco Spekulant", 500000)
];

const promises = [
  { text: "Zlacníme repku o 50%!", effect: { item: 'rapeseed', multiplier: 0.5 } },
  { text: "Kobliha pre každé dieťa zadarmo!", effect: { item: 'donut', multiplier: 2.0 } }, // Demand up, price up
  { text: "Vojna proti múke!", effect: { item: 'flour', multiplier: 1.5 } }
];

function runTurn(turn) {
  console.log(`\n--- KOLO ${turn} ---`);
  
  // 1. Market update
  market.updatePrices();
  console.log("AKTUÁLNE CENY:", market.getPrices());

  // 2. Random promise event
  if (Math.random() < 0.3) {
    const promise = promises[Math.floor(Math.random() * promises.length)];
    console.log(`\x1b[35m\x1b[1mVOLEBNÝ SĽUB: "${promise.text}"\x1b[0m`);
    market.applyEvent(promise.effect);
  }

  // 3. Agent actions
  agents.forEach(agent => agent.act(market));

  // 4. Status summary
  console.log("STAV PENĚŽENEK:");
  agents.forEach(a => console.log(` - ${a.name}: ${a.budget.toLocaleString()} CZK, Inventory: ${JSON.stringify(a.inventory)}`));
}

// Run 10 turns for simulation
for (let i = 1; i <= 10; i++) {
  runTurn(i);
}

console.log("\nSimulácia ukončená. Grinder by bol hrdý. 🚜🍩");
