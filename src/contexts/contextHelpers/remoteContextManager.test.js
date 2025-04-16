import RemoteContextManager from './remoteContextManager';
import set from 'lodash/set';
import Mocks from '@mocks/mocks';

// Mock lodash/set with actual implementation for testing
jest.mock('lodash/set', () => {
    // Import the actual 'set' function only for the mock implementation
    const originalSet = jest.requireActual('lodash/set');
    return jest.fn((obj, path, value) => originalSet(obj, path, value));
});

describe('RemoteContextManager', () => {
    let remoteContextManager;
    let mocks
    let mockConfig;
    let mockModule;
    let mockGame;
    let mockUser;
    let mockWorld;
    let mockCanvas;
    let mockUi;
    let mockLocalStorage;
    let mockSessionStorage;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Create mock objects
        mocks = Mocks.getAllMocks();
        mockConfig = mocks.config;
        mockModule = { // Mock the module object where context might be stored
            [mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE]: {}
        };
        mockGame = { // Mock game object
            settings: {
                get: jest.fn((moduleId, key) => {
                    if (moduleId === mockConfig.CONSTANTS.MODULE.ID && key === mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE) {
                        return mockGame.settings[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] || {};
                    }
                    return undefined;
                }),
                set: jest.fn((moduleId, key, value) => {
                    if (moduleId === mockConfig.CONSTANTS.MODULE.ID && key === mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE) {
                        mockGame.settings[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = value;
                    }
                }),
                [mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE]: {} // Initial empty context for game.settings
            },
            modules: {
                get: jest.fn().mockReturnValue(mockModule) // Mock game.modules.get to return our mock module
            },
            user: { // Mock user object
                getFlag: jest.fn((scope, key) => mockUser.flags?.[scope]?.[key]),
                setFlag: jest.fn((scope, key, value) => {
                    if (!mockUser.flags) mockUser.flags = {};
                    if (!mockUser.flags[scope]) mockUser.flags[scope] = {};
                    mockUser.flags[scope][key] = value;
                    // Simulate setting the context directly for testing get/update
                    if (scope === mockConfig.CONSTANTS.MODULE.ID && key === mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE) {
                         mockUser[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = value;
                    }
                    return Promise.resolve();
                }),
                unsetFlag: jest.fn((scope, key) => {
                     if (mockUser.flags?.[scope]?.[key]) {
                         delete mockUser.flags[scope][key];
                     }
                     if (scope === mockConfig.CONSTANTS.MODULE.ID && key === mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE) {
                         delete mockUser[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE];
                     }
                     return Promise.resolve();
                }),
                [mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE]: {} // Initial empty context for user flags
            },
            world: { // Mock world object
                 [mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE]: {}
            },
            canvas: { // Mock canvas object
                 [mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE]: {}
            },
            ui: { // Mock ui object
                 [mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE]: {}
            }
        };
        mockUser = mockGame.user; // Alias for convenience
        mockWorld = mockGame.world;
        mockCanvas = mockGame.canvas;
        mockUi = mockGame.ui;

        // Mock global objects
        global.game = mockGame;
        global.canvas = mockCanvas;
        global.ui = mockUi;

        // Mock storage (basic object simulation)
        mockLocalStorage = {};
        mockSessionStorage = {};
        global.localStorage = {
            getItem: jest.fn(key => mockLocalStorage[key] || null),
            setItem: jest.fn((key, value) => mockLocalStorage[key] = value),
            removeItem: jest.fn(key => delete mockLocalStorage[key]),
            clear: jest.fn(() => mockLocalStorage = {})
        };
        global.sessionStorage = {
            getItem: jest.fn(key => mockSessionStorage[key] || null),
            setItem: jest.fn((key, value) => mockSessionStorage[key] = value),
            removeItem: jest.fn(key => delete mockSessionStorage[key]),
            clear: jest.fn(() => mockSessionStorage = {})
        };


        // Instantiate with default 'module' source
        remoteContextManager = new RemoteContextManager('module', mockConfig);
        // Ensure the manager uses the mocked module object
        remoteContextManager.remotecontextRoot = mockModule;
        remoteContextManager.remoteContext = mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE];
    });

    describe('Constructor', () => {
        it('should initialize with default module source', () => {
            expect(remoteContextManager.moduleId).toBe(mockConfig.CONSTANTS.MODULE.ID);
            expect(remoteContextManager.remoteObjectName).toBe(mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE);
            expect(remoteContextManager.remotecontextRoot).toBe(mockModule); // Determined via mocked game.modules.get
            expect(remoteContextManager.remoteContext).toEqual({});
            expect(remoteContextManager.get).toBe(remoteContextManager.getRemoteContext);
            expect(remoteContextManager.update).toBe(remoteContextManager.updateRemoteContext);
            expect(remoteContextManager.clear).toBe(remoteContextManager.clearRemoteContext);
            expect(remoteContextManager.sync).toBe(remoteContextManager.syncState);
        });

        it('should initialize with a specified source (e.g., user)', () => {
            const userRCM = new RemoteContextManager('user', mockConfig);
            expect(userRCM.remotecontextRoot).toBe(mockUser);
            expect(userRCM.remoteContext).toEqual({}); // Assumes user object initially has no context set
        });
    });

    describe('setRemotecontextRoot', () => {
        it('should set remotecontextRoot correctly for valid sources', () => {
            remoteContextManager.setRemotecontextRoot('game');
            expect(remoteContextManager.remotecontextRoot).toBe(mockGame);
            remoteContextManager.setRemotecontextRoot('user');
            expect(remoteContextManager.remotecontextRoot).toBe(mockUser);
            remoteContextManager.setRemotecontextRoot('world');
            expect(remoteContextManager.remotecontextRoot).toBe(mockWorld);
            remoteContextManager.setRemotecontextRoot('canvas');
            expect(remoteContextManager.remotecontextRoot).toBe(mockCanvas);
            remoteContextManager.setRemotecontextRoot('ui');
            expect(remoteContextManager.remotecontextRoot).toBe(mockUi);
            remoteContextManager.setRemotecontextRoot('local');
            expect(remoteContextManager.remotecontextRoot).toBe(global.localStorage);
            remoteContextManager.setRemotecontextRoot('session');
            expect(remoteContextManager.remotecontextRoot).toBe(global.sessionStorage);
            remoteContextManager.setRemotecontextRoot('module');
            expect(remoteContextManager.remotecontextRoot).toBe(mockModule);
        });

        it('should return the source when returnValue is true', () => {
            expect(remoteContextManager.setRemotecontextRoot('game', true)).toBe(mockGame);
        });

        it('should not set the property when setProperty is false', () => {
            const originalSource = remoteContextManager.remotecontextRoot;
            remoteContextManager.setRemotecontextRoot('game', false, false);
            expect(remoteContextManager.remotecontextRoot).toBe(originalSource);
        });

        it('should throw error for missing source', () => {
            expect(() => remoteContextManager.setRemotecontextRoot(undefined)).toThrow('Source must be provided and cannot be empty');
        });

        it('should throw error for non-string source in determinecontextRoot', () => {
            expect(() => remoteContextManager.setRemotecontextRoot(123)).toThrow('Remote context location must be a string');
        });

         it('should throw error for empty string source', () => {
            expect(() => remoteContextManager.setRemotecontextRoot('')).toThrow('Source must be provided and cannot be empty');
        });
    });

    describe('determinecontextRoot', () => {
        it('should return the correct source for valid string inputs', () => {
            expect(remoteContextManager.determinecontextRoot('game')).toBe(mockGame);
            expect(remoteContextManager.determinecontextRoot('user')).toBe(mockUser);
            expect(remoteContextManager.determinecontextRoot('world')).toBe(mockWorld);
            expect(remoteContextManager.determinecontextRoot('canvas')).toBe(mockCanvas);
            expect(remoteContextManager.determinecontextRoot('ui')).toBe(mockUi);
            expect(remoteContextManager.determinecontextRoot('local')).toBe(global.localStorage);
        });

        it('should return null for invalid string inputs', () => {
            expect(remoteContextManager.determinecontextRoot('invalid')).toBe(null);
            expect(remoteContextManager.determinecontextRoot('')).toBe(null);
        });
        it('should throw error for non-string inputs', () => {
            expect(() => remoteContextManager.determinecontextRoot(123)).toThrow('Remote context location must be a string');
            expect(() => remoteContextManager.determinecontextRoot({})).toThrow('Remote context location must be a string');
            expect(() => remoteContextManager.determinecontextRoot([])).toThrow('Remote context location must be a string');
        });
    });
    
    describe('setRemoteContext', () => {
        it('should set remoteContext correctly', () => {
            const newContext = { data: 'test' };
            mockModule.newLocation = newContext;
            remoteContextManager.setRemoteContext(mockModule, 'newLocation');
            expect(remoteContextManager.remoteContext).toBe(newContext);
        });

        it('should create an empty object if location does not exist', () => {
            remoteContextManager.setRemoteContext(mockModule, 'nonExistentLocation');
            expect(mockModule.nonExistentLocation).toEqual({});
            expect(remoteContextManager.remoteContext).toEqual({});
        });

        it('should return the context when returnValue is true', () => {
            const newContext = { data: 'returnTest' };
            mockModule.returnLocation = newContext;
            expect(remoteContextManager.setRemoteContext(mockModule, 'returnLocation', true)).toBe(newContext);
        });

        it('should not set the property when setProperty is false', () => {
            const originalContext = remoteContextManager.remoteContext;
            mockModule.noSetLocation = { data: 'noSet' };
            remoteContextManager.setRemoteContext(mockModule, 'noSetLocation', false, false);
            expect(remoteContextManager.remoteContext).toBe(originalContext);
        });

        it('should throw error for missing source or location', () => {
            expect(() => remoteContextManager.setRemoteContext(undefined, 'loc')).toThrow('Source and location must be provided');
            expect(() => remoteContextManager.setRemoteContext(mockModule, undefined)).toThrow('Source and location must be provided');
        });

        it('should throw error if source location is not an object', () => {
            mockModule.notObject = 123;
            expect(() => remoteContextManager.setRemoteContext(mockModule, 'notObject')).toThrow('Source location must be an object');
        });

        it('should warn if setting the same context location', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            remoteContextManager.setRemoteContext(mockModule, mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE);
            expect(consoleWarnSpy).toHaveBeenCalledWith('Remote context location is the same as the current location, no changes made');
            consoleWarnSpy.mockRestore();
        });
    });

    describe('getRemoteContext', () => {
        beforeEach(() => {
            // Set a known state
            remoteContextManager.remoteContext = { data: 'testData', count: 5, dateModified: 12345 };
        });

        it('should return the entire context when no item is specified', () => {
            expect(remoteContextManager.getRemoteContext()).toEqual({ data: 'testData', count: 5, dateModified: 12345 });
        });

        it('should return a specific item using direct property access', () => {
            expect(remoteContextManager.getRemoteContext({ item: 'data' })).toBe('testData');
            expect(remoteContextManager.getRemoteContext({ item: 'count' })).toBe(5);
        });

        it('should return undefined for non-existent items (direct access)', () => {
             const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
             expect(remoteContextManager.getRemoteContext({ item: 'nonExistent' })).toBeUndefined();
             expect(consoleWarnSpy).toHaveBeenCalledWith("Item 'nonExistent' not found in remote context via direct access.");
             consoleWarnSpy.mockRestore();
        });

        it('should return a specific item using .get() method if available', () => {
            const mockContextWithGet = {
                _internal: { data: 'getTestData', count: 10 },
                get: jest.fn(item => item ? mockContextWithGet._internal[item] : mockContextWithGet._internal)
            };
            remoteContextManager.remoteContext = mockContextWithGet;
            expect(remoteContextManager.getRemoteContext({ item: 'data' })).toBe('getTestData');
            expect(mockContextWithGet.get).toHaveBeenCalledWith('data');
        });

         it('should return the whole context using .get() method if available and no item specified', () => {
            const mockContextWithGet = {
                _internal: { data: 'getTestData', count: 10 },
                get: jest.fn(item => item ? mockContextWithGet._internal[item] : mockContextWithGet._internal)
            };
            remoteContextManager.remoteContext = mockContextWithGet;
            expect(remoteContextManager.getRemoteContext()).toEqual({ data: 'getTestData', count: 10 });
            expect(mockContextWithGet.get).toHaveBeenCalledWith(); // Called without args
        });

        it('should throw error if context is not initialized', () => {
            remoteContextManager.remoteContext = null;
            expect(() => remoteContextManager.getRemoteContext()).toThrow('Remote context is not initialized.');
        });

        it('should throw error if item is not a string', () => {
            expect(() => remoteContextManager.getRemoteContext({ item: 123 })).toThrow('Item must be a string');
        });

         it('should throw error if context is not an object and has no get method', () => {
            remoteContextManager.remoteContext = 123; // Not an object, no .get()
            expect(() => remoteContextManager.getRemoteContext()).toThrow('Cannot retrieve context: Remote context does not have a .get() method and is not a standard object.');
            expect(() => remoteContextManager.getRemoteContext({item: 'someKey'})).toThrow("Cannot retrieve item 'someKey': Remote context does not have a .get() method and is not a standard object.");
        });
    });

    describe('updateRemoteContext', () => {
        it('should update the remote context object and add dateModified', () => {
            const newValue = { data: 'newData' };
            const beforeTimestamp = Date.now();
            remoteContextManager.updateRemoteContext(newValue);
            const afterTimestamp = Date.now();

            expect(remoteContextManager.remoteContext).toHaveProperty('data', 'newData');
            expect(remoteContextManager.remoteContext).toHaveProperty('dateModified');
            expect(remoteContextManager.remoteContext.dateModified).toBeGreaterThanOrEqual(beforeTimestamp);
            expect(remoteContextManager.remoteContext.dateModified).toBeLessThanOrEqual(afterTimestamp);
            // Check the actual source object was updated
            expect(mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE]).toEqual(remoteContextManager.remoteContext);
        });

         it('should update context using source.set when source has set method (like game.settings)', () => {
            // Switch to game.settings source for this test
            const settingsRCM = new RemoteContextManager('game', mockConfig);
            settingsRCM.remotecontextRoot = mockGame.settings; // Explicitly set mock
            settingsRCM.remoteContext = mockGame.settings[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE];

            const newValue = { settingsData: 'updated' };
            const beforeTimestamp = Date.now();
            // NOTE: The current implementation calls set(moduleId, remoteObjectName, value)
            // This assumes the remoteObjectName is the *key* within the settings for that module.
            settingsRCM.updateRemoteContext(newValue, mockGame.settings, mockConfig.CONSTANTS.MODULE.ID); // Pass moduleId as location
            const afterTimestamp = Date.now();

            // Verify game.settings.set was called correctly
            expect(mockGame.settings.set).toHaveBeenCalledWith(
                mockConfig.CONSTANTS.MODULE.ID, // Module ID
                mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE, // Setting Key (remoteObjectName)
                expect.objectContaining({
                    settingsData: 'updated',
                    dateModified: expect.any(Number)
                })
            );

            // Verify the internal context reference is updated (assuming .set updated the underlying storage)
            // We need to simulate the update for the test assertion
            mockGame.settings[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = mockGame.settings.set.mock.calls[0][2]; // Get the value passed to set
            settingsRCM.remoteContext = mockGame.settings[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE]; // Update internal ref

            expect(settingsRCM.remoteContext).toHaveProperty('settingsData', 'updated');
            expect(settingsRCM.remoteContext.dateModified).toBeGreaterThanOrEqual(beforeTimestamp);
            expect(settingsRCM.remoteContext.dateModified).toBeLessThanOrEqual(afterTimestamp);
        });

        it('should log a warning when attempting to update via source.set', () => {
            const location = remoteContextManager.moduleId;
            const warning = `Attempting update via source.set - ensure '${location}' is the correct key for the source.`
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            remoteContextManager.updateRemoteContext({ data: 'test' }, mockGame.settings, location);
            expect(consoleWarnSpy).toHaveBeenCalledWith(warning);
            consoleWarnSpy.mockRestore();
        });

        it('should log an error if something goes wrong while updating the context', () => {
            const location = remoteContextManager.moduleId;
            const error = {message: 'Test error'};
            const expectedMessage = `Failed to update remote context at location '${location}': ${error.message}`
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { throw new Error(error.message); });
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            remoteContextManager.updateRemoteContext({ data: 'test' }, mockGame.settings, location);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expectedMessage);
            consoleWarnSpy.mockRestore();
        });

        it('should throw error if value is undefined', () => {
            const message = 'Value cannot be undefined. State not pushed to remote context';
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            remoteContextManager.updateRemoteContext(undefined)
            expect(consoleErrorSpy).toHaveBeenCalledWith(message);
            consoleErrorSpy.mockRestore();
        });

        it('should throw error if value is not an object', () => {
            const message = 'Value must be an object. State not pushed to remote context';
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            remoteContextManager.updateRemoteContext(123)
            expect(consoleErrorSpy).toHaveBeenCalledWith(message);
            remoteContextManager.updateRemoteContext(null)
            expect(consoleErrorSpy).toHaveBeenCalledWith(message);
            remoteContextManager.updateRemoteContext('string')
            expect(consoleErrorSpy).toHaveBeenCalledWith(message);
            consoleErrorSpy.mockRestore();
        });

        it('should throw error if source or location is undefined', () => {
            const message = 'Source and location must be defined. State not pushed to remote context';
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            remoteContextManager.remotecontextRoot = undefined;
            remoteContextManager.updateRemoteContext({}, remoteContextManager.remotecontextRoot, 'loc');
            expect(consoleErrorSpy).toHaveBeenCalledWith(message);
            remoteContextManager.remotecontextRoot = mockModule;
            remoteContextManager.updateRemoteContext({}, undefined, 'loc');
            expect(consoleErrorSpy).toHaveBeenCalledWith(message);
            remoteContextManager.updateRemoteContext({}, mockModule, undefined);
            expect(consoleErrorSpy).toHaveBeenCalledWith(message);
            consoleErrorSpy.mockRestore();
        });
    });

    describe('pushState', () => {
        let consoleErrorSpy

        beforeEach(() => {
            consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        });

        afterEach(() => {
            consoleErrorSpy.mockRestore();
        });

        it('should push local state to remote context', () => {
            const localState = { data: 'localData', count: 10 };
            const beforeTimestamp = Date.now();
            remoteContextManager.pushState(localState);
            const afterTimestamp = Date.now();

            expect(remoteContextManager.remoteContext).toHaveProperty('data', 'localData');
            expect(remoteContextManager.remoteContext).toHaveProperty('count', 10);
            expect(remoteContextManager.remoteContext).toHaveProperty('dateModified');
            expect(remoteContextManager.remoteContext.dateModified).toBeGreaterThanOrEqual(beforeTimestamp);
            expect(remoteContextManager.remoteContext.dateModified).toBeLessThanOrEqual(afterTimestamp);
            expect(mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE]).toEqual(remoteContextManager.remoteContext);
        });

        it('should log error if remote context is not defined', () => {
            remoteContextManager.remoteContext = undefined;
            remoteContextManager.pushState({});
            expect(consoleErrorSpy).toHaveBeenCalledWith('Remote context is not defined. State not pushed to remote context');
            consoleErrorSpy.mockRestore();
        });

        it('should log error if local state is not defined', () => {
            remoteContextManager.pushState(undefined);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Local state is not defined. State not pushed to remote context');
            consoleErrorSpy.mockRestore();
        });

        it('should log error if local state is not an object', () => {
            remoteContextManager.pushState(123);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Local state must be an object. State not pushed to remote context');
            remoteContextManager.pushState(null);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Local state must be an object. State not pushed to remote context');
            consoleErrorSpy.mockRestore();
        });
    });

    describe('pullState', () => {
        let localState;
        let consoleErrorSpy;

        beforeEach(() => {
            localState = { existing: 'data', dateModified: 5000 };
            remoteContextManager.remoteContext = { remote: 'value', count: 20, dateModified: 10000 };
            // Ensure the source object reflects the remote context for the test
            mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = remoteContextManager.remoteContext;
            consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        });

        afterEach(() => {
            consoleErrorSpy.mockRestore();
        });

        it('should merge remote state into local state by default', () => {
            const beforeTimestamp = Date.now();
            remoteContextManager.pullState(localState);
            const afterTimestamp = Date.now();

            expect(localState).toHaveProperty('existing', 'data'); // Preserved
            expect(localState).toHaveProperty('remote', 'value'); // Added
            expect(localState).toHaveProperty('count', 20); // Added
            expect(localState).toHaveProperty('dateModified'); // Updated
            expect(localState.dateModified).toBeGreaterThanOrEqual(beforeTimestamp);
            expect(localState.dateModified).toBeLessThanOrEqual(afterTimestamp);
        });

        it('should overwrite local state when overwriteLocal is true', () => {
            const beforeTimestamp = Date.now();
            remoteContextManager.pullState(localState, true);
             const afterTimestamp = Date.now();

            expect(localState).not.toHaveProperty('existing'); // Overwritten
            expect(localState).toHaveProperty('remote', 'value');
            expect(localState).toHaveProperty('count', 20);
            expect(localState).toHaveProperty('dateModified'); // Updated (originally from remote, then updated by pull)
            expect(localState.dateModified).toBeGreaterThanOrEqual(beforeTimestamp);
            expect(localState.dateModified).toBeLessThanOrEqual(afterTimestamp);
        });

        it('should handle empty remote state', () => {
            remoteContextManager.remoteContext = {};
            mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = {};
            remoteContextManager.pullState(localState, true); // Overwrite with empty
            expect(localState).toEqual({ dateModified: expect.any(Number) }); // Only timestamp remains after overwrite and update
        });

        it('should log error if local state target is not defined', () => {
            remoteContextManager.pullState(undefined);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Local state target object is not defined'));
        });

        it('should log error if local state target is not an object', () => {
            remoteContextManager.pullState(123);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Local state target must be an object.'));
            remoteContextManager.pullState(null);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Local state target must be an object.'));
        });

        it('should log error if remote state cannot be retrieved (e.g., context undefined)', () => {
            remoteContextManager.remoteContext = undefined; // Simulate retrieval failure
            jest.spyOn(remoteContextManager, 'getRemoteContext').mockImplementation(() => undefined);
            remoteContextManager.pullState(localState);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Remote state could not be retrieved'));        
        });
    });

    describe('clearRemoteContext', () => {
        it('should clear the remote context and set dateModified', () => {
            remoteContextManager.remoteContext = { data: 'toClear' };
            mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = remoteContextManager.remoteContext; // Sync source

            const beforeTimestamp = Date.now();
            remoteContextManager.clearRemoteContext();
            const afterTimestamp = Date.now();

            expect(remoteContextManager.remoteContext).toEqual({ dateModified: expect.any(Number) });
            expect(remoteContextManager.remoteContext.dateModified).toBeGreaterThanOrEqual(beforeTimestamp);
            expect(remoteContextManager.remoteContext.dateModified).toBeLessThanOrEqual(afterTimestamp);
            expect(mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE]).toEqual(remoteContextManager.remoteContext);
        });

        it('should log error if remote context is not defined', () => {
            consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            remoteContextManager.remoteContext = undefined;
            remoteContextManager.clearRemoteContext();
            expect(consoleErrorSpy).toHaveBeenCalledWith('Remote context is not defined. Remote context not cleared');
            consoleErrorSpy.mockRestore();
        });
    });

    describe('syncState', () => {
        let localState;

        beforeEach(() => {
            localState = { data: 'local', dateModified: 10000 };
            remoteContextManager.remoteContext = { data: 'remote', dateModified: 5000 };
            mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = remoteContextManager.remoteContext; // Sync source
            jest.spyOn(remoteContextManager, 'pushState');
            jest.spyOn(remoteContextManager, 'pullState');
            jest.spyOn(console, 'log').mockImplementation(); // Suppress console logs
            jest.spyOn(console, 'warn').mockImplementation(); // Suppress console warnings
        });

        afterEach(() => {
             jest.restoreAllMocks(); // Restore console spies
        });

        it('should push local state if newer', () => {
            remoteContextManager.syncState(localState);
            expect(remoteContextManager.pushState).toHaveBeenCalledWith(localState);
            expect(remoteContextManager.pullState).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Local state is newer, pushing.');
        });

        it('should pull remote state if newer', () => {
            localState.dateModified = 2000; // Make local older
            remoteContextManager.syncState(localState);
            expect(remoteContextManager.pushState).not.toHaveBeenCalled();
            expect(remoteContextManager.pullState).toHaveBeenCalledWith(localState, true); // Should overwrite
            expect(console.log).toHaveBeenCalledWith('Remote state is newer, pulling.');
        });

        it('should do nothing if timestamps are equal', () => {
            localState.dateModified = 5000; // Match remote timestamp
            remoteContextManager.syncState(localState);
            expect(remoteContextManager.pushState).not.toHaveBeenCalled();
            expect(remoteContextManager.pullState).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Local and remote states are in sync or timestamps missing.');
        });

        it('should do nothing if timestamps are missing', () => {
            delete localState.dateModified;
            delete remoteContextManager.remoteContext.dateModified;
            mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = remoteContextManager.remoteContext;
            remoteContextManager.syncState(localState);
            expect(remoteContextManager.pushState).not.toHaveBeenCalled();
            expect(remoteContextManager.pullState).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Local and remote states are in sync or timestamps missing.');
        });

         it('should treat missing local timestamp as older if remote exists', () => {
            delete localState.dateModified; // local is 0
            remoteContextManager.remoteContext.dateModified = 5000; // remote is 5000
            mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = remoteContextManager.remoteContext;
            remoteContextManager.syncState(localState);
            expect(remoteContextManager.pushState).not.toHaveBeenCalled();
            expect(remoteContextManager.pullState).toHaveBeenCalledWith(localState, true);
            expect(console.log).toHaveBeenCalledWith('Remote state is newer, pulling.');
        });

         it('should treat missing remote timestamp as older if local exists', () => {
            localState.dateModified = 10000; // local is 10000
            delete remoteContextManager.remoteContext.dateModified; // remote is 0
            mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = remoteContextManager.remoteContext;
            remoteContextManager.syncState(localState);
            expect(remoteContextManager.pushState).toHaveBeenCalledWith(localState);
            expect(remoteContextManager.pullState).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Local state is newer, pushing.');
        });

        it('should throw error if local state is invalid', () => {
            const message = 'Valid local state object must be provided for sync. State not synced';
            consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            remoteContextManager.syncState(undefined);
            expect(consoleErrorSpy).toHaveBeenCalledWith(message);
            remoteContextManager.syncState(null);
            expect(consoleErrorSpy).toHaveBeenCalledWith(message);
            remoteContextManager.syncState(123);
            expect(consoleErrorSpy).toHaveBeenCalledWith(message);
            remoteContextManager.syncState('string');
            expect(consoleErrorSpy).toHaveBeenCalledWith(message);
            consoleErrorSpy.mockRestore();
        });

        it('should warn and return if remote state is invalid or inaccessible', () => {
             remoteContextManager.remoteContext = undefined; // Simulate inaccessible
             jest.spyOn(remoteContextManager, 'getRemoteContext').mockReturnValue(undefined); // Ensure get returns undefined
             remoteContextManager.syncState(localState);
             expect(console.warn).toHaveBeenCalledWith('Remote state is invalid or inaccessible, cannot sync.');
             expect(remoteContextManager.pushState).not.toHaveBeenCalled();
             expect(remoteContextManager.pullState).not.toHaveBeenCalled();
        });
    });

    describe('updateRemoteProperty', () => {
        beforeEach(() => {
            // Set initial complex state
            remoteContextManager.remoteContext = {
                data: { nested: { value: 1 } },
                flags: { flagA: true },
                topLevel: 'initial',
                dateModified: 10000
            };
            mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = remoteContextManager.remoteContext; // Sync source
            jest.spyOn(remoteContextManager, 'updateRemoteContext'); // Spy on the method used internally
        });

        it('should update a nested property using dot notation', () => {
            const beforeTimestamp = Date.now();
            remoteContextManager.updateRemoteProperty('data.nested.value', 2);
            const afterTimestamp = Date.now();

            const expectedState = {
                data: { nested: { value: 2 } }, // Updated
                flags: { flagA: true },
                topLevel: 'initial',
                dateModified: expect.any(Number) // Updated
            };

            expect(remoteContextManager.updateRemoteContext).toHaveBeenCalledWith(
                expectedState,
                remoteContextManager.remotecontextRoot,
                remoteContextManager.remoteObjectName
            );

            // Check the actual state after the mocked updateRemoteContext call (simulate its effect)
            const updatedState = remoteContextManager.updateRemoteContext.mock.calls[0][0];
            expect(updatedState.data.nested.value).toBe(2);
            expect(updatedState.dateModified).toBeGreaterThanOrEqual(beforeTimestamp);
            expect(updatedState.dateModified).toBeLessThanOrEqual(afterTimestamp);
        });

        it('should update a top-level property', () => {
            const beforeTimestamp = Date.now();
            remoteContextManager.updateRemoteProperty('topLevel', 'updated');
            const afterTimestamp = Date.now();

            const expectedState = {
                data: { nested: { value: 1 } },
                flags: { flagA: true },
                topLevel: 'updated', // Updated
                dateModified: expect.any(Number) // Updated
            };
            expect(remoteContextManager.updateRemoteContext).toHaveBeenCalledWith(
                expectedState,
                remoteContextManager.remotecontextRoot,
                remoteContextManager.remoteObjectName
            );
             const updatedState = remoteContextManager.updateRemoteContext.mock.calls[0][0];
             expect(updatedState.topLevel).toBe('updated');
             expect(updatedState.dateModified).toBeGreaterThanOrEqual(beforeTimestamp);
             expect(updatedState.dateModified).toBeLessThanOrEqual(afterTimestamp);
        });

        it('should add a new property if the path does not exist', () => {
            remoteContextManager.updateRemoteProperty('flags.newFlag.deep', true);
            const expectedState = {
                data: { nested: { value: 1 } },
                flags: { flagA: true, newFlag: { deep: true } }, // Added
                topLevel: 'initial',
                dateModified: expect.any(Number)
            };
            expect(remoteContextManager.updateRemoteContext).toHaveBeenCalledWith(
                expectedState,
                remoteContextManager.remotecontextRoot,
                remoteContextManager.remoteObjectName
            );
        });

         it('should allow setting a property to null or undefined', () => {
            remoteContextManager.updateRemoteProperty('data.nested', null);
            let expectedState = {
                data: { nested: null }, // Set to null
                flags: { flagA: true },
                topLevel: 'initial',
                dateModified: expect.any(Number)
            };
            expect(remoteContextManager.updateRemoteContext).toHaveBeenCalledWith(expectedState, expect.anything(), expect.anything());

            remoteContextManager.updateRemoteProperty('topLevel', undefined);
             expectedState = {
                data: { nested: null },
                flags: { flagA: true },
                topLevel: undefined, // Set to undefined
                dateModified: expect.any(Number)
            };
             // Need to get the latest call to updateRemoteContext
             expect(remoteContextManager.updateRemoteContext).toHaveBeenLastCalledWith(expectedState, expect.anything(), expect.anything());
        });

        it('should handle updating when the remote context is initially empty', () => {
            remoteContextManager.remoteContext = {}; // Start empty
            mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = remoteContextManager.remoteContext;
            remoteContextManager.updateRemoteProperty('newData.value', 123);
            const expectedState = {
                newData: { value: 123 },
                dateModified: expect.any(Number)
            };
             expect(remoteContextManager.updateRemoteContext).toHaveBeenCalledWith(expectedState, expect.anything(), expect.anything());
        
        });
        
        describe('error handling', () => {
            let message;
            let propertyPath;

            beforeEach(() => {
                message = (path) => `Remote context is not defined. Property at path '${propertyPath}' not updated in remote context.`;
            });
            
            it('should log an error if the remote context is null', () => {
                // Test starting from null (getRemoteContext should return {} in this case)
                propertyPath = 'newData.value';
                remoteContextManager.remoteContext = null;
                 mockModule[mockConfig.CONSTANTS.MODULE.CONTEXT_REMOTE] = remoteContextManager.remoteContext;
                 jest.spyOn(remoteContextManager, 'getRemoteContext').mockReturnValueOnce({}); // Simulate get returning empty object
                 const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
                 remoteContextManager.updateRemoteProperty('newData.value', 456);
                 expect(consoleSpy).toHaveBeenCalledWith(message(propertyPath));
                consoleSpy.mockRestore();
            });

            it('should log an error if the remote context is undefined', () => {
                propertyPath = 'path';
                remoteContextManager.remoteContext = undefined;
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
                remoteContextManager.updateRemoteProperty(propertyPath, 'value');
                expect(consoleErrorSpy).toHaveBeenCalledWith(message(propertyPath));
                consoleErrorSpy.mockRestore();
            });

            
            it('should log error if remote context is not defined', () => {
                propertyPath = 'path';
                remoteContextManager.remoteContext = undefined;
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
                remoteContextManager.updateRemoteProperty(propertyPath, 'value');
                expect(consoleErrorSpy).toHaveBeenCalledWith(message(propertyPath));
                consoleErrorSpy.mockRestore();
            });
            
            it('should log error if path is not a non-empty string', () => {
                message = (path) => `Path must be a non-empty string. Property at path '${path}' not updated in remote context.`;
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
                propertyPath = 123;
                remoteContextManager.updateRemoteProperty(propertyPath, 'value');
                expect(consoleErrorSpy).toHaveBeenCalledWith(message(propertyPath));
                propertyPath = '';
                remoteContextManager.updateRemoteProperty(propertyPath, 'value');
                expect(consoleErrorSpy).toHaveBeenCalledWith(message(propertyPath));
                propertyPath = null;
                remoteContextManager.updateRemoteProperty(propertyPath, 'value');
                expect(consoleErrorSpy).toHaveBeenCalledWith(message(propertyPath));
                propertyPath = undefined;
                remoteContextManager.updateRemoteProperty(propertyPath, 'value');
                expect(consoleErrorSpy).toHaveBeenCalledWith(message(propertyPath));
                consoleErrorSpy.mockRestore();
            });
            
            it('should log error if getRemoteContext returns a non-object', () => {
                jest.spyOn(remoteContextManager, 'getRemoteContext').mockReturnValueOnce(123); // Simulate get returning non-object
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
                message = (path) => `Cannot update property: Remote context is not a valid object. Property at path '${path}' not updated in remote context.`;
                propertyPath = 'path';
                remoteContextManager.updateRemoteProperty(propertyPath, 'value');
                expect(consoleErrorSpy).toHaveBeenCalledWith(message(propertyPath));
                consoleErrorSpy.mockRestore();
            });
        });
    });
});