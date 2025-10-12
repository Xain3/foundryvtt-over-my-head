/**
 * @file alsoFadeHandler.mjs
 * @description Handler for managing tile fade behavior and scene/tile overrides in the Over My Head module
 * @path src/handlers/alsoFadeHandler.mjs
 */

import Handler from '#baseClasses/handler.mjs';
import SettingsHandler from './settingsHandler.mjs';
import TileHandler from './tileHandler.mjs';

/* eslint-disable no-unused-vars */
import Logger from '#utils/logger.mjs';
import Utilities from '#utils/utils.mjs';
import Context from '#contexts/context.mjs';
/* eslint-enable no-unused-vars */

/**
 * Handler for managing tile fade behavior and overrides.
 *
 * This class manages the "alsoFade" feature which allows tiles to fade along with
 * other placeables. It provides methods to get/set tile and scene flags, manage
 * tile collections, and handle overrides for both tiles and scenes.
 *
 * Uses a Set-based cache for better performance when managing tile collections.
 * Implements lazy getters for settings to avoid redundant lookups.
 *
 * @class AlsoFadeHandler
 * @extends Handler
 * @export
 *
 * **Public API:**
 * - `getTileAlsoFade(tile)` - Get the alsoFade flag for a tile
 * - `setTileAlsoFade(tile, value)` - Set the alsoFade flag for a tile (returns Promise)
 * - `toggleTileAlsoFade(tile)` - Toggle the alsoFade flag for a tile (returns Promise)
 * - `getSceneOverrides(scene)` - Get scene-level overrides
 * - `setSceneOverrides(scene, overrides)` - Set scene-level overrides (returns Promise)
 * - `setSceneOverride(scene, key, value)` - Set a single scene override (returns Promise)
 * - `getTileOverrides(tile)` - Get tile-level overrides
 * - `setTileOverrides(tile, overrides)` - Set tile-level overrides (returns Promise)
 * - `setTileOverride(tile, key, value)` - Set a single tile override (returns Promise)
 * - `collectAlsoFadeTiles(updateCache, returnValue)` - Collect all tiles with alsoFade enabled
 * - `alsoFadeTilesCache` - Get the cached Set of alsoFade tiles
 *
 * **Inherited from Handler:**
 * - `config` - Configuration object with manifest and constants
 * - `utils` - Utilities object with logger and other helpers
 * - `context` - Context object for state management
 */
class AlsoFadeHandler extends Handler {
  /**
   * Creates an instance of AlsoFadeHandler.
   *
   * @constructor
   * @param {Object} config - Configuration object
   * @param {Object} config.manifest - Module manifest
   * @param {string} config.manifest.title - Module title for flag namespacing
   * @param {Object} config.constants - Module constants
   * @param {Utilities} utils - Utilities object
   * @param {Logger} utils.logger - Logger instance for logging
   * @param {Context} context - Context object for state management
   * @throws {TypeError} When required parameters are missing or invalid
   */
  constructor(config, utils, context) {
    super({ config, utils, context });

    // Validate required parameters
    if (!config?.manifest?.title) {
      const errorMsg = 'Config must have a valid manifest with title';
      this.utils?.logger?.error(errorMsg);
      throw new TypeError(errorMsg);
    }

    if (!utils?.logger) {
      throw new TypeError('Utils must have a valid logger instance');
    }

    this.utils.logger.debug('Initializing AlsoFadeHandler');

    try {
      this.settingsHandler = new SettingsHandler(config, utils, context);
      this.tileHandler = new TileHandler(config, utils, context);
    } catch (error) {
      const errorMsg = `Failed to initialize handlers: ${this.utils.formatError?.(error) || error.message}`;
      this.utils.logger.error(errorMsg);
      throw error;
    }

    // Use Set for better performance when checking tile membership
    this._alsoFadeTilesCache = new Set();

    // Lazy-loaded settings cache
    this._settingsCache = null;

    // Hook to refresh settings when the refreshAlsoFadeSettings hook is called
    if (typeof Hooks !== 'undefined') {
      Hooks.on(this.utils.formatHookName('refreshAlsoFadeSettings'), () =>
        this.refreshSettings()
      );
    }

    this.utils.logger.debug('AlsoFadeHandler initialized successfully');
  }

