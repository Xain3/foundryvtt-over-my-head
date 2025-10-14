/**
 * @file static.mjs
 * @description This file contains the StaticUtils class that serves as the central entry point for all static utility classes.
 * @path src/utils/static/static.mjs
 */

import Validator from './validator.mjs';
import Unpacker from './unpacker.mjs';
import GameManager from './gameManager.mjs';
import ErrorFormatter from './errorFormatter.mjs';
import Localizer from './localizer.mjs';
import HooksLogger from './hooksLogger.mjs';
import DevFeaturesManager from './devFeaturesManager.mjs';

/**
 * Central entry point for all static utility classes.
 * Provides a unified interface to access all static utilities including validation, unpacking, game management, error formatting, localization, and hook logging.
 * This class acts as a facade pattern, allowing easy access to all static utilities from a single import.
 *
 * @class StaticUtils
 * @export
 *
 * Public API for static utility functions:
 * - formatError(error, options)
 * - localize(stringId, i18nInstance)
 * - formatLocalized(stringId, data, i18nInstance)
 * - hasLocalization(stringId, i18nInstance)
 * - getModuleObject(moduleIdentifier)
 * - writeToModuleObject(moduleIdentifier, key, value)
 * - readFromModuleObject(moduleIdentifier, key)
 * - getAvailableValidationTypes()
 * - createHookProxy(hookFunction, options)
 * - createHookLogger(logLevel, prefix, filter)
 * - proxyFoundryHooks(options)
 * - shouldEnableDevFeatures(manifest)
 * - resolveManifestFlag(manifest, flagPath, defaultValue)
 * - hasManifestFlag(manifest, flagPath)
 */
class StaticUtils {
  /**
   * Static reference to the ErrorFormatter class for error formatting operations.
   * @static
   * @type {typeof ErrorFormatter}
   */
  static ErrorFormatter = ErrorFormatter;

  /**
   * Static reference to the Validator class for type checking and validation operations.
   * @static
   * @type {typeof Validator}
   */
  static Validator = Validator;

  /**
   * Static reference to the Unpacker class for object property unpacking operations.
   * @static
   * @type {typeof Unpacker}
   */
  static Unpacker = Unpacker;

  /**
   * Static reference to the GameManager class for managing game modules and remote contexts.
   * @static
   * @type {typeof GameManager}
   */
  static GameManager = GameManager;

  /**
   * Static reference to the Localizer class for localization operations.
   * @static
   * @type {typeof Localizer}
   */
  static Localizer = Localizer;

  /**
   * Alias to the Localizer class for convenience access.
   * Allows using `utils.static.localizer` in addition to `utils.static.Localizer`.
   * @static
   * @type {typeof Localizer}
   */
  static localizer = Localizer;

  /**
   * Static reference to the HooksLogger class for hook logging and debugging operations.
   * @static
   * @type {typeof HooksLogger}
   */
  static HooksLogger = HooksLogger;

  /**
   * Static reference to the DevFeaturesManager class for development features management.
   * @static
   * @type {typeof DevFeaturesManager}
   */
  static DevFeaturesManager = DevFeaturesManager;

  /**
   * Static instance of Unpacker for direct method access.
   * @static
   * @type {Unpacker}
   * @private
   */
  static #unpackerInstance = new Unpacker();

  /**
   * Formats error messages using the ErrorFormatter class.
   * @static
   * @param {Error|string} error - The error to format
   * @param {Object} [options={}] - Formatting options
   *                                Options include:
   *                                - includeStack (boolean): Whether to include stack trace
   *                                - includeCaller (boolean): Whether to include caller information
   *                                - caller (string): Custom caller information
   * @returns {string} Formatted error message
   *
   * @example
   * try {
   *   // Some operation
   * } catch (error) {
   *   const formattedError = StaticUtils.formatError(error, { includeStack: true });
   *   console.error(formattedError);
   * }
   */
  static formatError(error, {
      includeStack = false,
      includeCaller = false,
      caller = '',
    } = {}) {
    return this.ErrorFormatter.formatError(error, {
      includeStack,
      includeCaller,
      caller,
    });
  }

