/**
 * @file handler.js
 * @description Base Handler class for all handlers in the module
 * @path src/baseClasses/managers/handler.js
 */

/**
 * Base Handler class that provides common functionality for all handlers
 */
class Handler {
    /**
     * @param {Object} config - Configuration object
     * @param {Object} context - Context object
     * @param {Object} utils - Utilities object
     */
    constructor(config, context, utils) {
        this.config = config;
        this.context = context;
        this.utils = utils;
    }
}

export default Handler;
