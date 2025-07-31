/**
 * @file errorFormatter.js
 * @description This file contains a class and function for formatting error messages with module context.
 * @path src/helpers/errorFormatter.js
 */

import manifest from '@manifest';
import constants from '@constants';

const moduleIdentifiers = {
  "title": manifest.title,
  "name": manifest.name,
  "id": manifest.id,
  "shortName": manifest.shortName,
};

const referBy = constants.referToModuleBy;

const moduleName = moduleIdentifiers[referBy.toLowerCase()] || moduleIdentifiers.title;

const separator = constants.errors.separator;
const pattern = constants.errors.pattern;

/**
 * Validates the arguments passed to formatError method
 * @param {Error} error - The error object to validate
 * @param {boolean} includeStack - Whether stack trace should be included
 * @returns {void}
 * @throws {TypeError} When validation fails
 */
const validateArgs = (error, includeStack) => {
  if (typeof error !== 'object' || error === null) {
    throw new TypeError('Error must be an object');
  }
  if (typeof error.message !== 'string') {
    throw new TypeError('Error message must be a string');
  }
  if (typeof error.stack !== 'string' && includeStack) {
    throw new TypeError('Error stack must be a string');
  }
};

/**
 * Formats a single context value for error message replacement
 * @param {string} key - The context key
 * @param {string} value - The context value
 * @param {boolean} includeCaller - Whether caller is included
 * @returns {string} The formatted value
 */
const formatContextValue = (key, value, includeCaller) => {
  if (key === 'error') return value;
  if (key === 'stack') return `\nCall Stack:\n${value}`;

  // Only add separator for module if caller will be included
  if (key === 'module' && !includeCaller) return value;
  return value + separator;
};

/**
 * Builds the error context object
 * @param {Error} error - The error object
 * @param {boolean} includeStack - Whether to include stack trace
 * @param {boolean} includeCaller - Whether to include caller information
 * @param {string} caller - The caller name
 * @returns {Object} The error context object
 */
const buildErrorContext = (error, includeStack, includeCaller, caller) => ({
  module: moduleName,
  error: error.message,
  stack: includeStack ? error.stack : undefined,
  caller: includeCaller ? caller : undefined,
});

/**
 * Replaces placeholders in the error pattern with context values
 * @param {string} pattern - The error pattern template
 * @param {Object} context - The error context object
 * @param {boolean} includeCaller - Whether caller is included
 * @returns {string} The formatted error message
 */
const replacePlaceholders = (pattern, context, includeCaller) => {
  return Object.entries(context).reduce((formattedError, [key, value]) => {
    if (value === undefined) {
      return formattedError.replace(`{{${key}}}`, '');
    }

    const formattedValue = formatContextValue(key, value, includeCaller);
    return formattedError.replace(`{{${key}}}`, formattedValue);
  }, pattern);
};

/**
 * ErrorFormatter class for formatting error messages with module context
 * @export
 *
 * Public API:
 * - formatError(error, options): Static method to format error messages
 *
 * Usage:
 * const formattedError = ErrorFormatter.formatError(new Error('Something went wrong'), {
 *   includeStack: true,
 *   includeCaller: true,
 *   caller: 'myFunction',
 * });
 *
 * Example output:
 * "Error in ModuleName: Something went wrong\nCall Stack:\nError stack trace here
 * \nCaller: myFunction"
 */
class ErrorFormatter {

  /**
   * Formats an error message with module context and optional stack trace
   * @param {Error} error - The error object to format
   * @param {Object} options - Formatting options
   * @param {boolean} [options.includeStack=false] - Whether to include stack trace
   * @param {boolean} [options.includeCaller=false] - Whether to include caller information
   * @param {string} [options.caller=''] - The caller name to include
   * @returns {string} The formatted error message
   * @throws {TypeError} When error validation fails
   */
  static formatError(
    error, {
      includeStack = false,
      includeCaller = false,
      caller = '',
    }) {
      validateArgs(error, includeStack);

      const errorContext = buildErrorContext(error, includeStack, includeCaller, caller);
      return replacePlaceholders(pattern, errorContext, includeCaller);
    }
}

/**
 * Formats an error message with module context and optional stack trace
 * @export
 * @param {Error} error - The error object to format
 * @param {Object} options - Formatting options
 * @returns {string} The formatted error message
 */
export function formatError(error, options) {
  return ErrorFormatter.formatError(error, options);
}

export default ErrorFormatter;