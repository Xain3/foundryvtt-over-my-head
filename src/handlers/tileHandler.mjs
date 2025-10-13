import PlaceableHandler from './placeableHandler.mjs';
import TileChecker from './placeableHelpers/tileChecker.mjs';
import TileListener from './placeableHelpers/tokenListener.mjs';

const PLACEABLE_TYPE = 'tiles';

class TileHandler extends PlaceableHandler {
  constructor(config, context, utils, type = PLACEABLE_TYPE) {
    super(config, context, utils, type);
    this.checker = new TileChecker(config, context, utils, this.getter);
    this.listener = new TileListener();
  }
}

export default TileHandler;
