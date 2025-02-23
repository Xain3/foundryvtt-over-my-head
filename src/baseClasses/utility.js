// ./src/baseClasses/utility.js

import Base from './base.js';

/**
 * The BaseModuleUtil class is the base class for all utility classes.
 * It extends the Base class.
 * 
 * @class Utility
 * @module Utility
 * @extends Base
 * 
 * @constructor
 * @param {Object} config - The configuration object containing constants.
 */
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
        this.const = config.CONSTANTS;
        this.moduleConstants = config.CONSTANTS.MODULE;
    }
}

export default Utility;