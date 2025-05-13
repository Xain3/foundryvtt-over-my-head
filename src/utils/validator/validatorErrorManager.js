import {z} from 'zod';
/**
 * A utility class for building and formatting error messages with customizable prefixes, suffixes, and formatting options.
 *
 * @class ErrorManager
 * @param {string} moduleName - The name of the module where the error originated.
 * @param {string} callerName - The name of the function or caller where the error occurred.
 * @param {string} separator - The separator string used between different parts of the error message.
 * @param {string} [customPrefix] - An optional custom prefix to prepend to error messages.
 * @param {string} [customSuffix] - An optional custom suffix to append to error messages.
 *
 * @property {string} moduleName - The module name.
 * @property {string} callerName - The caller name.
 * @property {string} separator - The separator string.
 * @property {string} customPrefix - The custom prefix.
 * @property {string} customSuffix - The custom suffix.
 * @property {Array<string>} errors - The list of formatted error messages.
 *
 * @method formatError
 * Formats an error or message into a standardized string.
 * @param {Error|string} errorOrMessage - The error object or message string to format.
 * @param {string} [moduleName] - Optional override for the module name.
 * @param {string} [callerName] - Optional override for the caller name.
 * @param {string} [separator] - Optional override for the separator.
 * @param {string} [customPrefix] - Optional override for the custom prefix.
 * @param {string} [customSuffix] - Optional override for the custom suffix.
 * @param {boolean} [includeStack=false] - Whether to include the error stack trace in the formatted message.
 * @returns {string} The formatted error message.
 *
 * @method addError
 * Adds a formatted error message to the internal errors array.
 * @param {Error|string} errorOrMessage - The error object or message string to add.
 * @param {string} [moduleName] - Optional override for the module name.
 * @param {string} [callerName] - Optional override for the caller name.
 * @param {string} [separator] - Optional override for the separator.
 * @param {string} [customPrefix] - Optional override for the custom prefix.
 * @param {string} [customSuffix] - Optional override for the custom suffix.
 * @param {boolean} [includeStack=false] - Whether to include the error stack trace in the formatted message.
 * @returns {void}
 *
 * @method getErrors
 * Retrieves the array of formatted error messages.
 * @returns {Array<string>} The array of error messages.
 *
 * @method getFormattedErrors
 * Retrieves all errors as a single formatted string, each prefixed with its index.
 * @returns {string} The formatted error messages.
 *
 * @method hasErrors
 * Checks if any errors have been added.
 * @returns {boolean} True if there are errors, false otherwise.
 */
class ErrorManager {
  constructor ({moduleName, callerName, separator, customPrefix, customSuffix}) {
    this.#validateArgs({moduleName, callerName, separator, customPrefix, customSuffix});
    this.moduleName = moduleName || 'Unknown Module';
    this.callerName = callerName || 'Unknown Caller';
    this.separator = separator || '||';
    this.customPrefix = customPrefix || '';
    this.customSuffix = customSuffix || '';
    this.errors = [];
  }

