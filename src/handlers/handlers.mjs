/**
 * @file handlers.mjs
 * @description Aggregates and initializes all handler classes for the module.
 * @path src/handlers/handlers.mjs
 */

import Handler from '../baseClasses/handler.mjs';
import PlaceableHandler from './placeableHandler.mjs';
import SettingsHandler from './settingsHandler.mjs';

/**
 * Handlers
 *
 * Aggregates and initializes all handler classes for the module. Provides a single entry point
 * for accessing handler instances (e.g., settings handler) and convenience methods for common
 * operations like debug mode setting management.
 *
 * @class Handlers
 * @extends Handler
 * @export
 *
 * **Public API:**
 * - `constructor(config, utils, context)` - Creates handlers instance with settings handler
 * - `registerDebugModeSetting()` - Register only the debugMode setting if present
 * - `hasDebugModeSettingConfig()` - Check if debugMode setting exists in parsed settings
 * - `getDebugModeSettingConfig()` - Get the debugMode setting configuration if available
 * - `registerSettingByKey(key)` - Register a single setting by its key
 * - `hasSettingConfigByKey(key)` - Check if a setting with the given key exists
 * - `getSettingConfigByKey(key)` - Get a setting configuration by its key
 * - `settings` - SettingsHandler instance for complete settings management
 * - `placeable` - PlaceableHandler instance for placeable entity operations
 * - `setCurrentPlaceable(placeable)` - Set the current placeable entity
 * - `getCurrentPlaceable()` - Get the current placeable entity
 * - `getAllPlaceables(placeableType, updateProperty, returnValue)` - Get all placeable entities
 * - `getPlaceableCorner(corner, placeable)` - Get the corner of a placeable entity
 * - `getPlaceableCenter(placeable)` - Get the center of a placeable entity
 * - `getPlaceableElevation(placeable)` - Get the elevation of a placeable entity
 * - `getPlaceableRectBounds(placeable)` - Get the rectangular bounds of a placeable entity
 * - `getPlaceablePosition(placeable, placeableManager, use)` - Get the position of a placeable entity
 * - `isPlaceableSelected(placeable)` - Check if a placeable entity is selected
 * - `isPlaceableUnder(target, reference, targetManager, referenceManager, targetUse, referenceUse, checkType)` - Check if target is under reference
 * - `isPlaceableOver(target, reference, targetManager, referenceManager, targetUse, referenceUse, checkType)` - Check if target is over reference
 */
class Handlers extends Handler {
  /**
   * Create a Handlers instance.
   *
   * @param {Object} args - Arguments object
   * @param {Object} args.config - Module configuration object.
   * @param {Object} args.utils - Utilities facade providing logging and error formatting.
   * @param {Object} args.context - Execution context object.
   * @throws {Error} If any required parameter is missing or invalid.
   */
  constructor({ config, utils, context }) {
    Handlers.#validateHandlerParameters(config, utils, context);
    super({ config, utils, context });
    /**
     * The settings handler instance.
     * @type {SettingsHandler}
     * @public
     */
    this.settings = new SettingsHandler({ config: this.config, utils: this.utils, context: this.context });
    this.placeable = new PlaceableHandler({
      config: this.config,
      context: this.context,
      utils: this.utils
    });
  }

  /**
   * Convenience method to register the debugMode setting specifically.
   * Delegates to the settings handler's registerDebugModeSetting method.
   *
   * @returns {Object} Registration result from SettingsHandler.registerDebugModeSetting()
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const result = handlers.registerDebugModeSetting();
   * if (result.success) {
   *   console.log('Debug mode setting registered successfully');
   * }
   * ```
   */
  registerDebugModeSetting() {
    return this.settings.registerDebugModeSetting();
  }

  /**
   * Convenience method to check if debugMode setting exists.
   * Delegates to the settings handler's hasDebugModeSettingConfig method.
   *
   * @returns {boolean} True if debugMode setting exists, false otherwise
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * if (handlers.hasDebugModeSettingConfig()) {
   *   handlers.registerDebugModeSetting();
   * }
   * ```
   */
  hasDebugModeSettingConfig() {
    return this.settings.hasDebugModeSettingConfig();
  }

  /**
   * Convenience method to get the debugMode setting configuration.
   * Delegates to the settings handler's getDebugModeSettingConfig method.
   *
   * @returns {Object|null} The debugMode setting object if found, null otherwise
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const debugSetting = handlers.getDebugModeSettingConfig();
   * if (debugSetting) {
   *   console.log('Debug mode setting found with default:', debugSetting.config.default);
   * }
   * ```
   */
  getDebugModeSettingConfig() {
    return this.settings.getDebugModeSettingConfig();
  }

  /**
   * Convenience method to register a setting by its key.
   * Delegates to the settings handler's registerSettingByKey method.
   *
   * @param {string} key - The key of the setting to register
   * @returns {Object} Registration result from SettingsHandler.registerSettingByKey()
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const result = handlers.registerSettingByKey('myCustomSetting');
   * if (result.success) {
   *   console.log('Setting registered successfully');
   * }
   * ```
   */
  registerSettingByKey(key) {
    return this.settings.registerSettingByKey(key);
  }

