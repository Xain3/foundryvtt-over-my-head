/**
 * @file handlers.js
 * @description Aggregates and initializes all handler classes for the module.
 * @path src/handlers/handlers.js
 */

import Handler from "../baseClasses/handler.js";
import SettingsHandler from "./settingsHandler.js";

/**
 * Handlers
 *
 * Aggregates and initializes all handler classes for the module. Provides a single entry point
 * for accessing handler instances (e.g., settings handler) and convenience methods for common
 * operations like debug mode setting management.
 *
 * @class Handlers
 * @extends Handler
 * @export
 *
 * **Public API:**
 * - `constructor(config, utils, context)` - Creates handlers instance with settings handler
 * - `registerDebugModeSetting()` - Register only the debugMode setting if present
 * - `hasDebugModeSettingConfig()` - Check if debugMode setting exists in parsed settings
 * - `getDebugModeSettingConfig()` - Get the debugMode setting configuration if available
 * - `registerSettingByKey(key)` - Register a single setting by its key
 * - `hasSettingConfigByKey(key)` - Check if a setting with the given key exists
 * - `getSettingConfigByKey(key)` - Get a setting configuration by its key
 * - `settings` - SettingsHandler instance for complete settings management
 */
class Handlers extends Handler {
    /**
     * Create a Handlers instance.
     *
     * @param {Object} config - Module configuration object.
     * @param {Object} utils - Utilities facade providing logging and error formatting.
     * @param {Object} context - Execution context object.
     * @throws {Error} If any required parameter is missing or invalid.
     */
    constructor(config, utils, context) {
        Handlers.#validateHandlerParameters(config, utils, context);
        super(config, utils, context);
        /**
         * The settings handler instance.
         * @type {SettingsHandler}
         * @public
         */
        this.settings = new SettingsHandler(this.config, this.utils, this.context);
    }

    /**
     * Convenience method to register the debugMode setting specifically.
     * Delegates to the settings handler's registerDebugModeSetting method.
     *
     * @returns {Object} Registration result from SettingsHandler.registerDebugModeSetting()
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * const result = handlers.registerDebugModeSetting();
     * if (result.success) {
     *   console.log('Debug mode setting registered successfully');
     * }
     * ```
     */
    registerDebugModeSetting() {
        return this.settings.registerDebugModeSetting();
    }

    /**
     * Convenience method to check if debugMode setting exists.
     * Delegates to the settings handler's hasDebugModeSettingConfig method.
     *
     * @returns {boolean} True if debugMode setting exists, false otherwise
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * if (handlers.hasDebugModeSettingConfig()) {
     *   handlers.registerDebugModeSetting();
     * }
     * ```
     */
    hasDebugModeSettingConfig() {
        return this.settings.hasDebugModeSettingConfig();
    }

    /**
     * Convenience method to get the debugMode setting configuration.
     * Delegates to the settings handler's getDebugModeSettingConfig method.
     *
     * @returns {Object|null} The debugMode setting object if found, null otherwise
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * const debugSetting = handlers.getDebugModeSettingConfig();
     * if (debugSetting) {
     *   console.log('Debug mode setting found with default:', debugSetting.config.default);
     * }
     * ```
     */
    getDebugModeSettingConfig() {
        return this.settings.getDebugModeSettingConfig();
    }

    /**
     * Convenience method to register a setting by its key.
     * Delegates to the settings handler's registerSettingByKey method.
     *
     * @param {string} key - The key of the setting to register
     * @returns {Object} Registration result from SettingsHandler.registerSettingByKey()
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * const result = handlers.registerSettingByKey('myCustomSetting');
     * if (result.success) {
     *   console.log('Setting registered successfully');
     * }
     * ```
     */
    registerSettingByKey(key) {
        return this.settings.registerSettingByKey(key);
    }

    /**
     * Convenience method to check if a setting with the specified key exists.
     * Delegates to the settings handler's hasSettingConfigByKey method.
     *
     * @param {string} key - The key of the setting to check for
     * @returns {boolean} True if setting with the key exists, false otherwise
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * if (handlers.hasSettingConfigByKey('myCustomSetting')) {
     *   handlers.registerSettingByKey('myCustomSetting');
     * }
     * ```
     */
    hasSettingConfigByKey(key) {
        return this.settings.hasSettingConfigByKey(key);
    }

    /**
     * Convenience method to get a setting configuration by its key.
     * Delegates to the settings handler's getSettingConfigByKey method.
     *
     * @param {string} key - The key of the setting to retrieve
     * @returns {Object|null} The setting object if found, null otherwise
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * const customSetting = handlers.getSettingConfigByKey('myCustomSetting');
     * if (customSetting) {
     *   console.log('Setting found with default:', customSetting.config.default);
     * }
     * ```
     */
    getSettingConfigByKey(key) {
        return this.settings.getSettingConfigByKey(key);
    }

    /**
     * Validate constructor parameters for Handlers.
     *
     * @private
     * @static
     * @param {Object} config - Module configuration object.
     * @param {Object} context - Execution context object.
     * @param {Object} utils - Utilities facade.
     * @throws {Error} If any parameter is missing or not an object.
     */
    static #validateHandlerParameters(config, utils, context) {
        if (!config || typeof config !== 'object') throw new Error("Config must be a non-null object for Handlers");
        if (!context || typeof context !== 'object') throw new Error("Context must be a non-null object for Handlers");
        if (!utils || typeof utils !== 'object') throw new Error("Utils must be a non-null object for Handlers");
    }
}

export default Handlers;