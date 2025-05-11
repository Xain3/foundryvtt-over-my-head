/**
 * Utility class providing static methods for core presence and emptiness checks.
 * These methods return booleans and are intended to be used by other validation
 * classes that handle error messaging and reporting.
 */
class PresenceChecks {
  /**
   * Checks if a value is defined (not undefined and not null).
   * @param {any} value - The value to check.
   * @returns {boolean} True if the value is defined, false otherwise.
   */
  static isDefined(value) {
    return value !== undefined && value !== null;
  }

  /**
   * Checks if a value is empty.
   * @param {any} value - The value to check.
   * @param {boolean} [considerUndefinedAsEmpty=true] - Whether to consider undefined/null values as empty.
   * @returns {boolean} True if the value is considered empty, false otherwise.
   */
  static isEmpty(value, considerUndefinedAsEmpty = true) {
    if (considerUndefinedAsEmpty && !PresenceChecks.isDefined(value)) {
      return true;
    }
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length === 0;
    }
    if (typeof value === 'object' && value !== null && value.constructor === Object) { // Check for plain objects
      return Object.keys(value).length === 0;
    }
    // Other types (numbers, booleans, functions, class instances that are not plain objects)
    // are not considered "empty" by this definition, unless they are undefined/null and considerUndefinedAsEmpty is true.
    return false;
  }

  /**
   * Checks if a value is defined and not empty.
   * @param {any} value - The value to check.
   * @returns {boolean} True if the value is defined and not empty, false otherwise.
   */
  static isDefinedAndNotEmpty(value) {
    if (!PresenceChecks.isDefined(value)) {
      return false;
    }
    // If defined, check if it's empty (not considering undefined as empty here, as it's already confirmed to be defined)
    return !PresenceChecks.isEmpty(value, false);
  }
}

export default PresenceChecks;
