import Localizer from './localizer';
import Utility from '../baseClasses/utility';

// ./src/utils/localizer.test.js


describe('Localizer', () => {
    let mockConfig;
    let mockGameObject;
    let mockI18nService;
    let localizer;

    beforeEach(() => {
        mockConfig = {
            CONSTANTS: {
              MODULE: {
                ID: 'testModule',
              },
            },
        };

        mockI18nService = {
            localize: jest.fn((key) => `Localized: ${key}`),
            format: jest.fn((key, args) => `Formatted: ${key} with ${args.join(', ')}`),
        };

        mockGameObject = {
            i18n: mockI18nService,
        };

        globalThis.game = mockGameObject;
        localizer = new Localizer(mockConfig);
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete globalThis.game;
    });

    it('should extend the Utility class', () => {
        expect(localizer).toBeInstanceOf(Utility);
    });

    it('should initialize the i18nService property from the game object', () => {
        expect(localizer.i18nService).toBe(mockI18nService);
    });

    describe('localize', () => {
        it('should call i18nService.localize with the correct key when no arguments are provided', () => {
            const stringKey = 'testKey';
            const result = localizer.localize(stringKey);

            expect(mockI18nService.localize).toHaveBeenCalledWith('testModule.testKey');
            expect(result).toBe('Localized: testModule.testKey');
        });

        it('should call i18nService.format with the correct key and arguments when additional arguments are provided', () => {
            const stringKey = 'testKey';
            const args = ['arg1', 'arg2'];
            const result = localizer.localize(stringKey, ...args);

            expect(mockI18nService.format).toHaveBeenCalledWith('testModule.testKey', args);
            expect(result).toBe('Formatted: testModule.testKey with arg1, arg2');
        });

        it('should return the localized string when no arguments are provided', () => {
            const stringKey = 'testKey';
            const result = localizer.localize(stringKey);

            expect(result).toBe('Localized: testModule.testKey');
        });

        it('should return the formatted string when additional arguments are provided', () => {
            const stringKey = 'testKey';
            const args = ['arg1', 'arg2'];
            const result = localizer.localize(stringKey, ...args);

            expect(result).toBe('Formatted: testModule.testKey with arg1, arg2');
        });
    });
});