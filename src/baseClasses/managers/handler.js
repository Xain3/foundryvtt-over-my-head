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
 */
class Handler extends Manager {
    constructor(config, context, utils) {
        super(config, context, utils);
    }
}

export default Handler;