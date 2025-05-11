// ./src/utils/logger.js

import Utility from '@baseClasses/utility.js';

/**
 * A utility class for logging within a specific module.
 * config and the GameManager class are passed in the constructor.
 *
 * @class
 * @extends Utility
 * @module Logger
 * @export Logger
 * @since 0.0.1
 *
 * @property {Object} module - The module configuration object.
 * @property {Object} module.DEFAULTS - The module default values.
 * @property {string} module.SHORT_NAME - The module short name.
 * @property {Object} GameManager - An instance of the GameManager class.
 */
class Logger extends Utility {
    /**
     * Creates an instance of the logger.
     *
     * @constructor
     * @param {Object} config - The configuration object.
     */
    constructor(config) {
        super(config);
    }

    getDebugModeValue(context) {
        try {
            if (flags.debugMode === undefined || flags.debugMode === null) {
                throw new Error('Debug mode not defined in flags.');
            }
            return flags.debugMode // Assuming flags is a global object
        } catch (error) {
            return this.moduleConstants.DEFAULTS.DEBUG_MODE;
        }
    }

    /**
     * Logs a message to the console with the module's short name as a prefix.
     *
     * @param {string} message - The message to log.
     */
    log(message) {
        console.log(`${this.moduleConstants.SHORT_NAME} | ${message}`);
    }

    /**
     * Logs an error message to the console with the module's short name as a prefix.
     *
     * @param {string} message - The error message to log.
     */
    error(message) {
        console.error(`${this.moduleConstants.SHORT_NAME} | ${message}`);
    }

    /**
     * Logs a warning message to the console with the module's short name as a prefix.
     *
     * @param {string} message - The warning message to log.
     */
    warn(message) {
        console.warn(`${this.moduleConstants.SHORT_NAME} | ${message}`);
    }


    /**
     * Logs a debug message to the console if debug mode is enabled.
     *
     * @param {string} message - The message to be logged.
     */
    debug(message) {
        if (this.getDebugModeValue()) {
            console.debug(`${this.moduleConstants.SHORT_NAME} | ${message}`);
        }
    }
}

export default Logger;
