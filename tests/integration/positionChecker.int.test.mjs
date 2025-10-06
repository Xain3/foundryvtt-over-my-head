import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// Mock config dependencies to prevent raw imports
vi.mock('../../src/config/helpers/constantsGetter.mjs', () => ({
  default: {
    getConstantsYaml: vi.fn(() => `positionChecker:
  checkTypes:
    UNDER: under
    OVER: above
  positionUses:
    CENTER: center
    RECTANGLE: rectangle
  methodKeys:
    CENTER_RECTANGLE: center-rectangle
    RECTANGLE_CENTER: rectangle-center
    RECTANGLE_RECTANGLE: rectangle-rectangle
    CENTER_CENTER: center-center
requiredManifestAttributes:
  - id
  - title
  - description
  - version`)
  }
}));

vi.mock('../../src/config/helpers/constantsParser.mjs', () => ({
  default: {
    parseConstants: vi.fn(() => ({
      positionChecker: {
        checkTypes: {
          UNDER: 'under',
          OVER: 'above'
        },
        positionUses: {
          CENTER: 'center',
          RECTANGLE: 'rectangle'
        },
        methodKeys: {
          CENTER_RECTANGLE: 'center-rectangle',
          RECTANGLE_CENTER: 'rectangle-center',
          RECTANGLE_RECTANGLE: 'rectangle-rectangle',
          CENTER_CENTER: 'center-center'
        }
      },
      requiredManifestAttributes: [
        'id',
        'title', 
        'description',
        'version'
      ]
    }))
  }
}));

import config from '../../src/config/config.mjs';
import PositionChecker from '../../src/handlers/placeableHelpers/positionChecker.mjs';

/**
 * @file positionChecker.int.test.mjs
 * @description Integration tests for PositionChecker with config.constants overrides.
 * @path tests/integration/positionChecker.int.test.mjs
 */

describe('PositionChecker Integration', () => {
  it('loads overrides from config.constants.positionChecker', () => {
    expect(config.constants.positionChecker).toBeDefined();
    expect(config.constants.positionChecker.checkTypes).toBeDefined();
    expect(config.constants.positionChecker.positionUses).toBeDefined();
    expect(config.constants.positionChecker.methodKeys).toBeDefined();

    // Values from constants.yaml
    expect(config.constants.positionChecker.checkTypes.UNDER).toBe('under');
    expect(config.constants.positionChecker.checkTypes.OVER).toBe('above');
    expect(config.constants.positionChecker.positionUses.CENTER).toBe('center');
    expect(config.constants.positionChecker.positionUses.RECTANGLE).toBe('rectangle');
  });

  it('uses config overrides at runtime (elevation and keys)', () => {
    const utils = { logger: { warn: vi.fn() } };
    const pc = new PositionChecker({ config: { constants: config.constants }, context: {}, utils });

    // Elevation checks: YAML sets OVER to 'above'
    expect(pc.elevationCheck(1, 2, pc.CHECK_TYPES.UNDER)).toBe(true);
    expect(pc.elevationCheck(3, 2, pc.CHECK_TYPES.UNDER)).toBe(false);
    expect(pc.elevationCheck(3, 2, 'above')).toBe(true);
    expect(pc.elevationCheck(1, 2, 'above')).toBe(false);

    // Method keys based on YAML-provided strings
    const centerRectKey = pc.METHOD_KEYS.CENTER_RECTANGLE; // 'center-rectangle'
    const rectCenterKey = pc.METHOD_KEYS.RECTANGLE_CENTER; // 'rectangle-center'

    expect(typeof pc.returnCheckMethod(centerRectKey)).toBe('function');
    expect(typeof pc.returnCheckMethod(rectCenterKey)).toBe('function');
  });

  it('performs a real check with YAML-provided keys/uses', () => {
    const utils = { logger: { warn: vi.fn() } };
    const pc = new PositionChecker({ config: { constants: config.constants }, context: {}, utils });

    const center = { x: 5, y: 5 };
    const rect = { BottomLeft: { x: 0, y: 0 }, TopRight: { x: 10, y: 10 } };

    const result = pc.check(
      center,
      1,
      rect,
      2,
      pc.POSITION_USES.CENTER,
      pc.POSITION_USES.RECTANGLE,
      pc.CHECK_TYPES.UNDER
    );

    expect(result).toBe(true);
  });
});
