// ./src/baseClasses/handler.js

import Manager from './manager.js';

/**
 * The Handler class is the base class for all handler classes.
 * Handlers are responsible for managing operations related to a specific entity type.
 * 
 * It extends the Manager class.
 * 
 * @class Handler
 * @module Handler
 * @extends Manager
 * 
 * @constructor
 * @param {Object} config - The configuration object containing constants.
 * @param {Object} context - The execution context.
 * @param {Object} utils - The utility object.
 * 
 * Inherits properties from Manager:
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
class Handler extends Manager {
    constructor(config, context, utils) {
        super(config, context, utils);
    }
}

export default Handler;