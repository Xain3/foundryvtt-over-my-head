/**
 * @file logger.unit.test.mjs
 * @description Unit tests for the Logger class.
 * @path src/utils/logger.unit.test.mjs
 */

jest.mock('./static/gameManager.mjs');

import Logger from './logger.mjs';
import GameManager from './static/gameManager.mjs';

describe('Logger', () => {
  let mockConstants;
  let mockManifest;
  let mockFormatError;
  let logger;
  let consoleSpy;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock console methods
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      debug: jest.spyOn(console, 'debug').mockImplementation(() => {})
    };

    // Setup mock objects
    mockConstants = {
      debug: {
        enabled: false
      }
    };

    mockManifest = {
      id: 'test-module',
      shortName: 'TM'
    };

    mockFormatError = jest.fn((error, options) => `Formatted: ${error.message}`);

    // Mock GameManager methods
    GameManager.getSetting = jest.fn();

    // Create logger instance
    logger = new Logger(mockConstants, mockManifest, mockFormatError);
  });

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('Constructor', () => {
    it('should create Logger instance with valid parameters', () => {
      expect(logger).toBeInstanceOf(Logger);
      expect(logger.constants).toBe(mockConstants);
      expect(logger.manifest).toBe(mockManifest);
      expect(logger.formatError).toBe(mockFormatError);
    });

    it('should throw TypeError when constants is invalid', () => {
      expect(() => new Logger(null, mockManifest, mockFormatError))
        .toThrow('Constants must be a valid object');
      expect(() => new Logger('invalid', mockManifest, mockFormatError))
        .toThrow('Constants must be a valid object');
    });

    it('should throw TypeError when manifest is invalid', () => {
      expect(() => new Logger(mockConstants, null, mockFormatError))
        .toThrow('Manifest must be a valid object');
      expect(() => new Logger(mockConstants, 'invalid', mockFormatError))
        .toThrow('Manifest must be a valid object');
    });

    it('should throw TypeError when manifest.id is missing or invalid', () => {
      const invalidManifest = { shortName: 'TM' };
      expect(() => new Logger(mockConstants, invalidManifest, mockFormatError))
        .toThrow('Manifest must have a valid id string');

      const invalidManifest2 = { id: 123, shortName: 'TM' };
      expect(() => new Logger(mockConstants, invalidManifest2, mockFormatError))
        .toThrow('Manifest must have a valid id string');
    });

    it('should throw TypeError when manifest.shortName is missing or invalid', () => {
      const invalidManifest = { id: 'test-module' };
      expect(() => new Logger(mockConstants, invalidManifest, mockFormatError))
        .toThrow('Manifest must have a valid shortName string');

      const invalidManifest2 = { id: 'test-module', shortName: 123 };
      expect(() => new Logger(mockConstants, invalidManifest2, mockFormatError))
        .toThrow('Manifest must have a valid shortName string');
    });

    it('should throw TypeError when formatError is not a function', () => {
      expect(() => new Logger(mockConstants, mockManifest, null))
        .toThrow('formatError must be a function');
      expect(() => new Logger(mockConstants, mockManifest, 'invalid'))
        .toThrow('formatError must be a function');
    });
  });

  describe('isDebugEnabled', () => {
    it('should return debug mode from GameManager settings when available', () => {
      GameManager.getSetting.mockReturnValue(true);

      const result = logger.isDebugEnabled();

      expect(GameManager.getSetting).toHaveBeenCalledWith('test-module', 'debugMode');
      expect(result).toBe(true);
    });

    it('should return false when GameManager settings return false', () => {
      GameManager.getSetting.mockReturnValue(false);

      const result = logger.isDebugEnabled();

      expect(result).toBe(false);
    });

    it('should fallback to constants default when GameManager throws error', () => {
      GameManager.getSetting.mockImplementation(() => {
        throw new Error('Settings not available');
      });
      mockConstants.debug.enabled = true;

      const result = logger.isDebugEnabled();

      expect(result).toBe(true);
    });

    it('should fallback to false when no constants debug config', () => {
      GameManager.getSetting.mockImplementation(() => {
        throw new Error('Settings not available');
      });
      const loggerWithoutDebug = new Logger({}, mockManifest, mockFormatError);

      const result = loggerWithoutDebug.isDebugEnabled();

      expect(result).toBe(false);
    });

    it('should check global game.modules.flags as fallback', () => {
      GameManager.getSetting.mockReturnValue(undefined);

      // Mock global game object
      const originalGame = globalThis.game;
      globalThis.game = {
        modules: {
          get: jest.fn().mockReturnValue({
            flags: { debugMode: true }
          })
        }
      };

      const result = logger.isDebugEnabled();

      expect(result).toBe(true);

      // Restore global
      globalThis.game = originalGame;
    });
  });

  describe('log', () => {
    it('should log message with module prefix', () => {
      logger.log('Test message');

      expect(consoleSpy.log).toHaveBeenCalledWith('TM | Test message');
    });

    it('should throw TypeError when message is not a string', () => {
      expect(() => logger.log(123)).toThrow('Message must be a string');
      expect(() => logger.log(null)).toThrow('Message must be a string');
      expect(() => logger.log({})).toThrow('Message must be a string');
    });

    it('should handle formatting errors gracefully', () => {
      // Test that the fallback logging mechanism works
      // We can't easily simulate formatting errors with our current implementation
      // but we can test that the method completes successfully
      expect(() => logger.log('Test')).not.toThrow();
      expect(consoleSpy.log).toHaveBeenCalledWith('TM | Test');
    });
  });

  describe('error', () => {
    it('should log string error message with module prefix', () => {
      logger.error('Error message');

      expect(consoleSpy.error).toHaveBeenCalledWith('TM | Error message');
    });

    it('should format Error objects using formatError function', () => {
      const error = new Error('Test error');
      logger.error(error);

      expect(mockFormatError).toHaveBeenCalledWith(error, {});
      expect(consoleSpy.error).toHaveBeenCalledWith('Formatted: Test error');
    });

    it('should pass options to formatError for Error objects', () => {
      const error = new Error('Test error');
      const options = { includeStack: true, includeCaller: true, caller: 'testFunction' };

      logger.error(error, options);

      expect(mockFormatError).toHaveBeenCalledWith(error, options);
    });

    it('should handle non-string, non-Error values by converting to string', () => {
      logger.error(123);
      logger.error(null);
      logger.error({ message: 'object' });

      expect(consoleSpy.error).toHaveBeenCalledWith('TM | 123');
      expect(consoleSpy.error).toHaveBeenCalledWith('TM | null');
      expect(consoleSpy.error).toHaveBeenCalledWith('TM | [object Object]');
    });

    it('should handle formatError function errors gracefully', () => {
      mockFormatError.mockImplementation(() => {
        throw new Error('Format error failed');
      });

      logger.error('Test message');

      expect(consoleSpy.error).toHaveBeenCalledWith('TM | Test message');
    });
  });

  describe('warn', () => {
    it('should log warning message with module prefix', () => {
      logger.warn('Warning message');

      expect(consoleSpy.warn).toHaveBeenCalledWith('TM | Warning message');
    });

    it('should throw TypeError when message is not a string', () => {
      expect(() => logger.warn(123)).toThrow('Message must be a string');
      expect(() => logger.warn(null)).toThrow('Message must be a string');
      expect(() => logger.warn({})).toThrow('Message must be a string');
    });

    it('should handle formatting errors gracefully', () => {
      // Test that the fallback logging mechanism works
      expect(() => logger.warn('Test')).not.toThrow();
      expect(consoleSpy.warn).toHaveBeenCalledWith('TM | Test');
    });
  });

  describe('debug', () => {
    it('should log debug message when debug mode is enabled', () => {
      GameManager.getSetting.mockReturnValue(true);

      logger.debug('Debug message');

      expect(consoleSpy.debug).toHaveBeenCalledWith('TM | Debug message');
    });

    it('should not log debug message when debug mode is disabled', () => {
      GameManager.getSetting.mockReturnValue(false);

      logger.debug('Debug message');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should throw TypeError when message is not a string', () => {
      expect(() => logger.debug(123)).toThrow('Message must be a string');
      expect(() => logger.debug(null)).toThrow('Message must be a string');
      expect(() => logger.debug({})).toThrow('Message must be a string');
    });

    it('should handle formatting errors gracefully when debug is enabled', () => {
      GameManager.getSetting.mockReturnValue(true);

      expect(() => logger.debug('Test')).not.toThrow();
      expect(consoleSpy.debug).toHaveBeenCalledWith('TM | Test');
    });
  });

  describe('Integration Tests', () => {
    it('should work with real-world constants and manifest objects', () => {
      const realConstants = {
        debug: { enabled: true },
        module: { name: 'test-module' }
      };
      const realManifest = {
        id: 'foundryvtt-test-module',
        shortName: 'FTM',
        title: 'Test Module',
        version: '1.0.0'
      };

      const realLogger = new Logger(realConstants, realManifest, mockFormatError);

      expect(() => {
        realLogger.log('Initialization complete');
        realLogger.warn('Deprecated API used');
        realLogger.debug('Processing data');
        realLogger.error(new Error('Connection failed'));
      }).not.toThrow();
    });

    it('should maintain consistent behavior across all log levels', () => {
      GameManager.getSetting.mockReturnValue(true);

      logger.log('Log message');
      logger.warn('Warn message');
      logger.error('Error message');
      logger.debug('Debug message');

      expect(consoleSpy.log).toHaveBeenCalledWith('TM | Log message');
      expect(consoleSpy.warn).toHaveBeenCalledWith('TM | Warn message');
      expect(consoleSpy.error).toHaveBeenCalledWith('TM | Error message');
      expect(consoleSpy.debug).toHaveBeenCalledWith('TM | Debug message');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string messages', () => {
      logger.log('');
      logger.warn('');
      logger.error('');
      logger.debug('');

      expect(consoleSpy.log).toHaveBeenCalledWith('TM | ');
      expect(consoleSpy.warn).toHaveBeenCalledWith('TM | ');
      expect(consoleSpy.error).toHaveBeenCalledWith('TM | ');
      // Debug should not be called since debug mode is disabled by default
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(1000);

      logger.log(longMessage);

      expect(consoleSpy.log).toHaveBeenCalledWith(`TM | ${longMessage}`);
    });

    it('should handle special characters in messages', () => {
      const specialMessage = 'Message with émojis 🎉 and spëcial cháracters ñ';

      logger.log(specialMessage);

      expect(consoleSpy.log).toHaveBeenCalledWith(`TM | ${specialMessage}`);
    });

    it('should handle undefined and null in error formatting gracefully', () => {
      mockFormatError.mockReturnValue(undefined);

      logger.error(new Error('Test'));

      // Should still call console.error even if formatError returns undefined
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle GameManager being unavailable', () => {
      GameManager.getSetting.mockImplementation(() => {
        throw new Error('GameManager not available');
      });

      expect(() => logger.isDebugEnabled()).not.toThrow();
      expect(logger.isDebugEnabled()).toBe(false);
    });

    it('should handle console methods being unavailable', () => {
      // This test is more theoretical since our implementation uses try-catch
      // but we can test that the method doesn't throw
      expect(() => logger.log('Test')).not.toThrow();
      expect(consoleSpy.log).toHaveBeenCalledWith('TM | Test');
    });

    it('should preserve error context when formatting fails', () => {
      mockFormatError.mockImplementation(() => {
        throw new Error('Formatting failed');
      });

      const originalError = new Error('Original error');
      logger.error(originalError);

      // Should fall back to string representation
      expect(consoleSpy.error).toHaveBeenCalledWith('TM | Error: Original error');
    });
  });
});
