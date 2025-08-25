/**
 * @file positionChecker.js
 * @description Checks the positional relationship between two entities.
 * @path src/handlers/placeableHelpers/positionChecker.js
 */

import { CHECK_TYPES, POSITION_USES, METHOD_KEYS, makeMethodKey } from './positionChecker.fallbacks.js';
import Handler from '../../baseClasses/handler.js';

/**
 * Checks the positional relationship between two entities.
 * @class
 * @classdesc Handles position checks between entities.
 * @requires utils
 *
 * @property {Object} utils - Utility functions.
 * @property {Object} checkMethods - Methods for checking position relationships.
*/
class PositionChecker extends Handler {
  /**
   * @param {Object} config - Configuration object containing constants (from constants.yaml)
   * @param {Object} context - Optional execution context
   * @param {Object} utils - Utility functions.
   */
  constructor(config, context, utils) {
    super(config, utils, context);
    this.utils = utils;
    this.context = context;
    this.logger = utils.logger;

    // Position Checker Configuration
    const pcCfg = (config && config.constants && config.constants.positionChecker) || {};

    this.CHECK_TYPES = Object.freeze({ ...CHECK_TYPES, ...(pcCfg.checkTypes || {}) });
    this.POSITION_USES = Object.freeze({ ...POSITION_USES, ...(pcCfg.positionUses || {}) });
    this.METHOD_KEYS = Object.freeze(
      pcCfg.methodKeys
        ? { ...METHOD_KEYS, ...pcCfg.methodKeys }
        : {
          CENTER_RECTANGLE: makeMethodKey(this.POSITION_USES.CENTER, this.POSITION_USES.RECTANGLE),
          RECTANGLE_CENTER: makeMethodKey(this.POSITION_USES.RECTANGLE, this.POSITION_USES.CENTER),
          RECTANGLE_RECTANGLE: makeMethodKey(this.POSITION_USES.RECTANGLE, this.POSITION_USES.RECTANGLE),
          CENTER_CENTER: makeMethodKey(this.POSITION_USES.CENTER, this.POSITION_USES.CENTER)
        }
    );
    /**
     * @type {Object}
     * @property {Function} 'center-rectangle' - Checks if the target center is within the reference rectangle.
     * @property {Function} 'rectangle-center' - Checks if the target rectangle contains the reference center.
     * @property {Function} 'rectangle-rectangle' - Checks if the target rectangle is overlapping with the reference rectangle.
     * @property {Function} 'center-center' - Checks if the target center is at the same position as the reference center.
     *
     * Notes:
     * - Boundaries are exclusive: comparisons use < and >, not <= or >=.
     * - Edge-touching centers or rectangles do not count as inside/overlapping.
    */
    this.checkMethods = {
      [this.METHOD_KEYS.CENTER_RECTANGLE]: this.isCenterRelativeToRect.bind(this),
      [this.METHOD_KEYS.RECTANGLE_CENTER]: this.isRectRelativeToCenter.bind(this),
      [this.METHOD_KEYS.RECTANGLE_RECTANGLE]: this.isRectRelativeToRect.bind(this),
      [this.METHOD_KEYS.CENTER_CENTER]: this.isCenterRelativeToCenter.bind(this)
    };
  }

  /**
   * Validates a center-like object: { x: number, y: number }
   * @param {Object} center
   * @returns {boolean}
   */
  _isValidCenter(center) {
    return !!center && typeof center.x === 'number' && typeof center.y === 'number';
  }

  /**
   * Validates a rectangle-like object: { BottomLeft: {x,y}, TopRight: {x,y} }
   * @param {Object} rect
   * @returns {boolean}
   */
  _isValidRect(rect) {
    return !!rect && this._isValidCenter(rect.BottomLeft) && this._isValidCenter(rect.TopRight);
  }

  _warnInvalid(message) {
    if (this.logger && typeof this.logger.warn === 'function') this.logger.warn(message);
  }

  /**
   * Retrieves a check method based on the provided key.
   *
   * @param {string} methodKey - The key of the check method to retrieve
   * @returns {Function|null} The requested check method if found, null otherwise
   * @example
   * // Get a specific check method
   * const checkMethod = this.returnCheckMethod('someMethodKey');
   * if (checkMethod) {
   *   checkMethod(someParameters);
   * }
   */
  returnCheckMethod(methodKey) {
    // Check if the methodKey is valid.
    if (this.checkMethods[methodKey]) {
      return this.checkMethods[methodKey];
    } else {
      this.logger.warn(`Invalid methodKey ${methodKey}`);
      return null;
    }
  }

  /**
   * Checks the position relationship between target and reference.
   *
   * @param {Object} targetPosition - Position of the target entity.
   * @param {number} targetElevation - Elevation of the target entity.
   * @param {Object} referencePosition - Position of the reference entity.
   * @param {number} referenceElevation - Elevation of the reference entity.
   * @param {string} targetUse - Use case for the target entity.
   * @param {string} referenceUse - Use case for the reference entity.
   * @param {string} [checkType='under'] - Type of check to perform. Any non-'under' string is treated as 'over'. Boundaries are strict.
   * @returns {boolean} Result of the position check.
   */
  check(targetPosition, targetElevation, referencePosition, referenceElevation, targetUse, referenceUse, checkType = this.CHECK_TYPES.UNDER) {
    // Create a key to access the correct check method.
    const methodKey = makeMethodKey(targetUse, referenceUse);
    // Retrieve the correct check method.
    const checkMethod = this.returnCheckMethod(methodKey);

    // If the check method is valid, call it.
    if (checkMethod) {
      return checkMethod(targetPosition, targetElevation, referencePosition, referenceElevation, checkType);
    } else {
      this.logger.warn(`Invalid combination of targetUse ${targetUse} and referenceUse ${referenceUse}`);
      return false;
    }
  }

