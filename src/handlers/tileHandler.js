// ./src/handlers/tileHandler.js
import PlaceableHandler from './placeableHandler.js';

class TileHandler extends PlaceableHandler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.placeableType = this.config.CONSTANTS.HANDLERS.TILE.PLACEABLE_TYPE;
        this.alsoFadeTiles = [];
    }

    getTiles(updateProperty = true, returnValue = true) {
        return this.getPlaceables(this.placeableType, updateProperty, returnValue);
    }

    getAlsoFadeFlag(tile) {
        return tile.document.getFlag(this.config.MODULE.ID, this.config.FLAGS.ALSOFADE);
    }

    setOcclusionMode(tile, occlusion) {
        tile.document.update(occlusion);
    }

    filterAlsoFadeTiles(tiles = this.placeables) {
        this.alsoFadeTiles = tiles.filter(tile => this.getAlsoFadeFlag(tile));
        return this.alsoFadeTiles;

    }
    
    updateOcclusion(tile, occlusionMode){
        tile.document.update(occlusionMode);
    }
}

export default TileHandler;