import CONSTANTS, { MODULE, Constants } from './constants.js';

describe('MODULE constant', () => {
    it('should be defined', () => {
        expect(MODULE).toBeDefined();
    });

    it('should be an object', () => {
        expect(typeof(MODULE)).toBe('object');
    });

    it('should not be empty', () => {
        expect(Object.keys(MODULE).length).toBeGreaterThan(0);
    });

    it('should have SHORT_NAME and it should be a string', () => {
        expect(typeof(MODULE.SHORT_NAME)).toBe('string');
    });

    it('should have ID and it should be a string', () => {
        expect(typeof(MODULE.ID)).toBe('string');
    });

    it('should have NAME and it should be a string', () => {
        expect(typeof(MODULE.NAME)).toBe('string');
    });

    it('should have CONTEXT_REMOTE and it should be a string', () => {
        expect(typeof(MODULE.CONTEXT_REMOTE)).toBe('string');
    });

    it('should have DEFAULTS and it should be an object', () => {
        expect(typeof(MODULE.DEFAULTS)).toBe('object');
    });

    describe('DEFAULTS object', () => {
        it('should have DEBUG_MODE and it should be a boolean', () => {
            expect(typeof(MODULE.DEFAULTS.DEBUG_MODE)).toBe('boolean');
        });

        it('should have ONLY_GM and it should be a boolean', () => {
            expect(typeof(MODULE.DEFAULTS.ONLY_GM)).toBe('boolean');
        });
    });

    it('should have SETTINGS with expected properties', () => {
        expect(MODULE.SETTINGS).toBeDefined();
        expect(typeof MODULE.SETTINGS).toBe('object');
        expect(MODULE.SETTINGS.INTERFACE).toBeDefined();
    });
});

describe('Constants class', () => {
    it('should initialize with default values', () => {
        const constants = new Constants();
        expect(constants.CONTEXT_INIT).toEqual({
            flags: {
                settingsReady: false,
            },
            data: {},
        });
        expect(constants.MODULE).toBe(MODULE);
        expect(constants.LOCALIZATION).toEqual({
            SETTINGS: "settings",
        });
        expect(constants.HANDLERS).toEqual({
            TILE: {
                PLACEABLE_TYPE: "tiles",
                ALLOWED_CORNERS: ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'],
            },
            TOKEN: {
                PLACEABLE_TYPE: "tokens",
                ALLOWED_CORNERS: ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'],
            }
        });
    });

    it('should allow overriding default values', () => {
        const customContextInit = {
            flags: {
                settingsReady: true,
            },
            data: { customData: true },
        };
        const customModule = {
            SHORT_NAME: "CustomOMH",
            ID: "custom-foundryvtt-over-my-head",
            NAME: "CustomOverMyHead",
            CONTEXT_REMOTE: "customModuleContext",
            DEFAULTS: {
                DEBUG_MODE: false,
                ONLY_GM: false,
            },
            SETTINGS: {
                CUSTOM_SETTING: true,
                INTERFACE: "customInterface",
            }
        };
        const customLocalization = {
            SETTINGS: "customSettings",
        };
        const customHandlers = {
            TILE: {
                PLACEABLE_TYPE: "customTiles",
                ALLOWED_CORNERS: ['center'],
            },
            TOKEN: {
                PLACEABLE_TYPE: "customTokens",
                ALLOWED_CORNERS: ['center'],
            }
        };

        const constants = new Constants(customContextInit, customModule, customLocalization, customHandlers);
        expect(constants.CONTEXT_INIT).toEqual(customContextInit);
        expect(constants.MODULE).toEqual(customModule);
        expect(constants.LOCALIZATION).toEqual(customLocalization);
        expect(constants.HANDLERS).toEqual(customHandlers);
    });
});

describe('CONSTANTS instance', () => {
    it('should be an instance of Constants', () => {
        expect(CONSTANTS).toBeInstanceOf(Constants);
    });

    it('should have the correct CONTEXT_INIT property', () => {
        expect(CONSTANTS.CONTEXT_INIT).toEqual({
            flags: {
                settingsReady: false,
            },
            data: {},
        });
    });

    it('should have the same MODULE property as MODULE constant', () => {
        expect(CONSTANTS.MODULE).toBe(MODULE);
    });

    it('should have the correct LOCALIZATION property', () => {
        expect(CONSTANTS.LOCALIZATION).toEqual({
            SETTINGS: "settings",
        });
    });

    it('should have the correct HANDLERS property', () => {
        expect(CONSTANTS.HANDLERS).toEqual({
            TILE: {
                PLACEABLE_TYPE: "tiles",
                ALLOWED_CORNERS: ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'],
            },
            TOKEN: {
                PLACEABLE_TYPE: "tokens",
                ALLOWED_CORNERS: ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'],
            }
        });
    });
});