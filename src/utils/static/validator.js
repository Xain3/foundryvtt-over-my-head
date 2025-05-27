/**
 * @file validator.js
 * @description This file contains a static Validator class with utility methods for type checking and validation.
 * @path src/utils/static/validator.js
 */

/**
 * Static utility class for validating data types and values.
 * Provides methods for checking primitive types, objects, arrays, and performing validation with error throwing.
 *
 * @class Validator
 */
class Validator {
  /**
   * Checks if a value is defined (not undefined).
   * @param {*} value - The value to check.
   * @returns {boolean} True if value is not undefined, false otherwise.
   */
  static isDefined(value) {
    return value !== undefined;
  }

  /**
   * Checks if a value is null.
   * @param {*} value - The value to check.
   * @returns {boolean} True if value is null, false otherwise.
   */
  static isNull(value) {
    return value === null;
  }

  /**
   * Checks if a value is a string.
   * @param {*} value - The value to check.
   * @returns {boolean} True if value is a string, false otherwise.
   */
  static isString(value) {
    return typeof value === 'string';
  }

  /**
   * Checks if a value is an object with optional prototype name validation.
   * @param {*} value - The value to check.
   * @param {Object} [options={}] - Options for validation.
   * @param {string|null} [options.expectedPrototypeName=null] - Expected prototype constructor name. Defaults to null.
   * @returns {boolean} True if value is an object (and matches prototype if specified), false otherwise.
   */
  static isObject(value, { expectedPrototypeName = null } = {}) {
    const basicObjectCheck = typeof value === 'object' && value !== null && !Array.isArray(value);
    if (!basicObjectCheck) {
      return false;
    }
    if (expectedPrototypeName !== null) {
      return Object.getPrototypeOf(value)?.constructor?.name === expectedPrototypeName;
    }
    return true;
  }

  /**
   * Checks if a value is an array.
   * @param {*} value - The value to check.
   * @returns {boolean} True if value is an array, false otherwise.
   */
  static isArray(value) {
    return Array.isArray(value);
  }

  /**
   * Checks if a value is a number, with flexible options.
   * @param {*} value - The value to check.
   * @param {Object} [options={}] - Options for validation.
   * @param {boolean} [options.integer=false] - Require integer. Defaults to false.
   * @param {boolean} [options.float=false] - Require float (non-integer). Defaults to false.
   * @param {boolean} [options.positive=false] - Require positive number. Defaults to false.
   * @param {boolean} [options.negative=false] - Require negative number. Defaults to false.
   * @param {boolean} [options.includeZero=true] - Whether zero is allowed. Defaults to true.
   * @returns {boolean} True if value meets all number criteria, false otherwise.
   */
  static isNumber(value, {
    integer = false,
    float = false,
    positive = false,
    negative = false,
    includeZero = true
  } = {}) {
    if (typeof value !== 'number' || Number.isNaN(value)) return false;

    if (integer && float) return false; // Contradictory options for integer and float
    if (integer && !Number.isInteger(value)) return false;
    if (float && Number.isInteger(value)) return false;

    if (positive && negative) return false; // Contradictory

    if (positive) {
      if (includeZero) {
        if (value < 0) return false;
      } else {
        if (value <= 0) return false;
      }
    }

    if (negative) {
      if (includeZero) {
        if (value > 0) return false;
      } else {
        if (value >= 0) return false;
      }
    }

    return true;
  }

  /**
   * Checks if a value is empty based on its type.
   * @param {*} value - The value to check.
   * @returns {boolean} True if value is empty (empty string, empty array, or empty object), false otherwise.
   */
  static isEmpty(value) {
    if (Validator.isString(value)) return value.length === 0;
    if (Validator.isArray(value)) return value.length === 0;
    if (Validator.isObject(value)) return Object.keys(value).length === 0;
    return false;
  }

  /**
   * Private method to validate object shape and type.
   * @private
   * @param {*} value - The value to check.
   * @param {string} name - Name of the value for error messages.
   * @param {Object} [options={}] - Options for validation.
   * @param {boolean} [options.allowNull=false] - Whether null values are allowed. Defaults to false.
   * @param {boolean} [options.allowArray=false] - Whether arrays are allowed. Defaults to false.
   * @returns {boolean} True if validation passes.
   * @throws {Error} If validation fails.
   */
  static #isObjectShape(value, name, { allowNull = false, allowArray = false } = {}) {
    if (Validator.isNull(value)) {
      if (allowNull) return true;
      throw new Error(`${name} cannot be null.`);
    }

    const isActualObject = Validator.isObject(value);
    const isActualArray = Validator.isArray(value);

