/**
 * @file logger.mjs
 * @description This file contains the Logger class for logging within a specific module with configurable debug mode.
 * @path src/utils/logger.mjs
 */

import GameManager from "./static/gameManager.mjs";

/**
 * Private helper function to get the debug mode value from settings or defaults.
 * @private
 * @param {string} moduleId - The module ID to check settings for
 * @param {Object} constants - The constants object containing defaults
 * @returns {boolean} The debug mode value
 */
const getDebugModeValue = (moduleId, constants) => {
  try {
    const debugMode = GameManager.getSetting(moduleId, 'debugMode');
    if (debugMode !== undefined) return debugMode;

    // Fallback to flags if available
    if (typeof globalThis !== 'undefined' && globalThis.game?.modules?.get(moduleId)?.flags?.debugMode !== undefined) {
      return globalThis.game.modules.get(moduleId).flags.debugMode;
    }

    // Fallback to constants default
    return constants?.debug?.enabled || false;
  } catch (error) {
    return constants?.debug?.enabled || false;
  }
};

/**
 * Private helper function to format log messages with module prefix.
 * @private
 * @param {string} shortName - The module short name
 * @param {string} message - The message to format
 * @returns {string} The formatted message
 */
const formatLogMessage = (shortName, message) => {
  return `${shortName} | ${message}`;
};

/**
 * A utility class for logging within a specific module with configurable debug mode.
 * Provides consistent logging functionality across the module with automatic prefixing
 * and debug mode support.
 *
 * @class Logger
 * @export
 *
 * Public API:
 * - log(message): Logs general messages
 * - error(message): Logs error messages
 * - warn(message): Logs warning messages
 * - debug(message): Logs debug messages (only when debug mode is enabled)
 * - isDebugEnabled(): Returns current debug mode status
 *
 * @example
 * const logger = new Logger(constants, manifest, formatError);
 * logger.log('Module initialized');
 * logger.debug('Debug information');
 * logger.error('An error occurred');
 *
 * @since 1.0.0
 */
class Logger {
  /**
   * Creates an instance of the Logger class.
   *
   * @constructor
   * @param {Object} constants - The constants configuration object
   * @param {Object} constants.debug - Debug configuration
   * @param {boolean} constants.debug.enabled - Default debug mode setting
   * @param {Object} manifest - The manifest object containing module metadata
   * @param {string} manifest.id - The unique identifier of the module
   * @param {string} manifest.shortName - The short name used as prefix for logs
   * @param {Function} formatError - Error formatting function from StaticUtils
   * @throws {TypeError} When required parameters are missing or invalid
   *
   * @example
   * const constants = { debug: { enabled: true } };
   * const manifest = { id: 'my-module', shortName: 'MM' };
   * const logger = new Logger(constants, manifest, formatError);
   */
  constructor(constants, manifest, formatError) {
    // Validate required parameters
    if (!constants || typeof constants !== 'object') {
      throw new TypeError('Constants must be a valid object');
    }
    if (!manifest || typeof manifest !== 'object') {
      throw new TypeError('Manifest must be a valid object');
    }
    if (!manifest.id || typeof manifest.id !== 'string') {
      throw new TypeError('Manifest must have a valid id string');
    }
    if (!manifest.shortName || typeof manifest.shortName !== 'string') {
      throw new TypeError('Manifest must have a valid shortName string');
    }
    if (typeof formatError !== 'function') {
      throw new TypeError('formatError must be a function');
    }

    /**
     * The constants configuration object.
     * @type {Object}
     * @private
     */
    this.constants = constants;

    /**
     * The manifest object containing module metadata.
     * @type {Object}
     * @private
     */
    this.manifest = manifest;

    /**
     * Error formatting function from StaticUtils.
     * @type {Function}
     * @private
     */
    this.formatError = formatError;
  }

  /**
   * Checks if debug mode is currently enabled for this module.
   * Checks settings first, then flags, then falls back to constants default.
   *
   * @returns {boolean} True if debug mode is enabled, false otherwise
   *
   * @example
   * if (logger.isDebugEnabled()) {
   *   logger.debug('This will only log if debug is enabled');
   * }
   */
  isDebugEnabled() {
    return getDebugModeValue(this.manifest.id, this.constants);
  }

  /**
   * Logs a general message to the console with the module's short name as a prefix.
   *
   * @param {string} message - The message to log
   * @throws {TypeError} When message is not a string
   *
   * @example
   * logger.log('Module initialized successfully');
   */
  log(message) {
    if (typeof message !== 'string') {
      throw new TypeError('Message must be a string');
    }

    try {
      console.log(formatLogMessage(this.manifest.shortName, message));
    } catch (error) {
      // Fallback logging if formatting fails
      console.log(`${this.manifest.shortName} | ${message}`);
    }
  }

  /**
   * Logs an error message to the console with the module's short name as a prefix.
   * Uses formatError for consistent error formatting when possible.
   *
   * @param {string|Error} message - The error message to log or Error object
   * @param {Object} [options={}] - Options for error formatting
   * @param {boolean} [options.includeStack=false] - Whether to include stack trace
   * @param {boolean} [options.includeCaller=false] - Whether to include caller info
   * @param {string} [options.caller=''] - Caller name for context
   *
   * @example
   * logger.error('An error occurred');
   * logger.error(new Error('Database connection failed'), { includeStack: true });
   */
  error(message, options = {}) {
    try {
      let formattedMessage;

      if (message instanceof Error) {
        formattedMessage = this.formatError(message, options);
      } else if (typeof message === 'string') {
        formattedMessage = formatLogMessage(this.manifest.shortName, message);
      } else {
        formattedMessage = formatLogMessage(this.manifest.shortName, String(message));
      }

      console.error(formattedMessage);
    } catch (error) {
      // Fallback logging if formatting fails
      console.error(formatLogMessage(this.manifest.shortName, String(message)));
    }
  }

  /**
   * Logs a warning message to the console with the module's short name as a prefix.
   *
   * @param {string} message - The warning message to log
   * @throws {TypeError} When message is not a string
   *
   * @example
   * logger.warn('Deprecated function used');
   */
  warn(message) {
    if (typeof message !== 'string') {
      throw new TypeError('Message must be a string');
    }

    try {
      console.warn(formatLogMessage(this.manifest.shortName, message));
    } catch (error) {
      // Fallback logging if formatting fails
      console.warn(`${this.manifest.shortName} | ${message}`);
    }
  }

  /**
   * Logs a debug message to the console if debug mode is enabled.
   * Only outputs when debug mode is active for performance optimization.
   *
   * @param {string} message - The debug message to log
   * @throws {TypeError} When message is not a string
   *
   * @example
   * logger.debug('Processing user input');
   * logger.debug('Variable state: ' + JSON.stringify(data));
   */
  debug(message) {
    if (typeof message !== 'string') {
      throw new TypeError('Message must be a string');
    }

    if (this.isDebugEnabled()) {
      try {
        console.debug(formatLogMessage(this.manifest.shortName, message));
      } catch (error) {
        // Fallback logging if formatting fails
        console.debug(`${this.manifest.shortName} | ${message}`);
      }
    }
  }
}

export default Logger;
