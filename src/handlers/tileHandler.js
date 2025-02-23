// ./src/handlers/tileHandler.js
import Config from '../config/config.js';
import Context from '../contexts/context.js';
import Utilities from '../utils/utils.js';
import PlaceableHandler from './placeableHandler.js';

/**
 * TileHandler class extends PlaceableHandler to manage tile-specific operations.
 * 
 * @class TileHandler
 * @extends PlaceableHandler
 * 
 * @param {Config} config - The configuration object.
 * @param {Context} context - The context in which the handler operates.
 * @param {Utilities} utils - Utility functions or objects.
 * 
 * @property {string} placeableType - The type of placeable this handler manages.
 * @property {Array} tiles - The array of tiles managed by this handler.
 * @property {Array} alsoFadeTiles - The array of tiles that have the "alsoFade" flag set.
 * 
 * @method getTiles
 * @memberof TileHandler
 * @param {boolean} [updateProperty=true] - Determines whether to update the internal tiles property.
 * @param {boolean} [returnValue=true] - Determines whether to return the retrieved tiles.
 * @returns {Array} The retrieved tiles if returnValue is true, otherwise an empty array.
 * @throws {Error} If there is an issue retrieving the tiles.
 * 
 * @method getAlsoFadeFlag
 * @memberof TileHandler
 * @param {Object} tile - The tile object from which to retrieve the flag.
 * @returns {any} The value of the "also fade" flag.
 * 
 * @method filterAlsoFadeTiles
 * @memberof TileHandler
 * @param {Array} [tiles=null] - The array of tiles to filter. If null, the method will retrieve the tiles using `this.getTiles()`.
 * @param {boolean} [updateProperty=true] - Whether to update the `alsoFadeTiles` property with the filtered tiles.
 * @param {boolean} [returnValue=true] - Whether to return the filtered tiles. If false, an empty array is returned.
 * @returns {Array} The filtered array of tiles with the "alsoFade" flag set, or an empty array if `returnValue` is false or an error occurs.
 * 
 * @method updateOcclusion
 * @memberof TileHandler
 * @param {Object} tile - The tile object to update.
 * @param {string} occlusionMode - The new occlusion mode to set for the tile.
 * 
 * @method setAlsoFadeTileOcclusion
 * @memberof TileHandler
 * @param {Tile} tile - The tile object to update.
 * @param {Token} token - The token object to check against the tile.
 * 
 * @method updateOcclusionForTiles
 * @memberof TileHandler
 * @param {Array} tiles - An array of tile objects to update occlusion for.
 * @param {Object} token - The token object used to determine occlusion updates.
 * 
 * @method updateAlsoFadeTilesOcclusion
 * @memberof TileHandler
 * @param {Object} token - The token used to update the occlusion of the tiles.
 * 
 * @method isTokenUnderTile
 * @memberof TileHandler
 * @param {Object} tile - The tile object to check against.
 * @param {Object} token - The token object to check.
 * @returns {boolean} - Returns true if the token is under the tile, otherwise false.
 */
class TileHandler extends PlaceableHandler {
    /**
     * Constructs a new instance of the TileHandler.
     * 
     * @param {Config} config - The configuration object.
     * @param {Context} context - The context in which the handler operates.
     * @param {Utilities} utils - Utility functions or objects.
     */
    constructor(config, context, utils) {
        super(config, context, utils);
        this.placeableType = this.const.HANDLERS.TILE.PLACEABLE_TYPE;
        this.tiles = this.getTiles();
        this.alsoFadeTiles = this.filterAlsoFadeTiles();
    }

    /**
     * Retrieves the tiles based on the specified parameters.
     * 
     * @method getTiles
     * @memberof TileHandler
     *
     * @param {boolean} [updateProperty=true] - Determines whether to update the internal tiles property.
     * @param {boolean} [returnValue=true] - Determines whether to return the retrieved tiles.
     * @returns {Array} The retrieved tiles if returnValue is true, otherwise an empty array.
     * @throws {Error} If there is an issue retrieving the tiles.
     */
    getTiles(updateProperty = true, returnValue = true) {
        try {
            let tiles = this.getPlaceables(this.placeableType, updateProperty, returnValue);
            if (updateProperty) {
                this.tiles = tiles;
            }
            if (returnValue) {
                return tiles;
            } else {
                return [];
            }
        } catch (e) {
            this.logger.warn(`It was not possible to get tiles: ${e}`);
            return [];
        }
    }

    /**
     * Retrieves the "also fade" flag from the specified tile's document.
     * 
     * @method getAlsoFadeFlag
     * @memberof TileHandler
     *
     * @param {Object} tile - The tile object from which to retrieve the flag.
     * @returns {any} The value of the "also fade" flag.
     */
    getAlsoFadeFlag(tile) {
        return tile.document.getFlag(this.config.MODULE.ID, this.config.FLAGS.ALSOFADE);
    }