  /**
   * Performs validation using the central validate method.
   * Acts as a convenient proxy to Validator.validate().
   *
   * @static
   * @param {string} validationType - The type of validation to perform
   * @param {Object} args - Arguments object containing validation parameters
   * @param {*} args.value - The value to validate
   * @param {string} [args.name] - Name of the value for error messages
   * @param {Object} [args.options={}] - Options specific to the validation type
   * @returns {boolean|void} Returns true for check methods, void for validate methods
   * @throws {Error} If validation type is not supported or validation fails
   *
   * @example
   * // Type checking
   * const isString = StaticUtils.validate('isString', { value: 'hello' }); // true
   *
   * @example
   * // Validation with error throwing
   * StaticUtils.validate('validateString', { value: userInput, name: 'username' });
   *
   * @example
   * // Validation with options
   * StaticUtils.validate('validateNumber', {
   *   value: age,
   *   name: 'age',
   *   options: { min: 0, max: 120 }
   * });
   */
  static validate(validationType, { value, name, options = {} } = {}) {
    return this.Validator.validate(validationType, { value, name, options });
  }

  /**
   * Unpacks properties from an object directly onto a class instance.
   * Acts as a convenient proxy to Unpacker.unpack().
   *
   * @static
   * @param {Object} object - The object to unpack properties from
   * @param {Object} instance - The instance to unpack properties onto
   * @param {string} [objectName="object"] - Name for error reporting purposes
   * @throws {TypeError} If object or instance are null/undefined, or if object is not an object type
   * @throws {Error} If an error occurs during the unpacking process
   *
   * @example
   * // Basic unpacking
   * const instance = {};
   * const data = { title: 'Test', version: '1.0.0', active: true };
   * StaticUtils.unpack(data, instance);
   * // instance now has: instance.title, instance.version, instance.active
   *
   * @example
   * // With custom object name for error reporting
   * StaticUtils.unpack(moduleData, moduleInstance, 'module');
   */
  static unpack(object, instance, objectName = "object") {
    return this.#unpackerInstance.unpack(object, instance, objectName);
  }

  /**
   * Gets a module object by its identifier using the GameManager utility.
   * Acts as a convenient proxy to GameManager.getModuleObject().
   *
   * @static
   * @param {Object|string} moduleIdentifier - The module identifier (manifest object with 'id' property or string name)
   * @returns {Object|null} The module object or null if not found
   *
   * @example
   * // Using a string identifier
   * const module = StaticUtils.getModuleObject('my-module-id');
   *
   * @example
   * // Using a manifest object
   * const manifest = { id: 'my-module-id', name: 'My Module' };
   * const module = StaticUtils.getModuleObject(manifest);
   */
  static getModuleObject(moduleIdentifier) {
    return this.GameManager.getModuleObject(moduleIdentifier);
  }

  static getSetting(moduleId, key) {
    return this.GameManager.getSetting(moduleId, key);
  }

  /**
   * Writes a key-value pair to a module object using the GameManager utility.
   * Acts as a convenient proxy to GameManager.writeToModuleObject().
   *
   * @static
   * @param {Object|string} moduleIdentifier - The module identifier (manifest object with 'id' property or string name)
   * @param {string} key - The key to be added or updated in the module object
   * @param {*} value - The value to be associated with the key in the module object
   * @returns {boolean} True if the operation was successful, false otherwise
   *
   * @example
   * // Write to module using string identifier
   * StaticUtils.writeToModuleObject('my-module', 'customData', { setting: true });
   *
   * @example
   * // Write to module using manifest object
   * const manifest = { id: 'my-module' };
   * StaticUtils.writeToModuleObject(manifest, 'status', 'active');
   */
  static writeToModuleObject(moduleIdentifier, key, value) {
    return this.GameManager.writeToModuleObject(moduleIdentifier, key, value);
  }

  /**
   * Reads a value from a module object using the GameManager utility.
   * Acts as a convenient proxy to GameManager.readFromModuleObject().
   *
   * @static
   * @param {Object|string} moduleIdentifier - The module identifier (manifest object with 'id' property or string name)
   * @param {string} key - The key to look up in the module object
   * @returns {*} The value associated with the provided key, or undefined if not found
   *
   * @example
   * // Read from module using string identifier
   * const data = StaticUtils.readFromModuleObject('my-module', 'customData');
   *
   * @example
   * // Read from module using manifest object
   * const manifest = { id: 'my-module' };
   * const status = StaticUtils.readFromModuleObject(manifest, 'status');
   */
  static readFromModuleObject(moduleIdentifier, key) {
    return this.GameManager.readFromModuleObject(moduleIdentifier, key);
  }

