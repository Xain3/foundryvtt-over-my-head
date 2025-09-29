/**
 * @file utils.mjs
 * @description This file contains the Utilities class that serves as a unified interface for all utility operations.
 * @path src/utils/utils.mjs
 */

import StaticUtils from "./static/static.mjs";
import Logger from "./logger.mjs";
import HookFormatter from "./hookFormatter.mjs";
import Initializer from "./initializer.mjs";
import Context from '../contexts/context.mjs';

/**
 * Central utility class that provides a unified interface for all utility operations.
 * This class acts as a composition root, aggregating various utility classes and providing
 * convenient access to their functionality through a single interface.
 *
 * The Utilities class follows the facade pattern, exposing commonly used methods
 * directly while maintaining access to the underlying utility instances.
 *
 * @class Utilities
 * @export
 * const formattedError = utilities.formatError(error, { includeStack: true });
 *
 * @example
 * // Using hook formatting
 * const hookName = utilities.formatHookName('ready'); // Returns 'OMH.ready'
 *
 * @example
 * // Initializing context
 * const context = utilities.initializeContext({ data: 'test' });
 *
 * @example
 * // Using logger
 * utilities.logger.debug('Debug message');
 * utilities.logger.error('Error message');
  * // Or use convenience logging methods exposed by Utilities
  * utilities.log('Info message');
  * utilities.logWarning('Something to watch');
  * utilities.logError('Something went wrong');
  * utilities.logDebug('Detailed debug info');
 *
 * @since 1.0.0
 */
class Utilities {
  /**
   * Creates a new Utilities instance with all necessary utility classes initialized.
   *
   * @constructor
   * @param {Object} constants - The constants configuration object
   * @param {Object} constants.hooks - Object containing hook name mappings
   * @param {Object} constants.debug - Object containing debug configuration
   * @param {Object} manifest - The manifest object containing module metadata
   * @param {string} manifest.shortName - The short name used as prefix for hooks
   * @param {string} manifest.title - The full title of the module
   * @param {string} manifest.id - The unique identifier of the module
   *
   * @throws {Error} When utility class instantiation fails
   *
   * @example
   * const constants = {
   *   hooks: { ready: '.ready', init: '.init' },
   *   debug: { enabled: true }
   * };
   * const manifest = {
   *   shortName: 'OMH',
   *   title: 'Over My Head',
   *   id: 'foundryvtt-over-my-head'
   * };
   * const utilities = new Utilities(constants, manifest);
   */
  constructor(constants, manifest) {
    /**
     * Reference to the StaticUtils class for static utility operations.
     * @type {typeof StaticUtils}
     */
    this.static = StaticUtils;

    /**
     * The constants configuration object.
     * @type {Object}
     */
    this.constants = constants;

    /**
     * The manifest object containing module metadata.
     * @type {Object}
     */
    this.manifest = manifest;

    /**
     * Bound method for error formatting from StaticUtils.
     * @type {Function}
     */
    this.formatError = this.static.formatError.bind(this.static);

    /**
     * Logger instance for module-specific logging.
     * @type {Logger}
     */
    this.logger = new Logger(this.constants, this.manifest, this.formatError);

    /**
     * Hook formatter instance for consistent hook naming.
     * @type {HookFormatter}
     */
    this.hookFormatter = new HookFormatter(this.constants, this.manifest, this.formatError);

    // Convenience methods for frequently used operations

    /**
     * Convenience method for formatting hook names.
     * Bound to hookFormatter.formatHookName for consistent hook naming.
     * @type {Function}
     */
    this.formatHookName = this.hookFormatter.formatHookName.bind(this.hookFormatter);

    /**
     * Initializer instance for context and settings initialization.
     * @type {Initializer}
     */
    this.initializer = new Initializer(
      this.constants,
      this.manifest,
      this.logger,
      this.formatError,
      this.formatHookName,
      Context
    );


    /**
     * Convenience method for initializing context objects.
     * Bound to initializer.initializeContextObject for context setup.
     * @type {Function}
     */
    this.initializeContext = this.initializer.initializeContextObject.bind(this.initializer);

  /**
   * Convenience logging method (info level).
   * Bound to logger.log for module-prefixed info logging.
   * @type {Function}
   */
  this.log = this.logger.log.bind(this.logger);

  /**
   * Convenience logging method (error level).
   * Bound to logger.error for module-prefixed error logging.
   * @type {Function}
   */
  this.logError = this.logger.error.bind(this.logger);

  /**
   * Convenience logging method (warning level).
   * Bound to logger.warn for module-prefixed warning logging.
   * @type {Function}
   */
  this.logWarning = this.logger.warn.bind(this.logger);

  /**
   * Convenience logging method (debug level; respects debug mode).
   * Bound to logger.debug for module-prefixed debug logging.
   * @type {Function}
   */
  this.logDebug = this.logger.debug.bind(this.logger);
  }
}

