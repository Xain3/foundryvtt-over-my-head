/**
 * @file placeableGetter.unit.test.mjs
 * @description Unit tests for PlaceableGetter helper.
 * @path src/handlers/placeableHelpers/placeableGetter.unit.test.mjs
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
import PlaceableGetter from './placeableGetter.mjs';
import Handler from '#baseClasses/handler.mjs';

describe('PlaceableGetter', () => {
  let placeableGetter;
  let mockConfig;
  let mockContext;
  let mockUtils;
  let mockPlaceable;

  beforeEach(() => {
    // Set up mocks
    mockConfig = {
      HANDLERS: {
        PLACEABLE: {
          ALLOWED_CORNERS: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
        },
      },
    };

    mockContext = {};

    mockUtils = {
      logger: {
        warn: vi.fn(),
      },
    };

    // Mock placeable
    mockPlaceable = {
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      center: { x: 200, y: 175 },
      elevation: 10,
      _controlled: false,
    };

    // Mock canvas global
    global.canvas = {
      tokens: {
        placeables: [mockPlaceable],
      },
    };

    // Initialize PlaceableGetter
    placeableGetter = new PlaceableGetter({
      config: mockConfig,
      context: mockContext,
      utils: mockUtils,
    });
    placeableGetter.logger = mockUtils.logger; // Ensure logger is accessible
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a new instance of PlaceableGetter', () => {
      expect(placeableGetter).toBeInstanceOf(PlaceableGetter);
      expect(placeableGetter).toBeInstanceOf(Handler);
    });
  });

  describe('getAllPlaceables', () => {
    it('should return all placeables of a specified type', () => {
      const placeables = placeableGetter.getAllPlaceables('tokens');
      expect(placeables).toEqual([mockPlaceable]);
    });

    it('should update the "all" property if updateProperty is true', () => {
      placeableGetter.getAllPlaceables('tokens', true);
      expect(placeableGetter.all).toEqual([mockPlaceable]);
    });

    it('should not update the "all" property if updateProperty is false', () => {
      placeableGetter.getAllPlaceables('tokens', false);
      expect(placeableGetter.all).toBeUndefined();
    });

    it('should not return placeables if returnValue is false', () => {
      const result = placeableGetter.getAllPlaceables('tokens', true, false);
      expect(result).toBeUndefined();
    });

    it('should return an empty array if the placeable type does not exist', () => {
      const placeables = placeableGetter.getAllPlaceables('nonexistent');
      expect(placeables).toEqual([]);
    });
  });

  describe('getCorner', () => {
    it('should return the top-left corner coordinates', () => {
      const corner = placeableGetter.getCorner('topLeft', mockPlaceable);
      expect(corner).toEqual({ x: 100, y: 100 });
    });

    it('should return the top-right corner coordinates', () => {
      const corner = placeableGetter.getCorner('topRight', mockPlaceable);
      expect(corner).toEqual({ x: 300, y: 100 });
    });

    it('should return the bottom-left corner coordinates', () => {
      const corner = placeableGetter.getCorner('bottomLeft', mockPlaceable);
      expect(corner).toEqual({ x: 100, y: 250 });
    });

    it('should return the bottom-right corner coordinates', () => {
      const corner = placeableGetter.getCorner('bottomRight', mockPlaceable);
      expect(corner).toEqual({ x: 300, y: 250 });
    });

    it('should log a warning for an unknown corner', () => {
      const corner = placeableGetter.getCorner('unknownCorner', mockPlaceable);
      expect(corner).toBeNull();
      expect(mockUtils.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('unknownCorner')
      );
    });

    it('should log a warning if corner is null', () => {
      const corner = placeableGetter.getCorner(null, mockPlaceable);
      expect(corner).toBeNull();
      expect(mockUtils.logger.warn).toHaveBeenCalledWith(
        'No corner provided. Returning null.'
      );
    });

    it('should log a warning and call getCenter if "center" is provided', () => {
      const corner = placeableGetter.getCorner('center', mockPlaceable);
      expect(corner).toEqual({ x: 200, y: 175 });
      expect(mockUtils.logger.warn).toHaveBeenCalledWith(
        'getCorner is used to get corners only. Use getCenter for center.'
      );
    });
  });

  describe('getCenter', () => {
    it('should return the center coordinates of a placeable', () => {
      const center = placeableGetter.getCenter(mockPlaceable);
      expect(center).toEqual({ x: 200, y: 175 });
    });
  });

  describe('getElevation', () => {
    it('should return the elevation of a placeable', () => {
      const elevation = placeableGetter.getElevation(mockPlaceable);
      expect(elevation).toBe(10);
    });
  });

  describe('getRectBounds', () => {
    it('should return the top-right and bottom-left corners', () => {
      const bounds = placeableGetter.getRectBounds(mockPlaceable);
      expect(bounds).toEqual({
        TopRight: { x: 300, y: 100 },
        BottomLeft: { x: 100, y: 250 },
      });
    });
  });

  describe('getPosition', () => {
    it('should return the center when "use" is set to "center"', () => {
      const position = placeableGetter.getPosition(
        mockPlaceable,
        placeableGetter,
        'center'
      );
      expect(position).toEqual({ x: 200, y: 175 });
    });

    it('should return the rectangle bounds when "use" is set to "rectangle"', () => {
      const position = placeableGetter.getPosition(
        mockPlaceable,
        placeableGetter,
        'rectangle'
      );
      expect(position).toEqual({
        TopRight: { x: 300, y: 100 },
        BottomLeft: { x: 100, y: 250 },
      });
    });

    it('should return undefined for unhandled "use" values', () => {
      const position = placeableGetter.getPosition(
        mockPlaceable,
        placeableGetter,
        'unknown'
      );
      expect(position).toBeUndefined();
    });
  });

  describe('getSelectedPlaceables', () => {
    it('should return an empty array if no placeables are selected', () => {
      const selected = placeableGetter.getSelectedPlaceables([mockPlaceable]);
      expect(selected).toEqual([]);
    });

    it('should return selected placeables', () => {
      const selectedPlaceable = { ...mockPlaceable, controlled: true };
      const selected = placeableGetter.getSelectedPlaceables([
        selectedPlaceable,
        mockPlaceable,
      ]);
      expect(selected).toEqual([selectedPlaceable]);
    });
  });
});