  /**
   * Localizes a string using Foundry VTT's localization system.
   * Acts as a convenient proxy to Localizer.localize().
   *
   * @static
   * @param {string} stringId - The localization key to translate
   * @param {Object} [i18nInstance] - Optional i18n instance to use. Defaults to game?.i18n
   * @returns {string} The localized string, or the original string if translation is not found
   * @throws {Error} If no i18n instance is available
   *
   * @example
   * // Basic localization
   * const welcomeText = StaticUtils.localize('MYMODULE.welcome');
   *
   * @example
   * // With custom i18n instance
   * const text = StaticUtils.localize('CUSTOM.key', customI18nInstance);
   */
  static localize(stringId, i18nInstance = null) {
    return this.Localizer.localize(stringId, i18nInstance);
  }

  /**
   * Formats a localized string with variable substitution using Foundry VTT's localization system.
   * Acts as a convenient proxy to Localizer.format().
   *
   * @static
   * @param {string} stringId - The localization key to translate
   * @param {Object} [data={}] - Data object for variable substitution
   * @param {Object} [i18nInstance] - Optional i18n instance to use. Defaults to game?.i18n
   * @returns {string} The formatted localized string with variables substituted
   * @throws {Error} If no i18n instance is available
   *
   * @example
   * // Basic formatting with variables
   * const greeting = StaticUtils.formatLocalized('MYMODULE.greeting', { name: 'Player' });
   *
   * @example
   * // With custom i18n instance
   * const formatted = StaticUtils.formatLocalized('CUSTOM.playerCount', { count: 5 }, customI18nInstance);
   */
  static formatLocalized(stringId, data = {}, i18nInstance = null) {
    return this.Localizer.format(stringId, data, i18nInstance);
  }

  /**
   * Checks if a localization key exists in the translation dictionary.
   * Acts as a convenient proxy to Localizer.has().
   *
   * @static
   * @param {string} stringId - The localization key to check
   * @param {Object} [i18nInstance] - Optional i18n instance to use. Defaults to game?.i18n
   * @returns {boolean} True if the key exists, false otherwise
   *
   * @example
   * // Check if localization key exists
   * if (StaticUtils.hasLocalization('MYMODULE.optionalText')) {
   *   const text = StaticUtils.localize('MYMODULE.optionalText');
   * }
   */
  static hasLocalization(stringId, i18nInstance = null) {
    return this.Localizer.has(stringId, i18nInstance);
  }

  /**
   * Gets all available validation types from the Validator class.
   * Useful for debugging or generating help documentation.
   *
   * @static
   * @returns {string[]} Array of available validation type names
   *
   * @example
   * const types = StaticUtils.getAvailableValidationTypes();
   * console.log(types); // ['isDefined', 'isString', 'validateObject', ...]
   */
  static getAvailableValidationTypes() {
    // Extract available validation types from the validation map in Validator.validate
    const checkMethods = [
      'isDefined', 'isNull', 'isString', 'isObject', 'isArray',
      'isPlainObject', 'isNumber', 'isEmpty', 'isBoolean',
      'isPrimitive', 'isReservedKey'
    ];

    const validateMethods = [
      'validateObject', 'validateString', 'validateNumber', 'validateDate',
      'validateArgsObjectStructure', 'validateSchemaDefinition',
      'validateStringAgainstPattern', 'validateObjectKeysExist'
    ];

    return [...checkMethods, ...validateMethods];
  }

  /**
   * Gets information about the available utility classes.
   *
   * @static
   * @returns {Object} Object containing utility class information
   *
   * @example
   * const info = StaticUtils.getUtilityInfo();
   * console.log(info.utilities); // ['Validator', 'Unpacker', 'GameManager', 'ErrorFormatter', 'Localizer', 'HooksLogger']
   */
  static getUtilityInfo() {
    return {
      name: 'StaticUtils',
      utilities: ['Validator', 'Unpacker', 'GameManager', 'ErrorFormatter', 'Localizer', 'HooksLogger', 'DevFeaturesManager'],
      description: 'Central entry point for all static utility classes',
      version: '1.0.0'
    };
  }

