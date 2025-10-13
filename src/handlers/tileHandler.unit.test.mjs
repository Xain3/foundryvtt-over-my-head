/**
 * @file tileHandler.unit.test.mjs
 * @description Unit tests for TileHandler.
 * @path src/handlers/tileHandler.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('./placeableHandler.mjs', () => {
  const MockPlaceableHandler = vi.fn().mockImplementation(function (
    config,
    context,
    utils,
    placeableType = null
  ) {
    this.config = config;
    this.context = context;
    this.utils = utils;
    this.placeableType = placeableType;
    this.getter = {};
  });
  return { default: MockPlaceableHandler };
});

vi.mock('./placeableHelpers/tileChecker.mjs', () => {
  const MockTileChecker = vi
    .fn()
    .mockImplementation(function (config, context, utils, placeableGetter) {
      this.config = config;
      this.context = context;
      this.utils = utils;
      this.placeableGetter = placeableGetter;
    });
  return { default: MockTileChecker };
});

vi.mock('#config', () => ({
  default: {
    constants: { mockConstants: true },
    manifest: { id: 'test-module' },
  },
}));

import TileHandler from './tileHandler.mjs';
import PlaceableHandler from './placeableHandler.mjs';
import TileChecker from './placeableHelpers/tileChecker.mjs';

describe('TileHandler', () => {
  let tileHandler;
  let mockConfig;
  let mockContext;
  let mockUtils;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = { someConfig: 'value' };
    mockContext = { someContext: 'value' };
    mockUtils = { someUtil: vi.fn() };

    tileHandler = new TileHandler(mockConfig, mockContext, mockUtils);
  });

  describe('constructor', () => {
    it('should initialize with the provided parameters and call super with correct type', () => {
      expect(PlaceableHandler).toHaveBeenCalledWith(
        mockConfig,
        mockContext,
        mockUtils,
        'tiles'
      );
      expect(tileHandler).toBeInstanceOf(PlaceableHandler);
    });

    it('should create a TileChecker instance', () => {
      expect(TileChecker).toHaveBeenCalledWith(
        mockConfig,
        mockContext,
        mockUtils,
        tileHandler.getter
      );
      expect(tileHandler.checker).toBeInstanceOf(TileChecker);
    });

    it('should accept custom type parameter', () => {
      const customType = 'customTiles';
      const handlerWithType = new TileHandler(
        mockConfig,
        mockContext,
        mockUtils,
        customType
      );
      expect(PlaceableHandler).toHaveBeenCalledWith(
        mockConfig,
        mockContext,
        mockUtils,
        customType
      );
      expect(handlerWithType).toBeInstanceOf(PlaceableHandler);
    });
  });

  describe('inheritance', () => {
    it('should inherit methods from PlaceableHandler', () => {
      expect(tileHandler).toBeInstanceOf(PlaceableHandler);
    });
  });
});
