import PlaceableHandler from './placeableHandler.mjs';
import TokenChecker from './placeableHelpers/tokenChecker.mjs';
import TokenListener from './placeableHelpers/tileListener.mjs';

const PLACEABLE_TYPE = 'token';

class TokenHandler extends PlaceableHandler {
  constructor(config, context, utils) {
    super(config, context, utils, PLACEABLE_TYPE);
    this.checker = new TokenChecker(config, context, utils, this.getter);
    this.listener = new TokenListener();
  }
}

export default TokenHandler;
