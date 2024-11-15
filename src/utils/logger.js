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
     * @param {string} config.MODULE - The name of the module.
     * @param {Object} gameManager - An instance of the GameManager class.
     */
    constructor(config) {
        this.module = config.CONST.MODULE;
    }

    /**
     * Retrieves the debug mode value from the remote context.
     * If an error occurs, it returns the default debug mode value.
     *
     * @returns {boolean} The debug mode value.
     */
    getDebugModeValue(context) {
        try {
            return flags.debugMode
        } catch (error) {
            return this.module.DEFAULTS.DEBUG_MODE;
        }
    }

    log(message) {
        console.log(`${this.module.SHORT_NAME} | ${message}`);
    }

    error(message) {
        console.error(`${this.module.SHORT_NAME} | ${message}`);
    }

    warn(message) {
        console.warn(`${this.module.SHORT_NAME} | ${message}`);
    }


    debug(message) {
        if (this.getDebugModeValue()) {
            console.debug(`${this.module.SHORT_NAME} | ${message}`);
        }
    }

    updateConfig(config) {
        this.module = config.CONST.MODULE;
    }
}

export default Logger;
