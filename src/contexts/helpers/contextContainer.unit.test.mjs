/**
 * @file contextContainer.unit.test.mjs
 * @description Unit tests for the ContextContainer class.
 * @path src/contexts/helpers/contextContainer.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { ContextContainer } from './contextContainer.mjs';
import { ContextItem } from './contextItem.mjs';
import { ContextValueWrapper } from './contextValueWrapper.mjs';
import { ContextItemSetter } from './contextItemSetter.mjs';
import { Validator } from '../../utils/static/validator.mjs';
import PathUtils from '../../helpers/pathUtils.mjs';
import dayjs from 'dayjs';

function loadAlias(relativePath) {
  return async () => import(new URL(relativePath, import.meta.url).href);
}

vi.mock('#utils/static/validator.mjs', loadAlias('../../utils/static/validator.mjs'));
vi.mock('#helpers/pathUtils.mjs', loadAlias('../../helpers/pathUtils.mjs'));
vi.mock('#config', loadAlias('../../config/config.mjs'));
vi.mock('#constants', loadAlias('../../config/constants.mjs'));
vi.mock('#manifest', loadAlias('../../config/manifest.mjs'));

vi.mock('./contextItem.mjs');
vi.mock('./contextValueWrapper.mjs');
vi.mock('./contextItemSetter.mjs');
vi.mock('../../utils/static/validator.mjs', () => ({
  default: {
    isPlainObject: vi.fn(),
    isReservedKey: vi.fn()
  },
  Validator: {
    isPlainObject: vi.fn(),
    isReservedKey: vi.fn()
  }
}));
vi.mock('../../helpers/pathUtils.mjs');

describe('ContextContainer', () => {
  let mockContainerItemInstance;
  let MOCK_DATE;
  let dateNowSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    MOCK_DATE = new Date('2024-01-01T00:00:00.000Z');
    dateNowSpy = vi.spyOn(global, 'Date').mockImplementation(() => MOCK_DATE);

    mockContainerItemInstance = {
      value: undefined,
      metadata: {},
      createdAt: MOCK_DATE,
      modifiedAt: MOCK_DATE,
      lastAccessedAt: MOCK_DATE,
      recordAccess: true,
      recordAccessForMetadata: false,
      _updateAccessTimestamp: vi.fn(),
      _updateModificationTimestamps: vi.fn(),
      freeze: vi.fn(),
      unfreeze: vi.fn(),
      isFrozen: vi.fn().mockReturnValue(false),
      setMetadata: vi.fn(),
      changeAccessRecord: vi.fn(),
      reinitialize: vi.fn(),
      clear: vi.fn(),
    };

    ContextItem.mockImplementation((initialValue, metadata, options) => {
      // Create new instance for each call to avoid sharing state
      const instance = { ...mockContainerItemInstance };
      if (options) {
        instance.recordAccess = options.recordAccess !== undefined ? options.recordAccess : instance.recordAccess;
        instance.recordAccessForMetadata = options.recordAccessForMetadata !== undefined ? options.recordAccessForMetadata : instance.recordAccessForMetadata;
      }
      instance.metadata = metadata || {};

      // Define value property properly
      Object.defineProperty(instance, 'value', {
        get: vi.fn(() => initialValue),
        set: vi.fn((newValue) => { initialValue = newValue; }),
        configurable: true
      });

      return instance;
    });

    Validator.isPlainObject.mockImplementation(v => typeof v === 'object' && v !== null && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype);
    Validator.isReservedKey.mockReturnValue(false); // Default: not reserved

    PathUtils.extractKeyComponents.mockImplementation((path, options) => {
      const parts = path.split('.');
      const firstKey = parts[0];
      if (options && typeof options.validateFirstKey === 'function') {
        options.validateFirstKey(firstKey);
      }
      return {
        firstKey,
        remainingPath: parts.slice(1).join('.'),
        parts: options && options.returnParts ? parts : undefined,
      };
    });
    PathUtils.getNestedObjectValue.mockReturnValue(undefined);

    ContextItemSetter.setItem.mockImplementation((key, rawValue, containerInstance, itemOptionsOverrides) => {
      // This mock is primarily for verifying calls.
      // For state setup in tests, use containerInstance._setManagedItem directly.
      return containerInstance;
    });

    ContextValueWrapper.wrap.mockImplementation((value, options) => {
      const item = new ContextItem(value, options.metadata, {
        frozen: options.frozen,
        recordAccess: options.recordAccess,
        recordAccessForMetadata: options.recordAccessForMetadata,
      });
      if (options.wrapAs === 'ContextContainer') {
        // Return a basic mock container for _createNestedContainer
        const mockNestedContainer = new ContextContainer(value); // Will use mocked ContextItem
        vi.spyOn(mockNestedContainer, 'setItem');
        vi.spyOn(mockNestedContainer, 'getItem');
        vi.spyOn(mockNestedContainer, 'hasItem');
        vi.spyOn(mockNestedContainer, 'getWrappedItem');
        return mockNestedContainer;
      }
      return item; // Returns a mocked ContextItem
    });
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const container = new ContextContainer();
      expect(ContextItem).toHaveBeenCalledWith(undefined, {}, { recordAccess: true, recordAccessForMetadata: false });
      expect(container.size).toBe(0);
      expect(container.isContextContainer).toBe(true);
      expect(ContextItemSetter.setItem).not.toHaveBeenCalled();
    });

    it('should initialize with initialItemsOrValue as a plain object', () => {
      const initialItems = { item1: 'value1', item2: 123 };
      const container = new ContextContainer(initialItems);
      expect(ContextItemSetter.setItem).toHaveBeenCalledTimes(2);
      expect(ContextItemSetter.setItem).toHaveBeenCalledWith('item1', 'value1', container, expect.objectContaining({ wrapAs: "ContextItem" }));
      expect(ContextItemSetter.setItem).toHaveBeenCalledWith('item2', 123, container, expect.objectContaining({ wrapAs: "ContextItem" }));
    });

    it('should initialize with initialItemsOrValue as a single non-plain object value', () => {
      const initialValue = 'singleValue';
      const container = new ContextContainer(initialValue);
      expect(ContextItemSetter.setItem).toHaveBeenCalledTimes(1);
      expect(ContextItemSetter.setItem).toHaveBeenCalledWith('default', initialValue, container, expect.objectContaining({ wrapAs: "ContextItem" }));
    });

    it('should pass container options to internal ContextItem and set default item options', () => {
      const metadata = { info: 'test container' };
      const options = {
        recordAccess: false,
        recordAccessForMetadata: true,
        defaultItemWrapPrimitives: false,
        defaultItemWrapAs: "ContextContainer",
        defaultItemRecordAccess: false,
        defaultItemRecordAccessForMetadata: true,
      };
      const container = new ContextContainer({}, metadata, options);
      expect(ContextItem).toHaveBeenCalledWith(undefined, metadata, { recordAccess: false, recordAccessForMetadata: true });
      const defaultOpts = container._getDefaultItemOptions();
      expect(defaultOpts.wrapPrimitives).toBe(false);
      expect(defaultOpts.wrapAs).toBe("ContextContainer");
      expect(defaultOpts.recordAccess).toBe(false);
      expect(defaultOpts.recordAccessForMetadata).toBe(true);
    });

    it('should handle undefined initialItemsOrValue by not calling setItem', () => {
      const container = new ContextContainer(undefined);
      expect(ContextItemSetter.setItem).not.toHaveBeenCalled();
    });
  });

  describe('delegated ContextItem properties and methods', () => {
    let container;
    let mockInternalItem;

    beforeEach(() => {
      container = new ContextContainer();
      // Get the internal ContextItem instance created by the constructor
      mockInternalItem = ContextItem.mock.results[0].value;
    });

    it('should delegate metadata getter', () => {
      mockInternalItem.metadata = { test: 'value' };
      expect(container.metadata).toEqual({ test: 'value' });
    });

    it('should delegate metadata setter', () => {
      container.metadata = { new: 'metadata' };
      expect(mockInternalItem.metadata).toEqual({ new: 'metadata' });
    });

    it('should delegate createdAt getter', () => {
      expect(container.createdAt).toBe(MOCK_DATE);
    });

    it('should delegate modifiedAt getter', () => {
      expect(container.modifiedAt).toBe(MOCK_DATE);
    });

    it('should delegate lastAccessedAt getter', () => {
      expect(container.lastAccessedAt).toBe(MOCK_DATE);
    });

    it('should delegate recordAccess getter and setter', () => {
      expect(container.recordAccess).toBe(true);
      container.recordAccess = false;
      expect(mockInternalItem.recordAccess).toBe(false);
    });

    it('should delegate recordAccessForMetadata getter and setter', () => {
      expect(container.recordAccessForMetadata).toBe(false);
      container.recordAccessForMetadata = true;
      expect(mockInternalItem.recordAccessForMetadata).toBe(true);
    });

    it('should delegate _updateAccessTimestamp', () => {
      container._updateAccessTimestamp();
      expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalled();
    });

    it('should delegate _updateModificationTimestamps', () => {
      container._updateModificationTimestamps();
      expect(mockInternalItem._updateModificationTimestamps).toHaveBeenCalled();
    });

    it('should delegate freeze method', () => {
      container.freeze();
      expect(mockInternalItem.freeze).toHaveBeenCalled();
    });

    it('should delegate unfreeze method', () => {
      container.unfreeze();
      expect(mockInternalItem.unfreeze).toHaveBeenCalled();
    });

    it('should delegate isFrozen method', () => {
      mockInternalItem.isFrozen.mockReturnValue(true);
      expect(container.isFrozen()).toBe(true);
      expect(mockInternalItem.isFrozen).toHaveBeenCalled();
    });

    it('should delegate setMetadata method', () => {
      const newMetadata = { updated: 'metadata' };
      container.setMetadata(newMetadata);
      expect(mockInternalItem.setMetadata).toHaveBeenCalledWith(newMetadata);
    });

    it('should delegate changeAccessRecord method', () => {
      container.changeAccessRecord(false, true);
      expect(mockInternalItem.changeAccessRecord).toHaveBeenCalledWith(false, true);
    });
  });

  describe('_isPlainObject', () => {
    it('should call Validator.isPlainObject', () => {
      const container = new ContextContainer();
      const obj = {};
      container._isPlainObject(obj);
      expect(Validator.isPlainObject).toHaveBeenCalledWith(obj);
    });
  });

  describe('_extractKeyComponents', () => {
    it('should call PathUtils.extractKeyComponents and validate first key', () => {
      const container = new ContextContainer();
      // Mock the global isReservedKey function instead of the private method
      Validator.isReservedKey.mockReturnValue(false);
      const path = 'a.b.c';
      container._extractKeyComponents(path);
      expect(PathUtils.extractKeyComponents).toHaveBeenCalledWith(path, expect.objectContaining({
        validateFirstKey: expect.any(Function)
      }));
      // Verify the validator was called for validation
      expect(Validator.isReservedKey).toHaveBeenCalled();
    });

    it('should throw TypeError if first key is reserved during extraction', () => {
      const container = new ContextContainer();
      // Mock the global isReservedKey function to return true for reserved keys
      Validator.isReservedKey.mockReturnValue(true);
      PathUtils.extractKeyComponents.mockImplementationOnce((path, opts) => {
        opts.validateFirstKey('value'); // Simulate call with reserved key
        return { firstKey: 'value', remainingPath: '' };
      });
      expect(() => container._extractKeyComponents('value.b')).toThrow(TypeError);
    });
  });

  describe('_createNestedContainer', () => {
    it('should create and return a new nested container if one does not exist', () => {
      const container = new ContextContainer();
      const mockNewNestedContainer = new ContextContainer(); // This will use mocked ContextItem
      ContextValueWrapper.wrap.mockReturnValue(mockNewNestedContainer);

      const nested = container._createNestedContainer('nestedKey');
      expect(ContextValueWrapper.wrap).toHaveBeenCalledWith({}, expect.objectContaining({ wrapAs: 'ContextContainer' }));
      expect(nested).toBe(mockNewNestedContainer);
      expect(container._getManagedItem('nestedKey')).toBe(mockNewNestedContainer);
    });

    it('should return an existing container if it is a ContextContainer', () => {
      const container = new ContextContainer();
      const existingNestedContainer = new ContextContainer();
      vi.spyOn(existingNestedContainer, 'setItem'); // Ensure it's a "valid" container
      container._setManagedItem('existingKey', existingNestedContainer);

      const nested = container._createNestedContainer('existingKey');
      expect(ContextValueWrapper.wrap).not.toHaveBeenCalled();
      expect(nested).toBe(existingNestedContainer);
    });

    it('should throw TypeError if existing item is not a valid container', () => {
      const container = new ContextContainer();
      const nonContainerItem = new ContextItem('not a container');
      nonContainerItem.setItem = undefined; // Make it not duck-type as container
      container._setManagedItem('invalidKey', nonContainerItem);
      expect(() => container._createNestedContainer('invalidKey')).toThrow(TypeError);
    });
  });

  describe('_setNestedItem', () => {
    it('should call setItem on the nested container and update modification timestamps', () => {
      const container = new ContextContainer();
      const mockInternalItem = ContextItem.mock.results[0].value;
      const mockNestedContainer = new ContextContainer();
      vi.spyOn(mockNestedContainer, 'setItem');
      const itemOptions = { frozen: true };

      container._setNestedItem(mockNestedContainer, 'path.to.value', 123, itemOptions);
      expect(mockNestedContainer.setItem).toHaveBeenCalledWith('path.to.value', 123, itemOptions);
      expect(mockInternalItem._updateModificationTimestamps).toHaveBeenCalled();
    });
  });

  describe('setItem', () => {
    it('should delegate to ContextItemSetter.setItem', () => {
      const container = new ContextContainer();
      const key = 'testKey';
      const value = 'testValue';
      const options = { frozen: true };
      container.setItem(key, value, options);
      expect(ContextItemSetter.setItem).toHaveBeenCalledWith(key, value, container, options);
    });
  });

  describe('hasItem', () => {
    it('should return true for an existing top-level item', () => {
      const container = new ContextContainer();
      container._setManagedItem('foo', new ContextItem('bar'));
      expect(container.hasItem('foo')).toBe(true);
    });

    it('should return false for a non-existent top-level item', () => {
      const container = new ContextContainer();
      expect(container.hasItem('bar')).toBe(false);
    });

    it('should return true for an existing nested item', () => {
      const container = new ContextContainer();
      const nestedContainer = new ContextContainer();
      container._setManagedItem('parent', nestedContainer);
      vi.spyOn(nestedContainer, 'hasItem').mockReturnValue(true);
      PathUtils.extractKeyComponents.mockReturnValue({ firstKey: 'parent', remainingPath: 'child' });

      expect(container.hasItem('parent.child')).toBe(true);
      expect(nestedContainer.hasItem).toHaveBeenCalledWith('child');
    });

    it('should return false if nested path firstKey does not exist or is not a container', () => {
      const container = new ContextContainer();
      container._setManagedItem('parentNotContainer', new ContextItem({}));
      PathUtils.extractKeyComponents.mockImplementation((path) => {
        if (path === 'nonExistent.child') return { firstKey: 'nonExistent', remainingPath: 'child' };
        if (path === 'parentNotContainer.child') return { firstKey: 'parentNotContainer', remainingPath: 'child' };
        return { firstKey: path, remainingPath: ''};
      });
      expect(container.hasItem('nonExistent.child')).toBe(false);
      expect(container.hasItem('parentNotContainer.child')).toBe(false);
    });

    it('should return false for invalid key types', () => {
      const container = new ContextContainer();
      expect(container.hasItem(null)).toBe(false);
      expect(container.hasItem('')).toBe(false);
      expect(container.hasItem(123)).toBe(false);
    });

    it('should throw TypeError if path contains a reserved key', () => {
      const container = new ContextContainer();
      Validator.isReservedKey.mockImplementation((key) => key === 'value');
      PathUtils.extractKeyComponents.mockImplementationOnce((path, opts) => {
         // Simulate the validation call for 'value.prop'
        if (path === 'value.prop') opts.validateFirstKey('value');
        return { firstKey: 'value', remainingPath: 'prop' };
      });
      expect(() => container.hasItem('value.prop')).toThrow(TypeError);
    });
  });

  describe('getItem', () => {
    it('should return the unwrapped value of a top-level item and update access timestamp', () => {
      const container = new ContextContainer({}, {}, { recordAccess: true });
      const mockInternalItem = ContextItem.mock.results[0].value; // Get container's internal item
      const mockItem = new ContextItem('testValue');
      // Manually set the value property on the mock
      Object.defineProperty(mockItem, 'value', {
        get: vi.fn(() => 'testValue'),
        configurable: true
      });
      container._setManagedItem('foo', mockItem);

      expect(container.getItem('foo')).toBe('testValue');
      expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalledTimes(1); // For container access
    });

    it('should return undefined for a non-existent item', () => {
      const container = new ContextContainer();
      expect(container.getItem('nonExistent')).toBeUndefined();
    });

    it('should handle nested item access via #handleNestedAccess', () => {
      const container = new ContextContainer({}, {}, { recordAccess: true });
      const mockInternalItem = ContextItem.mock.results[0].value;
      const nestedContainer = new ContextContainer();
      container._setManagedItem('parent', nestedContainer);
      vi.spyOn(nestedContainer, 'getItem').mockReturnValue('nestedValue');
      PathUtils.extractKeyComponents.mockReturnValue({ firstKey: 'parent', remainingPath: 'child', parts: ['parent', 'child'] });

      expect(container.getItem('parent.child')).toBe('nestedValue');
      expect(nestedContainer.getItem).toHaveBeenCalledWith('child');
      expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalledTimes(1); // For container access to 'parent'
    });

    it('should return undefined for invalid key type', () => {
      const container = new ContextContainer();
      expect(container.getItem(123)).toBeUndefined();
    });
  });

  describe('#handleNestedAccess (tested via getItem)', () => {
    it('should correctly access value from nested ContextContainer', () => {
        const container = new ContextContainer({}, {}, { recordAccess: true });
        const mockInternalItem = ContextItem.mock.results[0].value;
        const childContainer = new ContextContainer();
        vi.spyOn(childContainer, 'getItem').mockReturnValue('deepValue');
        container._setManagedItem('parent', childContainer);

        PathUtils.extractKeyComponents.mockReturnValueOnce({ firstKey: 'parent', remainingPath: 'child.grandchild', parts: ['parent', 'child', 'grandchild'] });

        container.getItem('parent.child.grandchild');
        expect(childContainer.getItem).toHaveBeenCalledWith('child.grandchild');
        expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalled();
    });

    it('should correctly access value from nested object within a ContextItem', () => {
        const container = new ContextContainer({}, {}, { recordAccess: true });
        const mockInternalItem = ContextItem.mock.results[0].value;
        const itemWithValueObject = new ContextItem({ child: { grandchild: 'deepValue' } });
        container._setManagedItem('parent', itemWithValueObject);

        PathUtils.extractKeyComponents.mockReturnValueOnce({ firstKey: 'parent', remainingPath: 'child.grandchild', parts: ['parent', 'child', 'grandchild'] });
        PathUtils.getNestedObjectValue.mockReturnValueOnce('deepValue');

        expect(container.getItem('parent.child.grandchild')).toBe('deepValue');
        expect(PathUtils.getNestedObjectValue).toHaveBeenCalledWith({ child: { grandchild: 'deepValue' } }, ['parent', 'child', 'grandchild'], { startIndex: 1 });
        expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalled();
    });

    it('should return undefined if path is not found in nested structures', () => {
        const container = new ContextContainer();
        const childContainer = new ContextContainer();
        vi.spyOn(childContainer, 'getItem').mockReturnValue(undefined);
        container._setManagedItem('parent', childContainer);
        PathUtils.extractKeyComponents.mockReturnValueOnce({ firstKey: 'parent', remainingPath: 'nonexistent', parts: ['parent', 'nonexistent'] });
        expect(container.getItem('parent.nonexistent')).toBeUndefined();
    });

    it('should throw TypeError if first key in path is reserved', () => {
      const container = new ContextContainer();
      Validator.isReservedKey.mockImplementation(key => key === 'value');
      PathUtils.extractKeyComponents.mockImplementationOnce((path, opts) => {
        if (path === 'value.prop') opts.validateFirstKey('value');
        return { firstKey: 'value', remainingPath: 'prop', parts: ['value', 'prop'] };
      });
      expect(() => container.getItem('value.prop')).toThrow(TypeError);
    });
  });


  describe('getValue', () => {
    it('should call getItem and update item access timestamp if applicable', () => {
      const container = new ContextContainer();
      const mockItem = new ContextItem('val');
      mockItem.recordAccess = true;
      mockItem._updateAccessTimestamp = vi.fn();
      container._setManagedItem('test', mockItem);

      vi.spyOn(container, 'getItem').mockReturnValue('val');

      expect(container.getValue('test')).toBe('val');
      expect(container.getItem).toHaveBeenCalledWith('test');
      expect(mockItem._updateAccessTimestamp).toHaveBeenCalledTimes(1);
    });

    it('should not update item access timestamp if item does not record access', () => {
      const container = new ContextContainer();
      const mockItem = new ContextItem('val');
      mockItem.recordAccess = false;
      mockItem._updateAccessTimestamp = vi.fn();
      container._setManagedItem('test', mockItem);
      vi.spyOn(container, 'getItem').mockReturnValue('val');

      container.getValue('test');
      expect(mockItem._updateAccessTimestamp).not.toHaveBeenCalled();
    });

    it('should not attempt to update item access timestamp for nested gets (handled by nested container/item)', () => {
      const container = new ContextContainer();
      vi.spyOn(container, 'getItem').mockReturnValue('nestedVal');
      PathUtils.extractKeyComponents.mockReturnValue({ firstKey: 'a', remainingPath: 'b', parts: ['a', 'b'] });

      container.getValue('a.b');
      const topLevelItem = container._getManagedItem('a.b');
      expect(topLevelItem).toBeUndefined();
    });
  });


  describe('getWrappedItem', () => {
    it('should return the wrapped item and update container access timestamp', () => {
      const container = new ContextContainer({}, {}, { recordAccess: true });
      const mockInternalItem = ContextItem.mock.results[0].value;
      const mockWrappedItem = new ContextItem('val');
      container._setManagedItem('foo', mockWrappedItem);

      expect(container.getWrappedItem('foo')).toBe(mockWrappedItem);
      expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalledTimes(1);
    });

    it('should handle nested wrapped item access', () => {
      const container = new ContextContainer({}, {}, { recordAccess: true });
      const mockInternalItem = ContextItem.mock.results[0].value;
      const nestedContainer = new ContextContainer();
      const mockDeepWrappedItem = new ContextItem('deepVal');
      container._setManagedItem('parent', nestedContainer);
      vi.spyOn(nestedContainer, 'getWrappedItem').mockReturnValue(mockDeepWrappedItem);
      PathUtils.extractKeyComponents.mockReturnValue({ firstKey: 'parent', remainingPath: 'child' });

      expect(container.getWrappedItem('parent.child')).toBe(mockDeepWrappedItem);
      expect(nestedContainer.getWrappedItem).toHaveBeenCalledWith('child');
      expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalledTimes(1); // For 'parent' access
    });

    it('should return undefined if item not found or nested path invalid', () => {
      const container = new ContextContainer();
      expect(container.getWrappedItem('nonExistent')).toBeUndefined();

      const nestedContainer = new ContextContainer();
      container._setManagedItem('parent', nestedContainer);
      vi.spyOn(nestedContainer, 'getWrappedItem').mockReturnValue(undefined);
      PathUtils.extractKeyComponents.mockReturnValue({ firstKey: 'parent', remainingPath: 'nonExistentChild' });
      expect(container.getWrappedItem('parent.nonExistentChild')).toBeUndefined();
    });

    it('should return undefined for invalid key type', () => {
      const container = new ContextContainer();
      expect(container.getWrappedItem(null)).toBeUndefined();
    });
  });

  describe('removeItem', () => {
    it('should remove an item and update modification timestamps', () => {
      const container = new ContextContainer();
      const mockInternalItem = ContextItem.mock.results[0].value;
      container._setManagedItem('foo', new ContextItem('bar'));
      expect(container.removeItem('foo')).toBe(true);
      expect(container.hasItem('foo')).toBe(false);
      expect(mockInternalItem._updateModificationTimestamps).toHaveBeenCalled();
    });

    it('should return false if item does not exist and not update timestamps', () => {
      const container = new ContextContainer();
      const mockInternalItem = ContextItem.mock.results[0].value;
      expect(container.removeItem('nonExistent')).toBe(false);
      expect(mockInternalItem._updateModificationTimestamps).not.toHaveBeenCalled();
    });
  });

  describe('clearItems', () => {
    it('should clear all items and update modification timestamps if items existed', () => {
      const container = new ContextContainer();
      const mockInternalItem = ContextItem.mock.results[0].value;
      container._setManagedItem('foo', new ContextItem('bar'));
      container._setManagedItem('baz', new ContextItem('qux'));
      container.clearItems();
      expect(container.size).toBe(0);
      expect(mockInternalItem._updateModificationTimestamps).toHaveBeenCalled();
    });

    it('should not update modification timestamps if no items existed', () => {
      const container = new ContextContainer();
      const mockInternalItem = ContextItem.mock.results[0].value;
      container.clearItems();
      expect(container.size).toBe(0);
      expect(mockInternalItem._updateModificationTimestamps).not.toHaveBeenCalled();
    });
  });

  describe('Iterators (keys, items, entries)', () => {
    let container;
    let mockInternalItem;

    beforeEach(() => {
      container = new ContextContainer({}, {}, { recordAccess: true });
      mockInternalItem = ContextItem.mock.results[0].value;
      container._setManagedItem('a', new ContextItem(1));
      container._setManagedItem('b', new ContextItem(2));
    });

    it('keys() should return an iterator for keys and update access timestamp', () => {
      const keys = Array.from(container.keys());
      expect(keys).toEqual(['a', 'b']);
      expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalled();
    });

    it('items() should return an iterator for items and update access timestamp', () => {
      const items = Array.from(container.items());
      expect(items.length).toBe(2);
      // The items are mocked ContextItem instances, so check they are objects with expected structure
      expect(items[0]).toHaveProperty('value');
      expect(items[0]).toHaveProperty('metadata');
      expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalled();
    });

    it('entries() should return an iterator for entries and update access timestamp', () => {
      const entries = Array.from(container.entries());
      expect(entries.length).toBe(2);
      expect(entries[0][0]).toBe('a');
      // The entries contain mocked ContextItem instances
      expect(entries[0][1]).toHaveProperty('value');
      expect(entries[0][1]).toHaveProperty('metadata');
      expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalled();
    });
  });

  describe('size (getter)', () => {
    it('should return the number of items and update access timestamp', () => {
      const container = new ContextContainer({}, {}, { recordAccess: true });
      const mockInternalItem = ContextItem.mock.results[0].value;
      container._setManagedItem('a', new ContextItem(1));
      expect(container.size).toBe(1);
      expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalled();
    });
  });

  describe('value (getter)', () => {
    it('should return a plain object of unwrapped values and update access timestamp', () => {
      const container = new ContextContainer({}, {}, { recordAccess: true });
      const mockInternalItem = ContextItem.mock.results[0].value;
      const item1 = new ContextItem(10);
      Object.defineProperty(item1, 'value', {
        get: vi.fn(() => 10),
        configurable: true
      });
      const item2 = new ContextItem({ nested: 20 });
      Object.defineProperty(item2, 'value', {
        get: vi.fn(() => ({ nested: 20 })),
        configurable: true
      });
      container._setManagedItem('a', item1);
      container._setManagedItem('b', item2);

      expect(container.value).toEqual({ a: 10, b: { nested: 20 } });
      expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalled();
    });
  });

  describe('value (setter)', () => {
    it('should clear existing items and set new items from object, then update timestamps', () => {
      const container = new ContextContainer();
      const mockInternalItem = ContextItem.mock.results[0].value;
      container._setManagedItem('old', new ContextItem('oldValue'));
      vi.spyOn(container, 'clearItems');
      vi.spyOn(container, 'setItem').mockReturnValue(container);

      const newItems = { a: 1, b: 'two' };
      container.value = newItems;

      expect(container.clearItems).toHaveBeenCalled();
      expect(container.setItem).toHaveBeenCalledWith('a', 1);
      expect(container.setItem).toHaveBeenCalledWith('b', 'two');
      expect(mockInternalItem._updateModificationTimestamps).toHaveBeenCalled();
    });

    it('should throw TypeError if new value is not an object', () => {
      const container = new ContextContainer();
      expect(() => { container.value = null; }).toThrow(TypeError);
      expect(() => { container.value = 'string'; }).toThrow(TypeError);
    });
  });

  describe('reinitialize', () => {
    it('should call internal item reinitialize, update options, clear and repopulate items', () => {
      const container = new ContextContainer({ old: 'val' }, { oldMeta: true }, { recordAccess: false });
      const mockInternalItem = ContextItem.mock.results[0].value;
      vi.spyOn(container, 'setItem').mockReturnThis();

      const newInitialItems = { item1: 'value1' };
      const newMetadata = { newMeta: true };
      const newOptions = {
        recordAccess: true, recordAccessForMetadata: true,
        defaultItemWrapPrimitives: false, defaultItemWrapAs: "ContextContainer",
        defaultItemRecordAccess: false, defaultItemRecordAccessForMetadata: true,
      };

      container.reinitialize(newInitialItems, newMetadata, newOptions);

      expect(mockInternalItem.reinitialize).toHaveBeenCalledWith(undefined, newMetadata, { recordAccess: true, recordAccessForMetadata: true });

      const defaultOpts = container._getDefaultItemOptions();
      expect(defaultOpts.wrapPrimitives).toBe(false);
      expect(defaultOpts.wrapAs).toBe("ContextContainer");

      expect(container.setItem).toHaveBeenCalledWith('item1', 'value1');
    });

    it('should reinitialize with a single non-plain object value', () => {
      const container = new ContextContainer();
      vi.spyOn(container, 'setItem').mockReturnThis();
      container.reinitialize('single');
      expect(container.setItem).toHaveBeenCalledWith('default', 'single');
    });
  });

  describe('clear', () => {
    it('should call clearItems and internal item clear', () => {
      const container = new ContextContainer();
      const mockInternalItem = ContextItem.mock.results[0].value;
      vi.spyOn(container, 'clearItems').mockImplementation();

      container.clear();
      expect(container.clearItems).toHaveBeenCalled();
      expect(mockInternalItem.clear).toHaveBeenCalled();
    });
  });

  describe('isContextContainer getter', () => {
    it('should return true for duck typing purposes', () => {
      const container = new ContextContainer();
      expect(container.isContextContainer).toBe(true);
    });

    it('should be read-only (attempting to set should not change the value)', () => {
      const container = new ContextContainer();
      // Attempt to override the getter (should not work due to private property)
      expect(() => { container.isContextContainer = false; }).toThrow(TypeError);
    });

    it('should enable duck typing identification', () => {
      const container = new ContextContainer();
      const isContainer = container.isContextContainer === true;
      expect(isContainer).toBe(true);
    });
  });

  describe('_updateAccessTimestamp', () => {
    it('should call internal _updateAccessTimestamp with provided date', () => {
      const container = new ContextContainer();
      const mockInternalItem = ContextItem.mock.results[0].value;
      const customDate = new Date('2025-01-01T12:00:00.000Z');
      container._updateAccessTimestamp(customDate);
      expect(mockInternalItem._updateAccessTimestamp).toHaveBeenCalledWith(customDate);
    });

    it('should call internal _updateAccessTimestamp with default date if none provided', () => {
      const container = new ContextContainer();
      const mockInternalItem = ContextItem.mock.results[0].value;
      container._updateAccessTimestamp();
      const calledWith = mockInternalItem._updateAccessTimestamp.mock.calls[0][0];
      expect(dayjs(calledWith).isSame(MOCK_DATE)).toBe(true);
    });
  });

  describe('_updateModificationTimestamps', () => {
    it('should call internal _updateModificationTimestamps with provided date', () => {
      const container = new ContextContainer();
      const mockInternalItem = ContextItem.mock.results[0].value;
      const customDate = new Date('2025-01-01T12:00:00.000Z');
      container._updateModificationTimestamps(customDate);
      const calledWith = mockInternalItem._updateModificationTimestamps.mock.calls[0][0];
      expect(dayjs(calledWith).isSame(customDate)).toBe(true);
    });

    it('should call internal _updateModificationTimestamps with default date if none provided', () => {
      const container = new ContextContainer();
      const mockInternalItem = ContextItem.mock.results[0].value;
      container._updateModificationTimestamps();
      const calledWith = mockInternalItem._updateModificationTimestamps.mock.calls[0][0];
      expect(dayjs(calledWith).isSame(MOCK_DATE)).toBe(true);
    });
  });
});