  /**
   * Lazy getter for settings. Only loads settings once and caches them.
   *
   * @private
   * @returns {Object} Settings object with module configuration
   */
  get _settings() {
    if (!this._settingsCache) {
      try {
        this._settingsCache = {
          useModule: this.settingsHandler.getSettingValue('useModule'),
          debugMode: this.settingsHandler.getSettingValue('debugMode'),
          behaviorTokens:
            this.settingsHandler.getSettingValue('behaviorTokens'),
          behaviorParty: this.settingsHandler.getSettingValue('behaviorParty'),
          behaviorGM: this.settingsHandler.getSettingValue('behaviorGM'),
        };
        this.utils.logger.debug('Settings loaded and cached');
      } catch (error) {
        const errorMsg = `Failed to load settings: ${this.utils.formatError?.(error) || error.message}`;
        this.utils.logger.error(errorMsg);
        // Return empty object as fallback
        this._settingsCache = {
          useModule: false,
          debugMode: false,
          behaviorTokens: 'default',
          behaviorParty: 'default',
          behaviorGM: 'default',
        };
      }
    }
    return this._settingsCache;
  }

  /**
   * Gets the current alsoFade tiles cache as a Set.
   *
   * @returns {Set} Set of tiles with alsoFade enabled
   */
  get alsoFadeTilesCache() {
    return this._alsoFadeTilesCache;
  }

  /**
   * Refreshes the settings cache, forcing a reload on next access.
   *
   * @example
   * handler.refreshSettings();
   */
  refreshSettings() {
    this.utils.logger.debug('Refreshing settings');
    this._settingsCache = null;
  }

  /**
   * Gets the alsoFade flag value for a tile.
   *
   * @param {Object} tile - The tile object to check
   * @returns {boolean} True if alsoFade is enabled, false otherwise
   *
   * @example
   * const shouldFade = handler.getTileAlsoFade(myTile);
   */
  getTileAlsoFade(tile) {
    // Edge case: validate tile parameter
    if (!tile || typeof tile !== 'object') {
      this.utils.logger.warn(
        'getTileAlsoFade called with invalid tile parameter'
      );
      return false;
    }

    // Edge case: validate getFlag method exists
    if (typeof tile.getFlag !== 'function') {
      this.utils.logger.warn('Tile does not have getFlag method');
      return false;
    }

    try {
      const flagValue = tile.getFlag(this.config.manifest.title, 'alsoFade');
      this.utils.logger.debug(`Got alsoFade flag for tile: ${flagValue}`);
      return Boolean(flagValue);
    } catch (error) {
      const errorMsg = `Error getting alsoFade flag: ${this.utils.formatError?.(error) || error.message}`;
      this.utils.logger.error(errorMsg);
      return false;
    }
  }

  /**
   * Sets the alsoFade flag value for a tile.
   *
   * @param {Object} tile - The tile object to update
   * @param {boolean} value - The value to set for alsoFade
   * @returns {Promise<Object>|Promise<void>} Promise that resolves to the updated tile document
   *
   * @example
   * await handler.setTileAlsoFade(myTile, true);
   */
  async setTileAlsoFade(tile, value) {
    // Edge case: validate tile parameter
    if (!tile || typeof tile !== 'object') {
      const errorMsg = 'setTileAlsoFade called with invalid tile parameter';
      this.utils.logger.warn(errorMsg);
      return Promise.resolve();
    }

    // Edge case: validate setFlag method exists
    if (typeof tile.setFlag !== 'function') {
      const errorMsg = 'Tile does not have setFlag method';
      this.utils.logger.warn(errorMsg);
      return Promise.resolve();
    }

    // Edge case: validate value is boolean
    if (typeof value !== 'boolean') {
      this.utils.logger.warn(
        `setTileAlsoFade called with non-boolean value: ${value}`
      );
      value = Boolean(value);
    }

    try {
      this.utils.logger.debug(`Setting alsoFade flag to ${value} for tile`);
      const result = await tile.setFlag(
        this.config.manifest.title,
        'alsoFade',
        value
      );
      return result;
    } catch (error) {
      const errorMsg = `Error setting alsoFade flag: ${this.utils.formatError?.(error) || error.message}`;
      this.utils.logger.error(errorMsg);
      throw error;
    }
  }