/**
 * Static utility class that provides factory methods and unified access to all utility functionality.
 * Acts as a central entry point with convenient static methods for creating utility instances
 * and accessing static utility operations.
 *
 * @class Utils
 * @export
 *
 * @example
 * // Create utility instances using factory methods
 * const logger = Utils.createLogger(constants, manifest, formatError);
 * const initializer = Utils.createInitializer(constants, manifest, logger, formatError, formatHook);
 *
 * @example
 * // Access static utilities directly
 * const isValid = Utils.validate('isString', { value: 'test' });
 * Utils.unpack(data, instance);
 * const module = Utils.getModuleObject('my-module');
 *
 * @example
 * // Hook logging and debugging
 * const proxiedHooksCall = Utils.createHookProxy(Hooks.call, { logLevel: 'debug' });
 * const hookLogger = Utils.createHookLogger('debug', 'MyModule');
 *
 * @since 1.0.0
 */
class Utils {
  /**
   * Creates a new Logger instance with the provided configuration.
   *
   * @static
   * @param {Object} constants - The constants configuration object
   * @param {Object} manifest - The manifest object containing module metadata
   * @param {Function} formatError - Error formatting function
   * @returns {Logger} A new Logger instance
   *
   * @example
   * const logger = Utils.createLogger(constants, manifest, formatError);
   * logger.log('Module initialized');
   */
  static createLogger(constants, manifest, formatError) {
    return new Logger(constants, manifest, formatError);
  }

  /**
   * Creates a new Initializer instance with the provided configuration.
   *
   * @static
   * @param {Object} constants - The constants configuration object
   * @param {Object} manifest - The manifest object containing module metadata
   * @param {Logger} logger - Logger instance for logging operations
   * @param {Function} formatError - Error formatting function
   * @param {Function} formatHook - Hook formatting function
   * @returns {Initializer} A new Initializer instance
   *
   * @example
   * const initializer = Utils.createInitializer(
   *   constants, manifest, logger, formatError, formatHook
   * );
   * initializer.initializeContext(contextParams);
   */
  static createInitializer(constants, manifest, logger, formatError, formatHook) {
    return new Initializer(constants, manifest, logger, formatError, formatHook, Context);
  }

  /**
   * Formats hook names using the HookFormatter utility.
   *
   * @static
   * @param {string} hookBase - Base identifier for the hook
   * @param {string} hookType - Type of hook (e.g., 'init', 'ready', 'update')
   * @param {string} [context] - Optional context identifier
   * @returns {string} The formatted hook name
   *
   * @example
   * const hookName = Utils.formatHook('module', 'ready'); // 'moduleReady'
   * const contextHook = Utils.formatHook('context', 'update', 'player'); // 'contextUpdatePlayer'
   */
  static formatHook(hookBase, hookType, context) {
    return HookFormatter.formatHook(hookBase, hookType, context);
  }

  // Proxy methods to StaticUtils for convenience

