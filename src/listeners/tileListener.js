// ./src/listeners/tileListener.js

import Listener from "../baseClasses/managers/listener.js";
import Config from "../config/config.js";
import Context from "../contexts/context.js";
import Handlers from "../handlers/handlers.js";
import Utilities from "../utils/utils.js";

/**
 * TileListener class extends the Listener class to handle tile-related events.
 * 
 * @class TileListener
 * @extends Listener
 * 
 * @param {Config} config - Configuration object for the listener.
 * @param {Context} context - Context in which the listener operates.
 * @param {Utilities} utils - Utility functions for the listener.
 * @param {Handlers} handlers - Handlers for various events, including tile events.
 * 
 * @property {Object} handler - The handler for tile events.
 * 
 * @method getTilesOnRefreshTile
 * @description Registers a hook that listens for the 'refreshTile' event. When a tile is refreshed, it updates the tiles and alsoFadeTiles properties of the handler with the current tiles on the canvas.
 * 
 * @method run
 * @description Placeholder method to be implemented with the logic to run the listener.
 */
class TileListener extends Listener {
    /**
     * Creates an instance of the TileListener.
     * 
     * @param {Config} config - The configuration object.
     * @param {Context} context - The context in which the listener operates.
     * @param {Utilities} utils - Utility functions or objects.
     * @param {Handlers} handlers - Handlers for various events.
     */
    constructor(config, context, utils, handlers) {
        super(config, context, utils, handlers);
        this.handler = handlers.tile;
    }

    /**
     * Registers a hook that listens for the 'refreshTile' event.
     * When a tile is refreshed, it updates the tiles and alsoFadeTiles properties
     * of the handler with the current tiles on the canvas.
     *
     * @function getTilesOnRefreshTile
     * @memberof TileListener
     */
    getTilesOnRefreshTile() {
        // When the tile is refreshed, get all the tiles on the canvas    
        Hooks.on('refreshTile', (tile) => {
            // Get all the tiles on the canvas and update the tiles property
            this.handler.tiles = this.handler.getTiles();
            // Filters the tiles that have the Also Fade Tiles setting enabled and updates the alsoFadeTiles property
            this.handler.alsoFadeTiles = this.handler.getAlsoFadeTiles();
            });
    }

    /**
     * Executes the tile listener's main functionality.
     * Calls the method to get tiles on refresh.
     * 
     * @method run
     */
    run() {
        this.getTilesOnRefreshTile();
    }
}

export default TileListener;