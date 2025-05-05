// @mocks/constants.js

class MockConstants {
    constructor() {
        this.CONTEXT = {
            INIT: {
                flags: {
                    settingsReady: false,
                },
                data: {},
            },
            DEFAULTS: {
                REMOTE: {
                    ROOT: "module",
                    PATH: "moduleContext",
                    DATA_PATH: 'data',
                    FLAGS_PATH: 'flags',
                    SETTINGS_PATH: 'settings',
                }
            }
        }

        this.MODULE = {
            SHORT_NAME: 'Mod_',
            ID: 'mod-id',
            NAME: 'Mod Name',
            DEFAULTS: {
                DEBUG_MODE: true,
                ONLY_GM: true,
            },
            CONTEXT_REMOTE: jest.fn().mockImplementation(() => { 
                console.warn('CONTEXT_REMOTE called is deprecated, yet called at ', new Error().stack);
                return this.CONTEXT.DEFAULTS.REMOTE.PATH;
            }),
            SETTINGS: {
                CONFIG: {
                    ALLOWED_SETTING_PROPS: { // Allowed setting properties from the SettingConfig interface
                        key: "string",
                        namespace: "string",
                        name: "string",
                        hint: "string",
                        scope: "string",
                        config: "boolean",
                        type: "any",
                        choices: "Object",
                        range: "Object",
                        default: "any",
                        onChange: "Function",
                        input: "CustomFormInput",
                    },
                    ESSENTIAL_SETTING_PROPS: ['name', 'hint', 'type', 'default', 'onChange'], // Essential setting properties
                },
                mockSetting: {
                    props: {
                        key: "mockSetting",
                        namespace: "mockSetting",
                        name: "Mock Setting",
                        hint: "This is a mock setting",
                        scope: "world",
                        config: true,
                        type: String,
                        choices: { "Option 1": "option1", "Option 2": "option2" },
                        range: { min: 0, max: 10, step: 1 },
                        default: "option1",
                        onChange: jest.fn(),
                        input: 'CustomFormInput',
                    },
                onChangeActions:{
                        hooksCalled: ['callHook'],
                        contextFlags: ['setFlag'],
                    },
                },
            },            
        }

        this.LOCALIZATION = {
            SETTINGS: "settings",
        },
        this.HANDLERS = {
            TILE: {
                PLACEABLE_TYPE: "tiles",
                ALLOWED_CORNERS: ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'],
            },
            TOKEN: {
                PLACEABLE_TYPE: "tokens",
                ALLOWED_CORNERS: ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'],
            },
        }
    }
}

export default MockConstants;