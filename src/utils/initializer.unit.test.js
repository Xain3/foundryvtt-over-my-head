/**
 * @file initializer.unit.test.js
 * @description Unit tests for the Initializer class, covering context initialization, settings registration, and error handling scenarios.
 * @path src/utils/initializer.unit.test.js
 */

import Initializer from './initializer.js';


const mockLog = jest.fn();
const mockWarn = jest.fn();
const mockError = jest.fn();
const mockLogger = {
    log: mockLog,
    warn: mockWarn,
    error: mockError
};

const mockFormatError = jest.fn((msg) => `Formatted: ${msg}`);
const mockFormatHook = jest.fn((hook) => hook);

const mockContextInstance = { setFlags: jest.fn() };
const MockContextClass = jest.fn(() => mockContextInstance);

const mockRegister = jest.fn();
class MockSettingsHandlerClass {
    constructor(cfg, utils, context) {
        this.cfg = cfg;
        this.utils = utils;
        this.context = context;
    }
    register() { mockRegister(); }
}
const mockSettingsHandlerInstance = new MockSettingsHandlerClass({}, {}, {});

const MOCK_CONSTANTS = {
    hooks: {
        settingsReady: 'settingsReady',
        contextReady: 'contextReady'
    },
    settings: {
        setting1: 'value1',
        setting2: 'value2'
    },
    moduleManagement: {
        shortName: 'OMH'
    }
};
const MOCK_MANIFEST = { id: 'test-module' };

let hooks = {};
global.Hooks = {
    once: jest.fn((hook, cb) => {
        hooks[hook] = cb;
    }),
    callAll: jest.fn()
};

