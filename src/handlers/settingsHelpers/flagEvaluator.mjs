/**
 * @file flagEvaluator.mjs
 * @description A utility for evaluating flag conditions against a context object to determine setting visibility.
 * @path src/handlers/settingsHelpers/flagEvaluator.mjs
 */

/**
 * FlagEvaluator class for evaluating conditional flags to control setting visibility
 * Uses configurable context resolution based on path prefixes defined in constants.yaml.
 * Supports multiple context types including Foundry game objects and module configuration.
 * @export
 *
 * Public API:
 * - static evaluate(flag, config, contextMapping) - Evaluates a flag condition against the provided config
 * - static shouldShow(showOnlyIfFlag, dontShowIfFlag, config, contextMapping) - Determines if a setting should be shown
 */
class FlagEvaluator {
  /**
   * Gets the default context mapping configuration
   * @private
   * @returns {Object} Default context mapping configuration for backward compatibility
   */
  static #getDefaultContextMapping() {
    return {
      game: {
        globalPath: "globalThis.game",
        pathAdjustment: "removePrefix"
      },
      user: {
        globalPath: "globalThis.game.user",
        pathAdjustment: "removePrefix"
      },
      world: {
        globalPath: "globalThis.game.world",
        pathAdjustment: "removePrefix"
      },
      manifest: {
        globalPath: "config.manifest",
        pathAdjustment: "removePrefix"
      },
      constants: {
        globalPath: "config.constants",
        pathAdjustment: "removePrefix"
      },
      config: {
        globalPath: "config",
        pathAdjustment: "keepFull"
      },
      defaults: {
        globalPath: "config",
        pathAdjustment: "keepFull"
      }
    };
  }

  /**
   * Resolves the appropriate context and adjusted path based on configurable path mapping
   * @private
   * @param {string} path - Dot-notation path to evaluate (e.g., 'manifest.debugMode', 'user.isAdmin')
   * @param {Object} config - Base config object containing manifest and other module data
   * @param {Object} contextMapping - Configuration object defining context mappings from constants.yaml
   * @returns {Object} Object with resolved context and adjusted path
   */
  static #resolveContextAndPath(path, config, contextMapping = {}) {
    if (!path || !config) return { context: null, adjustedPath: path };
    
    const parts = path.split('.');
    const firstPart = parts[0];
    
    // Get mapping configuration for this prefix, or use defaults
    const mapping = contextMapping[firstPart] || contextMapping.defaults || {};
    const globalPath = mapping.globalPath || 'config';
    const pathAdjustment = mapping.pathAdjustment || 'keepFull';
    
    // Resolve the context based on the globalPath configuration
    let context = null;
    switch (globalPath) {
      case 'globalThis.game':
        context = globalThis.game || null;
        break;
      case 'globalThis.game.user':
        context = globalThis.game?.user || null;
        break;
      case 'globalThis.game.world':
        context = globalThis.game?.world || null;
        break;
      case 'config.manifest':
        context = config?.manifest || null;
        break;
      case 'config.constants':
        context = config?.constants || null;
        break;
      case 'config':
      default:
        context = config || null;
        break;
    }
    
    // Adjust the path based on the pathAdjustment strategy
    let adjustedPath = path;
    switch (pathAdjustment) {
      case 'removePrefix':
        adjustedPath = parts.slice(1).join('.') || firstPart;
        break;
      case 'mapToManifest':
        adjustedPath = `manifest.${parts.slice(1).join('.')}`;
        break;
      case 'keepFull':
      default:
        adjustedPath = path;
        break;
    }
    
    return { context, adjustedPath };
  }

  /**
   * Evaluates a single property path against the appropriate context
   * @private
   * @param {string} path - Dot-notation path to evaluate (e.g., 'manifest.debugMode', 'user.isAdmin')
   * @param {Object} config - Base config object containing manifest and other module data
   * @param {Object} contextMapping - Configuration object defining context mappings from constants.yaml
   * @returns {boolean} True if the path exists and is truthy, false otherwise
   */
  static #evaluatePath(path, config, contextMapping) {
    if (!path || !config) return false;
    
    const { context, adjustedPath } = this.#resolveContextAndPath(path, config, contextMapping);
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
   * @param {Object} contextMapping - Configuration object defining context mappings from constants.yaml
   * @returns {boolean} True if any path evaluates to true
   */
  static #evaluateOr(paths, config, contextMapping) {
    if (!Array.isArray(paths)) return false;
    return paths.some(path => this.#evaluatePath(path, config, contextMapping));
  }

  /**
   * Evaluates a logical AND condition
   * @private
   * @param {Array<string>} paths - Array of paths to evaluate
   * @param {Object} config - Base config object containing manifest and other module data
   * @param {Object} contextMapping - Configuration object defining context mappings from constants.yaml
   * @returns {boolean} True if all paths evaluate to true
   */
  static #evaluateAnd(paths, config, contextMapping) {
    if (!Array.isArray(paths)) return false;
    return paths.every(path => this.#evaluatePath(path, config, contextMapping));
  }

  /**
   * Evaluates a flag condition against the provided config
   * @param {null|string|Object} flag - The flag condition to evaluate
   * @param {Object} config - Base config object containing manifest and other module data
   * @param {Object} [contextMapping] - Configuration object defining context mappings from constants.yaml
   * @returns {boolean} The result of the flag evaluation
   */
  static evaluate(flag, config, contextMapping) {
    // Use default context mapping if none provided (for backward compatibility)
    const mapping = contextMapping || this.#getDefaultContextMapping();
    
    // null flags are considered as "no condition" and return true
    if (flag === null || flag === undefined) {
      return true;
    }

    // String flags are treated as simple property paths
    if (typeof flag === 'string') {
      return this.#evaluatePath(flag, config, mapping);
    }

    // Object flags support logical operators
    if (typeof flag === 'object' && flag !== null) {
      const hasOr = 'or' in flag;
      const hasAnd = 'and' in flag;
      
      // If both OR and AND are present, both conditions must be true
      if (hasOr && hasAnd) {
        return this.#evaluateOr(flag.or, config, mapping) && this.#evaluateAnd(flag.and, config, mapping);
      }
      
      // If only OR is present
      if (hasOr) {
        return this.#evaluateOr(flag.or, config, mapping);
      }
      
      // If only AND is present
      if (hasAnd) {
        return this.#evaluateAnd(flag.and, config, mapping);
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
   * @param {Object} [contextMapping] - Configuration object defining context mappings from constants.yaml
   * @returns {boolean} True if the setting should be shown, false otherwise
   */
  static shouldShow(showOnlyIfFlag, dontShowIfFlag, config, contextMapping) {
    // Use default context mapping if none provided (for backward compatibility)
    const mapping = contextMapping || this.#getDefaultContextMapping();
    
    // If showOnlyIfFlag is defined and evaluates to false, don't show
    if (showOnlyIfFlag !== null && showOnlyIfFlag !== undefined) {
      if (!this.evaluate(showOnlyIfFlag, config, mapping)) {
        return false;
      }
    }

    // If dontShowIfFlag is defined and evaluates to true, don't show
    if (dontShowIfFlag !== null && dontShowIfFlag !== undefined) {
      if (this.evaluate(dontShowIfFlag, config, mapping)) {
        return false;
      }
    }

    // Show the setting if it passes all conditions
    return true;
  }
}

export default FlagEvaluator;