/**
 * @file handler.test.js
 * @description Unit tests for the Handler base class
 * @path src/baseClasses/handler.test.js
 */

import Handler from './handler.mjs';


describe('Handler', () => {
    let config, utils, context;

    beforeEach(() => {
        config = { foo: 'bar' };
        utils = { log: jest.fn() };
        context = { state: 'init' };
    });

    describe('Initialization and setup', () => {
        it('should initialize with provided config, utils, and context', () => {
            const handler = new Handler(config, utils, context);
            expect(handler.config).toBe(config);
            expect(handler.utils).toBe(utils);
            expect(handler.context).toBe(context);
        });

        it('should default context to empty object if not provided', () => {
            const handler = new Handler(config, utils);
            expect(handler.context).toEqual({});
        });
    });

    describe('update', () => {
        let handler;

        beforeEach(() => {
            handler = new Handler(config, utils, context);
        });

        it('should update config, utils, and context when all are provided', () => {
            const newConfig = { foo: 'baz' };
            const newUtils = { log: jest.fn() };
            const newContext = { state: 'updated' };

            handler.update({ config: newConfig, utils: newUtils, context: newContext });

            expect(handler.config).toBe(newConfig);
            expect(handler.utils).toBe(newUtils);
            expect(handler.context).toBe(newContext);
        });

        it('should update only config if only config is provided', () => {
            const newConfig = { foo: 'baz' };
            handler.update({ config: newConfig });

            expect(handler.config).toBe(newConfig);
            expect(handler.utils).toBe(utils);
            expect(handler.context).toBe(context);
        });

        it('should update only utils if only utils is provided', () => {
            const newUtils = { log: jest.fn() };
            handler.update({ utils: newUtils });

            expect(handler.config).toBe(config);
            expect(handler.utils).toBe(newUtils);
            expect(handler.context).toBe(context);
        });

        it('should update only context if only context is provided', () => {
            const newContext = { state: 'changed' };
            handler.update({ context: newContext });

            expect(handler.config).toBe(config);
            expect(handler.utils).toBe(utils);
            expect(handler.context).toBe(newContext);
        });

        it('should use current values if parameters are omitted', () => {
            handler.update({});
            expect(handler.config).toBe(config);
            expect(handler.utils).toBe(utils);
            expect(handler.context).toBe(context);
        });

        it('should not throw if called with no arguments', () => {
            expect(() => handler.update({})).not.toThrow();
        });
    });
});