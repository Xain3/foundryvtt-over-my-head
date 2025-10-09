// ./src/handlers/tileHelpers/tileOcclusionManager.js

import PlaceableHandler from '../placeableHandler.js';

/**
 * @class TileOcclusionManager
 * @description Handles tile occlusion operations.
 *
 * @extends PlaceableHandler
 *
 * @method updateOcclusion - Updates the occlusion mode of a tile.
 * @method setAlsoFadeTileOcclusion - Sets tile occlusion based on token position.
 * @method updateOcclusionForTiles - Updates occlusion for multiple tiles.
 * @method updateAlsoFadeTilesOcclusion - Updates occlusion for all alsoFade tiles.
 */
class TileOcclusionManager extends PlaceableHandler {
  constructor({ config, context, utils }) {
    super({ config, context, utils });
  }

  /**
   * Updates the occlusion mode of a given tile.
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
   * @param {Tile} tile - The tile object to update.
   * @param {Token} token - The token object to check against the tile.
   * @param {TileChecker} checker - The tile checker to use for position checking.
   */
  setAlsoFadeTileOcclusion(tile, token, checker) {
    if (checker.isTokenUnderTile(tile, token)) {
      let occlusionMode = { mode: this.const.TILE_OCCLUSION_MODES.FADE };
      this.updateOcclusion(tile, occlusionMode);
    } else {
      let occlusionMode = { mode: this.const.TILE_OCCLUSION_MODES.VISION };
      this.updateOcclusion(tile, occlusionMode);
    }
  }

  /**
   * Updates the occlusion for a list of tiles based on the provided token.
   *
   * @param {Array} tiles - An array of tile objects to update occlusion for.
   * @param {Object} token - The token object used to determine occlusion updates.
   * @param {TileGetter} getter - The tile getter to retrieve flag information.
   * @param {TileChecker} checker - The tile checker to use for position checking.
   */
  updateOcclusionForTiles(tiles, token, getter, checker) {
    tiles.forEach((tile) => {
      if (getter.getAlsoFadeFlag(tile)) {
        this.setAlsoFadeTileOcclusion(tile, token, checker);
      }
    });
  }

  /**
   * Updates the occlusion of tiles that should also fade based on the given token.
   *
   * This method filters the tiles that should also fade and updates their occlusion
   * using the provided token.
   *
   * @param {Object} token - The token used to update the occlusion of the tiles.
   * @param {TileGetter} getter - The tile getter to retrieve alsoFade tiles.
   * @param {TileChecker} checker - The tile checker to use for position checking.
   */
  updateAlsoFadeTilesOcclusion(token, getter, checker) {
    const alsoFadeTiles = getter.getAlsoFadeTiles();
    alsoFadeTiles.forEach((tile) => {
      this.setAlsoFadeTileOcclusion(tile, token, checker);
    });
  }
}

export default TileOcclusionManager;
