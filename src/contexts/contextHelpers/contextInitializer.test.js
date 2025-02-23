import ContextInitializer from './contextInitializer';

describe('ContextInitializer', () => {
    let ctx;
    const initialState = { foo: 'bar' };

    beforeEach(() => {
        ctx = { initialState };
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initializeContext', () => {
        it('should set ctx.state to the provided valid state and initialize data and flags', () => {
            const customState = { key: 'value' };
            const before = Date.now();
            ContextInitializer.initializeContext(ctx, customState);
            expect(ctx.state).toEqual(expect.objectContaining({
                data: customState,
                flags: {}
            }));
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should use ctx.initialState if state is not provided', () => {
            const before = Date.now();
            ContextInitializer.initializeContext(ctx);
            expect(ctx.state).toEqual(expect.objectContaining({
                data: initialState,
                flags: {}
            }));
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should warn and default to an empty object if state is not an object', () => {
            const badState = 'notAnObject';
            ContextInitializer.initializeContext(ctx, badState);
            expect(console.warn).toHaveBeenCalledWith(
                'State is not an object, defaulting to an empty object'
            );
            expect(ctx.state).toEqual(expect.objectContaining({
                data: {},
                flags: {}
            }));
        });

        it('should default to the initial state if state is null', () => {
            const badState = null;
            ContextInitializer.initializeContext(ctx, badState)
            expect(ctx.state).toEqual(expect.objectContaining({
                data: initialState,
                flags: {}
            }));
        });

        it('should default to an empty object if state is null and no initial state is provided', () => {
            ctx.initialState = undefined;
            const badState = null;
            ContextInitializer.initializeContext(ctx, badState)
            expect(ctx.state).toEqual(expect.objectContaining({
                data: {},
                flags: {}
            }));
        });

        it('should default to initial state if state is undefined', () => {
            const badState = undefined;
            ContextInitializer.initializeContext(ctx, badState)
            expect(ctx.state).toEqual(expect.objectContaining({
                data: { foo: 'bar' },
                flags: {}
            }));
        });

        it('should default to an empty object if state is undefined and no initial state is provided', () => {
            ctx.initialState = undefined;
            const badState = undefined;
            ContextInitializer.initializeContext(ctx, badState)
            expect(ctx.state).toEqual(expect.objectContaining({
                data: {},
                flags: {}
            }));
        });
    });

    describe('initialiseData', () => {
        it('should set data to provided object and dateModified', () => {
            const testData = { a: 1 };
            ctx.state = {};
            const before = Date.now();
            ContextInitializer.initialiseData(ctx, testData);
            expect(ctx.state.data).toEqual(testData);
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should default data to {} if no data is provided', () => {
            ctx.state = {};
            const before = Date.now();
            ContextInitializer.initialiseData(ctx);
            expect(ctx.state.data).toEqual({});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should default data to {} if data is not an object', () => {
            const badData = 'notAnObject';
            ctx.state = {};
            const before = Date.now();
            ContextInitializer.initialiseData(ctx, badData);
            expect(ctx.state.data).toEqual({});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should default data to {} if data is null', () => {
            const badData = null;
            ctx.state = {};
            const before = Date.now();
            ContextInitializer.initialiseData(ctx, badData);
            expect(ctx.state.data).toEqual({});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should default data to {} if data is undefined', () => {
            const badData = undefined;
            ctx.state = {};
            const before = Date.now();
            ContextInitializer.initialiseData(ctx, badData);
            expect(ctx.state.data).toEqual({});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should default data to {} if no state is provided', () => {
            ctx.state = undefined;
            const before = Date.now();
            ContextInitializer.initialiseData(ctx);
            expect(ctx.state.data).toEqual({});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });
    });

    describe('initialiseFlags', () => {
        it('should set flags to provided object and update dateModified', () => {
            const testFlags = { flag: true };
            ctx.state = {};
            const before = Date.now();
            ContextInitializer.initialiseFlags(ctx, testFlags);
            expect(ctx.state.flags).toEqual(testFlags);
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should default flags to {} if no flags are provided', () => {
            ctx.state = {};
            const before = Date.now();
            ContextInitializer.initialiseFlags(ctx);
            expect(ctx.state.flags).toEqual({});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should default flags to {} if flags are not an object', () => {
            const badFlags = 'notAnObject';
            ctx.state = {};
            const before = Date.now();
            ContextInitializer.initialiseFlags(ctx, badFlags);
            expect(ctx.state.flags).toEqual({});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should default flags to {} if flags are null', () => {
            const badFlags = null;
            ctx.state = {};
            const before = Date.now();
            ContextInitializer.initialiseFlags(ctx, badFlags);
            expect(ctx.state.flags).toEqual({});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should default flags to {} if flags are undefined', () => {
            const badFlags = undefined;
            ctx.state = {};
            const before = Date.now();
            ContextInitializer.initialiseFlags(ctx, badFlags);
            expect(ctx.state.flags).toEqual({});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should default flags to {} if no state is provided', () => {
            ctx.state = undefined;
            const before = Date.now();
            ContextInitializer.initialiseFlags(ctx);
            expect(ctx.state.flags).toEqual({});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });
    });
});