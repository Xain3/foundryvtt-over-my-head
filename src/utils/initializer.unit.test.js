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

const mockRegisterSettings = jest.fn();
const mockLocalizeSettings = jest.fn();
const mockSettingsHandler = { 
    registerSettings: mockRegisterSettings,
    localizeSettings: mockLocalizeSettings
};

const MOCK_CONSTANTS = {
    hooks: {
        settingsReady: 'settingsReady',
        contextReady: 'contextReady'
    },
    settings: {
        setting1: 'value1',
        setting2: 'value2'
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
        mockLocalizeSettings.mockClear();
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
        it('should call registerSettings with constants.settings', () => {
            initializer._registerSettings({ settings: mockSettingsHandler });
            expect(mockRegisterSettings).toHaveBeenCalledWith(MOCK_CONSTANTS.settings);
            expect(mockLog).toHaveBeenCalledWith('Registering settings');
            expect(mockLog).toHaveBeenCalledWith('Settings registered');
        });

        it('should handle missing handlers gracefully', () => {
            initializer._registerSettings();
            expect(mockRegisterSettings).not.toHaveBeenCalled();
            expect(mockLog).toHaveBeenCalledWith('Registering settings');
            expect(mockError).toHaveBeenCalledWith('No settings handler found. Skipping registration.');
        });

        it('should handle handlers without settings property', () => {
            initializer._registerSettings({ otherHandler: {} });
            expect(mockRegisterSettings).not.toHaveBeenCalled();
            expect(mockLog).toHaveBeenCalledWith('Registering settings');
            expect(mockError).toHaveBeenCalledWith('No settings handler found. Skipping registration.');
        });

        it('should call registerSettings with provided config parameter', () => {
            const config = { foo: 'bar' };
            initializer._registerSettings({ settings: mockSettingsHandler }, config);
            expect(mockRegisterSettings).toHaveBeenCalledWith(MOCK_CONSTANTS.settings);
        });

        it('should handle handlers with settings but no registerSettings method', () => {
            initializer._registerSettings({ settings: { someOtherMethod: jest.fn() } });
            expect(mockRegisterSettings).not.toHaveBeenCalled();
            expect(mockLog).toHaveBeenCalledWith('Registering settings');
            expect(mockError).toHaveBeenCalledWith('No settings handler found. Skipping registration.');
        });

        it('should handle null handlers', () => {
            initializer._registerSettings(null);
            expect(mockRegisterSettings).not.toHaveBeenCalled();
            expect(mockLog).toHaveBeenCalledWith('Registering settings');
            expect(mockError).toHaveBeenCalledWith('No settings handler found. Skipping registration.');
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

        it('should use provided config when initializing context', async () => {
            const config = { foo: 'baz' };
            const promise = initializer.initializeContext(config);
            await hooks.i18nInit();
            expect(MockContextClass).toHaveBeenCalledWith(config);
        });

        it('should use constants when config is null and constants available', async () => {
            const promise = initializer.initializeContext(null);
            await hooks.i18nInit();
            expect(MockContextClass).toHaveBeenCalledWith(MOCK_CONSTANTS);
        });

        it('should throw error when config is null and no constants available', async () => {
            const badInitializer = new Initializer(
                null,
                MOCK_MANIFEST,
                mockLogger,
                mockFormatError,
                mockFormatHook,
                MockContextClass
            );
            expect(() => badInitializer.initializeContext(null)).toThrow(/Formatted:/);
            expect(mockFormatError).toHaveBeenCalledWith(
                expect.stringContaining('No configuration provided.'),
                expect.objectContaining({ includeCaller: true, caller: 'Initializer' })
            );
        });
    });

    describe('initializeSettings', () => {
        beforeEach(() => {
            initializer.context = mockContextInstance;
        });

        it('should set up init hook and call settingsReady', () => {
            initializer._registerSettings = jest.fn();
            const handlers = { settings: mockSettingsHandler };
            initializer.initializeSettings(handlers);
            expect(Hooks.once).toHaveBeenCalledWith('init', expect.any(Function));
            expect(Hooks.once).toHaveBeenCalledWith('i18nInit', expect.any(Function));
            // Simulate init
            hooks.init();
            expect(initializer._registerSettings).toHaveBeenCalledWith(handlers);
            expect(mockLog).toHaveBeenCalledWith('Initializing module');
            expect(mockLog).toHaveBeenCalledWith('Module initialized');
            expect(mockContextInstance.setFlags).toHaveBeenCalledWith('settingsReady', true);
            expect(Hooks.callAll).toHaveBeenCalledWith('settingsReady');
        });

        it('should call _localizeSettings on i18nInit hook', () => {
            initializer._localizeSettings = jest.fn();
            const handlers = { settings: mockSettingsHandler };
            initializer.initializeSettings(handlers);
            expect(Hooks.once).toHaveBeenCalledWith('i18nInit', expect.any(Function));
            // Simulate i18nInit
            hooks.i18nInit();
            expect(initializer._localizeSettings).toHaveBeenCalledWith(handlers);
        });

        it('should use provided config parameter', () => {
            initializer._registerSettings = jest.fn();
            const config = { foo: 'baz' };
            const handlers = { settings: mockSettingsHandler };
            initializer.initializeSettings(handlers, config);
            hooks.init();
            expect(initializer._registerSettings).toHaveBeenCalledWith(handlers);
        });

        it('should use constants when config is null and constants available', () => {
            initializer._registerSettings = jest.fn();
            const handlers = { settings: mockSettingsHandler };
            initializer.initializeSettings(handlers, null);
            hooks.init();
            expect(initializer._registerSettings).toHaveBeenCalledWith(handlers);
        });

        it('should throw error when config is null and no constants available', () => {
            const badInitializer = new Initializer(
                null,
                MOCK_MANIFEST,
                mockLogger,
                mockFormatError,
                mockFormatHook,
                MockContextClass
            );
            const handlers = { settings: mockSettingsHandler };
            expect(() => badInitializer.initializeSettings(handlers, null)).toThrow(/Formatted:/);
            expect(mockFormatError).toHaveBeenCalledWith(
                expect.stringContaining('No configuration provided.'),
                expect.objectContaining({ includeCaller: true, caller: 'Initializer' })
            );
        });
    });

    describe('_localizeSettings', () => {
        it('should call localizeSettings and log success when handler exists', () => {
            const handlers = { settings: mockSettingsHandler };
            initializer._localizeSettings(handlers);
            expect(mockLocalizeSettings).toHaveBeenCalledTimes(1);
            expect(mockLog).toHaveBeenCalledWith('Settings localized');
        });

        it('should warn when handlers is null', () => {
            initializer._localizeSettings(null);
            expect(mockLocalizeSettings).not.toHaveBeenCalled();
            expect(mockWarn).toHaveBeenCalledWith('No settings localization handler found');
        });

        it('should warn when handlers has no settings property', () => {
            const handlersWithoutSettings = { otherHandler: {} };
            initializer._localizeSettings(handlersWithoutSettings);
            expect(mockLocalizeSettings).not.toHaveBeenCalled();
            expect(mockWarn).toHaveBeenCalledWith('No settings localization handler found');
        });

        it('should warn when settings has no localizeSettings method', () => {
            const handlersWithoutLocalize = { settings: { registerSettings: mockRegisterSettings } };
            initializer._localizeSettings(handlersWithoutLocalize);
            expect(mockLocalizeSettings).not.toHaveBeenCalled();
            expect(mockWarn).toHaveBeenCalledWith('No settings localization handler found');
        });

        it('should handle undefined handlers gracefully', () => {
            initializer._localizeSettings(undefined);
            expect(mockLocalizeSettings).not.toHaveBeenCalled();
            expect(mockWarn).toHaveBeenCalledWith('No settings localization handler found');
        });
    });
});