import Initializer from './initializer.js';

/**
 * @file initializer.unit.test.js
 * @description Unit tests for the Initializer class, covering context initialization, settings registration, and error handling.
 * @path src/utils/initializer.unit.test.js
 */


const mockLog = jest.fn();
const mockWarn = jest.fn();
const mockLogger = {
    log: mockLog,
    warn: mockWarn
};

const mockFormatError = jest.fn((msg) => `Formatted: ${msg}`);

const mockContextInstance = { setFlags: jest.fn() };
const MockContextClass = jest.fn(() => mockContextInstance);

const mockRegisterSettings = jest.fn();
const mockSettingsHandler = { registerSettings: mockRegisterSettings };

const MOCK_CONSTANTS = {
    hooks: {
        settingsReady: 'settingsReady'
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
            MockContextClass,
            { foo: 'bar' }
        );
        mockContextInstance.setFlags.mockClear();
    });


    describe('initializeContextObject', () => {
        it('should create a context with provided params', () => {
            const params = { foo: 'baz' };
            const ctx = initializer.initializeContextObject(params);
            expect(MockContextClass).toHaveBeenCalledWith(params);
            expect(ctx).toBe(mockContextInstance);
            expect(mockLog).toHaveBeenCalledWith('Initializing context');
            expect(mockLog).toHaveBeenCalledWith('Context initialized');
        });

        it('should warn and use defaults if params are invalid', () => {
            const ctx = initializer.initializeContextObject('not-an-object');
            expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining('invalid'));
            expect(MockContextClass).toHaveBeenCalledWith(undefined);
            expect(ctx).toBe(mockContextInstance);
        });
    });

    describe('registerSettings', () => {
        it('should call registerSettings with constants', () => {
            initializer.registerSettings({ settings: mockSettingsHandler });
            expect(mockRegisterSettings).toHaveBeenCalledWith(MOCK_CONSTANTS);
            expect(mockLog).toHaveBeenCalledWith('Registering settings');
            expect(mockLog).toHaveBeenCalledWith('Settings registered');
        });

        it('should call registerSettings with provided config parameter', () => {
            const config = { foo: 'bar' };
            initializer.registerSettings({ settings: mockSettingsHandler }, config);
            expect(mockRegisterSettings).toHaveBeenCalledWith(MOCK_CONSTANTS);
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
        });

        it('should use provided config when initializing context', async () => {
            const config = { foo: 'baz' };
            const promise = initializer.initializeContext(config);
            await hooks.i18nInit();
            expect(MockContextClass).toHaveBeenCalledWith(config);
        });

        it('should throw error when config is null and no constants available', async () => {
            const badInitializer = new Initializer(
                null, 
                MOCK_MANIFEST, 
                mockLogger, 
                mockFormatError, 
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
            initializer.registerSettings = jest.fn();
            initializer.initializeSettings();
            expect(Hooks.once).toHaveBeenCalledWith('init', expect.any(Function));
            // Simulate init
            hooks.init();
            expect(initializer.registerSettings).toHaveBeenCalled();
            expect(mockLog).toHaveBeenCalledWith('Initializing module');
            expect(mockLog).toHaveBeenCalledWith('Module initialized');
            expect(mockContextInstance.setFlags).toHaveBeenCalledWith('settingsReady', true);
            expect(Hooks.callAll).toHaveBeenCalledWith('settingsReady');
        });

        it('should use provided config parameter', () => {
            initializer.registerSettings = jest.fn();
            const config = { foo: 'baz' };
            initializer.initializeSettings(config);
            hooks.init();
            expect(initializer.registerSettings).toHaveBeenCalled();
        });

        it('should throw error when config is null and no constants available', () => {
            const badInitializer = new Initializer(
                null, 
                MOCK_MANIFEST, 
                mockLogger, 
                mockFormatError, 
                MockContextClass
            );
            expect(() => badInitializer.initializeSettings(null)).toThrow(/Formatted:/);
            expect(mockFormatError).toHaveBeenCalledWith(
                expect.stringContaining('No configuration provided.'),
                expect.objectContaining({ includeCaller: true, caller: 'Initializer' })
            );
        });
    });
});