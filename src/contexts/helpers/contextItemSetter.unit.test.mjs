/**
 * @file contextItemSetter.unit.test.mjs
 * @description Test file for the ContextItemSetter static class functionality.
 * @path src/contexts/helpers/contextItemSetter.unit.test.mjs

 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { ContextItemSetter } from './contextItemSetter.mjs';
import { ContextValueWrapper } from './contextValueWrapper.mjs';
import PathUtils from '../../helpers/pathUtils.mjs';

// Mock dependencies
vi.mock('./contextValueWrapper.mjs');
vi.mock('../../helpers/pathUtils.mjs');

describe('ContextItemSetter', () => {
  let mockContainerInstance;
  let mockWrappedItem;

  beforeEach(() => {
    vi.clearAllMocks();

    mockWrappedItem = {
      value: 'test-value',
      isFrozen: vi.fn(() => false)
    };

    mockContainerInstance = {
      _isReservedKey: vi.fn(() => false),
      _createNestedContainer: vi.fn(),
      _getManagedItem: vi.fn(),
      _setManagedItem: vi.fn(),
      _getDefaultItemOptions: vi.fn(() => ({
        wrapPrimitives: true,
        wrapAs: 'ContextItem',
        recordAccess: true,
        recordAccessForMetadata: false
      })),
      _updateModificationTimestamps: vi.fn(),
      setItem: vi.fn()
    };

    ContextValueWrapper.wrap.mockReturnValue(mockWrappedItem);

    PathUtils.extractKeyComponents.mockImplementation((key, options) => {
      const parts = key.split('.');
      const firstKey = parts[0];
      const remainingPath = parts.slice(1).join('.');
      
      // Call the validateFirstKey function if provided
      if (options && options.validateFirstKey) {
        options.validateFirstKey(firstKey);
      }
      
      return {
        firstKey,
        remainingPath
      };
    });
  });

  describe('setItem', () => {
    it('should throw error for invalid key types', () => {
      expect(() => ContextItemSetter.setItem('', 'value', mockContainerInstance)).toThrow('Item key must be a non-empty string.');
      expect(() => ContextItemSetter.setItem(123, 'value', mockContainerInstance)).toThrow('Item key must be a non-empty string.');
      expect(() => ContextItemSetter.setItem(null, 'value', mockContainerInstance)).toThrow('Item key must be a non-empty string.');
    });

    it('should handle simple key setting', () => {
      const result = ContextItemSetter.setItem('testKey', 'testValue', mockContainerInstance);

      expect(mockContainerInstance._isReservedKey).toHaveBeenCalledWith('testKey');
      expect(mockContainerInstance._getManagedItem).toHaveBeenCalledWith('testKey');
      expect(ContextValueWrapper.wrap).toHaveBeenCalledWith('testValue', expect.objectContaining({
        wrapPrimitives: true,
        wrapAs: 'ContextItem',
        recordAccess: true,
        recordAccessForMetadata: false
      }));
      expect(mockContainerInstance._setManagedItem).toHaveBeenCalledWith('testKey', mockWrappedItem);
      expect(mockContainerInstance._updateModificationTimestamps).toHaveBeenCalled();
      expect(result).toBe(mockContainerInstance);
    });

    it('should handle nested key setting', () => {
      const mockNestedContainer = {
        setItem: vi.fn()
      };
      mockContainerInstance._createNestedContainer.mockReturnValue(mockNestedContainer);

      const result = ContextItemSetter.setItem('parent.child', 'testValue', mockContainerInstance);

      expect(PathUtils.extractKeyComponents).toHaveBeenCalledWith('parent.child', expect.any(Object));
      expect(mockContainerInstance._createNestedContainer).toHaveBeenCalledWith('parent');
      expect(mockNestedContainer.setItem).toHaveBeenCalledWith('child', 'testValue', {});
      expect(mockContainerInstance._updateModificationTimestamps).toHaveBeenCalled();
      expect(result).toBe(mockContainerInstance);
    });

    it('should warn and prefix reserved keys', () => {
      mockContainerInstance._isReservedKey.mockReturnValue(true);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = ContextItemSetter.setItem('value', 'test', mockContainerInstance);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Key "value" is reserved. It will been renamed to "_value".');
      expect(mockContainerInstance._setManagedItem).toHaveBeenCalledWith('_value', mockWrappedItem);
      expect(result).toBe(mockContainerInstance);

      consoleWarnSpy.mockRestore();
    });

    it('should throw error when trying to overwrite frozen item', () => {
      const frozenItem = { isFrozen: vi.fn(() => true) };
      mockContainerInstance._getManagedItem.mockReturnValue(frozenItem);

      expect(() => ContextItemSetter.setItem('key', 'new-value', mockContainerInstance)).toThrow('Cannot overwrite frozen item at key "key". Use ignoreFrozen option to force overwrite.');
    });

    it('should allow overwriting frozen item with ignoreFrozen option', () => {
      const frozenItem = { isFrozen: vi.fn(() => true) };
      mockContainerInstance._getManagedItem.mockReturnValue(frozenItem);

      expect(() => ContextItemSetter.setItem('key', 'new-value', mockContainerInstance, { ignoreFrozen: true })).not.toThrow();
    });

    it('should handle custom item options', () => {
      const customOptions = {
        wrapAs: 'ContextContainer',
        metadata: { custom: 'data' }
      };

      ContextItemSetter.setItem('key', 'value', mockContainerInstance, customOptions);

      expect(ContextValueWrapper.wrap).toHaveBeenCalledWith('value', expect.objectContaining({
        wrapAs: 'ContextContainer',
        metadata: { custom: 'data' }
      }));
    });
  });

  describe('nested key error handling', () => {
    it('should throw error for reserved key in nested path', () => {
      mockContainerInstance._isReservedKey.mockReturnValue(true);

      expect(() => {
        ContextItemSetter.setItem('value.child', 'testValue', mockContainerInstance);
      }).toThrow('Key "value" is reserved and cannot be used for an item.');
    });

    it('should throw error when nested container creation fails', () => {
      mockContainerInstance._createNestedContainer.mockReturnValue(null);

      expect(() => {
        ContextItemSetter.setItem('parent.child', 'testValue', mockContainerInstance);
      }).toThrow('Cannot set nested value on non-container item at key "parent"');
    });

    it('should throw error when nested container lacks setItem method', () => {
      mockContainerInstance._createNestedContainer.mockReturnValue({});

      expect(() => {
        ContextItemSetter.setItem('parent.child', 'testValue', mockContainerInstance);
      }).toThrow('Cannot set nested value on non-container item at key "parent"');
    });
  });

  describe('value wrapper integration', () => {
    it('should handle ContextValueWrapper.wrap errors', () => {
      ContextValueWrapper.wrap.mockImplementation(() => {
        throw new Error('Wrapper failed');
      });

      expect(() => {
        ContextItemSetter.setItem('key', 'value', mockContainerInstance);
      }).toThrow('Wrapper failed');
    });

    it('should pass through all wrapper options correctly', () => {
      const options = {
        wrapPrimitives: false,
        wrapAs: 'ContextContainer',
        recordAccess: false,
        recordAccessForMetadata: true,
        frozen: true,
        metadata: { custom: 'data' }
      };

      ContextItemSetter.setItem('key', 'value', mockContainerInstance, options);

      expect(ContextValueWrapper.wrap).toHaveBeenCalledWith('value', expect.objectContaining(options));
    });
  });

  describe('options merging', () => {
    it('should merge default options with overrides correctly', () => {
      mockContainerInstance._getDefaultItemOptions.mockReturnValue({
        wrapPrimitives: true,
        wrapAs: 'ContextItem',
        recordAccess: true,
        recordAccessForMetadata: false
      });

      const overrides = {
        wrapAs: 'ContextContainer',
        metadata: { test: 'data' }
      };

      ContextItemSetter.setItem('key', 'value', mockContainerInstance, overrides);

      expect(ContextValueWrapper.wrap).toHaveBeenCalledWith('value', expect.objectContaining({
        wrapPrimitives: true,
        wrapAs: 'ContextContainer',
        recordAccess: true,
        recordAccessForMetadata: false,
        metadata: { test: 'data' }
      }));
    });

    it('should handle missing default options gracefully', () => {
      mockContainerInstance._getDefaultItemOptions.mockReturnValue({});

      ContextItemSetter.setItem('key', 'value', mockContainerInstance, { wrapAs: 'ContextItem' });

      expect(ContextValueWrapper.wrap).toHaveBeenCalledWith('value', expect.objectContaining({
        wrapAs: 'ContextItem'
      }));
    });
  });

  describe('frozen item detection', () => {
    it('should handle item without isFrozen method', () => {
      const itemWithoutMethod = { value: 'test' };
      mockContainerInstance._getManagedItem.mockReturnValue(itemWithoutMethod);

      expect(() => {
        ContextItemSetter.setItem('key', 'new-value', mockContainerInstance);
      }).not.toThrow();
    });

    it('should handle isFrozen method that throws error', () => {
      const problematicItem = {
        isFrozen: vi.fn().mockImplementation(() => {
          throw new Error('isFrozen error');
        })
      };
      mockContainerInstance._getManagedItem.mockReturnValue(problematicItem);

      expect(() => {
        ContextItemSetter.setItem('key', 'new-value', mockContainerInstance);
      }).toThrow('isFrozen error');
    });

    it('should handle non-function isFrozen property', () => {
      const itemWithNonFunction = { isFrozen: true };
      mockContainerInstance._getManagedItem.mockReturnValue(itemWithNonFunction);

      expect(() => {
        ContextItemSetter.setItem('key', 'new-value', mockContainerInstance);
      }).not.toThrow();
    });
  });

  describe('value type handling', () => {
    it('should handle null values', () => {
      expect(() => {
        ContextItemSetter.setItem('key', null, mockContainerInstance);
      }).not.toThrow();

      expect(ContextValueWrapper.wrap).toHaveBeenCalledWith(null, expect.any(Object));
    });

    it('should handle undefined values', () => {
      expect(() => {
        ContextItemSetter.setItem('key', undefined, mockContainerInstance);
      }).not.toThrow();
    });

    it('should handle complex objects', () => {
      const complexObject = { nested: { data: [1, 2, 3] } };

      ContextItemSetter.setItem('key', complexObject, mockContainerInstance);

      expect(ContextValueWrapper.wrap).toHaveBeenCalledWith(complexObject, expect.any(Object));
    });
  });
});
