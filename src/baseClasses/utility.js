// ./src/baseClasses/utility.js

class Utility {
    /**
     * Creates an instance of BaseModuleUtil.
     * @param {Object} config - The configuration object containing constants.
     */
    constructor(config) {
        this.config = config;
        this.moduleConstants = config.CONST.MODULE;
    }

    /**
     * Updates the configuration with the provided config object.
     * @param {Object} config - The new configuration object.
     */
    updateConfig(config) {
        this.config = config;
        this.moduleConstants = config.CONST.MODULE;
    }
}

export default Utility;