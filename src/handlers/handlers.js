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