/**
 * @file manifestParser.unit.test.js
 * @description Test file for the ManifestParser helper class.
 * @path src/constants/helpers/manifestParser.unit.test.js
 */

import ManifestParser from './manifestParser.js';

// Mock the constants
jest.mock('../constants.js', () => ({
  __esModule: true,
  default: {
    requiredManifestAttributes: ["id", "title", "description", "version"]
  }
}));

describe('ManifestParser helper class', () => {
  const mockManifestData = {
    id: "test-module",
    title: "Test Module",
    description: "A test module",
    version: "1.0.0",
    author: "Test Author"
  };

  const mockRequiredAttributes = ["id", "title", "description", "version"];

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
  });
});