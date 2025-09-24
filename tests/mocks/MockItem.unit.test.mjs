/**
 * @file MockItem.unit.test.mjs
 * @description Unit tests for MockItem class
 * @path tests/mocks/MockItem.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import MockItem from './MockItem.mjs';
import MockDocument from './MockDocument.mjs';

describe('MockItem', () => {
  let item;

  beforeEach(() => {
    item = new MockItem();
  });

  describe('constructor', () => {
    it('should extend MockDocument', () => {
      expect(item).toBeInstanceOf(MockDocument);
      expect(item).toBeInstanceOf(MockItem);
    });

    it('should create item with default values', () => {
      expect(item.type).toBe('equipment');
      expect(item.system).toEqual({});
    });

    it('should create item with provided data', () => {
      const data = {
        id: 'item-1',
        name: 'Magic Sword',
        type: 'weapon',
        system: { damage: '1d8', weight: 3 }
      };
      const customItem = new MockItem(data);

      expect(customItem.id).toBe('item-1');
      expect(customItem.name).toBe('Magic Sword');
      expect(customItem.type).toBe('weapon');
      expect(customItem.system).toEqual({ damage: '1d8', weight: 3 });
    });

    it('should inherit document properties', () => {
      expect(item.id).toMatch(/^mock-/);
      expect(item.name).toBe('Mock Document');
      expect(item.flags).toEqual({});
      expect(item.permission).toBe(3);
    });
  });

  describe('inheritance from MockDocument', () => {
    it('should inherit flag methods', async () => {
      await item.setFlag('test', 'enchantment', '+1');
      expect(item.getFlag('test', 'enchantment')).toBe('+1');
    });

    it('should inherit update method', async () => {
      const result = await item.update({ name: 'Updated Item' });
      expect(item.data.name).toBe('Updated Item');
      expect(result).toBe(item);
    });

    it('should inherit delete method', async () => {
      const result = await item.delete();
      expect(result).toBe(item);
    });
  });
});
