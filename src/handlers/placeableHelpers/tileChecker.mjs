/**
 * @file tileChecker.mjs
 * @description Provides checking utilities specific to tiles in the Foundry VTT environment.
 * @path src/handlers/placeableHelpers/tileChecker.mjs
 */

import PlaceableChecker from './placeableChecker.mjs';

/**
 * @description Provides checking utilities specific to tiles in the Foundry VTT environment.
 * @export
 *
 * @extends PlaceableChecker
 */
class TileChecker extends PlaceableChecker {
  /**
   * @param {Object} config - The configuration object.
   * @param {Object} context - The context object.
   * @param {Object} utils - The utilities object.
   * @param {Object} placeableGetter - The placeable getter object.
   */
  constructor(config, context, utils, placeableGetter) {
    super(config, context, utils, placeableGetter);
  }
}

export default TileChecker;
