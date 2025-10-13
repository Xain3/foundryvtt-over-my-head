/**
 * @file envFlagResolver.mjs
 * @description Resolves flag values from environment variables with flexible naming patterns
 * @path src/config/helpers/envFlagResolver.mjs
 */

/**
 * EnvFlagResolver provides functionality to resolve flag values from environment variables
 * with support for multiple naming conventions and flexible override patterns.
 * 
 * This utility allows flags to be controlled via environment variables for flexible
 * configuration in CI/CD pipelines and development environments.
 * 
 * @class EnvFlagResolver
 * @export
 * 
 * Public API:
 * - static resolveFlag(flagName, moduleId, defaultValue) - Resolve a flag value from environment
 * - static resolveFlags(flagNames, moduleId, defaults) - Resolve multiple flags at once
 * - static hasEnvOverride(flagName, moduleId) - Check if an env override exists
 * 
 * @example
 * // Single flag resolution
 * const debugMode = EnvFlagResolver.resolveFlag('debugMode', 'my-module', false);
 * 
 * @example
 * // Multiple flags resolution
 * const flags = EnvFlagResolver.resolveFlags(
 *   ['debugMode', 'dev'], 
 *   'my-module',
 *   { debugMode: false, dev: true }
 * );
 * 
 * @since 1.0.0
 */
class EnvFlagResolver {
  /**
   * Resolves a flag value from environment variables with multiple naming pattern support.
   * 
   * Checks environment variables in the following order (first match wins):
   * 1. {MODULE_ID}_{FLAG_NAME} (e.g., FOUNDRYVTT_OVER_MY_HEAD_DEBUG_MODE)
   * 2. OMH_{FLAG_NAME} (e.g., OMH_DEBUG_MODE)
   * 3. {FLAG_NAME} (e.g., DEBUG_MODE)
   * 
   * @param {string} flagName - The flag name to resolve (camelCase or kebab-case)
   * @param {string} moduleId - The module identifier for namespaced resolution
   * @param {*} defaultValue - Default value if no environment override exists
   * @returns {*} The resolved flag value from environment or default
   * 
   * @example
   * // With env: FOUNDRYVTT_OVER_MY_HEAD_DEBUG_MODE=true
   * const debug = EnvFlagResolver.resolveFlag('debugMode', 'foundryvtt-over-my-head', false);
   * // Returns: true
   * 
   * @example
   * // With env: OMH_DEV=false
   * const dev = EnvFlagResolver.resolveFlag('dev', 'foundryvtt-over-my-head', true);
   * // Returns: false
   */
  static resolveFlag(flagName, moduleId, defaultValue) {
    // Only resolve if we're in a Node.js environment (not browser)
    if (typeof process === 'undefined' || !process.env) {
      return defaultValue;
    }

    // Convert flag name to UPPER_SNAKE_CASE for environment variable lookup
    const envFlagName = EnvFlagResolver.#toUpperSnakeCase(flagName);
    
    // Convert module ID to UPPER_SNAKE_CASE
    const envModuleId = EnvFlagResolver.#toUpperSnakeCase(moduleId);
    
    // Extract shortName from module ID (e.g., "foundryvtt-over-my-head" -> "OMH")
    const shortName = EnvFlagResolver.#extractShortName(moduleId);
    
    // Check environment variables in priority order
    const envVarNames = [
      `${envModuleId}_${envFlagName}`,  // FOUNDRYVTT_OVER_MY_HEAD_DEBUG_MODE
      ...(shortName ? [`${shortName}_${envFlagName}`] : []), // OMH_DEBUG_MODE
      envFlagName  // DEBUG_MODE
    ];

    for (const envVarName of envVarNames) {
      if (process.env[envVarName] !== undefined) {
        return EnvFlagResolver.#parseEnvValue(process.env[envVarName]);
      }
    }

    return defaultValue;
  }

