/**
 * @file alsoFadeHandler.mjs
 * @description Handles tiles that should also fade in the Over My Head module.
 * @path src/handlers/alsoFadeHandler.mjs
 */

import Handler from '@/baseClasses/handler.mjs';

/**
 * @class AlsoFadeHandler
 * @extends Handler
 * @description Manages tiles marked for additional fading behavior in scenes.
 * @export
 *
 * @property {Object} handlers - Object containing handler instances (settings, tile, scene).
 * @property {Object} settings - Object with functions to get setting values.
 * @property {Set} alsoFadeTilesCache - Set of tiles marked with the 'alsoFade' flag.
 * @property {string} flagNamespace - Module identifier used for flag operations.
 */
class AlsoFadeHandler extends Handler {
  /**
   * @description Initializes the AlsoFadeHandler with necessary dependencies.
   * @param {Object} params - The initialization parameters.
   * @param {Object} params.config - The configuration object.
   * @param {Object} params.utils - The utilities object.
   * @param {Object} params.context - The context object.
   * @param {Object} params.handlers - Object containing handler instances.
   * @param {SettingsHandler} params.handlers.settings - The settings handler instance.
   * @param {TileHandler} params.handlers.tile - The tile handler instance.
   * @param {SceneHandler} params.handlers.scene - The scene handler instance.
   * @constructor
   */
  constructor({
    config,
    utils,
    context,
    handlers: { settings, tile, scene },
  } = {}) {
    super({ config, utils, context });

    this.handlers = { settings, tile, scene };
    this.settings = {
      useModule: () => this.handlers.settings.getSettingValue('useModule'),
      debugMode: () => this.handlers.settings.getSettingValue('debugMode'),
      behaviorTokens: () =>
        this.handlers.settings.getSettingValue('behaviorTokens'),
      behaviorParty: () =>
        this.handlers.settings.getSettingValue('behaviorParty'),
      behaviorGM: () => this.handlers.settings.getSettingValue('behaviorGM'),
    };
    this.alsoFadeTilesCache = [];
    this.flagNamespace = this.config.manifest.id;
  }

