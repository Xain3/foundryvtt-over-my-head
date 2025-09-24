/**
 * @file config.js
 * @description Configuration access point for placeable helpers that imports from the main config system.
 * @path src/handlers/placeableHelpers/config.js
 */

import config from '../../config/config.mjs';

/**
 * PlaceableHelpers configuration that provides access to constants through the main config system.
 * 
 * This module acts as a bridge between the placeable helpers and the main configuration system,
 * ensuring that constants are accessed consistently through config.js → constants.js → constants.yaml
 * as requested in the API & DX requirements.
 * 
 * @example
 * import { CHECK_TYPES, POSITION_USES } from './config.mjs';
 * 
 * // Use constants instead of magic strings
 * const checkType = CHECK_TYPES.OVER; // "above" from constants.yaml
 * const targetUse = POSITION_USES.CENTER; // "center" from constants.yaml
 * 
 * @export
 */

// Extract positionChecker constants from the main config system
const positionCheckerConfig = config.constants?.positionChecker || {};

/**
 * Check types for position validation, sourced from constants.yaml
 * @type {Object}
 * @readonly
 */
export const CHECK_TYPES = Object.freeze({
  UNDER: positionCheckerConfig.checkTypes?.UNDER || 'under',
  OVER: positionCheckerConfig.checkTypes?.OVER || 'over'
});

/**
 * Position use types for placeable positioning, sourced from constants.yaml
 * @type {Object}
 * @readonly
 */
export const POSITION_USES = Object.freeze({
  CENTER: positionCheckerConfig.positionUses?.CENTER || 'center',
  RECTANGLE: positionCheckerConfig.positionUses?.RECTANGLE || 'rectangle'
});

/**
 * Method keys for position checking combinations, sourced from constants.yaml
 * @type {Object}
 * @readonly
 */
export const METHOD_KEYS = Object.freeze({
  CENTER_RECTANGLE: positionCheckerConfig.methodKeys?.CENTER_RECTANGLE || 'center-rectangle',
  RECTANGLE_CENTER: positionCheckerConfig.methodKeys?.RECTANGLE_CENTER || 'rectangle-center',
  RECTANGLE_RECTANGLE: positionCheckerConfig.methodKeys?.RECTANGLE_RECTANGLE || 'rectangle-rectangle',
  CENTER_CENTER: positionCheckerConfig.methodKeys?.CENTER_CENTER || 'center-center'
});

/**
 * The main config object for access to the full configuration system
 * @type {Object}
 * @readonly
 */
export default config;