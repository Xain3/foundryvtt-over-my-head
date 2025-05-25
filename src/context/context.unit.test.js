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
    naming: 'camelCase',
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
  sync: jest.fn(),
  autoSync: jest.fn(),
  validateCompatibility: jest.fn(),
  SYNC_OPERATIONS: {
    UPDATE_SOURCE_TO_TARGET: 'updateSourceToTarget',
    UPDATE_TARGET_TO_SOURCE: 'updateTargetToSource',
    MERGE_NEWER_WINS: 'mergeNewerWins',
    MERGE_SOURCE_PRIORITY: 'mergeSourcePriority',
    MERGE_TARGET_PRIORITY: 'mergeTargetPriority',
  },
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
        defaultConstructorArgs.namingConvention,
        'Naming convention',
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
        namingConvention: 'snake_case',
        constants: { customConst: 1 },
        manifest: { customManifest: 'v2' },
        flags: { customFlag: false },
        data: { customData: 'abc' },
        settings: { customSetting: true },
      };
      context = new Context(customParams);

      expect(Validator.validateArgsObjectStructure).toHaveBeenCalledWith(customParams, 'Context constructor parameters');
      expect(Validator.validateSchemaDefinition).toHaveBeenCalledWith(customParams.contextSchema, 'Context schema');
      expect(Validator.validateStringAgainstPattern).toHaveBeenCalledWith(customParams.namingConvention, 'Naming convention', expect.any(RegExp), expect.any(String), { allowEmpty: false });
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

    it('should throw if Validator.validateStringAgainstPattern for namingConvention fails', () => {
      Validator.validateStringAgainstPattern.mockImplementationOnce((value, name) => {
        if (name === 'Naming convention') throw new Error('Invalid naming convention');
      });
      expect(() => new Context()).toThrow('Invalid naming convention');
    });

    it('should throw if Validator.validateObject for constants fails', () => {
      Validator.validateObject.mockImplementationOnce((value, name) => {
        if (name === 'Constants') throw new Error('Invalid constants object');
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

  describe('Sync Functionalities', () => {
    let targetContext;
    let mockOptions;

    beforeEach(() => {
      context = new Context(); // `context` is the source
      targetContext = new Context(); // A separate instance to act as target
      mockOptions = { deepSync: false, compareBy: 'createdAt' };
      ContextSync.compare.mockReturnValue({ result: 'equal' });
      ContextSync.sync.mockReturnValue({ success: true, changes: [] });
      ContextSync.autoSync.mockReturnValue({ success: true, changes: [] });
      ContextSync.validateCompatibility.mockReturnValue(true);
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

    it('sync should call ContextSync.sync with itself as default source', () => {
      const operation = 'testOp';
      context.sync(targetContext, operation, mockOptions);
      expect(ContextSync.sync).toHaveBeenCalledWith(context, targetContext, operation, mockOptions);
    });

    it('autoSync should call ContextSync.autoSync with itself as default source', () => {
      context.autoSync(targetContext, mockOptions);
      expect(ContextSync.autoSync).toHaveBeenCalledWith(context, targetContext, mockOptions);
    });

    it('updateToMatch should call ContextSync.sync with UPDATE_SOURCE_TO_TARGET operation', () => {
      context.updateToMatch(targetContext, mockOptions);
      expect(ContextSync.sync).toHaveBeenCalledWith(context, targetContext, ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET, mockOptions);
    });

    it('updateTarget should call ContextSync.sync with UPDATE_TARGET_TO_SOURCE operation', () => {
      context.updateTarget(targetContext, mockOptions);
      expect(ContextSync.sync).toHaveBeenCalledWith(context, targetContext, ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE, mockOptions);
    });

    it('mergeNewerWins should call ContextSync.sync with MERGE_NEWER_WINS operation', () => {
      context.mergeNewerWins(targetContext, mockOptions);
      expect(ContextSync.sync).toHaveBeenCalledWith(context, targetContext, ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS, mockOptions);
    });

    it('mergeWithPriority should call ContextSync.sync with MERGE_SOURCE_PRIORITY operation', () => {
      context.mergeWithPriority(targetContext, mockOptions);
      expect(ContextSync.sync).toHaveBeenCalledWith(context, targetContext, ContextSync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY, mockOptions);
    });

    it('mergeWithTargetPriority should call ContextSync.sync with MERGE_TARGET_PRIORITY operation', () => {
      context.mergeWithTargetPriority(targetContext, mockOptions);
      expect(ContextSync.sync).toHaveBeenCalledWith(context, targetContext, ContextSync.SYNC_OPERATIONS.MERGE_TARGET_PRIORITY, mockOptions);
    });

    it('isCompatibleWith should call ContextSync.validateCompatibility with itself as default source', () => {
      context.isCompatibleWith(targetContext, mockOptions);
      expect(ContextSync.validateCompatibility).toHaveBeenCalledWith(context, targetContext);
    });

    describe('syncComponent', () => {
      it('should call ContextSync.sync with correct components and options', () => {
        const componentKey = 'data';
        const operation = 'testOp';
        const sourceComponent = context[componentKey];
        const targetComponent = targetContext[componentKey];

        context.syncComponent(componentKey, targetContext, operation, mockOptions);
        expect(ContextSync.sync).toHaveBeenCalledWith(sourceComponent, targetComponent, operation, mockOptions);
      });

      it('should throw if componentKey is invalid', () => {
        expect(() => context.syncComponent('invalidKey', targetContext, 'op'))
          .toThrow(/Invalid component key: invalidKey/);
      });

      it('should throw if target is not a Context instance', () => {
        expect(() => context.syncComponent('data', {}, 'op'))
          .toThrow('Target must be a Context instance');
      });

      it('should throw if a component is not found (e.g., schema is null)', () => {
        // Simulate a component being missing by temporarily making the getter return null
        jest.spyOn(context, 'schema', 'get').mockReturnValueOnce(null);
        expect(() => context.syncComponent('schema', targetContext, 'op'))
          .toThrow("Component 'schema' not found in source or target context");
      });
    });

    describe('autoSyncComponent', () => {
      it('should call syncComponent with "auto" operation and autoSync true', () => {
        const componentKey = 'flags';
        const sourceComponent = context[componentKey];
        const targetComponent = targetContext[componentKey];
        jest.spyOn(context, 'syncComponent'); // Spy on the instance method

        context.autoSyncComponent(componentKey, targetContext, mockOptions);
        expect(context.syncComponent).toHaveBeenCalledWith(componentKey, targetContext, 'auto', { ...mockOptions, autoSync: true });
      });
    });

    // Test individual component sync methods (syncSchema, syncData, etc.)
    const componentSyncMethods = ['Schema', 'Constants', 'Manifest', 'Flags', 'State', 'Data', 'Settings'];
    componentSyncMethods.forEach(compName => {
      const methodName = `sync${compName}`;
      const componentKey = compName.toLowerCase();

      describe(methodName, () => {
        it(`should call syncComponent with '${componentKey}' and default 'auto' operation`, () => {
          jest.spyOn(context, 'autoSyncComponent');
          context[methodName](targetContext, 'auto', mockOptions); // Explicitly 'auto'
          expect(context.autoSyncComponent).toHaveBeenCalledWith(componentKey, targetContext, mockOptions);
        });

        it(`should call syncComponent with '${componentKey}' and specified operation`, () => {
          const operation = 'customOp';
          jest.spyOn(context, 'syncComponent');
          context[methodName](targetContext, operation, mockOptions);
          expect(context.syncComponent).toHaveBeenCalledWith(componentKey, targetContext, operation, mockOptions);
        });
      });
    });

    describe('syncComponents', () => {
      it('should call autoSyncComponent for each key when operation is "auto"', () => {
        const keys = ['data', 'flags'];
        jest.spyOn(context, 'autoSyncComponent').mockResolvedValue({ success: true });

        context.syncComponents(keys, targetContext, 'auto', mockOptions);

        expect(context.autoSyncComponent).toHaveBeenCalledTimes(keys.length);
        expect(context.autoSyncComponent).toHaveBeenCalledWith('data', targetContext, mockOptions);
        expect(context.autoSyncComponent).toHaveBeenCalledWith('flags', targetContext, mockOptions);
      });

      it('should call syncComponent for each key with specified operation', () => {
        const keys = ['settings', 'state'];
        const operation = 'merge';
        jest.spyOn(context, 'syncComponent').mockResolvedValue({ success: true });

        context.syncComponents(keys, targetContext, operation, mockOptions);

        expect(context.syncComponent).toHaveBeenCalledTimes(keys.length);
        expect(context.syncComponent).toHaveBeenCalledWith('settings', targetContext, operation, mockOptions);
        expect(context.syncComponent).toHaveBeenCalledWith('state', targetContext, operation, mockOptions);
      });

      it('should return results and success true if all components sync successfully', () => {
        const keys = ['data', 'flags'];
        const mockResultData = { success: true, message: 'data synced' };
        const mockResultFlags = { success: true, message: 'flags synced' };
        jest.spyOn(context, 'autoSyncComponent')
          .mockImplementation(key => (key === 'data' ? mockResultData : mockResultFlags));

        const result = context.syncComponents(keys, targetContext, 'auto', mockOptions);

        expect(result.success).toBe(true);
        expect(result.results.data).toEqual(mockResultData);
        expect(result.results.flags).toEqual(mockResultFlags);
        expect(result.errors).toBeUndefined();
        expect(result.syncedComponents).toEqual(expect.arrayContaining(['data', 'flags']));
        expect(result.failedComponents).toEqual([]);
      });

      it('should return errors and success false if any component sync fails', () => {
        const keys = ['data', 'state'];
        const mockResultData = { success: true, message: 'data synced' };
        const errorState = new Error('state sync failed');
        jest.spyOn(context, 'autoSyncComponent')
          .mockImplementation(key => {
            if (key === 'data') return mockResultData;
            if (key === 'state') throw errorState;
          });

        const result = context.syncComponents(keys, targetContext, 'auto', mockOptions);

        expect(result.success).toBe(false);
        expect(result.results.data).toEqual(mockResultData);
        expect(result.errors.state).toBe(errorState.message);
        expect(result.syncedComponents).toEqual(['data']);
        expect(result.failedComponents).toEqual(['state']);
      });
    });
  });
});