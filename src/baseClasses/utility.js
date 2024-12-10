// ./src/baseClasses/utility.js

import Base from './base.js';

class Utility extends Base {
    /**
     * Creates an instance of BaseModuleUtil.
     * @param {Object} config - The configuration object containing constants.
     */
    constructor(config) {
        super(config);
    }

    /**
     * Updates the configuration with the provided config object.
     * @param {Object} config - The new configuration object.
     */
    updateConfig(config) {
        this.config = config;
        this.const = config.CONST;
        this.moduleConstants = config.CONST.MODULE;
    }
}

export default Utility;