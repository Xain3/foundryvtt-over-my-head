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
 * for accessing handler instances (e.g., settings handler).
 *
 * @class Handlers
 * @extends Handler
 * @export
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