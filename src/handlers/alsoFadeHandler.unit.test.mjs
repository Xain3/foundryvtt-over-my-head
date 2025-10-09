/**
 * @file alsoFadeHandler.unit.test.mjs
 * @description Unit tests for AlsoFadeHandler class
 * @path src/handlers/alsoFadeHandler.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies
vi.mock('./settingsHandler.mjs', () => ({
  default: class MockSettingsHandler {
    getSettingValue(key) {
      const mockSettings = {
        useModule: true,
        debugMode: false,
        behaviorTokens: 'default',
        behaviorParty: 'default',
        behaviorGM: 'default',
      };
      return mockSettings[key];
    }
  },
}));

vi.mock('./tileHandler.mjs', () => ({
  default: class MockTileHandler {
    getAll() {
      return [];
    }
  },
}));

import AlsoFadeHandler from './alsoFadeHandler.mjs';

describe('AlsoFadeHandler', () => {
  let handler;
  let mockConfig;
  let mockUtils;
  let mockContext;
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    };

    mockConfig = {
      manifest: {
        title: 'test-module',
        id: 'test-module',
      },
      constants: {
        settings: {
          settingsList: [],
        },
      },
    };

    mockUtils = {
      logger: mockLogger,
      formatError: (error) => error.message || String(error),
    };

    mockContext = {};
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance successfully', () => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);

      expect(handler).toBeDefined();
      expect(handler).toBeInstanceOf(AlsoFadeHandler);
      expect(handler.config).toBe(mockConfig);
      expect(handler.utils).toBe(mockUtils);
      expect(handler.context).toBe(mockContext);
    });

    it('should initialize with a Set for alsoFadeTilesCache', () => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);

      expect(handler.alsoFadeTilesCache).toBeInstanceOf(Set);
      expect(handler.alsoFadeTilesCache.size).toBe(0);
    });

    it('should throw when config is missing manifest.title', () => {
      const invalidConfig = { manifest: {} };

      expect(() => {
        new AlsoFadeHandler(invalidConfig, mockUtils, mockContext);
      }).toThrow('Config must have a valid manifest with title');
    });

    it('should throw when utils is missing logger', () => {
      const invalidUtils = { formatError: (e) => e };

      expect(() => {
        new AlsoFadeHandler(mockConfig, invalidUtils, mockContext);
      }).toThrow('Utils must have a valid logger instance');
    });

    it('should log debug messages during initialization', () => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Initializing AlsoFadeHandler'
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'AlsoFadeHandler initialized successfully'
      );
    });
  });

  describe('_settings lazy getter', () => {
    it('should load settings on first access', () => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
      const settingsHandlerSpy = vi.spyOn(
        handler.settingsHandler,
        'getSettingValue'
      );

      const settings = handler._settings;

      expect(settings).toBeDefined();
      expect(settings.useModule).toBe(true);
      expect(settings.debugMode).toBe(false);
      expect(settingsHandlerSpy).toHaveBeenCalled();
    });

    it('should cache settings after first access', () => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
      const settingsHandlerSpy = vi.spyOn(
        handler.settingsHandler,
        'getSettingValue'
      );

      // First access
      const settings1 = handler._settings;
      const firstCallCount = settingsHandlerSpy.mock.calls.length;

      // Second access
      const settings2 = handler._settings;
      const secondCallCount = settingsHandlerSpy.mock.calls.length;

      expect(settings1).toBe(settings2);
      expect(secondCallCount).toBe(firstCallCount); // No additional calls
    });

    it('should return fallback settings on error', () => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
      vi.spyOn(handler.settingsHandler, 'getSettingValue').mockImplementation(
        () => {
          throw new Error('Settings error');
        }
      );

      const settings = handler._settings;

      expect(settings).toBeDefined();
      expect(settings.useModule).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getTileAlsoFade', () => {
    beforeEach(() => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
    });

    it('should return false for null tile', () => {
      const result = handler.getTileAlsoFade(null);

      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'getTileAlsoFade called with invalid tile parameter'
      );
    });

    it('should return false for undefined tile', () => {
      const result = handler.getTileAlsoFade(undefined);

      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return false for non-object tile', () => {
      const result = handler.getTileAlsoFade('not an object');

      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return false if tile does not have getFlag method', () => {
      const invalidTile = { id: 'tile1' };

      const result = handler.getTileAlsoFade(invalidTile);

      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Tile does not have getFlag method'
      );
    });

    it('should return true when alsoFade flag is true', () => {
      const tile = {
        getFlag: vi.fn().mockReturnValue(true),
      };

      const result = handler.getTileAlsoFade(tile);

      expect(result).toBe(true);
      expect(tile.getFlag).toHaveBeenCalledWith('test-module', 'alsoFade');
    });

    it('should return false when alsoFade flag is false', () => {
      const tile = {
        getFlag: vi.fn().mockReturnValue(false),
      };

      const result = handler.getTileAlsoFade(tile);

      expect(result).toBe(false);
    });

    it('should return false when alsoFade flag is undefined', () => {
      const tile = {
        getFlag: vi.fn().mockReturnValue(undefined),
      };

      const result = handler.getTileAlsoFade(tile);

      expect(result).toBe(false);
    });

    it('should handle getFlag errors gracefully', () => {
      const tile = {
        getFlag: vi.fn().mockImplementation(() => {
          throw new Error('getFlag error');
        }),
      };

      const result = handler.getTileAlsoFade(tile);

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('setTileAlsoFade', () => {
    beforeEach(() => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
    });

    it('should return resolved promise for null tile', async () => {
      const result = await handler.setTileAlsoFade(null, true);

      expect(result).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'setTileAlsoFade called with invalid tile parameter'
      );
    });

    it('should return resolved promise for undefined tile', async () => {
      const result = await handler.setTileAlsoFade(undefined, true);

      expect(result).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return resolved promise if tile does not have setFlag method', async () => {
      const invalidTile = { id: 'tile1' };

      const result = await handler.setTileAlsoFade(invalidTile, true);

      expect(result).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Tile does not have setFlag method'
      );
    });

    it('should convert non-boolean values to boolean', async () => {
      const tile = {
        setFlag: vi.fn().mockResolvedValue({ id: 'tile1' }),
      };

      await handler.setTileAlsoFade(tile, 'truthy string');

      expect(tile.setFlag).toHaveBeenCalledWith(
        'test-module',
        'alsoFade',
        true
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('non-boolean value')
      );
    });

    it('should set alsoFade flag to true', async () => {
      const mockResult = { id: 'tile1', updated: true };
      const tile = {
        setFlag: vi.fn().mockResolvedValue(mockResult),
      };

      const result = await handler.setTileAlsoFade(tile, true);

      expect(result).toBe(mockResult);
      expect(tile.setFlag).toHaveBeenCalledWith(
        'test-module',
        'alsoFade',
        true
      );
    });

    it('should set alsoFade flag to false', async () => {
      const mockResult = { id: 'tile1', updated: true };
      const tile = {
        setFlag: vi.fn().mockResolvedValue(mockResult),
      };

      const result = await handler.setTileAlsoFade(tile, false);

      expect(result).toBe(mockResult);
      expect(tile.setFlag).toHaveBeenCalledWith(
        'test-module',
        'alsoFade',
        false
      );
    });

    it('should throw error when setFlag fails', async () => {
      const tile = {
        setFlag: vi.fn().mockRejectedValue(new Error('setFlag error')),
      };

      await expect(handler.setTileAlsoFade(tile, true)).rejects.toThrow(
        'setFlag error'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('toggleTileAlsoFade', () => {
    beforeEach(() => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
    });

    it('should return resolved promise for invalid tile', async () => {
      const result = await handler.toggleTileAlsoFade(null);

      expect(result).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should toggle from false to true', async () => {
      const mockResult = { id: 'tile1', updated: true };
      const tile = {
        getFlag: vi.fn().mockReturnValue(false),
        setFlag: vi.fn().mockResolvedValue(mockResult),
      };

      const result = await handler.toggleTileAlsoFade(tile);

      expect(result).toBe(mockResult);
      expect(tile.setFlag).toHaveBeenCalledWith(
        'test-module',
        'alsoFade',
        true
      );
    });

    it('should toggle from true to false', async () => {
      const mockResult = { id: 'tile1', updated: true };
      const tile = {
        getFlag: vi.fn().mockReturnValue(true),
        setFlag: vi.fn().mockResolvedValue(mockResult),
      };

      const result = await handler.toggleTileAlsoFade(tile);

      expect(result).toBe(mockResult);
      expect(tile.setFlag).toHaveBeenCalledWith(
        'test-module',
        'alsoFade',
        false
      );
    });

    it('should throw error when toggle fails', async () => {
      const tile = {
        getFlag: vi.fn().mockReturnValue(true),
        setFlag: vi.fn().mockRejectedValue(new Error('toggle error')),
      };

      await expect(handler.toggleTileAlsoFade(tile)).rejects.toThrow(
        'toggle error'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getSceneOverrides', () => {
    beforeEach(() => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
    });

    it('should return empty object for null scene', () => {
      const result = handler.getSceneOverrides(null);

      expect(result).toEqual({});
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'getSceneOverrides called with invalid scene parameter'
      );
    });

    it('should return empty object if scene does not have getFlag method', () => {
      const invalidScene = { id: 'scene1' };

      const result = handler.getSceneOverrides(invalidScene);

      expect(result).toEqual({});
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Scene does not have getFlag method'
      );
    });

    it('should return scene overrides', () => {
      const mockOverrides = { fadeDistance: 100, opacity: 0.5 };
      const scene = {
        getFlag: vi.fn().mockReturnValue(mockOverrides),
      };

      const result = handler.getSceneOverrides(scene);

      expect(result).toEqual(mockOverrides);
      expect(scene.getFlag).toHaveBeenCalledWith('test-module', 'overrides');
    });

    it('should return empty object when overrides are undefined', () => {
      const scene = {
        getFlag: vi.fn().mockReturnValue(undefined),
      };

      const result = handler.getSceneOverrides(scene);

      expect(result).toEqual({});
    });

    it('should handle getFlag errors gracefully', () => {
      const scene = {
        getFlag: vi.fn().mockImplementation(() => {
          throw new Error('getFlag error');
        }),
      };

      const result = handler.getSceneOverrides(scene);

      expect(result).toEqual({});
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('setSceneOverrides', () => {
    beforeEach(() => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
    });

    it('should return resolved promise for invalid scene', async () => {
      const result = await handler.setSceneOverrides(null, {});

      expect(result).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle invalid overrides parameter', async () => {
      const mockResult = { id: 'scene1' };
      const scene = {
        setFlag: vi.fn().mockResolvedValue(mockResult),
      };

      await handler.setSceneOverrides(scene, null);

      expect(scene.setFlag).toHaveBeenCalledWith(
        'test-module',
        'overrides',
        {}
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'setSceneOverrides called with invalid overrides parameter'
      );
    });

    it('should set scene overrides', async () => {
      const mockOverrides = { fadeDistance: 100 };
      const mockResult = { id: 'scene1' };
      const scene = {
        setFlag: vi.fn().mockResolvedValue(mockResult),
      };

      const result = await handler.setSceneOverrides(scene, mockOverrides);

      expect(result).toBe(mockResult);
      expect(scene.setFlag).toHaveBeenCalledWith(
        'test-module',
        'overrides',
        mockOverrides
      );
    });

    it('should throw error when setFlag fails', async () => {
      const scene = {
        setFlag: vi.fn().mockRejectedValue(new Error('setFlag error')),
      };

      await expect(handler.setSceneOverrides(scene, {})).rejects.toThrow(
        'setFlag error'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('setSceneOverride', () => {
    beforeEach(() => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
    });

    it('should return resolved promise for invalid scene', async () => {
      const result = await handler.setSceneOverride(null, 'key', 'value');

      expect(result).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return resolved promise for invalid key', async () => {
      const scene = {
        getFlag: vi.fn().mockReturnValue({}),
        setFlag: vi.fn().mockResolvedValue({}),
      };

      const result = await handler.setSceneOverride(scene, null, 'value');

      expect(result).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'setSceneOverride called with invalid key parameter'
      );
    });

    it('should set a single scene override', async () => {
      const existingOverrides = { fadeDistance: 100 };
      const mockResult = { id: 'scene1' };
      const scene = {
        getFlag: vi.fn().mockReturnValue(existingOverrides),
        setFlag: vi.fn().mockResolvedValue(mockResult),
      };

      const result = await handler.setSceneOverride(scene, 'opacity', 0.5);

      expect(result).toBe(mockResult);
      expect(scene.setFlag).toHaveBeenCalledWith('test-module', 'overrides', {
        fadeDistance: 100,
        opacity: 0.5,
      });
    });
  });

  describe('getTileOverrides', () => {
    beforeEach(() => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
    });

    it('should return empty object for null tile', () => {
      const result = handler.getTileOverrides(null);

      expect(result).toEqual({});
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should return tile overrides', () => {
      const mockOverrides = { opacity: 0.5 };
      const tile = {
        getFlag: vi.fn().mockReturnValue(mockOverrides),
      };

      const result = handler.getTileOverrides(tile);

      expect(result).toEqual(mockOverrides);
      expect(tile.getFlag).toHaveBeenCalledWith('test-module', 'overrides');
    });
  });

  describe('setTileOverrides', () => {
    beforeEach(() => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
    });

    it('should return resolved promise for invalid tile', async () => {
      const result = await handler.setTileOverrides(null, {});

      expect(result).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should set tile overrides', async () => {
      const mockOverrides = { opacity: 0.5 };
      const mockResult = { id: 'tile1' };
      const tile = {
        setFlag: vi.fn().mockResolvedValue(mockResult),
      };

      const result = await handler.setTileOverrides(tile, mockOverrides);

      expect(result).toBe(mockResult);
      expect(tile.setFlag).toHaveBeenCalledWith(
        'test-module',
        'overrides',
        mockOverrides
      );
    });
  });

  describe('setTileOverride', () => {
    beforeEach(() => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
    });

    it('should return resolved promise for invalid tile', async () => {
      const result = await handler.setTileOverride(null, 'key', 'value');

      expect(result).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should set a single tile override', async () => {
      const existingOverrides = { opacity: 0.5 };
      const mockResult = { id: 'tile1' };
      const tile = {
        getFlag: vi.fn().mockReturnValue(existingOverrides),
        setFlag: vi.fn().mockResolvedValue(mockResult),
      };

      const result = await handler.setTileOverride(tile, 'fadeSpeed', 1000);

      expect(result).toBe(mockResult);
      expect(tile.setFlag).toHaveBeenCalledWith('test-module', 'overrides', {
        opacity: 0.5,
        fadeSpeed: 1000,
      });
    });
  });

  describe('collectAlsoFadeTiles', () => {
    beforeEach(() => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
    });

    it('should return empty array when no tiles exist', () => {
      vi.spyOn(handler.tileHandler, 'getAll').mockReturnValue([]);

      const result = handler.collectAlsoFadeTiles();

      expect(result).toEqual([]);
      expect(handler.alsoFadeTilesCache.size).toBe(0);
    });

    it('should return empty array when tiles is null', () => {
      vi.spyOn(handler.tileHandler, 'getAll').mockReturnValue(null);

      const result = handler.collectAlsoFadeTiles();

      expect(result).toEqual([]);
      expect(handler.alsoFadeTilesCache.size).toBe(0);
    });

    it('should collect tiles with alsoFade enabled', () => {
      const tile1 = { id: 'tile1', getFlag: vi.fn().mockReturnValue(true) };
      const tile2 = { id: 'tile2', getFlag: vi.fn().mockReturnValue(false) };
      const tile3 = { id: 'tile3', getFlag: vi.fn().mockReturnValue(true) };

      vi.spyOn(handler.tileHandler, 'getAll').mockReturnValue([
        tile1,
        tile2,
        tile3,
      ]);

      const result = handler.collectAlsoFadeTiles();

      expect(result).toHaveLength(2);
      expect(result).toContain(tile1);
      expect(result).toContain(tile3);
      expect(result).not.toContain(tile2);
    });

    it('should update cache when updateCache is true', () => {
      const tile1 = { id: 'tile1', getFlag: vi.fn().mockReturnValue(true) };
      const tile2 = { id: 'tile2', getFlag: vi.fn().mockReturnValue(true) };

      vi.spyOn(handler.tileHandler, 'getAll').mockReturnValue([tile1, tile2]);

      handler.collectAlsoFadeTiles(true, true);

      expect(handler.alsoFadeTilesCache.size).toBe(2);
      expect(handler.alsoFadeTilesCache.has(tile1)).toBe(true);
      expect(handler.alsoFadeTilesCache.has(tile2)).toBe(true);
    });

    it('should not update cache when updateCache is false', () => {
      const tile1 = { id: 'tile1', getFlag: vi.fn().mockReturnValue(true) };

      vi.spyOn(handler.tileHandler, 'getAll').mockReturnValue([tile1]);

      handler.collectAlsoFadeTiles(false, true);

      expect(handler.alsoFadeTilesCache.size).toBe(0);
    });

    it('should return undefined when returnValue is false', () => {
      const tile1 = { id: 'tile1', getFlag: vi.fn().mockReturnValue(true) };

      vi.spyOn(handler.tileHandler, 'getAll').mockReturnValue([tile1]);

      const result = handler.collectAlsoFadeTiles(true, false);

      expect(result).toBeUndefined();
      expect(handler.alsoFadeTilesCache.size).toBe(1);
    });

    it('should clear cache when no tiles with alsoFade are found', () => {
      const tile1 = { id: 'tile1', getFlag: vi.fn().mockReturnValue(false) };

      // Add some tiles to cache first
      handler._alsoFadeTilesCache.add(tile1);
      expect(handler.alsoFadeTilesCache.size).toBe(1);

      vi.spyOn(handler.tileHandler, 'getAll').mockReturnValue([tile1]);

      handler.collectAlsoFadeTiles(true, true);

      expect(handler.alsoFadeTilesCache.size).toBe(0);
    });

    it('should handle tile errors gracefully', () => {
      const tile1 = { id: 'tile1', getFlag: vi.fn().mockReturnValue(true) };
      const tile2 = {
        id: 'tile2',
        getFlag: vi.fn().mockImplementation(() => {
          throw new Error('getFlag error');
        }),
      };

      vi.spyOn(handler.tileHandler, 'getAll').mockReturnValue([tile1, tile2]);

      const result = handler.collectAlsoFadeTiles();

      expect(result).toHaveLength(1);
      expect(result).toContain(tile1);
      // The error is caught in getTileAlsoFade and logged there
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return empty array on error', () => {
      vi.spyOn(handler.tileHandler, 'getAll').mockImplementation(() => {
        throw new Error('getAll error');
      });

      const result = handler.collectAlsoFadeTiles();

      expect(result).toEqual([]);
      expect(handler.alsoFadeTilesCache.size).toBe(0);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('alsoFadeTilesCache getter', () => {
    beforeEach(() => {
      handler = new AlsoFadeHandler(mockConfig, mockUtils, mockContext);
    });

    it('should return the internal cache Set', () => {
      const cache = handler.alsoFadeTilesCache;

      expect(cache).toBeInstanceOf(Set);
    });

    it('should return the same Set instance on multiple calls', () => {
      const cache1 = handler.alsoFadeTilesCache;
      const cache2 = handler.alsoFadeTilesCache;

      expect(cache1).toBe(cache2);
    });
  });
});
