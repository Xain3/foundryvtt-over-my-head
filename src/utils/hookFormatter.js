/**
 * @file hookFormatter.js
 * @description This file contains a utility class for formatting hook names by combining manifest short name with hook constants.
 * @path src/utils/hookFormatter.js
 */

/**
 * @class HookFormatter
 * @description Utility class for formatting hook names by combining manifest short name with hook constants.
 * Validates inputs and provides formatted hook names for consistent hook naming across the application.
 *
 * @export
 */
class HookFormatter {
  /**
   * @constructor
   * @param {Object} constants - The constants object containing hooks configuration
   * @param {Object} constants.hooks - Object containing hook name mappings
   * @param {Object} manifest - The manifest object containing module metadata
   * @param {string} manifest.shortName - The short name used as prefix for hooks
   * @throws {Error} When arguments are invalid or missing required properties
   */
  constructor(constants, manifest, formatError) {
    this.constants = constants;
    this.manifest = manifest;
    this.formatError = formatError;
    this.#validateArgs(this.constants, this.manifest);
  }

  /**
   * @private
   * @method #validateArgs
   * @description Validates constructor arguments for required properties and types
   * @param {Object} constants - The constants object to validate
   * @param {Object} manifest - The manifest object to validate
   * @throws {Error} When arguments are invalid or missing required properties
   */
  #validateArgs(constants, manifest) {
    if (!constants || !manifest) {
      throw new Error(this.formatError('Invalid arguments provided', {includeCaller: true, caller: 'HookFormatter'}));
    }
    if (!manifest.shortName || typeof manifest.shortName !== 'string') {
      throw new Error(this.formatError('Invalid manifest provided. It must have a shortName property of type string', {includeCaller: true, caller: 'HookFormatter'}));
    }
    if (!constants.hooks || typeof constants.hooks !== 'object' || Array.isArray(constants.hooks)) {
      throw new Error(this.formatError('Constants must have a hooks property of type object', {includeCaller: true, caller: 'HookFormatter'}));
    }
  }

  /**
   * @private
   * @method #validateHookName
   * @description Validates that the hook name is valid and exists in constants
   * @param {string} hookName - The hook name to validate
   * @throws {Error} When hookName is invalid or not found in constants
   */
  #validateHookName(hookName) {
    if (typeof hookName !== 'string') {
      throw new Error(this.formatError('Invalid hookName provided', {includeCaller: true, caller: 'HookFormatter'}));
    }

    const trimmedHookName = hookName.trim();
    if (!trimmedHookName) {
      throw new Error(this.formatError('Hook name cannot be empty or whitespace only', {includeCaller: true, caller: 'HookFormatter'}));
    }

    // Validate hook name contains only alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedHookName)) {
      throw new Error(this.formatError('Hook name must contain only alphanumeric characters and underscores', {includeCaller: true, caller: 'HookFormatter'}));
    }

    if (!this.constants.hooks.hasOwnProperty(trimmedHookName)) {
      throw new Error(this.formatError(`Hook "${trimmedHookName}" is not defined in constants`, {includeCaller: true, caller: 'HookFormatter'}));
    }
  }

  /**
   * @method formatHookName
   * @description Formats a hook name by combining manifest short name with the hook constant value.
   * Hook names must contain only alphanumeric characters and underscores.
   * @param {string} hookName - The hook name key to format (must be alphanumeric with underscores only)
   * @returns {string} The formatted hook name in format: {shortName}{hookValue}
   * @throws {Error} When hookName is invalid, contains invalid characters, or not found in constants
   */
  formatHookName(hookName) {
    this.#validateHookName(hookName);
    const trimmedHookName = hookName.trim();
    return `${this.manifest.shortName}${this.constants.hooks[trimmedHookName]}`;
  }
}

export default HookFormatter;