import Manager from './manager';
import Base from '../base';


jest.mock('@baseClasses/base.js');

describe('Manager', () => {
    let context, config, utils, component;

    beforeEach(() => {
        utils = {
            hookFormatter: jest.fn(),
            logger: console
        };
        config = {
            CONSTANTS: {
                MODULE: {
                SHORT_NAME: "OMH", // Short name of the module
                ID: "foundryvtt-over-my-head",  // Module ID
                NAME: "OverMyHead", // Module name
                CONTEXT_REMOTE: "moduleContext", // Context remote path within the module object
                DEFAULTS: {
                    DEBUG_MODE: true, // Debug mode default value
                    ONLY_GM: true, // Load only for GM default value
                },
                SETTINGS: {}
                }
            },
            HOOKS: {},
          };
        context = { someContext: 'contextValue' };
        component = new Manager(config, context, utils);
    });

    test('should be an instance of Base', () => {
        expect(component).toBeInstanceOf(Base);
    });

    test('should be an instance of Manager', () => {
        expect(component).toBeInstanceOf(Manager);
    }
    );

    test('should initialize utils correctly', () => {
        expect(component.utils).toBe(utils);
    });

    test('should initialize logger correctly', () => {
        expect(component.logger).toBe(utils.logger);
    });


    test('should call super with proper parameters', () => {    
        expect(Base).toHaveBeenCalledWith({
            config,
            context,
            shouldLoadConfig: true,
            shouldLoadContext: true,
            shouldLoadGame: true,
        });
    });
});