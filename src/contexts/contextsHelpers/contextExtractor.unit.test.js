import { CONTEXT } from '@/config/constants';
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
                CONTEXT: {
                    INIT: {
                        flags: {
                            settingsReady: false,
                        },
                        data: {},
                    },
                },
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
            expect(result).toHaveProperty('contextInit', { flags: { settingsReady: false }, data: {} });
            expect(result.CONFIG).not.toBe(mockConfig); // Ensure it's a copy
            expect(result.CONFIG.CONSTANTS).not.toHaveProperty('CONTEXT.INIT');
            expect(result.CONFIG.CONSTANTS).toHaveProperty('OTHER_CONST', 'value');
            expect(result.CONFIG).toHaveProperty('anotherProp');
        });

        it('should return only modified CONFIG when returnMode is "config"', () => {
            const result = ContextExtractor.extractContextInit(mockConfig, 'config');
            expect(cloneDeep).toHaveBeenCalledWith(mockConfig);
            expect(result).not.toHaveProperty('contextInit');
            expect(result).not.toBe(mockConfig);
            expect(result.CONSTANTS).not.toHaveProperty('CONTEXT.INIT');
            expect(result.CONSTANTS).toHaveProperty('OTHER_CONST', 'value');
            expect(result).toHaveProperty('anotherProp');
        });

        it('should return only contextInit when returnMode is "contextInit"', () => {
            const result = ContextExtractor.extractContextInit(mockConfig, 'contextInit');
            expect(cloneDeep).toHaveBeenCalledWith(mockConfig);
            expect(result).toEqual({ flags: { settingsReady: false }, data: {} });
            expect(result).not.toBe(mockConfig); // Ensure it's a copy
            // Verify original config was not mutated (though cloneDeep mock handles this)
            expect(mockConfig.CONSTANTS).toHaveProperty('CONTEXT.INIT');
        });

        it('should default to returnMode "both" if not specified', () => {
            const result = ContextExtractor.extractContextInit(mockConfig); // No returnMode
            expect(cloneDeep).toHaveBeenCalledWith(mockConfig);
            expect(result).toHaveProperty('CONFIG');
            expect(result).toHaveProperty('contextInit', { flags: { settingsReady: false }, data: {} });
            expect(result.CONFIG).not.toBe(mockConfig); // Ensure it's a copy
            expect(result.CONFIG.CONSTANTS).not.toHaveProperty('CONTEXT.INIT');
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


        it('should throw error if CONFIG.CONSTANTS.CONTEXT is missing', () => {
            const badConfig = { CONSTANTS: { OTHER_CONST: 'value' } }; // Missing CONTEXT
            expect(() => ContextExtractor.extractContextInit(badConfig, 'both'))
                .toThrow('CONFIG.CONSTANTS.CONTEXT is not defined or not an object. Could not initialize context properly.');
        });

        it('should throw error if CONFIG.CONSTANTS.CONTEXT.INIT is missing', () => {
            const badConfig = { CONSTANTS: { CONTEXT: {}, OTHER_CONST: 'value' } }; // Missing INIT
            expect(() => ContextExtractor.extractContextInit(badConfig, 'both'))
                .toThrow('CONFIG.CONSTANTS.CONTEXT.INIT is not defined or not an object. Could not initialize context properly.');
        });

        it('should throw error if returnMode is not a string', () => {
            expect(() => ContextExtractor.extractContextInit(mockConfig, 123))
                .toThrow('Return Mode is not a string. Could not initialize context properly.');
            expect(() => ContextExtractor.extractContextInit(mockConfig, {}))
                .toThrow('Return Mode is not a string. Could not initialize context properly.');
            expect(() => ContextExtractor.extractContextInit(mockConfig, []))
                .toThrow('Return Mode is not a string. Could not initialize context properly.');
            expect(() => ContextExtractor.extractContextInit(mockConfig, null))
                .toThrow('Return Mode is not a string. Could not initialize context properly.');
            // Undefined should not throw an error, but return the default behavior
            // This is a design choice: undefined is treated as 'both'
            expect(() => ContextExtractor.extractContextInit(mockConfig, undefined))
                .not.toThrow('Return Mode is not a string. Could not initialize context properly.');
        });

        it('should throw error if returnMode is invalid', () => {
            expect(() => ContextExtractor.extractContextInit(mockConfig, 'invalidMode'))
                .toThrow('Return Mode "invalidMode" is not valid. Must be one of both, config, contextInit. Could not initialize context properly.');
        });

        it('should warn and return config copy if returnMode is invalid and returnMode is "config" (edge case)', () => {
            // This tests if the error handler correctly identifies the returnMode even if the initial error was different
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            // Let's test the intended logic: if *any* error happens *during* processing for 'config' mode.
            cloneDeep.mockImplementation(() => { throw new Error("Cloning failed"); }); // Simulate error during cloning

            // Use the standard mockConfig, the error simulation comes from cloneDeep mock
            const result = ContextExtractor.extractContextInit(mockConfig, 'config');

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Cloning failed'));
            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Defaulting to returning the original CONFIG'));
            expect(result).toBe(mockConfig); // Falls back to original on clone error

            consoleWarnSpy.mockRestore();
        });

        describe('handleError', () => {
            beforeEach(() => {
                // Reset mocks before each test
                jest.clearAllMocks();
                // Spy on console.warn
                consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                // Default mock implementation for cloneDeep
                cloneDeep.mockImplementation(obj => JSON.parse(JSON.stringify(obj))); // Simple deep clone for testing
            });

            afterEach(() => {
                // Restore original console.warn
                consoleWarnSpy.mockRestore();
            });

            // --- Tests focusing on handleError logic ---

            test('handleError: should warn and return cloned CONFIG if returnMode is "config" and cloneDeep succeeds in handler', () => {
                const initialError = new Error("Validation failed");
                // Mock validateArgs to throw an error to trigger the catch block
                const originalValidateArgs = ContextExtractor.extractContextInit.prototype // This is tricky as validateArgs is inner function
                                            // Let's trigger error differently: mock cloneDeep in the main try block
                cloneDeep.mockImplementationOnce(() => { throw initialError; }); // Error in main try block
                    // .mockImplementationOnce(obj => JSON.parse(JSON.stringify(obj))); // Success inside handleError

                const result = ContextExtractor.extractContextInit(mockConfig, 'config');

                expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Validation failed. Defaulting to returning the original CONFIG (or a copy if possible).'));
                // Check if cloneDeep was called twice: once in try (failed), once in handleError (succeeded)
                expect(cloneDeep).toHaveBeenCalledTimes(2);
                expect(cloneDeep).toHaveBeenNthCalledWith(1, mockConfig); // First call in try block
                expect(cloneDeep).toHaveBeenNthCalledWith(2, mockConfig); // Second call in handleError
                expect(result).toEqual(mockConfig); // Because the *second* mock call returns a clone
            });

            test('handleError: should warn and return original CONFIG if returnMode is "config" and cloneDeep fails in handler', () => {
                const initialError = new Error("Something broke");
                const cloneError = new Error("Cannot clone");
                // Mock cloneDeep to throw in the main try block AND in the handleError block
                cloneDeep.mockImplementation(() => { throw cloneError; });

                const result = ContextExtractor.extractContextInit(mockConfig, 'config');

                expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Cannot clone. Defaulting to returning the original CONFIG (or a copy if possible).'));
                // Check if cloneDeep was called twice: once in try (failed), once in handleError (failed)
                expect(cloneDeep).toHaveBeenCalledTimes(2);
                expect(cloneDeep).toHaveBeenNthCalledWith(1, mockConfig);
                expect(cloneDeep).toHaveBeenNthCalledWith(2, mockConfig);
                expect(result).toBe(mockConfig); // Returns original CONFIG as fallback
            });

            test('handleError: should rethrow modified error if returnMode is "contextInit"', () => {
                const initialError = new Error("Original error message");
                // Make cloneDeep throw to trigger the catch block
                cloneDeep.mockImplementationOnce(() => { throw initialError; });

                expect(() => {
                    ContextExtractor.extractContextInit(mockConfig, 'contextInit');
                }).toThrow(Error); // Check if it throws any error

                try {
                    ContextExtractor.extractContextInit(mockConfig, 'contextInit');
                } catch (e) {
                    expect(e.message).toBe('Original error message. Could not initialize context properly.');
                    expect(e).toBe(initialError); // Should rethrow the *same* error object, just modified
                }
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            test('handleError: should rethrow modified error if returnMode is "both"', () => {
                const initialError = new Error("Original error message");
                // Make cloneDeep throw to trigger the catch block
                cloneDeep.mockImplementationOnce(() => { throw initialError; });

                expect(() => {
                    ContextExtractor.extractContextInit(mockConfig, 'both');
                }).toThrow(Error);

                try {
                    ContextExtractor.extractContextInit(mockConfig, 'both');
                } catch (e) {
                    expect(e.message).toBe('Original error message. Could not initialize context properly.');
                    expect(e).toBe(initialError);
                }
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            test('handleError: should rethrow modified error if returnMode is "config" but CONFIG is null/undefined', () => {
                // Trigger validation error by passing null CONFIG
                expect(() => {
                    ContextExtractor.extractContextInit(null, 'config');
                }).toThrow(Error);

                try {
                    ContextExtractor.extractContextInit(null, 'config');
                } catch (e) {
                    // The error comes from validateArgs first
                    expect(e.message).toBe('CONFIG is not defined or not an object. Could not initialize context properly.');
                }
                // console.warn should not be called because the CONFIG check in handleError fails
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });
        });
    });
});