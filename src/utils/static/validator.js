class Validator {
  static isDefined(value) {
    return value !== undefined;
  }

  static isNull(value) {
    return value === null;
  }

  static isString(value) {
    return typeof value === 'string';
  }

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

  static isArray(value) {
    return Array.isArray(value);
  }

  /**
   * Checks if a value is a number, with flexible options.
   * @param {*} value - The value to check.
   * @param {Object} [options={}] - Options for validation.
   * @param {boolean} [options.integer=false] - Require integer.
   * @param {boolean} [options.float=false] - Require float (non-integer).
   * @param {boolean} [options.positive=false] - Require positive number.
   * @param {boolean} [options.negative=false] - Require negative number.
   * @param {boolean} [options.includeZero=true] - Whether zero is allowed.
   * @returns {boolean}
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

  static isEmpty(value) {
    if (Validator.isString(value)) return value.length === 0;
    if (Validator.isArray(value)) return value.length === 0;
    if (Validator.isObject(value)) return Object.keys(value).length === 0;
    return false;
  }

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

  static #hasStringKeys(obj, name) {
    if (Object.keys(obj).some(key => !Validator.isString(key))) {
      throw new Error(`${name} keys must be strings.`);
    }
  }

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

  static validateString(value, name, { allowEmpty = false } = {}) {
    if (!Validator.isDefined(value)) return;
    if (!Validator.isString(value)) {
      throw new Error(`${name} must be a string. Received: ${typeof value}`);
    }
    if (!allowEmpty) {
      this.#isNotEmpty(value, name); // #isNotEmpty will use Validator.isEmpty
    }
  }

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

  static validateArgsObjectStructure(args, name = 'Constructor arguments') {
    this.#isObjectShape(args, name); // Uses updated #isObjectShape
    this.#isNotEmpty(args, name);   // Uses updated #isNotEmpty
    this.#hasStringKeys(args, name); // Uses updated #hasStringKeys
  }

  static validateSchemaDefinition(schemaStructure, name) {
    if (!Validator.isDefined(schemaStructure)) throw new Error('Context schema must be provided.');

    this.validateObject(schemaStructure, name, { allowEmpty: false, checkKeys: true }); // Uses updated validateObject
  }

  static validateStringAgainstPattern(value, name, pattern, patternDescription, stringValidationOptions = {}) {
    if (!Validator.isDefined(value)) throw new Error(`${name} must be provided.`);
    this.validateString(value, name, stringValidationOptions); // Uses updated validateString
    if (!pattern.test(value)) {
      throw new Error(`${name} must be ${patternDescription}. Received: "${value}"`);
    }
  }

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
