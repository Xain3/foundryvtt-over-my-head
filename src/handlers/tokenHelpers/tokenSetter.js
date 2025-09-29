// ./src/handlers/tokenFunctions/tokenSetter.js

import PlaceableHandler from '../placeableHandler.js';

/**
 * @class TokenSetter
 * @description Handles setting token data.
 * 
 * @extends PlaceableHandler
 * 
 * @property {Object} current - The current token.
 * 
 * @method setCurrentToken - Sets the current token.
 * @param {Object} token - The token to set as current.
 * 
 */
class TokenSetter extends PlaceableHandler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.current = null;
    }

    /**
     * Sets the current token.
     * 
     * @param {Object} token - The token to set as current.
     * @param {boolean} returnValue - Whether to return the current token.
     * @returns {Object|null} - The current token or null.
     */
    setCurrentToken(token, returnValue = true) {
        this.setCurrentPlaceable(token);
        return returnValue ? this.current : null;
    }
}

export default TokenSetter;