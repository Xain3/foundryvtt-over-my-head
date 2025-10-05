/**
 * @file placeableHandler.mjs
 * @description Handles operations related to placeable entities.
 * @path src/handlers/placeableHandler.mjs
 */

import Handler from '../baseClasses/handler.mjs';
import PlaceableGetter from './placeableHelpers/placeableGetter.mjs';
import PlaceableChecker from './placeableHelpers/placeableChecker.mjs';
import PlaceableSetter from './placeableHelpers/placeableSetter.mjs';

/**
 * Handles operations related to placeable entities.
 */
class PlaceableHandler extends Handler {
  /**
   * @param {Object} config - Configuration settings.
   * @param {Object} context - Execution context.
   * @param {Object} utils - Utility functions.
   *
   * @constructor
   * @extends Handler
   * @property {string} placeableType - Type of placeable entity.
   * @property {PlaceableGetter} getter - Instance of PlaceableGetter for retrieving placeables.
   * @property {PlaceableSetter} setter - Instance of PlaceableSetter for setting placeables.
   * @property {PlaceableChecker} checker - Instance of PlaceableChecker for checking placeables.
   * @property {Array} all - List of all placeable entities.
   * @property {Object} current - The currently selected placeable entity.
   *
   * Inherits properties from Handler:
   * @property {Object} utils - The utility object.
   * @property {Object} logger - The logger object.
   *
   * Inherits properties from Base:
   * @property {Object} config - The configuration object.
   * @property {Object} const - The constant object.
   * @property {Object} moduleConstants - The module constants object.
   * @property {Object} game - The global game object.
   * @property {Object} context - The execution context.
   */
  constructor(config, context, utils, placeableType = null) {
    super(config, utils, context);
    this.placeableType = placeableType;
    this.getter = new PlaceableGetter(config, context, utils);
    this.setter = new PlaceableSetter(config, context, utils);
    this.checker = new PlaceableChecker(config, context, utils, this.getter);
    this.all = [];
    this.current = null;
  }

  // WRAPPER FUNCTIONS

  // Setters
  /**
   * Sets the current placeable entity.
   * @param {Object} placeable - The placeable to set as current.
   * @returns {Object} The current placeable.
   */
  setCurrent(placeable) {
    return this.setter.setCurrentPlaceable(placeable);
  }

  // Getters
  /**
   * Retrieves the current placeable entity.
   * @returns {Object|null} The current placeable.
   */
  getCurrent() {
    return this.current;
  }

  /**
   * Retrieves all placeable entities.
   * @param {string} [placeableType=this.placeableType] - Type of placeables to retrieve.
   * @param {boolean} [updateProperty=true] - Whether to update the internal list.
   * @param {boolean} [returnValue=true] - Whether to return the list.
   * @returns {Array|undefined} List of placeables if returnValue is true.
   */
  getAll(
    placeableType = this.placeableType,
    updateProperty = true,
    returnValue = true
  ) {
    let all = this.getter.getAllPlaceables(placeableType, false, true);
    if (updateProperty) {
      this.all = all;
    }
    if (returnValue) {
      return all;
    }
  }

  /**
   * Retrieves the corner of a placeable entity.
   * @param {string} corner - The corner to retrieve.
   * @param {Object} placeable - The placeable entity.
   * @returns {Object} The corner of the placeable.
   */
  getCorner(corner, placeable) {
    return this.getter.getCorner(corner, placeable);
  }

  /**
   * Retrieves the center of a placeable entity.
   * @param {Object} placeable - The placeable entity.
   * @returns {Object} The center of the placeable.
   */
  getCenter(placeable) {
    return this.getter.getCenter(placeable);
  }

  /**
   * Retrieves the elevation of a placeable entity.
   * @param {Object} placeable - The placeable entity.
   * @returns {number} The elevation of the placeable.
   */
  getElevation(placeable) {
    return this.getter.getElevation(placeable);
  }

  /**
   * Retrieves the rectangular bounds of a placeable entity.
   * @param {Object} placeable - The placeable entity.
   * @returns {Object} The rectangular bounds of the placeable.
   */
  getRectBounds(placeable) {
    return this.getter.getRectBounds(placeable);
  }

  /**
   * Retrieves the position of a placeable entity.
   * @param {Object} placeable - The placeable entity.
   * @param {Object} placeableManager - The manager of the placeable.
   * @param {string} [use='center'] - The use case for the position.
   * @returns {Object} The position of the placeable.
   */
  getPosition(placeable, placeableManager, use = 'center') {
    return this.getter.getPosition(placeable, placeableManager, use);
  }

  // Checkers
  /**
   * Checks if a placeable entity is selected.
   * @param {Object} placeable - The placeable entity.
   * @returns {boolean} True if the placeable is selected, false otherwise.
   */
  isSelected(placeable) {
    return this.checker.isSelected(placeable);
  }

  /**
   * Checks if a target placeable is under a reference placeable.
   * @param {Object} target - The target placeable.
   * @param {Object} reference - The reference placeable.
   * @param {Object} targetManager - The manager of the target placeable.
   * @param {Object} referenceManager - The manager of the reference placeable.
   * @param {string} [targetUse='center'] - The use case for the target position.
   * @param {string} [referenceUse='rectangle'] - The use case for the reference position.
   * @param {string} [checkType='under'] - The type of check to perform.
   * @returns {boolean} True if the target is under the reference, false otherwise.
   */
  isUnder(
    target,
    reference,
    targetManager,
    referenceManager,
    targetUse = 'center',
    referenceUse = 'rectangle',
    checkType = 'under'
  ) {
    return this.checker.isUnder(
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
   * Checks if a target placeable is over a reference placeable.
   * @param {Object} target - The target placeable.
   * @param {Object} reference - The reference placeable.
   * @param {Object} targetManager - The manager of the target placeable.
   * @param {Object} referenceManager - The manager of the reference placeable.
   * @param {string} [targetUse='center'] - The use case for the target position.
   * @param {string} [referenceUse='rectangle'] - The use case for the reference position.
   * @param {string} [checkType='above'] - The type of check to perform.
   * @returns {boolean} True if the target is over the reference, false otherwise.
   */
  isOver(
    target,
    reference,
    targetManager,
    referenceManager,
    targetUse = 'center',
    referenceUse = 'rectangle',
    checkType = 'above'
  ) {
    return this.checker.isOver(
      target,
      reference,
      targetManager,
      referenceManager,
      targetUse,
      referenceUse,
      checkType
    );
  }

  // TOKEN ONLY WRAPPERS

  /**
   * Checks if a placeable entity is owned by the current user.
   * @param {Object} token - The placeable entity.
   * @returns {boolean} True if the placeable is owned, false otherwise.
   */
  isOwned(token) {
    return this.checker.isOwned(token);
  }

  /**
   * Checks if a placeable entity is both owned and selected by the current user.
   * @param {Object} token - The placeable entity.
   * @returns {boolean} True if the placeable is both owned and selected, false otherwise.
   */
  isOwnedAndSelected(token) {
    return this.checker.isOwnedAndSelected(token);
  }
}

export default PlaceableHandler;
