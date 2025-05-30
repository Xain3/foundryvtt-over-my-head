/**
 * @file context.test.js
 * @description Unit tests for the Context class.
 * @path src/context/context.test.js
*/

import Context from './context.js';
import { ContextContainer } from './helpers/contextContainer.js';
import Validator from '@/utils/static/validator';
import importedManifest from '@manifest';
import importedConstants from '@/constants/constants';
import ContextSync from './helpers/contextSync.js';

// Jest Mocks - Must be at the top
jest.mock('@manifest', () => ({ manifestKey: 'manifestValue', version: '1.0.0' }), { virtual: true });
jest.mock('@/constants/constants', () => ({
  context: {
    schema: { defaultSchema: true, type: 'object' },
    naming: {
      state: "state",
      settings: "settings",
      flags: "flags",
      data: "data",
      manifest: "manifest",
      timestamp: "timestamp"
    },
  },
  flags: { initialFlag: true },
  otherConstant: 'someValue',
}), { virtual: true });

jest.mock('@/utils/static/validator', () => ({
  validateArgsObjectStructure: jest.fn(),
  validateSchemaDefinition: jest.fn(),
  validateStringAgainstPattern: jest.fn(),
  validateObject: jest.fn(),
}));

jest.mock('./helpers/contextSync.js', () => ({
  compare: jest.fn(),
}));

// Mock setup for ContextContainer
let mockNamingConventionContainerInstance;

jest.mock('./helpers/contextContainer.js', () => ({
  ContextContainer: jest.fn().mockImplementation(function(value, options, itemOptions) {
    this.mockedValue = value;
    this.mockedOptions = options;
    this.mockedItemOptions = itemOptions;
    this.mockedInternalItems = {};

    this.setItem = jest.fn((key, itemValue) => {
      this.mockedInternalItems[key] = itemValue;
    });

    this.getItem = jest.fn((key) => {
      return this.mockedInternalItems[key];
    });

    // Identify the call for #namingConvention
    // The super() call has defaultItemWrapAs, #namingConvention call does not and has recordAccess: false
    if (itemOptions && itemOptions.recordAccess === false && itemOptions.defaultItemWrapAs === undefined) {
      mockNamingConventionContainerInstance = this;
    }
    return this;
  }),
}));


