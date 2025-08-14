/**
 * @file utils.unit.test.js
 * @description Unit tests for the Utilities class.
 * @path src/utils/utils.unit.test.js
 */

import Utilities, { Utils } from './utils.js';
import StaticUtils from './static/static.js';
import Logger from './logger.js';
import HookFormatter from './hookFormatter.js';
import Initializer from './initializer.js';
import Context from '@contexts/context.js';

// Mock all dependencies
jest.mock('./static/static.js');
jest.mock('./logger.js');
jest.mock('./hookFormatter.js');
jest.mock('./initializer.js');
jest.mock('@contexts/context.js');

describe('Utilities', () => {
  let validConstants;
  let validManifest;
  let mockLogger;
  let mockHookFormatter;
  let mockInitializer;
  let mockFormatError;
  let mockFormatHookName;
  let mockInitializeContextObject;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup valid test data
    validConstants = {
      hooks: {
        'ready': '.ready',
        'init': '.init'
      },
      debug: {
        enabled: true
      }
    };

    validManifest = {
      shortName: 'OMH',
      title: 'Over My Head',
      id: 'test-module',
      version: '1.0.0'
    };

    // Setup mock functions
    mockFormatError = jest.fn((error, options) => `Formatted: ${error.message || error}`);
    mockFormatHookName = jest.fn((hookName) => `OMH${hookName}`);
    mockInitializeContextObject = jest.fn((...args) => ({ initialized: true, args }));

    // Mock StaticUtils
    StaticUtils.formatError = mockFormatError;

    // Mock Logger constructor and methods
    mockLogger = {
      log: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    Logger.mockImplementation(() => mockLogger);

    // Mock HookFormatter constructor and methods
    mockHookFormatter = {
      formatHookName: mockFormatHookName,
      validateHookName: jest.fn()
    };
    HookFormatter.mockImplementation(() => mockHookFormatter);

    // Mock Initializer constructor and methods
    mockInitializer = {
      initializeContextObject: mockInitializeContextObject,
      registerSettings: jest.fn(),
      initialize: jest.fn()
    };
    Initializer.mockImplementation(() => mockInitializer);
  });

  describe('Constructor', () => {
    it('should create a Utilities instance with valid constants and manifest', () => {
      const utilities = new Utilities(validConstants, validManifest);

      expect(utilities).toBeInstanceOf(Utilities);
      expect(utilities.constants).toBe(validConstants);
      expect(utilities.manifest).toBe(validManifest);
      expect(utilities.static).toBe(StaticUtils);
    });

    it('should bind formatError method from StaticUtils', () => {
      const utilities = new Utilities(validConstants, validManifest);

      expect(typeof utilities.formatError).toBe('function');

      const testError = new Error('Test error');
      utilities.formatError(testError);

      expect(mockFormatError).toHaveBeenCalledWith(testError);
    });

    it('should create Logger instance with correct dependencies', () => {
      new Utilities(validConstants, validManifest);

      expect(Logger).toHaveBeenCalledWith(
        validConstants,
        validManifest,
        expect.any(Function) // formatError bound function
      );
    });

    it('should create HookFormatter instance with correct dependencies', () => {
      new Utilities(validConstants, validManifest);

      expect(HookFormatter).toHaveBeenCalledWith(
        validConstants,
        validManifest,
        expect.any(Function) // formatError bound function
      );
    });

    it('should create Initializer instance with correct dependencies', () => {
      new Utilities(validConstants, validManifest);

      expect(Initializer).toHaveBeenCalledWith(
        validConstants,
        validManifest,
        mockLogger,
  expect.any(Function), // formatError bound function
  expect.any(Function), // formatHook (hookFormatter.formatHookName)
  Context
      );
    });

    it('should bind convenience methods correctly', () => {
      const utilities = new Utilities(validConstants, validManifest);

      expect(typeof utilities.formatHookName).toBe('function');
      expect(typeof utilities.initializeContext).toBe('function');
    });
  });

  describe('Convenience Methods', () => {
    let utilities;

    beforeEach(() => {
      utilities = new Utilities(validConstants, validManifest);
    });

    describe('formatHookName', () => {
      it('should proxy to hookFormatter.formatHookName', () => {
        const hookName = 'ready';
        const result = utilities.formatHookName(hookName);

        expect(mockFormatHookName).toHaveBeenCalledWith(hookName);
        expect(result).toBe('OMHready');
      });

      it('should maintain proper binding context', () => {
        const hookName = 'init';
        utilities.formatHookName(hookName);

        expect(mockFormatHookName).toHaveBeenCalledWith(hookName);
        // Verify the method was called
        expect(HookFormatter).toHaveBeenCalled();
      });

      it('should handle different hook names', () => {
        const hookNames = ['ready', 'init', 'render', 'close'];

        hookNames.forEach(hookName => {
          utilities.formatHookName(hookName);
        });

        expect(mockFormatHookName).toHaveBeenCalledTimes(hookNames.length);
        hookNames.forEach(hookName => {
          expect(mockFormatHookName).toHaveBeenCalledWith(hookName);
        });
      });
    });

    describe('initializeContext', () => {
      it('should proxy to initializer.initializeContextObject', () => {
        const contextData = { test: 'data' };
        const result = utilities.initializeContext(contextData);

        expect(mockInitializeContextObject).toHaveBeenCalledWith(contextData);
        expect(result).toEqual({ initialized: true, args: [contextData] });
      });

      it('should maintain proper binding context', () => {
        const contextData = { test: 'data' };
        utilities.initializeContext(contextData);

        expect(mockInitializeContextObject).toHaveBeenCalledWith(contextData);
        // Verify the initializer was created
        expect(Initializer).toHaveBeenCalled();
      });

      it('should handle empty context data', () => {
        utilities.initializeContext();

        expect(mockInitializeContextObject).toHaveBeenCalledWith();
      });
    });
  });

  describe('Property Access', () => {
    let utilities;

    beforeEach(() => {
      utilities = new Utilities(validConstants, validManifest);
    });

    it('should provide access to constants', () => {
      expect(utilities.constants).toBe(validConstants);
      expect(utilities.constants.hooks).toEqual(validConstants.hooks);
    });

    it('should provide access to manifest', () => {
      expect(utilities.manifest).toBe(validManifest);
      expect(utilities.manifest.shortName).toBe('OMH');
    });

    it('should provide access to static utilities', () => {
      expect(utilities.static).toBe(StaticUtils);
    });

    it('should provide access to logger instance', () => {
      expect(utilities.logger).toBe(mockLogger);
    });

    it('should provide access to hookFormatter instance', () => {
      expect(utilities.hookFormatter).toBe(mockHookFormatter);
    });

    it('should provide access to initializer instance', () => {
      expect(utilities.initializer).toBe(mockInitializer);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in formatError method', () => {
      const utilities = new Utilities(validConstants, validManifest);
      const testError = new Error('Test error message');

      mockFormatError.mockReturnValue('Formatted error message');

      const result = utilities.formatError(testError);

      expect(mockFormatError).toHaveBeenCalledWith(testError);
      expect(result).toBe('Formatted error message');
    });

    it('should pass through formatError options', () => {
      const utilities = new Utilities(validConstants, validManifest);
      const testError = new Error('Test error');
      const options = { includeStack: true, includeCaller: true, caller: 'testMethod' };

      utilities.formatError(testError, options);

      expect(mockFormatError).toHaveBeenCalledWith(testError, options);
    });
  });

  describe('Integration', () => {
    it('should create a fully functional utilities instance', () => {
      const utilities = new Utilities(validConstants, validManifest);

      // Verify all components are properly initialized
      expect(utilities.constants).toBeDefined();
      expect(utilities.manifest).toBeDefined();
      expect(utilities.static).toBeDefined();
      expect(utilities.logger).toBeDefined();
      expect(utilities.hookFormatter).toBeDefined();
      expect(utilities.initializer).toBeDefined();
      expect(utilities.formatError).toBeDefined();
      expect(utilities.formatHookName).toBeDefined();
      expect(utilities.initializeContext).toBeDefined();
    });

    it('should maintain consistent interface across methods', () => {
      const utilities = new Utilities(validConstants, validManifest);

      // Test that all methods are functions
      expect(typeof utilities.formatError).toBe('function');
      expect(typeof utilities.formatHookName).toBe('function');
      expect(typeof utilities.initializeContext).toBe('function');

      // Test that bound methods work correctly
      const formatError = utilities.formatError;
      const formatHookName = utilities.formatHookName;
      const initializeContext = utilities.initializeContext;

      formatError(new Error('test'));
      formatHookName('ready');
      initializeContext({ test: true });

      expect(mockFormatError).toHaveBeenCalled();
      expect(mockFormatHookName).toHaveBeenCalled();
      expect(mockInitializeContextObject).toHaveBeenCalled();
    });

    it('should pass formatError to all dependent classes', () => {
      new Utilities(validConstants, validManifest);

      // Verify formatError was passed to Logger
      expect(Logger).toHaveBeenCalledWith(
        validConstants,
        validManifest,
        expect.any(Function)
      );

      // Verify formatError was passed to HookFormatter
      expect(HookFormatter).toHaveBeenCalledWith(
        validConstants,
        validManifest,
        expect.any(Function)
      );

      // Verify formatError was passed to Initializer
      expect(Initializer).toHaveBeenCalledWith(
        validConstants,
        validManifest,
        mockLogger,
  expect.any(Function),
  expect.any(Function),
  Context
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined constants gracefully', () => {
      expect(() => {
        new Utilities(undefined, validManifest);
      }).not.toThrow();
    });

    it('should handle undefined manifest gracefully', () => {
      expect(() => {
        new Utilities(validConstants, undefined);
      }).not.toThrow();
    });

    it('should handle both undefined constants and manifest', () => {
      expect(() => {
        new Utilities(undefined, undefined);
      }).not.toThrow();
    });

    it('should handle null values', () => {
      expect(() => {
        new Utilities(null, null);
      }).not.toThrow();
    });
  });

  describe('Method Binding', () => {
    it('should maintain proper this context for bound methods', () => {
      const utilities = new Utilities(validConstants, validManifest);

      // Extract methods to test binding
      const { formatError, formatHookName, initializeContext } = utilities;

      // Call methods without utilities context
      formatError(new Error('test'));
      formatHookName('ready');
      initializeContext({ test: true });

      // Verify methods still work correctly
      expect(mockFormatError).toHaveBeenCalled();
      expect(mockFormatHookName).toHaveBeenCalled();
      expect(mockInitializeContextObject).toHaveBeenCalled();
    });

    it('should allow method assignment to variables', () => {
      const utilities = new Utilities(validConstants, validManifest);

      const formatHook = utilities.formatHookName;
      const initCtx = utilities.initializeContext;

      expect(typeof formatHook).toBe('function');
      expect(typeof initCtx).toBe('function');

      formatHook('test');
      initCtx({ data: 'test' });

      expect(mockFormatHookName).toHaveBeenCalledWith('test');
      expect(mockInitializeContextObject).toHaveBeenCalledWith({ data: 'test' });
    });
  });
});

