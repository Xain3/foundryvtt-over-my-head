/**
 * @file MockRoll.js
 * @description Mock Roll class for dice rolling
 * @path tests/mocks/MockRoll.js
 */

/**
 * Mock Roll class for dice rolling
 */
class MockRoll {
  constructor(formula, data = {}) {
    this.formula = formula;
    this.data = data;
    this.total = this._calculateTotal(formula);
    this.dice = [];
    this.terms = [];
  }

  _calculateTotal(formula) {
    // Simple formula parser for basic dice notation
    const diceRegex = /(\d+)d(\d+)/g;
    let total = 0;
    let remainingFormula = formula;

    // Handle dice rolls (e.g., 2d6)
    let match;
    while ((match = diceRegex.exec(formula)) !== null) {
      const numDice = parseInt(match[1]);
      const dieSize = parseInt(match[2]);
      
      for (let i = 0; i < numDice; i++) {
        total += Math.floor(Math.random() * dieSize) + 1;
      }
      
      remainingFormula = remainingFormula.replace(match[0], '');
    }

    // Handle modifiers (e.g., +4, -2)
    const modifierRegex = /([+-]\d+)/g;
    while ((match = modifierRegex.exec(remainingFormula)) !== null) {
      total += parseInt(match[1]);
    }

    return Math.max(total, 1); // Ensure minimum of 1
  }

  async evaluate() {
    return this;
  }

  async render() {
    return `<div class="dice-roll">${this.formula} = ${this.total}</div>`;
  }

  static create(formula, data = {}) {
    return new MockRoll(formula, data);
  }
}

export default MockRoll;
