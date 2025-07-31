/**
 * @file static.js
 * @description This file contains the StaticUtils class that serves as the central entry point for all static utility classes.
 * @path src/utils/static/static.js
 */

import Validator from './validator.js';
import Unpacker from './unpacker.js';
import GameManager from './gameManager.js';
import ErrorFormatter from './errorFormatter.js';

/**
 * Central entry point for all static utility classes.
 * Provides a unified interface to access all static utilities including validation, unpacking, game management, and more.
 * This class acts as a facade pattern, allowing easy access to all static utilities from a single import.
 *
 * @class StaticUtils
 * @export
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
   * console.log(info.utilities); // ['Validator', 'Unpacker', 'GameManager']
   */
  static getUtilityInfo() {
    return {
      name: 'StaticUtils',
      utilities: ['Validator', 'Unpacker', 'GameManager', 'ErrorFormatter'],
      description: 'Central entry point for all static utility classes',
      version: '1.0.0'
    };
  }
}

export default StaticUtils;
export { StaticUtils };
