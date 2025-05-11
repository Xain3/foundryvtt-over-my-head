export const defaultHandlerArgs = {
  alsoReturn: true,
  addPrefix: true,
  errorList: [],
  appendErrors: true,
  forceReturn: false,
  updateErrorMessage: true,
  errorPrefix: "",
  customSuffix: ""
};

/**
 * Utility class for handling errors with various behaviors such as throwing, logging, warning, or appending to a list.
 *
 * @class ErrorHandler
 */
class ErrorHandler {

  static #appendErrorToList(appendErrors, error, errorList) {
    if (appendErrors && error && typeof error === 'object') {
      errorList.push(error);
    }
  }

  static #updateErrorMessage(error, message, updateErrorMessage ) {
    if (error && typeof error === 'object' && updateErrorMessage) error.message = message;
    return error;
  }

  /**
   * Handles validation errors according to the specified behaviour and options.
   *
   * @param {string} behaviour - The behaviour to use when handling the error.
   * @param {any} error - The error to handle (typically an Error object).
   * @param {Object} [optionsParam={}] - Additional options for error handling.
   * Can be one of the following:
   * - 'throw': Throws the error.
   * - 'logError': Logs the error as an error.
   * - 'warn': Logs the error as a warning.
   * - 'log': Logs the error as a log message.
   * - 'logAndThrow': Logs the error and then throws it.
   * - 'append': Appends the error to the errorList.
   * - 'return': Returns an object with the outcome and errors.
   * - 'silent': Does nothing with the error.
   * - 'default': Logs the error as an error.
  *
  * @param {boolean} [optionsParam.alsoReturn=true] - If true, and the error is handled without being thrown (e.g., logged, appended), the function will return { outcome: false, errors: errorList }. If false, it will return `undefined` in these scenarios. This does not affect cases that throw an error or the 'return' behaviour.
  * @param {boolean} [optionsParam.addPrefix=true] - Whether to add a prefix to the error message. Defaults to `defaultHandlerArgs.addPrefix`.
  * @param {Array} [optionsParam.errorList] - The list to which errors are added. If not provided, a new empty array is used internally. Defaults to `defaultHandlerArgs.errorList`.
  * @param {boolean} [optionsParam.appendErrors=true] - If true, appends the error to the errorList. Defaults to `defaultHandlerArgs.appendErrors`.
  * @param {boolean} [optionsParam.forceReturn=false] - If true, ensures the function returns `{ outcome: false, ... }` for non-throwing behaviors, even if `alsoReturn` is `false`. This does not affect throwing behaviors or the 'return' behavior. Defaults to `defaultHandlerArgs.forceReturn`.
  * @param {boolean} [optionsParam.updateErrorMessage=true] - If true, updates the error message by adding prefixes and suffixes. Defaults to `defaultHandlerArgs.updateErrorMessage`.
  * @param {string} [optionsParam.errorPrefix=""] - The prefix to add to error messages. Defaults to `defaultHandlerArgs.errorPrefix`.
  * @param {string} [optionsParam.customSuffix=""] - A custom suffix to append to the error message. Defaults to `defaultHandlerArgs.customSuffix`.
  *
  * @throws {Error} Throws an error with a list of messages if the outcome is false.
  * @returns { object | undefined } - Returns an object with the outcome and errors if alsoReturn is true, otherwise returns undefined.
  * The object is structured as follows: { outcome, errors }, where outcome is a bool and errors is a list of errors.
  */
  static handle(
    behaviour,
    error,
    optionsParam = {} // Accept an options object, default to empty
  ) {
    // Merge defaults with provided options, ensuring a fresh errorList by default
    const {
      alsoReturn = defaultHandlerArgs.alsoReturn,
      addPrefix = defaultHandlerArgs.addPrefix,
      errorList = [], // Default to a new array if not in optionsParam
      appendErrors = defaultHandlerArgs.appendErrors,
      forceReturn = defaultHandlerArgs.forceReturn,
      updateErrorMessage = defaultHandlerArgs.updateErrorMessage,
      errorPrefix = defaultHandlerArgs.errorPrefix,
      customSuffix = defaultHandlerArgs.customSuffix
    } = { ...defaultHandlerArgs, ...optionsParam, errorList: optionsParam.errorList || [] };

    const originalErrorMessage = error && typeof error.message === 'string' ? error.message : String(error);
    const message = addPrefix ? `${errorPrefix}${originalErrorMessage}${customSuffix}` : originalErrorMessage;

    let shouldThrow = false;
    let processedWithoutThrow = false;

    switch (behaviour) {
      case 'throw':
        error = ErrorHandler.#updateErrorMessage(error, message, updateErrorMessage);
        ErrorHandler.#appendErrorToList(appendErrors, error, errorList);
        shouldThrow = true;
        break;
      case 'logError':
        error = ErrorHandler.#updateErrorMessage(error, message, updateErrorMessage);
        console.error(message);
        ErrorHandler.#appendErrorToList(appendErrors, error, errorList);
        processedWithoutThrow = true;
        break;
      case 'warn':
        error = ErrorHandler.#updateErrorMessage(error, message, updateErrorMessage);
        console.warn(message);
        ErrorHandler.#appendErrorToList(appendErrors, error, errorList);
        processedWithoutThrow = true;
        break;
      case 'log':
        error = ErrorHandler.#updateErrorMessage(error, message, updateErrorMessage);
        console.log(message);
        ErrorHandler.#appendErrorToList(appendErrors, error, errorList);
        processedWithoutThrow = true;
        break;
      case 'logAndThrow':
        error = ErrorHandler.#updateErrorMessage(error, message, updateErrorMessage);
        console.error(message);
        ErrorHandler.#appendErrorToList(appendErrors, error, errorList);
        shouldThrow = true;
        break;
      case 'append':
        if (error && typeof error === 'object' && updateErrorMessage) {
          error.message = message;
          errorList.push(error); // Pushes the potentially modified error
        };
        processedWithoutThrow = true;
        break;
      case 'object':
        error = ErrorHandler.#updateErrorMessage(error, message, updateErrorMessage);
        return { outcome: false, errors: [] }; // Special case, always returns false
      case 'boolean':
        error = ErrorHandler.#updateErrorMessage(error, message, updateErrorMessage);
        processedWithoutThrow = true;
        return false; // Special case, always returns false
      case 'silent':
        processedWithoutThrow = true;
        break;
      default: // Default behaviour: log an error
        error = ErrorHandler.#updateErrorMessage(error, message, updateErrorMessage);
        console.error(`Unknown error handling behaviour: '${behaviour}'. Logging error: ${message}`);
        processedWithoutThrow = true;
        break;
    }

    if (shouldThrow) {
      // If the original error was not an object, or to ensure a proper Error object is thrown:
      if (!(error instanceof Error)) {
        throw new Error(message);
      }
      // If error is already an Error instance, its message was updated if it's an object.
      throw error;
    }

    if (processedWithoutThrow && (alsoReturn || forceReturn)) {
      return { outcome: false, errors: errorList }; // Return the error list if alsoReturn is true
    }
    // Implicitly returns undefined otherwise (for non-throwing, non-'return' cases where alsoReturn is false)
  }
}

export default ErrorHandler;