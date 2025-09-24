/**
 * @file initializer.unit.test.mjs
 * @description Unit tests for the Initializer class, covering context initialization, settings registration, and error handling scenarios.
 * @path src/utils/initializer.unit.test.mjs
 */

import Initializer from './initializer.mjs';


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
        it('initializes context immediately when waitHook=false (default)', () => {
            const ctx = initializer.initializeContext();
            expect(Hooks.once).not.toHaveBeenCalledWith('i18nInit', expect.any(Function));
            expect(initializer.context).toBe(mockContextInstance);
            expect(ctx).toBe(mockContextInstance);
            expect(Hooks.callAll).toHaveBeenCalledWith('contextReady');
        });

        it('defers initialization until i18nInit when waitHook=true', () => {
            const ctxBefore = initializer.initializeContext(undefined, true);
            expect(ctxBefore).toBeUndefined();
            expect(Hooks.once).toHaveBeenCalledWith('i18nInit', expect.any(Function));
            // Simulate i18nInit
            hooks.i18nInit();
            expect(initializer.context).toBe(mockContextInstance);
            expect(Hooks.callAll).toHaveBeenCalledWith('contextReady');
        });

        it('uses provided initParams when initializing context (immediate)', () => {
            const initParams = { foo: 'baz' };
            initializer.initializeContext(initParams);
            expect(MockContextClass).toHaveBeenCalledWith(initParams);
        });

        it('uses contextInitParams when null and defaults available (deferred)', () => {
            initializer.initializeContext(null, true);
            hooks.i18nInit();
            expect(MockContextClass).toHaveBeenCalledWith({ foo: 'bar' });
        });

        it('allows undefined params when no defaults available so Context uses its defaults (deferred)', () => {
            const badInitializer = new Initializer(
                MOCK_CONSTANTS,
                MOCK_MANIFEST,
                mockLogger,
                mockFormatError,
                mockFormatHook,
                MockContextClass
            );
            badInitializer.contextInitParams = undefined;
            const ctxBefore = badInitializer.initializeContext(null, true);
            expect(ctxBefore).toBeUndefined();
            hooks.i18nInit();
            expect(MockContextClass).toHaveBeenCalledWith(undefined);
            expect(badInitializer.context).toBe(mockContextInstance);
            expect(mockFormatError).not.toHaveBeenCalled();
        });
    });

    describe('initializeSettings', () => {
        beforeEach(() => {
            initializer.context = mockContextInstance;
        });

        it('registers immediately when waitHook=false (default)', () => {
            initializer._registerSettings = jest.fn();
            initializer.initializeSettings(MockSettingsHandlerClass, {});
            expect(Hooks.once).not.toHaveBeenCalledWith('i18nInit', expect.any(Function));
            expect(initializer._registerSettings).toHaveBeenCalledWith(MockSettingsHandlerClass, {});
                expect(mockLog).toHaveBeenCalledWith('Initializing settings');
            expect(mockLog).toHaveBeenCalledWith('Settings initialized');
            expect(mockContextInstance.setFlags).toHaveBeenCalledWith('settingsReady', true);
            expect(Hooks.callAll).toHaveBeenCalledWith('settingsReady');
        });

        it('defers registration until i18nInit when waitHook=true', () => {
            initializer._registerSettings = jest.fn();
            initializer.initializeSettings(MockSettingsHandlerClass, {}, true);
            expect(Hooks.once).toHaveBeenCalledWith('i18nInit', expect.any(Function));
            // Simulate i18nInit
            hooks.i18nInit();
            expect(initializer._registerSettings).toHaveBeenCalledWith(MockSettingsHandlerClass, {});
            expect(mockLog).toHaveBeenCalledWith('Settings initialized');
            expect(mockContextInstance.setFlags).toHaveBeenCalledWith('settingsReady', true);
            expect(Hooks.callAll).toHaveBeenCalledWith('settingsReady');
        });

        it('warns if context not available to set flag (immediate)', () => {
            initializer._registerSettings = jest.fn();
            initializer.context = null;
            initializer.initializeSettings(MockSettingsHandlerClass, {});
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