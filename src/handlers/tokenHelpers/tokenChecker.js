// ./src/handlers/tokenFunctions/tokenChecker.js

import PlaceableHandler from '../placeableHandler.js';

/**
 * @class TokenChecker
 * @description Handles checking token states and relationships.
 * 
 * @extends PlaceableHandler
 * 
 * @method isControlled - Checks if a token is controlled by the user.
 * 
 * @method isSelected - Checks if a token is selected. WIP
 * 
 * @method isControlledAndSelected - Checks if a token is both controlled and selected.
 * 
 * @method isUnderReference - Checks if the token is under a reference.
 * 
 * @method isUnderTile - Checks if the token is under a tile.
 */
class TokenChecker extends PlaceableHandler {
    constructor(config, context, utils) {
        super(config, context, utils);
    }

    /**
     * Checks if a token is controlled by the user.
     * 
     * @param {Object} token - The token to check.
     * @returns {boolean} - True if controlled, else false.
     */
    isControlled(token) {
        return token.document.isOwner;
    }

    /** WIP
     * Checks if a token is selected.
     * 
     * @param {Object} token - The token to check.
     * @returns {boolean} - True if selected, else false.
     */
    isSelected(token) {
        return token.isSelected;
    }

    /**
     * Checks if a token is both controlled and selected.
     * 
     * @param {Object} token - The token to check.
     * @returns {boolean} - True if both controlled and selected, else false.
     */
    isControlledAndSelected(token) {
        return this.isControlled(token) && this.isSelected(token);
    }

    /**
     * Checks if the token is under a reference.
     * 
     * @param {Object} token - The token to check.
     * @param {Object} reference - The reference object.
     * @param {Object} referenceManager - The reference manager.
     * @param {String} targetUse - Usage type for token.
     * @param {String} referenceUse - Usage type for reference.
     * @returns {boolean} - Result of the check.
     */
    isUnderReference(token, reference, referenceManager, targetUse = 'center', referenceUse = 'rectangle') {
        return this.isUnder(token, reference, this, referenceManager, targetUse, referenceUse);
    }

    /**
     * Checks if the token is under a tile.
     * 
     * @param {Object} token - The token to check.
     * @param {Object} tile - The tile to check.
     * @param {Object} tileManager - The tile manager.
     * @returns {boolean} - Result of the check.
     */
    isUnderTile(token, tile, tileManager) {
        return this.isUnder(token, tile, this, tileManager);
    }
}

export default TokenChecker;