  /**
   * Performs validation using the static validation system.
   * Proxy method to StaticUtils.validate().
   *
   * @static
   * @param {string} validationType - The type of validation to perform
   * @param {Object} options - Options object containing validation parameters
   * @returns {boolean|void} Returns true for check methods, void for validate methods
   *
   * @example
   * const isValid = Utils.validate('isString', { value: 'hello' });
   * Utils.validate('validateNumber', { value: age, name: 'age', options: { min: 0 } });
   */
  static validate(validationType, options) {
    return StaticUtils.validate(validationType, options);
  }

  /**
   * Unpacks properties from an object onto a class instance.
   * Proxy method to StaticUtils.unpack().
   *
   * @static
   * @param {Object} object - The object to unpack properties from
   * @param {Object} instance - The instance to unpack properties onto
   * @param {string} [objectName="object"] - Name for error reporting purposes
   *
   * @example
   * Utils.unpack(moduleData, moduleInstance, 'module');
   */
  static unpack(object, instance, objectName) {
    return StaticUtils.unpack(object, instance, objectName);
  }

  /**
   * Formats error messages with module context.
   * Proxy method to StaticUtils.formatError().
   *
   * @static
   * @param {Error|string} error - The error to format
   * @param {Object} [options={}] - Formatting options
   * @returns {string} Formatted error message
   *
   * @example
   * const formatted = Utils.formatError(error, { includeStack: true });
   */
  static formatError(error, options) {
    return StaticUtils.formatError(error, options);
  }

  /**
   * Localizes a string using Foundry VTT's localization system.
   * Proxy method to StaticUtils.localize().
   *
   * @static
   * @param {string} stringId - The localization key to translate
   * @param {Object} [i18nInstance] - Optional i18n instance to use
   * @returns {string} The localized string
   *
   * @example
   * const text = Utils.localize('MYMODULE.welcome');
   */
  static localize(stringId, i18nInstance) {
    return StaticUtils.localize(stringId, i18nInstance);
  }

  /**
   * Formats a localized string with variable substitution.
   * Proxy method to StaticUtils.formatLocalized().
   *
   * @static
   * @param {string} stringId - The localization key to translate
   * @param {Object} [data={}] - Data object for variable substitution
   * @param {Object} [i18nInstance] - Optional i18n instance to use
   * @returns {string} The formatted localized string
   *
   * @example
   * const greeting = Utils.formatLocalized('MYMODULE.greeting', { name: 'Player' });
   */
  static formatLocalized(stringId, data, i18nInstance) {
    return StaticUtils.formatLocalized(stringId, data, i18nInstance);
  }

  /**
   * Checks if a localization key exists.
   * Proxy method to StaticUtils.hasLocalization().
   *
   * @static
   * @param {string} stringId - The localization key to check
   * @param {Object} [i18nInstance] - Optional i18n instance to use
   * @returns {boolean} True if the key exists
   *
   * @example
   * if (Utils.hasLocalization('MYMODULE.optionalText')) {
   *   const text = Utils.localize('MYMODULE.optionalText');
   * }
   */
  static hasLocalization(stringId, i18nInstance) {
    return StaticUtils.hasLocalization(stringId, i18nInstance);
  }

  /**
   * Gets a module object by its identifier.
   * Proxy method to StaticUtils.getModuleObject().
   *
   * @static
   * @param {Object|string} moduleIdentifier - The module identifier
   * @returns {Object|null} The module object or null if not found
   *
   * @example
   * const module = Utils.getModuleObject('my-module-id');
   */
  static getModuleObject(moduleIdentifier) {
    return StaticUtils.getModuleObject(moduleIdentifier);
  }

  /**
   * Writes a key-value pair to a module object.
   * Proxy method to StaticUtils.writeToModuleObject().
   *
   * @static
   * @param {Object|string} moduleIdentifier - The module identifier
   * @param {string} key - The key to be added or updated
   * @param {*} value - The value to be associated with the key
   * @returns {boolean} True if the operation was successful
   *
   * @example
   * Utils.writeToModuleObject('my-module', 'customData', { setting: true });
   */
  static writeToModuleObject(moduleIdentifier, key, value) {
    return StaticUtils.writeToModuleObject(moduleIdentifier, key, value);
  }