  /**
   * Resolves multiple flags at once from environment variables.
   * 
   * @param {string[]} flagNames - Array of flag names to resolve
   * @param {string} moduleId - The module identifier for namespaced resolution
   * @param {Object} defaults - Object mapping flag names to default values
   * @returns {Object} Object mapping flag names to resolved values
   * 
   * @example
   * const flags = EnvFlagResolver.resolveFlags(
   *   ['debugMode', 'dev'],
   *   'foundryvtt-over-my-head',
   *   { debugMode: false, dev: true }
   * );
   * // Returns: { debugMode: true, dev: false } (if envs are set)
   */
  static resolveFlags(flagNames, moduleId, defaults = {}) {
    const resolved = {};
    
    for (const flagName of flagNames) {
      resolved[flagName] = EnvFlagResolver.resolveFlag(
        flagName,
        moduleId,
        defaults[flagName]
      );
    }
    
    return resolved;
  }

  /**
   * Checks if an environment variable override exists for a flag.
   * 
   * @param {string} flagName - The flag name to check
   * @param {string} moduleId - The module identifier for namespaced checking
   * @returns {boolean} True if an environment override exists
   * 
   * @example
   * // With env: OMH_DEBUG_MODE=true
   * const hasOverride = EnvFlagResolver.hasEnvOverride('debugMode', 'foundryvtt-over-my-head');
   * // Returns: true
   */
  static hasEnvOverride(flagName, moduleId) {
    if (typeof process === 'undefined' || !process.env) {
      return false;
    }

    const envFlagName = EnvFlagResolver.#toUpperSnakeCase(flagName);
    const envModuleId = EnvFlagResolver.#toUpperSnakeCase(moduleId);
    const shortName = EnvFlagResolver.#extractShortName(moduleId);
    
    const envVarNames = [
      `${envModuleId}_${envFlagName}`,
      ...(shortName ? [`${shortName}_${envFlagName}`] : []),
      envFlagName
    ];

    return envVarNames.some(name => process.env[name] !== undefined);
  }

  /**
   * Converts a camelCase or kebab-case string to UPPER_SNAKE_CASE.
   * 
   * @private
   * @param {string} str - String to convert
   * @returns {string} UPPER_SNAKE_CASE version of the string
   * 
   * @example
   * EnvFlagResolver.#toUpperSnakeCase('debugMode') // 'DEBUG_MODE'
   * EnvFlagResolver.#toUpperSnakeCase('foundryvtt-over-my-head') // 'FOUNDRYVTT_OVER_MY_HEAD'
   */
  static #toUpperSnakeCase(str) {
    return str
      .replace(/-/g, '_')  // Replace hyphens with underscores
      .replace(/([a-z])([A-Z])/g, '$1_$2')  // Insert underscore between camelCase
      .toUpperCase();
  }

  /**
   * Extracts a short name from a module ID by taking initials.
   * 
   * @private
   * @param {string} moduleId - Module identifier (e.g., 'foundryvtt-over-my-head')
   * @returns {string|null} Short name (e.g., 'OMH') or null if extraction fails
   * 
   * @example
   * EnvFlagResolver.#extractShortName('foundryvtt-over-my-head') // 'OMH'
   * EnvFlagResolver.#extractShortName('my-test-module') // 'MTM'
   */
  static #extractShortName(moduleId) {
    if (!moduleId || typeof moduleId !== 'string') {
      return null;
    }

    // Split by hyphens and extract first letter of each part
    const parts = moduleId.split(/[-_]/);
    const initials = parts
      .map(part => part.replace(/[^A-Za-z0-9]/g, ''))
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .toUpperCase();

    return initials.length > 0 ? initials : null;
  }

  /**
   * Parses an environment variable value to the appropriate JavaScript type.
   * Handles boolean strings, numeric strings, and JSON strings.
   * 
   * @private
   * @param {string} value - The environment variable value to parse
   * @returns {*} The parsed value (boolean, number, object, or string)
   * 
   * @example
   * EnvFlagResolver.#parseEnvValue('true') // true
   * EnvFlagResolver.#parseEnvValue('false') // false
   * EnvFlagResolver.#parseEnvValue('123') // 123
   * EnvFlagResolver.#parseEnvValue('{"key":"value"}') // {key: "value"}
   */
  static #parseEnvValue(value) {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim().toLowerCase();
    
    // Parse boolean strings
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    
    // Parse numeric strings
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }
    if (/^\d+\.\d+$/.test(trimmed)) {
      return parseFloat(trimmed);
    }
    
    // Try parsing JSON strings
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        return JSON.parse(value);
      } catch {
        // Not valid JSON, return as string
      }
    }
    
    return value;
  }
}

export default EnvFlagResolver;
