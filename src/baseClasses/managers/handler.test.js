import Handler from './handler';
import Manager from './manager';

// ./src/baseClasses/handler.test.js

jest.mock('@baseClasses/managers/manager.js');

describe('Handler', () => {
    let config;
    let context;
    let utils;
    let handlerInstance;

    beforeEach(() => {
        config = { /* mock config */ };
        context = { /* mock context */ };
        utils = { /* mock utils */ };
        Manager.mockClear();
        handlerInstance = new Handler(config, context, utils);
    });

    test('should create an instance of Handler', () => {
        expect(handlerInstance).toBeInstanceOf(Handler);
    });

    test('should call Component constructor with correct parameters', () => {
        expect(Manager).toHaveBeenCalledWith(config, context, utils);
    });

    test('should inherit from Manager', () => {
        expect(handlerInstance).toBeInstanceOf(Manager);
    });
});