/**
 * @file MockCollection.unit.test.js
 * @description Unit tests for MockCollection class
 * @path tests/mocks/MockCollection.unit.test.js
 */

import MockCollection from './MockCollection.mjs';

describe('MockCollection', () => {
  let collection;

  beforeEach(() => {
    collection = new MockCollection();
  });

  it('should create an empty collection', () => {
    expect(collection).toBeInstanceOf(MockCollection);
    expect(collection).toBeInstanceOf(Map);
    expect(collection.size).toBe(0);
  });

  it('should initialize with entries', () => {
    const entries = [['key1', 'value1'], ['key2', 'value2']];
    const collectionWithEntries = new MockCollection(entries);

    expect(collectionWithEntries.size).toBe(2);
    expect(collectionWithEntries.get('key1')).toBe('value1');
    expect(collectionWithEntries.get('key2')).toBe('value2');
  });

  describe('find', () => {
    beforeEach(() => {
      collection.set('1', { id: '1', name: 'item1', type: 'weapon' });
      collection.set('2', { id: '2', name: 'item2', type: 'armor' });
      collection.set('3', { id: '3', name: 'item3', type: 'weapon' });
    });

    it('should find first matching item', () => {
      const result = collection.find(item => item.type === 'weapon');
      expect(result).toEqual({ id: '1', name: 'item1', type: 'weapon' });
    });

    it('should return undefined if no match found', () => {
      const result = collection.find(item => item.type === 'shield');
      expect(result).toBeUndefined();
    });

    it('should pass key as second parameter', () => {
      const predicate = jest.fn(() => false);
      collection.find(predicate);
      expect(predicate).toHaveBeenCalledWith({ id: '1', name: 'item1', type: 'weapon' }, '1');
    });
  });

  describe('filter', () => {
    beforeEach(() => {
      collection.set('1', { id: '1', name: 'item1', type: 'weapon' });
      collection.set('2', { id: '2', name: 'item2', type: 'armor' });
      collection.set('3', { id: '3', name: 'item3', type: 'weapon' });
    });

    it('should filter items by predicate', () => {
      const result = collection.filter(item => item.type === 'weapon');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: '1', name: 'item1', type: 'weapon' });
      expect(result[1]).toEqual({ id: '3', name: 'item3', type: 'weapon' });
    });

    it('should return empty array if no matches', () => {
      const result = collection.filter(item => item.type === 'shield');
      expect(result).toEqual([]);
    });

    it('should pass key as second parameter', () => {
      const predicate = jest.fn(() => true);
      collection.filter(predicate);
      expect(predicate).toHaveBeenCalledWith({ id: '1', name: 'item1', type: 'weapon' }, '1');
    });
  });

  describe('toArray', () => {
    it('should return empty array for empty collection', () => {
      expect(collection.toArray()).toEqual([]);
    });

    it('should return array of values', () => {
      collection.set('1', 'value1');
      collection.set('2', 'value2');
      const result = collection.toArray();
      expect(result).toEqual(['value1', 'value2']);
    });
  });

  describe('contents', () => {
    it('should return same as toArray', () => {
      collection.set('1', 'value1');
      collection.set('2', 'value2');
      expect(collection.contents).toEqual(collection.toArray());
    });
  });

  describe('inheritance', () => {
    it('should inherit Map methods', () => {
      collection.set('key', 'value');
      expect(collection.has('key')).toBe(true);
      expect(collection.get('key')).toBe('value');

      collection.delete('key');
      expect(collection.has('key')).toBe(false);
    });
  });
});
