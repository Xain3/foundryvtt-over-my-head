// ./src/handlers/occlusionHandler.js

import Handler from "../baseClasses/handler.js";
import Config from "../config/config.js";
import Context from "../contexts/context.js";
import Utilities from "../utils/utils.js";
import TokenHandler from "./tokenHandler.js";
import TileHandler from "./tileHandler.js";


/**
 * Handles occlusion settings and updates for tokens and tiles.
 * 
 * @class OcclusionHandler
 * @extends Handler
 * 
 * @param {Config} config - The configuration object.
 * @param {Context} context - The context object.
 * @param {Utilities} utils - Utility functions.
 * @param {TokenHandler} tokenHandler - The token handler object.
 * @param {TileHandler} tileHandler - The tile handler object.
 * 
 * @property {null} currentOcclusion - The current occlusion setting.
 * @property {TokenHandler} tokenHandler - The token handler object.
 * @property {TileHandler} tileHandler - The tile handler object.
 * 
 * @method updateOcclusionForTiles
 * @param {Array} tiles - The array of tiles to update occlusion for.
 * @param {Object} token - The token object.
 * @description Updates the occlusion for the specified tiles based on the given token.
 * 
 * @method updateAlsoFadeTilesOcclusion
 * @param {Object} token - The token object.
 * @description Updates the occlusion for tiles that should also fade based on the given token.
 */
class OcclusionHandler extends Handler {
    /**
     * 
     * @param {Config} config 
     * @param {Context} context 
     * @param {Utilities} utils 
     * @param {TokenHandler} tokenHandler 
     * @param {TileHandler} tileHandler 
     */
    constructor(config, context, utils, tokenHandler, tileHandler){
        super(config, context, utils);

        /**
         * The current occlusion setting.
         * @type {null}
         */
        this.currentOcclusion = null;

        /**
         * The token handler object.
         * @type {TokenHandler}
         */
        this.tokenHandler = tokenHandler;

        /**
         * The tile handler object.
         * @type {TileHandler}
         */
        this.tileHandler = tileHandler;
    }

    /**
     * Updates the occlusion for a set of tiles based on the given token.
     * 
     * @method updateOcclusionForTiles
     * @memberof OcclusionHandler
     *
     * @param {Array} tiles - An array of tile objects to update occlusion for.
     * @param {Object} token - The token object that affects the occlusion of the tiles.
     */
    updateOcclusionForTiles(tiles, token) {
        this.tileHandler.updateOcclusionForTiles(tiles, token);
    }

    /**
     * Updates the occlusion state of tiles that should also fade when the token moves.
     * 
     * @method updateAlsoFadeTilesOcclusion
     * @memberof OcclusionHandler
     *
     * @param {Token} token - The token whose movement triggers the occlusion update.
     */
    updateAlsoFadeTilesOcclusion(token) {
        this.tileHandler.updateAlsoFadeTilesOcclusion(token);
    }
}

export default OcclusionHandler;