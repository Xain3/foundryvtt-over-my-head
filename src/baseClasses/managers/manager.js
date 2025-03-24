// ./src/baseClasses/component.js

import Base from '../base.js';

/**
 * Base class for all component classes such as handlers and listeners.
 * 
 * @class Manager
 * @extends Base
 * 
 * @param {Object} config - The configuration object containing constants.
 * @param {Object} context - The context object.
 * @param {Object} utils - The utility object.
 * 
 * @property {Object} utils - The utility object.
 * @property {Object} logger - The logger object.
 * 
 * Inherits properties from Base:
 * @property {Object} config - The configuration object.
 * @property {Object} const - The constant object.
 * @property {Object} moduleConstants - The module constants object.
 * @property {Object} game - The global game object.
 * @property {Object} context - The execution context.
 * @property {Object} globalContext - The global object.
 */
class Manager extends Base {
    constructor(config, context, utils) {
        super({
            config,
            context,
            shouldLoadConfig: true,
            shouldLoadContext: true,
            shouldLoadGame: true,
        });
        this.utils = utils;
        this.logger = utils.logger;
    }
}

export default Manager;