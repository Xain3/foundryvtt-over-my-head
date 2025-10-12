import Handler from '#baseClasses/handler.mjs';
import PlaceableHandler from './placeableHandler.mjs';
import TileOcclusionManager from 'occlusionHelpers/tileOcclusionManager.mjs';

const TOKEN_TYPE = 'token';
const TILE_TYPE = 'tile';

class OcclusionHandler extends Handler {
  constructor(config, context, utils) {
    super(config, context, utils);

    this.currentOcclusion = null;
    this.tokenHandler = new PlaceableHandler(
      config,
      context,
      utils,
      TOKEN_TYPE
    );
    this.tileHandler = new PlaceableHandler(config, context, utils, TILE_TYPE);
    this.manager = new TileOcclusionManager(config, context, utils);
    this.alsoFadeTiles = [];
  }

  #filterFunction(tile) {
    return this.tileHandler.getter.getAlsoFadeFlag(tile);
  }

  refreshAll() {
    this.tokenHandler.all = this.tokenHandler.getter.getAllPlaceables();
    this.tileHandler.all = this.tileHandler.getter.getAllPlaceables();
  }

  getAlsoFadeTiles(updateProperty = true, returnValue = true) {
    const alsoFadeTiles = this.tileHandler.all.filter((tile) =>
      this.#filterFunction(tile)
    );
    if (updateProperty) {
      this.alsoFadeTiles = alsoFadeTiles;
    }
    return returnValue ? alsoFadeTiles : undefined;
  }

  updateOcclusionForTiles(tiles, token, handler = this.tileHandler) {
    this.manager.updateOcclusionForTiles(tiles, token, handler);
  }

  updateAlsoFadeTilesOcclusion(token) {
    this.manager.updateAlsoFadeTilesOcclusion(
      this.alsoFadeTiles,
      token,
      this.tileHandler
    );
  }
}

export default OcclusionHandler;
