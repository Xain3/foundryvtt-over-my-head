/**
 * @file flagEvaluator.js
 * @description A utility for evaluating flag conditions against a context object to determine setting visibility.
 * @path src/handlers/settingsHelpers/flagEvaluator.js
 */

/**
 * FlagEvaluator class for evaluating conditional flags to control setting visibility
 * @export
 *
 * Public API:
 * - static evaluate(flag, context) - Evaluates a flag condition against the provided context
 * - static shouldShow(showOnlyIfFlag, dontShowIfFlag, context) - Determines if a setting should be shown
 */
class FlagEvaluator {
  /**
   * Evaluates a single property path against the context
   * @private
   * @param {string} path - Dot-notation path to evaluate (e.g., 'manifest.debugMode')
   * @param {Object} context - Context object to evaluate against
   * @returns {boolean} True if the path exists and is truthy, false otherwise
   */
  static #evaluatePath(path, context) {
    if (!path || !context) return false;
    
    const parts = path.split('.');
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
   * @param {Object} context - Context object to evaluate against
   * @returns {boolean} True if any path evaluates to true
   */
  static #evaluateOr(paths, context) {
    if (!Array.isArray(paths)) return false;
    return paths.some(path => this.#evaluatePath(path, context));
  }

  /**
   * Evaluates a logical AND condition
   * @private
   * @param {Array<string>} paths - Array of paths to evaluate
   * @param {Object} context - Context object to evaluate against
   * @returns {boolean} True if all paths evaluate to true
   */
  static #evaluateAnd(paths, context) {
    if (!Array.isArray(paths)) return false;
    return paths.every(path => this.#evaluatePath(path, context));
  }

  /**
   * Evaluates a flag condition against the provided context
   * @param {null|string|Object} flag - The flag condition to evaluate
   * @param {Object} context - Context object containing manifest, config, etc.
   * @returns {boolean} The result of the flag evaluation
   */
  static evaluate(flag, context) {
    // null flags are considered as "no condition" and return true
    if (flag === null || flag === undefined) {
      return true;
    }

    // String flags are treated as simple property paths
    if (typeof flag === 'string') {
      return this.#evaluatePath(flag, context);
    }

    // Object flags support logical operators
    if (typeof flag === 'object' && flag !== null) {
      if ('or' in flag) {
        return this.#evaluateOr(flag.or, context);
      }
      if ('and' in flag) {
        return this.#evaluateAnd(flag.and, context);
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
   * @param {Object} context - Context object containing manifest, config, etc.
   * @returns {boolean} True if the setting should be shown, false otherwise
   */
  static shouldShow(showOnlyIfFlag, dontShowIfFlag, context) {
    // If showOnlyIfFlag is defined and evaluates to false, don't show
    if (showOnlyIfFlag !== null && showOnlyIfFlag !== undefined) {
      if (!this.evaluate(showOnlyIfFlag, context)) {
        return false;
      }
    }

    // If dontShowIfFlag is defined and evaluates to true, don't show
    if (dontShowIfFlag !== null && dontShowIfFlag !== undefined) {
      if (this.evaluate(dontShowIfFlag, context)) {
        return false;
      }
    }

    // Show the setting if it passes all conditions
    return true;
  }
}

export default FlagEvaluator;