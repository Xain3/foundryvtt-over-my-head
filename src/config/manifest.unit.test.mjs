/**
 * @file manifest.unit.test.mjs
 * @description Test file for the manifest module, focusing on delegation to ManifestParser.
 * @path src/config/manifest.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
// Mock the module.json import
vi.mock('../../module.json', () => ({
  default: {
    id: "test-module",
    title: "Test Module",
    description: "A test module",
    version: "1.0.0"
  }
}), { virtual: true });

// Mock the ManifestParser helper
const mockValidatedManifest = {
  id: "test-module",
  title: "Test Module",
  description: "A test module",
  version: "1.0.0"
};

const mockGetValidatedManifest = vi.fn().mockReturnValue(mockValidatedManifest);
const MockManifestParser = vi.fn().mockImplementation(() => ({
  getValidatedManifest: mockGetValidatedManifest
}));

vi.mock('./helpers/manifestParser.mjs', () => ({
  __esModule: true,
  default: MockManifestParser
}));

describe('manifest module delegation', () => {
  let manifestModule;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset modules to ensure fresh imports
    vi.resetModules();

    manifestModule = (await import('./manifest.mjs')).default;
  });

  it('should export the validated manifest object directly', () => {
    expect(manifestModule).toBe(mockValidatedManifest);
  });

  it('should create ManifestParser instance with imported manifest during module initialization', () => {
    expect(MockManifestParser).toHaveBeenCalledWith(expect.objectContaining({
      id: "test-module",
      title: "Test Module",
      description: "A test module",
      version: "1.0.0"
    }));
  });

  it('should call getValidatedManifest during module initialization', () => {
    expect(mockGetValidatedManifest).toHaveBeenCalled();
  });

  it('should verify complete delegation flow', () => {
    const manifest = manifestModule;

    expect(MockManifestParser).toHaveBeenCalledTimes(1);
    expect(mockGetValidatedManifest).toHaveBeenCalledTimes(1);
    expect(manifest).toBe(mockValidatedManifest);
  });
});
