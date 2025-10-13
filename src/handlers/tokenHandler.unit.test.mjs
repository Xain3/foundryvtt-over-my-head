/**
 * @file tokenHandler.unit.test.mjs
 * @description Unit tests for TokenHandler.
 * @path src/handlers/tokenHandler.unit.test.mjs
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

vi.mock('./placeableHelpers/tokenChecker.mjs', () => {
  const MockTokenChecker = vi
    .fn()
    .mockImplementation(function (config, context, utils, placeableGetter) {
      this.config = config;
      this.context = context;
      this.utils = utils;
      this.placeableGetter = placeableGetter;
    });
  return { default: MockTokenChecker };
});

vi.mock('#config', () => ({
  default: {
    constants: { mockConstants: true },
    manifest: { id: 'test-module' },
  },
}));

import TokenHandler from './tokenHandler.mjs';
import PlaceableHandler from './placeableHandler.mjs';
import TokenChecker from './placeableHelpers/tokenChecker.mjs';

describe('TokenHandler', () => {
  let tokenHandler;
  let mockConfig;
  let mockContext;
  let mockUtils;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = { someConfig: 'value' };
    mockContext = { someContext: 'value' };
    mockUtils = { someUtil: vi.fn() };

    tokenHandler = new TokenHandler(mockConfig, mockContext, mockUtils);
  });

  describe('constructor', () => {
    it('should initialize with the provided parameters and call super with correct type', () => {
      expect(PlaceableHandler).toHaveBeenCalledWith(
        mockConfig,
        mockContext,
        mockUtils,
        'token'
      );
      expect(tokenHandler).toBeInstanceOf(PlaceableHandler);
    });

    it('should create a TokenChecker instance', () => {
      expect(TokenChecker).toHaveBeenCalledWith(
        mockConfig,
        mockContext,
        mockUtils,
        tokenHandler.getter
      );
      expect(tokenHandler.checker).toBeInstanceOf(TokenChecker);
    });
  });

  describe('inheritance', () => {
    it('should inherit methods from PlaceableHandler', () => {
      expect(tokenHandler).toBeInstanceOf(PlaceableHandler);
    });
  });
});
