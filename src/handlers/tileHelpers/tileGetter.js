// ./src/handlers/tileHelpers/tileGetter.js

import PlaceableHandler from '../placeableHandler.js';

/**
 * @class TileGetter
 * @description Handles retrieval of tile data.
 * 
 * @extends PlaceableHandler
 * 
 * @property {Array} all - All tiles.
 * @property {Array} selected - Selected tiles.
 * @property {Array} alsoFade - Tiles with the alsoFade flag set.
 * 
 * @property {Object} utils - The utility object. (inherited from Handler)
 * @property {Object} logger - The logger object. (inherited from Handler)
 * @property {Object} config - The configuration object (inherited from Base).
 * @property {Object} const - The constant object (inherited from Base).
 * @property {Object} moduleConstants - The module constants object (inherited from Base).
 * @property {Object} game - The global game object (inherited from Base).
 * @property {Object} context - The execution context (inherited from Base).
 */
class TileGetter extends PlaceableHandler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.placeableType = this.getPlaceableType();
        this.all = this.getTiles();
        this.selected = this.getSelectedTiles();
        this.alsoFade = this.getAlsoFadeTiles();
    }

    getPlaceableType(constants = null) {
        const cnst = constants || this.const;
        return cnst.PLACEABLE_TYPES.TILE;
    }
    
    /**
     * Retrieves all tiles.
     * 
     * @param {boolean} updateProperty - Whether to update the tiles property (default is true).
     * @param {boolean} returnValue - Whether to return the tiles (default is true).
     * @returns {Array} - Array of tiles.
     */
    getTiles(updateProperty = true, returnValue = true) {
        try {
            let tiles = this.getPlaceables(this.placeableType, updateProperty, returnValue);
            if (updateProperty) {
                this.all = tiles;
            }
            return returnValue ? tiles : [];
        } catch (e) {
            this.logger.warn(`It was not possible to get tiles: ${e}`);
            return [];
        }
    }

    /**
     * Retrieves selected tiles.
     * 
     * @param {Array} tiles - Optional tiles array.
     * @param {boolean} updateProperty - Whether to update the selectedTiles property (default is true).
     * @param {boolean} returnValue - Whether to return the selected tiles (default is true).
     * @returns {Array} - Array of selected tiles.
     */
    getSelectedTiles(tiles = this.all, updateProperty = true, returnValue = true) {
        let selectedTiles = this.getSelectedPlaceables(tiles);
        if (updateProperty) {
            this.selected = selectedTiles;
        }
        return returnValue ? selectedTiles : [];
    }

    /**
     * Retrieves the "also fade" flag from the specified tile's document.
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
     * @param {boolean} [updateProperty=true] - Whether to update the `alsoFade` property with the filtered tiles.
     * @param {boolean} [returnValue=true] - Whether to return the filtered tiles. If false, an empty array is returned.
     * @returns {Array} The filtered array of tiles with the "alsoFade" flag set, or an empty array if `returnValue` is false or an error occurs.
     */
    getAlsoFadeTiles(tiles = null, updateProperty = true, returnValue = true) {
        try {
            if (tiles === null) {
                tiles = this.getTiles();
            }
            let alsoFadeTiles = tiles.filter(tile => this.getAlsoFadeFlag(tile));
            if (updateProperty) {
                this.alsoFade = alsoFadeTiles;
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
}

export default TileGetter;