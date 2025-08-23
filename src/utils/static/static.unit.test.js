/**
 * @file static.unit.test.js
 * @description This file contains unit tests for the StaticUtils class.
 * @path src/utils/static/static.unit.test.js
 */

import StaticUtils from './static.js';
import Validator from './validator.js';
import Unpacker from './unpacker.js';
import GameManager from './gameManager.js';
import ErrorFormatter from './errorFormatter.js';
import Localizer from './localizer.js';
import HooksLogger from './hooksLogger.js';

describe('StaticUtils', () => {
  describe('Class Properties', () => {
    it('should expose ErrorFormatter class', () => {
      expect(StaticUtils.ErrorFormatter).toBe(ErrorFormatter);
    });

    it('should expose Validator class', () => {
      expect(StaticUtils.Validator).toBe(Validator);
    });

    it('should expose Unpacker class', () => {
      expect(StaticUtils.Unpacker).toBe(Unpacker);
    });

    it('should expose GameManager class', () => {
      expect(StaticUtils.GameManager).toBe(GameManager);
    });

    it('should expose Localizer class', () => {
      expect(StaticUtils.Localizer).toBe(Localizer);
    });

    it('should expose HooksLogger class', () => {
      expect(StaticUtils.HooksLogger).toBe(HooksLogger);
    });
  });

  describe('formatError method', () => {
    it('should proxy to ErrorFormatter.formatError with default options', () => {
      const error = new Error('Test error');
      const result = StaticUtils.formatError(error);
      expect(typeof result).toBe('string');
      expect(result).toContain('Test error');
    });

    it('should handle formatError with options', () => {
      const error = new Error('Test error with stack');
      const result = StaticUtils.formatError(error, {
        includeStack: true,
        includeCaller: true,
        caller: 'testFunction'
      });
      expect(typeof result).toBe('string');
      expect(result).toContain('Test error with stack');
    });

    it('should handle non-Error objects', () => {
  const result = StaticUtils.formatError('not an error');
  expect(typeof result).toBe('string');
  expect(result).toContain('not an error');
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
        },
        settings: {
          get: jest.fn((moduleId, key) => {
            if (moduleId === 'test-module' && key === 'testSetting') {
              return 'testValue';
            }
            return undefined;
          })
        }
      };
    });

    afterEach(() => {
      globalThis.game = originalGame;
    });

    it('should proxy getSetting to GameManager', () => {
      const result = StaticUtils.getSetting('test-module', 'testSetting');
      expect(result).toBe('testValue');
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

  describe('Localizer proxy methods', () => {
    let originalGame;
    let mockI18n;

    beforeEach(() => {
      originalGame = globalThis.game;
      mockI18n = {
        localize: jest.fn((key) => {
          const translations = {
            'TEST.welcome': 'Welcome',
            'TEST.greeting': 'Hello {name}!',
            'TEST.playerCount': 'Players: {count}',
            'TEST.missing': 'TEST.missing'
          };
          return translations[key] || key;
        }),
        format: jest.fn((key, data = {}) => {
          const template = mockI18n.localize(key);
          return template.replace(/{(\w+)}/g, (match, prop) => data[prop] || match);
        }),
        has: jest.fn((key) => {
          const existingKeys = ['TEST.welcome', 'TEST.greeting', 'TEST.playerCount'];
          return existingKeys.includes(key);
        })
      };
      globalThis.game = { i18n: mockI18n };
    });

    afterEach(() => {
      globalThis.game = originalGame;
    });

    it('should proxy localize to Localizer.localize', () => {
      const result = StaticUtils.localize('TEST.welcome');
      expect(result).toBe('Welcome');
      expect(mockI18n.localize).toHaveBeenCalledWith('TEST.welcome');
    });

    it('should handle localize with custom i18n instance', () => {
      const customI18n = {
        localize: jest.fn(() => 'Custom Translation')
      };

      const result = StaticUtils.localize('TEST.custom', customI18n);
      expect(result).toBe('Custom Translation');
      expect(customI18n.localize).toHaveBeenCalledWith('TEST.custom');
    });

    it('should proxy formatLocalized to Localizer.format with default data', () => {
      const result = StaticUtils.formatLocalized('TEST.greeting');
      expect(result).toBe('Hello {name}!');
      expect(mockI18n.format).toHaveBeenCalledWith('TEST.greeting', {});
    });

    it('should proxy formatLocalized to Localizer.format with data substitution', () => {
      const result = StaticUtils.formatLocalized('TEST.greeting', { name: 'Player' });
      expect(result).toBe('Hello Player!');
      expect(mockI18n.format).toHaveBeenCalledWith('TEST.greeting', { name: 'Player' });
    });

    it('should handle formatLocalized with custom i18n instance', () => {
      const customI18n = {
        format: jest.fn(() => 'Custom Formatted Text')
      };

      const result = StaticUtils.formatLocalized('TEST.custom', { value: 42 }, customI18n);
      expect(result).toBe('Custom Formatted Text');
      expect(customI18n.format).toHaveBeenCalledWith('TEST.custom', { value: 42 });
    });

    it('should proxy hasLocalization to Localizer.has', () => {
      const existingResult = StaticUtils.hasLocalization('TEST.welcome');
      expect(existingResult).toBe(true);
      expect(mockI18n.has).toHaveBeenCalledWith('TEST.welcome');

      const missingResult = StaticUtils.hasLocalization('TEST.nonexistent');
      expect(missingResult).toBe(false);
      expect(mockI18n.has).toHaveBeenCalledWith('TEST.nonexistent');
    });

    it('should handle hasLocalization with custom i18n instance', () => {
      const customI18n = {
        has: jest.fn(() => true)
      };

      const result = StaticUtils.hasLocalization('TEST.custom', customI18n);
      expect(result).toBe(true);
      expect(customI18n.has).toHaveBeenCalledWith('TEST.custom');
    });

    it('should handle error cases when no i18n instance is available', () => {
      globalThis.game = {};

      expect(() => StaticUtils.localize('TEST.key')).toThrow();
      expect(() => StaticUtils.formatLocalized('TEST.key', {})).toThrow();

      // hasLocalization returns false instead of throwing when no i18n is available
      expect(StaticUtils.hasLocalization('TEST.key')).toBe(false);
    });

    it('should work in integration with other proxy methods', () => {
      // Test that localization works alongside other utilities
      const moduleData = { name: 'Test Module', version: '1.0.0' };
      const instance = {};

      // Unpack data
      StaticUtils.unpack(moduleData, instance);

      // Localize a message
      const welcomeMsg = StaticUtils.localize('TEST.welcome');

      // Format a localized message with unpacked data
      const greeting = StaticUtils.formatLocalized('TEST.greeting', { name: instance.name });

      expect(instance.name).toBe('Test Module');
      expect(welcomeMsg).toBe('Welcome');
      expect(greeting).toBe('Hello Test Module!');
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
      expect(info.utilities).toContain('ErrorFormatter');
      expect(info.utilities).toContain('Localizer');
      expect(info.utilities).toContain('HooksLogger');
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

  describe('Hook Logging Methods', () => {
    let mockHookFunction;
    let mockLogger;
    let mockProxy;

    beforeEach(() => {
      mockHookFunction = jest.fn();
      mockLogger = jest.fn();
      mockProxy = jest.fn();

      // Mock HooksLogger methods
      HooksLogger.createHookProxy = jest.fn().mockReturnValue(mockProxy);
      HooksLogger.createHookLogger = jest.fn().mockReturnValue(mockLogger);
      HooksLogger.proxyFoundryHooks = jest.fn().mockReturnValue(mockProxy);
    });

    describe('createHookProxy method', () => {
      it('should proxy to HooksLogger.createHookProxy with default options', () => {
        const result = StaticUtils.createHookProxy(mockHookFunction);

        expect(HooksLogger.createHookProxy).toHaveBeenCalledWith(mockHookFunction, {});
        expect(result).toBe(mockProxy);
      });

      it('should proxy to HooksLogger.createHookProxy with custom options', () => {
        const options = {
          logLevel: 'debug',
          prefix: 'Test Hook',
          filter: (hookName) => hookName.startsWith('test')
        };

        const result = StaticUtils.createHookProxy(mockHookFunction, options);

        expect(HooksLogger.createHookProxy).toHaveBeenCalledWith(mockHookFunction, options);
        expect(result).toBe(mockProxy);
      });

      it('should handle undefined hookFunction', () => {
        StaticUtils.createHookProxy(undefined, { logLevel: 'debug' });

        expect(HooksLogger.createHookProxy).toHaveBeenCalledWith(undefined, { logLevel: 'debug' });
      });
    });

    describe('createHookLogger method', () => {
      it('should proxy to HooksLogger.createHookLogger with default parameters', () => {
        const result = StaticUtils.createHookLogger();

        expect(HooksLogger.createHookLogger).toHaveBeenCalledWith('debug', 'Hook Call', null);
        expect(result).toBe(mockLogger);
      });

      it('should proxy to HooksLogger.createHookLogger with custom parameters', () => {
        const logLevel = 'info';
        const prefix = 'Custom Hook';
        const filter = jest.fn();

        const result = StaticUtils.createHookLogger(logLevel, prefix, filter);

        expect(HooksLogger.createHookLogger).toHaveBeenCalledWith(logLevel, prefix, filter);
        expect(result).toBe(mockLogger);
      });

      it('should handle partial parameters', () => {
        const result = StaticUtils.createHookLogger('warn');

        expect(HooksLogger.createHookLogger).toHaveBeenCalledWith('warn', 'Hook Call', null);
        expect(result).toBe(mockLogger);
      });
    });

    describe('proxyFoundryHooks method', () => {
      it('should proxy to HooksLogger.proxyFoundryHooks with default options', () => {
        const result = StaticUtils.proxyFoundryHooks();

        expect(HooksLogger.proxyFoundryHooks).toHaveBeenCalledWith({});
        expect(result).toBe(mockProxy);
      });

      it('should proxy to HooksLogger.proxyFoundryHooks with custom options', () => {
        const options = {
          enabled: true,
          logLevel: 'debug',
          moduleFilter: 'OMH.'
        };

        const result = StaticUtils.proxyFoundryHooks(options);

        expect(HooksLogger.proxyFoundryHooks).toHaveBeenCalledWith(options);
        expect(result).toBe(mockProxy);
      });

      it('should handle null return from HooksLogger', () => {
        HooksLogger.proxyFoundryHooks.mockReturnValue(null);

        const result = StaticUtils.proxyFoundryHooks({ enabled: false });

        expect(result).toBeNull();
      });
    });
  });
});
