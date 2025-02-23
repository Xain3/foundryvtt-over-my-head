// ./src/baseClasses/listener.js

import Component from './component.js';

/**
 * The Listener class is the base class for all listener classes.
 * Listeners are responsible for listening for events and responding to them.
 * 
 * It extends the Component class.
 * 
 * @class Listener
 * @module Listener
 * @extends Component
 * 
 * @constructor
 * @param {Object} config - The configuration object containing constants.
 * @param {Object} context - The execution context.
 * @param {Object} utils - The utility object.
 * @param {Object} handlers - The handler object.
 */
class Listener extends Component {
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