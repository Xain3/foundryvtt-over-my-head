/**
 * @file tileChecker.unit.test.mjs
 * @description Unit tests for TileChecker.
 * @path src/handlers/placeableHelpers/tileChecker.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('./placeableChecker.mjs', () => {
  const MockPlaceableChecker = vi
    .fn()
    .mockImplementation(function (config, context, utils, placeableGetter) {
      this.config = config;
      this.context = context;
      this.utils = utils;
      this.placeableGetter = placeableGetter;
    });
  return { default: MockPlaceableChecker };
});

vi.mock('#config', () => ({
  default: {
    constants: { mockConstants: true },
    manifest: { id: 'test-module' },
  },
}));

import TileChecker from './tileChecker.mjs';
import PlaceableChecker from './placeableChecker.mjs';

describe('TileChecker', () => {
  let tileChecker;
  let mockConfig;
  let mockContext;
  let mockUtils;
  let mockPlaceableGetter;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = { someConfig: 'value' };
    mockContext = { someContext: 'value' };
    mockUtils = { someUtil: vi.fn() };
    mockPlaceableGetter = { getPosition: vi.fn() };

    tileChecker = new TileChecker(
      mockConfig,
      mockContext,
      mockUtils,
      mockPlaceableGetter
    );
  });

  describe('constructor', () => {
    it('should initialize with the provided parameters and call super', () => {
      expect(PlaceableChecker).toHaveBeenCalledWith(
        mockConfig,
        mockContext,
        mockUtils,
        mockPlaceableGetter
      );
      expect(tileChecker).toBeInstanceOf(PlaceableChecker);
    });
  });

  describe('inheritance', () => {
    it('should inherit methods from PlaceableChecker', () => {
      // Since TileChecker extends PlaceableChecker, it should have access to parent methods
      // We can test this by checking if the instance is an instance of PlaceableChecker
      expect(tileChecker).toBeInstanceOf(PlaceableChecker);
    });
  });
});
