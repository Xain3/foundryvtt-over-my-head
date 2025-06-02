/**
 * @file pathUtils.js
 * @description This file contains a static utility class for path resolution and object navigation operations.
 * @path src/helpers/pathUtils.js
 */

import Validator from '../utils/static/validator.js';

/**
 * @class PathUtils
 * @classdesc Static utility class providing methods for path resolution, object navigation, and key extraction.
 */
class PathUtils {
  /**
   * Validates the input parameters for path resolution.
   * @private
   * @param {*} namespace - The namespace to validate
   * @param {*} path - The path to validate
   * @throws {TypeError} If validation fails
   */
  static #validateResolveInputs(namespace, path) {
    if (typeof namespace !== 'object' || namespace === null) {
      throw new TypeError('namespace must be an object');
    }

    if (typeof path !== 'string') {
      throw new TypeError('path must be a string');
    }
  }

  /**
   * Attempts to access a property using normal object access.
   * @private
   * @param {Object} obj - The object to access
   * @param {string} property - The property name
   * @returns {*} The property value or undefined
   */
  static #getPropertyValue(obj, property) {
    if (property in obj) {
      return obj[property];
    }
    return undefined;
  }

  /**
   * Attempts to access a property using the getter method fallback.
   * @private
   * @param {Object} obj - The object to access
   * @param {string} property - The property name
   * @returns {*} The property value or undefined
   */
  static #getPropertyWithGetter(obj, property) {
    if (typeof obj.get === 'function') {
      return obj.get(property);
    }
    return undefined;
  }

  /**
   * Resolves a single property access with optional getter fallback.
   * @private
   * @param {Object} current - The current object
   * @param {string} property - The property to access
   * @param {boolean} useGetterFallback - Whether to use getter fallback
   * @returns {*} The resolved value or undefined if not found
   */
  static #resolveProperty(current, property, useGetterFallback) {
    if (current === null || current === undefined) {
      return undefined;
    }

    let value = this.#getPropertyValue(current, property);

    if (value === undefined && useGetterFallback) {
      value = this.#getPropertyWithGetter(current, property);
    }

    return value;
  }

  /**
   * Checks if a property exists in an object or via getter method.
   * @private
   * @param {Object} obj - The object to check
   * @param {string} property - The property name
   * @param {boolean} useGetterFallback - Whether to check getter fallback
   * @returns {boolean} True if property exists
   */
  static #hasProperty(obj, property, useGetterFallback) {
    if (obj === null || obj === undefined) return false;

    if (property in obj) return true;

    if (useGetterFallback && typeof obj.get === 'function') {
      return obj.get(property) !== undefined;
    }

    return false;
  }

  /**
   * Dynamically resolves a dot-separated path within a given object namespace.
   * @param {Object} namespace - The root object to start path resolution from (e.g., globalThis, window)
   * @param {string} path - The dot-separated path to resolve (e.g., "game.settings", "ui.notifications.info")
   * @param {boolean} [useGetterFallback=true] - Whether to fallback to using .get(property) method when normal access fails
   * @returns {*} The resolved value at the specified path, or undefined if the path doesn't exist
   * @throws {TypeError} If namespace is not an object or path is not a string
   *
   * @example
   * // Resolve a simple path
   * const settings = PathUtils.resolvePath(globalThis, "game.settings");
   *
   * @example
   * // Resolve a nested path
   * const notifyMethod = PathUtils.resolvePath(window, "ui.notifications.info");
   *
   * @example
   * // Handle non-existent paths gracefully
   * const missing = PathUtils.resolvePath(globalThis, "does.not.exist"); // returns undefined
   *
   * @example
   * // Disable getter fallback
   * const value = PathUtils.resolvePath(namespace, "path.to.property", false);
   */
  static resolvePath(namespace, path, useGetterFallback = true) {
    this.#validateResolveInputs(namespace, path);

    if (!path.trim()) return namespace;

    const properties = path.split('.');
    let current = namespace;

    for (const property of properties) {
      const nextValue = this.#resolveProperty(current, property, useGetterFallback);

      if (nextValue === undefined && !this.#hasProperty(current, property, useGetterFallback)) {
        return undefined;
      }

      current = nextValue;
    }

    return current;
  }

  /**
   * Navigates through an object using a path array to retrieve a nested value.
   * @param {*} obj - The root object to navigate through.
   * @param {string[]} pathParts - Array of property names representing the path to navigate.
   * @param {Object} [options={}] - Options for navigation.
   * @param {number} [options.startIndex=0] - Index to start navigation from in the pathParts array.
   * @param {boolean} [options.strictTypeCheck=true] - Whether to strictly check if intermediate values are objects.
   * @returns {*} The value at the specified path, or undefined if not found.
   * @throws {TypeError} If pathParts is not an array or contains non-string values.
   *
   * @example
   * // Navigate through a nested object
   * const value = PathUtils.getNestedObjectValue(obj, ['user', 'profile', 'name']);
   *
   * @example
   * // Start navigation from a specific index
   * const value = PathUtils.getNestedObjectValue(obj, ['root', 'user', 'name'], { startIndex: 1 });
   */
  static getNestedObjectValue(obj, pathParts, { startIndex = 0, strictTypeCheck = true } = {}) {
    if (!Validator.isArray(pathParts)) {
      throw new TypeError('pathParts must be an array');
    }

    if (pathParts.some(part => !Validator.isString(part))) {
      throw new TypeError('All path parts must be strings');
    }

    let current = obj;

    for (let i = startIndex; i < pathParts.length; i++) {
      const part = pathParts[i];

      if (current === null || current === undefined) {
        return undefined;
      }

      if (strictTypeCheck && typeof current !== 'object') {
        return undefined;
      }

      if (part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Extracts the first key and remaining path from a dot-notated key.
   * @param {string} key - The dot-notated key.
   * @param {Object} [options={}] - Options for extraction.
   * @param {boolean} [options.returnParts=false] - If true, returns an object with `firstKey`, `remainingPath`, and `parts` array.
   * @param {Function} [options.validateFirstKey] - Optional function to validate the first key. Should throw an error if invalid.
   * @returns {Object} An object containing the first key and remaining path.
   * @throws {TypeError} If the key is not a valid string or if validateFirstKey throws an error.
   *
   * @example
   * // Extract key components
   * const { firstKey, remainingPath } = PathUtils.extractKeyComponents("user.profile.name");
   * // firstKey: "user", remainingPath: "profile.name"
   *
   * @example
   * // Get all parts
   * const { firstKey, remainingPath, parts } = PathUtils.extractKeyComponents("a.b.c", { returnParts: true });
   * // parts: ["a", "b", "c"]
   *
   * @example
   * // With validation
   * const result = PathUtils.extractKeyComponents("key.path", {
   *   validateFirstKey: (key) => {
   *     if (key === 'reserved') throw new Error('Reserved key');
   *   }
   * });
   */
  static extractKeyComponents(key, { returnParts = false, validateFirstKey } = {}) {
    if (!Validator.isString(key) || key.length === 0) {
      throw new TypeError('Key must be a non-empty string.');
    }

    const parts = key.split('.');
    const firstKey = parts[0];
    const remainingPath = parts.slice(1).join('.');

    if (validateFirstKey && typeof validateFirstKey === 'function') {
      validateFirstKey(firstKey);
    }

    if (returnParts) {
      return { firstKey, remainingPath, parts };
    }

    return { firstKey, remainingPath };
  }
}

export default PathUtils;
export { PathUtils };
