import ContextExtractor from './contextExtractor';

describe('ContextExtractor', () => {
    let CONFIG;

    beforeEach(() => {
        CONFIG = {
            CONSTANTS: {
                CONTEXT_INIT: {
                    test: 'test',
                },
                otherConstant: 'otherConstant',
            },
        };
    });

    describe('extractContextInit', () => {
        it('should return both CONFIG and contextInit if returnMode is "both"', () => {
            const result = ContextExtractor.extractContextInit(CONFIG, 'both');
            expect(result).toEqual({
                CONFIG: {
                    CONSTANTS: {
                        otherConstant: 'otherConstant',
                    },
                },
                contextInit: {
                    test: 'test',
                },
            });
        });

        it('should return CONFIG without contextInit if returnMode is "config"', () => {
            const result = ContextExtractor.extractContextInit(CONFIG, 'config');
            expect(result).toEqual({
                CONSTANTS: {
                    otherConstant: 'otherConstant',
                },
            });
        });

        it('should return contextInit without CONFIG if returnMode is "contextInit"', () => {
            const result = ContextExtractor.extractContextInit(CONFIG, 'contextInit');
            expect(result).toEqual({
                test: 'test',
            });
        });

        it('should throw an error if CONTEXT_INIT is not defined in CONFIG', () => {
            delete CONFIG.CONSTANTS.CONTEXT_INIT;
            expect(() => ContextExtractor.extractContextInit(CONFIG)).toThrow('CONTEXT_INIT is not defined in the configuration object');
        });

        it('should log a warning and return CONFIG if CONTEXT_INIT is not defined and returnMode is "config"', () => {
            console.warn = jest.fn();
            delete CONFIG.CONSTANTS.CONTEXT_INIT;
            const result = ContextExtractor.extractContextInit(CONFIG, 'config');
            expect(console.warn).toHaveBeenCalledWith('CONTEXT_INIT is not defined in the configuration object. Defaulting to CONFIG');
            expect(result).toEqual(CONFIG);
        });

        it('should throw an error if CONTEXT_INIT is not defined and returnMode is not "config"', () => {
            delete CONFIG.CONSTANTS.CONTEXT_INIT;
            expect(() => ContextExtractor.extractContextInit(CONFIG, 'contextInit')).toThrow('CONTEXT_INIT is not defined in the configuration object. Could not initialize context');
        });
    });
});