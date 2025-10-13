/**
 * @file tokenChecker.unit.test.mjs
 * @description Unit tests for TokenChecker.
 * @path src/handlers/placeableHelpers/tokenChecker.unit.test.mjs
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
  MockPlaceableChecker.prototype.isControlled = vi.fn();
  return { default: MockPlaceableChecker };
});

vi.mock('#config', () => ({
  default: {
    constants: { mockConstants: true },
    manifest: { id: 'test-module' },
  },
}));

import TokenChecker from './tokenChecker.mjs';
import PlaceableChecker from './placeableChecker.mjs';

describe('TokenChecker', () => {
  let tokenChecker;
  let mockConfig;
  let mockContext;
  let mockUtils;
  let mockPlaceableGetter;
  let mockLogger;

  beforeEach(() => {
    vi.clearAllMocks();

    mockLogger = {
      error: vi.fn(),
    };

    mockConfig = { someConfig: 'value' };
    mockContext = { someContext: 'value' };
    mockUtils = { someUtil: vi.fn(), logger: mockLogger };
    mockPlaceableGetter = { getPosition: vi.fn() };

    tokenChecker = new TokenChecker(
      mockConfig,
      mockContext,
      mockUtils,
      mockPlaceableGetter
    );
    tokenChecker.logger = mockLogger;
  });

  describe('constructor', () => {
    it('should initialize with the provided parameters and call super', () => {
      expect(PlaceableChecker).toHaveBeenCalledWith(
        mockConfig,
        mockContext,
        mockUtils,
        mockPlaceableGetter
      );
      expect(tokenChecker).toBeInstanceOf(PlaceableChecker);
    });
  });

  describe('isOwned', () => {
    it('should return true if token has isOwner property set to true', () => {
      const token = { isOwner: true };
      const result = tokenChecker.isOwned(token);
      expect(result).toBe(true);
    });

    it('should return false if token has isOwner property set to false', () => {
      const token = { isOwner: false };
      const result = tokenChecker.isOwned(token);
      expect(result).toBe(false);
    });

    it('should throw an error and return false if token does not have isOwner property', () => {
      const token = {};
      const result = tokenChecker.isOwned(token);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error checking if token is owned: Token does not have isOwner property or method'
      );
      expect(result).toBe(false);
    });

    it('should handle exceptions and return false', () => {
      const token = null;
      const result = tokenChecker.isOwned(token);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error checking if token is owned: Cannot use 'in' operator to search for 'isOwner' in null"
      );
      expect(result).toBe(false);
    });
  });

  describe('isOwnedAndControlled', () => {
    it('should return false if token is not owned', () => {
      const token = { isOwner: false };
      const result = tokenChecker.isOwnedAndControlled(token);
      expect(result).toBe(false);
    });

    it('should return the result of isControlled if token is owned', () => {
      const token = { isOwner: true };
      PlaceableChecker.prototype.isControlled.mockReturnValue(true);
      const result = tokenChecker.isOwnedAndControlled(token);
      expect(PlaceableChecker.prototype.isControlled).toHaveBeenCalledWith(
        token
      );
      expect(result).toBe(true);
    });
  });

  describe('isOwnedAndSelected', () => {
    it('should delegate to isOwnedAndControlled', () => {
      const token = { isOwner: true };
      vi.spyOn(tokenChecker, 'isOwnedAndControlled').mockReturnValue(true);
      const result = tokenChecker.isOwnedAndSelected(token);
      expect(tokenChecker.isOwnedAndControlled).toHaveBeenCalledWith(token);
      expect(result).toBe(true);
    });
  });
});
