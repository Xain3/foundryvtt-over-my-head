/**
 * @file handler.mjs
 * @description Base Handler class for all handlers in the module
 * @path src/baseClasses/managers/handler.mjs
 */

/**
 * Base Handler class that provides common functionality for all handlers
 *
 * This class should be extended by all specific handler classes.
 */
class Handler {
    /**
     * @param {Object} config - Configuration object
     * @param {Object} utils - Utilities object
     * @param {Object} context - Context object. Defaults to an empty object.
     */
    constructor(config, utils, context = {}) {
        this.config = config;
        this.utils = utils;
        this.context = context;
    }

    /**
     * Updates the handler's configuration, context, and utilities.
     *
     * @param {Object} params - The parameters for updating the handler.
     * @param {Object} [params.config=this.config] - The new configuration object.
     * @param {Object} [params.context=this.context] - The new context object.
     * @param {Object} [params.utils=this.utils] - The new utilities object.
     */
    update({
        config = this.config,
        context = this.context,
        utils = this.utils
    }) {
        this.config = config;
        this.utils = utils;
        this.context = context;
    }
}

export default Handler;