describe('Context', () => {
  let context;
  let defaultConstructorArgs;
  const creationDate = new Date().toISOString().split('T')[0]; // For file header, not used in tests directly

  beforeEach(() => {
    jest.clearAllMocks();
    mockNamingConventionContainerInstance = null; // Reset for each test

    // Reset all validator mocks to default implementations
    Validator.validateArgsObjectStructure.mockImplementation(() => {});
    Validator.validateSchemaDefinition.mockImplementation(() => {});
    Validator.validateStringAgainstPattern.mockImplementation(() => {});
    Validator.validateObject.mockImplementation(() => {});

    // Reset ContextContainer mock implementation
    const { ContextContainer } = require('./helpers/contextContainer.js');
    ContextContainer.mockClear();
    ContextContainer.mockImplementation(function(value, options, itemOptions) {
      this.mockedValue = value;
      this.mockedOptions = options;
      this.mockedItemOptions = itemOptions;
      this.mockedInternalItems = {};

      this.setItem = jest.fn((key, itemValue) => {
        this.mockedInternalItems[key] = itemValue;
      });

      this.getItem = jest.fn((key) => {
        return this.mockedInternalItems[key];
      });

      // Identify the call for #namingConvention
      // The super() call has defaultItemWrapAs, #namingConvention call does not and has recordAccess: false
      if (itemOptions && itemOptions.recordAccess === false && itemOptions.defaultItemWrapAs === undefined) {
        mockNamingConventionContainerInstance = this;
      }
      return this;
    });

    defaultConstructorArgs = {
      contextSchema: importedConstants.context.schema,
      namingConvention: importedConstants.context.naming,
      constants: importedConstants,
      manifest: importedManifest,
      flags: importedConstants.flags,
      data: {},
      settings: {},
    };
  });

  describe('constructor', () => {
    it('should call super constructor (ContextContainer) with correct parameters', () => {
      context = new Context();
      // First call to ContextContainer constructor is super()
      expect(ContextContainer).toHaveBeenCalledTimes(2); // super() + namingConvention

      const superCallArgs = ContextContainer.mock.calls[0];
      expect(superCallArgs[0]).toEqual({}); // value for super()
      expect(superCallArgs[1]).toEqual({}); // options for super()
      expect(superCallArgs[2]).toEqual({
        recordAccess: false,
        recordAccessForMetadata: false,
        defaultItemWrapAs: 'ContextContainer',
      });
    });

    it('should validate constructor arguments using Validator', () => {
      context = new Context();
      expect(Validator.validateArgsObjectStructure).toHaveBeenCalledWith(
        defaultConstructorArgs,
        'Context constructor parameters'
      );
      expect(Validator.validateSchemaDefinition).toHaveBeenCalledWith(
        defaultConstructorArgs.contextSchema,
        'Context schema'
      );
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith(
        'state',
        'Naming convention.state',
        /^[a-zA-Z0-9_]+$/,
        'alphanumeric characters and underscores',
        { allowEmpty: false }
      );
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith(
        'settings',
        'Naming convention.settings',
        /^[a-zA-Z0-9_]+$/,
        'alphanumeric characters and underscores',
        { allowEmpty: false }
      );
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith(
        'flags',
        'Naming convention.flags',
        /^[a-zA-Z0-9_]+$/,
        'alphanumeric characters and underscores',
        { allowEmpty: false }
      );
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith(
        'data',
        'Naming convention.data',
        /^[a-zA-Z0-9_]+$/,
        'alphanumeric characters and underscores',
        { allowEmpty: false }
      );
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith(
        'manifest',
        'Naming convention.manifest',
        /^[a-zA-Z0-9_]+$/,
        'alphanumeric characters and underscores',
        { allowEmpty: false }
      );
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith(
        'timestamp',
        'Naming convention.timestamp',
        /^[a-zA-Z0-9_]+$/,
        'alphanumeric characters and underscores',
        { allowEmpty: false }
      );
      expect(Validator.validateObject).toHaveBeenCalledWith(defaultConstructorArgs.constants, 'Constants', { allowEmpty: false });
      expect(Validator.validateObject).toHaveBeenCalledWith(defaultConstructorArgs.manifest, 'Manifest', { allowEmpty: false });
      expect(Validator.validateObject).toHaveBeenCalledWith(defaultConstructorArgs.flags, 'Flags', { allowEmpty: true, checkKeys: true });
      expect(Validator.validateObject).toHaveBeenCalledWith(defaultConstructorArgs.data, 'Data', { allowEmpty: true, checkKeys: true });
      expect(Validator.validateObject).toHaveBeenCalledWith(defaultConstructorArgs.settings, 'Settings', { allowEmpty: true, checkKeys: true });
    });

    it('should initialize items using setItem with default values on the context instance', () => {
      context = new Context();
      // `context` itself is the first instance of MockContextContainer due to `extends`
      // Its `setItem` method is the mocked one.
      expect(context.setItem).toHaveBeenCalledWith('schema', Object.freeze(defaultConstructorArgs.contextSchema));
      expect(context.setItem).toHaveBeenCalledWith('constants', Object.freeze(defaultConstructorArgs.constants));
      expect(context.setItem).toHaveBeenCalledWith('manifest', Object.freeze(defaultConstructorArgs.manifest));
      expect(context.setItem).toHaveBeenCalledWith('flags', defaultConstructorArgs.flags);
      expect(context.setItem).toHaveBeenCalledWith('state', {});
      expect(context.setItem).toHaveBeenCalledWith('data', defaultConstructorArgs.data);
      expect(context.setItem).toHaveBeenCalledWith('settings', defaultConstructorArgs.settings);
    });

    it('should initialize #namingConvention as a new, separate ContextContainer instance', () => {
      context = new Context();
      expect(ContextContainer).toHaveBeenCalledTimes(2); // super() and namingConvention

      const namingConventionCallArgs = ContextContainer.mock.calls[1];
      expect(namingConventionCallArgs[0]).toEqual(Object.freeze(defaultConstructorArgs.namingConvention));
      expect(namingConventionCallArgs[1]).toEqual({});
      expect(namingConventionCallArgs[2]).toEqual({ recordAccess: false });

      expect(mockNamingConventionContainerInstance).not.toBeNull();
      expect(mockNamingConventionContainerInstance.mockedValue).toEqual(Object.freeze(defaultConstructorArgs.namingConvention));
    });

    it('should use provided parameters for initialization', () => {
      const customParams = {
        contextSchema: { customSchema: true, type: 'object' },
        namingConvention: {
          state: "custom_state",
          settings: "custom_settings",
          flags: "custom_flags",
          data: "custom_data",
          manifest: "custom_manifest",
          timestamp: "custom_timestamp"
        },
        constants: { customConst: 1 },
        manifest: { customManifest: 'v2' },
        flags: { customFlag: false },
        data: { customData: 'abc' },
        settings: { customSetting: true },
      };
      context = new Context({ initializationParams: customParams });

      expect(Validator.validateArgsObjectStructure).toHaveBeenCalledWith(customParams, 'Context constructor parameters');
      expect(Validator.validateSchemaDefinition).toHaveBeenCalledWith(customParams.contextSchema, 'Context schema');
      // Should validate each naming convention property
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith('custom_state', 'Naming convention.state', expect.any(RegExp), expect.any(String), { allowEmpty: false });
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith('custom_settings', 'Naming convention.settings', expect.any(RegExp), expect.any(String), { allowEmpty: false });
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith('custom_flags', 'Naming convention.flags', expect.any(RegExp), expect.any(String), { allowEmpty: false });
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith('custom_data', 'Naming convention.data', expect.any(RegExp), expect.any(String), { allowEmpty: false });
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith('custom_manifest', 'Naming convention.manifest', expect.any(RegExp), expect.any(String), { allowEmpty: false });
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith('custom_timestamp', 'Naming convention.timestamp', expect.any(RegExp), expect.any(String), { allowEmpty: false });
      expect(Validator.validateObject).toHaveBeenCalledWith(customParams.constants, 'Constants', { allowEmpty: false });

      expect(context.setItem).toHaveBeenCalledWith('schema', Object.freeze(customParams.contextSchema));
      expect(context.setItem).toHaveBeenCalledWith('constants', Object.freeze(customParams.constants));
      expect(context.setItem).toHaveBeenCalledWith('manifest', Object.freeze(customParams.manifest));
      expect(context.setItem).toHaveBeenCalledWith('flags', customParams.flags);
      expect(context.setItem).toHaveBeenCalledWith('data', customParams.data);
      expect(context.setItem).toHaveBeenCalledWith('settings', customParams.settings);

      const namingConventionCallArgs = ContextContainer.mock.calls[1];
      expect(namingConventionCallArgs[0]).toEqual(Object.freeze(customParams.namingConvention));
      expect(mockNamingConventionContainerInstance.mockedValue).toEqual(Object.freeze(customParams.namingConvention));
    });

    it('should throw if Validator.validateArgsObjectStructure fails', () => {
      Validator.validateArgsObjectStructure.mockImplementationOnce(() => { throw new Error('Invalid args structure'); });
      expect(() => new Context()).toThrow('Invalid args structure');
    });

    it('should throw if Validator.validateSchemaDefinition fails', () => {
      Validator.validateSchemaDefinition.mockImplementationOnce(() => { throw new Error('Invalid schema definition'); });
      expect(() => new Context()).toThrow('Invalid schema definition');
    });

    it('should throw if validateStringAgainstPattern fails for naming convention', () => {
      Validator.validateStringAgainstPattern.mockImplementation((value, name, pattern, description, options) => {
        if (name.startsWith('Naming convention.')) throw new Error('Invalid naming convention');
        // Let other calls pass through normally
      });
      expect(() => new Context()).toThrow('Invalid naming convention');
    });

    it('should throw if Validator.validateObject for constants fails', () => {
      // Clear any previous mock implementations
      Validator.validateStringAgainstPattern.mockImplementation(() => {
        // Allow all validation calls to pass
      });

      Validator.validateObject.mockImplementation((value, name, options) => {
        if (name === 'Constants') throw new Error('Invalid constants object');
        // Let other calls pass through normally
      });
      expect(() => new Context()).toThrow('Invalid constants object');
    });
  });

  describe('getters', () => {
    beforeEach(() => {
      context = new Context(); // This sets up `context` with mocked getItem/setItem
    });

    const testGetter = (getterName, expectedKey) => {
      it(`get ${getterName} should call getItem('${expectedKey}') on the context instance and return its value`, () => {
        const mockReturnValue = { data: `mock data for ${expectedKey}` };
        // Configure the mock getItem on the context instance to return a specific value for this key
        context.mockedInternalItems[expectedKey] = mockReturnValue;

        const result = context[getterName]; // Access the getter

        expect(context.getItem).toHaveBeenCalledWith(expectedKey);
        expect(result).toBe(mockReturnValue);
      });
    };

    testGetter('schema', 'schema');
    testGetter('constants', 'constants');
    testGetter('manifest', 'manifest');
    testGetter('flags', 'flags');
    testGetter('state', 'state');
    testGetter('data', 'data');
    testGetter('settings', 'settings');

    it('get namingConvention should return the dedicated ContextContainer instance for #namingConvention', () => {
      // `context` is already initialized, and `mockNamingConventionContainerInstance`
      // should have been set by the ContextContainer mock during `new Context()`.
      expect(context.namingConvention).toBe(mockNamingConventionContainerInstance);
      expect(mockNamingConventionContainerInstance).not.toBeNull();
      // Verify it's the correct instance by checking its mockedValue
      expect(mockNamingConventionContainerInstance.mockedValue).toEqual(Object.freeze(defaultConstructorArgs.namingConvention));
    });
  });

  describe('Context Comparison', () => {
    let targetContext;
    let mockOptions;

    beforeEach(() => {
      context = new Context(); // `context` is the source
      targetContext = new Context(); // A separate instance to act as target
      mockOptions = { deepSync: false, compareBy: 'createdAt' };
      ContextSync.compare.mockReturnValue({ result: 'equal' });
    });

    it('compare should call ContextSync.compare with itself as default source', () => {
      context.compare(targetContext, mockOptions);
      expect(ContextSync.compare).toHaveBeenCalledWith(context, targetContext, mockOptions);
    });

    it('compare should call ContextSync.compare with provided sourceContext', () => {
      const explicitSource = new Context();
      context.compare(targetContext, { ...mockOptions, sourceContext: explicitSource });
      expect(ContextSync.compare).toHaveBeenCalledWith(explicitSource, targetContext, mockOptions);
    });
  });
});