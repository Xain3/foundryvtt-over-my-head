/**
 * @file contextContainer.unit.test.js
 * @description This file contains tests for the ContextContainer class.
 * @path src/context/helpers/contextContainer.unit.test.js
 */

import { ContextContainer } from './contextContainer.js';
import { ContextItem } from './contextItem.js';

// Mock ContextValueWrapper to avoid circular dependency issues
jest.mock('./contextValueWrapper.js', () => ({
  ContextValueWrapper: {
    createItem: jest.fn((value, key, metadata) => {
      const { ContextItem } = jest.requireActual('./contextItem.js');
      return new ContextItem(value, { key, ...metadata });
    }),
    createContainer: jest.fn((items, metadata) => {
      const { ContextContainer } = jest.requireActual('./contextContainer.js');
      return new ContextContainer(items, metadata);
    })
  }
}));

describe('ContextContainer', () => {
  let container;
  let metadata;

  beforeEach(() => {
    metadata = { type: 'container', source: 'test' };
    container = new ContextContainer({}, metadata);
  });

  describe('constructor', () => {
    it('should create an empty container with default options', () => {
      const emptyContainer = new ContextContainer();
      expect(emptyContainer.size).toBe(0);
      expect(emptyContainer.metadata).toEqual({});
    });

    it('should create a container with metadata', () => {
      expect(container.metadata).toEqual(metadata);
    });

    it('should populate container from object', () => {
      const initialItems = { name: 'test', age: 25 };
      const populatedContainer = new ContextContainer(initialItems);

      expect(populatedContainer.size).toBe(2);
      expect(populatedContainer.getValue('name')).toBe('test');
      expect(populatedContainer.getValue('age')).toBe(25);
    });

    it('should create default item for non-object value', () => {
      const singleValueContainer = new ContextContainer('test value');

      expect(singleValueContainer.size).toBe(1);
      expect(singleValueContainer.getValue('default')).toBe('test value');
    });

    it('should set default item options', () => {
      const customContainer = new ContextContainer({}, {}, {
        defaultItemWrapPrimitives: false,
        defaultItemWrapAs: "ContextContainer",
        defaultItemRecordAccess: false,
        defaultItemRecordAccessForMetadata: true
      });

      const item = customContainer.setItem('test', 'value').getWrappedItem('test');
      expect(item.recordAccess).toBe(false);
      expect(item.recordAccessForMetadata).toBe(true);
    });
  });

  describe('setItem', () => {
    it('should set an item with a string key', () => {
      container.setItem('testKey', 'testValue');
      expect(container.getValue('testKey')).toBe('testValue');
    });

    it('should return the container for chaining', () => {
      const result = container.setItem('key', 'value');
      expect(result).toBe(container);
    });

    it('should throw error for non-string key', () => {
      expect(() => container.setItem(123, 'value')).toThrow(TypeError);
      expect(() => container.setItem(null, 'value')).toThrow(TypeError);
      expect(() => container.setItem(undefined, 'value')).toThrow(TypeError);
    });

    it('should throw error for empty string key', () => {
      expect(() => container.setItem('', 'value')).toThrow(TypeError);
    });

    it('should throw error for reserved keys', () => {
      expect(() => container.setItem('value', 'test')).toThrow(TypeError);
      expect(() => container.setItem('metadata', 'test')).toThrow(TypeError);
      expect(() => container.setItem('size', 'test')).toThrow(TypeError);
    });

    it('should update modification timestamps', () => {
      const originalModified = container.modifiedAt;

      setTimeout(() => {
        container.setItem('test', 'value');
        expect(container.modifiedAt.getTime()).toBeGreaterThan(originalModified.getTime());
      }, 10);
    });

    it('should override item-specific options', () => {
      container.setItem('test', 'value', {
        recordAccess: false,
        metadata: { custom: 'data' }
      });

      const item = container.getWrappedItem('test');
      expect(item.recordAccess).toBe(false);
      expect(item.metadata.custom).toBe('data');
    });
  });

  describe('getItem', () => {
    beforeEach(() => {
      container.setItem('test', 'value');
    });

    it('should return the managed item', () => {
      const item = container.getWrappedItem('test');
      expect(item).toBeInstanceOf(ContextItem);
      expect(item.value).toBe('value');
    });

    it('should return undefined for non-existent key', () => {
      expect(container.getItem('nonexistent')).toBeUndefined();
    });

    it('should update container access timestamp when recordAccess is true', () => {
      const originalLastAccessed = container.lastAccessedAt;

      setTimeout(() => {
        container.getItem('test');
        expect(container.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
      }, 10);
    });

    it('should not update access timestamp when recordAccess is false', () => {
      const noAccessContainer = new ContextContainer({}, {}, { recordAccess: false });
      noAccessContainer.setItem('test', 'value');
      const originalLastAccessed = noAccessContainer.lastAccessedAt;

      setTimeout(() => {
        noAccessContainer.getItem('test');
        expect(noAccessContainer.lastAccessedAt).toBe(originalLastAccessed);
      }, 10);
    });
  });

  describe('getValue', () => {
    beforeEach(() => {
      container.setItem('test', 'value');
    });

    it('should return the unwrapped value', () => {
      expect(container.getValue('test')).toBe('value');
    });

    it('should return undefined for non-existent key', () => {
      expect(container.getValue('nonexistent')).toBeUndefined();
    });

    it('should update both container and item access timestamps', () => {
      const originalContainerAccess = container.lastAccessedAt;
      const item = container.getWrappedItem('test');
      const originalItemAccess = item.lastAccessedAt;

      setTimeout(() => {
        container.getValue('test');
        expect(container.lastAccessedAt.getTime()).toBeGreaterThan(originalContainerAccess.getTime());
        expect(item.lastAccessedAt.getTime()).toBeGreaterThan(originalItemAccess.getTime());
      }, 10);
    });
  });

  describe('removeItem', () => {
    beforeEach(() => {
      container.setItem('test', 'value');
    });

    it('should remove an existing item', () => {
      const result = container.removeItem('test');
      expect(result).toBe(true);
      expect(container.hasItem('test')).toBe(false);
    });

    it('should return false for non-existent item', () => {
      const result = container.removeItem('nonexistent');
      expect(result).toBe(false);
    });

    it('should update modification timestamps when item is removed', () => {
      const originalModified = container.modifiedAt;

      setTimeout(() => {
        container.removeItem('test');
        expect(container.modifiedAt.getTime()).toBeGreaterThan(originalModified.getTime());
      }, 10);
    });

    it('should not update timestamps when no item is removed', () => {
      const originalModified = container.modifiedAt;

      setTimeout(() => {
        container.removeItem('nonexistent');
        expect(container.modifiedAt).toBe(originalModified);
      }, 10);
    });
  });

  describe('hasItem', () => {
    beforeEach(() => {
      container.setItem('test', 'value');
    });

    it('should return true for existing item', () => {
      expect(container.hasItem('test')).toBe(true);
    });

    it('should return false for non-existent item', () => {
      expect(container.hasItem('nonexistent')).toBe(false);
    });

    it('should update access timestamp when recordAccess is true', () => {
      const originalLastAccessed = container.lastAccessedAt;

      setTimeout(() => {
        container.hasItem('test');
        expect(container.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
      }, 10);
    });
  });

  describe('clearItems', () => {
    beforeEach(() => {
      container.setItem('test1', 'value1');
      container.setItem('test2', 'value2');
    });

    it('should remove all items', () => {
      container.clearItems();
      expect(container.size).toBe(0);
      expect(container.hasItem('test1')).toBe(false);
      expect(container.hasItem('test2')).toBe(false);
    });

    it('should update modification timestamps when items exist', () => {
      const originalModified = container.modifiedAt;

      setTimeout(() => {
        container.clearItems();
        expect(container.modifiedAt.getTime()).toBeGreaterThan(originalModified.getTime());
      }, 10);
    });

    it('should not update timestamps when container is already empty', () => {
      const emptyContainer = new ContextContainer();
      const originalModified = emptyContainer.modifiedAt;

      setTimeout(() => {
        emptyContainer.clearItems();
        expect(emptyContainer.modifiedAt).toBe(originalModified);
      }, 10);
    });
  });

  describe('size getter', () => {
    it('should return 0 for empty container', () => {
      expect(container.size).toBe(0);
    });

    it('should return correct size with items', () => {
      container.setItem('test1', 'value1');
      container.setItem('test2', 'value2');
      expect(container.size).toBe(2);
    });

    it('should update access timestamp when recordAccess is true', () => {
      const originalLastAccessed = container.lastAccessedAt;

      setTimeout(() => {
        container.size;
        expect(container.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
      }, 10);
    });
  });

  describe('iterators', () => {
    beforeEach(() => {
      container.setItem('key1', 'value1');
      container.setItem('key2', 'value2');
    });

    describe('keys', () => {
      it('should return iterator of keys', () => {
        const keys = Array.from(container.keys());
        expect(keys).toEqual(['key1', 'key2']);
      });

      it('should update access timestamp', () => {
        const originalLastAccessed = container.lastAccessedAt;

        setTimeout(() => {
          container.keys();
          expect(container.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
        }, 10);
      });
    });

    describe('items', () => {
      it('should return iterator of managed items', () => {
        const items = Array.from(container.items());
        expect(items).toHaveLength(2);
        expect(items[0]).toBeInstanceOf(ContextItem);
        expect(items[1]).toBeInstanceOf(ContextItem);
      });

      it('should update access timestamp', () => {
        const originalLastAccessed = container.lastAccessedAt;

        setTimeout(() => {
          container.items();
          expect(container.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
        }, 10);
      });
    });

    describe('entries', () => {
      it('should return iterator of [key, item] pairs', () => {
        const entries = Array.from(container.entries());
        expect(entries).toHaveLength(2);
        expect(entries[0][0]).toBe('key1');
        expect(entries[0][1]).toBeInstanceOf(ContextItem);
        expect(entries[1][0]).toBe('key2');
        expect(entries[1][1]).toBeInstanceOf(ContextItem);
      });

      it('should update access timestamp', () => {
        const originalLastAccessed = container.lastAccessedAt;

        setTimeout(() => {
          container.entries();
          expect(container.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
        }, 10);
      });
    });
  });

  describe('value getter', () => {
    beforeEach(() => {
      container.setItem('name', 'John');
      container.setItem('age', 30);
    });

    it('should return plain object with unwrapped values', () => {
      const value = container.value;
      expect(value).toEqual({ name: 'John', age: 30 });
    });

    it('should update container access timestamp', () => {
      const originalLastAccessed = container.lastAccessedAt;

      setTimeout(() => {
        container.value;
        expect(container.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
      }, 10);
    });

    it('should update item access timestamps', () => {
      const nameItem = container.getItem('name');
      const ageItem = container.getItem('age');
      const originalNameAccess = nameItem.lastAccessedAt;
      const originalAgeAccess = ageItem.lastAccessedAt;

      setTimeout(() => {
        container.value;
        expect(nameItem.lastAccessedAt.getTime()).toBeGreaterThan(originalNameAccess.getTime());
        expect(ageItem.lastAccessedAt.getTime()).toBeGreaterThan(originalAgeAccess.getTime());
      }, 10);
    });
  });

  describe('value setter', () => {
    beforeEach(() => {
      container.setItem('old1', 'value1');
      container.setItem('old2', 'value2');
    });

    it('should replace all items with new object properties', () => {
      container.value = { new1: 'newValue1', new2: 'newValue2' };

      expect(container.size).toBe(2);
      expect(container.getValue('new1')).toBe('newValue1');
      expect(container.getValue('new2')).toBe('newValue2');
      expect(container.hasItem('old1')).toBe(false);
      expect(container.hasItem('old2')).toBe(false);
    });

    it('should handle empty object', () => {
      container.value = {};
      expect(container.size).toBe(0);
    });

    it('should throw error for non-object values', () => {
      expect(() => container.value = 'string').toThrow(TypeError);
      expect(() => container.value = 123).toThrow(TypeError);
      expect(() => container.value = null).toThrow(TypeError);
    });

    it('should update modification timestamps', () => {
      const originalModified = container.modifiedAt;

      setTimeout(() => {
        container.value = { new: 'value' };
        expect(container.modifiedAt.getTime()).toBeGreaterThan(originalModified.getTime());
      }, 10);
    });
  });

  describe('reinitialize', () => {
    beforeEach(() => {
      container.setItem('test', 'value');
      container.setMetadata({ old: 'metadata' });
    });

    it('should clear items and reset metadata', () => {
      container.reinitialize({}, { new: 'metadata' });

      expect(container.size).toBe(0);
      expect(container.metadata).toEqual({ new: 'metadata' });
    });

    it('should repopulate with new items from object', () => {
      container.reinitialize({ name: 'John', age: 30 });

      expect(container.size).toBe(2);
      expect(container.getValue('name')).toBe('John');
      expect(container.getValue('age')).toBe(30);
    });

    it('should create default item for non-object value', () => {
      container.reinitialize('single value');

      expect(container.size).toBe(1);
      expect(container.getValue('default')).toBe('single value');
    });

    it('should update container options', () => {
      container.reinitialize({}, {}, {
        recordAccess: false,
        defaultItemRecordAccess: false
      });

      expect(container.recordAccess).toBe(false);

      const item = container.setItem('test', 'value').getWrappedItem('test');
      expect(item.recordAccess).toBe(false);
    });

    it('should reset timestamps', () => {
      const originalCreated = container.createdAt;
      const originalModified = container.modifiedAt;

      setTimeout(() => {
        container.reinitialize();
        expect(container.createdAt.getTime()).toBeGreaterThan(originalCreated.getTime());
        expect(container.modifiedAt.getTime()).toBeGreaterThan(originalModified.getTime());
      }, 10);
    });
  });

  describe('inheritance from ContextItem', () => {
    it('should have ContextItem properties', () => {
      expect(container.createdAt).toBeInstanceOf(Date);
      expect(container.modifiedAt).toBeInstanceOf(Date);
      expect(container.lastAccessedAt).toBeInstanceOf(Date);
    });

    it('should support metadata operations', () => {
      container.setMetadata({ test: 'data' });
      expect(container.metadata.test).toBe('data');
    });

    it('should support access recording options', () => {
      container.changeAccessRecord({ recordAccess: false });
      expect(container.recordAccess).toBe(false);
    });
  });

  describe('nested containers', () => {
    beforeEach(() => {
      // Reset the mock to use actual ContextContainer for nested containers
      jest.clearAllMocks();
      ContextValueWrapper.wrap.mockImplementation((value, options) => {
        const { ContextContainer } = jest.requireActual('./contextContainer.js');

        if (options?.wrapAs === 'ContextContainer' && value instanceof ContextContainer) {
          return value;
        }

        const { ContextItem } = jest.requireActual('./contextItem.js');
        return new ContextItem(value, options?.metadata || {}, {
          recordAccess: options?.recordAccess ?? true,
          recordAccessForMetadata: options?.recordAccessForMetadata ?? false
        });
      });
    });

    it('should handle ContextContainer as item value', () => {
      const nestedContainer = new ContextContainer({ nested: 'value' });
      container.setItem('container', nestedContainer, { wrapAs: 'ContextContainer' });

      const retrieved = container.getWrappedItem('container');
      expect(retrieved).toBeInstanceOf(ContextContainer);
      expect(retrieved.getValue('nested')).toBe('value');
    });
  });

  describe('Protected Methods', () => {
    describe('_isPlainObject', () => {
      it('should return true for plain objects', () => {
        expect(container._isPlainObject({})).toBe(true);
        expect(container._isPlainObject({ key: 'value' })).toBe(true);
        expect(container._isPlainObject({ nested: { object: true } })).toBe(true);
      });

      it('should return false for arrays', () => {
        expect(container._isPlainObject([])).toBe(false);
        expect(container._isPlainObject([1, 2, 3])).toBe(false);
      });

      it('should return false for null', () => {
        expect(container._isPlainObject(null)).toBe(false);
      });

      it('should return false for primitive values', () => {
        expect(container._isPlainObject('string')).toBe(false);
        expect(container._isPlainObject(123)).toBe(false);
        expect(container._isPlainObject(true)).toBe(false);
        expect(container._isPlainObject(undefined)).toBe(false);
      });

      it('should return false for ContextItem instances', () => {
        const contextItem = new ContextItem('value');
        expect(container._isPlainObject(contextItem)).toBe(false);
      });

      it('should return false for ContextContainer instances', () => {
        const contextContainer = new ContextContainer();
        expect(container._isPlainObject(contextContainer)).toBe(false);
      });
    });

    describe('_isReservedKey', () => {
      it('should return true for known reserved property names', () => {
        expect(container._isReservedKey('value')).toBe(true);
        expect(container._isReservedKey('metadata')).toBe(true);
        expect(container._isReservedKey('createdAt')).toBe(true);
        expect(container._isReservedKey('modifiedAt')).toBe(true);
        expect(container._isReservedKey('lastAccessedAt')).toBe(true);
        expect(container._isReservedKey('size')).toBe(true);
      });

      it('should return true for ContextItem method names', () => {
        expect(container._isReservedKey('setValue')).toBe(true);
        expect(container._isReservedKey('setMetadata')).toBe(true);
        expect(container._isReservedKey('reinitialize')).toBe(true);
        expect(container._isReservedKey('clear')).toBe(true);
      });

      it('should return true for ContextContainer method names', () => {
        expect(container._isReservedKey('setItem')).toBe(true);
        expect(container._isReservedKey('getItem')).toBe(true);
        expect(container._isReservedKey('getValue')).toBe(true);
        expect(container._isReservedKey('removeItem')).toBe(true);
        expect(container._isReservedKey('hasItem')).toBe(true);
        expect(container._isReservedKey('clearItems')).toBe(true);
        expect(container._isReservedKey('keys')).toBe(true);
        expect(container._isReservedKey('items')).toBe(true);
        expect(container._isReservedKey('entries')).toBe(true);
      });

      it('should return false for non-reserved keys', () => {
        expect(container._isReservedKey('customKey')).toBe(false);
        expect(container._isReservedKey('user')).toBe(false);
        expect(container._isReservedKey('data')).toBe(false);
        expect(container._isReservedKey('config')).toBe(false);
      });

      it('should handle edge case keys', () => {
        expect(container._isReservedKey('constructor')).toBe(true);
        expect(container._isReservedKey('prototype')).toBe(false); // Not in our reserved set
        expect(container._isReservedKey('__proto__')).toBe(false);
      });
    });

    describe('_extractKeyComponents', () => {
      it('should extract first key and remaining path for dot notation', () => {
        const result = container._extractKeyComponents('player.stats.level');
        expect(result).toEqual({
          firstKey: 'player',
          remainingPath: 'stats.level'
        });
      });

      it('should handle single level paths', () => {
        const result = container._extractKeyComponents('player.name');
        expect(result).toEqual({
          firstKey: 'player',
          remainingPath: 'name'
        });
      });

      it('should handle deeply nested paths', () => {
        const result = container._extractKeyComponents('a.b.c.d.e.f');
        expect(result).toEqual({
          firstKey: 'a',
          remainingPath: 'b.c.d.e.f'
        });
      });

      it('should throw error if first key is reserved', () => {
        expect(() => container._extractKeyComponents('value.nested')).toThrow(TypeError);
        expect(() => container._extractKeyComponents('metadata.type')).toThrow(TypeError);
        expect(() => container._extractKeyComponents('size.length')).toThrow(TypeError);
      });

      it('should handle empty path components', () => {
        const result = container._extractKeyComponents('player.');
        expect(result).toEqual({
          firstKey: 'player',
          remainingPath: ''
        });
      });
    });

    describe('_createNestedContainer', () => {
      beforeEach(() => {
        // Reset mock to handle ContextContainer creation
        jest.clearAllMocks();
        ContextValueWrapper.wrap.mockImplementation((value, options) => {
          if (options?.wrapAs === 'ContextContainer') {
            return new ContextContainer(value, options?.metadata || {}, {
              recordAccess: options?.recordAccess ?? true,
              recordAccessForMetadata: options?.recordAccessForMetadata ?? false
            });
          }
          return new ContextItem(value, options?.metadata || {}, {
            recordAccess: options?.recordAccess ?? true,
            recordAccessForMetadata: options?.recordAccessForMetadata ?? false
          });
        });
      });

      it('should create new container if key does not exist', () => {
        const result = container._createNestedContainer('player');
        expect(result).toBeInstanceOf(ContextContainer);
        expect(container.hasItem('player')).toBe(true);
      });

      it('should return existing container if key already exists', () => {
        const existingContainer = new ContextContainer({ nested: 'value' });
        container.setItem('player', existingContainer, { wrapAs: 'ContextContainer' });

        const result = container._createNestedContainer('player');
        expect(result).toBe(container.getWrappedItem('player'));
        expect(result.getValue('nested')).toBe('value');
      });

      it('should throw error if existing item is not a ContextContainer', () => {
        container.setItem('player', 'string value');

        expect(() => container._createNestedContainer('player')).toThrow(TypeError);
        expect(() => container._createNestedContainer('player')).toThrow(/Cannot set nested value on non-container item/);
      });

      it('should use default item options for new containers', () => {
        const customContainer = new ContextContainer({}, {}, {
          defaultItemRecordAccess: false,
          defaultItemWrapAs: 'ContextContainer'
        });

        const result = customContainer._createNestedContainer('newContainer');
        expect(result.recordAccess).toBe(false);
      });
    });

    describe('_setNestedItem', () => {
      let nestedContainer;

      beforeEach(() => {
        // Reset mock to handle ContextContainer creation
        jest.clearAllMocks();
        ContextValueWrapper.wrap.mockImplementation((value, options) => {
          if (options?.wrapAs === 'ContextContainer') {
            return new ContextContainer(value, options?.metadata || {}, {
              recordAccess: options?.recordAccess ?? true,
              recordAccessForMetadata: options?.recordAccessForMetadata ?? false
            });
          }
          return new ContextItem(value, options?.metadata || {}, {
            recordAccess: options?.recordAccess ?? true,
            recordAccessForMetadata: options?.recordAccessForMetadata ?? false
          });
        });

        nestedContainer = new ContextContainer();
      });

      it('should set item in nested container', () => {
        const result = container._setNestedItem(nestedContainer, 'stats.level', 10, {});

        expect(result).toBe(container);
        expect(nestedContainer.getValue('stats.level')).toBe(10);
      });

      it('should update container modification timestamps', () => {
        const originalModified = container.modifiedAt;

        setTimeout(() => {
          container._setNestedItem(nestedContainer, 'test', 'value', {});
          expect(container.modifiedAt.getTime()).toBeGreaterThan(originalModified.getTime());
        }, 10);
      });

      it('should pass through item options to nested container', () => {
        const customOptions = {
          metadata: { nested: 'metadata' },
          recordAccess: false
        };

        container._setNestedItem(nestedContainer, 'test', 'value', customOptions);

        const item = nestedContainer.getWrappedItem('test');
        expect(item.metadata.nested).toBe('metadata');
        expect(item.recordAccess).toBe(false);
      });

      it('should handle deeply nested paths', () => {
        container._setNestedItem(nestedContainer, 'a.b.c.d', 'deep value', {});
        expect(nestedContainer.getValue('a.b.c.d')).toBe('deep value');
      });
    });
  });

  describe('Dot Notation Support', () => {
    beforeEach(() => {
      // Reset mock to handle ContextContainer creation properly
      jest.clearAllMocks();
      ContextValueWrapper.wrap.mockImplementation((value, options) => {
        if (options?.wrapAs === 'ContextContainer') {
          return new ContextContainer(value, options?.metadata || {}, {
            recordAccess: options?.recordAccess ?? true,
            recordAccessForMetadata: options?.recordAccessForMetadata ?? false
          });
        }
        return new ContextItem(value, options?.metadata || {}, {
          recordAccess: options?.recordAccess ?? true,
          recordAccessForMetadata: options?.recordAccessForMetadata ?? false
        });
      });
    });

    describe('setItem with dot notation', () => {
      it('should create nested containers for dot notation paths', () => {
        container.setItem('player.stats.level', 10);

        expect(container.getValue('player.stats.level')).toBe(10);
        expect(container.getWrappedItem('player')).toBeInstanceOf(ContextContainer);
        expect(container.getWrappedItem('player').getWrappedItem('stats')).toBeInstanceOf(ContextContainer);
      });

      it('should work with multiple nested levels', () => {
        container.setItem('game.player.character.stats.strength', 15);
        container.setItem('game.player.character.stats.dexterity', 12);

        expect(container.getValue('game.player.character.stats.strength')).toBe(15);
        expect(container.getValue('game.player.character.stats.dexterity')).toBe(12);
      });

      it('should throw error when trying to nest under non-container', () => {
        container.setItem('player', 'string value');

        expect(() => container.setItem('player.stats.level', 10)).toThrow(TypeError);
        expect(() => container.setItem('player.stats.level', 10)).toThrow(/Cannot set nested value on non-container item/);
      });

      it('should work with existing nested containers', () => {
        container.setItem('player.name', 'Alice');
        container.setItem('player.level', 5);

        expect(container.getValue('player.name')).toBe('Alice');
        expect(container.getValue('player.level')).toBe(5);

        const playerContainer = container.getWrappedItem('player');
        expect(playerContainer.size).toBe(2);
      });
    });

    describe('getItem with dot notation', () => {
      beforeEach(() => {
        container.setItem('player.stats.level', 10);
        container.setItem('player.name', 'Alice');
        container.setItem('config.debug', true);
      });

      it('should retrieve nested values using dot notation', () => {
        expect(container.getItem('player.stats.level')).toBe(10);
        expect(container.getItem('player.name')).toBe('Alice');
        expect(container.getItem('config.debug')).toBe(true);
      });

      it('should return undefined for non-existent nested paths', () => {
        expect(container.getItem('player.stats.nonexistent')).toBeUndefined();
        expect(container.getItem('nonexistent.path')).toBeUndefined();
        expect(container.getItem('player.nonexistent.deep')).toBeUndefined();
      });

      it('should handle access to nested object properties in ContextItems', () => {
        // Set a ContextItem with an object value
        container.setItem('data', { user: { name: 'Bob', age: 30 } });

        expect(container.getItem('data.user.name')).toBe('Bob');
        expect(container.getItem('data.user.age')).toBe(30);
        expect(container.getItem('data.user.nonexistent')).toBeUndefined();
      });

      it('should update access timestamps for containers in path', () => {
        const originalContainerAccess = container.lastAccessedAt;
        const playerContainer = container.getWrappedItem('player');
        const originalPlayerAccess = playerContainer.lastAccessedAt;

        setTimeout(() => {
          container.getItem('player.name');
          expect(container.lastAccessedAt.getTime()).toBeGreaterThan(originalContainerAccess.getTime());
          expect(playerContainer.lastAccessedAt.getTime()).toBeGreaterThan(originalPlayerAccess.getTime());
        }, 10);
      });
    });

    describe('getWrappedItem with dot notation', () => {
      beforeEach(() => {
        container.setItem('player.stats.level', 10);
        container.setItem('player.name', 'Alice');
      });

      it('should retrieve nested wrapped items using dot notation', () => {
        const levelItem = container.getWrappedItem('player.stats.level');
        expect(levelItem).toBeInstanceOf(ContextItem);
        expect(levelItem.value).toBe(10);

        const nameItem = container.getWrappedItem('player.name');
        expect(nameItem).toBeInstanceOf(ContextItem);
        expect(nameItem.value).toBe('Alice');
      });

      it('should return nested containers', () => {
        const playerContainer = container.getWrappedItem('player');
        expect(playerContainer).toBeInstanceOf(ContextContainer);

        const statsContainer = container.getWrappedItem('player.stats');
        expect(statsContainer).toBeInstanceOf(ContextContainer);
      });

      it('should return undefined for non-existent nested paths', () => {
        expect(container.getWrappedItem('player.stats.nonexistent')).toBeUndefined();
        expect(container.getWrappedItem('nonexistent.path')).toBeUndefined();
      });
    });

    describe('Complex dot notation scenarios', () => {
      it('should handle mixed container and item access patterns', () => {
        // Create a complex nested structure
        container.setItem('app.config.database.host', 'localhost');
        container.setItem('app.config.database.port', 5432);
        container.setItem('app.config.debug', true);
        container.setItem('app.users.admin', { name: 'Admin', role: 'administrator' });

        // Verify structure
        expect(container.getValue('app.config.database.host')).toBe('localhost');
        expect(container.getValue('app.config.database.port')).toBe(5432);
        expect(container.getValue('app.config.debug')).toBe(true);
        expect(container.getValue('app.users.admin.name')).toBe('Admin');
        expect(container.getValue('app.users.admin.role')).toBe('administrator');

        // Verify container structure
        expect(container.getWrappedItem('app')).toBeInstanceOf(ContextContainer);
        expect(container.getWrappedItem('app.config')).toBeInstanceOf(ContextContainer);
        expect(container.getWrappedItem('app.config.database')).toBeInstanceOf(ContextContainer);
        expect(container.getWrappedItem('app.users')).toBeInstanceOf(ContextContainer);
      });

      it('should maintain proper isolation between nested paths', () => {
        container.setItem('a.b.c', 'value1');
        container.setItem('a.b.d', 'value2');
        container.setItem('a.e.f', 'value3');

        expect(container.getValue('a.b.c')).toBe('value1');
        expect(container.getValue('a.b.d')).toBe('value2');
        expect(container.getValue('a.e.f')).toBe('value3');

        // Verify containers don't interfere with each other
        const bContainer = container.getWrappedItem('a.b');
        const eContainer = container.getWrappedItem('a.e');

        expect(bContainer.size).toBe(2);
        expect(eContainer.size).toBe(1);
      });
    });
  });
});