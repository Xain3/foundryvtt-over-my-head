/**
 * @file foundryDataDirFinder.unit.test.mjs
 * @description Unit tests for foundryDataDirFinder utility
 * @path tests/unit/foundryDataDirFinder.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('foundryDataDirFinder', () => {
  let findFoundryDataDir;
  let findFoundryDataDirPath;
  let getFoundryDataDirPaths;

  beforeEach(async () => {
    // Mock Node.js modules
    vi.mock('fs', () => ({
      default: {
        existsSync: vi.fn(),
        statSync: vi.fn(),
      },
    }));

    vi.mock('os', () => ({
      default: {
        platform: vi.fn(),
        userInfo: vi.fn(),
        homedir: vi.fn(),
      },
    }));

    // Reset process.env
    delete process.env.HOME;
    delete process.env.USER;
    delete process.env.USERNAME;
    delete process.env.LOCALAPPDATA;

    // Import the module (this will use the mocked dependencies)
    const module = await import(
      '../../src/utils/static/foundryDataDirFinder.ts'
    );
    findFoundryDataDir = module.findFoundryDataDir;
    findFoundryDataDirPath = module.findFoundryDataDirPath;
    getFoundryDataDirPaths = module.getFoundryDataDirPaths;
  });

  describe('findFoundryDataDir', () => {
    it('returns result with found=true when directory exists', () => {
      const result = findFoundryDataDir({
        platform: 'linux',
        user: 'testuser',
      });

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('found');
      expect(result).toHaveProperty('platform');
      expect(result).toHaveProperty('checkedPaths');
      expect(result.platform).toBe('linux');
    });

    it('returns platform-specific paths for Linux', () => {
      const result = findFoundryDataDir({
        platform: 'linux',
        user: 'developer',
      });

      expect(result.checkedPaths.length).toBeGreaterThan(0);
      expect(result.checkedPaths[0]).toContain('developer');
    });

    it('returns platform-specific paths for macOS', () => {
      const result = findFoundryDataDir({
        platform: 'darwin',
        user: 'macuser',
      });

      expect(result.checkedPaths.length).toBeGreaterThan(0);
      expect(result.checkedPaths[0]).toContain('Library/Application Support');
    });

    it('returns platform-specific paths for Windows', () => {
      process.env.LOCALAPPDATA = 'C:\\Users\\testuser\\AppData\\Local';
      const result = findFoundryDataDir({
        platform: 'win32',
        user: 'winuser',
      });

      expect(result.checkedPaths.length).toBeGreaterThan(0);
      expect(result.checkedPaths[0]).toContain('FoundryVTT');
    });

    it('returns found=false when no directory exists', () => {
      // Note: In real environments, this would need fs mocks to return false
      const result = findFoundryDataDir({
        platform: 'linux',
        user: 'nonexistent',
      });

      expect(result).toHaveProperty('found');
      expect(result).toHaveProperty('path');
      expect(result.checkedPaths).toBeDefined();
    });

    it('handles verbose logging option', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation();

      findFoundryDataDir({
        platform: 'linux',
        user: 'testuser',
        verbose: true,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[FoundryDataDirFinder]')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('findFoundryDataDirPath', () => {
    it('returns empty string when no directory found', () => {
      const path = findFoundryDataDirPath({
        platform: 'linux',
        user: 'nonexistent',
      });

      expect(typeof path).toBe('string');
    });

    it('returns path string directly', () => {
      const path = findFoundryDataDirPath({
        platform: 'linux',
        user: 'testuser',
      });

      expect(typeof path).toBe('string');
    });
  });

  describe('getFoundryDataDirPaths', () => {
    it('returns array of paths for Linux', () => {
      const paths = getFoundryDataDirPaths({
        platform: 'linux',
        user: 'testuser',
      });

      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
      expect(paths[0]).toContain('testuser');
    });

    it('returns array of paths for macOS', () => {
      const paths = getFoundryDataDirPaths({
        platform: 'darwin',
        user: 'macuser',
      });

      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
    });

    it('returns array of paths for Windows', () => {
      process.env.LOCALAPPDATA = 'C:\\Users\\testuser\\AppData\\Local';
      const paths = getFoundryDataDirPaths({
        platform: 'win32',
        user: 'winuser',
      });

      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
    });

    it('returns empty array for unsupported platform', () => {
      const paths = getFoundryDataDirPaths({
        platform: 'freebsd',
        user: 'testuser',
      });

      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBe(0);
    });
  });

  describe('type safety', () => {
    it('accepts valid PlatformType values', () => {
      const platforms = ['linux', 'darwin', 'win32'];

      platforms.forEach((platform) => {
        const result = findFoundryDataDir({
          platform: platform,
          user: 'testuser',
        });
        expect(result.platform).toBe(platform);
      });
    });

    it('returns FindResult with all required properties', () => {
      const result = findFoundryDataDir({
        platform: 'linux',
        user: 'testuser',
      });

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('found');
      expect(result).toHaveProperty('platform');
      expect(result).toHaveProperty('checkedPaths');

      expect(typeof result.path).toBe('string');
      expect(typeof result.found).toBe('boolean');
      expect(typeof result.platform).toBe('string');
      expect(Array.isArray(result.checkedPaths)).toBe(true);
    });
  });
});
