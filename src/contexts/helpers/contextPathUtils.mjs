/**
 * @file contextPathUtils.mjs
 * @description Context-aware path utilities that handle mixed ContextContainer/plain object structures.
 * @path src/contexts/helpers/contextPathUtils.mjs
 */

import PathUtils from '../../helpers/pathUtils.mjs';

/**
 * @class ContextPathUtils
 * @description Context-aware path utilities that handle mixed ContextContainer/plain object structures.
 * Provides specialized path resolution for contexts that may contain both ContextContainer instances
 * and plain JavaScript objects in their hierarchy.
 * @export
 *
 * Public API:
 * - static resolveMixedPath(rootObject, path) - Resolves paths through mixed object structures
 * - static pathExistsInMixedStructure(rootObject, path) - Checks if a path exists in mixed structures
 * - static getValueFromMixedPath(rootObject, path) - Gets values from mixed structures
 */
class ContextPathUtils {
  /**
   * Navigation strategy for mixed ContextContainer/plain object structures.
   * Handles the complexity of navigating through both ContextContainer instances
   * (which use getItem/hasItem methods) and plain objects (which use property access).
   * @private
   */
  static #contextNavigationStrategy = {
    /**
     * Navigate to a child object using the appropriate access method.
     * @param {*} obj - The object to navigate from
     * @param {string} key - The key/property to access
     * @returns {object} Navigation result with success flag and value
     */
    navigate: (obj, key) => {
      if (ContextPathUtils.#isContextContainer(obj)) {
        // ContextContainer - use hasItem/getItem methods
        if (obj.hasItem(key)) {
          return { success: true, value: obj.getItem(key) };
        }
      } else if (obj && typeof obj === 'object' && key in obj) {
        // Plain object - use property access
        return { success: true, value: obj[key] };
      }
      return { success: false };
    },

    /**
     * Get a value from an object using the appropriate access method.
     * @param {*} obj - The object to get the value from
     * @param {string} key - The key/property to access
     * @returns {object} Result with exists flag and value
     */
    getValue: (obj, key) => {
      if (ContextPathUtils.#isContextContainer(obj)) {
        // ContextContainer - use hasItem/getItem methods
        const exists = obj.hasItem(key);
        return {
          exists,
          value: exists ? obj.getItem(key) : undefined
        };
      } else if (obj && typeof obj === 'object') {
        // Plain object - use property access
        const exists = key in obj;
        return {
          exists,
          value: exists ? obj[key] : undefined
        };
      }
      return { exists: false, value: undefined };
    }
  };

  /**
   * Checks if an object is a ContextContainer by looking for the isContextContainer property.
   * @private
   * @param {*} obj - The object to check
   * @returns {boolean} True if the object is a ContextContainer
   */
  static #isContextContainer(obj) {
    return obj && typeof obj === 'object' && obj.isContextContainer === true;
  }

  /**
   * Resolves a path through mixed object structures (plain objects and ContextContainers).
   * Handles all combinations: Container+Object, Object+Container, etc.
   * @param {Object} rootObject - The root object to start navigation from
   * @param {string} path - The dot-notation path to resolve
   * @returns {Object} Object with { exists: boolean, value: any, finalContainer: Object|null, finalKey: string|null }
   */
  static resolveMixedPath(rootObject, path) {
    return PathUtils.resolveMixedPath(rootObject, path, ContextPathUtils.#contextNavigationStrategy);
  }

  /**
   * Checks if a path exists in a mixed object structure.
   * @param {Object} rootObject - The root object to start navigation from
   * @param {string} path - The dot-notation path to check
   * @returns {boolean} True if the path exists and can be resolved
   */
  static pathExistsInMixedStructure(rootObject, path) {
    return ContextPathUtils.resolveMixedPath(rootObject, path).exists;
  }

  /**
   * Gets a value from a mixed object structure using a dot-notation path.
   * @param {Object} rootObject - The root object to start navigation from
   * @param {string} path - The dot-notation path to resolve
   * @returns {*} The resolved value or undefined if path doesn't exist
   */
  static getValueFromMixedPath(rootObject, path) {
    return ContextPathUtils.resolveMixedPath(rootObject, path).value;
  }
}

export default ContextPathUtils;
export { ContextPathUtils };
