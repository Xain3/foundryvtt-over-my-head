/**
 * @file static.unit.test.js
 * @description This file contains unit tests for the StaticUtils class.
 * @path src/utils/static/static.unit.test.js
 */

import StaticUtils from './static.js';
import { Validator } from './validator.js';
import Unpacker from './unpacker.js';
import GameManager from './gameManager.js';

describe('StaticUtils', () => {
  describe('Class Properties', () => {
    it('should expose Validator class', () => {
      expect(StaticUtils.Validator).toBe(Validator);
    });

    it('should expose Unpacker class', () => {
      expect(StaticUtils.Unpacker).toBe(Unpacker);
    });

    it('should expose GameManager class', () => {
      expect(StaticUtils.GameManager).toBe(GameManager);
    });
  });

  describe('validate method', () => {
    it('should proxy to Validator.validate for type checking', () => {
      const result = StaticUtils.validate('isString', { value: 'hello' });
      expect(result).toBe(true);
    });

    it('should proxy to Validator.validate for validation with error throwing', () => {
      expect(() => StaticUtils.validate('validateString', {
        value: 123,
        name: 'testValue'
      })).toThrow('testValue must be a string');
    });

    it('should handle validation with options', () => {
      const result = StaticUtils.validate('isNumber', {
        value: 42,
        options: { integer: true, positive: true }
      });
      expect(result).toBe(true);
    });

    it('should handle missing arguments gracefully', () => {
      const result = StaticUtils.validate('isDefined');
      expect(result).toBe(false); // undefined value
    });
  });

  describe('unpack method', () => {
    let instance;

    beforeEach(() => {
      instance = {};
    });

    it('should unpack object properties onto instance', () => {
      const data = { title: 'Test', version: '1.0.0', active: true };
      StaticUtils.unpack(data, instance);

      expect(instance.title).toBe('Test');
      expect(instance.version).toBe('1.0.0');
      expect(instance.active).toBe(true);
    });

    it('should handle custom object name parameter', () => {
      const data = { foo: 'bar' };
      expect(() => StaticUtils.unpack(data, instance, 'customObject')).not.toThrow();
      expect(instance.foo).toBe('bar');
    });

    it('should throw for invalid inputs', () => {
      expect(() => StaticUtils.unpack(null, instance)).toThrow();
      expect(() => StaticUtils.unpack({}, null)).toThrow();
    });

    it('should handle symbol keys', () => {
      const sym = Symbol('test');
      const data = { [sym]: 'symbolValue', normalKey: 'normalValue' };

      StaticUtils.unpack(data, instance);

      expect(instance[sym]).toBe('symbolValue');
      expect(instance.normalKey).toBe('normalValue');
    });
  });

  describe('GameManager proxy methods', () => {
    let originalGame;
    let mockModule;

    beforeEach(() => {
      originalGame = globalThis.game;
      mockModule = { id: 'test-module', customData: { test: true } };
      globalThis.game = {
        modules: {
          get: jest.fn((id) => id === 'test-module' ? mockModule : null)
        }
      };
    });

    afterEach(() => {
      globalThis.game = originalGame;
    });

    it('should proxy getModuleObject to GameManager', () => {
      const result = StaticUtils.getModuleObject('test-module');
      expect(result).toBe(mockModule);
    });

    it('should proxy writeToModuleObject to GameManager', () => {
      const result = StaticUtils.writeToModuleObject('test-module', 'newKey', 'newValue');
      expect(result).toBe(true);
      expect(mockModule.newKey).toBe('newValue');
    });

    it('should proxy readFromModuleObject to GameManager', () => {
      const result = StaticUtils.readFromModuleObject('test-module', 'customData');
      expect(result).toEqual({ test: true });
    });

    it('should handle manifest objects in proxy methods', () => {
      const manifest = { id: 'test-module' };
      const result = StaticUtils.getModuleObject(manifest);
      expect(result).toBe(mockModule);
    });
  });

  describe('getAvailableValidationTypes method', () => {
    it('should return array of validation type names', () => {
      const types = StaticUtils.getAvailableValidationTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);

      // Check for some expected types
      expect(types).toContain('isString');
      expect(types).toContain('isNumber');
      expect(types).toContain('validateObject');
      expect(types).toContain('validateString');
    });

    it('should include both check and validate methods', () => {
      const types = StaticUtils.getAvailableValidationTypes();

      // Check methods (return boolean)
      expect(types).toContain('isDefined');
      expect(types).toContain('isBoolean');

      // Validate methods (throw on failure)
      expect(types).toContain('validateNumber');
      expect(types).toContain('validateDate');
    });
  });

  describe('getUtilityInfo method', () => {
    it('should return utility information object', () => {
      const info = StaticUtils.getUtilityInfo();

      expect(typeof info).toBe('object');
      expect(info).toHaveProperty('utilities');
      expect(info).toHaveProperty('description');
      expect(info).toHaveProperty('version');
    });

    it('should list available utilities', () => {
      const info = StaticUtils.getUtilityInfo();

      expect(Array.isArray(info.utilities)).toBe(true);
      expect(info.utilities).toContain('Validator');
      expect(info.utilities).toContain('Unpacker');
      expect(info.utilities).toContain('GameManager');
    });

    it('should have descriptive information', () => {
      const info = StaticUtils.getUtilityInfo();

      expect(typeof info.description).toBe('string');
      expect(info.description.length).toBeGreaterThan(0);
      expect(typeof info.version).toBe('string');
      expect(info.version).toMatch(/^\d+\.\d+\.\d+$/); // semver pattern
    });
  });

  describe('Integration Tests', () => {
    it('should work as unified interface for common validation tasks', () => {
      const testData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        active: true
      };

      // Validate individual properties
      expect(StaticUtils.validate('isString', { value: testData.name })).toBe(true);
      expect(StaticUtils.validate('isNumber', { value: testData.age })).toBe(true);
      expect(StaticUtils.validate('isBoolean', { value: testData.active })).toBe(true);

      // Validate with constraints
      expect(() => StaticUtils.validate('validateNumber', {
        value: testData.age,
        name: 'age',
        options: { min: 0, max: 150 }
      })).not.toThrow();

      // Unpack to instance
      const instance = {};
      StaticUtils.unpack(testData, instance, 'userData');

      expect(instance.name).toBe(testData.name);
      expect(instance.age).toBe(testData.age);
      expect(instance.email).toBe(testData.email);
      expect(instance.active).toBe(testData.active);
    });

    it('should provide consistent error handling across utilities', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Validation error
      expect(() => StaticUtils.validate('validateString', {
        value: 123,
        name: 'testValue'
      })).toThrow();

      // Unpacking error
      expect(() => StaticUtils.unpack(42, {}, 'invalidData')).toThrow();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid validation types gracefully', () => {
      expect(() => StaticUtils.validate('nonExistentType', { value: 'test' }))
        .toThrow('Unsupported validation type');
    });

    it('should preserve original error messages and context', () => {
      try {
        StaticUtils.validate('validateString', { value: null, name: 'testField' });
      } catch (error) {
        expect(error.message).toContain('testField');
        expect(error.message).toContain('string');
      }
    });
  });
});
