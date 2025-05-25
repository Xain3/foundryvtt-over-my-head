/**
 * @file resolvePath.js
 * @description This file contains a utility function to dynamically resolve object paths using dot notation.
 * @path src/helpers/resolvePath.js
 * @date 2025-05-25
 */

/**
 * Dynamically resolves a dot-separated path within a given object namespace.
 *
 * @param {Object} namespace - The root object to start path resolution from (e.g., globalThis, window)
 * @param {string} path - The dot-separated path to resolve (e.g., "game.settings", "ui.notifications.info")
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
 */
export const resolvePath = (namespace, path) => {
  // Validate input parameters
  if (typeof namespace !== 'object' || namespace === null) {
    throw new TypeError('namespace must be an object');
  }

  if (typeof path !== 'string') {
    throw new TypeError('path must be a string');
  }

  // Handle empty path
  if (!path.trim()) {
    return namespace;
  }

  // Split the path into individual property names
  const properties = path.split('.');
  let current = namespace;

  // Navigate through each property in the path
  for (const property of properties) {
    // Check if current object has the property
    if (current === null || current === undefined || !(property in current)) {
      return undefined;
    }

    // Move to the next level
    current = current[property];
  }

  return current;
};