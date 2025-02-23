// ./src/baseClasses/handler.js

import Component from './component.js';

/**
 * The Handler class is the base class for all handler classes.
 * Handlers are responsible for managing operations related to a specific entity type.
 * 
 * It extends the Component class.
 * 
 * @class Handler
 * @module Handler
 * @extends Component
 * 
 * @constructor
 * @param {Object} config - The configuration object containing constants.
 * @param {Object} context - The execution context.
 * @param {Object} utils - The utility object.
 */
class Handler extends Component {
    constructor(config, context, utils) {
        super(config, context, utils);
    }
}

export default Handler;