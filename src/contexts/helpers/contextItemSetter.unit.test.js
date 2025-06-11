/**
 * @file contextItemSetter.unit.test.js
 * @description Test file for the ContextItemSetter static class functionality.
 * @path src/contexts/helpers/contextItemSetter.unit.test.js
 */

import { ContextItemSetter } from './contextItemSetter.js';
import { ContextValueWrapper } from './contextValueWrapper.js';
import PathUtils from '../../helpers/pathUtils.js';

// Mock dependencies
jest.mock('./contextValueWrapper.js');
jest.mock('../../helpers/pathUtils.js');

describe('ContextItemSetter', () => {
  let mockContainerInstance;
  let mockWrappedItem;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWrappedItem = {
      value: 'test-value',
      isFrozen: jest.fn(() => false)
    };

    mockContainerInstance = {
      _isReservedKey: jest.fn(() => false),
      _createNestedContainer: jest.fn(),
      _getManagedItem: jest.fn(),
      _setManagedItem: jest.fn(),
      _getDefaultItemOptions: jest.fn(() => ({
        wrapPrimitives: true,
        wrapAs: 'ContextItem',
        recordAccess: true,
        recordAccessForMetadata: false
      })),
      _updateModificationTimestamps: jest.fn(),
      setItem: jest.fn()
    };

    ContextValueWrapper.wrap.mockReturnValue(mockWrappedItem);

    PathUtils.extractKeyComponents.mockImplementation((key) => {
      const parts = key.split('.');
      return {
        firstKey: parts[0],
        remainingPath: parts.slice(1).join('.')
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
        setItem: jest.fn()
      };
      mockContainerInstance._createNestedContainer.mockReturnValue(mockNestedContainer);

      const result = ContextItemSetter.setItem('parent.child', 'testValue', mockContainerInstance);

      expect(PathUtils.extractKeyComponents).toHaveBeenCalledWith('parent.child', expect.any(Object));
      expect(mockContainerInstance._createNestedContainer).toHaveBeenCalledWith('parent');
      expect(mockNestedContainer.setItem).toHaveBeenCalledWith('child', 'testValue', {});
      expect(mockContainerInstance._updateModificationTimestamps).toHaveBeenCalled();
      expect(result).toBe(mockContainerInstance);
    });

    it('should throw error for reserved keys', () => {
      mockContainerInstance._isReservedKey.mockReturnValue(true);

      expect(() => ContextItemSetter.setItem('value', 'test', mockContainerInstance)).toThrow('Key "value" is reserved and cannot be used for an item.');
    });

    it('should throw error when trying to overwrite frozen item', () => {
      const frozenItem = { isFrozen: jest.fn(() => true) };
      mockContainerInstance._getManagedItem.mockReturnValue(frozenItem);

      expect(() => ContextItemSetter.setItem('key', 'new-value', mockContainerInstance)).toThrow('Cannot overwrite frozen item at key "key". Use ignoreFrozen option to force overwrite.');
    });

    it('should allow overwriting frozen item with ignoreFrozen option', () => {
      const frozenItem = { isFrozen: jest.fn(() => true) };
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
});
