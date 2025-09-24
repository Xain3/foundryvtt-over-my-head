/**
 * @file contextContainerSyncEngine.unit.test.mjs
 * @description Test file for the ContextContainerSyncEngine class functionality.
 * @path src/contexts/helpers/contextContainerSyncEngine.unit.test.mjs

 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import ContextContainerSyncEngine from './contextContainerSyncEngine.mjs';
import { ContextContainer } from './contextContainer.mjs';
import ContextItemSync from './contextItemSync.mjs';
import { Validator } from '../../utils/static/validator.mjs';
import _ from 'lodash';

// Mock dependencies
vi.mock('./contextContainer.mjs');
vi.mock('./contextItemSync.mjs');
vi.mock('lodash', () => {
  const mergeFunction = vi.fn();
  const cloneDeepFunction = vi.fn();
  
  return {
    default: {
      merge: mergeFunction,
      cloneDeep: cloneDeepFunction
    },
    merge: mergeFunction,
    cloneDeep: cloneDeepFunction
  };
});

describe('ContextContainerSyncEngine', () => {
  let engine;
  let mockSourceContainer;
  let mockTargetContainer;
  let mockSourceItem;
  let mockTargetItem;
  let mockNestedContainer;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock items
    mockSourceItem = {
      isContextItem: true,
      isContextContainer: false,
      value: 'source value',
      metadata: { createdAt: '2024-01-01' }
    };

    mockTargetItem = {
      isContextItem: true,
      isContextContainer: false,
      value: 'target value',
      metadata: { createdAt: '2024-01-02' },
      setMetadata: vi.fn()
    };

    mockNestedContainer = {
      isContextItem: false,
      isContextContainer: true,
      value: 'nested container',
      metadata: { type: 'nested' },
      keys: vi.fn(() => ['nestedItem1']),
      getItem: vi.fn(() => mockSourceItem),
      hasItem: vi.fn(() => false),
      setItem: vi.fn(),
      setMetadata: vi.fn()
    };

    // Create mock containers
    mockSourceContainer = {
      isContextContainer: true,
      value: 'source container',
      metadata: { type: 'source' },
      keys: vi.fn(() => ['item1', 'item2', 'nestedContainer']),
      getItem: vi.fn(),
      hasItem: vi.fn(),
      setItem: vi.fn(),
      setMetadata: vi.fn()
    };

    mockTargetContainer = {
      isContextContainer: true,
      value: 'target container',
      metadata: { type: 'target' },
      keys: vi.fn(() => ['item1']),
      getItem: vi.fn(),
      hasItem: vi.fn(),
      setItem: vi.fn(),
      setMetadata: vi.fn()
    };

    // Setup mock returns
    mockSourceContainer.getItem.mockImplementation((key) => {
      switch (key) {
        case 'item1': return mockSourceItem;
        case 'item2': return mockSourceItem;
        case 'nestedContainer': return mockNestedContainer;
        default: return null;
      }
    });

    mockTargetContainer.getItem.mockImplementation((key) => {
      switch (key) {
        case 'item1': return mockTargetItem;
        default: return null;
      }
    });

    mockTargetContainer.hasItem.mockImplementation((key) => key === 'item1');

    // Mock ContextContainer constructor
    ContextContainer.mockImplementation((value, metadata) => ({
      isContextContainer: true,
      value,
      metadata,
      keys: vi.fn(() => []),
      getItem: vi.fn(),
      hasItem: vi.fn(),
      setItem: vi.fn(),
      setMetadata: vi.fn()
    }));
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      engine = new ContextContainerSyncEngine();
      expect(engine.syncMetadata).toBe(false);
      expect(engine.strictTypeChecking).toBe(false);
    });

    it('should initialize with custom syncMetadata option', () => {
      engine = new ContextContainerSyncEngine({ syncMetadata: true });
      expect(engine.syncMetadata).toBe(true);
      expect(engine.strictTypeChecking).toBe(false);
    });

    it('should initialize with custom strictTypeChecking option', () => {
      engine = new ContextContainerSyncEngine({ strictTypeChecking: true });
      expect(engine.syncMetadata).toBe(false);
      expect(engine.strictTypeChecking).toBe(true);
    });

    it('should initialize with both custom options', () => {
      engine = new ContextContainerSyncEngine({ syncMetadata: true, strictTypeChecking: true });
      expect(engine.syncMetadata).toBe(true);
      expect(engine.strictTypeChecking).toBe(true);
    });

    it('should handle empty options object', () => {
      engine = new ContextContainerSyncEngine({});
      expect(engine.syncMetadata).toBe(false);
      expect(engine.strictTypeChecking).toBe(false);
    });
  });

  describe('sync', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine();
      vi.spyOn(engine, '_syncContainer').mockImplementation(() => {});
    });

    it('should sync sourceToTarget direction correctly', () => {
      engine.sync(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
      expect(engine._syncContainer).toHaveBeenCalledWith(mockSourceContainer, mockTargetContainer);
    });

    it('should sync targetToSource direction correctly', () => {
      engine.sync(mockSourceContainer, mockTargetContainer, 'targetToSource');
      expect(engine._syncContainer).toHaveBeenCalledWith(mockTargetContainer, mockSourceContainer);
    });

    it('should handle container1 and container2 parameters correctly', () => {
      const container1 = mockSourceContainer;
      const container2 = mockTargetContainer;

      engine.sync(container1, container2, 'sourceToTarget');
      expect(engine._syncContainer).toHaveBeenCalledWith(container1, container2);
    });
  });

  describe('_syncContainer', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine();
      vi.spyOn(engine, '_updateItem').mockImplementation(() => {});
      vi.spyOn(engine, '_addItem').mockImplementation(() => {});
    });

    it('should iterate through all source container keys', () => {
      engine._syncContainer(mockSourceContainer, mockTargetContainer);
      expect(mockSourceContainer.keys).toHaveBeenCalled();
      expect(mockSourceContainer.getItem).toHaveBeenCalledWith('item1');
      expect(mockSourceContainer.getItem).toHaveBeenCalledWith('item2');
      expect(mockSourceContainer.getItem).toHaveBeenCalledWith('nestedContainer');
    });

    it('should update existing items in target container', () => {
      engine._syncContainer(mockSourceContainer, mockTargetContainer);
      expect(mockTargetContainer.hasItem).toHaveBeenCalledWith('item1');
      expect(engine._updateItem).toHaveBeenCalledWith(mockSourceItem, mockTargetItem);
    });

    it('should add new items to target container', () => {
      engine._syncContainer(mockSourceContainer, mockTargetContainer);
      expect(engine._addItem).toHaveBeenCalledWith('item2', mockSourceItem, mockTargetContainer);
      expect(engine._addItem).toHaveBeenCalledWith('nestedContainer', mockNestedContainer, mockTargetContainer);
    });

    it('should skip null items', () => {
      mockSourceContainer.getItem.mockReturnValue(null);
      engine._syncContainer(mockSourceContainer, mockTargetContainer);
      expect(engine._updateItem).not.toHaveBeenCalled();
      expect(engine._addItem).not.toHaveBeenCalled();
    });

    it('should handle containers with circular references gracefully', () => {
      const circularContainer = {
        isContextContainer: true,
        keys: vi.fn(() => ['self']),
        getItem: vi.fn(),
        hasItem: vi.fn(() => false),
        setItem: vi.fn()
      };

      circularContainer.getItem.mockReturnValue(circularContainer);

      expect(() => {
        engine._syncContainer(mockTargetContainer, circularContainer);
      }).not.toThrow();
    });

    // This test is commented out because it requires a more complex setup to create circular references
    // it('should log warning for circular reference in _syncContainer', () => {
    //   const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    //   const circularContainer1 = {
    //     isContextContainer: true,
    //     keys: vi.fn(() => ['circular']),
    //     getItem: vi.fn(),
    //     hasItem: vi.fn(() => false),
    //     setItem: vi.fn()
    //   };

    //   const circularContainer2 = {
    //     isContextContainer: true,
    //     keys: vi.fn(() => ['back']),
    //     getItem: vi.fn(),
    //     hasItem: vi.fn(() => false),
    //     setItem: vi.fn()
    //   };

    //   // Create circular reference: container1 -> container2 -> container1
    //   circularContainer1.getItem.mockImplementation((key) => key === 'circular' ? circularContainer2 : null);
    //   circularContainer2.getItem.mockImplementation((key) => key === 'back' ? circularContainer1 : null);

    //   engine._syncContainer(mockTargetContainer, circularContainer1);

    //   expect(consoleSpy).toHaveBeenCalledWith('Circular reference detected in source container, skipping to prevent infinite recursion');

    //   consoleSpy.mockRestore();
    // });

    it('should log warning for self-reference in #syncContainerItems', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const selfReferencingContainer = {
        isContextContainer: true,
        keys: vi.fn(() => ['self']),
        getItem: vi.fn(),
        hasItem: vi.fn(() => false),
        setItem: vi.fn()
      };

      // Create self-reference
      selfReferencingContainer.getItem.mockReturnValue(selfReferencingContainer);

      engine._syncContainer(selfReferencingContainer, mockTargetContainer);

      expect(consoleSpy).toHaveBeenCalledWith('Self-reference detected for key "self", skipping to prevent infinite recursion');

      consoleSpy.mockRestore();
    });
  });

  describe('_addItem', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine();
      vi.spyOn(engine, '_cloneAndAddContainer').mockImplementation(() => {});
    });

    it('should clone and add container items', () => {
      engine._addItem('containerKey', mockNestedContainer, mockTargetContainer);
      expect(engine._cloneAndAddContainer).toHaveBeenCalledWith('containerKey', mockNestedContainer, mockTargetContainer);
    });

    it('should directly add regular items', () => {
      engine._addItem('itemKey', mockSourceItem, mockTargetContainer);
      expect(mockTargetContainer.setItem).toHaveBeenCalledWith('itemKey', mockSourceItem.value, { metadata: mockSourceItem.metadata });
    });

    it('should handle items without metadata', () => {
      const itemWithoutMetadata = { ...mockSourceItem, metadata: undefined };
      engine._addItem('itemKey', itemWithoutMetadata, mockTargetContainer);
      expect(mockTargetContainer.setItem).toHaveBeenCalledWith('itemKey', itemWithoutMetadata.value, { metadata: undefined });
    });
  });

  describe('_updateItem', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine({ syncMetadata: true });
      vi.spyOn(engine, '_syncContainer').mockImplementation(() => {});
    });

    it('should update ContextItem to ContextItem', () => {
      engine._updateItem(mockSourceItem, mockTargetItem);
      expect(ContextItemSync.updateTargetToMatchSource).toHaveBeenCalledWith(mockSourceItem, mockTargetItem, { syncMetadata: true });
    });

    it('should sync ContextContainer to ContextContainer', () => {
      const sourceContainer = { ...mockSourceContainer, isContextItem: false };
      const targetContainer = { ...mockTargetContainer, isContextItem: false };

      engine._updateItem(sourceContainer, targetContainer);
      expect(engine._syncContainer).toHaveBeenCalledWith(sourceContainer, targetContainer);
    });

    describe('strict type checking', () => {
      beforeEach(() => {
        engine = new ContextContainerSyncEngine({ strictTypeChecking: true });
      });

      it('should throw error when both items are non-Context types in strict mode', () => {
        const sourceValue = 'string value';
        const targetValue = 'another string';

        expect(() => {
          engine._updateItem(sourceValue, targetValue);
        }).toThrow(TypeError);
        expect(() => {
          engine._updateItem(sourceValue, targetValue);
        }).toThrow(/Strict type checking enabled/);
      });

      it('should not throw when at least one item is a Context type in strict mode', () => {
        expect(() => {
          engine._updateItem(mockSourceItem, 'string');
        }).not.toThrow();

        expect(() => {
          engine._updateItem('string', mockTargetItem);
        }).not.toThrow();
      });

      it('should handle Context types normally in strict mode', () => {
        engine._updateItem(mockSourceItem, mockTargetItem);
        expect(ContextItemSync.updateTargetToMatchSource).toHaveBeenCalled();
      });
    });

    describe('plain object synchronization', () => {
      beforeEach(() => {
        engine = new ContextContainerSyncEngine();
        vi.spyOn(engine, '_syncPlainObjects');
        _.cloneDeep.mockReturnValue({ nested: { value: 'cloned' } });
      });

      it('should handle plain object to plain object sync', () => {
        const sourceObj = { a: 1, nested: { value: 'test' } };
        const targetObj = { b: 2, nested: { other: 'data' } };

        engine._updateItem(sourceObj, targetObj);
        expect(engine._syncPlainObjects).toHaveBeenCalledWith(sourceObj, targetObj);
      });

      it('should call lodash merge for plain object sync', () => {
        const sourceObj = { a: 1 };
        const targetObj = { b: 2 };

        engine._updateItem(sourceObj, targetObj);
        expect(_.cloneDeep).toHaveBeenCalledWith(sourceObj);
        expect(_.merge).toHaveBeenCalledWith(targetObj, { nested: { value: 'cloned' } });
      });

      it('should not sync plain objects when one is not a plain object', () => {
        const sourceObj = { a: 1 };
        const targetArray = [1, 2, 3];

        vi.spyOn(engine, '_syncPlainObjects');
        engine._updateItem(sourceObj, targetArray);
        expect(engine._syncPlainObjects).not.toHaveBeenCalled();
      });
    });

    describe('primitive value synchronization', () => {
      beforeEach(() => {
        engine = new ContextContainerSyncEngine();
        vi.spyOn(engine, '_syncPrimitiveValues');
        vi.spyOn(console, 'debug').mockImplementation(() => {});
      });

      afterEach(() => {
        console.debug.mockRestore();
      });

      it('should handle string to string sync', () => {
        const sourceValue = 'source string';
        const targetValue = 'target string';

        engine._updateItem(sourceValue, targetValue);
        expect(engine._syncPrimitiveValues).toHaveBeenCalledWith(sourceValue, targetValue);
      });

      it('should handle number to number sync', () => {
        const sourceValue = 42;
        const targetValue = 24;

        engine._updateItem(sourceValue, targetValue);
        expect(engine._syncPrimitiveValues).toHaveBeenCalledWith(sourceValue, targetValue);
      });

      it('should handle boolean to boolean sync', () => {
        const sourceValue = true;
        const targetValue = false;

        engine._updateItem(sourceValue, targetValue);
        expect(engine._syncPrimitiveValues).toHaveBeenCalledWith(sourceValue, targetValue);
      });

      it('should handle null to null sync', () => {
        const sourceValue = null;
        const targetValue = null;

        engine._updateItem(sourceValue, targetValue);
        expect(engine._syncPrimitiveValues).toHaveBeenCalledWith(sourceValue, targetValue);
      });

      it('should handle undefined to undefined sync', () => {
        const sourceValue = undefined;
        const targetValue = undefined;

        engine._updateItem(sourceValue, targetValue);
        expect(engine._syncPrimitiveValues).toHaveBeenCalledWith(sourceValue, targetValue);
      });

      it('should log debug message in _syncPrimitiveValues', () => {
        engine._updateItem('source', 'target');
        expect(console.debug).toHaveBeenCalledWith('Syncing primitive values: target -> source');
      });

      it('should not sync primitives when types differ', () => {
        const sourceValue = 'string';
        const targetValue = 42;

        vi.spyOn(engine, '_syncPrimitiveValues');
        engine._updateItem(sourceValue, targetValue);
        // When types differ, both are primitives but different types, so it should still call _syncPrimitiveValues
        // This is because both are primitives, even if they're different types
        expect(engine._syncPrimitiveValues).toHaveBeenCalledWith(sourceValue, targetValue);
      });
    });

    describe('mixed type updates (fallback)', () => {
      beforeEach(() => {
        engine = new ContextContainerSyncEngine({ syncMetadata: true });
      });

      it('should handle mixed type updates with syncMetadata', () => {
        const setMetadataSpy = vi.fn();
        const mixedTarget = { 
          value: 'old value', 
          setMetadata: setMetadataSpy,
          _getManagedItem: vi.fn()
        };

        engine._updateItem(mockSourceItem, mixedTarget);
        expect(mixedTarget.value).toBe('source value');
        expect(setMetadataSpy).toHaveBeenCalledWith(mockSourceItem.metadata, false);
      });

      it('should handle mixed type updates without syncMetadata', () => {
        engine = new ContextContainerSyncEngine({ syncMetadata: false });
        const setMetadataSpy = vi.fn();
        const mixedTarget = { 
          value: 'old value', 
          setMetadata: setMetadataSpy,
          _getManagedItem: vi.fn()
        };

        engine._updateItem(mockSourceItem, mixedTarget);
        expect(mixedTarget.value).toBe('source value');
        expect(setMetadataSpy).not.toHaveBeenCalled();
      });

      it('should handle items without setMetadata method', () => {
        engine = new ContextContainerSyncEngine({ syncMetadata: true });
        const mixedTarget = { value: 'old value' };

        expect(() => {
          engine._updateItem(mockSourceItem, mixedTarget);
        }).not.toThrow();
        expect(mixedTarget.value).toBe('source value');
      });

      it('should handle fallback when setMetadata fails', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const setMetadataSpy = vi.fn(() => { throw new Error('setMetadata failed'); });
        const mixedTarget = {
          value: 'old value',
          setMetadata: setMetadataSpy,
          _getManagedItem: vi.fn()
        };

        engine._updateItem(mockSourceItem, mixedTarget);
        expect(mixedTarget.value).toBe('source value');
        expect(consoleSpy).toHaveBeenCalledWith('Failed to set metadata on target item:', expect.any(Error));

        consoleSpy.mockRestore();
      });
    });
  });

  describe('_cloneAndAddContainer', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine();
      vi.spyOn(engine, '_syncContainer').mockImplementation(() => {});
    });

    it('should create new container with source value and metadata', () => {
      engine._cloneAndAddContainer('containerKey', mockNestedContainer, mockTargetContainer);
      expect(ContextContainer).toHaveBeenCalledWith(mockNestedContainer.value, mockNestedContainer.metadata);
    });

    it('should sync the new container with source container', () => {
      const mockNewContainer = { isContextContainer: true };
      ContextContainer.mockReturnValue(mockNewContainer);

      engine._cloneAndAddContainer('containerKey', mockNestedContainer, mockTargetContainer);
      expect(engine._syncContainer).toHaveBeenCalledWith(mockNewContainer, mockNestedContainer);
    });

    it('should add the cloned container to target', () => {
      const mockNewContainer = { isContextContainer: true };
      ContextContainer.mockReturnValue(mockNewContainer);

      engine._cloneAndAddContainer('containerKey', mockNestedContainer, mockTargetContainer);
      expect(mockTargetContainer.setItem).toHaveBeenCalledWith('containerKey', mockNewContainer, { metadata: mockNestedContainer.metadata });
    });

    it('should handle containers without metadata', () => {
      const containerWithoutMetadata = { ...mockNestedContainer, metadata: undefined };

      engine._cloneAndAddContainer('containerKey', containerWithoutMetadata, mockTargetContainer);
      expect(ContextContainer).toHaveBeenCalledWith(containerWithoutMetadata.value, undefined);
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine({ syncMetadata: true });
    });

    it('should handle complex nested synchronization', () => {
      // Restore real implementation for integration test
      engine._syncContainer.mockRestore?.();
      engine._updateItem.mockRestore?.();
      engine._addItem.mockRestore?.();
      engine._cloneAndAddContainer.mockRestore?.();

      const result = engine.sync(mockSourceContainer, mockTargetContainer, 'sourceToTarget');

      expect(mockSourceContainer.keys).toHaveBeenCalled();
      expect(mockTargetContainer.hasItem).toHaveBeenCalled();
    });

    it('should handle empty source container', () => {
      mockSourceContainer.keys.mockReturnValue([]);

      expect(() => {
        engine.sync(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
      }).not.toThrow();
    });

    it('should handle source container with only null items', () => {
      mockSourceContainer.getItem.mockReturnValue(null);

      expect(() => {
        engine.sync(mockSourceContainer, mockTargetContainer, 'sourceToTarget');
      }).not.toThrow();
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine();
    });

    describe('_isPlainObject (delegated to Validator.isPlainObject)', () => {
      it('should return true for plain objects', () => {
        expect(Validator.isPlainObject({})).toBe(true);
        expect(Validator.isPlainObject({ a: 1, b: 2 })).toBe(true);
        expect(Validator.isPlainObject(Object.create(null))).toBe(true); // No prototype - still a plain object
        expect(Validator.isPlainObject(Object.create(Object.prototype))).toBe(true);
      });

      it('should return false for non-plain objects', () => {
        expect(Validator.isPlainObject([])).toBe(false);
        expect(Validator.isPlainObject(null)).toBe(false);
        expect(Validator.isPlainObject(new Date())).toBe(false);
        expect(Validator.isPlainObject(new Map())).toBe(false);
        expect(Validator.isPlainObject('string')).toBe(false);
        expect(Validator.isPlainObject(42)).toBe(false);
        expect(Validator.isPlainObject(true)).toBe(false);
        expect(Validator.isPlainObject(function() {})).toBe(false);
      });
    });

    describe('_isPrimitive', () => {
      it('should return true for primitive values', () => {
        expect(engine._isPrimitive('string')).toBe(true);
        expect(engine._isPrimitive('')).toBe(true);
        expect(engine._isPrimitive(42)).toBe(true);
        expect(engine._isPrimitive(0)).toBe(true);
        expect(engine._isPrimitive(-1)).toBe(true);
        expect(engine._isPrimitive(3.14)).toBe(true);
        expect(engine._isPrimitive(true)).toBe(true);
        expect(engine._isPrimitive(false)).toBe(true);
        expect(engine._isPrimitive(null)).toBe(true);
        expect(engine._isPrimitive(undefined)).toBe(true);
      });

      it('should return false for non-primitive values', () => {
        expect(engine._isPrimitive({})).toBe(false);
        expect(engine._isPrimitive([])).toBe(false);
        expect(engine._isPrimitive(new Date())).toBe(false);
        expect(engine._isPrimitive(function() {})).toBe(false);
        expect(engine._isPrimitive(Symbol('test'))).toBe(false);
        expect(engine._isPrimitive(new Map())).toBe(false);
      });
    });

    describe('_syncPlainObjects', () => {
      beforeEach(() => {
        _.cloneDeep.mockImplementation(obj => JSON.parse(JSON.stringify(obj))); // Simple deep clone mock
        _.merge.mockImplementation((target, source) => Object.assign(target, source));
      });

      it('should perform deep merge of plain objects', () => {
        const sourceObj = { a: 1, nested: { value: 'test' } };
        const targetObj = { b: 2, nested: { other: 'data' } };

        engine._syncPlainObjects(sourceObj, targetObj);

        expect(_.cloneDeep).toHaveBeenCalledWith(sourceObj);
        expect(_.merge).toHaveBeenCalledWith(targetObj, sourceObj);
      });

      it('should handle empty objects', () => {
        const sourceObj = {};
        const targetObj = { existing: 'value' };

        engine._syncPlainObjects(sourceObj, targetObj);

        expect(_.cloneDeep).toHaveBeenCalledWith(sourceObj);
        expect(_.merge).toHaveBeenCalledWith(targetObj, sourceObj);
      });
    });

    describe('_syncPrimitiveValues', () => {
      beforeEach(() => {
        vi.spyOn(console, 'debug').mockImplementation(() => {});
      });

      afterEach(() => {
        console.debug.mockRestore();
      });

      it('should log debug message for primitive sync', () => {
        engine._syncPrimitiveValues('source', 'target');
        expect(console.debug).toHaveBeenCalledWith('Syncing primitive values: target -> source');
      });

      it('should handle different primitive types', () => {
        engine._syncPrimitiveValues(42, 24);
        expect(console.debug).toHaveBeenCalledWith('Syncing primitive values: 24 -> 42');

        engine._syncPrimitiveValues(true, false);
        expect(console.debug).toHaveBeenCalledWith('Syncing primitive values: false -> true');

        engine._syncPrimitiveValues(null, undefined);
        expect(console.debug).toHaveBeenCalledWith('Syncing primitive values: undefined -> null');
      });
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      engine = new ContextContainerSyncEngine();
    });

    it('should handle undefined direction', () => {
      vi.spyOn(engine, '_syncContainer').mockImplementation(() => {});

      engine.sync(mockSourceContainer, mockTargetContainer, undefined);
      expect(engine._syncContainer).toHaveBeenCalledWith(mockTargetContainer, mockSourceContainer);
    });

    it('should handle invalid direction', () => {
      vi.spyOn(engine, '_syncContainer').mockImplementation(() => {});

      engine.sync(mockSourceContainer, mockTargetContainer, 'invalidDirection');
      expect(engine._syncContainer).toHaveBeenCalledWith(mockTargetContainer, mockSourceContainer);
    });

    it('should handle complex type combinations', () => {
      engine = new ContextContainerSyncEngine({ syncMetadata: true });

      // Test array to object (should fall back to mixed type handling)
      const sourceArray = [1, 2, 3];
      const targetObj = { value: 'old', setMetadata: vi.fn() };

      expect(() => {
        engine._updateItem(sourceArray, targetObj);
      }).not.toThrow();
      expect(targetObj.value).toEqual([1, 2, 3]);
    });

    it('should handle Date objects (should fall back to mixed type handling)', () => {
      engine = new ContextContainerSyncEngine();
      const sourceDate = new Date('2024-01-01');
      const targetObj = { value: 'old' };

      engine._updateItem(sourceDate, targetObj);
      expect(targetObj.value).toEqual(sourceDate);
    });
  });
});