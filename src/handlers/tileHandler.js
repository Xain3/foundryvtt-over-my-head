// ./src/handlers/tileHandler.js
import config from '../config/config.js';
import Context from '../contexts/context.js';
import Utilities from '../utils/utils.js';
import PlaceableHandler from './placeableHandler.js';
import TileGetter from './tileHelpers/tileGetter.js';
import TileSetter from './tileHelpers/tileSetter.js';
import TileChecker from './tileHelpers/tileChecker.js';
import TileOcclusionManager from './tileHelpers/tileOcclusionManager.js';

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
 * @property {Array} tiles - The array of tiles managed by this handler.
 * @property {Array} alsoFadeTiles - The array of tiles that have the "alsoFade" flag set.
 * @property {TileGetter} getter - Helper for retrieving tile data.
 * @property {TileSetter} setter - Helper for setting tile data.
 * @property {TileChecker} checker - Helper for checking tile conditions.
 * @property {TileOcclusionManager} occlusionManager - Helper for managing tile occlusion.
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
        
        // Initialize helper classes
        this.getter = new TileGetter(config, context, utils);
        this.setter = new TileSetter(config, context, utils);
        this.checker = new TileChecker(config, context, utils);
        this.occlusionManager = new TileOcclusionManager(config, context, utils);
        
        // Initialize properties
        this.tiles = this.getter.getTiles();
        this.alsoFadeTiles = this.getter.getAlsoFadeTiles();
    }

    /**
     * Retrieves the tiles based on the specified parameters.
     * Delegates to getter.getTiles() for implementation.
     */
    getTiles(updateProperty = true, returnValue = true) {
        const tiles = this.getter.getTiles(updateProperty, returnValue);
        if (updateProperty) {
            this.tiles = tiles;
        }
        return returnValue ? tiles : [];
    }

    /**
     * Retrieves the "also fade" flag from the specified tile's document.
     * Delegates to getter.getAlsoFadeFlag() for implementation.
     */
    getAlsoFadeFlag(tile) {
        return this.getter.getAlsoFadeFlag(tile);
    }

    /**
     * Filters tiles that have the "alsoFade" flag set.
     * Delegates to getter.getAlsoFadeTiles() for implementation.
     */
    filterAlsoFadeTiles(tiles = null, updateProperty = true, returnValue = true) {
        const alsoFadeTiles = this.getter.getAlsoFadeTiles(tiles, updateProperty, returnValue);
        if (updateProperty) {
            this.alsoFadeTiles = alsoFadeTiles;
        }
        return returnValue ? alsoFadeTiles : [];
    }

    /**
     * Updates the occlusion mode of a given tile.
     * Delegates to occlusionManager.updateOcclusion() for implementation.
     */
    updateOcclusion(tile, occlusionMode) {
        this.occlusionManager.updateOcclusion(tile, occlusionMode);
    }

    /**
     * Sets the occlusion mode of a tile based on whether a token is under the tile.
     * Delegates to occlusionManager.setAlsoFadeTileOcclusion() for implementation.
     */
    setAlsoFadeTileOcclusion(tile, token) {
        this.occlusionManager.setAlsoFadeTileOcclusion(tile, token, this.checker);
    }

    /**
     * Updates the occlusion for a list of tiles based on the provided token.
     * Delegates to occlusionManager.updateOcclusionForTiles() for implementation.
     */
    updateOcclusionForTiles(tiles, token) {
        this.occlusionManager.updateOcclusionForTiles(tiles, token, this.getter, this.checker);
    }

    /**
     * Updates the occlusion of tiles that should also fade based on the given token.
     * Delegates to occlusionManager.updateAlsoFadeTilesOcclusion() for implementation.
     */
    updateAlsoFadeTilesOcclusion(token) {
        this.occlusionManager.updateAlsoFadeTilesOcclusion(token, this.getter, this.checker);
    }

    /**
     * Checks if a token is under a tile.
     * Delegates to checker.isTokenUnderTile() for implementation.
     */
    isTokenUnderTile(tile, token) {
        return this.checker.isTokenUnderTile(tile, token);
    }
}

export default TileHandler;