/**
 * @file manifest.unit.test.js
 * @description Test file for the manifest module, focusing on delegation to ManifestParser.
 * @path src/constants/manifest.unit.test.js
 */

// Mock the module.json import
jest.mock('../../module.json', () => ({
  id: "test-module",
  title: "Test Module",
  description: "A test module",
  version: "1.0.0"
}), { virtual: true });

// Mock the ManifestParser helper
const mockValidatedManifest = {
  id: "test-module",
  title: "Test Module",
  description: "A test module",
  version: "1.0.0"
};

const mockGetValidatedManifest = jest.fn().mockReturnValue(mockValidatedManifest);
const MockManifestParser = jest.fn().mockImplementation(() => ({
  getValidatedManifest: mockGetValidatedManifest
}));

jest.mock('./helpers/manifestParser.mjs', () => ({
  __esModule: true,
  default: MockManifestParser
}));

describe('manifest module delegation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset modules to ensure fresh imports
    jest.resetModules();
  });

  it('should export the validated manifest object directly', () => {
    const manifest = require('./manifest.mjs').default;
    expect(manifest).toBe(mockValidatedManifest);
  });

  it('should create ManifestParser instance with imported manifest during module initialization', () => {
    // Import the module to trigger initialization
    require('./manifest.mjs');

    expect(MockManifestParser).toHaveBeenCalledWith(expect.objectContaining({
      id: "test-module",
      title: "Test Module",
      description: "A test module",
      version: "1.0.0"
    }));
  });

  it('should call getValidatedManifest during module initialization', () => {
    // Import the module to trigger initialization
    require('./manifest.mjs');

    expect(mockGetValidatedManifest).toHaveBeenCalled();
  });

  it('should verify complete delegation flow', () => {
    // Import the module to trigger initialization
    const manifest = require('./manifest.mjs').default;

    // Verify that ManifestParser was called exactly once
    expect(MockManifestParser).toHaveBeenCalledTimes(1);

    // Verify that getValidatedManifest was called exactly once
    expect(mockGetValidatedManifest).toHaveBeenCalledTimes(1);

    // Verify the result is what ManifestParser returned
    expect(manifest).toBe(mockValidatedManifest);
  });
});
