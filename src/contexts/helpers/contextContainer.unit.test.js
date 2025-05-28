/**
 * @file contextContainer.test.js
 * @description This file contains tests for the ContextContainer class.
 * @path src/context/helpers/contextContainer.test.js
 */

import { ContextContainer } from './contextContainer.js';
import { ContextItem } from './contextItem.js';
import { ContextValueWrapper } from './contextValueWrapper.js';

// Mock ContextValueWrapper
jest.mock('./contextValueWrapper.js', () => ({
  ContextValueWrapper: {
    wrap: jest.fn((value, options) => {
      const { ContextItem } = jest.requireActual('./contextItem.js');
      // Return a real ContextItem that behaves like the wrapped value
      return new ContextItem(value, options?.metadata || {}, {
        recordAccess: options?.recordAccess ?? true,
        recordAccessForMetadata: options?.recordAccessForMetadata ?? false
      });
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

      const item = customContainer.setItem('test', 'value').getItem('test');
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

      const item = container.getItem('test');
      expect(item.recordAccess).toBe(false);
      expect(item.metadata.custom).toBe('data');
    });
  });

  describe('getItem', () => {
    beforeEach(() => {
      container.setItem('test', 'value');
    });

    it('should return the managed item', () => {
      const item = container.getItem('test');
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
      const item = container.getItem('test');
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
        const size = container.size;
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
        const value = container.value;
        expect(container.lastAccessedAt.getTime()).toBeGreaterThan(originalLastAccessed.getTime());
      }, 10);
    });

    it('should update item access timestamps', () => {
      const nameItem = container.getItem('name');
      const ageItem = container.getItem('age');
      const originalNameAccess = nameItem.lastAccessedAt;
      const originalAgeAccess = ageItem.lastAccessedAt;

      setTimeout(() => {
        const value = container.value;
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

      const item = container.setItem('test', 'value').getItem('test');
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

      const retrieved = container.getItem('container');
      expect(retrieved).toBeInstanceOf(ContextContainer);
      expect(retrieved.getValue('nested')).toBe('value');
    });
  });
});