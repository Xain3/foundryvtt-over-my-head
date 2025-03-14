// ./src/baseClasses/component.js

import Base from './base.js';

/**
 * The BaseModuleComponent class is the base class for all 
 * component classes such as handlers and listeners.
 * 
 * It extends the Base class.
 * 
 * @class Component
 * @module Component
 * @extends Base
 * @constructor
 * @param {Object} config - The configuration object containing constants.
 * 
 * @property {Object} context - The execution context.
 * @property {Object} utils - The utility object.
 * @property {Object} logger - The logger object.
 */
class Component extends Base {
    constructor(config, context, utils) {
        super(config, context);
        this.context = context;
        this.utils = utils;
        this.logger = utils.logger;
    }
}

export default Component;