  /**
   * Toggles the alsoFade flag value for a tile.
   *
   * @param {Object} tile - The tile object to toggle
   * @returns {Promise<Object>|Promise<void>} Promise that resolves to the updated tile document
   *
   * @example
   * await handler.toggleTileAlsoFade(myTile);
   */
  async toggleTileAlsoFade(tile) {
    // Edge case: validate tile parameter
    if (!tile || typeof tile !== 'object') {
      const errorMsg = 'toggleTileAlsoFade called with invalid tile parameter';
      this.utils.logger.warn(errorMsg);
      return Promise.resolve();
    }

    try {
      const current = this.getTileAlsoFade(tile);
      this.utils.logger.debug(
        `Toggling alsoFade flag from ${current} to ${!current}`
      );
      return await this.setTileAlsoFade(tile, !current);
    } catch (error) {
      const errorMsg = `Error toggling alsoFade flag: ${this.utils.formatError?.(error) || error.message}`;
      this.utils.logger.error(errorMsg);
      throw error;
    }
  }

  /**
   * Gets scene-level overrides for the module.
   *
   * @param {Object} scene - The scene object to check
   * @returns {Object} Object containing scene-level overrides
   *
   * @example
   * const overrides = handler.getSceneOverrides(game.scenes.current);
   */
  getSceneOverrides(scene) {
    // Edge case: validate scene parameter
    if (!scene || typeof scene !== 'object') {
      this.utils.logger.warn(
        'getSceneOverrides called with invalid scene parameter'
      );
      return {};
    }

    // Edge case: validate getFlag method exists
    if (typeof scene.getFlag !== 'function') {
      this.utils.logger.warn('Scene does not have getFlag method');
      return {};
    }

    try {
      const sceneFlags =
        scene.getFlag(this.config.manifest.title, 'overrides') || {};
      this.utils.logger.debug('Retrieved scene overrides');
      return { ...sceneFlags };
    } catch (error) {
      const errorMsg = `Error getting scene overrides: ${this.utils.formatError?.(error) || error.message}`;
      this.utils.logger.error(errorMsg);
      return {};
    }
  }

  /**
   * Sets scene-level overrides for the module.
   *
   * @param {Object} scene - The scene object to update
   * @param {Object} overrides - The overrides object to set
   * @returns {Promise<Object>|Promise<void>} Promise that resolves to the updated scene document
   *
   * @example
   * await handler.setSceneOverrides(game.scenes.current, { fadeDistance: 100 });
   */
  async setSceneOverrides(scene, overrides) {
    // Edge case: validate scene parameter
    if (!scene || typeof scene !== 'object') {
      const errorMsg = 'setSceneOverrides called with invalid scene parameter';
      this.utils.logger.warn(errorMsg);
      return Promise.resolve();
    }

    // Edge case: validate setFlag method exists
    if (typeof scene.setFlag !== 'function') {
      const errorMsg = 'Scene does not have setFlag method';
      this.utils.logger.warn(errorMsg);
      return Promise.resolve();
    }

    // Edge case: validate overrides parameter
    if (!overrides || typeof overrides !== 'object') {
      this.utils.logger.warn(
        'setSceneOverrides called with invalid overrides parameter'
      );
      overrides = {};
    }

    try {
      this.utils.logger.debug('Setting scene overrides');
      const result = await scene.setFlag(
        this.config.manifest.title,
        'overrides',
        overrides
      );
      return result;
    } catch (error) {
      const errorMsg = `Error setting scene overrides: ${this.utils.formatError?.(error) || error.message}`;
      this.utils.logger.error(errorMsg);
      throw error;
    }
  }

