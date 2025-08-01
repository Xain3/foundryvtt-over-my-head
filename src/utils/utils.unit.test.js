/**
 * @file utils.unit.test.js
 * @description Unit tests for the Utilities class.
 * @path src/utils/utils.unit.test.js
 */

import Utilities from './utils.js';
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