    /**
     * Filters tiles that have the "alsoFade" flag set.
     * 
     * @param {Array} [tiles=null] - The array of tiles to filter. If null, the method will retrieve the tiles using `this.getTiles()`.
     * @param {boolean} [updateProperty=true] - Whether to update the `alsoFadeTiles` property with the filtered tiles.
     *
     * @param {Array} [tiles=null] - The array of tiles to filter. If null, the method will retrieve the tiles using `this.getTiles()`.
     * @param {boolean} [updateProperty=true] - Whether to update the `alsoFadeTiles` property with the filtered tiles.
     * @param {boolean} [returnValue=true] - Whether to return the filtered tiles. If false, an empty array is returned.
     * @returns {Array} The filtered array of tiles with the "alsoFade" flag set, or an empty array if `returnValue` is false or an error occurs.
     */
    filterAlsoFadeTiles(tiles = null, updateProperty = true, returnValue = true) {
        try {
            if (tiles === null) {
                tiles = this.getTiles();
            }
            let alsoFadeTiles = tiles.filter(tile => this.getAlsoFadeFlag(tile));
            if (updateProperty) {
                this.alsoFadeTiles = alsoFadeTiles;
            }
            if (returnValue) {
                return alsoFadeTiles;
            } else {
                return [];
            }
        } catch (e) {
            this.logger.warn(`It was not possible to filter alsoFade tiles: ${e}`);
            return [];
        }
    }

    /**
     * Updates the occlusion mode of a given tile.
     * 
     * @method updateOcclusion
     * @memberof TileHandler
     *
     * @param {Object} tile - The tile object to update.
     * @param {string} occlusionMode - The new occlusion mode to set for the tile.
     */
    updateOcclusion(tile, occlusionMode) {
        tile.document.update({ occlusion: occlusionMode });
    }

    /**
     * Sets the occlusion mode of a tile based on whether a token is under the tile.
     * If the token is under the tile, the occlusion mode is set to FADE.
     * Otherwise, the occlusion mode is set to VISION.
     * 
     * @method setAlsoFadeTileOcclusion
     * @memberof TileHandler
     *
     * @param {Tile} tile - The tile object to update.
     * @param {Token} token - The token object to check against the tile.
     */
    setAlsoFadeTileOcclusion(tile, token) {
        if (this.isTokenUnderTile(tile, token)) {
            let occlusionMode = { mode: CONSTANTS.TILE_OCCLUSION_MODES.FADE };
            this.updateOcclusion(tile, occlusionMode);
        } else {
            let occlusionMode = { mode: CONSTANTS.TILE_OCCLUSION_MODES.VISION };
            this.updateOcclusion(tile, occlusionMode);
        }
    }

    /**
     * Updates the occlusion for a list of tiles based on the provided token.
     *
     * @method updateOcclusionForTiles
     * @memberof TileHandler
     * 
     * @param {Array} tiles - An array of tile objects to update occlusion for.
     * @param {Object} token - The token object used to determine occlusion updates.
     */
    updateOcclusionForTiles(tiles, token) {
        tiles.forEach(tile => {
            if (this.getAlsoFadeFlag(tile)) {
                this.setAlsoFadeTileOcclusion(tile, token);
            }
        });
    }

    /**
     * Updates the occlusion of tiles that should also fade based on the given token.
     *
     * This method filters the tiles that should also fade and updates their occlusion
     * using the provided token.
     * 
     * @method updateAlsoFadeTilesOcclusion
     * @memberof TileHandler
     *
     * @param {Object} token - The token used to update the occlusion of the tiles.
     */
    updateAlsoFadeTilesOcclusion(token) {
        const alsoFadeTiles = this.filterAlsoFadeTiles();
        alsoFadeTiles.forEach(tile => {
            this.setAlsoFadeTileOcclusion(tile, token);
        });
    }

    /**
     * Checks if a token is under a tile.
     * 
     * @method isTokenUnderTile
     * @memberof TileHandler
     *
     * @param {Object} tile - The tile object to check against.
     * @param {Object} token - The token object to check.
     * @returns {boolean} - Returns true if the token is under the tile, otherwise false.
     */
    isTokenUnderTile(tile, token) {
        return this.isUnder(
            token,              // target
            tile,               // reference
            this.handlers.token, // targetManager (TokenHandler)
            this,               // referenceManager (TileHandler)
            'center',           // targetUse
            'rectangle'         // referenceUse
        );
    }
}

export default TileHandler;