describe('Utils', () => {
  let validConstants;
  let validManifest;
  let mockFormatError;

  beforeEach(() => {
    jest.clearAllMocks();

    validConstants = {
      hooks: { ready: '.ready', init: '.init' },
      debug: { enabled: true }
    };

    validManifest = {
      shortName: 'OMH',
      title: 'Over My Head',
      id: 'test-module',
      version: '1.0.0'
    };

    mockFormatError = jest.fn();
  });

  describe('Factory Methods', () => {
    describe('createLogger', () => {
      it('should create a Logger instance with provided parameters', () => {
        const logger = Utils.createLogger(validConstants, validManifest, mockFormatError);

        expect(Logger).toHaveBeenCalledWith(validConstants, validManifest, mockFormatError);
        // Since Logger is mocked, we can't use toBeInstanceOf
        expect(typeof logger).toBe('object');
      });

      it('should handle undefined parameters', () => {
        const logger = Utils.createLogger();

        expect(Logger).toHaveBeenCalledWith(undefined, undefined, undefined);
        expect(typeof logger).toBe('object');
      });
    });

    describe('createInitializer', () => {
      it('should create an Initializer instance with provided parameters', () => {
        const mockLogger = new Logger();
        const mockFormatHook = jest.fn();

        const initializer = Utils.createInitializer(
          validConstants,
          validManifest,
          mockLogger,
          mockFormatError,
          mockFormatHook
        );

        expect(Initializer).toHaveBeenCalledWith(
          validConstants,
          validManifest,
          mockLogger,
          mockFormatError,
          mockFormatHook,
          Context
        );
        expect(typeof initializer).toBe('object');
      });

      it('should handle undefined parameters', () => {
        const initializer = Utils.createInitializer();

        expect(Initializer).toHaveBeenCalledWith(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          Context
        );
        expect(typeof initializer).toBe('object');
      });
    });
  });

  describe('Hook Formatting', () => {
    describe('formatHook', () => {
      it('should call HookFormatter.formatHook with provided parameters', () => {
        const mockFormatHook = jest.fn().mockReturnValue('formattedHook');
        HookFormatter.formatHook = mockFormatHook;

        const result = Utils.formatHook('module', 'ready', 'context');

        expect(mockFormatHook).toHaveBeenCalledWith('module', 'ready', 'context');
        expect(result).toBe('formattedHook');
      });

      it('should handle optional context parameter', () => {
        const mockFormatHook = jest.fn().mockReturnValue('formattedHook');
        HookFormatter.formatHook = mockFormatHook;

        const result = Utils.formatHook('module', 'ready');

        expect(mockFormatHook).toHaveBeenCalledWith('module', 'ready', undefined);
        expect(result).toBe('formattedHook');
      });
    });
  });

  describe('StaticUtils Proxy Methods', () => {
    beforeEach(() => {
      // Mock StaticUtils methods
      StaticUtils.validate = jest.fn();
      StaticUtils.unpack = jest.fn();
      StaticUtils.formatError = jest.fn();
      StaticUtils.localize = jest.fn();
      StaticUtils.formatLocalized = jest.fn();
      StaticUtils.hasLocalization = jest.fn();
      StaticUtils.getModuleObject = jest.fn();
      StaticUtils.writeToModuleObject = jest.fn();
      StaticUtils.readFromModuleObject = jest.fn();
      StaticUtils.getAvailableValidationTypes = jest.fn();
      StaticUtils.createHookProxy = jest.fn();
      StaticUtils.createHookLogger = jest.fn();
      StaticUtils.proxyFoundryHooks = jest.fn();
    });

    describe('validate', () => {
      it('should proxy to StaticUtils.validate', () => {
        const options = { value: 'test', name: 'testValue' };
        StaticUtils.validate.mockReturnValue(true);

        const result = Utils.validate('isString', options);

        expect(StaticUtils.validate).toHaveBeenCalledWith('isString', options);
        expect(result).toBe(true);
      });
    });

    describe('unpack', () => {
      it('should proxy to StaticUtils.unpack', () => {
        const obj = { test: 'value' };
        const instance = {};
        const objectName = 'testObject';

        Utils.unpack(obj, instance, objectName);

        expect(StaticUtils.unpack).toHaveBeenCalledWith(obj, instance, objectName);
      });

      it('should handle optional objectName', () => {
        const obj = { test: 'value' };
        const instance = {};

        Utils.unpack(obj, instance);

        expect(StaticUtils.unpack).toHaveBeenCalledWith(obj, instance, undefined);
      });
    });

    describe('formatError', () => {
      it('should proxy to StaticUtils.formatError', () => {
        const error = new Error('test error');
        const options = { includeStack: true };
        StaticUtils.formatError.mockReturnValue('formatted error');

        const result = Utils.formatError(error, options);

        expect(StaticUtils.formatError).toHaveBeenCalledWith(error, options);
        expect(result).toBe('formatted error');
      });
    });

    describe('localize', () => {
      it('should proxy to StaticUtils.localize', () => {
        const stringId = 'TEST.key';
        const i18nInstance = { test: true };
        StaticUtils.localize.mockReturnValue('localized text');

        const result = Utils.localize(stringId, i18nInstance);

        expect(StaticUtils.localize).toHaveBeenCalledWith(stringId, i18nInstance);
        expect(result).toBe('localized text');
      });
    });

    describe('formatLocalized', () => {
      it('should proxy to StaticUtils.formatLocalized', () => {
        const stringId = 'TEST.key';
        const data = { name: 'Player' };
        const i18nInstance = { test: true };
        StaticUtils.formatLocalized.mockReturnValue('formatted localized text');

        const result = Utils.formatLocalized(stringId, data, i18nInstance);

        expect(StaticUtils.formatLocalized).toHaveBeenCalledWith(stringId, data, i18nInstance);
        expect(result).toBe('formatted localized text');
      });
    });

    describe('hasLocalization', () => {
      it('should proxy to StaticUtils.hasLocalization', () => {
        const stringId = 'TEST.key';
        const i18nInstance = { test: true };
        StaticUtils.hasLocalization.mockReturnValue(true);

        const result = Utils.hasLocalization(stringId, i18nInstance);

        expect(StaticUtils.hasLocalization).toHaveBeenCalledWith(stringId, i18nInstance);
        expect(result).toBe(true);
      });
    });

    describe('getModuleObject', () => {
      it('should proxy to StaticUtils.getModuleObject', () => {
        const moduleIdentifier = 'test-module';
        const moduleObj = { id: 'test-module' };
        StaticUtils.getModuleObject.mockReturnValue(moduleObj);

        const result = Utils.getModuleObject(moduleIdentifier);

        expect(StaticUtils.getModuleObject).toHaveBeenCalledWith(moduleIdentifier);
        expect(result).toBe(moduleObj);
      });
    });

    describe('writeToModuleObject', () => {
      it('should proxy to StaticUtils.writeToModuleObject', () => {
        const moduleIdentifier = 'test-module';
        const key = 'testKey';
        const value = 'testValue';
        StaticUtils.writeToModuleObject.mockReturnValue(true);

        const result = Utils.writeToModuleObject(moduleIdentifier, key, value);

        expect(StaticUtils.writeToModuleObject).toHaveBeenCalledWith(moduleIdentifier, key, value);
        expect(result).toBe(true);
      });
    });

    describe('readFromModuleObject', () => {
      it('should proxy to StaticUtils.readFromModuleObject', () => {
        const moduleIdentifier = 'test-module';
        const key = 'testKey';
        const value = 'testValue';
        StaticUtils.readFromModuleObject.mockReturnValue(value);

        const result = Utils.readFromModuleObject(moduleIdentifier, key);

        expect(StaticUtils.readFromModuleObject).toHaveBeenCalledWith(moduleIdentifier, key);
        expect(result).toBe(value);
      });
    });

    describe('getAvailableValidationTypes', () => {
      it('should proxy to StaticUtils.getAvailableValidationTypes', () => {
        const types = ['isString', 'validateObject'];
        StaticUtils.getAvailableValidationTypes.mockReturnValue(types);

        const result = Utils.getAvailableValidationTypes();

        expect(StaticUtils.getAvailableValidationTypes).toHaveBeenCalled();
        expect(result).toBe(types);
      });
    });

    describe('Hook Logging Methods', () => {
      describe('createHookProxy', () => {
        it('should proxy to StaticUtils.createHookProxy', () => {
          const hookFunction = jest.fn();
          const options = { logLevel: 'debug' };
          const proxiedFunction = jest.fn();
          StaticUtils.createHookProxy.mockReturnValue(proxiedFunction);

          const result = Utils.createHookProxy(hookFunction, options);

          expect(StaticUtils.createHookProxy).toHaveBeenCalledWith(hookFunction, options);
          expect(result).toBe(proxiedFunction);
        });
      });

      describe('createHookLogger', () => {
        it('should proxy to StaticUtils.createHookLogger', () => {
          const logLevel = 'debug';
          const prefix = 'Test Hook';
          const filter = jest.fn();
          const logger = jest.fn();
          StaticUtils.createHookLogger.mockReturnValue(logger);

          const result = Utils.createHookLogger(logLevel, prefix, filter);

          expect(StaticUtils.createHookLogger).toHaveBeenCalledWith(logLevel, prefix, filter);
          expect(result).toBe(logger);
        });
      });

      describe('proxyFoundryHooks', () => {
        it('should proxy to StaticUtils.proxyFoundryHooks', () => {
          const options = { enabled: true, moduleFilter: 'OMH.' };
          const proxiedFunction = jest.fn();
          StaticUtils.proxyFoundryHooks.mockReturnValue(proxiedFunction);

          const result = Utils.proxyFoundryHooks(options);

          expect(StaticUtils.proxyFoundryHooks).toHaveBeenCalledWith(options);
          expect(result).toBe(proxiedFunction);
        });
      });
    });
  });

  describe('getUtilityInfo', () => {
    it('should return comprehensive utility information', () => {
      // Mock StaticUtils.getUtilityInfo to return expected structure
      StaticUtils.getUtilityInfo = jest.fn().mockReturnValue({
        utilities: ['Validator', 'Unpacker', 'GameManager', 'ErrorFormatter', 'Localizer', 'HooksLogger']
      });

      const info = Utils.getUtilityInfo();

      expect(info).toEqual({
        name: 'Utils',
        version: '1.0.0',
        description: 'Central entry point for all utility functionality',
        classes: ['Utilities', 'StaticUtils'],
        staticUtils: expect.any(Array),
        factoryMethods: ['createLogger', 'createInitializer'],
        hookMethods: ['formatHook', 'createHookProxy', 'createHookLogger', 'proxyFoundryHooks']
      });
    });

    it('should include staticUtils information from StaticUtils', () => {
      const mockStaticInfo = {
        utilities: ['Validator', 'Unpacker', 'GameManager', 'ErrorFormatter', 'Localizer', 'HooksLogger']
      };
      StaticUtils.getUtilityInfo = jest.fn().mockReturnValue(mockStaticInfo);

      const info = Utils.getUtilityInfo();

      expect(info.staticUtils).toBe(mockStaticInfo.utilities);
    });
  });

  describe('Integration', () => {
    it('should work with all factory methods together', () => {
      const logger = Utils.createLogger(validConstants, validManifest, mockFormatError);
      const initializer = Utils.createInitializer(
        validConstants,
        validManifest,
        logger,
        mockFormatError,
        jest.fn()
      );

      expect(typeof logger).toBe('object');
      expect(typeof initializer).toBe('object');
    });

    it('should handle chained operations', () => {
      StaticUtils.validate = jest.fn().mockReturnValue(true);
      StaticUtils.formatError = jest.fn().mockReturnValue('formatted');
      
      const isValid = Utils.validate('isString', { value: 'test' });
      const formatted = Utils.formatError(new Error('test'));

      expect(isValid).toBe(true);
      expect(formatted).toBe('formatted');
    });
  });
});