  #argsSchema = z.object({
    moduleName: z.string().optional(),
    callerName: z.string().optional(),
    separator: z.string().optional(),
    customPrefix: z.string().optional(),
    customSuffix: z.string().optional(),
    includeStack: z.boolean().optional()
  });

  #errorMessageSchema = z.string();
  #errorObjectSchema = z.instanceof(Error);
  #errorOrMessageSchema = z.union([this.#errorMessageSchema, this.#errorObjectSchema]);

  /**
   * Validates the arguments using Zod schemas.
   *
   * @private
   * @param {Object} args - The arguments to validate.
   * @param {string} args.moduleName - The name of the module where the error occurred.
   * @param {string} args.callerName - The name of the function or caller where the error occurred.
   * @param {string} args.separator - The separator string to use between parts.
   * @param {string} args.customPrefix - A custom prefix to prepend to the message.
   * @param {string} args.customSuffix - A custom suffix to append to the message.
   * @returns {Object} The validated arguments.
   * @throws {Error} If validation fails, an error is thrown with details.
   */
  #validateArgs (args) {
    const result = this.#argsSchema.safeParse(args);
    if (!result.success) {
      const errorMessages = result.error.errors.map(error => error.message).join(', ');
      throw new Error(`Issue handling error. Validation failed: ${errorMessages}`);
    }
    return result.data; // Return the validated data if needed
  }

  /**
   * Validates the error or message using Zod schemas.
   *
   * @private
   * @param {Object} args - The arguments to validate.
   * @param {Error|string} args.errorOrMessage - The error object or message string to validate.
   * @param {string} args.moduleName - The name of the module where the error occurred.
   * @param {string} args.callerName - The name of the function or caller where the error occurred.
   * @param {string} args.separator - The separator string to use between parts.
   * @param {string} args.customPrefix - A custom prefix to prepend to the message.
   * @param {string} args.customSuffix - A custom suffix to append to the message.
   * @param {boolean} args.includeStack - Whether to include the error stack trace in the formatted message.
   * @returns {Object} The validated arguments.
   * @throws {Error} If validation fails, an error is thrown with details.
   */
  #validateError (args) {
    const result = this.#errorOrMessageSchema.safeParse(args);
    if (!result.success) {
      const errorMessages = result.error.errors.map(error => error.message).join(', ');
      throw new Error(`Issue handling error. Validation failed: ${errorMessages}`);
    }
    return result.data; // Return the validated data if needed
  }

  /**
   * Validates the error and arguments using Zod schemas.
   *
   * @private
   * @param {Object} args - The arguments to validate.
   * @param {Error|string} args.errorOrMessage - The error object or message string to validate.
   * @param {string} args.moduleName - The name of the module where the error occurred.
   * @param {string} args.callerName - The name of the function or caller where the error occurred.
   * @param {string} args.separator - The separator string to use between parts.
   * @param {string} args.customPrefix - A custom prefix to prepend to the message.
   * @param {string} args.customSuffix - A custom suffix to append to the message.
   * @param {boolean} args.includeStack - Whether to include the error stack trace in the formatted message.
   * @returns {Object} The validated arguments.
   * @throws {Error} If validation fails, an error is thrown with details.
   */
  #validateErrorAndArgs (args) {
    const schema = z.object({
      errorOrMessage: this.#errorOrMessageSchema,
      ...this.#argsSchema.shape
    });
    const result = schema.safeParse(args);
    if (!result.success) {
      const errorMessages = result.error.errors.map(error => error.message).join(', ');
      throw new Error(`Issue handling error. Validation failed: ${errorMessages}`);
    }
    return result.data; // Return the validated data if needed
  }

  #formatErrorDefaults = {
    moduleName: this.moduleName,
    callerName: this.callerName,
    separator: this.separator,
    customPrefix: this.customPrefix,
    customSuffix: this.customSuffix,
    includeStack: false
  };

  /**
   * Merges the default format error values with the provided arguments.
   *
   * @private
   * @param {Object} args - The arguments to merge with the default values.
   * @param {string} args.moduleName - The name of the module where the error occurred.
   * @param {string} args.callerName - The name of the function or caller where the error occurred.
   * @param {string} args.separator - The separator string to use between parts.
   * @param {string} args.customPrefix - A custom prefix to prepend to the message.
   * @param {string} args.customSuffix - A custom suffix to append to the message.
   * @param {boolean} args.includeStack - Whether to include the error stack trace in the formatted message.
   * @returns {Object} The merged arguments with default values.
   */
  #checkFormatErrorInput (args) {
    this.#validateErrorAndArgs(args);
    return mergedArgs = {... this.#formatErrorDefaults, ...args};
  }

  /**
   * Builds the suffix to append to the formatted error message.
   *
   * @private
   * @param {string} customSuffix - The custom suffix to append.
   * @param {boolean} includeStack - Whether to include the error stack trace.
   * @param {string} errorStack - The stack trace of the error (if applicable).
   * @param {string} separator - The separator string to use between parts.
   * @returns {string} The constructed suffix string.
   */
  #buildErrorSuffix(customSuffix, includeStack, errorStack, separator) {
    let suffixToAppend = customSuffix || ''; // Initialize with customSuffix or empty string

    if (includeStack && errorStack) {
      const stackLines = errorStack.split('\n').slice(1).map(line => line.trim());
      // If there's an existing customSuffix, add separator before stack
      if (suffixToAppend) suffixToAppend += separator;
      suffixToAppend += stackLines.join(separator);
    }
    return suffixToAppend;
  }

  /**
   * Formats the error message based on the provided parameters.
   *
   * @private
   * @param {Error|string} errorOrMessage - The error object or message string to format.
   * @param {string} errorNameStr - The name of the error (if applicable).
   * @param {string} baseMessage - The base message to format.
   * @param {string} moduleName - The name of the module where the error occurred.
   * @param {string} separator - The separator string to use between parts.
   * @param {string} callerName - The name of the function or caller.
   * @param {string} customPrefix - A custom prefix to prepend to the message.
   * @param {string} customSuffix - A custom suffix to append to the message.
   * @param {boolean} includeStack - Whether to include the error stack trace in the formatted message.
   * @param {string} errorStack - The stack trace of the error (if applicable).
   * @returns {string} The formatted error message.
   */
  #formatErrorMessage(errorOrMessage, errorNameStr, baseMessage, moduleName, separator, callerName, customPrefix, customSuffix, includeStack, errorStack) {
    const messageToFormat = errorOrMessage instanceof Error ? `${errorNameStr}: ${baseMessage}` : baseMessage;
    let formattedMessage = `${moduleName}${separator}${callerName}${separator}`;
    if (customPrefix) formattedMessage += `${customPrefix}${separator}`;
    formattedMessage += messageToFormat;
    let suffixToAppend = this.#buildErrorSuffix(customSuffix, includeStack, errorStack, separator);
    if (suffixToAppend) formattedMessage += `${separator}${suffixToAppend}`;
    return formattedMessage;
  }

  /**
   * Parses an error object or message string and extracts relevant information.
   *
   * @private
   * @param {Error|string} errorOrMessage - The error object or message string to parse.
   * @returns {{ errorNameStr: string, baseMessage: string, errorStack: string }}
   *   An object containing the error name, message, and stack trace (if available).
   */
  #parseErrorOrMessage(errorOrMessage) {
    let baseMessage = '';
    let errorStack = '';
    let errorNameStr = 'Error';

    if (errorOrMessage instanceof Error) {
      baseMessage = errorOrMessage.message;
      errorStack = errorOrMessage.stack;
      errorNameStr = errorOrMessage.name;
    } else {
      baseMessage = errorOrMessage;
    }
    return { errorNameStr, baseMessage, errorStack };
  }

  /**
   * Formats an error or message into a standardized string with optional prefixes, suffixes, and stack trace.
   *
   * @param {Object} params - The parameters for formatting the error.
   * @param {Error|string} params.errorOrMessage - The error object or message string to format.
   * @param {string} [params.moduleName=this.moduleName] - The name of the module where the error occurred. The default is the module name passed to the constructor.
   * @param {string} [params.callerName=this.callerName] - The name of the function or caller. The default is the caller name passed to the constructor.
   * @param {string} [params.separator=this.separator] - The separator string to use between parts. The default is the separator passed to the constructor.
   * @param {string} [params.customPrefix=this.customPrefix] - A custom prefix to prepend to the message. The default is the custom prefix passed to the constructor.
   * @param {string} [params.customSuffix=this.customSuffix] - A custom suffix to append to the message. The default is the custom suffix passed to the constructor.
   * @param {boolean} [params.includeStack=false] - Whether to include the error stack trace in the formatted message. The default is false.
   * @returns {string} The formatted error message.
   */
  formatError(args) {
    const {errorOrMessage, moduleName, callerName, separator, customPrefix, customSuffix, includeStack} = this.#checkFormatErrorInput(args);
    const { errorNameStr, baseMessage, errorStack } = this.#parseErrorOrMessage(errorOrMessage);
    let formattedMessage = this.#formatErrorMessage(
      errorOrMessage,
      errorNameStr,
      baseMessage,
      moduleName,
      separator,
      callerName,
      customPrefix,
      customSuffix,
      includeStack,
      errorStack
    );
    return formattedMessage;
  }

  /**
   * Adds a formatted error message to the internal errors array.
   *
   * @param {Object} params - The parameters for the
   * @param {Error|string} params.errorOrMessage - The error object or message string to add.
   * @param {string} [params.moduleName=this.moduleName] - The name of the module where the error occurred. The default is the module name passed to the constructor.
   * @param {string} [params.callerName=this.callerName] - The name of the function or caller reporting the error. The default is the caller name passed to the constructor.
   * @param {string} [params.separator=this.separator] - The separator to use in the formatted error message. The default is the separator passed to the constructor.
   * @param {string} [params.customPrefix=this.customPrefix] - A custom prefix to prepend to the error message. The default is the custom prefix passed to the constructor.
   * @param {string} [params.customSuffix=this.customSuffix] - A custom suffix to append to the error message. The default is the custom suffix passed to the constructor.
   * @param {boolean} [params.includeStack=false] - Whether to include the stack trace in the error message. The default is false.
   */
  addError(args) {
    this.#validateError(args);
    this.errors.push(this.formatError({
      errorOrMessage: args.errorOrMessage,
      moduleName: args.moduleName,
      callerName: args.callerName,
      separator: args.separator,
      customPrefix: args.customPrefix,
      customSuffix: args.customSuffix,
      includeStack: args.includeStack
    }));
  }

  /**
   * Retrieves the list of validation errors.
   * @returns {Array} An array containing the current validation errors.
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Returns a formatted string of all errors, each prefixed with its index (starting from 1).
   *
   * @returns {string} A newline-separated list of errors, each preceded by its 1-based index.
   */
  getFormattedErrors() {
    return this.errors.map((error, index) => `${index + 1}: ${error}`).join('\n');
  }

  /**
   * Checks if there are any validation errors.
   *
   * @returns {boolean} Returns `true` if there are errors, otherwise `false`.
   */
  hasErrors() {
    return this.errors.length > 0;
  }
}

export default ErrorManager;