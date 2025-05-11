import ErrorHandler, { defaultHandlerArgs } from '../errorHandler.js';
import ErrorMessageBuilder from '../errorMessageBuilder.js';
import PresenceChecks from './presenceChecks.js';
import TypeChecks from './typeChecks.js';
import InclusionChecks from './inclusionChecks.js'; // Added import

/**
 * Utility class providing static methods for runtime type and value checks
 * with customizable error handling leveraging ErrorHandler.
 *
 * Methods allow for validation of types (string, number, boolean, array, object, function, symbol),
 * presence (defined, not empty), and containment (object/array includes keys/values),
 * with flexible error handling strategies.
 */
class Checks {
  static #defaultValidatorBehaviour = 'throw'; // Default behaviour for validation failures

  static #shouldReturnValue(chosenBehaviour, mergederrorHandlerOptions) {
    return chosenBehaviour === 'return' || mergederrorHandlerOptions.alsoReturn || mergederrorHandlerOptions.forceReturn;
  }

  static #handleValidation(validationResult, errorMessageCore, valueName, actualValue, behaviour, errorHandlerOptions = {}) {
    const mergederrorHandlerOptions = { ...defaultHandlerArgs, ...errorHandlerOptions };
    const chosenBehaviour = behaviour || this.#defaultValidatorBehaviour;

    // If isValid is already an ErrorHandler object (e.g. from a deeper check with behaviour:'object')
    // and it's being passed as the 'isValid' parameter.
    // This condition needs to be robust. A simple check for 'error' property might be one way.
    // For now, the existing typeof isValid === 'object' handles {outcome: ...}
    if (validationResult && typeof validationResult.outcome === 'boolean' && typeof validationResult.error === 'string') { // crude check for error obj
        return ErrorHandler.handle(chosenBehaviour, validationResult.error, { ...mergederrorHandlerOptions, details: validationResult.details });
    }

    if (typeof validationResult === 'object' && validationResult !== null && typeof validationResult.outcome === 'boolean') {
      validationResult = validationResult.outcome;
    }
    if (validationResult) {
      if (Checks.#shouldReturnValue(chosenBehaviour, mergederrorHandlerOptions)) {
        return { outcome: true, value: actualValue };
      }
      return true;
    } else {
      const message = ErrorMessageBuilder.buildErrorMessage(valueName, errorMessageCore, actualValue);
      return ErrorHandler.handle(chosenBehaviour, new Error(message.trim()), mergederrorHandlerOptions);
    }
  }

  // --- Basic Presence and Emptiness ---

  static isDefined(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = PresenceChecks.isDefined(value);
    return this.#handleValidation(isValid, "must be defined", valueName, value, behaviour, errorHandlerOptions);
  }

  static isEmpty(value, { valueName, behaviour, errorHandlerOptions, considerUndefinedAsEmpty = true } = {}) {
    const empty = PresenceChecks.isEmpty(value, considerUndefinedAsEmpty);
    return this.#handleValidation(empty, "must be empty", valueName, value, behaviour, errorHandlerOptions);
  }

  static isDefinedAndNotEmpty(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const defined = PresenceChecks.isDefined(value);
    if (!defined) {
      return this.#handleValidation(false, "must be defined and not empty", valueName, value, behaviour, errorHandlerOptions);
    }
    const notEmpty = !PresenceChecks.isEmpty(value, false);
    return this.#handleValidation(notEmpty, "must not be empty (when defined)", valueName, value, behaviour, errorHandlerOptions);
  }

  // --- Type Checks ---

  static isString(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = TypeChecks.isString(value);
    return this.#handleValidation(isValid, "must be a string", valueName, value, behaviour, errorHandlerOptions);
  }

  static isNumber(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = TypeChecks.isNumber(value);
    return this.#handleValidation(isValid, "must be a number", valueName, value, behaviour, errorHandlerOptions);
  }

  static isBoolean(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = TypeChecks.isBoolean(value);
    return this.#handleValidation(isValid, "must be a boolean", valueName, value, behaviour, errorHandlerOptions);
  }

  static isArray(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = TypeChecks.isArray(value);
    return this.#handleValidation(isValid, "must be an array", valueName, value, behaviour, errorHandlerOptions);
  }

  static isObject(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = TypeChecks.isObject(value);
    return this.#handleValidation(isValid, "must be an object", valueName, value, behaviour, errorHandlerOptions);
  }

  static isFunction(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = TypeChecks.isFunction(value);
    return this.#handleValidation(isValid, "must be a function", valueName, value, behaviour, errorHandlerOptions);
  }

  static isSymbol(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = TypeChecks.isSymbol(value);
    return this.#handleValidation(isValid, "must be a symbol", valueName, value, behaviour, errorHandlerOptions);
  }

  static isValidType(value, expectedTypes, { valueName, behaviour, matchLogic = 'or', errorHandlerOptions } = {}) {
    const typeCheckResult = TypeChecks.isValidType(value, expectedTypes, {
      // valueName: valueName, // TypeChecks.isValidType includes it in its return if provided
      behaviour: 'object', // For TypeChecks.isValidType's own config errors, make it return an error object
      matchLogic,
      options: {} // Minimal options for internal config error handling
    });

    // If TypeChecks.isValidType encountered its own config error and returned an error object:
    if (typeCheckResult && typeof typeCheckResult.overallIsValid !== 'boolean') {
      return typeCheckResult;
    }

    return this.#handleValidation(
      typeCheckResult.overallIsValid,
      typeCheckResult.finalTypeErrorMessage,
      valueName,
      value,
      behaviour,
      errorHandlerOptions
    );
  }

  static returnsValidType(funct, functArgs, { expectedTypes, valueName, behaviour, matchLogic = 'or', errorHandlerOptions } = {}) {
    let isReturnTypeValid;
    try {
      // TypeChecks.returnsValidType internally calls TypeChecks.isValidType.
      // The options passed here are for that internal isValidType's config error handling.
      isReturnTypeValid = TypeChecks.returnsValidType(funct, functArgs, {
        expectedTypes,
        matchLogic,
        behaviour: 'throw', // Make the internal isValidType (within returnsValidType) throw on its config errors
        options: {} // Minimal options for those internal config errors
      });
    } catch (configErrorFromInternalCheck) {
      return ErrorHandler.handle(behaviour || this.#defaultValidatorBehaviour, configErrorFromInternalCheck, { ...defaultHandlerArgs, ...errorHandlerOptions, valueName, callingMethod: 'returnsValidType (config)' });
    }

    return this.#handleValidation(
      isReturnTypeValid,
      "must return a valid type",
      valueName,
      funct,
      behaviour,
      errorHandlerOptions
    );
  }

  // --- Containment Checks ---

  static objectIncludes(obj, items, { checkType = 'keys', valueName, behaviour, errorHandlerOptions } = {}) {
    let checkResult;
    try {
      // Assuming InclusionChecks.objectIncludes is refactored to:
      // - throw on its own configuration errors.
      // - return { outcome: boolean, messagePart?: string } for validation result.
      // For now, we adapt to its current signature if it takes full opts.
      // The ideal call would be: InclusionChecks.objectIncludes(obj, items, checkType)
      checkResult = InclusionChecks.objectIncludes(obj, items, {
        checkType,
        // valueName, // Not for internal check's primary error reporting
        behaviour: 'object', // For InclusionChecks's own config errors, make it return an error object
        errorHandlerOptions: {} // Minimal options for internal config error handling
      });

      // If InclusionChecks returned an error object due to its config error + 'object' behaviour
      if (checkResult && typeof checkResult.outcome !== 'boolean' && checkResult.error) {
        return checkResult; // Already an error object
      }

    } catch (configError) { // If InclusionChecks was set to 'throw' for its config errors
      return ErrorHandler.handle(behaviour || this.#defaultValidatorBehaviour, configError, { ...defaultHandlerArgs, ...errorHandlerOptions, valueName, callingMethod: 'objectIncludes (config)' });
    }

    const outcome = typeof checkResult === 'object' ? checkResult.outcome : checkResult; // Adapt if it returns boolean directly
    const messagePart = (typeof checkResult === 'object' && checkResult.messagePart) ? checkResult.messagePart : "must include all specified keys/values";

    return this.#handleValidation(outcome, messagePart, valueName, obj, behaviour, errorHandlerOptions);
  }

  static arrayIncludes(arr, valuesToCheck, { valueName, behaviour, errorHandlerOptions } = {}) {
    let checkResult;
    try {
      // Similar assumptions as objectIncludes for InclusionChecks.arrayIncludes
      checkResult = InclusionChecks.arrayIncludes(arr, valuesToCheck, {
        // valueName,
        behaviour: 'object',
        errorHandlerOptions: {}
      });

      if (checkResult && typeof checkResult.outcome !== 'boolean' && checkResult.error) {
        return checkResult;
      }

    } catch (configError) {
      return ErrorHandler.handle(behaviour || this.#defaultValidatorBehaviour, configError, { ...defaultHandlerArgs, ...errorHandlerOptions, valueName, callingMethod: 'arrayIncludes (config)' });
    }

    const outcome = typeof checkResult === 'object' ? checkResult.outcome : checkResult;
    const messagePart = (typeof checkResult === 'object' && checkResult.messagePart) ? checkResult.messagePart : "must include all specified values";

    return this.#handleValidation(outcome, messagePart, valueName, arr, behaviour, errorHandlerOptions);
  }

  // --- Combined "isDefinedAnd..." Methods ---

  static isDefinedAndIsString(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = PresenceChecks.isDefined(value) && TypeChecks.isString(value);
    return this.#handleValidation(isValid, "must be defined and a string", valueName, value, behaviour, errorHandlerOptions);
  }

  static isDefinedAndIsNumber(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = PresenceChecks.isDefined(value) && TypeChecks.isNumber(value);
    return this.#handleValidation(isValid, "must be defined and a number", valueName, value, behaviour, errorHandlerOptions);
  }

  static isDefinedAndIsBoolean(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = PresenceChecks.isDefined(value) && TypeChecks.isBoolean(value);
    return this.#handleValidation(isValid, "must be defined and a boolean", valueName, value, behaviour, errorHandlerOptions);
  }

  static isDefinedAndIsArray(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = PresenceChecks.isDefined(value) && TypeChecks.isArray(value);
    return this.#handleValidation(isValid, "must be defined and an array", valueName, value, behaviour, errorHandlerOptions);
  }

  static isDefinedAndIsObject(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = PresenceChecks.isDefined(value) && TypeChecks.isObject(value);
    return this.#handleValidation(isValid, "must be defined and an object", valueName, value, behaviour, errorHandlerOptions);
  }

  static isDefinedAndIsFunction(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = PresenceChecks.isDefined(value) && TypeChecks.isFunction(value);
    return this.#handleValidation(isValid, "must be defined and a function", valueName, value, behaviour, errorHandlerOptions);
  }

  static isDefinedAndIsSymbol(value, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isValid = PresenceChecks.isDefined(value) && TypeChecks.isSymbol(value);
    return this.#handleValidation(isValid, "must be defined and a symbol", valueName, value, behaviour, errorHandlerOptions);
  }

  static isDefinedAndIsValidType(value, expectedTypes, { valueName, behaviour, matchLogic = 'or', errorHandlerOptions } = {}) {
    if (!PresenceChecks.isDefined(value)) {
      return this.#handleValidation(false, "must be defined and a valid type", valueName, value, behaviour, errorHandlerOptions);
    }

    const typeCheckResult = TypeChecks.isValidType(value, expectedTypes, {
      behaviour: 'object',
      matchLogic,
      options: {}
    });

    if (typeCheckResult && typeof typeCheckResult.overallIsValid !== 'boolean') {
      return typeCheckResult; // Error object from TypeChecks.isValidType
    }

    const overallIsValid = typeCheckResult.overallIsValid;
    const messageCore = overallIsValid ? "is defined and a valid type" : typeCheckResult.finalTypeErrorMessage;

    return this.#handleValidation(
      overallIsValid,
      messageCore,
      valueName,
      value,
      behaviour,
      errorHandlerOptions
    );
  }

  static isDefinedAndIsArrayContaining(value, items, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isDefinedAndArray = PresenceChecks.isDefined(value) && TypeChecks.isArray(value);
    if (!isDefinedAndArray) {
      return this.#handleValidation(false, "must be defined, an array, and include all specified items", valueName, value, behaviour, errorHandlerOptions);
    }

    let containsItemsResult;
    try {
      containsItemsResult = InclusionChecks.arrayIncludes(value, items, {
        behaviour: 'object', // For InclusionChecks's own config errors
        errorHandlerOptions: {}
      });
      if (containsItemsResult && typeof containsItemsResult.outcome !== 'boolean' && containsItemsResult.error) {
        return containsItemsResult; // Config error from InclusionChecks
      }
    } catch (configError) {
      return ErrorHandler.handle(behaviour || this.#defaultValidatorBehaviour, configError, { ...defaultHandlerArgs, ...errorHandlerOptions, valueName, callingMethod: 'isDefinedAndIsArrayContaining (config)' });
    }

    const outcome = typeof containsItemsResult === 'object' ? containsItemsResult.outcome : containsItemsResult;
    const messagePart = (typeof containsItemsResult === 'object' && containsItemsResult.messagePart) ? containsItemsResult.messagePart : "must include all specified items";

    return this.#handleValidation(outcome, messagePart, valueName, value, behaviour, errorHandlerOptions);
  }

  static isDefinedAndIsObjectContaining(value, items, { valueName, behaviour, errorHandlerOptions } = {}) {
    const isDefinedAndObject = PresenceChecks.isDefined(value) && TypeChecks.isObject(value);
    if (!isDefinedAndObject) {
      return this.#handleValidation(false, "must be defined, an object, and include all specified keys", valueName, value, behaviour, errorHandlerOptions);
    }

    let containsItemsResult;
    try {
      containsItemsResult = InclusionChecks.objectIncludes(value, items, {
        checkType: 'keys',
        behaviour: 'object', // For InclusionChecks's own config errors
        errorHandlerOptions: {}
      });
      if (containsItemsResult && typeof containsItemsResult.outcome !== 'boolean' && containsItemsResult.error) {
        return containsItemsResult; // Config error from InclusionChecks
      }
    } catch (configError) {
      return ErrorHandler.handle(behaviour || this.#defaultValidatorBehaviour, configError, { ...defaultHandlerArgs, ...errorHandlerOptions, valueName, callingMethod: 'isDefinedAndIsObjectContaining (config)' });
    }

    const outcome = typeof containsItemsResult === 'object' ? containsItemsResult.outcome : containsItemsResult;
    const messagePart = (typeof containsItemsResult === 'object' && containsItemsResult.messagePart) ? containsItemsResult.messagePart : "must include all specified keys";

    return this.#handleValidation(outcome, messagePart, valueName, value, behaviour, errorHandlerOptions);
  }
}

export default Checks;