  /**
   * Sets a single scene-level override.
   *
   * @param {Object} scene - The scene object to update
   * @param {string} key - The override key
   * @param {*} value - The override value
   * @returns {Promise<Object>|Promise<void>} Promise that resolves to the updated scene document
   *
   * @example
   * await handler.setSceneOverride(game.scenes.current, 'fadeDistance', 100);
   */
  async setSceneOverride(scene, key, value) {
    // Edge case: validate scene parameter
    if (!scene || typeof scene !== 'object') {
      const errorMsg = 'setSceneOverride called with invalid scene parameter';
      this.utils.logger.warn(errorMsg);
      return Promise.resolve();
    }

    // Edge case: validate key parameter
    if (!key || typeof key !== 'string') {
      this.utils.logger.warn(
        'setSceneOverride called with invalid key parameter'
      );
      return Promise.resolve();
    }

    try {
      const overrides = this.getSceneOverrides(scene);
      overrides[key] = value;
      this.utils.logger.debug(`Setting scene override ${key} to ${value}`);
      return await this.setSceneOverrides(scene, overrides);
    } catch (error) {
      const errorMsg = `Error setting scene override: ${this.utils.formatError?.(error) || error.message}`;
      this.utils.logger.error(errorMsg);
      throw error;
    }
  }

  /**
   * Gets tile-level overrides.
   *
   * @param {Object} tile - The tile object to check
   * @returns {Object} Object containing tile-level overrides
   *
   * @example
   * const overrides = handler.getTileOverrides(myTile);
   */
  getTileOverrides(tile) {
    // Edge case: validate tile parameter
    if (!tile || typeof tile !== 'object') {
      this.utils.logger.warn(
        'getTileOverrides called with invalid tile parameter'
      );
      return {};
    }

    // Edge case: validate getFlag method exists
    if (typeof tile.getFlag !== 'function') {
      this.utils.logger.warn('Tile does not have getFlag method');
      return {};
    }

    try {
      const tileFlags =
        tile.getFlag(this.config.manifest.title, 'overrides') || {};
      this.utils.logger.debug('Retrieved tile overrides');
      return { ...tileFlags };
    } catch (error) {
      const errorMsg = `Error getting tile overrides: ${this.utils.formatError?.(error) || error.message}`;
      this.utils.logger.error(errorMsg);
      return {};
    }
  }

  /**
   * Sets tile-level overrides.
   *
   * @param {Object} tile - The tile object to update
   * @param {Object} overrides - The overrides object to set
   * @returns {Promise<Object>|Promise<void>} Promise that resolves to the updated tile document
   *
   * @example
   * await handler.setTileOverrides(myTile, { opacity: 0.5 });
   */
  async setTileOverrides(tile, overrides) {
    // Edge case: validate tile parameter
    if (!tile || typeof tile !== 'object') {
      const errorMsg = 'setTileOverrides called with invalid tile parameter';
      this.utils.logger.warn(errorMsg);
      return Promise.resolve();
    }

    // Edge case: validate setFlag method exists
    if (typeof tile.setFlag !== 'function') {
      const errorMsg = 'Tile does not have setFlag method';
      this.utils.logger.warn(errorMsg);
      return Promise.resolve();
    }

    // Edge case: validate overrides parameter
    if (!overrides || typeof overrides !== 'object') {
      this.utils.logger.warn(
        'setTileOverrides called with invalid overrides parameter'
      );
      overrides = {};
    }

    try {
      this.utils.logger.debug('Setting tile overrides');
      const result = await tile.setFlag(
        this.config.manifest.title,
        'overrides',
        overrides
      );
      return result;
    } catch (error) {
      const errorMsg = `Error setting tile overrides: ${this.utils.formatError?.(error) || error.message}`;
      this.utils.logger.error(errorMsg);
      throw error;
    }
  }

