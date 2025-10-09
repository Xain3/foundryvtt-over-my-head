import PlaceableHandler from './placeableHandler.mjs';
import TileChecker from './placeableHelpers/tileChecker.mjs';

const PLACEABLE_TYPE = 'tiles';

class TileHandler extends PlaceableHandler {
  constructor(config, context, utils, type = PLACEABLE_TYPE) {
    super(config, context, utils, type);
    this.checker = new TileChecker(config, context, utils, this.getter);
  }
}

export default TileHandler;
