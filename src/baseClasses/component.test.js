import Component from './component';
import Base from './base';

// ./tests/unit/baseClasses/component.test.js

jest.mock('@baseClasses/base.js');

describe('Component', () => {
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
        component = new Component(config, context, utils);
    });

    test('should be an instance of Base', () => {
        expect(component).toBeInstanceOf(Base);
    });

    test('should initialize context correctly', () => {
        expect(component.context).toBe(context);
    });

    test('should initialize utils correctly', () => {
        expect(component.utils).toBe(utils);
    });

    test('should initialize logger correctly', () => {
        expect(component.logger).toBe(utils.logger);
    });


    test('should call super with config', () => {    
        expect(Base).toHaveBeenCalledWith(config);
    });
});