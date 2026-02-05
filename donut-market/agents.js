class Agent {
  constructor(name, budget, strategy) {
    this.name = name;
    this.budget = budget;
    this.inventory = { donuts: 0, flour: 0, rapeseed: 0 };
    this.strategy = strategy;
    this.log = [];
  }

  say(msg) {
    console.log(`[${this.name}] ${msg}`);
    this.log.push(msg);
  }
}

class BabisBot extends Agent {
  act(market) {
    const prices = market.getPrices();
    // Babis strategy: Buy all rapeseed, bake donuts if cheap
    if (prices.rapeseed < 15 && this.budget > 10000) {
      const amount = Math.floor(this.budget / 2 / prices.rapeseed);
      this.budget -= amount * prices.rapeseed;
      this.inventory.rapeseed += amount;
      this.say(`Kúpil som ${amount} repky! To sú naše motýle!`);
    }
  }
}

class SpeculatorBot extends Agent {
  act(market) {
    const prices = market.getPrices();
    // Speculator: Buy low, sell high
    if (prices.donut < 20 && this.budget > 5000) {
      const amount = Math.floor(this.budget / prices.donut);
      this.budget -= amount * prices.donut;
      this.inventory.donuts += amount;
      this.say(`Nakúpil som ${amount} koblih. Počkám na kampaň.`);
    } else if (prices.donut > 35 && this.inventory.donuts > 0) {
      const gain = this.inventory.donuts * prices.donut;
      this.budget += gain;
      this.say(`Predal som ${this.inventory.donuts} koblih za ${gain} CZK! Profit!!!`);
      this.inventory.donuts = 0;
    }
  }
}

module.exports = { BabisBot, SpeculatorBot };
