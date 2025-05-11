import PresenceChecks from "./presenceChecks";

/**
 * Utility class providing static methods for core type checking.
 * These methods return booleans for simple checks or objects for
 * more complex checks and are intended to be used by other validation
 * classes that handle error messaging and reporting.
 */
class TypeChecks {
  /**
   * Checks if a value is a string.
   * @param {any} value - The value to check.
   * @returns {boolean} True if the value is a string, false otherwise.
   */
  static isString(value) {
    return typeof value === 'string';
  }

  /**
   * Checks if a value is a number (and not NaN).
   * @param {any} value - The value to check.
   * @returns {boolean} True if the value is a number, false otherwise.
   */
  static isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Checks if a value is a boolean.
   * @param {any} value - The value to check.
   * @returns {boolean} True if the value is a boolean, false otherwise.
   */
  static isBoolean(value) {
    return typeof value === 'boolean';
  }

  /**
   * Checks if a value is an array.
   * @param {any} value - The value to check.
   * @returns {boolean} True if the value is an array, false otherwise.
   */
  static isArray(value) {
    return Array.isArray(value);
  }

  /**
   * Checks if a value is an object (and not null or an array).
   * @param {any} value - The value to check.
   * @returns {boolean} True if the value is an object, false otherwise.
   */
  static isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Checks if a value is a function.
   * @param {any} value - The value to check.
   * @returns {boolean} True if the value is a function, false otherwise.
   */
  static isFunction(value) {
    return typeof value === 'function';
  }

  /**
   * Checks if a value is a symbol.
   * @param {any} value - The value to check.
   * @returns {boolean} True if the value is a symbol, false otherwise.
   */
  static isSymbol(value) {
    return typeof value === 'symbol';
  }

  /**
   * Validates a value against one or more expected types using GenericTypeChecks.
   * @param {any} value - The value to validate.
   * @param {string|Function|Array<string|Function>} expectedTypes - A single type (string or constructor), or an array of types.
   * @param {object} [opts] - Options object:
   *   { valueName?: string, matchLogic?: 'or'|'and' }
   * @returns {object} An object structured as {value, expected, outcome, checkErrors, configurationErrors}.
   */
  static isValidType(value, expectedTypes, returns = 'boolean', opts = {}) {
    // Options like behaviour, defaultValidatorBehaviour, and ErrorHandler options are removed
    // as errors are now reported in the return object.
    switch (returns) {
      case 'boolean':
        return GenericTypeChecks.isValidType(value, expectedTypes, opts).outcome;
      case 'object':
        return GenericTypeChecks.isValidType(value, expectedTypes, opts);
      default:
        throw new Error(`Invalid return type '${returns}'. Expected 'boolean' or 'object'.`);
    }
  }

  /**
   * Checks if the provided function returns a value of the expected type(s).
   *
   * @param {Function} funct - The function to be invoked and checked.
   * @param {Array} functArgs - The arguments to pass to the function.
   * @param {object} [opts] - Options object:
   *   { expectedTypes: string|Function|Array<string|Function>, matchLogic?: 'or'|'and', valueName?: string }
   * @returns {object} An object structured as {value, expected, outcome, checkErrors, configurationErrors}.
   */
  static returnsValidType(funct, functArgs = [], returns = 'boolean', opts = {}) {
    const {
      expectedTypes,
      matchLogic = 'or', // Default matchLogic for the type check on the return value
      valueName // Name for the return value, e.g., "Function X return"
    } = opts;

    const result = {
      value: undefined,
      expected: Array.isArray(expectedTypes) ? expectedTypes : (expectedTypes !== undefined ? [expectedTypes] : []),
      outcome: false,
      checkErrors: [],
      configurationErrors: []
    };

    if (!TypeChecks.isFunction(funct)) {
      result.value = funct; // Store the actual non-function value
      result.configurationErrors.push("Target to check for return type must be a function.");
      return returns === 'boolean' ? result.outcome : result;
    }

    let returnValue;
    let executionError = null;
    try {
      returnValue = funct(...functArgs);
      result.value = returnValue;
    } catch (e) {
      executionError = e;
      result.value = undefined; // Or keep as undefined
      result.checkErrors.push(`Function execution failed: ${e.message}`);
      // Outcome remains false, further type checking is skipped.
      return returns === 'boolean' ? false : result;
    }

    // If expectedTypes is not provided in opts, it's a configuration issue for this method's purpose.
    if (expectedTypes === undefined) {
        result.configurationErrors.push("expectedTypes must be provided in options for returnsValidType.");
        return result;
    }

    const typeCheckOpts = { valueName: valueName || 'Function return value', matchLogic };
    const typeCheckResult = GenericTypeChecks.isValidType(returnValue, expectedTypes, typeCheckOpts);

    result.outcome = typeCheckResult.outcome;
    result.checkErrors.push(...typeCheckResult.checkErrors);
    // Configuration errors from GenericTypeChecks.isValidType pertain to its own inputs (e.g. malformed expectedTypes)
    result.configurationErrors.push(...typeCheckResult.configurationErrors);

    return result;
  }
}

