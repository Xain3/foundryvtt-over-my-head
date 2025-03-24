// ./src/baseClasses/listener.js

import Manager from './manager.js';

/**
 * The Listener class is the base class for all listener classes.
 * Listeners are responsible for listening for events and responding to them.
 * 
 * It extends the Manager class.
 * 
 * @class Listener
 * @module Listener
 * @extends Manager
 * 
 * @constructor
 * @param {Object} config - The configuration object containing constants.
 * @param {Object} context - The execution context.
 * @param {Object} utils - The utility object.
 * @param {Object} handlers - The handler object.
 * 
 * @property {Object} handlers - The object containing event handlers.
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
class Listener extends Manager {
    constructor(config, context, utils, handlers) {
        super(config, context, utils);
        this.handlers = handlers;
    }

    /**
     * Handles an event by calling the onEvent handler.
     * 
     * @param {string} event - The event to handle.
     * @param {Object} data - The data associated with the event.
     */
    handleEvent = (event, data) => {
        this.handlers.onEvent(event, data);
    }
}


export default Listener;