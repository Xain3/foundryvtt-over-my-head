// ./src/handlers/tileHelpers/tileSetter.js

import PlaceableHandler from '../placeableHandler.js';

/**
 * @class TileSetter
 * @description Handles setting tile data state.
 * 
 * @extends PlaceableHandler
 * 
 * @property {Object} current - The current tile.
 * 
 * @method setCurrentTile - Sets the current tile.
 */
class TileSetter extends PlaceableHandler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.current = null;
    }

    /**
     * Sets the current tile.
     * 
     * @param {Object} tile - The tile to set as current.
     * @param {boolean} returnValue - Whether to return the current tile.
     * @returns {Object|null} - The current tile or null.
     */
    setCurrentTile(tile, returnValue = true) {
        this.setCurrentPlaceable(tile);
        return returnValue ? this.current : null;
    }
}

export default TileSetter;