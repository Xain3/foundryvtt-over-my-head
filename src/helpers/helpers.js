/**
 * @file helpers.js
 * @description Centralized entry point for all helper utilities providing path resolution, module management, and configuration parsing capabilities.
 * @path src/helpers/helpers.js
 */

import PathUtils from './pathUtils.js';
import { getModule } from './moduleGetter.js';
import RootMapParser from './rootMapParser.js';
import { formatError } from './errorFormatter.js';

/**
 * @class Helpers
 * @classdesc Centralized entry point for all helper utilities. This class provides access to all helper functionality through a single import, reducing the need for multiple imports when using helpers from outside the helpers folder.
 * @export
 *
 * Public API:
 * - PathUtils: Complete path resolution and navigation utilities
 * - getModule(): Foundry VTT module retrieval functionality
 * - RootMapParser: Configuration parsing and resolution
 * - formatError(): Error formatting utilities
 * - Convenience methods for common operations
 */
class Helpers {
  /**
   * PathUtils class for path resolution and object navigation operations.
   * @static
   * @type {PathUtils}
   */
  static PathUtils = PathUtils;

  /**
   * RootMapParser class for parsing root map configurations into resolved objects.
   * @static
   * @type {RootMapParser}
   */
  static RootMapParser = RootMapParser;

  // ========================================
  // Convenience Methods
  // ========================================

  /**
   * Convenience method for path resolution.
   * @static
   * @param {Object} namespace - The root object to start path resolution from
   * @param {string} path - The dot-separated path to resolve
   * @param {boolean} [useGetterFallback=true] - Whether to fallback to using .get(property) method
   * @returns {*} The resolved value at the specified path, or undefined if not found
   *
   * @example
   * const settings = Helpers.resolvePath(globalThis, "game.settings");
   * const user = Helpers.resolvePath(window, "game.user.name");
   */
  static resolvePath(namespace, path, useGetterFallback = true) {
    return PathUtils.resolvePath(namespace, path, useGetterFallback);
  }

  /**
   * Convenience method for extracting key components from dot-notation paths.
   * @static
   * @param {string} key - The dot-notated key
   * @param {Object} [options={}] - Options for extraction
   * @returns {Object} Object containing the first key and remaining path
   *
   * @example
   * const { firstKey, remainingPath } = Helpers.extractKeyComponents("user.profile.name");
   * // firstKey: "user", remainingPath: "profile.name"
   */
  static extractKeyComponents(key, options = {}) {
    return PathUtils.extractKeyComponents(key, options);
  }

  /**
   * Convenience method for mixed path resolution with custom navigation strategies.
   * @static
   * @param {Object} rootObject - The root object to start navigation from
   * @param {string} path - The dot-notation path to resolve
   * @param {Object} [navigationStrategy=null] - Custom navigation strategy
   * @returns {Object} Object with { exists, value, finalContainer, finalKey }
   *
   * @example
   * const result = Helpers.resolveMixedPath(container, "player.stats.level");
   * if (result.exists) {
   *   console.log(result.value); // The resolved value
   * }
   */
  static resolveMixedPath(rootObject, path, navigationStrategy = null) {
    return PathUtils.resolveMixedPath(rootObject, path, navigationStrategy);
  }

  /**
   * Convenience method for checking if a path exists in mixed object structures.
   * @static
   * @param {Object} rootObject - The root object to start navigation from
   * @param {string} path - The dot-notation path to check
   * @returns {boolean} True if the path exists and can be resolved
   *
   * @example
   * if (Helpers.pathExists(container, "player.inventory.weapons")) {
   *   // Path exists, safe to access
   * }
   */
  static pathExists(rootObject, path) {
    return PathUtils.pathExistsInMixedStructure(rootObject, path);
  }

  /**
   * Convenience method for getting values from mixed path structures.
   * @static
   * @param {Object} rootObject - The root object to start navigation from
   * @param {string} path - The dot-notation path to resolve
   * @returns {*} The resolved value or undefined if path doesn't exist
   *
   * @example
   * const playerName = Helpers.getValueFromMixedPath(container, "player.name");
   */
  static getValueFromMixedPath(rootObject, path) {
    return PathUtils.getValueFromMixedPath(rootObject, path);
  }

  /**
   * Convenience method for retrieving Foundry VTT modules.
   * @static
   * @param {string} moduleName - The name of the module to retrieve
   * @param {object} [globalNamespace=globalThis] - The global namespace object to search in
   * @returns {*} The requested module object or null if not found
   *
   * @example
   * const module = Helpers.getModule('my-module-id');
   * if (module) {
   *   console.log(module.title); // Module title
   * }
   */
  static getModule(moduleName, globalNamespace = globalThis) {
    return getModule(moduleName, globalNamespace);
  }

  /**
   * Convenience method for parsing root map configurations.
   * @static
   * @param {Object} options - Configuration options
   * @param {Object} options.rootMap - The root map to parse
   * @param {string} [options.key] - Optional specific key to parse
   * @param {Object} [options.namespace=globalThis] - The namespace to resolve paths in
   * @param {string} [options.module] - The module ID to use for module resolution
   * @returns {Object|*} Parsed map with resolved references, or single parsed value if key specified
   *
   * @example
   * const resolvedConfig = Helpers.parseRootMap({
   *   rootMap: { game: "game", user: "game.user", module: "module" },
   *   namespace: globalThis,
   *   module: 'my-module-id'
   * });
   */
  static parseRootMap(options) {
    return RootMapParser.parse(options);
  }