  /**
   * Reads a value from a module object.
   * Proxy method to StaticUtils.readFromModuleObject().
   *
   * @static
   * @param {Object|string} moduleIdentifier - The module identifier
   * @param {string} key - The key to look up
   * @returns {*} The value associated with the key, or undefined if not found
   *
   * @example
   * const data = Utils.readFromModuleObject('my-module', 'customData');
   */
  static readFromModuleObject(moduleIdentifier, key) {
    return StaticUtils.readFromModuleObject(moduleIdentifier, key);
  }

  /**
   * Creates a proxy for a hook function that logs hook calls.
   * Proxy method to StaticUtils.createHookProxy().
   *
   * @static
   * @param {Function} hookFunction - The original hook function to proxy
   * @param {Object} [options={}] - Configuration options for the proxy
   * @returns {Function} The proxied hook function
   *
   * @example
   * const proxiedHooksCall = Utils.createHookProxy(Hooks.call, {
   *   logLevel: 'debug',
   *   filter: (hookName) => hookName.startsWith('OMH.')
   * });
   */
  static createHookProxy(hookFunction, options) {
    return StaticUtils.createHookProxy(hookFunction, options);
  }

  /**
   * Creates a simple hook logger function.
   * Proxy method to StaticUtils.createHookLogger().
   *
   * @static
   * @param {string} [logLevel='debug'] - The console log level to use
   * @param {string} [prefix='Hook Call'] - The prefix for log messages
   * @param {Function} [filter] - Optional filter function
   * @returns {Function} A function that can be used as a hook listener
   *
   * @example
   * const logger = Utils.createHookLogger('debug', 'OMH Hook',
   *   (hookName) => hookName.startsWith('OMH.')
   * );
   */
  static createHookLogger(logLevel, prefix, filter) {
    return StaticUtils.createHookLogger(logLevel, prefix, filter);
  }

  /**
  * Proxies Foundry VTT's Hooks functions with debugging options.
  * Proxy method to StaticUtils.proxyFoundryHooks(). Returns a mapping of proxies.
   *
   * @static
   * @param {Object} [options={}] - Configuration options for the proxy
  * @returns {Object<string, Function>|null} Mapping of function names to proxies or null
   *
   * @example
  * if (debugMode) {
  *   const proxies = Utils.proxyFoundryHooks({ moduleFilter: 'OMH.' });
  *   if (proxies) {
  *     if (proxies.call) Hooks.call = proxies.call;
  *     if (proxies.callAll) Hooks.callAll = proxies.callAll;
  *   }
  * }
   */
  static proxyFoundryHooks(options) {
    return StaticUtils.proxyFoundryHooks(options);
  }

  /**
   * Gets all available validation types.
   * Proxy method to StaticUtils.getAvailableValidationTypes().
   *
   * @static
   * @returns {string[]} Array of available validation type names
   *
   * @example
   * const types = Utils.getAvailableValidationTypes();
   */
  static getAvailableValidationTypes() {
    return StaticUtils.getAvailableValidationTypes();
  }

  /**
   * Gets information about available utilities.
   *
   * @static
   * @returns {Object} Object containing utility information
   *
   * @example
   * const info = Utils.getUtilityInfo();
   * console.log('Available utilities:', info.utilities);
   */
  static getUtilityInfo() {
    return {
      name: 'Utils',
      version: '1.0.0',
      description: 'Central entry point for all utility functionality',
      classes: ['Utilities', 'StaticUtils'],
      staticUtils: StaticUtils.getUtilityInfo().utilities,
      factoryMethods: ['createLogger', 'createInitializer'],
      hookMethods: ['formatHook', 'createHookProxy', 'createHookLogger', 'proxyFoundryHooks']
    };
  }
}

export default Utilities;
export { Utils, Utilities };