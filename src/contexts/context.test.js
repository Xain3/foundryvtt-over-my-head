import Context from './context.js';
import Base from '../baseClasses/base.js';
import ContextExtractor from './contextHelpers/contextExtractor.js';
import ContextInitializer from './contextHelpers/contextInitializer.js';
import RemoteContextManager from './contextHelpers/remoteContextManager.js';

// Mock dependencies
jest.mock('../baseClasses/base.js');
jest.mock('./contextHelpers/contextExtractor.js');
jest.mock('./contextHelpers/contextInitializer.js');
jest.mock('./contextHelpers/remoteContextManager.js');

describe('Context', () => {
    let mockConfig;
    let mockUtils;
    let mockInitialState;
    let mockExtractedConfig;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock implementations
        mockInitialState = { data: { initialData: 'value' }, flags: { initialFlag: true } };
        mockExtractedConfig = { CONSTANTS: { MODULE: { DEFAULTS: { DEBUG_MODE: false } } }, OTHER_CONFIG: 'value' };

        ContextExtractor.extractContextInit.mockReturnValue({
            CONFIG: mockExtractedConfig,
            contextInit: mockInitialState
        });

        ContextInitializer.initializeContext = jest.fn((contextInstance, state) => {
            contextInstance.state = { ...state, dateCreated: Date.now(), dateModified: Date.now() };
        });

        mockConfig = {
            CONSTANTS: {
                CONTEXT_INIT: { data: { initialData: 'value' }, flags: { initialFlag: true } },
                MODULE: { DEFAULTS: {
                    DEBUG_MODE: false,
                    REMOTE_CONTEXT_ROOT: 'defaultSource' } },
                },
            OTHER_CONFIG: 'value'
        };

        mockUtils = {
            validator: { validate: jest.fn() }, // Assuming validator has a 'validate' method or similar
            gameManager: { getGame: jest.fn().mockReturnValue({}) } // Mock gameManager
        };

        // Define the function (optional, could just put the lines directly in beforeEach)
        const setupMocks = () => {
            RemoteContextManager.prototype.pushState = jest.fn();
            RemoteContextManager.prototype.pullState = jest.fn();
            RemoteContextManager.prototype.pushKey = jest.fn();
            RemoteContextManager.prototype.get = jest.fn();
            RemoteContextManager.prototype.clearRemoteContext = jest.fn();
            RemoteContextManager.prototype.syncState = jest.fn();
            RemoteContextManager.prototype.updateRemoteProperty = jest.fn();
            RemoteContextManager.prototype.setRemotecontextRoot = jest.fn();
            RemoteContextManager.prototype.setRemoteContext = jest.fn();
        };

        // Call the function to actually apply the mocks
        setupMocks(); 

        // Mock property access if needed
         Object.defineProperty(RemoteContextManager.prototype, 'remotecontextRoot', {
             get: jest.fn(() => 'mockSource'), // Provide a getter mock
             configurable: true // Allow redefining
         });
    });

    // Constructor Tests
    describe('constructor', () => {
        it('should initialize correctly with valid arguments', () => {
            const context = new Context(mockConfig, mockUtils);
            expect(Base).toHaveBeenCalledWith({
                config: mockConfig,
                shouldLoadConfig: true,
                shouldLoadContext: false,
                shouldLoadGame: true,
                shouldLoadDebugMode: false,
                globalContext: globalThis
            });
            expect(ContextExtractor.extractContextInit).toHaveBeenCalledWith(mockConfig);
            expect(RemoteContextManager).toHaveBeenCalledWith(mockConfig.CONSTANTS.MODULE.DEFAULTS.REMOTE_CONTEXT_ROOT, mockExtractedConfig);
            expect(context.config).toBe(mockExtractedConfig);
            expect(context.initialState).toBe(mockInitialState);
            expect(context.validate).toBe(mockUtils.validator);
            expect(context.gameManager).toBe(mockUtils.gameManager);
            expect(ContextInitializer.initializeContext).toHaveBeenCalledWith(context, mockInitialState);
            expect(context.state).toEqual(expect.objectContaining(mockInitialState));
        });

        it('should not initialize context if initializeContext is false', () => {
            new Context(mockConfig, mockUtils, false);
            expect(ContextInitializer.initializeContext).not.toHaveBeenCalled();
        });

        it('should throw error if CONFIG is missing', () => {
            expect(() => new Context(null, mockUtils)).toThrow('CONFIG is not defined');
        });

        it('should throw error if CONFIG is not an object', () => {
            expect(() => new Context('not an object', mockUtils)).toThrow('CONFIG is not an object');
        });

        it('should throw error if CONFIG.CONSTANTS is missing', () => {
             const invalidConfig = { OTHER_PROP: 'value' };
             expect(() => new Context(invalidConfig, mockUtils)).toThrow('CONFIG does not have a CONSTANTS property');
        });

        it('should throw error if CONFIG.CONSTANTS is not an object', () => {
            const invalidConfig = { CONSTANTS: 'string' };
            expect(() => new Context(invalidConfig, mockUtils)).toThrow('CONFIG.CONSTANTS is not an object');
        });

        it('should throw error if CONFIG.CONSTANTS.CONTEXT_INIT is missing', () => {
            const invalidConfig = { CONSTANTS: {} };
            expect(() => new Context(invalidConfig, mockUtils)).toThrow('CONFIG does not have a CONTEXT_INIT property');
        });

         it('should throw error if CONFIG.CONSTANTS.CONTEXT_INIT is not an object', () => {
             const invalidConfig = { CONSTANTS: { CONTEXT_INIT: 'string' } };
             expect(() => new Context(invalidConfig, mockUtils)).toThrow('CONFIG.CONTEXT_INIT is not an object');
         });

         it('should throw error if CONFIG.CONSTANTS.CONTEXT_INIT is empty', () => {
             const invalidConfig = { CONSTANTS: { CONTEXT_INIT: {} } };
             expect(() => new Context(invalidConfig, mockUtils)).toThrow('CONFIG.CONTEXT_INIT is an empty object');
         });

        it('should throw error if utils is missing', () => {
            expect(() => new Context(mockConfig, null)).toThrow('Utils is not defined');
        });

        it('should throw error if utils is not an object', () => {
            expect(() => new Context(mockConfig, 'not an object')).toThrow('Utils is not an object');
        });

        it('should throw error if validator is missing in utils', () => {
            const invalidUtils = { gameManager: mockUtils.gameManager };
            expect(() => new Context(mockConfig, invalidUtils)).toThrow('Validator not found in utilities');
        });

        it('should throw error if gameManager is missing in utils', () => {
            const invalidUtils = { validator: mockUtils.validator };
            expect(() => new Context(mockConfig, invalidUtils)).toThrow('Utils does not have a gameManager property');
        });

         it('should throw error if initializeContext is not a boolean', () => {
             expect(() => new Context(mockConfig, mockUtils, 'not a boolean')).toThrow('initializeContext is not a boolean');
         });

         it('should set this.remotecontextRoot to the default value provided in the config if not provided', () => {
             const context = new Context(mockConfig, mockUtils);
             expect(context.remotecontextRoot).toBe(mockConfig?.CONSTANTS?.MODULE?.DEFAULTS?.REMOTE_CONTEXT_ROOT);
         });

         it('should set RemotecontextRoot to the fallback value of "module" if not provided and not in config', () => {
            delete mockConfig.CONSTANTS.MODULE.DEFAULTS.REMOTE_CONTEXT_ROOT;
            const context = new Context(mockConfig, mockUtils);
             expect(context.remotecontextRoot).toBe('module');
         });

        it('should set this.remotecontextRoot to the provided value', () => {
            const context = new Context(mockConfig, mockUtils, true, 'customSource');
            expect(context.remotecontextRoot).toBe('customSource');
        });

    });

    // Method Tests
    describe('methods', () => {
        let context;

        beforeEach(() => {
            // Create a fresh instance for method tests
            context = new Context(mockConfig, mockUtils);
            // Ensure state is initialized for tests that need it
            context.state = { data: { key1: 'val1' }, flags: { flag1: true }, dateModified: Date.now() };
        });

        it('initializeContext should call ContextInitializer.initializeContext', () => {
            const newState = { data: { newData: 'new' }, flags: {} };
            // Clear the mock call from the constructor
            ContextInitializer.initializeContext.mockClear();
            context.initializeContext(newState);
            expect(ContextInitializer.initializeContext).toHaveBeenCalledWith(context, newState);
        });

        it('pushState should call remoteContextManager.pushState', () => {
            context.pushState();
            expect(context.remoteContextManager.pushState).toHaveBeenCalledWith(context.state);
        });

        it('pullState should call remoteContextManager.pullState', () => {
            context.pullState();
            expect(context.remoteContextManager.pullState).toHaveBeenCalledWith(context.state, false);
            context.pullState(true);
            expect(context.remoteContextManager.pullState).toHaveBeenCalledWith(context.state, true);
        });

        it('writeToRemoteContext should call remoteContextManager.pushKey', () => {
            context.writeToRemoteContext('testKey', 'testValue');
            expect(context.remoteContextManager.pushKey).toHaveBeenCalledWith('testKey', 'testValue');
        });

        describe('readFromRemoteContext', () => {
            it('should call remoteContextManager.get with correct args for valid key', () => {
                const mockValue = 'remoteValue';
                context.remoteContextManager.get.mockReturnValue(mockValue);
                const result = context.readFromRemoteContext('validKey');
                expect(context.remoteContextManager.get).toHaveBeenCalledWith({ item: 'validKey' });
                expect(result).toBe(mockValue);
            });

            it('should return undefined for invalid key (null)', () => {
                jest.spyOn(console, 'warn').mockImplementation(() => {}); // Suppress console warning
                const result = context.readFromRemoteContext(null);
                expect(context.remoteContextManager.get).not.toHaveBeenCalled();
                expect(result).toBeUndefined();
                console.warn.mockRestore();
            });

             it('should return undefined for invalid key (empty string)', () => {
                 jest.spyOn(console, 'warn').mockImplementation(() => {}); // Suppress console warning
                 const result = context.readFromRemoteContext('');
                 expect(context.remoteContextManager.get).not.toHaveBeenCalled();
                 expect(result).toBeUndefined();
                 console.warn.mockRestore();
             });
        });

        describe('_validateKey', () => {
            beforeEach(() => {
                 jest.spyOn(console, 'warn').mockImplementation(() => {}); // Suppress console warnings
            });
            afterEach(() => {
                 console.warn.mockRestore();
            });

            test.each([
                ['stringKey', true],
                [123, true],
                [Symbol('sym'), true],
                [null, false],
                [undefined, false],
                ['', false],
                ['   ', false], // Should probably be true, but current impl warns and returns false
                [{}, false],
                [[], false],
                [true, false],
            ])('should return %s for key %p', (key, expected) => {
                expect(context._validateKey(key)).toBe(expected);
            });

             it('should warn for null/undefined key', () => {
                 context._validateKey(null);
                 expect(console.warn).toHaveBeenCalledWith('Key is null or undefined.');
             });

             it('should warn for invalid key type', () => {
                 context._validateKey({});
                 expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid key type: Expected string, symbol, or number'));
             });

             it('should warn for empty string key', () => {
                 context._validateKey('');
                 expect(console.warn).toHaveBeenCalledWith('Key cannot be an empty string.');
             });
        });


        it('clearRemoteContext should call remoteContextManager.clearRemoteContext', () => {
            context.clearRemoteContext();
            expect(context.remoteContextManager.clearRemoteContext).toHaveBeenCalled();
        });

        it('clearLocalContext should reset local state', () => {
            context.state = { data: { a: 1 }, flags: { b: true } };
            context.clearLocalContext();
            expect(context.state).toEqual({});
        });

        describe('clearContext', () => {
             beforeEach(() => {
                 jest.spyOn(context, 'clearRemoteContext');
                 jest.spyOn(context, 'clearLocalContext');
                 jest.spyOn(console, 'warn').mockImplementation(() => {});
                 jest.spyOn(console, 'error').mockImplementation(() => {});
             });
             afterEach(() => {
                 console.warn.mockRestore();
                 console.error.mockRestore();
             });

            it('should clear remote if clearRemote is true', () => {
                context.clearContext(true, false);
                expect(context.clearRemoteContext).toHaveBeenCalledTimes(1);
                expect(context.clearLocalContext).not.toHaveBeenCalled();
            });

            it('should clear local if clearLocal is true', () => {
                context.clearContext(false, true);
                expect(context.clearRemoteContext).not.toHaveBeenCalled();
                expect(context.clearLocalContext).toHaveBeenCalledTimes(1);
            });

            it('should clear both if both are true', () => {
                context.clearContext(true, true);
                expect(context.clearRemoteContext).toHaveBeenCalledTimes(1);
                expect(context.clearLocalContext).toHaveBeenCalledTimes(1);
            });

            it('should do nothing and warn if both are false', () => {
                context.clearContext(false, false);
                expect(context.clearRemoteContext).not.toHaveBeenCalled();
                expect(context.clearLocalContext).not.toHaveBeenCalled();
                expect(console.warn).toHaveBeenCalledWith('Both clearRemote and clearLocal are false, no context cleared');
            });

             it('should catch and log errors from clear methods', () => {
                 const error = new Error('Clear failed');
                 context.clearRemoteContext.mockImplementation(() => { throw error; });
                 context.clearContext(true, false);
                 expect(console.error).toHaveBeenCalledWith(error.message);
             });
        });

        it('syncState should call remoteContextManager.syncState', () => {
            context.syncState();
            expect(context.remoteContextManager.syncState).toHaveBeenCalledWith(context.state);
        });

        it('pushKey should call remoteContextManager.pushKey', () => {
            context.pushKey('singleKey', 'singleValue');
            expect(context.remoteContextManager.pushKey).toHaveBeenCalledWith('singleKey', 'singleValue');
        });

        describe('get', () => {
            it('should return value from local state', () => {
                context.state = { data: { myKey: 'myValue' } };
                expect(context.get('myKey')).toBe('myValue');
            });

            it('should return undefined if key not found', () => {
                context.state = { data: { myKey: 'myValue' } };
                expect(context.get('otherKey')).toBeUndefined();
            });

            it('should return undefined if state is null/undefined', () => {
                context.state = null;
                expect(context.get('myKey')).toBeUndefined();
            });

            it('should call pullState if pullFirst is true', () => {
                context.state = { data: { myKey: 'myValue' } };
                jest.spyOn(context, 'pullState');
                context.get('myKey', true);
                expect(context.pullState).toHaveBeenCalledTimes(1);
            });
        });

        it('getRemotecontextRoot should return source from manager', () => {
             // Ensure the mock getter is set up correctly for this test instance
             Object.defineProperty(context.remoteContextManager, 'remotecontextRoot', {
                 get: jest.fn(() => 'specificTestSource'),
                 configurable: true
             });
             expect(context.getRemotecontextRoot()).toBe('specificTestSource');
             expect(Object.getOwnPropertyDescriptor(context.remoteContextManager, 'remotecontextRoot').get).toHaveBeenCalled();
        });

        describe('getState', () => {
            it('should return the current state', () => {
                expect(context.getState()).toBe(context.state);
            });

            it('should call pullState if pullFirst is true', () => {
                jest.spyOn(context, 'pullState');
                context.getState(true);
                expect(context.pullState).toHaveBeenCalledTimes(1);
            });
        });

        describe('getConfig', () => {
            it('should return the entire processed config if no key provided', () => {
                expect(context.getConfig()).toBe(mockExtractedConfig);
            });

            it('should return specific config value if key provided', () => {
                expect(context.getConfig('OTHER_CONFIG')).toBe('value');
            });

            it('should return undefined if key not found in config', () => {
                expect(context.getConfig('NON_EXISTENT_KEY')).toBeUndefined();
            });

             it('should return undefined if config is null/undefined', () => {
                 context.config = null;
                 expect(context.getConfig('OTHER_CONFIG')).toBeUndefined();
             });

            it('should call pullState if pullFirst is true', () => {
                jest.spyOn(context, 'pullState');
                context.getConfig(null, true);
                expect(context.pullState).toHaveBeenCalledTimes(1);
            });
        });

        describe('getFlags', () => {
            beforeEach(() => {
                context.state = { flags: { flagA: true, flagB: false } };
            });

            it('should return all flags if no key provided', () => {
                expect(context.getFlags()).toEqual({ flagA: true, flagB: false });
            });

            it('should return specific flag value if key provided', () => {
                expect(context.getFlags('flagA')).toBe(true);
                expect(context.getFlags('flagB')).toBe(false);
            });

            it('should return undefined if key not found', () => {
                expect(context.getFlags('flagC')).toBeUndefined();
            });

            it('should return undefined if state or state.flags is missing', () => {
                context.state = null;
                expect(context.getFlags('flagA')).toBeUndefined();
                context.state = {};
                expect(context.getFlags('flagA')).toBeUndefined();
            });

            it('should call pullState if pullFirst is true', () => {
                jest.spyOn(context, 'pullState');
                context.getFlags(null, true);
                expect(context.pullState).toHaveBeenCalledTimes(1);
            });
        });

        describe('getData', () => {
             beforeEach(() => {
                 context.state = { data: { dataA: 'valueA', dataB: 123 } };
             });

            it('should return all data if no key provided', () => {
                expect(context.getData()).toEqual({ dataA: 'valueA', dataB: 123 });
            });

            it('should return specific data value if key provided', () => {
                expect(context.getData('dataA')).toBe('valueA');
                expect(context.getData('dataB')).toBe(123);
            });

            it('should return undefined if key not found', () => {
                expect(context.getData('dataC')).toBeUndefined();
            });

            it('should return undefined if state or state.data is missing', () => {
                context.state = null;
                expect(context.getData('dataA')).toBeUndefined();
                context.state = {};
                expect(context.getData('dataA')).toBeUndefined();
            });

            it('should call pullState if pullFirst is true', () => {
                jest.spyOn(context, 'pullState');
                context.getData(null, true);
                expect(context.pullState).toHaveBeenCalledTimes(1);
            });
        });

        describe('set', () => {
            let initialTimestamp;
             beforeEach(() => {
                 context.state = { data: { existing: 'old' }, flags: {}, dateModified: Date.now() };
                 initialTimestamp = context.state.dateModified;
                 // Mock Date.now for predictable timestamps
                 jest.spyOn(Date, 'now').mockReturnValue(initialTimestamp + 1000);
                 jest.spyOn(context, '_validateKey').mockReturnValue(true); // Assume valid keys for most tests
                 jest.spyOn(console, 'error').mockImplementation(() => {});
             });
             afterEach(() => {
                 Date.now.mockRestore();
                 console.error.mockRestore();
             });

            it('should set value in local state data', () => {
                context.set('newKey', 'newValue');
                expect(context.state.data.newKey).toBe('newValue');
                expect(context.state.data.existing).toBe('old'); // Ensure it doesn't overwrite others
            });

            it('should update dateModified in local state', () => {
                context.set('newKey', 'newValue');
                expect(context.state.dateModified).toBe(initialTimestamp + 1000);
            });

            it('should not push change by default', () => {
                context.set('newKey', 'newValue');
                expect(context.remoteContextManager.updateRemoteProperty).not.toHaveBeenCalled();
            });

            it('should push change if pushChange is true', () => {
                context.set('newKey', 'newValue', true);
                expect(context.remoteContextManager.updateRemoteProperty).toHaveBeenCalledWith('data.newKey', 'newValue');
            });

            it('should only push change and not modify local state if remoteOnly is true', () => {
                context.state.data = { existing: 'old' }; // Reset state
                context.set('newKey', 'newValue', false, true); // pushChange is ignored if remoteOnly=true
                expect(context.state.data.newKey).toBeUndefined();
                expect(context.state.data.existing).toBe('old');
                expect(context.state.dateModified).toBe(initialTimestamp); // dateModified not updated
                expect(context.remoteContextManager.updateRemoteProperty).toHaveBeenCalledWith('data.newKey', 'newValue');
            });

             it('should push change if both pushChange and remoteOnly are true', () => {
                 context.set('newKey', 'newValue', true, true);
                 expect(context.state.data.newKey).toBeUndefined(); // Not set locally
                 expect(context.remoteContextManager.updateRemoteProperty).toHaveBeenCalledWith('data.newKey', 'newValue');
             });

            it('should initialize state.data if it does not exist', () => {
                context.state = {}; // Clear state
                context.set('firstKey', 'firstValue');
                expect(context.state.data).toEqual({ firstKey: 'firstValue' });
                expect(context.state.dateModified).toBe(initialTimestamp + 1000);
            });

             it('should not set or push if key is invalid', () => {
                 context._validateKey.mockReturnValue(false);
                 context.set(null, 'value', true);
                 expect(context.state.data[null]).toBeUndefined();
                 expect(context.remoteContextManager.updateRemoteProperty).not.toHaveBeenCalled();
                 expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Invalid key 'null'"));
             });
        });

        describe('setRemoteLocation', () => {
             let initialTimestamp;
             beforeEach(() => {
                 context.state = { data: {}, flags: {}, dateModified: Date.now() };
                 initialTimestamp = context.state.dateModified;
                 jest.spyOn(Date, 'now').mockReturnValue(initialTimestamp + 1000);
                 jest.spyOn(context, 'pushState');
                 jest.spyOn(console, 'error').mockImplementation(() => {});
             });
             afterEach(() => {
                 Date.now.mockRestore();
                 console.error.mockRestore();
             });

            it('should call manager methods to set source and context', () => {
                context.setRemoteLocation('newSource');
                expect(context.remoteContextManager.setRemotecontextRoot).toHaveBeenCalledWith('newSource');
                expect(context.remoteContextManager.setRemoteContext).toHaveBeenCalledWith('newSource', undefined); // Assuming remoteObjectName is undefined by default
            });

            it('should update local dateModified', () => {
                context.setRemoteLocation('newSource');
                expect(context.state.dateModified).toBe(initialTimestamp + 1000);
            });

            it('should not push state by default', () => {
                context.setRemoteLocation('newSource');
                expect(context.pushState).not.toHaveBeenCalled();
            });

            it('should push state if alsoPush is true', () => {
                context.setRemoteLocation('newSource', true);
                expect(context.pushState).toHaveBeenCalledTimes(1);
            });

            it('should catch and log errors during setting', () => {
                 const error = new Error('Set source failed');
                 context.remoteContextManager.setRemotecontextRoot.mockImplementation(() => { throw error; });
                 context.setRemoteLocation('badSource');
                 expect(context.pushState).not.toHaveBeenCalled();
                 expect(console.error).toHaveBeenCalledWith(`Failed to set remote location to 'badSource': ${error.message}`);
            });
        });

        describe('setFlags', () => {
            let initialTimestamp;
             beforeEach(() => {
                 context.state = { data: {}, flags: { existing: false }, dateModified: Date.now() };
                 initialTimestamp = context.state.dateModified;
                 jest.spyOn(Date, 'now').mockReturnValue(initialTimestamp + 1000);
                 jest.spyOn(context, '_validateKey').mockReturnValue(true); // Assume valid keys
                 jest.spyOn(console, 'error').mockImplementation(() => {});
             });
             afterEach(() => {
                 Date.now.mockRestore();
                 console.error.mockRestore();
             });

            it('should set flag in local state flags', () => {
                context.setFlags('newFlag', true);
                expect(context.state.flags.newFlag).toBe(true);
                expect(context.state.flags.existing).toBe(false);
            });

            it('should update dateModified in local state', () => {
                context.setFlags('newFlag', true);
                expect(context.state.dateModified).toBe(initialTimestamp + 1000);
            });

            it('should not push change by default', () => {
                context.setFlags('newFlag', true);
                expect(context.remoteContextManager.updateRemoteProperty).not.toHaveBeenCalled();
            });

            it('should push change if pushChange is true', () => {
                context.setFlags('newFlag', true, true);
                expect(context.remoteContextManager.updateRemoteProperty).toHaveBeenCalledWith('flags.newFlag', true);
            });

            it('should only push change and not modify local state if remoteOnly is true', () => {
                context.state.flags = { existing: false }; // Reset state
                context.setFlags('newFlag', true, false, true);
                expect(context.state.flags.newFlag).toBeUndefined();
                expect(context.state.flags.existing).toBe(false);
                expect(context.state.dateModified).toBe(initialTimestamp);
                expect(context.remoteContextManager.updateRemoteProperty).toHaveBeenCalledWith('flags.newFlag', true);
            });

             it('should push change if both pushChange and remoteOnly are true', () => {
                 context.setFlags('newFlag', true, true, true);
                 expect(context.state.flags.newFlag).toBeUndefined(); // Not set locally
                 expect(context.remoteContextManager.updateRemoteProperty).toHaveBeenCalledWith('flags.newFlag', true);
             });

            it('should initialize state.flags if it does not exist', () => {
                context.state = {}; // Clear state
                context.setFlags('firstFlag', true);
                expect(context.state.flags).toEqual({ firstFlag: true });
                expect(context.state.dateModified).toBe(initialTimestamp + 1000);
            });

             it('should not set or push if key is invalid', () => {
                 context._validateKey.mockReturnValue(false);
                 context.setFlags(null, true, true);
                 expect(context.state.flags[null]).toBeUndefined();
                 expect(context.remoteContextManager.updateRemoteProperty).not.toHaveBeenCalled();
                 expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Invalid key 'null'"));
             });
        });
    });
});