/**
 * @file MockActor.unit.test.js
 * @description Unit tests for MockActor class
 * @path tests/mocks/MockActor.unit.test.js
 */

import MockActor from './MockActor.js';
import MockDocument from './MockDocument.js';
import MockCollection from './MockCollection.js';

describe('MockActor', () => {
  let actor;

  beforeEach(() => {
    actor = new MockActor();
  });

  describe('constructor', () => {
    it('should extend MockDocument', () => {
      expect(actor).toBeInstanceOf(MockDocument);
      expect(actor).toBeInstanceOf(MockActor);
    });

    it('should create actor with default values', () => {
      expect(actor.type).toBe('character');
      expect(actor.system).toEqual({});
      expect(actor.items).toBeInstanceOf(MockCollection);
      expect(actor.effects).toBeInstanceOf(MockCollection);
    });

    it('should create actor with provided data', () => {
      const data = {
        id: 'actor-1',
        name: 'Test Actor',
        type: 'npc',
        system: { health: 100, level: 5 }
      };
      const customActor = new MockActor(data);

      expect(customActor.id).toBe('actor-1');
      expect(customActor.name).toBe('Test Actor');
      expect(customActor.type).toBe('npc');
      expect(customActor.system).toEqual({ health: 100, level: 5 });
    });

    it('should inherit document properties', () => {
      expect(actor.id).toMatch(/^mock-/);
      expect(actor.name).toBe('Mock Document');
      expect(actor.flags).toEqual({});
      expect(actor.permission).toBe(3);
    });
  });

  describe('itemTypes', () => {
    beforeEach(() => {
      // Add test items to the actor
      actor.items.set('item1', { id: 'item1', type: 'weapon', name: 'Sword' });
      actor.items.set('item2', { id: 'item2', type: 'armor', name: 'Shield' });
      actor.items.set('item3', { id: 'item3', type: 'weapon', name: 'Bow' });
      actor.items.set('item4', { id: 'item4', type: 'consumable', name: 'Potion' });
    });

    it('should return items of specified type', () => {
      const weapons = actor.itemTypes('weapon');
      expect(weapons).toHaveLength(2);
      expect(weapons[0].name).toBe('Sword');
      expect(weapons[1].name).toBe('Bow');
    });

    it('should return empty array for non-existent type', () => {
      const shields = actor.itemTypes('shield');
      expect(shields).toEqual([]);
    });

    it('should return single item array', () => {
      const armor = actor.itemTypes('armor');
      expect(armor).toHaveLength(1);
      expect(armor[0].name).toBe('Shield');
    });

    it('should handle empty items collection', () => {
      const emptyActor = new MockActor();
      const result = emptyActor.itemTypes('weapon');
      expect(result).toEqual([]);
    });
  });

  describe('inheritance from MockDocument', () => {
    it('should inherit flag methods', async () => {
      await actor.setFlag('test', 'key', 'value');
      expect(actor.getFlag('test', 'key')).toBe('value');
    });

    it('should inherit update method', async () => {
      const result = await actor.update({ name: 'Updated Actor' });
      expect(actor.data.name).toBe('Updated Actor');
      expect(result).toBe(actor);
    });

    it('should inherit delete method', async () => {
      const result = await actor.delete();
      expect(result).toBe(actor);
    });
  });
});
