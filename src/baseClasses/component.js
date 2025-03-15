// ./src/baseClasses/component.js

import Base from './base.js';

/**
 * Base class for all component classes such as handlers and listeners.
 * 
 * @class Component
 * @extends Base
 * 
 * @param {Object} config - The configuration object containing constants.
 * @param {Object} context - The context object.
 * @param {Object} utils - The utility object.
 * 
 * @property {Object} utils - The utility object.
 * @property {Object} logger - The logger object.
 * @property {Object} config - The configuration object (inherited from Base).
 * @property {Object} const - The constant object (inherited from Base).
 * @property {Object} moduleConstants - The module constants object (inherited from Base).
 * @property {Object} game - The global game object (inherited from Base).
 * @property {Object} context - The execution context (inherited from Base).
 */
class Component extends Base {
    constructor(config, context, utils) {
        super({
            config,
            context,
            shouldLoadConfig: true,
            shouldLoadContext: true
        });
        this.utils = utils;
        this.logger = utils.logger;
    }
}

export default Component;