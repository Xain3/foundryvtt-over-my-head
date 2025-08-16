/**
 * @file flagEvaluator.js
 * @description A utility for evaluating flag conditions against a context object to determine setting visibility.
 * @path src/handlers/settingsHelpers/flagEvaluator.js
 */

/**
 * FlagEvaluator class for evaluating conditional flags to control setting visibility
 * Supports multiple context resolution based on path prefixes:
 * - 'manifest.*' -> config.manifest (module manifest data)
 * - 'constants.*' -> config.manifest (same as manifest, for backward compatibility)
 * - 'game.*' -> globalThis.game (Foundry game object)
 * - 'user.*' -> globalThis.game.user (current user object)
 * - 'world.*' -> globalThis.game.world (Foundry world object)
 * - 'config.*' -> config (module config object)
 * - other paths -> config (backward compatibility)
 * @export
 *
 * Public API:
 * - static evaluate(flag, config) - Evaluates a flag condition against the provided config
 * - static shouldShow(showOnlyIfFlag, dontShowIfFlag, config) - Determines if a setting should be shown
 */
class FlagEvaluator {
  /**
   * Resolves the appropriate context and adjusted path based on the path prefix
   * @private
   * @param {string} path - Dot-notation path to evaluate (e.g., 'manifest.debugMode', 'user.isAdmin')
   * @param {Object} config - Base config object containing manifest and other module data
   * @returns {Object} Object with resolved context and adjusted path
   */
  static #resolveContextAndPath(path, config) {
    if (!path || !config) return { context: null, adjustedPath: path };
    
    const parts = path.split('.');
    const firstPart = parts[0];
    
    // Map path prefixes to their corresponding contexts
    switch (firstPart) {
      case 'game':
        return {
          context: globalThis.game || null,
          adjustedPath: parts.slice(1).join('.') || firstPart  // Remove 'game.' prefix
        };
      case 'user':
        return {
          context: globalThis.game?.user || null,
          adjustedPath: parts.slice(1).join('.') || firstPart  // Remove 'user.' prefix
        };
      case 'world':
        return {
          context: globalThis.game?.world || null,
          adjustedPath: parts.slice(1).join('.') || firstPart  // Remove 'world.' prefix
        };
      case 'manifest':
        return {
          context: config || null,
          adjustedPath: path  // Keep full path for backward compatibility
        };
      case 'constants':
        return {
          context: config || null,
          adjustedPath: `manifest.${parts.slice(1).join('.')}`  // Map constants.* to manifest.*
        };
      case 'config':
        return {
          context: config || null,
          adjustedPath: path  // Keep full path for backward compatibility
        };
      default:
        // For backward compatibility, try the provided config first
        return {
          context: config || null,
          adjustedPath: path
        };
    }
  }

  /**
   * Evaluates a single property path against the appropriate context
   * @private
   * @param {string} path - Dot-notation path to evaluate (e.g., 'manifest.debugMode', 'user.isAdmin')
   * @param {Object} config - Base config object containing manifest and other module data
   * @returns {boolean} True if the path exists and is truthy, false otherwise
   */
  static #evaluatePath(path, config) {
    if (!path || !config) return false;
    
    const { context, adjustedPath } = this.#resolveContextAndPath(path, config);
    if (!context) return false;
    
    const parts = adjustedPath.split('.');
    let current = context;
    
    for (const part of parts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        return false;
      }
      current = current[part];
    }
    
    return Boolean(current);
  }

  /**
   * Evaluates a logical OR condition
   * @private
   * @param {Array<string>} paths - Array of paths to evaluate
   * @param {Object} config - Base config object containing manifest and other module data
   * @returns {boolean} True if any path evaluates to true
   */
  static #evaluateOr(paths, config) {
    if (!Array.isArray(paths)) return false;
    return paths.some(path => this.#evaluatePath(path, config));
  }

  /**
   * Evaluates a logical AND condition
   * @private
   * @param {Array<string>} paths - Array of paths to evaluate
   * @param {Object} config - Base config object containing manifest and other module data
   * @returns {boolean} True if all paths evaluate to true
   */
  static #evaluateAnd(paths, config) {
    if (!Array.isArray(paths)) return false;
    return paths.every(path => this.#evaluatePath(path, config));
  }

  /**
   * Evaluates a flag condition against the provided config
   * @param {null|string|Object} flag - The flag condition to evaluate
   * @param {Object} config - Base config object containing manifest and other module data
   * @returns {boolean} The result of the flag evaluation
   */
  static evaluate(flag, config) {
    // null flags are considered as "no condition" and return true
    if (flag === null || flag === undefined) {
      return true;
    }

    // String flags are treated as simple property paths
    if (typeof flag === 'string') {
      return this.#evaluatePath(flag, config);
    }

    // Object flags support logical operators
    if (typeof flag === 'object' && flag !== null) {
      const hasOr = 'or' in flag;
      const hasAnd = 'and' in flag;
      
      // If both OR and AND are present, both conditions must be true
      if (hasOr && hasAnd) {
        return this.#evaluateOr(flag.or, config) && this.#evaluateAnd(flag.and, config);
      }
      
      // If only OR is present
      if (hasOr) {
        return this.#evaluateOr(flag.or, config);
      }
      
      // If only AND is present
      if (hasAnd) {
        return this.#evaluateAnd(flag.and, config);
      }
      
      // Object with unknown structure, treat as falsy
      return false;
    }

    // All other types are falsy
    return false;
  }

  /**
   * Determines if a setting should be shown based on showOnlyIfFlag and dontShowIfFlag
   * @param {null|string|Object} showOnlyIfFlag - Condition that must be true to show the setting
   * @param {null|string|Object} dontShowIfFlag - Condition that must be false to show the setting
   * @param {Object} config - Base config object containing manifest and other module data
   * @returns {boolean} True if the setting should be shown, false otherwise
   */
  static shouldShow(showOnlyIfFlag, dontShowIfFlag, config) {
    // If showOnlyIfFlag is defined and evaluates to false, don't show
    if (showOnlyIfFlag !== null && showOnlyIfFlag !== undefined) {
      if (!this.evaluate(showOnlyIfFlag, config)) {
        return false;
      }
    }

    // If dontShowIfFlag is defined and evaluates to true, don't show
    if (dontShowIfFlag !== null && dontShowIfFlag !== undefined) {
      if (this.evaluate(dontShowIfFlag, config)) {
        return false;
      }
    }

    // Show the setting if it passes all conditions
    return true;
  }
}

export default FlagEvaluator;