// ./src/handlers/occlusionHandler.js

import Handler from "../baseClasses/handler.js";

/**
 * Class for handling occlusion settings.
 * 
 * @class OcclusionHandler
 * @module handlers
 * @constructor
 * @param {Config} config - The configuration object.
 * @param {Context} context - The context object.
 * @param {Utilities} utils - The utility object.
 * @param {TokenHandler} tokenHandler - The token handler object.
 * @param {TileHandler} tileHandler - The tile handler object.
 * @property {Config} config - The configuration object.
 * @property {Context} context - The context object.
 * @property {Utilities} utils - The utility object.
 * @property {TokenHandler} tokenHandler - The token handler object.
 * @property {TileHandler} tileHandler - The tile handler object.
 * @property {null} currentOcclusion - The current occlusion setting.
 * @method setOcclusionMode - Sets the occlusion mode.
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

    setOcclusionMode(document, occlusionMode){
        document.update({ occlusion: occlusionMode });
    }

    setAlsoFadeTileOcclusion(tile, token){
        if(token.isUnderTile(tile, token)) {
                let occlusion = { occlusion : { mode : CONST.TILE_OCCLUSION_MODES.FADE } };
                this.tileHandler.updateOcclusion(tile, occlusion);
        } else {
                let occlusion = { occlusion : { mode : CONST.TILE_OCCLUSION_MODES.VISION } };
                this.tileHandler.updateOcclusion(tile, occlusion);
        }
    }

    updateAlsoFadeTilesOcclusion(token){
        const alsoFadeTiles = this.tileHandler.filterAlsoFadeTiles();
        alsoFadeTiles.forEach(tile => {
            this.setAlsoFadeTileOcclusion(tile, token);
        });
    }

    updateOcclusionForTiles(tiles, token){
        tiles.forEach(tile => {
            if(this.tileHandler.getAlsoFadeFlag(tile)){
                this.setAlsoFadeTileOcclusion(tile, token);
            }
        })
    }
    // // Update tile occlusion modes based on token ownership and position
    // Hooks.on('refreshToken', (token) => {
    //     // if the ENABLE_BUTTON_SETTING setting is false, return early
    //     if (!game.settings.get(MODULENAME, Settings.ENABLE_BUTTON_SETTING)) {
    //         return;
    //     }
        
    //     if (debugMode) {console.log(`Refreshing token ${token.id}`)};  // DEBUG - log the token id
        
    //     // if the token is owned by the current user and is selected
    //     if (token.document.isOwner && this.isSelected(token, canvas.tokens.controlled)) {
    //         // get all tiles on the canvas
    //         let tiles = canvas.tiles.placeables;
    //         tiles.forEach(tile => {
    //             // get 'also fade' setting for tile
    //             let alsoFade = tile.document.getFlag(MODULENAME, FLAGS.ALSOFADE);

    //             // update the tile occlusion mode based on token position if 'also fade' is enabled
    //             if (alsoFade) {
    //                 if(this.isUnderTile(tile, token)) {
    //                     let occlusion = { occlusion : { mode : CONST.TILE_OCCLUSION_MODES.FADE } };
    //                     tile.document.update(occlusion);
    //                 }
    //                 else {
    //                     let occlusion = { occlusion : { mode : CONST.TILE_OCCLUSION_MODES.VISION } };
    //                     tile.document.update(occlusion);
    //                 }
    //             }});
        
    //     // if the token is not owned by the current user or is not selected
    //     } else {
    //         let tiles = canvas.tiles.placeables;
    //         tiles.forEach(tile => {
    //             // get 'also fade' setting for tile
    //             let alsoFade = tile.document.getFlag(MODULENAME, FLAGS.ALSOFADE);

    //             // ensure that the tile occlusion mode is set to 'Vision' if the token is not owned by the current user or is not selected
    //             if (alsoFade) {
    //                 let occlusion = { occlusion : { mode : CONST.TILE_OCCLUSION_MODES.VISION } };
    //                 tile.document.update(occlusion);
    //             }
    //         });
    //     }
    // });
}

export default OcclusionHandler;