  elevationCheck(targetElevation, referenceElevation, checkType) {
    return checkType === this.CHECK_TYPES.UNDER ? targetElevation < referenceElevation : targetElevation > referenceElevation;
  }

  /**
   * Checks if the target center is within the reference rectangle.
   *
   * @param {Object} targetCenter - Center of the target entity.
   * @param {number} targetElevation - Elevation of the target entity.
   * @param {Object} referencePosition - Position of the reference entity.
   * @param {number} referenceElevation - Elevation of the reference entity.
   * @param {string} checkType - Type of check to perform.
   * @returns {boolean} Result of the position check.
   */
  isCenterRelativeToRect(targetCenter, targetElevation, referencePosition, referenceElevation, checkType) {
    if (!this._isValidCenter(targetCenter) || !this._isValidRect(referencePosition)) {
      this._warnInvalid('Invalid inputs for isCenterRelativeToRect');
      return false;
    }
    // Check if the target center is within the reference rectangle.
    const isWithinBounds =
      targetCenter.x > referencePosition.BottomLeft.x &&
      targetCenter.x < referencePosition.TopRight.x &&
      targetCenter.y > referencePosition.BottomLeft.y &&
      targetCenter.y < referencePosition.TopRight.y;

    // Check if the target elevation is under or over the reference elevation.
    const elevationCheck = this.elevationCheck(targetElevation, referenceElevation, checkType);

    return isWithinBounds && elevationCheck;
  }

  /**
   * Checks if the target rectangle is within the reference center.
   *
   * @param {Object} targetPosition - Position of the target entity.
   * @param {number} targetElevation - Elevation of the target entity.
   * @param {Object} referenceCenter - Center of the reference entity.
   * @param {number} referenceElevation - Elevation of the reference entity.
   * @param {string} checkType - Type of check to perform.
   * @returns {boolean} Result of the position check.
   */
  isRectRelativeToCenter(targetPosition, targetElevation, referenceCenter, referenceElevation, checkType) {
    if (!this._isValidRect(targetPosition) || !this._isValidCenter(referenceCenter)) {
      this._warnInvalid('Invalid inputs for isRectRelativeToCenter');
      return false;
    }
    // Check if the target rectangle is within the reference center.
    const isWithinBounds =
      targetPosition.BottomLeft.x < referenceCenter.x &&
      targetPosition.TopRight.x > referenceCenter.x &&
      targetPosition.BottomLeft.y < referenceCenter.y &&
      targetPosition.TopRight.y > referenceCenter.y;

    // Check if the target elevation is under or over the reference elevation.
    const elevationCheck = this.elevationCheck(targetElevation, referenceElevation, checkType);

    return isWithinBounds && elevationCheck;
  }

  /**
   * Checks if the target rectangle is overlapping with the reference rectangle.
   *
   * @param {Object} targetPosition - Position of the target entity.
   * @param {number} targetElevation - Elevation of the target entity.
   * @param {Object} referencePosition - Position of the reference entity.
   * @param {number} referenceElevation - Elevation of the reference entity.
   * @param {string} checkType - Type of check to perform.
   * @returns {boolean} Result of the position check.
   */
  isRectRelativeToRect(targetPosition, targetElevation, referencePosition, referenceElevation, checkType) {
    if (!this._isValidRect(targetPosition) || !this._isValidRect(referencePosition)) {
      this._warnInvalid('Invalid inputs for isRectRelativeToRect');
      return false;
    }
    // Check if the target rectangle is overlapping with the reference rectangle.
    const isOverlapping =
      targetPosition.BottomLeft.x < referencePosition.TopRight.x &&
      targetPosition.TopRight.x > referencePosition.BottomLeft.x &&
      targetPosition.BottomLeft.y < referencePosition.TopRight.y &&
      targetPosition.TopRight.y > referencePosition.BottomLeft.y;

    // Check if the target elevation is under or over the reference elevation.
    const elevationCheck = this.elevationCheck(targetElevation, referenceElevation, checkType);

    return isOverlapping && elevationCheck;
  }

  /**
   * Checks if the target center is at the same position as the reference center.
   *
   * @param {Object} targetCenter - Center of the target entity.
   * @param {number} targetElevation - Elevation of the target entity.
   * @param {Object} referenceCenter - Center of the reference entity.
   * @param {number} referenceElevation - Elevation of the reference entity.
   * @param {string} checkType - Type of check to perform.
   * @returns {boolean} Result of the position check.
   */
  isCenterRelativeToCenter(targetCenter, targetElevation, referenceCenter, referenceElevation, checkType) {
    if (!this._isValidCenter(targetCenter) || !this._isValidCenter(referenceCenter)) {
      this._warnInvalid('Invalid inputs for isCenterRelativeToCenter');
      return false;
    }
    // Check if the target center is at the same position as the reference center.
    const isSamePosition =
      targetCenter.x === referenceCenter.x &&
      targetCenter.y === referenceCenter.y;

    // Check if the target elevation is under or over the reference elevation.
    const elevationCheck = this.elevationCheck(targetElevation, referenceElevation, checkType);

    return isSamePosition && elevationCheck;
  }
}

export default PositionChecker;