  /**
   * Convenience method to check if a setting with the specified key exists.
   * Delegates to the settings handler's hasSettingConfigByKey method.
   *
   * @param {string} key - The key of the setting to check for
   * @returns {boolean} True if setting with the key exists, false otherwise
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * if (handlers.hasSettingConfigByKey('myCustomSetting')) {
   *   handlers.registerSettingByKey('myCustomSetting');
   * }
   * ```
   */
  hasSettingConfigByKey(key) {
    return this.settings.hasSettingConfigByKey(key);
  }

  /**
   * Convenience method to get a setting configuration by its key.
   * Delegates to the settings handler's getSettingConfigByKey method.
   *
   * @param {string} key - The key of the setting to retrieve
   * @returns {Object|null} The setting object if found, null otherwise
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const customSetting = handlers.getSettingConfigByKey('myCustomSetting');
   * if (customSetting) {
   *   console.log('Setting found with default:', customSetting.config.default);
   * }
   * ```
   */
  getSettingConfigByKey(key) {
    return this.settings.getSettingConfigByKey(key);
  }

  /**
   * Convenience method to check if a setting exists in Foundry VTT's game.settings system.
   * Delegates to the settings handler's hasSetting method.
   *
   * @param {string} key - The key of the setting to check for
   * @returns {boolean} True if the setting exists in game.settings, false otherwise
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * if (handlers.hasSetting('debugMode')) {
   *   console.log('Debug mode setting is available');
   * }
   * ```
   */
  hasSetting(key) {
    return this.settings.hasSetting(key);
  }

  /**
   * Convenience method to get the value of a setting from Foundry VTT's game.settings system.
   * Delegates to the settings handler's getSettingValue method.
   *
   * @param {string} key - The key of the setting to retrieve
   * @returns {any|undefined} The setting value if it exists, undefined otherwise
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const debugMode = handlers.getSettingValue('debugMode');
   * if (debugMode !== undefined) {
   *   console.log('Debug mode is:', debugMode);
   * }
   * ```
   */
  getSettingValue(key) {
    return this.settings.getSettingValue(key);
  }

  /**
   * Convenience method to check if the debugMode setting exists in game.settings.
   * Delegates to the settings handler's hasDebugModeSetting method.
   *
   * @returns {boolean} True if the debugMode setting exists in game.settings, false otherwise
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * if (handlers.hasDebugModeSetting()) {
   *   console.log('Debug mode setting is available');
   * }
   * ```
   */
  hasDebugModeSetting() {
    return this.settings.hasDebugModeSetting();
  }

  /**
   * Convenience method to get the debugMode setting value from game.settings.
   * Delegates to the settings handler's getDebugModeSettingValue method.
   *
   * @returns {boolean|undefined} The debugMode setting value if it exists, undefined otherwise
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const debugMode = handlers.getDebugModeSettingValue();
   * if (debugMode) {
   *   console.log('Debug mode is enabled');
   * }
   * ```
   */
  getDebugModeSettingValue() {
    return this.settings.getDebugModeSettingValue();
  }

  // PLACEABLE CONVENIENCE METHODS

  /**
   * Convenience method to set the current placeable entity.
   * Delegates to the placeable handler's setCurrent method.
   *
   * @param {Object} placeable - The placeable to set as current
   * @returns {Object} The current placeable
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const result = handlers.setCurrentPlaceable(somePlaceable);
   * ```
   */
  setCurrentPlaceable(placeable) {
    return this.placeable.setCurrent(placeable);
  }

  /**
   * Convenience method to get the current placeable entity.
   * Delegates to the placeable handler's getCurrent method.
   *
   * @returns {Object|null} The current placeable
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const current = handlers.getCurrentPlaceable();
   * ```
   */
  getCurrentPlaceable() {
    return this.placeable.getCurrent();
  }

  /**
   * Convenience method to get all placeable entities.
   * Delegates to the placeable handler's getAll method.
   *
   * @param {string} [placeableType] - Type of placeables to retrieve
   * @param {boolean} [updateProperty=true] - Whether to update the internal list
   * @param {boolean} [returnValue=true] - Whether to return the list
   * @returns {Array|undefined} List of placeables if returnValue is true
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const allTokens = handlers.getAllPlaceables('Token');
   * ```
   */
  getAllPlaceables(placeableType, updateProperty = true, returnValue = true) {
    return this.placeable.getAll(placeableType, updateProperty, returnValue);
  }

  /**
   * Convenience method to get the corner of a placeable entity.
   * Delegates to the placeable handler's getCorner method.
   *
   * @param {string} corner - The corner to retrieve
   * @param {Object} placeable - The placeable entity
   * @returns {Object} The corner of the placeable
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const topLeft = handlers.getPlaceableCorner('topLeft', somePlaceable);
   * ```
   */
  getPlaceableCorner(corner, placeable) {
    return this.placeable.getCorner(corner, placeable);
  }

