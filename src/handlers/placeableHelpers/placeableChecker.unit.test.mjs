/**
 * @file placeableChecker.unit.test.mjs
 * @description Unit tests for PlaceableChecker.
 * @path src/handlers/placeableHelpers/placeableChecker.unit.test.mjs
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';

// Mock config-related imports that might cause problems
vi.mock('#config', () => ({
  default: {
    constants: {
      positionChecker: {
        checkTypes: {
          UNDER: 'under',
          OVER: 'above',
        },
        positionUses: {
          CENTER: 'center',
          RECTANGLE: 'rectangle',
        },
        methodKeys: {
          CHECK_METHOD: 'checkMethod',
        },
      },
    },
    manifest: { id: 'test-module' },
  },
}));

// Mock the config file that the placeableHelpers config.mjs imports
vi.mock('../../config/config.mjs', () => ({
  default: {
    constants: {
      positionChecker: {
        checkTypes: {
          UNDER: 'under',
          OVER: 'above',
        },
        positionUses: {
          CENTER: 'center',
          RECTANGLE: 'rectangle',
        },
        methodKeys: {
          CHECK_METHOD: 'checkMethod',
        },
      },
    },
    manifest: { id: 'test-module' },
  },
}));

// Mock dependencies
vi.mock('./positionChecker.mjs');

import PlaceableChecker from './placeableChecker.mjs';
import PositionChecker from './positionChecker.mjs';
import { CHECK_TYPES } from './config.mjs';
import MockConfig from '../../../tests/mocks/config.mjs';

describe('PlaceableChecker', () => {
  let placeableChecker;
  let mockConfig;
  let mockContext;
  let mockUtils;
  let mockPlaceableGetter;
  let mockPositionChecker;
  let mockLogger;

  beforeEach(() => {
    mockConfig = new MockConfig();
    mockContext = {};

    mockLogger = {
      warn: vi.fn(),
      log: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };

    mockUtils = {
      logger: mockLogger,
    };

    mockPlaceableGetter = {
      getPosition: vi.fn(),
      getElevation: vi.fn(),
    };

    mockPositionChecker = {
      check: vi.fn(),
    };

    PositionChecker.mockImplementation(() => mockPositionChecker);

    placeableChecker = new PlaceableChecker({
      config: mockConfig,
      context: mockContext,
      utils: mockUtils,
      placeableGetter: mockPlaceableGetter,
    });
    placeableChecker.logger = mockLogger;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkPosition', () => {
    it('should delegate to positionChecker.check with the correct parameters', () => {
      const targetPosition = { x: 10, y: 20 };
      const targetElevation = 5;
      const referencePosition = { x: 15, y: 25 };
      const referenceElevation = 10;
      const targetUse = 'center';
      const referenceUse = 'rectangle';
      const checkType = CHECK_TYPES.UNDER;

      mockPositionChecker.check.mockReturnValue(true);

      const result = placeableChecker.checkPosition(
        targetPosition,
        targetElevation,
        referencePosition,
        referenceElevation,
        targetUse,
        referenceUse,
        checkType
      );

      expect(mockPositionChecker.check).toHaveBeenCalledWith(
        targetPosition,
        targetElevation,
        referencePosition,
        referenceElevation,
        targetUse,
        referenceUse,
        checkType
      );
      expect(result).toBe(true);
    });
  });

  describe('isSelected', () => {
    it('should return true if placeable is controlled', () => {
      const placeable = { controlled: true };
      const result = placeableChecker.isSelected(placeable);
      expect(result).toBe(true);
    });

    it('should return false if placeable is not controlled', () => {
      const placeable = { controlled: false };
      const result = placeableChecker.isSelected(placeable);
      expect(result).toBe(false);
    });
  });

  describe('isUnder', () => {
    it('should return true when target is under reference', () => {
      const target = { id: 'target' };
      const reference = { id: 'reference' };
      const targetManager = { id: 'targetManager' };
      const referenceManager = { id: 'referenceManager' };
      const targetUse = 'center';
      const referenceUse = 'rectangle';

      mockPlaceableGetter.getPosition.mockImplementation((obj) => {
        if (obj.id === 'target') return { x: 10, y: 20 };
        if (obj.id === 'reference') return { x: 15, y: 25 };
        return null;
      });

      mockPlaceableGetter.getElevation.mockImplementation((obj) => {
        if (obj.id === 'target') return 5;
        if (obj.id === 'reference') return 10;
        return null;
      });

      mockPositionChecker.check.mockReturnValue(true);

      const result = placeableChecker.isUnder(
        target,
        reference,
        targetManager,
        referenceManager,
        targetUse,
        referenceUse
      );

      expect(mockPlaceableGetter.getPosition).toHaveBeenCalledWith(
        target,
        targetManager,
        targetUse
      );
      expect(mockPlaceableGetter.getPosition).toHaveBeenCalledWith(
        reference,
        referenceManager,
        referenceUse
      );
      expect(mockPlaceableGetter.getElevation).toHaveBeenCalledWith(target);
      expect(mockPlaceableGetter.getElevation).toHaveBeenCalledWith(reference);
      expect(mockPositionChecker.check).toHaveBeenCalledWith(
        { x: 10, y: 20 },
        5,
        { x: 15, y: 25 },
        10,
        targetUse,
        referenceUse,
        CHECK_TYPES.UNDER
      );
      expect(result).toBe(true);
    });

    it('should return false when any position or elevation is invalid', () => {
      const target = { id: 'target' };
      const reference = { id: 'reference' };
      const targetManager = { id: 'targetManager' };
      const referenceManager = { id: 'referenceManager' };

      mockPlaceableGetter.getPosition.mockReturnValue(null);
      mockPlaceableGetter.getElevation.mockReturnValue(5);

      const result = placeableChecker.isUnder(
        target,
        reference,
        targetManager,
        referenceManager
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid target or reference'
      );
      expect(result).toBe(false);
    });

    it('should treat elevation 0 as valid', () => {
      const target = { id: 'target' };
      const reference = { id: 'reference' };
      const targetManager = { id: 'targetManager' };
      const referenceManager = { id: 'referenceManager' };

      mockPlaceableGetter.getPosition.mockImplementation((obj) => {
        if (obj.id === 'target') return { x: 10, y: 20 };
        if (obj.id === 'reference') return { x: 15, y: 25 };
        return null;
      });

      mockPlaceableGetter.getElevation.mockImplementation((obj) => {
        if (obj.id === 'target') return 0; // Elevation 0 should be valid
        if (obj.id === 'reference') return 10;
        return null;
      });

      mockPositionChecker.check.mockReturnValue(true);

      const result = placeableChecker.isUnder(
        target,
        reference,
        targetManager,
        referenceManager
      );

      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockPositionChecker.check).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should log debug message if debug mode is enabled', () => {
      const target = { id: 'target' };
      const reference = { id: 'reference' };
      const targetManager = { id: 'targetManager' };
      const referenceManager = { id: 'referenceManager' };

      mockPlaceableGetter.getPosition.mockReturnValue({ x: 10, y: 20 });
      mockPlaceableGetter.getElevation.mockReturnValue(5);

      // Enable debug mode via config
      placeableChecker.debugEnabled = true;

      placeableChecker.isUnder(
        target,
        reference,
        targetManager,
        referenceManager
      );

      expect(mockLogger.log).toHaveBeenCalledWith(
        `Checking if target ${target} is under reference ${reference}`
      );
    });
  });

  describe('isOver', () => {
    it('should call isUnder with the checkType from CHECK_TYPES.OVER', () => {
      const target = { id: 'target' };
      const reference = { id: 'reference' };
      const targetManager = { id: 'targetManager' };
      const referenceManager = { id: 'referenceManager' };
      const targetUse = 'center';
      const referenceUse = 'rectangle';

      vi.spyOn(placeableChecker, 'isUnder').mockReturnValue(true);

      const result = placeableChecker.isOver(
        target,
        reference,
        targetManager,
        referenceManager,
        targetUse,
        referenceUse
      );

      expect(placeableChecker.isUnder).toHaveBeenCalledWith(
        target,
        reference,
        targetManager,
        referenceManager,
        targetUse,
        referenceUse,
        'above'
      );
      expect(result).toBe(true);
    });
  });

  describe('getDebugMode', () => {
    it('should return instance debugEnabled if set', () => {
      placeableChecker.debugEnabled = true;
      expect(placeableChecker.getDebugMode()).toBe(true);

      placeableChecker.debugEnabled = false;
      expect(placeableChecker.getDebugMode()).toBe(false);
    });

    it('should return config debugMode if instance flag not set', () => {
      placeableChecker.debugEnabled = null;
      mockConfig.constants.debugMode = true;
      expect(placeableChecker.getDebugMode()).toBe(true);

      mockConfig.constants.debugMode = false;
      expect(placeableChecker.getDebugMode()).toBe(false);
    });

    it('should return context debugMode if config not available', () => {
      placeableChecker.debugEnabled = null;
      mockConfig.constants = {};
      mockContext.debugMode = true;
      expect(placeableChecker.getDebugMode()).toBe(true);

      mockContext.debugMode = false;
      expect(placeableChecker.getDebugMode()).toBe(false);
    });

    it('should return false if no debug flags are set', () => {
      placeableChecker.debugEnabled = null;
      mockConfig.constants = {};
      mockContext.debugMode = null;
      expect(placeableChecker.getDebugMode()).toBe(false);
    });
  });

  describe('isControlled', () => {
    it('should return the controlled property of the placeable', () => {
      const placeable = { controlled: true };
      expect(placeableChecker.isControlled(placeable)).toBe(true);

      placeable.controlled = false;
      expect(placeableChecker.isControlled(placeable)).toBe(false);
    });
  });
});