  /**
   * Creates a proxy for a hook function that logs hook calls while preserving the original functionality.
   * Acts as a convenient proxy to HooksLogger.createHookProxy().
   *
   * @static
   * @param {Function} hookFunction - The original hook function to proxy
   * @param {Object} [options={}] - Configuration options for the proxy
   * @returns {Function} The proxied hook function that logs calls and preserves original behavior
   * @throws {TypeError} If hookFunction is not a function
   *
   * @example
   * // Create a proxy for debugging hook calls
   * const proxiedHooksCall = StaticUtils.createHookProxy(Hooks.call, {
   *   logLevel: 'debug',
   *   filter: (hookName) => hookName.startsWith('OMH.')
   * });
   */
  static createHookProxy(hookFunction, options = {}) {
    return this.HooksLogger.createHookProxy(hookFunction, options);
  }

  /**
   * Creates a simple hook logger that logs hook calls without modifying the original function.
   * Acts as a convenient proxy to HooksLogger.createHookLogger().
   *
   * @static
   * @param {string} [logLevel='debug'] - The console log level to use
   * @param {string} [prefix='Hook Call'] - The prefix for log messages
   * @param {Function} [filter] - Optional filter function to determine which hooks to log
   * @returns {Function} A function that can be used as a hook listener to log hook calls
   *
   * @example
   * // Create a logger for specific hooks
   * const logger = StaticUtils.createHookLogger('debug', 'OMH Hook', 
   *   (hookName) => hookName.startsWith('OMH.')
   * );
   */
  static createHookLogger(logLevel = 'debug', prefix = 'Hook Call', filter = null) {
    return this.HooksLogger.createHookLogger(logLevel, prefix, filter);
  }

  /**
  * Convenience method for proxying Foundry VTT's Hooks functions with debugging options.
  * Acts as a convenient proxy to HooksLogger.proxyFoundryHooks(). Returns a mapping of proxies.
   *
   * @static
   * @param {Object} [options={}] - Configuration options for the proxy
  * @returns {Object<string, Function>|null} Mapping of function names to proxies, or null if none created
   *
   * @example
  * // Enable hook logging for debugging (multi-function)
  * if (debugMode) {
  *   const proxies = StaticUtils.proxyFoundryHooks({ moduleFilter: 'OMH.' });
  *   if (proxies) {
  *     if (proxies.call) Hooks.call = proxies.call;
  *     if (proxies.callAll) Hooks.callAll = proxies.callAll;
  *   }
  * }
   */
  static proxyFoundryHooks(options = {}) {
    return this.HooksLogger.proxyFoundryHooks(options);
  }

  /**
   * Determines whether development features should be enabled based on the manifest.
   * Acts as a convenient proxy to DevFeaturesManager.shouldEnableDevFeatures().
   *
   * @static
   * @param {Object} manifest - The module manifest object
   * @returns {boolean} True if dev features should be enabled, false otherwise
   *
   * @example
   * const manifest = { flags: { dev: true } };
   * const shouldEnable = StaticUtils.shouldEnableDevFeatures(manifest);
   * // Returns: true
   */
  static shouldEnableDevFeatures(manifest) {
    return this.DevFeaturesManager.shouldEnableDevFeatures(manifest);
  }

  /**
   * Resolves a flag value from the manifest using a dot-notation path.
   * Acts as a convenient proxy to DevFeaturesManager.resolveManifestFlag().
   *
   * @static
   * @param {Object} manifest - The module manifest object
   * @param {string} flagPath - Dot-notation path to the flag (e.g., 'flags.dev')
   * @param {*} defaultValue - Default value to return if flag is not found
   * @returns {*} The resolved flag value or default value
   *
   * @example
   * const manifest = { flags: { dev: true } };
   * const dev = StaticUtils.resolveManifestFlag(manifest, 'flags.dev', false);
   * // Returns: true
   */
  static resolveManifestFlag(manifest, flagPath, defaultValue) {
    return this.DevFeaturesManager.resolveManifestFlag(manifest, flagPath, defaultValue);
  }

  /**
   * Checks if a specific flag exists in the manifest.
   * Acts as a convenient proxy to DevFeaturesManager.hasManifestFlag().
   *
   * @static
   * @param {Object} manifest - The module manifest object
   * @param {string} flagPath - Dot-notation path to the flag
   * @returns {boolean} True if the flag exists, false otherwise
   *
   * @example
   * const manifest = { flags: { dev: false } };
   * const exists = StaticUtils.hasManifestFlag(manifest, 'flags.dev');
   * // Returns: true
   */
  static hasManifestFlag(manifest, flagPath) {
    return this.DevFeaturesManager.hasManifestFlag(manifest, flagPath);
  }
}

export default StaticUtils;
export { StaticUtils };
