// ./src/handlers/tokenFunctions/tokenGetter.js

import PlaceableHandler from '../placeableHandler.js';

/**
 * @class TokenGetter
 * @description Handles retrieval of token data.
 * 
 * @extends PlaceableHandler
 * 
 * @property {Array} all - All tokens.
 * @property {Array} selected - Selected tokens.
 * 
 * @method getTokens - Retrieves all tokens.
 * @param {boolean} updateProperty - Whether to update the tokens property (default is true).
 * @param {boolean} returnValue - Whether to return the tokens (default is true).
 * @returns {Array} - Array of tokens.
 * 
 * @method getSelectedTokens - Retrieves selected tokens.
 * @param {Array} tokens - Optional tokens array.
 * @param {boolean} updateProperty - Whether to update the selectedTokens property (default is true).
 * @param {boolean} returnValue - Whether to return the selected tokens (default is true).
 * @returns {Array} - Array of selected tokens.
 */
class TokenGetter extends PlaceableHandler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.placeableType = this.const.HANDLERS.TOKEN.PLACEABLE_TYPE;
        this.all = this.getTokens();
        this.selected = this.getSelectedTokens();
    }

    /**
     * Retrieves all tokens.
     * 
     * @param {boolean} updateProperty - Whether to update the tokens property (default is true).
     * @param {boolean} returnValue - Whether to return the tokens (default is true).
     * @returns {Array} - Array of tokens.
     */
    getTokens(updateProperty = true, returnValue = true) {
        let tokens = this.getPlaceables(this.placeableType, updateProperty, returnValue);
        if (updateProperty) {
            this.all = tokens;
        }
        return returnValue ? tokens : [];
    }

    /**
     * Retrieves selected tokens.
     * 
     * @param {Array} tokens - Optional tokens array.
     * @param {boolean} updateProperty - Whether to update the selectedTokens property (default is true).
     * @param {boolean} returnValue - Whether to return the selected tokens (default is true).
     * @returns {Array} - Array of selected tokens.
     */
    getSelectedTokens(tokens = this.all, updateProperty = true, returnValue = true) {
        let selectedTokens = this.getSelectedPlaceables(tokens);
        if (updateProperty) {
            this.selected = selectedTokens;
        }
        return returnValue ? selectedTokens : [];
    }
}

export default TokenGetter;