/**
 * @file manifestParser.unit.test.mjs
 * @description Test file for the ManifestParser helper class.
 * @path src/constants/helpers/manifestParser.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import ManifestParser from './manifestParser.mjs';

// Mock the constants
vi.mock('../constants.mjs', () => ({
  __esModule: true,
  default: {
    requiredManifestAttributes: ["id", "title", "description", "version"]
  }
}));

describe('ManifestParser helper class', () => {
  let originalEnv;

  const mockManifestData = {
    id: "test-module",
    title: "Test Module",
    description: "A test module",
    version: "1.0.0",
    author: "Test Author"
  };

  const mockRequiredAttributes = ["id", "title", "description", "version"];

  beforeEach(() => {
    // Save and clean environment
    originalEnv = { ...process.env };
    delete process.env.TEST_MODULE_DEBUG_MODE;
    delete process.env.TEST_MODULE_DEV;
    delete process.env.TM_DEBUG_MODE;
    delete process.env.TM_DEV;
    delete process.env.DEBUG_MODE;
    delete process.env.DEV;
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should initialize with manifest and required attributes', () => {
      const parser = new ManifestParser(mockManifestData);
      expect(parser.manifest).toBe(mockManifestData);
      expect(parser.requiredAttributes).toEqual(mockRequiredAttributes);
    });

    it('should handle null manifest', () => {
      const parser = new ManifestParser(null);
      expect(parser.manifest).toBeNull();
      expect(parser.requiredAttributes).toEqual(mockRequiredAttributes);
    });

    it('should handle undefined manifest', () => {
      const parser = new ManifestParser(undefined);
      expect(parser.manifest).toBeUndefined();
      expect(parser.requiredAttributes).toEqual(mockRequiredAttributes);
    });
  });

  describe('getValidatedManifest', () => {
    it('should return validated and frozen manifest for valid input', () => {
      const parser = new ManifestParser(mockManifestData);
      const result = parser.getValidatedManifest();

      expect(result).toBe(parser.manifest);
      expect(Object.isFrozen(result)).toBe(true);
      expect(result.id).toBe(mockManifestData.id);
    });

    it('should throw error when required attributes are not defined', () => {
      const parser = new ManifestParser(mockManifestData);
      parser.requiredAttributes = null;

      expect(() => parser.getValidatedManifest()).toThrow(
        "Required manifest attributes are not defined in constants."
      );
    });

    it('should throw error when manifest is invalid', () => {
      const parser = new ManifestParser(null);

      expect(() => parser.getValidatedManifest()).toThrow(
        "Manifest data is not available."
      );
    });

    it('should throw error when manifest is missing required attributes', () => {
      const incompleteManifest = { id: "test" };
      const parser = new ManifestParser(incompleteManifest);

      expect(() => parser.getValidatedManifest()).toThrow(
        "Manifest is missing required attribute: title"
      );
    });

    it('should apply environment variable overrides to flags', () => {
      const manifestWithFlags = {
        ...mockManifestData,
        flags: {
          debugMode: false,
          dev: false
        }
      };
      
      // Set environment variables
      process.env.TEST_MODULE_DEBUG_MODE = 'true';
      
      const parser = new ManifestParser(manifestWithFlags);
      const result = parser.getValidatedManifest();
      
      expect(result.flags.debugMode).toBe(true);
      expect(result.flags.dev).toBe(false);
      
      // Clean up
      delete process.env.TEST_MODULE_DEBUG_MODE;
    });

    it('should not modify flags if no environment overrides exist', () => {
      const manifestWithFlags = {
        ...mockManifestData,
        flags: {
          debugMode: false,
          dev: true
        }
      };
      
      const parser = new ManifestParser(manifestWithFlags);
      const result = parser.getValidatedManifest();
      
      expect(result.flags.debugMode).toBe(false);
      expect(result.flags.dev).toBe(true);
    });

    it('should handle manifest without flags', () => {
      const parser = new ManifestParser(mockManifestData);
      const result = parser.getValidatedManifest();
      
      expect(result).toBeDefined();
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('should handle manifest with null flags', () => {
      const manifestWithNullFlags = {
        ...mockManifestData,
        flags: null
      };
      
      const parser = new ManifestParser(manifestWithNullFlags);
      const result = parser.getValidatedManifest();
      
      expect(result).toBeDefined();
      expect(result.flags).toBeNull();
    });
  });
});