    if (allowArray) {
      if (!isActualObject && !isActualArray) {
        throw new Error(`${name} must be an object or array. Received: ${typeof value}`);
      }
    } else {
      if (isActualArray) {
        throw new Error(`${name} cannot be an array.`);
      }
      if (!isActualObject) {
        throw new Error(`${name} must be an object. Received: ${typeof value}`);
      }
    }
    return true;
  }

  /**
   * Private method to validate that object keys are strings.
   * @private
   * @param {Object} obj - The object to check.
   * @param {string} name - Name of the object for error messages.
   * @throws {Error} If any keys are not strings.
   */
  static #hasStringKeys(obj, name) {
    if (Object.keys(obj).some(key => !Validator.isString(key))) {
      throw new Error(`${name} keys must be strings.`);
    }
  }

  /**
   * Private method to validate that a value is not empty.
   * @private
   * @param {*} value - The value to check.
   * @param {string} name - Name of the value for error messages.
   * @throws {Error} If value is empty.
   */
  static #isNotEmpty(value, name) {
    if (Validator.isEmpty(value)) {
      if (Validator.isString(value) || Validator.isArray(value)) {
        throw new Error(`${name} cannot be empty.`);
      } else if (Validator.isObject(value)) {
        throw new Error(`${name} cannot be an empty object.`);
      }
      // For other types, isEmpty returns false, so this block won't be hit inappropriately.
    }
  }

  /**
   * Validates that a value is an object with optional constraints.
   * @param {*} value - The value to validate.
   * @param {string} name - Name of the value for error messages.
   * @param {Object} [options={}] - Options for validation.
   * @param {boolean} [options.allowNull=false] - Whether null values are allowed. Defaults to false.
   * @param {boolean} [options.allowEmpty=false] - Whether empty objects are allowed. Defaults to false.
   * @param {boolean} [options.checkKeys=true] - Whether to validate that keys are strings. Defaults to true.
   * @throws {Error} If validation fails.
   */
  static validateObject(value, name, { allowNull = false, allowEmpty = false, checkKeys = true } = {}) {
    if (!Validator.isDefined(value)) return; // Property not provided, skip validation for it

    this.#isObjectShape(value, name, { allowNull, allowArray: false });
    if (Validator.isNull(value) && allowNull) return; // If null is allowed and it's null, further checks are moot.

    if (!allowEmpty) {
      this.#isNotEmpty(value, name);
    }

    if (Validator.isObject(value) && checkKeys) {
      // Only check keys if object has keys.
      // If !allowEmpty and object is empty, #isNotEmpty would have already thrown.
      // If allowEmpty and object is empty, no keys to check.
      if (Object.keys(value).length > 0) {
        this.#hasStringKeys(value, name);
      }
      // The 'else if (!allowEmpty)' branch here was redundant because
      // if !allowEmpty and the object was empty, #isNotEmpty would have already thrown.
    }
  }

  /**
   * Validates that a value is a string with optional constraints.
   * @param {*} value - The value to validate.
   * @param {string} name - Name of the value for error messages.
   * @param {Object} [options={}] - Options for validation.
   * @param {boolean} [options.allowEmpty=false] - Whether empty strings are allowed. Defaults to false.
   * @throws {Error} If validation fails.
   */
  static validateString(value, name, { allowEmpty = false } = {}) {
    if (!Validator.isDefined(value)) return;
    if (!Validator.isString(value)) {
      throw new Error(`${name} must be a string. Received: ${typeof value}`);
    }
    if (!allowEmpty) {
      this.#isNotEmpty(value, name); // #isNotEmpty will use Validator.isEmpty
    }
  }

  /**
   * Validates that a value is a number with optional constraints.
   * @param {*} value - The value to validate.
   * @param {string} name - Name of the value for error messages.
   * @param {Object} [options={}] - Options for validation.
   * @param {boolean} [options.isInt=false] - Whether the number must be an integer. Defaults to false.
   * @param {number} [options.min=-Infinity] - Minimum allowed value. Defaults to -Infinity.
   * @param {number} [options.max=Infinity] - Maximum allowed value. Defaults to Infinity.
   * @param {boolean} [options.allowFutureTimestamp=false] - Whether future timestamps are allowed. Defaults to false.
   * @throws {Error} If validation fails.
   */
  static validateNumber(value, name, { isInt = false, min = -Infinity, max = Infinity, allowFutureTimestamp = false } = {}) {
    if (!Validator.isDefined(value)) return;
    // Keep original distinct error messages for typeof and NaN
    if (typeof value !== 'number') {
      throw new Error(`${name} must be a number. Received: ${typeof value}`);
    }
    if (Number.isNaN(value)) {
      throw new Error(`${name} cannot be NaN.`);
    }
    if (isInt && !Number.isInteger(value)) { // Changed Validator.isInteger to Number.isInteger
      throw new Error(`${name} must be an integer.`);
    }
    if (value < min) {
      throw new Error(`${name} (value: ${value}) cannot be less than ${min}.`);
    }
    if (value > max) {
      throw new Error(`${name} (value: ${value}) cannot be greater than ${max}.`);
    }
    // Special handling for timestamp future check
    if (name === 'Timestamp' && !allowFutureTimestamp && value > Date.now()) {
      throw new Error(`${name} cannot be in the future.`);
    }
  }

  /**
   * Validates the structure of an arguments object.
   * @param {*} args - The arguments object to validate.
   * @param {string} [name='Constructor arguments'] - Name for error messages. Defaults to 'Constructor arguments'.
   * @throws {Error} If validation fails.
   */
  static validateArgsObjectStructure(args, name = 'Constructor arguments') {
    this.#isObjectShape(args, name); // Uses updated #isObjectShape
    this.#isNotEmpty(args, name);   // Uses updated #isNotEmpty
    this.#hasStringKeys(args, name); // Uses updated #hasStringKeys
  }

  /**
   * Validates a schema definition object.
   * @param {*} schemaStructure - The schema structure to validate.
   * @param {string} name - Name of the schema for error messages.
   * @throws {Error} If validation fails.
   */
  static validateSchemaDefinition(schemaStructure, name) {
    if (!Validator.isDefined(schemaStructure)) throw new Error('Context schema must be provided.');

    this.validateObject(schemaStructure, name, { allowEmpty: false, checkKeys: true }); // Uses updated validateObject

    Object.values(schemaStructure).forEach((value, index) => {
      const keyName = Object.keys(schemaStructure)[index];
      if (!Validator.isObject(value)) { // isObject checks for non-null, non-array object
        throw new Error(`Value for key "${keyName}" in Context schema must be a non-null object and not an array.`);
      }
      if (Validator.isEmpty(value)) { // isEmpty checks for empty object
        throw new Error(`Value for key "${keyName}" in Context schema cannot be an empty object.`);
      }
      // Not validating keys of inner objects to be strings, as per original logic.
    });
  }

  /**
   * Validates a string against a regular expression pattern.
   * @param {*} value - The value to validate.
   * @param {string} name - Name of the value for error messages.
   * @param {RegExp} pattern - Regular expression pattern to test against.
   * @param {string} patternDescription - Human-readable description of the pattern.
   * @param {Object} [stringValidationOptions={}] - Options passed to validateString. Defaults to {}.
   * @throws {Error} If validation fails.
   */
  static validateStringAgainstPattern(value, name, pattern, patternDescription, stringValidationOptions = {}) {
    if (!Validator.isDefined(value)) throw new Error(`${name} must be provided.`);
    this.validateString(value, name, stringValidationOptions); // Uses updated validateString
    if (!pattern.test(value)) {
      throw new Error(`${name} must be ${patternDescription}. Received: "${value}"`);
    }
  }

  /**
   * Validates that required keys exist in an object.
   * @param {*} objectToCheck - The object to check for keys.
   * @param {string|string[]} keysToCheck - Key or array of keys that must exist.
   * @param {string} [objectName='Object'] - Name of the object for error messages. Defaults to 'Object'.
   * @throws {Error} If validation fails.
   */
  static validateObjectKeysExist(objectToCheck, keysToCheck, objectName = 'Object') {
    if (!Validator.isDefined(objectToCheck)) throw new Error(`${objectName} must be provided for key existence check.`);
    if (!Validator.isDefined(keysToCheck)) throw new Error(`Keys to check must be provided for ${objectName}.`);

    this.validateObject(objectToCheck, objectName, { allowEmpty: false, checkKeys: true }); // Uses updated validateObject

    const processedKeys = Validator.isArray(keysToCheck) ? keysToCheck : [keysToCheck];

    if (Validator.isEmpty(processedKeys)) { // Check if the array of keys itself is empty
      throw new Error(`The list of keys to check for ${objectName} cannot be empty.`);
    }

    processedKeys.forEach((key) => {
      // Use validateString for key validation to ensure it's a non-empty string
      this.validateString(key, `Key to check ("${key}") in ${objectName}`, { allowEmpty: false });
      // Format validation for the key itself is removed from this method.
    });

    for (const key of processedKeys) {
      if (!Object.prototype.hasOwnProperty.call(objectToCheck, key)) {
        throw new Error(`Required key "${key}" is not found in ${objectName}.`);
      }
    }
  }
}

export default Validator;
