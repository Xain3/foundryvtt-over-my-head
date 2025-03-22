// ./src/listeners/listeners.js

import Listener from "../baseClasses/managers/listener.js";
import StateListener from "./stateListener.js";
import TokenListener from "./tokenListener.js";
import TileListener from "./tileListener.js";
import Config from "../config/config.js";
import Context from "../contexts/context.js";
import Utilities from "../utils/utils.js";
import Handlers from "../handlers/handlers.js";

/**
 * Class representing a collection of listeners.
 * 
 * @class Listeners
 * @extends Listener
 * 
 * @param {Config} config - The configuration object.
 * @param {Context} context - The context in which the listener operates.
 * @param {Utilities} utils - Utility functions or objects.
 * @param {Handlers} handlers - Handlers for various events.
 * 
 * @property {StateListener} state - The state listener instance.
 * @property {TokenListener} token - The token listener instance.
 * @property {TileListener} tile - The tile listener instance.
 * 
 * @method run - Executes the run method for the state, token, and tile objects.
 */
class Listeners extends Listener {
    /**
     * Creates an instance of the listeners with the provided configuration, context, utilities, and handlers.
     * Initializes the state, token, and tile listeners.
     *
     * @param {Config} config - The configuration object.
     * @param {Context} context - The context in which the listener operates.
     * @param {Utilities} utils - Utility functions or objects.
     * @param {Handlers} handlers - Handlers for various events.
     */
    constructor(config, context, utils, handlers){
        super(config, context, utils, handlers);
        this.state = new StateListener(this.config, this.context, this.utils, this.handlers);
        this.tile = new TileListener(this.config, this.context, this.utils, this.handlers);
        this.token = new TokenListener(this.config, this.context, this.utils, this.handlers);
    }

    /**
     * Executes the run method for the state, token, and tile objects.
     * 
     * @method run
     * @memberof Listeners
     */
    run(){
        this.state.run();
        this.tile.run();
        this.token.run();
    }
}

export default Listeners;