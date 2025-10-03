/**
 * @file tokenTileInteraction.int.test.mjs
 * @description Integration tests for token and tile interaction, verifying position checks and elevation handling.
 * @path tests/integration/tokenTileInteraction.int.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PlaceableHandler from '../../src/handlers/placeableHandler.mjs';
import config from '../../src/config/config.mjs';

describe('Token and Tile Interaction Integration Tests', () => {
  let placeableHandler;
  let mockUtils;
  let mockContext;
  let mockToken;
  let mockTile;
  let mockCanvas;

  beforeEach(() => {
    // Setup mock utilities
    mockUtils = {
      logger: {
        log: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
      }
    };

    mockContext = {};

    // Setup config with required structure
    const testConfig = {
      constants: config.constants,
      manifest: config.manifest,
      HANDLERS: {
        PLACEABLE: {
          ALLOWED_CORNERS: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
        }
      }
    };

    // Create mock token (at elevation 0, positioned at 500,500)
    mockToken = {
      id: 'token-1',
      x: 500,
      y: 500,
      width: 100,
      height: 100,
      w: 100,
      h: 100,
      center: { x: 550, y: 550 },
      document: {
        elevation: 0
      },
      elevation: 0,
      controlled: false
    };

    // Create mock tile (overhead, at elevation 10, covering token)
    // Tile bounds: x: 400-700, y: 400-700
    mockTile = {
      id: 'tile-1',
      x: 400,
      y: 400,
      width: 300,
      height: 300,
      w: 300,
      h: 300,
      center: { x: 550, y: 550 },
      document: {
        elevation: 10
      },
      elevation: 10,
      controlled: false
    };

    // Setup mock canvas
    mockCanvas = {
      tokens: {
        placeables: [mockToken]
      },
      tiles: {
        placeables: [mockTile]
      }
    };

    global.canvas = mockCanvas;

    // Initialize the placeable handler
    placeableHandler = new PlaceableHandler(testConfig, mockContext, mockUtils);
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete global.canvas;
  });

  describe('Token Under Tile Detection', () => {
    it('should detect when a token is under a tile (same center, tile higher elevation)', () => {
      const result = placeableHandler.checker.isUnder(
        mockToken,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter,
        'center',
        'rectangle'
      );

      expect(result).toBe(true);
    });

    it('should detect when a token is NOT under a tile (different position)', () => {
      // Move token outside tile bounds
      const tokenOutside = {
        ...mockToken,
        x: 1000,
        y: 1000,
        center: { x: 1050, y: 1050 }
      };

      const result = placeableHandler.checker.isUnder(
        tokenOutside,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter,
        'center',
        'rectangle'
      );

      expect(result).toBe(false);
    });

    it('should detect when a token is NOT under a tile (token higher elevation)', () => {
      // Token at higher elevation than tile
      const tokenAbove = {
        ...mockToken,
        document: { elevation: 20 },
        elevation: 20
      };

      const result = placeableHandler.checker.isUnder(
        tokenAbove,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter,
        'center',
        'rectangle'
      );

      expect(result).toBe(false);
    });

    it('should handle token at same elevation as tile', () => {
      // Token at same elevation as tile
      const tokenSameLevel = {
        ...mockToken,
        document: { elevation: 10 },
        elevation: 10
      };

      const result = placeableHandler.checker.isUnder(
        tokenSameLevel,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter,
        'center',
        'rectangle'
      );

      // At same elevation, not "under"
      expect(result).toBe(false);
    });

    it('should handle token at edge of tile bounds', () => {
      // Token at the edge of tile (barely inside - strict boundaries mean > not >=)
      // Tile bounds: x: 400-700, y: 400-700
      // For center to be inside, it must be > 400 and < 700
      const tokenAtEdge = {
        ...mockToken,
        x: 401,
        y: 401,
        center: { x: 451, y: 451 }
      };

      const result = placeableHandler.checker.isUnder(
        tokenAtEdge,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter,
        'center',
        'rectangle'
      );

      expect(result).toBe(true);
    });

    it('should handle token just outside tile bounds', () => {
      // Token just outside tile edge (at edge = not inside with strict boundaries)
      // Tile bounds: x: 400-700, y: 400-700
      // For center to be inside, it must be > 400 and < 700
      // Center at exactly 700 or 400 is NOT inside
      const tokenOutsideEdge = {
        ...mockToken,
        x: 651,
        y: 651,
        center: { x: 700, y: 700 } // Exactly at boundary = not inside
      };

      const result = placeableHandler.checker.isUnder(
        tokenOutsideEdge,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter,
        'center',
        'rectangle'
      );

      expect(result).toBe(false);
    });
  });

  describe('Token Over Tile Detection', () => {
    it('should detect when a token is over a tile (same position, token higher elevation)', () => {
      // Token at higher elevation than tile
      const tokenAbove = {
        ...mockToken,
        document: { elevation: 20 },
        elevation: 20
      };

      const result = placeableHandler.checker.isOver(
        tokenAbove,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter,
        'center',
        'rectangle'
      );

      expect(result).toBe(true);
    });

    it('should detect when a token is NOT over a tile (token lower elevation)', () => {
      const result = placeableHandler.checker.isOver(
        mockToken,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter,
        'center',
        'rectangle'
      );

      expect(result).toBe(false);
    });
  });

  describe('Multiple Tokens and Tiles', () => {
    it('should correctly check multiple tokens against a single tile', () => {
      const token1 = { ...mockToken, id: 'token-1', center: { x: 450, y: 450 }, elevation: 0, document: { elevation: 0 } };
      const token2 = { ...mockToken, id: 'token-2', center: { x: 650, y: 650 }, elevation: 0, document: { elevation: 0 } };
      const token3 = { ...mockToken, id: 'token-3', center: { x: 800, y: 800 }, elevation: 0, document: { elevation: 0 } };

      const result1 = placeableHandler.checker.isUnder(token1, mockTile, placeableHandler.getter, placeableHandler.getter);
      const result2 = placeableHandler.checker.isUnder(token2, mockTile, placeableHandler.getter, placeableHandler.getter);
      const result3 = placeableHandler.checker.isUnder(token3, mockTile, placeableHandler.getter, placeableHandler.getter);

      expect(result1).toBe(true); // Inside tile
      expect(result2).toBe(true); // Inside tile
      expect(result3).toBe(false); // Outside tile
    });

    it('should handle a token under multiple overlapping tiles', () => {
      const tile1 = { ...mockTile, id: 'tile-1', elevation: 10, document: { elevation: 10 } };
      const tile2 = { 
        ...mockTile, 
        id: 'tile-2', 
        x: 450,
        y: 450,
        elevation: 15, 
        document: { elevation: 15 },
        center: { x: 600, y: 600 }
      };

      const result1 = placeableHandler.checker.isUnder(mockToken, tile1, placeableHandler.getter, placeableHandler.getter);
      const result2 = placeableHandler.checker.isUnder(mockToken, tile2, placeableHandler.getter, placeableHandler.getter);

      expect(result1).toBe(true); // Under first tile
      expect(result2).toBe(true); // Under second tile
    });
  });

  describe('Elevation Edge Cases', () => {
    it('should handle zero elevation correctly', () => {
      const tokenAtZero = { ...mockToken, elevation: 0, document: { elevation: 0 } };
      const tileAtZero = { ...mockTile, elevation: 0, document: { elevation: 0 } };

      const result = placeableHandler.checker.isUnder(
        tokenAtZero,
        tileAtZero,
        placeableHandler.getter,
        placeableHandler.getter
      );

      // Both at elevation 0, token not under tile
      expect(result).toBe(false);
    });

    it('should handle negative elevation', () => {
      const tokenBelowGround = { ...mockToken, elevation: -5, document: { elevation: -5 } };

      const result = placeableHandler.checker.isUnder(
        tokenBelowGround,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter
      );

      // Token below ground, tile at elevation 10
      expect(result).toBe(true);
    });

    it('should handle very large elevation differences', () => {
      const tokenLow = { ...mockToken, elevation: 0, document: { elevation: 0 } };
      const tileHigh = { ...mockTile, elevation: 1000, document: { elevation: 1000 } };

      const result = placeableHandler.checker.isUnder(
        tokenLow,
        tileHigh,
        placeableHandler.getter,
        placeableHandler.getter
      );

      expect(result).toBe(true);
    });
  });

  describe('Position Use Cases', () => {
    it('should work with center-to-center position checks', () => {
      const result = placeableHandler.checker.isUnder(
        mockToken,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter,
        'center',
        'center'
      );

      // Both centers at same position, token at lower elevation
      expect(result).toBe(true);
    });

    it('should work with rectangle-to-rectangle position checks', () => {
      const result = placeableHandler.checker.isUnder(
        mockToken,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter,
        'rectangle',
        'rectangle'
      );

      // Token rectangle within tile rectangle, token at lower elevation
      expect(result).toBe(true);
    });
  });

  describe('Invalid Input Handling', () => {
    it('should handle invalid token position gracefully', () => {
      const invalidToken = { ...mockToken, center: null };

      const result = placeableHandler.checker.isUnder(
        invalidToken,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter
      );

      expect(mockUtils.logger.warn).toHaveBeenCalledWith('Invalid target or reference');
      expect(result).toBe(false);
    });

    it('should handle missing elevation data gracefully', () => {
      const tokenNoElevation = { ...mockToken, elevation: undefined, document: {} };

      const result = placeableHandler.checker.isUnder(
        tokenNoElevation,
        mockTile,
        placeableHandler.getter,
        placeableHandler.getter
      );

      // Should use elevation 0 as fallback
      expect(result).toBe(true);
    });
  });

  describe('PlaceableGetter Integration', () => {
    it('should retrieve all tokens from canvas', () => {
      const tokens = placeableHandler.getter.getAllPlaceables('tokens');
      expect(tokens).toEqual([mockToken]);
      expect(tokens.length).toBe(1);
    });

    it('should retrieve all tiles from canvas', () => {
      const tiles = placeableHandler.getter.getAllPlaceables('tiles');
      expect(tiles).toEqual([mockTile]);
      expect(tiles.length).toBe(1);
    });

    it('should get correct corner positions for tokens', () => {
      const topLeft = placeableHandler.getter.getCorner('topLeft', mockToken);
      const topRight = placeableHandler.getter.getCorner('topRight', mockToken);
      const bottomLeft = placeableHandler.getter.getCorner('bottomLeft', mockToken);
      const bottomRight = placeableHandler.getter.getCorner('bottomRight', mockToken);

      expect(topLeft).toEqual({ x: 500, y: 500 });
      expect(topRight).toEqual({ x: 600, y: 500 });
      expect(bottomLeft).toEqual({ x: 500, y: 600 });
      expect(bottomRight).toEqual({ x: 600, y: 600 });
    });

    it('should get correct center position', () => {
      const center = placeableHandler.getter.getCenter(mockToken);
      expect(center).toEqual({ x: 550, y: 550 });
    });

    it('should get correct elevation', () => {
      const elevation = placeableHandler.getter.getElevation(mockToken);
      expect(elevation).toBe(0);
    });

    it('should get correct rectangular bounds', () => {
      // Token: x=500, y=500, width=100, height=100
      // BottomLeft (Cartesian) = topLeft (screen) = { x: 500, y: 500 }
      // TopRight (Cartesian) = bottomRight (screen) = { x: 600, y: 600 }
      const bounds = placeableHandler.getter.getRectBounds(mockToken);
      expect(bounds).toHaveProperty('TopRight');
      expect(bounds).toHaveProperty('BottomLeft');
      expect(bounds.BottomLeft).toEqual({ x: 500, y: 500 });
      expect(bounds.TopRight).toEqual({ x: 600, y: 600 });
    });
  });

  describe('Real-World Scenario: Roof Occlusion', () => {
    it('should correctly identify when a token enters under a roof tile', () => {
      // Scenario: Token moving from outside to inside a building with a roof tile
      const roofTile = {
        id: 'roof-tile',
        x: 1000,
        y: 1000,
        width: 500,
        height: 500,
        w: 500,
        h: 500,
        center: { x: 1250, y: 1250 },
        elevation: 20, // Roof at elevation 20
        document: { elevation: 20 },
        controlled: false,
        bounds: { x: 1000, y: 1000, width: 500, height: 500 }
      };

      // Token starts outside the building
      const tokenOutside = {
        ...mockToken,
        x: 800,
        y: 800,
        center: { x: 850, y: 850 },
        elevation: 0,
        document: { elevation: 0 }
      };

      // Token moves inside the building
      const tokenInside = {
        ...mockToken,
        x: 1100,
        y: 1100,
        center: { x: 1150, y: 1150 },
        elevation: 0,
        document: { elevation: 0 }
      };

      const outsideResult = placeableHandler.checker.isUnder(
        tokenOutside,
        roofTile,
        placeableHandler.getter,
        placeableHandler.getter
      );

      const insideResult = placeableHandler.checker.isUnder(
        tokenInside,
        roofTile,
        placeableHandler.getter,
        placeableHandler.getter
      );

      expect(outsideResult).toBe(false); // Not under roof when outside
      expect(insideResult).toBe(true);   // Under roof when inside
    });

    it('should handle multi-level buildings correctly', () => {
      // Ground floor token (elevation 0)
      const groundFloorToken = {
        ...mockToken,
        center: { x: 550, y: 550 },
        elevation: 0,
        document: { elevation: 0 }
      };

      // Second floor token (elevation 15)
      const secondFloorToken = {
        ...mockToken,
        center: { x: 550, y: 550 },
        elevation: 15,
        document: { elevation: 15 }
      };

      // Ground floor roof tile (elevation 10)
      const groundRoof = {
        ...mockTile,
        elevation: 10,
        document: { elevation: 10 }
      };

      // Second floor roof tile (elevation 20)
      const secondRoof = {
        ...mockTile,
        elevation: 20,
        document: { elevation: 20 }
      };

      // Ground floor token should be under ground roof
      const groundUnderGroundRoof = placeableHandler.checker.isUnder(
        groundFloorToken,
        groundRoof,
        placeableHandler.getter,
        placeableHandler.getter
      );

      // Ground floor token should be under second roof
      const groundUnderSecondRoof = placeableHandler.checker.isUnder(
        groundFloorToken,
        secondRoof,
        placeableHandler.getter,
        placeableHandler.getter
      );

      // Second floor token should NOT be under ground roof
      const secondUnderGroundRoof = placeableHandler.checker.isUnder(
        secondFloorToken,
        groundRoof,
        placeableHandler.getter,
        placeableHandler.getter
      );

      // Second floor token should be under second roof
      const secondUnderSecondRoof = placeableHandler.checker.isUnder(
        secondFloorToken,
        secondRoof,
        placeableHandler.getter,
        placeableHandler.getter
      );

      expect(groundUnderGroundRoof).toBe(true);
      expect(groundUnderSecondRoof).toBe(true);
      expect(secondUnderGroundRoof).toBe(false);
      expect(secondUnderSecondRoof).toBe(true);
    });
  });
});