  /**
   * @private
   * @description Handles updating and returning the alsoFadeTiles array.
   * @param {boolean} updateProperty - Whether to update the alsoFadeTiles property.
   * @param {boolean} returnValue - Whether to return the value.
   * @param {Array} [value=[]] - The value to set.
   * @returns {Array|undefined} The alsoFadeTiles if returnValue is true.
   */
  #finalizeCollection(updateProperty, returnValue, value = []) {
    if (updateProperty) {
      this.alsoFadeTilesCache = value;
    }
    return returnValue ? value : undefined;
  }

  /**
   * @private
   * Gets the overrides for a scene.
   * @param {Scene} scene - The scene object.
   * @returns {Object} The overrides object.
   */
  #getSceneOverrides(scene) {
    const overrides = {};
    if (!scene) return overrides;

    const sceneFlags = scene.getFlag(this.flagNamespace, 'overrides') || {};
    return { ...overrides, ...sceneFlags };
  }

  /**
   * @private
   * Sets the overrides for a scene.
   * @param {Scene} scene - The scene object.
   * @param {Object} overrides - The overrides to set.
   * @returns {Promise} A promise that resolves when the overrides are set.
   */
  #setSceneOverrides(scene, overrides) {
    if (!scene) return;
    return scene.setFlag(this.flagNamespace, 'overrides', overrides);
  }

  /**
   * @private
   * Sets a specific override for a scene.
    this.handlers = { settings, tile, scene };
    this.flagNamespace = this.#resolveFlagNamespace(config?.manifest);
    this.settings = this.#buildSettingsProxy();
    this.alsoFadeTilesCache = new Set();

  /**
   * @private
   * @private
   * @description Creates the settings proxy with defensive fallbacks.
   * @returns {Object} Proxy exposing module settings accessors.
   */
  #buildSettingsProxy() {
    const settingsHandler = this.handlers.settings;
    const getSettingValue = (key) => {
      if (!settingsHandler?.getSettingValue) {
        this.#logDebug(
          `Settings handler is unavailable while retrieving setting '${key}'.`
        );
        return undefined;
      }

      try {
        return settingsHandler.getSettingValue(key);
      } catch (error) {
        this.#logError(
          `Failed to read setting '${key}' in AlsoFadeHandler.getSettingValue`,
          error
        );
        return undefined;
      }
    };

    return {
      useModule: () => getSettingValue('useModule'),
      debugMode: () => Boolean(getSettingValue('debugMode')),
      behaviorTokens: () => getSettingValue('behaviorTokens'),
      behaviorParty: () => getSettingValue('behaviorParty'),
      behaviorGM: () => getSettingValue('behaviorGM'),
    };
  }

  /**
   * @private
   * Resolves the namespace used for storing flags.
   * @param {Object} manifest - Module manifest.
   * @returns {string} The module identifier for flags.
   */
  #resolveFlagNamespace(manifest) {
    if (!manifest) {
      this.#logWarning('Manifest is missing while resolving flag namespace.');
      return '';
    }

    if (manifest.id) {
      return manifest.id;
    }

    if (manifest.title) {
      this.#logWarning(
        'Manifest.id is missing; falling back to manifest.title for flags.'
      );
      return manifest.title;
    }

    this.#logWarning(
      'Manifest.id and manifest.title are missing; flag operations may fail.'
    );
    return '';
  }

  /**
   * @private
   * Logs a debug message using module utilities.
   * @param {string} message - Message to log.
   */
  #logDebug(message) {
    this.utils?.logDebug?.(message);
  }

  /**
   * @private
   * Logs an informational message using module utilities.
   * @param {string} message - Message to log.
   */
  #logInfo(message) {
    this.utils?.log?.(message);
  }

  /**
   * @private
   * Logs a warning message using module utilities.
   * @param {string} message - Message to log.
   */
  #logWarning(message) {
    this.utils?.logWarning?.(message);
  }

  /**
   * @private
   * Logs an error message using module utilities.
   * @param {string} message - Message to log.
   * @param {Error} [error] - Optional error for context.
   */
  #logError(message, error) {
    if (error) {
      this.utils?.logError?.(`${message}: ${error.message}`);
      return;
    }

    this.utils?.logError?.(message);
  }

  /**
   * @private
   * Retrieves overrides stored on a document.
   * @param {Object} document - Tile or scene document.
   * @returns {Object} Overrides object.
   */
  #getOverridesFromDocument(document) {
    if (!document?.getFlag) {
      this.#logDebug('Attempted to read overrides from an invalid document.');
      return {};
    }

    try {
      return document.getFlag(this.flagNamespace, 'overrides') || {};
    } catch (error) {
      this.#logError('Failed to retrieve overrides from document', error);
      return {};
    }
  }

  /**
   * @private
   * Writes overrides to a document.
   * @param {Object} document - Tile or scene document.
   * @param {Object} overrides - Overrides to set.
   * @returns {Promise<*>} Promise resolving when persisted.
   */
  #setOverridesOnDocument(document, overrides) {
    if (!document?.setFlag) {
      this.#logDebug('Attempted to write overrides to an invalid document.');
      return Promise.resolve(undefined);
    }

    const safeOverrides = overrides && typeof overrides === 'object' ? overrides : {};

    try {
      return document.setFlag(this.flagNamespace, 'overrides', safeOverrides);
    } catch (error) {
      this.#logError('Failed to persist overrides on document', error);
      return Promise.resolve(undefined);
    }
  }

  /**
   * @private
   * Resolves the document (tile or scene) based on the type and provided target.
   * @param {string} type - Target type ('tile' or 'scene').
   * @param {Object} target - Explicit target document.
   * @returns {Object|null} Resolved document or null when unavailable.
   */
  #resolveTargetDocument(type, target) {
    if (!['tile', 'scene'].includes(type)) {
      this.#logWarning(`Unsupported target type '${type}' in AlsoFadeHandler.`);
      return null;
    }

    if (target) {
      return target;
    }

    const handler = this.handlers[type];
    if (!handler) {
      this.#logWarning(
        `Missing handler for type '${type}' while resolving target document.`
      );
      return null;
    }

    if (!handler.current) {
      this.#logDebug(
        `Handler for type '${type}' does not have a current document set.`
      );
    }

    return handler.current;
  }

  /**
   * @private
   * Updates the alsoFade cache and prepares the return value.
   * @param {boolean} updateProperty - Whether to update the cache.
   * @param {boolean} returnValue - Whether to return the cached tiles.
   * @param {Array} [value=[]] - Tiles to store in the cache.
   * @returns {Array|undefined} Cached tiles as array when requested.
   */
  #handleAlsoFadeTilesOutput(updateProperty, returnValue, value = []) {
    const normalized = Array.isArray(value) ? value : [];

    if (updateProperty) {
      this.alsoFadeTilesCache = new Set(normalized);
      this.#logDebug(
        `AlsoFade tiles cache updated with ${this.alsoFadeTilesCache.size} entries.`
      );
    }

    if (!returnValue) {
      return undefined;
    }

    return Array.from(this.alsoFadeTilesCache);
  }

  /**
   * Gets the overrides for a scene or tile.
   * @param {string} type - The type of target ('tile' or 'scene').
   * @param {Object} [target] - The target object (tile or scene). If not provided, uses current from handlers.
   * @returns {Object} The overrides object.
   */
  getOverrides(type, target) {
    const document = this.#resolveTargetDocument(type, target);
    if (!document) {
      return {};
    }

    return this.#getOverridesFromDocument(document);
  }

  /**
   * Sets the overrides for a scene or tile.
   * @param {string} type - The type of target ('tile' or 'scene').
   * @param {Object} [target] - The target object (tile or scene). If not provided, uses current from handlers.
   * @param {Object} overrides - The overrides to set.
   * @returns {Promise<*>} A promise that resolves when the overrides are set.
   */
  setOverrides(type, target, overrides) {
    const document = this.#resolveTargetDocument(type, target);
    if (!document) {
      return Promise.resolve(undefined);
    }

    return this.#setOverridesOnDocument(document, overrides);
  }

  /**
   * Sets a specific override for a scene or tile.
   * @param {string} type - The type of target ('tile' or 'scene').
   * @param {Object} [target] - The target object (tile or scene). If not provided, uses current from handlers.
   * @param {string} key - The key of the override.
   * @param {*} value - The value of the override.
   * @returns {Promise<*>} A promise that resolves when the override is set.
   */
  setOverride(type, target, key, value) {
    const document = this.#resolveTargetDocument(type, target);
    if (!document) {
      return Promise.resolve(undefined);
    }

    const overrides = {
      ...this.#getOverridesFromDocument(document),
      [key]: value,
    };

    return this.#setOverridesOnDocument(document, overrides);
  }

  /**
   * Gets the 'alsoFade' flag value for a tile.
   * @param {Object} tile - The tile object.
   * @returns {boolean} True if the tile has the 'alsoFade' flag set.
   */
  getAlsoFade(tile) {
    if (!tile?.getFlag) {
      this.#logDebug('Attempted to read alsoFade flag from invalid tile.');
      return false;
    }

    try {
      return Boolean(tile.getFlag(this.flagNamespace, 'alsoFade'));
    } catch (error) {
      this.#logError('Failed to read alsoFade flag from tile', error);
      return false;
    }
  }

  /**
   * Sets the 'alsoFade' flag on a tile.
   * @param {Object} tile - The tile object.
   * @param {boolean} value - The value to set for the flag.
   * @returns {Promise<*>} A promise that resolves when the flag is set.
   */
  setAlsoFade(tile, value) {
    if (!tile?.setFlag) {
      this.#logDebug('Attempted to write alsoFade flag to invalid tile.');
      return Promise.resolve(undefined);
    }

    try {
      return tile.setFlag(this.flagNamespace, 'alsoFade', Boolean(value));
    } catch (error) {
      this.#logError('Failed to update alsoFade flag on tile', error);
      return Promise.resolve(undefined);
    }
  }

  /**
   * Toggles the 'alsoFade' flag on a tile.
   * @param {Object} tile - The tile object.
   * @returns {Promise<*>} A promise that resolves when the flag is toggled.
   */
  toggleAlsoFade(tile) {
    if (!tile) {
      this.#logDebug('Attempted to toggle alsoFade flag with missing tile.');
      return Promise.resolve(undefined);
    }

    const current = this.getAlsoFade(tile);
    return this.setAlsoFade(tile, !current);
  }

  /**
   * Collects all tiles that have the 'alsoFade' flag set.
   * @param {boolean} [updateProperty=true] - Whether to update the alsoFadeTiles property.
   * @param {boolean} [returnValue=true] - Whether to return the collected tiles.
   * @returns {Array|undefined} The collected alsoFadeTiles if returnValue is true.
   */
  collectAlsoFadeTiles(updateProperty = true, returnValue = true) {
    const tileHandler = this.handlers.tile;
    const tiles = tileHandler?.getAll?.() || [];

    if (tiles.length === 0) {
      this.#logDebug('No tiles available while collecting alsoFade tiles.');
      return this.#handleAlsoFadeTilesOutput(updateProperty, returnValue);
    }

    const alsoFadeTiles = tiles.filter((tile) => this.getAlsoFade(tile));
    if (this.settings.debugMode()) {
      this.#logInfo(
        `Collected ${alsoFadeTiles.length} alsoFade tiles out of ${tiles.length}.`
      );
    }

    return this.#handleAlsoFadeTilesOutput(
      updateProperty,
      returnValue,
      alsoFadeTiles
    );
  }
