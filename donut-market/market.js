const fs = require('fs');

class DonutMarket {
  constructor() {
    this.prices = {
      donut: 25,     // CZK per piece
      flour: 10,     // CZK per unit
      sugar: 15,     // CZK per unit
      rapeseed: 12   // CZK per unit (repka)
    };
    this.volatility = 0.2; // 20% max change per turn
    this.history = [];
  }

  updatePrices() {
    for (let item in this.prices) {
      const change = (Math.random() * 2 - 1) * this.volatility;
      this.prices[item] = Math.max(1, Math.round(this.prices[item] * (1 + change)));
    }
    this.history.push({ ...this.prices, timestamp: new Date().toISOString() });
  }

  getPrices() {
    return this.prices;
  }

  applyEvent(impact) {
    // impact: { item: string, multiplier: number }
    if (this.prices[impact.item]) {
      this.prices[impact.item] = Math.round(this.prices[impact.item] * impact.multiplier);
    }
  }
}

module.exports = DonutMarket;
