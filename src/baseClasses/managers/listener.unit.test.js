import Listener from './listener';
import Manager from './manager';

jest.mock('@baseClasses/managers/manager.js');

describe('Listener', () => {
    let config;
    let context;
    let utils;
    let handlers;
    let listenerInstance;

    beforeEach(() => {
        config = {
            CONSTANTS: {
                MODULE: {
                    DEFAULTS: {
                        DEBUG_MODE: false
                    }
                }
            }
        };
        context = { getFlag: jest.fn() };
        utils = {};
        handlers = { onEvent: jest.fn() };
        listenerInstance = new Listener(config, context, utils, handlers);
    });

    test('should initialize correctly with provided parameters', () => {
        expect(listenerInstance.handlers).toBe(handlers);
    });

    test('should call super constructor with config, context, and utils', () => {
        expect(Manager).toHaveBeenCalledWith(config, context, utils);
    });

    test('should handle events using handlers', () => {
        const event = 'testEvent';
        const data = { key: 'value' };
        listenerInstance.handleEvent(event, data);
        expect(listenerInstance.handlers.onEvent).toHaveBeenCalledWith(event, data);
    });
});