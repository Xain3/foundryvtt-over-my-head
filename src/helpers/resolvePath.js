/**
 * @file resolvePath.js
 * @description This file contains a utility function to dynamically resolve object paths using dot notation.
 * @path src/helpers/resolvePath.js
 * @date 2025-05-25
 */

/**
 * Validates the input parameters for path resolution.
 *
 * @param {*} namespace - The namespace to validate
 * @param {*} path - The path to validate
 * @throws {TypeError} If validation fails
 */
const validateInputs = (namespace, path) => {
  if (typeof namespace !== 'object' || namespace === null) {
    throw new TypeError('namespace must be an object');
  }

  if (typeof path !== 'string') {
    throw new TypeError('path must be a string');
  }
};

/**
 * Attempts to access a property using normal object access.
 *
 * @param {Object} obj - The object to access
 * @param {string} property - The property name
 * @returns {*} The property value or undefined
 */
const getPropertyValue = (obj, property) => {
  if (property in obj) {
    return obj[property];
  }
  return undefined;
};

/**
 * Attempts to access a property using the getter method fallback.
 *
 * @param {Object} obj - The object to access
 * @param {string} property - The property name
 * @returns {*} The property value or undefined
 */
const getPropertyWithGetter = (obj, property) => {
  if (typeof obj.get === 'function') {
    return obj.get(property);
  }
  return undefined;
};

/**
 * Resolves a single property access with optional getter fallback.
 *
 * @param {Object} current - The current object
 * @param {string} property - The property to access
 * @param {boolean} useGetterFallback - Whether to use getter fallback
 * @returns {*} The resolved value or undefined if not found
 */
const resolveProperty = (current, property, useGetterFallback) => {
  if (current === null || current === undefined) {
    return undefined;
  }

  let value = getPropertyValue(current, property);

  if (value === undefined && useGetterFallback) {
    value = getPropertyWithGetter(current, property);
  }

  return value;
};

/**
 * Checks if a property exists in an object or via getter method.
 *
 * @param {Object} obj - The object to check
 * @param {string} property - The property name
 * @param {boolean} useGetterFallback - Whether to check getter fallback
 * @returns {boolean} True if property exists
 */
const hasProperty = (obj, property, useGetterFallback) => {
  if (obj === null || obj === undefined) return false;

  if (property in obj) return true;

  if (useGetterFallback && typeof obj.get === 'function') {
    return obj.get(property) !== undefined;
  }

  return false;
};

/**
 * Dynamically resolves a dot-separated path within a given object namespace.
 *
 * @param {Object} namespace - The root object to start path resolution from (e.g., globalThis, window)
 * @param {string} path - The dot-separated path to resolve (e.g., "game.settings", "ui.notifications.info")
 * @param {boolean} [useGetterFallback=true] - Whether to fallback to using .get(property) method when normal access fails
 * @returns {*} The resolved value at the specified path, or undefined if the path doesn't exist
 * @throws {TypeError} If namespace is not an object or path is not a string
 *
 * @example
 * // Resolve a simple path
 * const settings = resolvePath(globalThis, "game.settings");
 *
 * @example
 * // Resolve a nested path
 * const notifyMethod = resolvePath(window, "ui.notifications.info");
 *
 * @example
 * // Handle non-existent paths gracefully
 * const missing = resolvePath(globalThis, "does.not.exist"); // returns undefined
 *
 * @example
 * // Disable getter fallback
 * const value = resolvePath(namespace, "path.to.property", false);
 */
export const resolvePath = (namespace, path, useGetterFallback = true) => {
  validateInputs(namespace, path);

  if (!path.trim()) return namespace;

  const properties = path.split('.');
  let current = namespace;

  for (const property of properties) {
    const nextValue = resolveProperty(current, property, useGetterFallback);

    if (nextValue === undefined && !hasProperty(current, property, useGetterFallback)) {
      return undefined;
    }

    current = nextValue;
  }

  return current;
};