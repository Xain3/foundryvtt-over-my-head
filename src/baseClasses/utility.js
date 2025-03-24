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
     * @param {Object} args - Additional arguments.
     * @param {Object} args.context - The execution context. Defaults to null.
     * @param {Object} args.globalContext - The global object. Default to globalThis.
     * @param {boolean} args.shouldLoadConfig - Whether to load the configuration object. Default is true.
     * @param {boolean} args.shouldLoadContext - Whether to load the context object. Default is false.
     * @param {boolean} args.shouldLoadGame - Whether to load the game object. Default is false.
     * @param {boolean} args.shouldLoadDebugMode - Whether to load the debug mode. Default is false.
     * 
     * Inherits properties from Base:
     * @property {Object} config - The configuration object.
     * @property {Object} const - The constant object.
     * @property {Object} moduleConstants - The module constants object.
     */
    constructor(config, args = {}) {
        super({
            config,
            shouldLoadConfig: true,
            ...args
        });
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