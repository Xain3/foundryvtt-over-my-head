import Handler from './handler';
import Component from './component';

// ./src/baseClasses/handler.test.js


jest.mock('@baseClasses/component.js');

describe('Handler', () => {
    let config;
    let context;
    let utils;
    let handlerInstance;

    beforeEach(() => {
        config = { /* mock config */ };
        context = { /* mock context */ };
        utils = { /* mock utils */ };
        Component.mockClear();
        handlerInstance = new Handler(config, context, utils);
    });

    test('should create an instance of Handler', () => {
        expect(handlerInstance).toBeInstanceOf(Handler);
    });

    test('should call Component constructor with correct parameters', () => {
        expect(Component).toHaveBeenCalledWith(config, context, utils);
    });

    test('should inherit from Component', () => {
        expect(handlerInstance).toBeInstanceOf(Component);
    });
});