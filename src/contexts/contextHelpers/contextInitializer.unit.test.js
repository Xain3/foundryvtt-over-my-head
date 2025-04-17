import ContextInitializer from './contextInitializer';

describe('ContextInitializer', () => {
    let ctx;
    let mockInitialState;
    
    beforeEach(() => {
        mockInitialState = { data: { foo: 'bar' }, flags: { baz: true }, dateModified: 12345 };
        // Reset context object for each test
        ctx = {
            initialState: mockInitialState // Provide a default initial state for ctx
        };
        // Mock console.warn
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore mocks
        jest.restoreAllMocks();
    });

    describe('validateInitialState', () => {
        it('should return the state if it is a valid object', () => {
            const validState = { a: 1 };
            expect(ContextInitializer.validateInitialState(validState)).toBe(validState);
        });

        it('should return an empty object and warn if state is null', () => {
            expect(ContextInitializer.validateInitialState(null)).toEqual({});
            expect(console.warn).toHaveBeenCalledWith('Initial state is not defined, defaulting to an empty object');
        });

        it('should return an empty object and warn if state is undefined', () => {
            expect(ContextInitializer.validateInitialState(undefined)).toEqual({});
            expect(console.warn).toHaveBeenCalledWith('Initial state is not defined, defaulting to an empty object');
        });

        it('should return an empty object and warn if state is not an object', () => {
            expect(ContextInitializer.validateInitialState('string')).toEqual({});
            expect(console.warn).toHaveBeenCalledWith('Initial state is not an object, defaulting to an empty object');
            expect(ContextInitializer.validateInitialState(123)).toEqual({});
            expect(ContextInitializer.validateInitialState(true)).toEqual({});
        });
    });


    describe('initializeContext', () => {
        // Mock static methods used internally
        let initialiseDataSpy;
        let initialiseFlagsSpy;
        let validateInitialStateSpy;

        beforeEach(() => {
            initialiseDataSpy = jest.spyOn(ContextInitializer, 'initialiseData');
            initialiseFlagsSpy = jest.spyOn(ContextInitializer, 'initialiseFlags');
            validateInitialStateSpy = jest.spyOn(ContextInitializer, 'validateInitialState').mockImplementation(s => s || {}); // Simple mock
        });

        it('should use provided initialData if it is a valid object', () => {
            const customData = { data: { key: 'value' }, flags: { flag: false } };
            ContextInitializer.initializeContext(ctx, customData);
            expect(validateInitialStateSpy).toHaveBeenCalledWith(customData);
            expect(ctx.state).toEqual(expect.objectContaining(customData));
            expect(initialiseDataSpy).toHaveBeenCalledWith(ctx, customData.data);
            expect(initialiseFlagsSpy).toHaveBeenCalledWith(ctx, customData.flags);
            expect(ctx.state).toHaveProperty('dateModified');
        });

        it('should use ctx.initialState if initialData is null', () => {
            ContextInitializer.initializeContext(ctx, null);
            expect(validateInitialStateSpy).toHaveBeenCalledWith(ctx.initialState);
            mockInitialState.dateModified = ctx.state.dateModified ? ctx.state.dateModified : Date.now(); // Ensure dateModified is set
            expect(ctx.state).toEqual(expect.objectContaining(mockInitialState));
            expect(initialiseDataSpy).toHaveBeenCalledWith(ctx, mockInitialState.data);
            expect(initialiseFlagsSpy).toHaveBeenCalledWith(ctx, mockInitialState.flags);
            expect(ctx.state.dateModified).toBe(mockInitialState.dateModified); // Should keep original if present
        });

         it('should use ctx.initialState if initialData is undefined', () => {
            ContextInitializer.initializeContext(ctx, undefined);
            expect(validateInitialStateSpy).toHaveBeenCalledWith(ctx.initialState);
            mockInitialState.dateModified = ctx.state.dateModified ? ctx.state.dateModified : Date.now(); // Ensure dateModified is set
            expect(ctx.state).toEqual(expect.objectContaining(mockInitialState));
            expect(initialiseDataSpy).toHaveBeenCalledWith(ctx, mockInitialState.data);
            expect(initialiseFlagsSpy).toHaveBeenCalledWith(ctx, mockInitialState.flags);
        });

        it('should use validated empty object if initialData and ctx.initialState are invalid', () => {
            ctx.initialState = null; // Make ctx.initialState invalid
            validateInitialStateSpy.mockReturnValue({}); // Simulate validation returning {}
            ContextInitializer.initializeContext(ctx, null); // Pass invalid initialData
            expect(validateInitialStateSpy).toHaveBeenCalledWith(null); // Called with initialData first
            expect(ctx.state).toEqual({ data: {}, flags: {}, dateModified: expect.any(Number) }); // Expect fully defaulted state
            expect(initialiseDataSpy).toHaveBeenCalledWith(ctx, undefined); // Called with undefined data from validated state
            expect(initialiseFlagsSpy).toHaveBeenCalledWith(ctx, undefined); // Called with undefined flags
        });

        it('should ensure ctx.state is an object even if initially undefined', () => {
            delete ctx.state; // Ensure ctx.state is undefined
            ContextInitializer.initializeContext(ctx, { data: { a: 1 } });
            expect(typeof ctx.state).toBe('object');
            expect(ctx.state.data).toEqual({ a: 1 });
        });

        it('should set dateModified if not present in the initial state', () => {
            const stateWithoutDate = { data: { a: 1 }, flags: {} };
            const before = Date.now();
            ContextInitializer.initializeContext(ctx, stateWithoutDate);
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

         it('should keep existing dateModified if present', () => {
            const existingTimestamp = Date.now();
            const stateWithDate = { data: { a: 1 }, flags: {}, dateModified: existingTimestamp };
            ContextInitializer.initializeContext(ctx, stateWithDate);
            // Compare with second precision
             expect(Math.floor(ctx.state.dateModified / 1000)).toBe(Math.floor(existingTimestamp / 1000));
        });
    });

    describe('initialiseData', () => {
        it('should set ctx.state.data to the provided data object', () => {
            const data = { key: 'value' };
            ContextInitializer.initialiseData(ctx, data);
            expect(ctx.state.data).toEqual(data);
        });

        it('should set ctx.state.data to an empty object if data is null', () => {
            ContextInitializer.initialiseData(ctx, null);
            expect(ctx.state.data).toEqual({});
        });

        it('should set ctx.state.data to an empty object if data is undefined', () => {
            ContextInitializer.initialiseData(ctx, undefined);
            expect(ctx.state.data).toEqual({});
        });

        it('should set ctx.state.data to an empty object if data is not an object', () => {
            ContextInitializer.initialiseData(ctx, 'string');
            expect(ctx.state.data).toEqual({});
        });

        it('should update ctx.state.dateModified', () => {
            const before = Date.now();
            ContextInitializer.initialiseData(ctx, {});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should create ctx.state if it does not exist', () => {
            delete ctx.state;
            ContextInitializer.initialiseData(ctx, { a: 1 });
            expect(ctx.state).toBeDefined();
            expect(ctx.state.data).toEqual({ a: 1 });
            expect(ctx.state.dateModified).toBeDefined();
        });
    });

    describe('initialiseFlags', () => {
        it('should set ctx.state.flags to the provided flags object', () => {
            const flags = { flag1: true };
            ContextInitializer.initialiseFlags(ctx, flags);
            expect(ctx.state.flags).toEqual(flags);
        });

        it('should set ctx.state.flags to an empty object if flags is null', () => {
            ContextInitializer.initialiseFlags(ctx, null);
            expect(ctx.state.flags).toEqual({});
        });

        it('should set ctx.state.flags to an empty object if flags is undefined', () => {
            ContextInitializer.initialiseFlags(ctx, undefined);
            expect(ctx.state.flags).toEqual({});
        });

        it('should set ctx.state.flags to an empty object if flags is not an object', () => {
            ContextInitializer.initialiseFlags(ctx, 'string');
            expect(ctx.state.flags).toEqual({});
        });

        it('should update ctx.state.dateModified', () => {
            const before = Date.now();
            ContextInitializer.initialiseFlags(ctx, {});
            expect(ctx.state.dateModified).toBeGreaterThanOrEqual(before);
        });

        it('should create ctx.state if it does not exist', () => {
            delete ctx.state;
            ContextInitializer.initialiseFlags(ctx, { f: 1 });
            expect(ctx.state).toBeDefined();
            expect(ctx.state.flags).toEqual({ f: 1 });
            expect(ctx.state.dateModified).toBeDefined();
        });
    });
});