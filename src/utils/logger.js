// ./src/utils/logger.js
/**
 * A utility class for logging within a specific module.
 * config and the GameManager class are passed in the constructor.
 * 
 * @class
 * @module Logger
 * @since 0.0.1
 * @export Logger
 * 
 * @property {Object} module - The module configuration object.
 * @property {Object} module.DEFAULTS - The module default values.
 * @property {string} module.SHORT_NAME - The module short name.
 * @property {Object} GameManager - An instance of the GameManager class.
 */
class Logger {
    /**
     * Creates an instance of the logger.
     * 
     * @constructor
     * @param {Object} config - The configuration object.
     * @param {Object} config.CONST - The constants object within the configuration.
     * @param {string} config.CONST.MODULE - The module name to be set for the logger.
     */
    constructor(config) {
        this.module = config.CONST.MODULE;
    }

    /**
     * Logs a message to the console with the module's short name as a prefix.
     *
     * @param {string} message - The message to log.
     */
    log(message) {
        console.log(`${this.module.SHORT_NAME} | ${message}`);
    }

    /**
     * Logs an error message to the console with the module's short name as a prefix.
     *
     * @param {string} message - The error message to log.
     */
    error(message) {
        console.error(`${this.module.SHORT_NAME} | ${message}`);
    }

    /**
     * Logs a warning message to the console with the module's short name as a prefix.
     *
     * @param {string} message - The warning message to log.
     */
    warn(message) {
        console.warn(`${this.module.SHORT_NAME} | ${message}`);
    }


    /**
     * Logs a debug message to the console if debug mode is enabled.
     *
     * @param {string} message - The message to be logged.
     */
    debug(message) {
        if (this.getDebugModeValue()) {
            console.debug(`${this.module.SHORT_NAME} | ${message}`);
        }
    }

    /**
     * Updates the logger configuration.
     *
     * @param {Object} config - The configuration object.
     * @param {Object} config.CONST - The constants object within the configuration.
     * @param {string} config.CONST.MODULE - The module name to be set for the logger.
     */
    updateConfig(config) {
        this.module = config.CONST.MODULE;
    }
}

export default Logger;
