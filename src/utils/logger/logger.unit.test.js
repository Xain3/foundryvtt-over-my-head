import Logger from './logger';
import MockConfig from '@mocks/config';

// ./src/utils/logger.test.js


describe('Logger', () => {
    let logger;
    let mockConfig;

    beforeEach(() => {
        mockConfig = new MockConfig();
        logger = new Logger(mockConfig);
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'debug').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('log', () => {
        it('should log a message with the module short name as a prefix', () => {
            logger.log('This is a log message');
            expect(console.log).toHaveBeenCalledWith('Mod_ | This is a log message');
        });
    });

    describe('error', () => {
        it('should log an error message with the module short name as a prefix', () => {
            logger.error('This is an error message');
            expect(console.error).toHaveBeenCalledWith('Mod_ | This is an error message');
        });
    });

    describe('warn', () => {
        it('should log a warning message with the module short name as a prefix', () => {
            logger.warn('This is a warning message');
            expect(console.warn).toHaveBeenCalledWith('Mod_ | This is a warning message');
        });
    });

    describe('debug', () => {
        it('should log a debug message if debug mode is enabled', () => {
            jest.spyOn(logger, 'getDebugModeValue').mockReturnValue(true);
            logger.debug('This is a debug message');
            expect(console.debug).toHaveBeenCalledWith('Mod_ | This is a debug message');
        });

        it('should not log a debug message if debug mode is disabled', () => {
            jest.spyOn(logger, 'getDebugModeValue').mockReturnValue(false);
            logger.debug('This is a debug message');
            expect(console.debug).not.toHaveBeenCalled();
        });
    });


    describe('getDebugModeValue', () => {
        it('should return the debug mode value from flags if available', () => {
            global.flags = { debugMode: true };
            expect(logger.getDebugModeValue()).toBe(true);

            global.flags.debugMode = false;
            expect(logger.getDebugModeValue()).toBe(false);

            delete global.flags;
        });

        it('should return the module default debug mode if flags.debugMode is undefined', () => {
            global.flags = { debugMode: undefined };
            logger.moduleConstants = { DEFAULTS: { DEBUG_MODE: true } };
            expect(logger.getDebugModeValue()).toBe(true);

            logger.moduleConstants = { DEFAULTS: { DEBUG_MODE: false } };
            expect(logger.getDebugModeValue()).toBe(false);

            delete global.flags;
        });

        it('should return the module default debug mode if flags.debugMode is null', () => {
            global.flags = { debugMode: null };
            logger.moduleConstants = { DEFAULTS: { DEBUG_MODE: true } };
            expect(logger.getDebugModeValue()).toBe(true);

            delete global.flags;
        });

        it('should return the module default debug mode if flags is not defined', () => {
            delete global.flags;
            logger.moduleConstants = { DEFAULTS: { DEBUG_MODE: false } };
            expect(logger.getDebugModeValue()).toBe(false);

            logger.moduleConstants = { DEFAULTS: { DEBUG_MODE: true } };
            expect(logger.getDebugModeValue()).toBe(true);
        });

        it('should handle optional context parameter', () => {
            const context = { some: 'context' };
            global.flags = { debugMode: true };
            expect(logger.getDebugModeValue(context)).toBe(true);
            delete global.flags;
        });
    });
});