export class GenericTypeChecks {
  /**
   * Executes a type check for a given value against a type string.
   * @param {any} value - The value to check.
   * @param {string} typeStr - The string representation of the expected type.
   * @returns {object} { isValid: boolean, typeErrorMessagePart: string } or { configurationError: string }.
   * @private
   */
  static #executeStringTypeCheck(value, typeStr) {
    let isValid;
    let typeErrorMessagePart = '';

    switch (typeStr) {
      case 'string':
        isValid = TypeChecks.isString(value);
        typeErrorMessagePart = "must be a string";
        break;
      case 'number':
        isValid = TypeChecks.isNumber(value);
        typeErrorMessagePart = "must be a number";
        break;
      case 'boolean':
        isValid = TypeChecks.isBoolean(value);
        typeErrorMessagePart = "must be a boolean";
        break;
      case 'array':
        isValid = TypeChecks.isArray(value);
        typeErrorMessagePart = "must be an array";
        break;
      case 'object':
        isValid = TypeChecks.isObject(value);
        typeErrorMessagePart = "must be an object";
        break;
      case 'function':
        isValid = TypeChecks.isFunction(value);
        typeErrorMessagePart = "must be a function";
        break;
      case 'symbol':
        isValid = TypeChecks.isSymbol(value);
        typeErrorMessagePart = "must be a symbol";
        break;
      case 'defined':
        isValid = PresenceChecks.isDefined(value);
        typeErrorMessagePart = "must be defined";
        break;
      default:
        return { configurationError: `Unsupported expectedType string '${typeStr}'. Supported: string, number, boolean, array, object, function, symbol, defined. For class checks, pass the constructor directly.` };
    }
    return { isValid, typeErrorMessagePart };
  }

  /**
   * Executes a type check for a given value against a constructor function.
   * @param {any} value - The value to check.
   * @param {Function} constructor - The constructor function to check against.
   * @returns {object} { isValid: boolean, typeErrorMessagePart: string }.
   * @private
   */
  static #executeFunctionTypeCheck(value, constructor) {
    const isValid = value instanceof constructor;
    const typeErrorMessagePart = `must be an instance of '${constructor.name || 'the specified class'}'`;
    return { isValid, typeErrorMessagePart };
  }

  /**
   * Executes a type check based on whether the expected type is a string or a function.
   * @param {any} value - The value to check.
   * @param {string|Function} expectedType - The expected type.
   * @returns {object} { isValid: boolean, typeErrorMessagePart: string } or { configurationError: string }.
   * @private
   */
  static #executeTypeCheck(value, expectedType) {
    if (typeof expectedType === 'string') {
      return this.#executeStringTypeCheck(value, expectedType.toLowerCase());
    } else if (typeof expectedType === 'function') {
      return this.#executeFunctionTypeCheck(value, expectedType);
    } else {
      return { configurationError: `Invalid expectedType parameter. Must be a supported type string or a class constructor.` };
    }
  }

  /**
   * Validates a value against a single expected type.
   * @param {any} value - The value to validate.
   * @param {string|Function} singleExpectedType - The single type to check against.
   * @returns {object} { isValid: boolean, typeErrorMessagePart: string } or { configurationError: string }.
   * @private
   */
  static #validateSingleType(value, singleExpectedType) {
    return this.#executeTypeCheck(value, singleExpectedType);
  }

  /**
   * Converts an expected type (string or function) to its string representation for error messages.
   * @param {string|Function} expectedType - The expected type.
   * @returns {string} The string representation of the expected type.
   * @private
   */
  static #expectedTypeToString(expectedType) {
    if (typeof expectedType === 'string') {
      return expectedType;
    } else if (typeof expectedType === 'function') {
      return expectedType.name || 'the specified class';
    }
    return String(expectedType); // Fallback
  }

  /**
   * Validates a value against an array of expected types using 'AND' logic (must match all).
   * @param {any} value - The value to validate.
   * @param {Array<string|Function>} expectedTypesArray - Array of types to check against.
   * @returns {object} { overallIsValid: boolean, finalTypeErrorMessage: string } or { configurationError: string }.
   * @private
   */
  static #validateTypesWithAndLogic(value, expectedTypesArray) {
    let overallIsValid = true;
    let lastFailureMessage = "did not satisfy all type criteria"; // Default if all pass but logic implies failure (not typical for AND)

    for (const expectedType of expectedTypesArray) {
      const singleCheckResult = this.#validateSingleType(value, expectedType);

      if (singleCheckResult.configurationError) {
        return { configurationError: singleCheckResult.configurationError };
      }

      if (!singleCheckResult.isValid) {
        overallIsValid = false;
        lastFailureMessage = singleCheckResult.typeErrorMessagePart; // The first failing message
        break; // For AND, first failure is enough
      } else {
         // If it's valid, we might want to confirm it met *this specific* criteria for a complex AND message
         // For now, if all pass, the message is generic.
         lastFailureMessage = "met all type criteria"; // Or specific to the last one checked if needed
      }
    }
    return { overallIsValid, finalTypeErrorMessage: lastFailureMessage };
  }

  /**
   * Validates a value against an array of expected types using 'OR' logic.
   * @param {any} value - The value to validate.
   * @param {Array<string|Function>} expectedTypesArray - Array of types.
   * @returns {object} { overallIsValid: boolean, finalTypeErrorMessage: string } or { configurationError: string }.
   * @private
   */
  static #validateTypesWithOrLogic(value, expectedTypesArray) {
    let overallIsValid = false;
    let finalTypeErrorMessage = '';
    let attemptedTypeStrings = [];

    for (const expectedType of expectedTypesArray) {
      const singleCheckResult = this.#validateSingleType(value, expectedType);

      if (singleCheckResult.configurationError) {
        return { configurationError: singleCheckResult.configurationError };
      }

      if (singleCheckResult.isValid) {
        overallIsValid = true;
        // For OR, the message of the type it matched is most relevant.
        finalTypeErrorMessage = singleCheckResult.typeErrorMessagePart;
        break;
      }
      attemptedTypeStrings.push(this.#expectedTypeToString(expectedType));
    }

    if (!overallIsValid) {
      finalTypeErrorMessage = `must be one of: ${attemptedTypeStrings.join(' or ')}`;
    }
    return { overallIsValid, finalTypeErrorMessage };
  }

  /**
   * Validates a value against an array of expected types.
   * @param {any} value - The value to validate.
   * @param {Array<string|Function>} expectedTypes - Array of types.
   * @param {string} matchLogic - 'and' or 'or'.
   * @returns {object} { overallIsValid: boolean, finalTypeErrorMessage: string } or { configurationError: string }.
   * @private
   */
  static #validateTypesAgainstArray(value, expectedTypes, matchLogic) {
    if (expectedTypes.length === 0) {
      return { configurationError: `Configuration Error: 'expectedTypes' array must not be empty.` };
    }

    const useAndLogic = typeof matchLogic === 'string' && matchLogic.toLowerCase() === 'and';

    if (useAndLogic) {
      return this.#validateTypesWithAndLogic(value, expectedTypes);
    } else {
      return this.#validateTypesWithOrLogic(value, expectedTypes);
    }
  }

  /**
   * Core validation logic.
   * @param {any} value - The value to validate.
   * @param {string|Function|Array<string|Function>} expectedTypes - Type(s) to check.
   * @param {string} matchLogic - 'and' or 'or'.
   * @returns {object} { overallIsValid?: boolean, finalTypeErrorMessage?: string, configurationError?: string }.
   * @private
   */
  static #validateTypes(value, expectedTypes, matchLogic) {
    if (Array.isArray(expectedTypes)) {
      return this.#validateTypesAgainstArray(value, expectedTypes, matchLogic);
    } else {
      const resultFromCheck = this.#validateSingleType(value, expectedTypes);
      if (resultFromCheck.configurationError) {
        return { configurationError: resultFromCheck.configurationError };
      }
      return {
        overallIsValid: resultFromCheck.isValid,
        finalTypeErrorMessage: resultFromCheck.typeErrorMessagePart
      };
    }
  }

  /**
   * Validates a value against one or more expected types.
   * @param {any} value - The value to validate.
   * @param {string|Function|Array<string|Function>} expectedTypesInput - A single type or an array of types.
   * @param {object} [opts] - Options object:
   *   { valueName?: string, matchLogic?: 'or'|'and' }
   * @returns {object} An object structured as {value, expected, outcome, checkErrors, configurationErrors}.
   */
  static isValidType(value, expectedTypesInput, opts = {}) {
    const {
      valueName,
      matchLogic = 'or' // Default matchLogic
    } = opts;

    const result = {
      value: value,
      expected: Array.isArray(expectedTypesInput) ? expectedTypesInput : (expectedTypesInput !== undefined ? [expectedTypesInput] : []),
      outcome: false,
      checkErrors: [],
      configurationErrors: []
    };

    if (expectedTypesInput === undefined || (Array.isArray(expectedTypesInput) && expectedTypesInput.length === 0)) {
        result.configurationErrors.push("expectedTypes must be provided and cannot be an empty array.");
        return result;
    }


    const validationCoreResult = this.#validateTypes(value, expectedTypesInput, matchLogic);

    if (validationCoreResult.configurationError) {
      result.configurationErrors.push(validationCoreResult.configurationError);
      // outcome remains false
      return result;
    }

    result.outcome = validationCoreResult.overallIsValid;

    if (!result.outcome) {
      let errMsg = validationCoreResult.finalTypeErrorMessage;
      if (valueName) {
        errMsg = `${valueName} ${errMsg}`;
      }
      result.checkErrors.push(errMsg.trim());
    }

    return result;
  }
}

export default TypeChecks;
