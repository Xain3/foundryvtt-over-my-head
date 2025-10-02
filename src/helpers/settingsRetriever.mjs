/**
 * @file settingsRetriever.mjs
 * @description A helper class for checking and retrieving settings from Foundry VTT's settings system.
 * @path src/helpers/settingsRetriever.mjs
 */

/**
 * SettingsRetriever provides a centralized interface for interacting with Foundry VTT's settings system.
 *
 * This helper class encapsulates logic for checking if settings exist and retrieving their values
 * from FoundryVTT's game.settings API. It ensures compatibility with the Foundry VTT BaseSetting
 * API and provides a clean, consistent interface for settings access throughout the module.
 *
 * **Key Features:**
 * - **Existence Checking**: Check if a setting exists in the settings system
 * - **Value Retrieval**: Get setting values with proper error handling
 * - **Namespace Management**: Automatic handling of module namespace
 * - **Error Resilience**: Safe handling of missing settings and API unavailability
 * - **Foundry VTT Integration**: Full compatibility with game.settings API
 *
 * **Integration with Foundry VTT:**
 * The helper ensures full compatibility with Foundry's settings API:
 * - Uses `game.settings.get(namespace, key)` for value retrieval
 * - Properly handles setting existence checks
 * - Gracefully handles cases where settings API is not available
 * - Returns appropriate defaults when settings don't exist
 *
 * @class SettingsRetriever
 * @export
 *
 * **Public API:**
 * - `constructor(namespace)` - Creates retriever for the specified namespace
 * - `hasSetting(key)` - Check if a setting exists in Foundry VTT
 * - `getSettingValue(key)` - Get the value of a setting from Foundry VTT
 * - `hasDebugModeSetting()` - Check if debugMode setting exists
 * - `getDebugModeSettingValue()` - Get debugMode setting value
 * - `namespace` - The namespace used for settings retrieval
 */
class SettingsRetriever {
  /**
   * Creates a new SettingsRetriever instance for the specified namespace.
   *
   * @param {string} namespace - The module namespace for settings retrieval
   * @throws {Error} If namespace is not provided or invalid
   *
   * @example
   * ```javascript
   * const retriever = new SettingsRetriever('my-module');
   * const hasDebug = retriever.hasSetting('debugMode');
   * ```
   */
  constructor(namespace) {
    if (!namespace || typeof namespace !== 'string') {
      throw new Error('SettingsRetriever requires a valid namespace string');
    }

    /**
     * The namespace used for settings retrieval.
     * @type {string}
     * @public
     */
    this.namespace = namespace;
  }

  /**
   * Checks if a setting exists in Foundry VTT's game.settings system.
   *
   * This method queries the actual Foundry VTT settings system to determine if a setting
   * with the given key has been registered for this retriever's namespace.
   *
   * @param {string} key - The key of the setting to check for
   * @returns {boolean} True if the setting exists in game.settings, false otherwise
   *
   * @example
   * ```javascript
   * const retriever = new SettingsRetriever('my-module');
   * if (retriever.hasSetting('debugMode')) {
   *   console.log('Debug mode setting is available');
   * }
   * ```
   */
  hasSetting(key) {
    if (!key || typeof key !== 'string') {
      return false;
    }

    if (!globalThis.game || !globalThis.game.settings) {
      return false;
    }

    try {
      // Try to get the setting - if it doesn't exist, this will return undefined
      const settingValue = globalThis.game.settings.get(this.namespace, key);
      return settingValue !== undefined;
    } catch (_error) {
      // Setting doesn't exist or there was an error accessing it
      return false;
    }
  }

  /**
   * Gets the value of a setting from Foundry VTT's game.settings system.
   *
   * This method retrieves the current value of a setting from Foundry VTT's settings system.
   * Returns undefined if the setting doesn't exist or if there's an error accessing it.
   *
   * @param {string} key - The key of the setting to retrieve
   * @returns {any|undefined} The setting value if it exists, undefined otherwise
   *
   * @example
   * ```javascript
   * const retriever = new SettingsRetriever('my-module');
   * const debugMode = retriever.getSettingValue('debugMode');
   * if (debugMode !== undefined) {
   *   console.log('Debug mode is:', debugMode);
   * }
   * ```
   */
  getSettingValue(key) {
    if (!key || typeof key !== 'string') {
      return undefined;
    }

    if (!globalThis.game || !globalThis.game.settings) {
      return undefined;
    }

    try {
      return globalThis.game.settings.get(this.namespace, key);
    } catch (_error) {
      // Setting doesn't exist or there was an error accessing it
      return undefined;
    }
  }

  /**
   * Checks if the debugMode setting exists in Foundry VTT's game.settings system.
   *
   * This is a convenience method that specifically checks for the debugMode setting.
   *
   * @returns {boolean} True if the debugMode setting exists in game.settings, false otherwise
   *
   * @example
   * ```javascript
   * const retriever = new SettingsRetriever('my-module');
   * if (retriever.hasDebugModeSetting()) {
   *   const value = retriever.getDebugModeSettingValue();
   *   console.log('Debug mode:', value);
   * }
   * ```
   */
  hasDebugModeSetting() {
    return this.hasSetting('debugMode');
  }

  /**
   * Gets the value of the debugMode setting from Foundry VTT's game.settings system.
   *
   * This is a convenience method that specifically retrieves the debugMode setting value.
   *
   * @returns {boolean|undefined} The debugMode setting value if it exists, undefined otherwise
   *
   * @example
   * ```javascript
   * const retriever = new SettingsRetriever('my-module');
   * const debugMode = retriever.getDebugModeSettingValue();
   * if (debugMode) {
   *   console.log('Debug mode is enabled');
   * }
   * ```
   */
  getDebugModeSettingValue() {
    return this.getSettingValue('debugMode');
  }
}

export default SettingsRetriever;