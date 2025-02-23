import Config from './config.js';
import Base from '../baseClasses/base.js';
import CONSTANTS from './constants.js';
import HOOKS from './hooks.js';

// ./tests/unit/config/config.test.js

jest.mock('./constants.js', () => {
    return {
        CONTEXT_INIT: {
            flags: {
                settingsReady: false,
            },
            data: {
            }
        },
        MODULE: {
            SHORT_NAME: "OMH",
            ID: "foundryvtt-over-my-head",
            NAME: "OverMyHead",
            CONTEXT_REMOTE: "moduleContext",
            DEFAULTS: {
                DEBUG_MODE: true,
                ONLY_GM: true,
            },
            SETTINGS: {
                INTERFACE: {}
            }
        },
        LOCALIZATION: {
            SETTINGS: "settings"
        },
        HANDLERS: {
            TILE: {
                PLACEABLE_TYPE: "tiles",
                ALLOWED_CORNERS: ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'],
            },
            TOKEN: {
                PLACEABLE_TYPE: "tokens",
                ALLOWED_CORNERS: ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'],
            }
        }
    }
}
);

jest.mock('./hooks.js', () => {
    return {
        INIT: 'init',
        READY: 'ready',
        RENDER: 'render',
        UPDATE: 'update',
        DELETE: 'delete',
        CLOSE: 'close',
        CONFIG: 'config',
        PRE_CREATE: 'preCreate',
        CREATE: 'create',
        PRE_UPDATE: 'preUpdate',
        PRE_DELETE: 'preDelete',
        PRE_RENDER: 'preRender',
        PRE_CLOSE: 'preClose',
        PRE_CONFIG: 'preConfig',
        POST_CREATE: 'postCreate',
        POST_UPDATE: 'postUpdate',
        POST_DELETE: 'postDelete',
        POST_RENDER: 'postRender',
        POST_CLOSE: 'postClose',
        POST_CONFIG: 'postConfig',
        PRE_RENDER_HOOKS: ['preCreate', 'preUpdate', 'preDelete', 'preRender', 'preClose', 'preConfig'],
        POST_RENDER_HOOKS: ['postCreate', 'postUpdate', 'postDelete', 'postRender', 'postClose', 'postConfig']
    }
});

describe('Config class tests', () => {
    it('should create an instance of Config', () => {
        const config = new Config();
        expect(config).toBeInstanceOf(Config);
    });

    it('should extend Base', () => {
        const config = new Config();
        expect(config).toBeInstanceOf(Base);
    });

    it('should have a CONSTANTS property that equals the imported CONSTANTS', () => {
        const config = new Config();
        expect(config.CONSTANTS).toBe(CONSTANTS);
    });

    it('should have a HOOKS property that equals the imported HOOKS', () => {
        const config = new Config();
        expect(config.HOOKS).toBe(HOOKS);
    });

    it('should throw an error if no constants are provided', () => {
        expect(() => {
        new Config(null);
        }).toThrow('Constants is set up to be loaded, but no constants were provided.');
    });

    it('should throw an error if no hooks are provided', () => {
        expect(() => {
        new Config({}, null);
        }).toThrow('Hooks is set up to be loaded, but no hooks were provided.');
    });

    it('should throw an error if constants is not an object', () => {
        expect(() => {
        new Config('iAmNotAnObject');
        }).toThrow('Constants must be an object.');
    });

    it('should throw an error if hooks is not an object', () => {
        expect(() => {
        new Config({}, 'iAmNotAnObject');
        }).toThrow('Hooks must be an object.');
    });
});