// ./src/handlers/tokenHelpers/tokenGetter.js

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
 * @property {Object} utils - The utility object. (inherited from Handler)
 * @property {Object} logger - The logger object. (inherited from Handler)
 * @property {Object} config - The configuration object (inherited from Base).
 * @property {Object} const - The constant object (inherited from Base).
 * @property {Object} moduleConstants - The module constants object (inherited from Base).
 * @property {Object} game - The global game object (inherited from Base).
 * @property {Object} context - The execution context (inherited from Base).
 */
class TokenGetter extends PlaceableHandler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.placeableType = this.getPlaceableType();
        this.all = this.getTokens();
        this.selected = this.getSelectedTokens();
    }

    getPlaceableType(constants = null) {
        const cnst = constants || this.const;
        return cnst.PLACEABLE_TYPES.TOKEN;
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