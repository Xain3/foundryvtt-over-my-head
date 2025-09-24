/**
 * @file settingsChecker.js
 * @description A utility class for validating settings objects against required keys and nested properties.
 * @path src/handlers/settingsHelpers/settingsChecker.js
 * @export
 */
class SettingsChecker {
  /**
   * Validates if a setting is a proper object format
   * @param {any} setting - The setting to validate
   * @returns {boolean} True if setting is a valid object, false otherwise
   */
  static #isValidSettingFormat(setting) {
    return setting && typeof setting === 'object' && !Array.isArray(setting);
  }

  /**
   * Checks if a nested property path exists in an object
   * @param {object} obj - The object to check
   * @param {string} path - The dot-notation path to check (e.g., 'config.type')
   * @returns {boolean} True if the path exists, false otherwise
   */
  static #hasNestedProperty(obj, path) {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        return false;
      }
      current = current[part];
    }

    return current !== undefined;
  }

  /**
   * Checks if a simple property exists in an object
   * @param {object} obj - The object to check
   * @param {string} key - The property key to check
   * @returns {boolean} True if the property exists, false otherwise
   */
  static #hasSimpleProperty(obj, key) {
    return key in obj;
  }

  /**
   * Determines if a key represents a nested property path
   * @param {string} key - The key to check
   * @returns {boolean} True if the key contains dots (nested), false otherwise
   */
  static #isNestedKey(key) {
    return key.includes('.');
  }

  /**
   * Validates a single setting against required keys
   * @param {object} setting - The setting object to validate
   * @param {string[]} requiredKeys - Array of required keys (supports dot notation for nested properties)
   * @returns {object} Validation result with success flag and message
   */
  static check(setting, requiredKeys) {
    if (!this.#isValidSettingFormat(setting)) {
      return { success: false, message: 'Invalid setting format' };
    }

    const missingKeys = [];

    for (const key of requiredKeys) {
      const hasProperty = this.#isNestedKey(key)
        ? this.#hasNestedProperty(setting, key)
        : this.#hasSimpleProperty(setting, key);

      if (!hasProperty) {
        missingKeys.push(key);
      }
    }

    if (missingKeys.length > 0) {
      return {
        success: false,
        message: `Missing required settings: ${missingKeys.join(', ')}`
      };
    }

    return { success: true, message: 'Setting is valid' };
  }
}

export default SettingsChecker;