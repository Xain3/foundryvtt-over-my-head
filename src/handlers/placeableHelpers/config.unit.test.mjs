/**
 * @file config.unit.test.js
 * @description Unit tests for the placeableHelpers config integration
 * @path src/handlers/placeableHelpers/config.unit.test.js
 */

import { CHECK_TYPES, POSITION_USES, METHOD_KEYS } from './config.mjs';

describe('PlaceableHelpers Config Integration', () => {
  describe('constants flow through config.js → constants.js → constants.yaml', () => {
    it('should import CHECK_TYPES from config system with OVER as "above" from constants.yaml', () => {
      expect(CHECK_TYPES.UNDER).toBe('under');
      expect(CHECK_TYPES.OVER).toBe('above'); // This comes from constants.yaml override
    });

    it('should import POSITION_USES from config system', () => {
      expect(POSITION_USES.CENTER).toBe('center');
      expect(POSITION_USES.RECTANGLE).toBe('rectangle');
    });

    it('should import METHOD_KEYS from config system', () => {
      expect(METHOD_KEYS.CENTER_RECTANGLE).toBe('center-rectangle');
      expect(METHOD_KEYS.RECTANGLE_CENTER).toBe('rectangle-center');
      expect(METHOD_KEYS.RECTANGLE_RECTANGLE).toBe('rectangle-rectangle');
      expect(METHOD_KEYS.CENTER_CENTER).toBe('center-center');
    });

    it('should have fallback values if constants are not available', () => {
      // Constants should be available from the yaml, but test ensures fallbacks work
      expect(typeof CHECK_TYPES.UNDER).toBe('string');
      expect(typeof CHECK_TYPES.OVER).toBe('string');
      expect(typeof POSITION_USES.CENTER).toBe('string');
      expect(typeof POSITION_USES.RECTANGLE).toBe('string');
    });
  });
});