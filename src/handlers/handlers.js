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
 * - `hasDebugModeSetting()` - Check if debugMode setting exists in parsed settings
 * - `getDebugModeSetting()` - Get the debugMode setting configuration if available
 * - `registerSettingByKey(key)` - Register a single setting by its key
 * - `hasSettingByKey(key)` - Check if a setting with the given key exists
 * - `getSettingByKey(key)` - Get a setting configuration by its key
 * - `registerSettingHook(eventName, callback)` - Register a hook for setting registration events
 * - `triggerSettingHook(eventName, data)` - Trigger a setting registration hook
 * - `removeSettingHook(eventName, callback)` - Remove a setting registration hook
 * - `getRegisteredHooks()` - Get all registered hooks for debugging purposes
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
     * Delegates to the settings handler's hasDebugModeSetting method.
     *
     * @returns {boolean} True if debugMode setting exists, false otherwise
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * if (handlers.hasDebugModeSetting()) {
     *   handlers.registerDebugModeSetting();
     * }
     * ```
     */
    hasDebugModeSetting() {
        return this.settings.hasDebugModeSetting();
    }

    /**
     * Convenience method to get the debugMode setting configuration.
     * Delegates to the settings handler's getDebugModeSetting method.
     *
     * @returns {Object|null} The debugMode setting object if found, null otherwise
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * const debugSetting = handlers.getDebugModeSetting();
     * if (debugSetting) {
     *   console.log('Debug mode setting found with default:', debugSetting.config.default);
     * }
     * ```
     */
    getDebugModeSetting() {
        return this.settings.getDebugModeSetting();
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
     * Delegates to the settings handler's hasSettingByKey method.
     *
     * @param {string} key - The key of the setting to check for
     * @returns {boolean} True if setting with the key exists, false otherwise
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * if (handlers.hasSettingByKey('myCustomSetting')) {
     *   handlers.registerSettingByKey('myCustomSetting');
     * }
     * ```
     */
    hasSettingByKey(key) {
        return this.settings.hasSettingByKey(key);
    }

    /**
     * Convenience method to get a setting configuration by its key.
     * Delegates to the settings handler's getSettingByKey method.
     *
     * @param {string} key - The key of the setting to retrieve
     * @returns {Object|null} The setting object if found, null otherwise
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * const customSetting = handlers.getSettingByKey('myCustomSetting');
     * if (customSetting) {
     *   console.log('Setting found with default:', customSetting.config.default);
     * }
     * ```
     */
    getSettingByKey(key) {
        return this.settings.getSettingByKey(key);
    }

    /**
     * Convenience method to register a hook for setting registration events.
     * Delegates to the settings handler's registerSettingHook method.
     *
     * @param {string} eventName - The name of the event to listen for
     * @param {Function} callback - The callback function to execute when the event occurs
     * @returns {boolean} True if the hook was registered successfully, false otherwise
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * handlers.registerSettingHook('settingRegistered', (data) => {
     *   console.log(`Setting ${data.key} was registered`);
     * });
     * ```
     */
    registerSettingHook(eventName, callback) {
        return this.settings.registerSettingHook(eventName, callback);
    }

    /**
     * Convenience method to trigger a setting registration hook.
     * Delegates to the settings handler's triggerSettingHook method.
     *
     * @param {string} eventName - The name of the event to trigger
     * @param {*} data - Optional data to pass to the hook callbacks
     * @returns {number} The number of callbacks that were executed
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * handlers.triggerSettingHook('customEvent', { message: 'Custom event' });
     * ```
     */
    triggerSettingHook(eventName, data = null) {
        return this.settings.triggerSettingHook(eventName, data);
    }

    /**
     * Convenience method to remove a setting registration hook.
     * Delegates to the settings handler's removeSettingHook method.
     *
     * @param {string} eventName - The name of the event to remove the callback from
     * @param {Function} callback - The specific callback function to remove
     * @returns {boolean} True if the callback was removed, false if not found
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * const myCallback = (data) => console.log('Setting:', data.key);
     * handlers.registerSettingHook('settingRegistered', myCallback);
     * // Later...
     * handlers.removeSettingHook('settingRegistered', myCallback);
     * ```
     */
    removeSettingHook(eventName, callback) {
        return this.settings.removeSettingHook(eventName, callback);
    }

    /**
     * Convenience method to get all registered hooks for debugging purposes.
     * Delegates to the settings handler's getRegisteredHooks method.
     *
     * @returns {Object} Object containing event names as keys and callback counts as values
     *
     * @example
     * ```javascript
     * const handlers = new Handlers(config, utils, context);
     * const hooks = handlers.getRegisteredHooks();
     * console.log('Registered hooks:', hooks);
     * ```
     */
    getRegisteredHooks() {
        return this.settings.getRegisteredHooks();
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