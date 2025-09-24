/**
 * @file contextValueWrapper.unit.test.mjs
 * @description Unit tests for the ContextValueWrapper class.
 * @path src/contexts/helpers/contextValueWrapper.unit.test.mjs

 */

import { ContextValueWrapper } from './contextValueWrapper.mjs';
import { ContextItem } from './contextItem.mjs';
import { ContextContainer } from './contextContainer.mjs';

describe('ContextValueWrapper', () => {
  describe('_normalizeWrapAsValue', () => {
    it('should normalize case-insensitive string values correctly', () => {
      expect(ContextValueWrapper._normalizeWrapAsValue('contextitem')).toBe('ContextItem');
      expect(ContextValueWrapper._normalizeWrapAsValue('CONTEXTITEM')).toBe('ContextItem');
      expect(ContextValueWrapper._normalizeWrapAsValue('CoNtExTiTeM')).toBe('ContextItem');
      expect(ContextValueWrapper._normalizeWrapAsValue('contextcontainer')).toBe('ContextContainer');
      expect(ContextValueWrapper._normalizeWrapAsValue('CONTEXTCONTAINER')).toBe('ContextContainer');
      expect(ContextValueWrapper._normalizeWrapAsValue('CoNtExTcOnTaInEr')).toBe('ContextContainer');
    });

    it('should return original value for already correct casing', () => {
      expect(ContextValueWrapper._normalizeWrapAsValue('ContextItem')).toBe('ContextItem');
      expect(ContextValueWrapper._normalizeWrapAsValue('ContextContainer')).toBe('ContextContainer');
    });

    it('should return original value for non-matching strings', () => {
      expect(ContextValueWrapper._normalizeWrapAsValue('InvalidOption')).toBe('InvalidOption');
      expect(ContextValueWrapper._normalizeWrapAsValue('')).toBe('');
      expect(ContextValueWrapper._normalizeWrapAsValue('random')).toBe('random');
    });

    it('should return original value for non-string inputs', () => {
      expect(ContextValueWrapper._normalizeWrapAsValue(null)).toBe(null);
      expect(ContextValueWrapper._normalizeWrapAsValue(undefined)).toBe(undefined);
      expect(ContextValueWrapper._normalizeWrapAsValue(123)).toBe(123);
      expect(ContextValueWrapper._normalizeWrapAsValue({})).toEqual({});
    });
  });

  describe('_validateWrapOptions', () => {
    it('should return normalized value for valid wrapAs options', () => {
      expect(ContextValueWrapper._validateWrapOptions('ContextItem')).toBe('ContextItem');
      expect(ContextValueWrapper._validateWrapOptions('ContextContainer')).toBe('ContextContainer');
    });

    it('should return normalized value for case-insensitive valid options', () => {
      expect(ContextValueWrapper._validateWrapOptions('contextitem')).toBe('ContextItem');
      expect(ContextValueWrapper._validateWrapOptions('CONTEXTITEM')).toBe('ContextItem');
      expect(ContextValueWrapper._validateWrapOptions('contextcontainer')).toBe('ContextContainer');
      expect(ContextValueWrapper._validateWrapOptions('CONTEXTCONTAINER')).toBe('ContextContainer');
    });

    it('should throw TypeError for invalid wrapAs options with improved error message', () => {
      expect(() => ContextValueWrapper._validateWrapOptions('InvalidOption')).toThrow(
        TypeError('Invalid value for wrapAs: InvalidOption. Must be "ContextItem" or "ContextContainer" (case-insensitive).')
      );
      expect(() => ContextValueWrapper._validateWrapOptions('')).toThrow(TypeError);
      expect(() => ContextValueWrapper._validateWrapOptions(null)).toThrow(TypeError);
      expect(() => ContextValueWrapper._validateWrapOptions(undefined)).toThrow(TypeError);
    });
  });

  describe('_handleExistingInstance', () => {
    it('should return ContextItem instance when passed', () => {
      const contextItem = new ContextItem('test');
      const result = ContextValueWrapper._handleExistingInstance(contextItem);
      expect(result).toBe(contextItem);
    });

    it('should return ContextContainer instance when passed', () => {
      const contextContainer = new ContextContainer({});
      const result = ContextValueWrapper._handleExistingInstance(contextContainer);
      expect(result).toBe(contextContainer);
    });

    it('should return null for non-context instances', () => {
      expect(ContextValueWrapper._handleExistingInstance('string')).toBeNull();
      expect(ContextValueWrapper._handleExistingInstance(123)).toBeNull();
      expect(ContextValueWrapper._handleExistingInstance({})).toBeNull();
      expect(ContextValueWrapper._handleExistingInstance([])).toBeNull();
      expect(ContextValueWrapper._handleExistingInstance(null)).toBeNull();
      expect(ContextValueWrapper._handleExistingInstance(undefined)).toBeNull();
    });
  });

  describe('_handlePrimitiveValue', () => {
    it('should return primitive values when wrapPrimitives is false', () => {
      expect(ContextValueWrapper._handlePrimitiveValue('string', false)).toBe('string');
      expect(ContextValueWrapper._handlePrimitiveValue(123, false)).toBe(123);
      expect(ContextValueWrapper._handlePrimitiveValue(true, false)).toBe(true);
      expect(ContextValueWrapper._handlePrimitiveValue(null, false)).toBe(null);
      expect(ContextValueWrapper._handlePrimitiveValue(undefined, false)).toBe(undefined);
    });

    it('should throw TypeError for objects/functions when wrapPrimitives is false', () => {
      expect(() => ContextValueWrapper._handlePrimitiveValue({}, false)).toThrow(TypeError);
      expect(() => ContextValueWrapper._handlePrimitiveValue([], false)).toThrow(TypeError);
      expect(() => ContextValueWrapper._handlePrimitiveValue(() => {}, false)).toThrow(TypeError);
    });

    it('should return undefined when wrapPrimitives is true', () => {
      expect(ContextValueWrapper._handlePrimitiveValue('string', true)).toBeUndefined();
      expect(ContextValueWrapper._handlePrimitiveValue({}, true)).toBeUndefined();
      expect(ContextValueWrapper._handlePrimitiveValue([], true)).toBeUndefined();
    });
  });

  describe('_createNewInstance', () => {
    it('should create ContextItem when wrapAs is "ContextItem"', () => {
      const result = ContextValueWrapper._createNewInstance(
        'test',
        'ContextItem',
        { key: 'value' },
        { recordAccess: false },
        {}
      );
      expect(result).toBeInstanceOf(ContextItem);
    });

    it('should create ContextContainer when wrapAs is "ContextContainer"', () => {
      const result = ContextValueWrapper._createNewInstance(
        {},
        'ContextContainer',
        { key: 'value' },
        {},
        { recordAccess: false }
      );
      expect(result).toBeInstanceOf(ContextContainer);
    });
  });

  describe('wrap', () => {
    it('should return existing ContextItem instance unchanged', () => {
      const existingItem = new ContextItem('test');
      const result = ContextValueWrapper.wrap(existingItem);
      expect(result).toBe(existingItem);
    });

    it('should return existing ContextContainer instance unchanged', () => {
      const existingContainer = new ContextContainer({});
      const result = ContextValueWrapper.wrap(existingContainer);
      expect(result).toBe(existingContainer);
    });

    it('should return primitives unchanged when wrapPrimitives is false', () => {
      expect(ContextValueWrapper.wrap('test', { wrapPrimitives: false })).toBe('test');
      expect(ContextValueWrapper.wrap(123, { wrapPrimitives: false })).toBe(123);
      expect(ContextValueWrapper.wrap(true, { wrapPrimitives: false })).toBe(true);
      expect(ContextValueWrapper.wrap(null, { wrapPrimitives: false })).toBe(null);
    });

    it('should throw TypeError for objects when wrapPrimitives is false', () => {
      expect(() => ContextValueWrapper.wrap({}, { wrapPrimitives: false })).toThrow(TypeError);
      expect(() => ContextValueWrapper.wrap([], { wrapPrimitives: false })).toThrow(TypeError);
    });

    it('should create ContextItem by default', () => {
      const result = ContextValueWrapper.wrap('test');
      expect(result).toBeInstanceOf(ContextItem);
    });

    it('should create ContextContainer when wrapAs is "ContextContainer"', () => {
      const result = ContextValueWrapper.wrap({}, { wrapAs: 'ContextContainer' });
      expect(result).toBeInstanceOf(ContextContainer);
    });

    it('should create ContextContainer when wrapAs is "ContextContainer" with case variations', () => {
      expect(ContextValueWrapper.wrap({}, { wrapAs: 'contextcontainer' })).toBeInstanceOf(ContextContainer);
      expect(ContextValueWrapper.wrap({}, { wrapAs: 'CONTEXTCONTAINER' })).toBeInstanceOf(ContextContainer);
      expect(ContextValueWrapper.wrap({}, { wrapAs: 'CoNtExTcOnTaInEr' })).toBeInstanceOf(ContextContainer);
    });

    it('should create ContextItem when wrapAs is "ContextItem" with case variations', () => {
      expect(ContextValueWrapper.wrap('test', { wrapAs: 'contextitem' })).toBeInstanceOf(ContextItem);
      expect(ContextValueWrapper.wrap('test', { wrapAs: 'CONTEXTITEM' })).toBeInstanceOf(ContextItem);
      expect(ContextValueWrapper.wrap('test', { wrapAs: 'CoNtExTiTeM' })).toBeInstanceOf(ContextItem);
    });

    it('should throw TypeError for invalid wrapAs option with improved error message', () => {
      expect(() => ContextValueWrapper.wrap('test', { wrapAs: 'Invalid' })).toThrow(
        TypeError('Invalid value for wrapAs: Invalid. Must be "ContextItem" or "ContextContainer" (case-insensitive).')
      );
    });

    it('should pass options correctly to ContextItem', () => {
      const metadata = { key: 'value' };
      const result = ContextValueWrapper.wrap('test', {
        wrapAs: 'ContextItem',
        recordAccess: false,
        recordAccessForMetadata: true,
        metadata
      });
      expect(result).toBeInstanceOf(ContextItem);
      // Note: We would need access to internal properties to fully test option passing
    });

    it('should pass options correctly to ContextContainer', () => {
      const metadata = { key: 'value' };
      const containerOptions = {
        recordAccess: false,
        recordAccessForMetadata: true,
        defaultItemWrapPrimitives: false,
        defaultItemWrapAs: 'ContextContainer',
        defaultItemRecordAccess: false,
        defaultItemRecordAccessForMetadata: true
      };
      const result = ContextValueWrapper.wrap({}, {
        wrapAs: 'ContextContainer',
        metadata,
        containerOptions
      });
      expect(result).toBeInstanceOf(ContextContainer);
    });

    it('should work with default options when no options provided', () => {
      const result = ContextValueWrapper.wrap('test');
      expect(result).toBeInstanceOf(ContextItem);
    });

    it('should work with partial options', () => {
      const result = ContextValueWrapper.wrap('test', { wrapAs: 'ContextItem' });
      expect(result).toBeInstanceOf(ContextItem);
    });

    it('should handle complex objects', () => {
      const complexObject = { nested: { prop: 'value' }, array: [1, 2, 3] };
      const result = ContextValueWrapper.wrap(complexObject);
      expect(result).toBeInstanceOf(ContextItem);
    });

    it('should handle functions', () => {
      const testFunction = () => 'test';
      const result = ContextValueWrapper.wrap(testFunction);
      expect(result).toBeInstanceOf(ContextItem);
    });
  });
});