describe('Initializer', () => {
    let initializer;

    beforeEach(() => {
        jest.clearAllMocks();
        hooks = {};
        initializer = new Initializer(
            MOCK_CONSTANTS,
            MOCK_MANIFEST,
            mockLogger,
            mockFormatError,
            mockFormatHook,
            MockContextClass,
            { foo: 'bar' }
        );
        mockContextInstance.setFlags.mockClear();
    mockRegister.mockClear();
    });

    describe('constructor', () => {
        it('should initialize all properties correctly', () => {
            expect(initializer.constants).toBe(MOCK_CONSTANTS);
            expect(initializer.manifest).toBe(MOCK_MANIFEST);
            expect(initializer.logger).toBe(mockLogger);
            expect(initializer.formatError).toBe(mockFormatError);
            expect(initializer.formatHook).toBe(mockFormatHook);
            expect(initializer.ContextClass).toBe(MockContextClass);
            expect(initializer.contextInitParams).toEqual({ foo: 'bar' });
        });

        it('should handle undefined contextInitParams', () => {
            const initWithoutParams = new Initializer(
                MOCK_CONSTANTS,
                MOCK_MANIFEST,
                mockLogger,
                mockFormatError,
                mockFormatHook,
                MockContextClass
            );
            expect(initWithoutParams.contextInitParams).toBeUndefined();
        });
    });


    describe('_initializeContextObject', () => {
        it('should create a context with provided params', () => {
            const params = { foo: 'baz' };
            const ctx = initializer._initializeContextObject(params);
            expect(MockContextClass).toHaveBeenCalledWith(params);
            expect(ctx).toBe(mockContextInstance);
            expect(mockLog).toHaveBeenCalledWith('Initializing context');
            expect(mockLog).toHaveBeenCalledWith('Context initialized');
        });

        it('should use default contextInitParams when no params provided', () => {
            const ctx = initializer._initializeContextObject();
            expect(MockContextClass).toHaveBeenCalledWith({ foo: 'bar' });
            expect(ctx).toBe(mockContextInstance);
        });

        it('should warn and use defaults if params are invalid', () => {
            const ctx = initializer._initializeContextObject('not-an-object');
            expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining('invalid'));
            expect(MockContextClass).toHaveBeenCalledWith(undefined);
            expect(ctx).toBe(mockContextInstance);
        });

        it('should handle null params gracefully', () => {
            const ctx = initializer._initializeContextObject(null);
            expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining('invalid'));
            expect(MockContextClass).toHaveBeenCalledWith(undefined);
            expect(ctx).toBe(mockContextInstance);
        });
    });

    describe('_registerSettings', () => {
        it('should instantiate SettingsHandler class and call register', () => {
            initializer.context = mockContextInstance;
            const instance = initializer._registerSettings(MockSettingsHandlerClass, {});
            expect(mockLog).toHaveBeenCalledWith('Registering settings');
            expect(mockRegister).toHaveBeenCalledTimes(1);
            expect(mockLog).toHaveBeenCalledWith('Settings registered');
            expect(instance).toBeInstanceOf(MockSettingsHandlerClass);
        });

        it('should accept SettingsHandler instance and call register', () => {
            initializer.context = mockContextInstance;
            const instance = initializer._registerSettings(mockSettingsHandlerInstance, {});
            expect(mockRegister).toHaveBeenCalledTimes(1);
            expect(instance).toBe(mockSettingsHandlerInstance);
        });

        it('should handle invalid handler gracefully', () => {
            initializer._registerSettings(null);
            expect(mockError).toHaveBeenCalledWith('No SettingsHandler provided or invalid handler. Skipping registration.');
            expect(mockRegister).not.toHaveBeenCalled();
        });
    });

    describe('initializeContext', () => {
        it('should resolve with context after i18nInit hook', async () => {
            const promise = initializer.initializeContext();
            expect(Hooks.once).toHaveBeenCalledWith('i18nInit', expect.any(Function));
            // Simulate i18nInit
            await hooks.i18nInit();
            const ctx = await promise;
            expect(ctx).toBe(mockContextInstance);
            expect(initializer.context).toBe(mockContextInstance);
            expect(Hooks.callAll).toHaveBeenCalledWith('contextReady');
        });

        it('should use provided initParams when initializing context', async () => {
            const initParams = { foo: 'baz' };
            const promise = initializer.initializeContext(initParams);
            await hooks.i18nInit();
            expect(MockContextClass).toHaveBeenCalledWith(initParams);
        });

        it('should use contextInitParams when null and defaults available', async () => {
            const promise = initializer.initializeContext(null);
            await hooks.i18nInit();
            expect(MockContextClass).toHaveBeenCalledWith({ foo: 'bar' });
        });

        it('should allow null initParams when no defaults available and let Context use its defaults', async () => {
            const badInitializer = new Initializer(
                MOCK_CONSTANTS,
                MOCK_MANIFEST,
                mockLogger,
                mockFormatError,
                mockFormatHook,
                MockContextClass
            );
            // Ensure there are no defaults
            badInitializer.contextInitParams = undefined;
            const promise = badInitializer.initializeContext(null);
            // Simulate i18nInit
            await hooks.i18nInit();
            const ctx = await promise;
            // Context should be constructed with undefined so it can use its own defaults
            expect(MockContextClass).toHaveBeenCalledWith(undefined);
            expect(ctx).toBe(mockContextInstance);
            // Should not have formatted an error
            expect(mockFormatError).not.toHaveBeenCalled();
        });
    });

    describe('initializeSettings', () => {
        beforeEach(() => {
            initializer.context = mockContextInstance;
        });

        it('should set up init hook and call settingsReady', () => {
            initializer._registerSettings = jest.fn();
            initializer.context = mockContextInstance;
            initializer.initializeSettings(MockSettingsHandlerClass, {});
            expect(Hooks.once).toHaveBeenCalledWith('i18nInit', expect.any(Function));
            // Simulate init
            hooks.i18nInit();
            expect(initializer._registerSettings).toHaveBeenCalledWith(MockSettingsHandlerClass, {});
            expect(mockLog).toHaveBeenCalledWith('Initializing module');
            expect(mockLog).toHaveBeenCalledWith('Module initialized');
            expect(mockContextInstance.setFlags).toHaveBeenCalledWith('settingsReady', true);
            expect(Hooks.callAll).toHaveBeenCalledWith('settingsReady');
        });

        it('should warn if context not available to set flag', () => {
            initializer._registerSettings = jest.fn();
            initializer.context = null;
            initializer.initializeSettings(MockSettingsHandlerClass, {});
            hooks.i18nInit();
            expect(mockWarn).toHaveBeenCalledWith('Context not available to set settingsReady flag during initialization.');
        });
    });

    describe('initializeDevFeatures', () => {
        let mockUtils;
        let mockHooksLogger;

        beforeEach(() => {
            mockHooksLogger = {
                proxyFoundryHooks: jest.fn().mockReturnValue(true)
            };
            mockUtils = {
                static: {
                    HooksLogger: mockHooksLogger
                }
            };
        });

        it('should enable dev features when manifest.flags.dev is true', () => {
            const devManifest = { flags: { dev: true } };
            const devInitializer = new Initializer(
                MOCK_CONSTANTS,
                devManifest,
                mockLogger,
                mockFormatError,
                mockFormatHook,
                MockContextClass
            );

            devInitializer.initializeDevFeatures(mockUtils);

            expect(mockHooksLogger.proxyFoundryHooks).toHaveBeenCalledWith({
                enabled: true,
                logLevel: 'debug',
                moduleFilter: undefined
            });
            expect(mockLog).toHaveBeenCalledWith('Development features enabled.');
        });

        it('should apply module filter when filter is true', () => {
            const devManifest = { flags: { dev: true } };
            const devInitializer = new Initializer(
                MOCK_CONSTANTS,
                devManifest,
                mockLogger,
                mockFormatError,
                mockFormatHook,
                MockContextClass
            );

            devInitializer.initializeDevFeatures(mockUtils, true);

            expect(mockHooksLogger.proxyFoundryHooks).toHaveBeenCalledWith({
                enabled: true,
                logLevel: 'debug',
                moduleFilter: 'OMH'
            });
            expect(mockLog).toHaveBeenCalledWith('Development features enabled.');
        });

        it('should not enable dev features when manifest.flags.dev is false', () => {
            const prodManifest = { flags: { dev: false } };
            const prodInitializer = new Initializer(
                MOCK_CONSTANTS,
                prodManifest,
                mockLogger,
                mockFormatError,
                mockFormatHook,
                MockContextClass
            );

            prodInitializer.initializeDevFeatures(mockUtils);

            expect(mockHooksLogger.proxyFoundryHooks).not.toHaveBeenCalled();
            expect(mockLog).not.toHaveBeenCalledWith('Development features enabled.');
        });

        it('should not enable dev features when manifest.flags.dev is undefined', () => {
            const noDevManifest = { flags: {} };
            const noDevInitializer = new Initializer(
                MOCK_CONSTANTS,
                noDevManifest,
                mockLogger,
                mockFormatError,
                mockFormatHook,
                MockContextClass
            );

            noDevInitializer.initializeDevFeatures(mockUtils);

            expect(mockHooksLogger.proxyFoundryHooks).not.toHaveBeenCalled();
            expect(mockLog).not.toHaveBeenCalledWith('Development features enabled.');
        });

        it('should handle missing moduleManagement.shortName gracefully', () => {
            const constantsWithoutShortName = {
                ...MOCK_CONSTANTS,
                moduleManagement: {}
            };
            const devManifest = { flags: { dev: true } };
            const devInitializer = new Initializer(
                constantsWithoutShortName,
                devManifest,
                mockLogger,
                mockFormatError,
                mockFormatHook,
                MockContextClass
            );

            devInitializer.initializeDevFeatures(mockUtils, true);

            expect(mockHooksLogger.proxyFoundryHooks).toHaveBeenCalledWith({
                enabled: true,
                logLevel: 'debug',
                moduleFilter: undefined
            });
        });

        it('should handle missing utils gracefully', () => {
            const devManifest = { flags: { dev: true } };
            const devInitializer = new Initializer(
                MOCK_CONSTANTS,
                devManifest,
                mockLogger,
                mockFormatError,
                mockFormatHook,
                MockContextClass
            );

            // Should not throw
            expect(() => {
                devInitializer.initializeDevFeatures(null);
            }).not.toThrow();

            expect(mockWarn).toHaveBeenCalledWith('HooksLogger utility not available for development features.');
            expect(mockLog).toHaveBeenCalledWith('Development features enabled.');
        });
    });
});