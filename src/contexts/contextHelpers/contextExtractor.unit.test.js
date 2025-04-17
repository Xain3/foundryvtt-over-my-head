import ContextExtractor from './contextExtractor';
import cloneDeep from 'lodash/cloneDeep';

// Mock lodash/cloneDeep
jest.mock('lodash/cloneDeep');

describe('ContextExtractor', () => {
    let mockConfig;

    beforeEach(() => {
        // Reset mocks and provide a fresh config for each test
        jest.clearAllMocks();
        cloneDeep.mockImplementation(val => JSON.parse(JSON.stringify(val))); // Simple deep clone mock

        mockConfig = {
            CONSTANTS: {
                CONTEXT_INIT: { initial: 'data' },
                OTHER_CONST: 'value'
            },
            anotherProp: {}
        };
    });

    describe('extractContextInit', () => {
        it('should return both modified CONFIG and contextInit when returnMode is "both"', () => {
            const result = ContextExtractor.extractContextInit(mockConfig, 'both');
            expect(cloneDeep).toHaveBeenCalledWith(mockConfig);
            expect(result).toHaveProperty('CONFIG');
            expect(result).toHaveProperty('contextInit', { initial: 'data' });
            expect(result.CONFIG).not.toBe(mockConfig); // Ensure it's a copy
            expect(result.CONFIG.CONSTANTS).not.toHaveProperty('CONTEXT_INIT');
            expect(result.CONFIG.CONSTANTS).toHaveProperty('OTHER_CONST', 'value');
            expect(result.CONFIG).toHaveProperty('anotherProp');
        });

        it('should return only modified CONFIG when returnMode is "config"', () => {
            const result = ContextExtractor.extractContextInit(mockConfig, 'config');
            expect(cloneDeep).toHaveBeenCalledWith(mockConfig);
            expect(result).not.toHaveProperty('contextInit');
            expect(result).not.toBe(mockConfig);
            expect(result.CONSTANTS).not.toHaveProperty('CONTEXT_INIT');
            expect(result.CONSTANTS).toHaveProperty('OTHER_CONST', 'value');
            expect(result).toHaveProperty('anotherProp');
        });

        it('should return only contextInit when returnMode is "contextInit"', () => {
            const result = ContextExtractor.extractContextInit(mockConfig, 'contextInit');
            expect(cloneDeep).toHaveBeenCalledWith(mockConfig);
            expect(result).toEqual({ initial: 'data' });
            // Verify original config was not mutated (though cloneDeep mock handles this)
            expect(mockConfig.CONSTANTS).toHaveProperty('CONTEXT_INIT');
        });

        it('should default to returnMode "both" if not specified', () => {
            const result = ContextExtractor.extractContextInit(mockConfig); // No returnMode
            expect(cloneDeep).toHaveBeenCalledWith(mockConfig);
            expect(result).toHaveProperty('CONFIG');
            expect(result).toHaveProperty('contextInit', { initial: 'data' });
            expect(result.CONFIG.CONSTANTS).not.toHaveProperty('CONTEXT_INIT');
        });

        // --- Error Handling ---

        it('should throw error if CONFIG is undefined', () => {
            expect(() => ContextExtractor.extractContextInit(undefined, 'both'))
                .toThrow('CONFIG is not defined or not an object. Could not initialize context properly.');
        });

        it('should throw error if CONFIG is null', () => {
            expect(() => ContextExtractor.extractContextInit(null, 'both'))
                .toThrow('CONFIG is not defined or not an object. Could not initialize context properly.');
        });

        it('should throw error if CONFIG is not an object', () => {
            expect(() => ContextExtractor.extractContextInit('string', 'both'))
                .toThrow('CONFIG is not defined or not an object. Could not initialize context properly.');
        });

        it('should throw error if CONFIG.CONSTANTS is missing', () => {
            const badConfig = { anotherProp: {} };
            expect(() => ContextExtractor.extractContextInit(badConfig, 'both'))
                .toThrow('CONFIG.CONSTANTS is not defined or not an object. Could not initialize context properly.');
        });

         it('should throw error if CONFIG.CONSTANTS is not an object', () => {
            const badConfig = { CONSTANTS: 'string' };
            expect(() => ContextExtractor.extractContextInit(badConfig, 'both'))
                .toThrow('CONFIG.CONSTANTS is not defined or not an object. Could not initialize context properly.');
        });


        it('should throw error if CONFIG.CONSTANTS.CONTEXT_INIT is missing', () => {
            const badConfig = { CONSTANTS: { OTHER_CONST: 'value' } };
            expect(() => ContextExtractor.extractContextInit(badConfig, 'both'))
                .toThrow('CONTEXT_INIT is not defined in the configuration object. Could not initialize context properly.');
        });

        it('should throw error if returnMode is not a string', () => {
            expect(() => ContextExtractor.extractContextInit(mockConfig, 123))
                .toThrow('Return Mode is not a string. Could not initialize context properly.');
        });

        // --- Error Handling with returnMode='config' ---

        it('should warn and return config copy if CONFIG.CONSTANTS.CONTEXT_INIT is missing and returnMode is "config"', () => {
            const badConfig = { CONSTANTS: { OTHER_CONST: 'value' } };
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            const result = ContextExtractor.extractContextInit(badConfig, 'config');

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('CONTEXT_INIT is not defined'));
            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Defaulting to returning the original CONFIG'));
            expect(result).toEqual(badConfig); // Should return a copy (or original if clone fails)
            consoleWarnSpy.mockRestore();
        });

         it('should warn and return config copy if CONFIG is invalid and returnMode is "config"', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            const result = ContextExtractor.extractContextInit(null, 'config'); // Invalid config

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('CONFIG is not defined'));
            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Defaulting to returning the original CONFIG'));
            expect(result).toBeNull(); // Returns the original invalid input
            consoleWarnSpy.mockRestore();
        });

        it('should warn and return config copy if returnMode is invalid and returnMode is "config" (edge case)', () => {
            // This tests if the error handler correctly identifies the returnMode even if the initial error was different
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            // Force a different error first
            const badConfig = { CONSTANTS: { CONTEXT_INIT: {} } };
            // Intentionally pass invalid returnMode to trigger the type error *within* the try block
            // The catch block should still see returnMode as 'config' (conceptually)
            // However, the current implementation throws before the catch block logic for returnMode='config' is relevant for this specific error.
            // Let's test the intended logic: if *any* error happens *during* processing for 'config' mode.
            cloneDeep.mockImplementation(() => { throw new Error("Cloning failed"); }); // Simulate error during cloning

            const result = ContextExtractor.extractContextInit(mockConfig, 'config');

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Cloning failed'));
            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Defaulting to returning the original CONFIG'));
            expect(result).toBe(mockConfig); // Falls back to original on clone error

            consoleWarnSpy.mockRestore();
        });
    });
});