  /**
   * Sets a single tile-level override.
   *
   * @param {Object} tile - The tile object to update
   * @param {string} key - The override key
   * @param {*} value - The override value
   * @returns {Promise<Object>|Promise<void>} Promise that resolves to the updated tile document
   *
   * @example
   * await handler.setTileOverride(myTile, 'opacity', 0.5);
   */
  async setTileOverride(tile, key, value) {
    // Edge case: validate tile parameter
    if (!tile || typeof tile !== 'object') {
      const errorMsg = 'setTileOverride called with invalid tile parameter';
      this.utils.logger.warn(errorMsg);
      return Promise.resolve();
    }

    // Edge case: validate key parameter
    if (!key || typeof key !== 'string') {
      this.utils.logger.warn(
        'setTileOverride called with invalid key parameter'
      );
      return Promise.resolve();
    }

    try {
      const overrides = this.getTileOverrides(tile);
      overrides[key] = value;
      this.utils.logger.debug(`Setting tile override ${key} to ${value}`);
      return await this.setTileOverrides(tile, overrides);
    } catch (error) {
      const errorMsg = `Error setting tile override: ${this.utils.formatError?.(error) || error.message}`;
      this.utils.logger.error(errorMsg);
      throw error;
    }
  }

  /**
   * Collects all tiles that have the alsoFade flag enabled.
   *
   * @param {boolean} [updateCache=true] - Whether to update the internal cache
   * @param {boolean} [returnValue=true] - Whether to return the array of tiles
   * @returns {Array|undefined} Array of tiles with alsoFade enabled, or undefined if returnValue is false
   *
   * @example
   * // Update cache and get tiles
   * const fadeTiles = handler.collectAlsoFadeTiles();
   *
   * // Only update cache, don't return
   * handler.collectAlsoFadeTiles(true, false);
   *
   * // Get tiles without updating cache
   * const fadeTiles = handler.collectAlsoFadeTiles(false, true);
   */
  collectAlsoFadeTiles(updateCache = true, returnValue = true) {
    try {
      this.utils.logger.debug(
        `Collecting alsoFade tiles (updateCache: ${updateCache}, returnValue: ${returnValue})`
      );

      const tiles = this.tileHandler.getAll();

      // Edge case: no tiles available
      if (!tiles || !Array.isArray(tiles) || tiles.length === 0) {
        this.utils.logger.debug('No tiles found');
        if (updateCache) {
          this._alsoFadeTilesCache.clear();
        }
        return returnValue ? [] : undefined;
      }

      const alsoFadeTiles = tiles.filter((tile) => {
        try {
          return this.getTileAlsoFade(tile);
        } catch (error) {
          this.utils.logger.warn(
            `Error checking tile alsoFade status: ${error.message}`
          );
          return false;
        }
      });

      this.utils.logger.debug(
        `Found ${alsoFadeTiles.length} tiles with alsoFade enabled`
      );

      if (updateCache) {
        this._alsoFadeTilesCache.clear();
        alsoFadeTiles.forEach((tile) => this._alsoFadeTilesCache.add(tile));
        this.utils.logger.debug('Updated alsoFade tiles cache');
      }

      return returnValue ? alsoFadeTiles : undefined;
    } catch (error) {
      const errorMsg = `Error collecting alsoFade tiles: ${this.utils.formatError?.(error) || error.message}`;
      this.utils.logger.error(errorMsg);
      // Return empty result on error
      if (updateCache) {
        this._alsoFadeTilesCache.clear();
      }
      return returnValue ? [] : undefined;
    }
  }
}

export default AlsoFadeHandler;
