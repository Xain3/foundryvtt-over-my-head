// ./src/listeners/listeners.js

import Listener from "../baseClasses/listener.js";
import Config from "../config/config.js";
import Context from "../contexts/context.js";
import Handlers from "../handlers/handlers.js";
import Utilities from "../utils/utils.js";

/**
 * StateListener class extends the Listener class to handle state-related events.
 * It sets up listeners for logging and retrieving remote state.
 * 
 * @class StateListener
 * @extends Listener
 * 
 * @param {Config} config - The configuration object.
 * @param {Context} context - The context in which the listener operates.
 * @param {Utilities} utils - Utility functions or objects.
 * @param {Handlers} handlers - Handlers for various events.
 * 
 * @method setupLogRemoteState
 * Sets up a listener for the log state hook.
 * When the hook is triggered, it logs the state and calls the context's logState method.
 * 
 * @method setupGetRemoteState
 * Sets up a listener for the 'getRemoteState' hook.
 * When the hook is triggered, logs the action and retrieves the current state from the context.
 * 
 * @method run
 * Executes the main logic for setting up the log state.
 * This method is responsible for initializing and configuring
 * the logging state of the application.
 */
class StateListener extends Listener {
    /**
     * Creates an instance of the class.
     * 
     * @param {Config} config - The configuration object.
     * @param {Context} context - The context in which the listener operates.
     * @param {Utilities} utils - Utility functions or objects.
     * @param {Handlers} handlers - Handlers for various events.
     */
    constructor(config, context, utils, handlers) {
        super(config, context, utils, handlers);
    }

    /**
     * Sets up a listener for the 'logState' hook.
     * When the hook is triggered, it logs the state using the logger and context.
     * 
     * @method setupLogState
     * @memberof StateListener
     */
    setupLogRemoteState() {
        Hooks.on(this.config.formatHook(this.config.HOOKS.IN['logRemoteState'], 'IN'), () =>{ 
            this.logger.log('Logging remote state');
            this.context.getRemoteLocation()
        });
    }

    /**
     * Sets up a listener for the 'getRemoteState' hook.
     * When the hook is triggered, logs the action and retrieves the current state from the context.
     *
     * @method setupGetRemoteState
     * @memberof StateListener
     */
    setupGetRemoteState() {
        Hooks.on(this.config.formatHook(this.config.HOOKS.IN['getRemoteState'], 'IN'), () =>{ 
            this.logger.log('Getting remote state');
            let state = this.context.getState()
            
        });
    }

    /**
     * Executes the main logic for setting up the log state.
     * This method is responsible for initializing and configuring
     * the logging state of the application.
     * 
     * @method run
     */
    run() {
        this.setupLogState();
        this.setupLogRemoteState();
        this.setupGetRemoteState();

    }
}

export default StateListener;