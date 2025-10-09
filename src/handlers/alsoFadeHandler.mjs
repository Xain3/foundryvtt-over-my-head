import Handler from '@/baseClasses/handler.mjs';
import SettingsHandler from './settingsHandler.mjs';
import TileHandler from './tileHandler.mjs';

class alsoFadeHandler extends Handler {
  constructor(config, utils, context) {
    super(config, utils, context);

    this.settingsHandler = new SettingsHandler(config, utils, context);
    this.settings = {
      useModule: this.settingsHandler.getSettingValue('useModule'),
      debugMode: this.settingsHandler.getSettingValue('debugMode'),
      behaviorTokens: this.settingsHandler.getSettingValue('behaviorTokens'),
      behaviorParty: this.settingsHandler.getSettingValue('behaviorParty'),
      behaviorGM: this.settingsHandler.getSettingValue('behaviorGM'),
    };
    this.tileHandler = new TileHandler(config, utils, context);
    this.alsoFadeTiles = [];
  }

  #handleAlsoFadeTilesOutput(updateProperty, returnValue, value = []) {
    if (updateProperty) {
      this.alsoFadeTiles = value;
    }
    return returnValue ? value : undefined;
  }

  getTileAlsoFade(tile) {
    if (!tile) return false;
    return tile.getFlag(this.config.manifest.title, 'alsoFade');
  }

  setTileAlsoFade(tile, value) {
    if (!tile) return;
    return tile.setFlag(this.config.manifest.title, 'alsoFade', value);
  }

  toggleTileAlsoFade(tile) {
    if (!tile) return;
    const current = this.getTileAlsoFade(tile);
    return this.setTileAlsoFade(tile, !current);
  }

  getSceneOverrides(scene) {
    const overrides = {};
    if (!scene) return overrides;

    const sceneFlags =
      scene.getFlag(this.config.manifest.title, 'overrides') || {};
    return { ...overrides, ...sceneFlags };
  }

  setSceneOverrides(scene, overrides) {
    if (!scene) return;
    return scene.setFlag(this.config.manifest.title, 'overrides', overrides);
  }

  setSceneOverride(scene, key, value) {
    if (!scene) return;
    const overrides = this.getSceneOverrides(scene);
    overrides[key] = value;
    return this.setSceneOverrides(scene, overrides);
  }

  getTileOverrides(tile) {
    const overrides = {};
    if (!tile) return overrides;

    const tileFlags =
      tile.getFlag(this.config.manifest.title, 'overrides') || {};
    return { ...overrides, ...tileFlags };
  }

  setTileOverrides(tile, overrides) {
    if (!tile) return;
    return tile.setFlag(this.config.manifest.title, 'overrides', overrides);
  }

  setTileOverride(tile, key, value) {
    if (!tile) return;
    const overrides = this.getTileOverrides(tile);
    overrides[key] = value;
    return this.setTileOverrides(tile, overrides);
  }

  collectAlsoFadeTiles(updateProperty = true, returnValue = true) {
    const tiles = this.tileHandler.getAll();
    if (!tiles || tiles.length === 0) {
      return this.#handleAlsoFadeTilesOutput(updateProperty, returnValue);
    }

    const alsoFadeTiles = tiles.filter((tile) => this.getTileAlsoFade(tile));
    return this.#handleAlsoFadeTilesOutput(
      updateProperty,
      returnValue,
      alsoFadeTiles
    );
  }
}

export default alsoFadeHandler;
