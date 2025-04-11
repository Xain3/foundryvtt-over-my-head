// ./src/handlers/tileHelpers/tileChecker.js

import PlaceableHandler from '../placeableHandler.js';

/**
 * @class TileChecker
 * @description Handles checking tile states and relationships.
 * 
 * @extends PlaceableHandler
 * 
 * @method isControlled - Checks if a tile is controlled by the user.
 * @method isSelected - Checks if a tile is selected.
 * @method isControlledAndSelected - Checks if a tile is both controlled and selected.
 * @method isTokenUnderTile - Checks if a token is under a tile.
 */
class TileChecker extends PlaceableHandler {
    constructor(config, context, utils) {
        super(config, context, utils);
    }

    /**
     * Checks if a tile is controlled by the user.
     * 
     * @param {Object} tile - The tile to check.
     * @returns {boolean} - True if controlled, else false.
     */
    isControlled(tile) {
        return tile.document.isOwner;
    }

    /**
     * Checks if a tile is selected.
     * 
     * @param {Object} tile - The tile to check.
     * @returns {boolean} - True if selected, else false.
     */
    isSelected(tile) {
        return tile.isSelected;
    }

    /**
     * Checks if a tile is both controlled and selected.
     * 
     * @param {Object} tile - The tile to check.
     * @returns {boolean} - True if both controlled and selected, else false.
     */
    isControlledAndSelected(tile) {
        return this.isControlled(tile) && this.isSelected(tile);
    }

    /**
     * Checks if a token is under a tile.
     * 
     * @param {Object} tile - The tile object to check against.
     * @param {Object} token - The token object to check.
     * @param {Object} tokenHandler - Optional token handler for position checking.
     * @returns {boolean} - Returns true if the token is under the tile, otherwise false.
     */
    isTokenUnderTile(tile, token, tokenHandler = null) {
        const tHandler = tokenHandler || this.handlers.token;
        return this.isUnder(
            token,       // target
            tile,        // reference
            tHandler,    // targetManager (TokenHandler)
            this,        // referenceManager (TileHandler)
            'center',    // targetUse
            'rectangle'  // referenceUse
        );
    }
    
    /**
     * Checks if the tile has the "also fade" flag.
     * 
     * @param {Object} tile - The tile to check.
     * @param {TileGetter} getter - The tile getter.
     * @returns {boolean} - True if the tile has the alsoFade flag, else false.
     */
    hasAlsoFadeFlag(tile, getter) {
        return !!getter.getAlsoFadeFlag(tile);
    }
}

export default TileChecker;