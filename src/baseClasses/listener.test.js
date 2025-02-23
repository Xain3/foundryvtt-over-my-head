import Listener from './listener';
import Component from './component';

// ./tests/unit/baseClasses/listener.test.js


jest.mock('@baseClasses/component.js');

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
        expect(Component).toHaveBeenCalledWith(config, context, utils);
    });

    test('should handle events using handlers', () => {
        const event = 'testEvent';
        const data = { key: 'value' };
        listenerInstance.handleEvent(event, data);
        expect(listenerInstance.handlers.onEvent).toHaveBeenCalledWith(event, data);
    });
});