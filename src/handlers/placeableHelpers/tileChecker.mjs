import PlaceableChecker from './placeableChecker.mjs';

class TileChecker extends PlaceableChecker {
  constructor(config, context, utils, placeableGetter) {
    super(config, context, utils, placeableGetter);
  }
}

export default TileChecker;
