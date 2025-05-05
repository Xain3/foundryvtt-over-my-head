import CONSTANTS, { MODULE, Constants, CONTEXT } from './constants.js';

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

describe('CONTEXT constant', () => {
    it('should be defined', () => {
        expect(CONTEXT).toBeDefined();
    });

    it('should be an object', () => {
        expect(typeof CONTEXT).toBe('object');
    });

    it('should have INIT property and it should be an object', () => {
        expect(CONTEXT.INIT).toBeDefined();
        expect(typeof CONTEXT.INIT).toBe('object');
    });

    describe('INIT object', () => {
        it('should have flags property and it should be an object', () => {
            expect(CONTEXT.INIT.flags).toBeDefined();
            expect(typeof CONTEXT.INIT.flags).toBe('object');
        });

        it('should have flags.settingsReady property and it should be a boolean', () => {
            expect(typeof CONTEXT.INIT.flags.settingsReady).toBe('boolean');
        });

        it('should have data property and it should be an object', () => {
            expect(CONTEXT.INIT.data).toBeDefined();
            expect(typeof CONTEXT.INIT.data).toBe('object');
        });
    });

    it('should have DEFAULTS property and it should be an object', () => {
        expect(CONTEXT.DEFAULTS).toBeDefined();
        expect(typeof CONTEXT.DEFAULTS).toBe('object');
    });

    describe('DEFAULTS object', () => {
        it('should have REMOTE property and it should be an object', () => {
            expect(CONTEXT.DEFAULTS.REMOTE).toBeDefined();
            expect(typeof CONTEXT.DEFAULTS.REMOTE).toBe('object');
        });

        it('should have REMOTE.ROOT property and it should be a string', () => {
            expect(typeof CONTEXT.DEFAULTS.REMOTE.ROOT).toBe('string');
        });

        it('should have REMOTE.PATH property and it should be a string', () => {
            expect(typeof CONTEXT.DEFAULTS.REMOTE.PATH).toBe('string');
        });

        it('should have REMOTE.DATA_PATH property and it should be a string', () => {
            expect(typeof CONTEXT.DEFAULTS.REMOTE.DATA_PATH).toBe('string');
        });

        it('should have REMOTE.FLAGS_PATH property and it should be a string', () => {
            expect(typeof CONTEXT.DEFAULTS.REMOTE.FLAGS_PATH).toBe('string');
        });

        it('should have REMOTE.SETTINGS_PATH property and it should be a string', () => {
            expect(typeof CONTEXT.DEFAULTS.REMOTE.SETTINGS_PATH).toBe('string');
        });
        it('should have REMOTE.ROOT_MAP property and it should be a function', () => {
            expect(typeof CONTEXT.DEFAULTS.REMOTE.ROOT_MAP).toBe('function');
        });
        it('should have ROOT_MAP function that returns an object', () => {
            const rootMap = CONTEXT.DEFAULTS.REMOTE.ROOT_MAP(global, MODULE);
            expect(rootMap).toBeDefined();
            expect(typeof rootMap).toBe('object');
        });
        it('should have ROOT_MAP function that returns an object with expected properties', () => {
            const rootMap = CONTEXT.DEFAULTS.REMOTE.ROOT_MAP(global, MODULE);
            expect(rootMap).toHaveProperty('window');
            expect(rootMap).toHaveProperty('document');
            expect(rootMap).toHaveProperty('game');
            expect(rootMap).toHaveProperty('user');
            expect(rootMap).toHaveProperty('world');
            expect(rootMap).toHaveProperty('canvas');
            expect(rootMap).toHaveProperty('ui');
            expect(rootMap).toHaveProperty('local');
            expect(rootMap).toHaveProperty('session');
            expect(rootMap).toHaveProperty('module');
            expect(rootMap).toHaveProperty('invalid');
        });
    });
});


describe('Constants class', () => {
    it('should initialize with default values', () => {
        const constants = new Constants();
        // Check against the imported CONTEXT constant
        expect(constants.CONTEXT).toEqual(CONTEXT);
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
        // Define a custom context object matching the new structure
        const customContext = {
            INIT: {
                flags: {
                    settingsReady: true,
                },
                data: { customData: true },
            },
            DEFAULTS: {
                REMOTE: {
                    ROOT: "customRoot",
                    PATH: "customPath",
                    DATA_PATH: 'customData',
                    FLAGS_PATH: 'customFlags',
                    SETTINGS_PATH: 'customSettings',
                }
            }
        };
        const customModule = {
            SHORT_NAME: "CustomOMH",
            ID: "custom-foundryvtt-over-my-head",
            NAME: "CustomOverMyHead",
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

        // Pass the custom context object
        const constants = new Constants(customContext, customModule, customLocalization, customHandlers);
        expect(constants.CONTEXT).toEqual(customContext);
        expect(constants.MODULE).toEqual(customModule);
        expect(constants.LOCALIZATION).toEqual(customLocalization);
        expect(constants.HANDLERS).toEqual(customHandlers);
    });
});

describe('CONSTANTS instance', () => {
    it('should be an instance of Constants', () => {
        expect(CONSTANTS).toBeInstanceOf(Constants);
    });

    it('should have the correct CONTEXT property', () => {
        // Check against the imported CONTEXT constant
        expect(CONSTANTS.CONTEXT).toEqual(CONTEXT);
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