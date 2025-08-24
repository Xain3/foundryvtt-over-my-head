/**
 * @file positionChecker.fallbacks.js
 * @description Fallback constants for PositionChecker: method keys, uses, and check types.
 * @path src/handlers/placeableHelpers/positionChecker.fallbacks.js
 */

export const CHECK_TYPES = Object.freeze({
  UNDER: 'under',
  OVER: 'over'
});

export const POSITION_USES = Object.freeze({
  CENTER: 'center',
  RECTANGLE: 'rectangle'
});

export const METHOD_KEYS = Object.freeze({
  CENTER_RECTANGLE: `${POSITION_USES.CENTER}-${POSITION_USES.RECTANGLE}`,
  RECTANGLE_CENTER: `${POSITION_USES.RECTANGLE}-${POSITION_USES.CENTER}`,
  RECTANGLE_RECTANGLE: `${POSITION_USES.RECTANGLE}-${POSITION_USES.RECTANGLE}`,
  CENTER_CENTER: `${POSITION_USES.CENTER}-${POSITION_USES.CENTER}`
});

export const makeMethodKey = (targetUse, referenceUse) => `${targetUse}-${referenceUse}`;