  /**
   * Convenience method for error formatting.
   * @static
   * @param {Error|string} error - The error to format
   * @param {Object} [options={}] - Formatting options
   * @returns {string} Formatted error message
   *
   * @example
   * try {
   *   // Some operation
   * } catch (error) {
   *   const formattedError = Helpers.formatError(error, { includeStack: true });
   *   console.error(formattedError);
   * }
   */
  static formatError(error, options = {}) {
    return formatError(error, options);
  }

  // ========================================
  // Workflow Methods
  // ========================================

  /**
   * Complete workflow for resolving module-aware configurations.
   * Combines module retrieval with root map parsing for common use cases.
   * @static
   * @param {Object} config - Configuration object
   * @param {Object} config.rootMap - The root map configuration
   * @param {string} config.moduleId - The module ID for context
   * @param {Object} [config.namespace=globalThis] - The namespace to resolve paths in
   * @returns {Object} Object containing { module, resolvedConfig, success, error }
   *
   * @example
   * const result = Helpers.resolveModuleConfiguration({
   *   rootMap: {
   *     game: "game",
   *     user: "game.user",
   *     module: "module",
   *     settings: "game.settings"
   *   },
   *   moduleId: 'my-foundry-module',
   *   namespace: globalThis
   * });
   *
   * if (result.success) {
   *   console.log(result.module); // Module object
   *   console.log(result.resolvedConfig); // Parsed configuration
   * }
   */
  static resolveModuleConfiguration({ rootMap, moduleId, namespace = globalThis }) {
    try {
      // First, verify the module exists
      const module = getModule(moduleId, namespace);
      if (!module) {
        return {
          module: null,
          resolvedConfig: null,
          success: false,
          error: `Module "${moduleId}" not found in namespace`
        };
      }

      // Parse the root map configuration
      const resolvedConfig = RootMapParser.parse({
        rootMap,
        namespace,
        module: moduleId
      });

      return {
        module,
        resolvedConfig,
        success: true,
        error: null
      };
    } catch (error) {
      return {
        module: null,
        resolvedConfig: null,
        success: false,
        error: formatError(error)
      };
    }
  }

  /**
   * Validates and resolves a complete Foundry VTT environment setup.
   * Checks for required global objects and resolves common paths.
   * @static
   * @param {Object} [namespace=globalThis] - The namespace to validate
   * @param {Array<string>} [requiredPaths=['game', 'ui']] - Required paths that must exist
   * @returns {Object} Validation result with resolved paths
   *
   * @example
   * const validation = Helpers.validateFoundryEnvironment(globalThis, [
   *   'game', 'game.user', 'game.modules', 'ui', 'canvas'
   * ]);
   *
   * if (validation.isValid) {
   *   console.log(validation.resolvedPaths); // All resolved objects
   * } else {
   *   console.log(validation.missingPaths); // Paths that couldn't be resolved
   * }
   */
  static validateFoundryEnvironment(namespace = globalThis, requiredPaths = ['game', 'ui']) {
    const resolvedPaths = {};
    const missingPaths = [];
    let isValid = true;

    for (const path of requiredPaths) {
      try {
        const resolved = PathUtils.resolvePath(namespace, path);
        if (resolved !== undefined) {
          resolvedPaths[path] = resolved;
        } else {
          missingPaths.push(path);
          isValid = false;
        }
      } catch (error) {
        missingPaths.push(path);
        isValid = false;
      }
    }

    return {
      isValid,
      resolvedPaths,
      missingPaths,
      namespace,
      summary: {
        total: requiredPaths.length,
        resolved: Object.keys(resolvedPaths).length,
        missing: missingPaths.length
      }
    };
  }

  /**
   * Batch resolve multiple paths with error handling.
   * Useful for resolving multiple configuration paths at once.
   * @static
   * @param {Object} namespace - The namespace to resolve paths in
   * @param {Array<string>|Object} paths - Array of paths or object with path aliases
   * @param {Object} [options={}] - Resolution options
   * @returns {Object} Resolution results with success/failure tracking
   *
   * @example
   * // With array of paths
   * const result = Helpers.batchResolvePaths(globalThis, [
   *   'game.user', 'game.settings', 'ui.notifications'
   * ]);
   *
   * // With path aliases
   * const result = Helpers.batchResolvePaths(globalThis, {
   *   currentUser: 'game.user',
   *   gameSettings: 'game.settings',
   *   notifications: 'ui.notifications'
   * });
   */
  static batchResolvePaths(namespace, paths, options = {}) {
    const { useGetterFallback = true, continueOnError = true } = options;
    const resolved = {};
    const failed = {};
    const errors = [];

    const pathEntries = Array.isArray(paths)
      ? paths.map(path => [path, path])
      : Object.entries(paths);

    for (const [key, path] of pathEntries) {
      try {
        const result = PathUtils.resolvePath(namespace, path, useGetterFallback);
        if (result !== undefined) {
          resolved[key] = result;
        } else {
          failed[key] = path;
          errors.push(`Path "${path}" could not be resolved`);
        }
      } catch (error) {
        failed[key] = path;
        errors.push(`Error resolving path "${path}": ${formatError(error)}`);

        if (!continueOnError) {
          break;
        }
      }
    }

    return {
      resolved,
      failed,
      errors,
      success: errors.length === 0,
      summary: {
        total: pathEntries.length,
        resolved: Object.keys(resolved).length,
        failed: Object.keys(failed).length
      }
    };
  }
}

export default Helpers;
export { Helpers };