  /**
   * Convenience method to get the center of a placeable entity.
   * Delegates to the placeable handler's getCenter method.
   *
   * @param {Object} placeable - The placeable entity
   * @returns {Object} The center of the placeable
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const center = handlers.getPlaceableCenter(somePlaceable);
   * ```
   */
  getPlaceableCenter(placeable) {
    return this.placeable.getCenter(placeable);
  }

  /**
   * Convenience method to get the elevation of a placeable entity.
   * Delegates to the placeable handler's getElevation method.
   *
   * @param {Object} placeable - The placeable entity
   * @returns {number} The elevation of the placeable
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const elevation = handlers.getPlaceableElevation(somePlaceable);
   * ```
   */
  getPlaceableElevation(placeable) {
    return this.placeable.getElevation(placeable);
  }

  /**
   * Convenience method to get the rectangular bounds of a placeable entity.
   * Delegates to the placeable handler's getRectBounds method.
   *
   * @param {Object} placeable - The placeable entity
   * @returns {Object} The rectangular bounds of the placeable
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const bounds = handlers.getPlaceableRectBounds(somePlaceable);
   * ```
   */
  getPlaceableRectBounds(placeable) {
    return this.placeable.getRectBounds(placeable);
  }

  /**
   * Convenience method to get the position of a placeable entity.
   * Delegates to the placeable handler's getPosition method.
   *
   * @param {Object} placeable - The placeable entity
   * @param {Object} placeableManager - The manager of the placeable
   * @param {string} [use='center'] - The use case for the position
   * @returns {Object} The position of the placeable
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const position = handlers.getPlaceablePosition(somePlaceable, manager);
   * ```
   */
  getPlaceablePosition(placeable, placeableManager, use = 'center') {
    return this.placeable.getPosition(placeable, placeableManager, use);
  }

  /**
   * Convenience method to check if a placeable entity is selected.
   * Delegates to the placeable handler's isSelected method.
   *
   * @param {Object} placeable - The placeable entity
   * @returns {boolean} True if the placeable is selected, false otherwise
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const isSelected = handlers.isPlaceableSelected(somePlaceable);
   * ```
   */
  isPlaceableSelected(placeable) {
    return this.placeable.isSelected(placeable);
  }

  /**
   * Convenience method to check if a target placeable is under a reference placeable.
   * Delegates to the placeable handler's isUnder method.
   *
   * @param {Object} target - The target placeable
   * @param {Object} reference - The reference placeable
   * @param {Object} targetManager - The manager of the target placeable
   * @param {Object} referenceManager - The manager of the reference placeable
   * @param {string} [targetUse='center'] - The use case for the target position
   * @param {string} [referenceUse='rectangle'] - The use case for the reference position
   * @param {string} [checkType='under'] - The type of check to perform
   * @returns {boolean} True if the target is under the reference, false otherwise
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const isUnder = handlers.isPlaceableUnder(target, reference, targetMgr, refMgr);
   * ```
   */
  isPlaceableUnder(
    target,
    reference,
    targetManager,
    referenceManager,
    targetUse = 'center',
    referenceUse = 'rectangle',
    checkType = 'under'
  ) {
    return this.placeable.isUnder(
      target,
      reference,
      targetManager,
      referenceManager,
      targetUse,
      referenceUse,
      checkType
    );
  }

  /**
   * Convenience method to check if a target placeable is over a reference placeable.
   * Delegates to the placeable handler's isOver method.
   *
   * @param {Object} target - The target placeable
   * @param {Object} reference - The reference placeable
   * @param {Object} targetManager - The manager of the target placeable
   * @param {Object} referenceManager - The manager of the reference placeable
   * @param {string} [targetUse='center'] - The use case for the target position
   * @param {string} [referenceUse='rectangle'] - The use case for the reference position
   * @param {string} [checkType='above'] - The type of check to perform
   * @returns {boolean} True if the target is over the reference, false otherwise
   *
   * @example
   * ```javascript
   * const handlers = new Handlers(config, utils, context);
   * const isOver = handlers.isPlaceableOver(target, reference, targetMgr, refMgr);
   * ```
   */
  isPlaceableOver(
    target,
    reference,
    targetManager,
    referenceManager,
    targetUse = 'center',
    referenceUse = 'rectangle',
    checkType = 'above'
  ) {
    return this.placeable.isOver(
      target,
      reference,
      targetManager,
      referenceManager,
      targetUse,
      referenceUse,
      checkType
    );
  }

  /**
   * Validate constructor parameters for Handlers.
   *
   * @private
   * @static
   * @param {Object} config - Module configuration object.
   * @param {Object} context - Execution context object.
   * @param {Object} utils - Utilities facade.
   * @throws {Error} If any parameter is missing or not an object.
   */
  static #validateHandlerParameters(config, utils, context) {
    if (!config || typeof config !== 'object')
      throw new Error('Config must be a non-null object for Handlers');
    if (!context || typeof context !== 'object')
      throw new Error('Context must be a non-null object for Handlers');
    if (!utils || typeof utils !== 'object')
      throw new Error('Utils must be a non-null object for Handlers');
  }
}

export default Handlers;
