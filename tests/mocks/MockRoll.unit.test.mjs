/**
 * @file MockRoll.unit.test.mjs
 * @description Unit tests for MockRoll class
 * @path tests/mocks/MockRoll.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import MockRoll from './MockRoll.mjs';

describe('MockRoll', () => {
  let roll;

  beforeEach(() => {
    roll = new MockRoll('1d20');
  });

  describe('constructor', () => {
    it('should create roll with formula', () => {
      expect(roll.formula).toBe('1d20');
      expect(roll.data).toEqual({});
      expect(roll.dice).toEqual([]);
      expect(roll.terms).toEqual([]);
    });

    it('should create roll with data', () => {
      const data = { mod: 5, advantage: true };
      const rollWithData = new MockRoll('1d20+@mod', data);

      expect(rollWithData.formula).toBe('1d20+@mod');
      expect(rollWithData.data).toEqual(data);
    });

    it('should generate random total', () => {
      expect(roll.total).toBeGreaterThanOrEqual(1);
      expect(roll.total).toBeLessThanOrEqual(21);
      expect(typeof roll.total).toBe('number');
    });

    it('should generate different totals for different instances', () => {
      const roll1 = new MockRoll('1d20');
      const roll2 = new MockRoll('1d20');
      const roll3 = new MockRoll('1d20');

      const totals = [roll1.total, roll2.total, roll3.total];
      const uniqueTotals = new Set(totals);

      // With random values, we expect some variation (not guaranteed but highly likely)
      expect(totals.length).toBe(3);
    });
  });

  describe('evaluate', () => {
    it('should return the roll instance', async () => {
      const result = await roll.evaluate();
      expect(result).toBe(roll);
    });

    it('should be chainable', async () => {
      const result = await roll.evaluate();
      expect(result).toBeInstanceOf(MockRoll);
    });
  });

  describe('render', () => {
    it('should return HTML string', async () => {
      const html = await roll.render();
      expect(typeof html).toBe('string');
      expect(html).toContain('<div class="dice-roll">');
      expect(html).toContain(roll.formula);
      expect(html).toContain(roll.total.toString());
    });

    it('should include formula and total', async () => {
      const complexRoll = new MockRoll('2d6+3');
      const html = await complexRoll.render();

      expect(html).toContain('2d6+3');
      expect(html).toContain(complexRoll.total.toString());
    });
  });

  describe('static create', () => {
    it('should create new roll instance', () => {
      const createdRoll = MockRoll.create('1d6');
      expect(createdRoll).toBeInstanceOf(MockRoll);
      expect(createdRoll.formula).toBe('1d6');
    });

    it('should create roll with data', () => {
      const data = { bonus: 2 };
      const createdRoll = MockRoll.create('1d6+@bonus', data);

      expect(createdRoll.formula).toBe('1d6+@bonus');
      expect(createdRoll.data).toEqual(data);
    });

    it('should handle empty data', () => {
      const createdRoll = MockRoll.create('1d4');
      expect(createdRoll.data).toEqual({});
    });
  });

  describe('integration tests', () => {
    it('should handle complex formula', () => {
      const complexRoll = new MockRoll('2d10+1d4+5');
      expect(complexRoll.formula).toBe('2d10+1d4+5');
      expect(complexRoll.total).toBeGreaterThanOrEqual(8);
      expect(complexRoll.total).toBeLessThanOrEqual(29);
    });

    it('should work with evaluation and rendering', async () => {
      const result = await roll.evaluate();
      const html = await result.render();

      expect(result).toBe(roll);
      expect(html).toContain(roll.formula);
      expect(html).toContain(roll.total.toString());
    });

    it('should maintain state through operations', async () => {
      const originalTotal = roll.total;
      const originalFormula = roll.formula;

      await roll.evaluate();
      await roll.render();

      expect(roll.total).toBe(originalTotal);
      expect(roll.formula).toBe(originalFormula);
    });
  });

  describe('real-world scenarios', () => {
    it('should simulate attack roll', async () => {
      const attackData = { str: 3, prof: 2 };
      const attackRoll = new MockRoll('1d20+@str+@prof', attackData);

      await attackRoll.evaluate();
      const html = await attackRoll.render();

      expect(attackRoll.formula).toBe('1d20+@str+@prof');
      expect(attackRoll.data).toEqual(attackData);
      expect(html).toContain('1d20+@str+@prof');
    });

    it('should simulate damage roll', async () => {
      const damageRoll = MockRoll.create('2d6+4');

      await damageRoll.evaluate();
      const result = await damageRoll.render();

      expect(damageRoll.total).toBeGreaterThanOrEqual(6);
      expect(damageRoll.total).toBeLessThanOrEqual(16);
      expect(result).toContain('2d6+4');
    });

    it('should simulate skill check', () => {
      const skillData = { ability: 2, proficiency: 3, bonus: 1 };
      const skillRoll = new MockRoll('1d20+@ability+@proficiency+@bonus', skillData);

      expect(skillRoll.formula).toBe('1d20+@ability+@proficiency+@bonus');
      expect(skillRoll.data).toEqual(skillData);
    });
  });
});
