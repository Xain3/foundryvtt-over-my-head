/**
 * @file foundryDataDirFinder.unit.test.mjs
 * @description Unit tests for foundryDataDirFinder utility, including override precedence
 * @path tests/unit/foundryDataDirFinder.unit.test.mjs
 */

import { mkdtempSync, rmSync, existsSync as fsExistsSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('foundryDataDirFinder', () => {
  let findFoundryDataDir;
  let findFoundryDataDirPath;
  let getFoundryDataDirPaths;
  /** @type {Record<string, string | undefined>} */
  let originalEnv;
  /** @type {Set<string>} */
  const tempDirs = new Set();

  /**
   * Creates a temporary directory and registers it for cleanup.
   *
   * @returns {string} Absolute path to the created directory
   */
  function createTempDir() {
    const dir = mkdtempSync(path.join(tmpdir(), 'omh-finder-'));
    tempDirs.add(dir);
    return dir;
  }

  beforeEach(async () => {
    vi.resetModules();

    originalEnv = {
      HOME: process.env.HOME,
      USER: process.env.USER,
      USERNAME: process.env.USERNAME,
      LOCALAPPDATA: process.env.LOCALAPPDATA,
      FOUNDRY_DATA_DIR: process.env.FOUNDRY_DATA_DIR,
      OMH_FOUNDRY_DATA_DIR: process.env.OMH_FOUNDRY_DATA_DIR,
    };

    delete process.env.HOME;
    delete process.env.USER;
    delete process.env.USERNAME;
    delete process.env.LOCALAPPDATA;
    delete process.env.FOUNDRY_DATA_DIR;
    delete process.env.OMH_FOUNDRY_DATA_DIR;

    const module = await import(
      '../../src/utils/static/foundryDataDirFinder.ts'
    );
    findFoundryDataDir = module.findFoundryDataDir;
    findFoundryDataDirPath = module.findFoundryDataDirPath;
    getFoundryDataDirPaths = module.getFoundryDataDirPaths;

    if (!process.env.LOCALAPPDATA) {
      process.env.LOCALAPPDATA = path.join(tmpdir(), 'omh-local-app-data');
    }
  });

  afterEach(() => {
    if (originalEnv) {
      Object.entries(originalEnv).forEach(([key, value]) => {
        if (typeof value === 'undefined') {
          delete process.env[key];
          return;
        }

        process.env[key] = value;
      });
    }

    originalEnv = undefined;

    tempDirs.forEach((dir) => {
      if (fsExistsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
      }
    });
    tempDirs.clear();

    vi.resetModules();
  });

  describe('findFoundryDataDir', () => {
    it('returns platform-specific paths for Linux', () => {
      const result = findFoundryDataDir({
        platform: 'linux',
        user: 'developer',
      });

      expect(result.checkedPaths.length).toBeGreaterThan(0);
      expect(result.checkedPaths[0]).toContain('developer');
    });

    it('honors explicit path argument with highest precedence', () => {
      const explicitDir = createTempDir();

      const result = findFoundryDataDir({
        path: explicitDir,
        platform: 'linux',
        user: 'fallback',
      });

      expect(result.path).toBe(explicitDir);
      expect(result.found).toBe(true);
      expect(result.checkedPaths[0]).toBe(explicitDir);
    });

    it('prefers environment variable over config and defaults', () => {
      const envDir = createTempDir();
      process.env.FOUNDRY_DATA_DIR = envDir;

      const configOverride = {
        prefix: 'OMH',
        env: { OMH_FOUNDRY_DATA_DIR: '/config/env/path' },
        constants: {
          paths: { foundryDataDirPath: '/config/constant/path' },
        },
      };

      const result = findFoundryDataDir({
        platform: 'linux',
        user: 'testuser',
        config: configOverride,
      });

      expect(result.path).toBe(envDir);
      expect(result.checkedPaths[0]).toBe(envDir);
    });

    it('uses config env override when environment variable missing', () => {
      const configEnvDir = createTempDir();

      const configOverride = {
        prefix: 'OMH',
        env: { OMH_FOUNDRY_DATA_DIR: configEnvDir },
        constants: {
          paths: { foundryDataDirPath: '/config/constant/path' },
        },
      };

      const result = findFoundryDataDir({
        platform: 'linux',
        user: 'testuser',
        config: configOverride,
      });

      expect(result.path).toBe(configEnvDir);
      expect(result.checkedPaths[0]).toBe(configEnvDir);
    });

    it('uses config constants when no higher override exists', () => {
      const configConstantDir = createTempDir();

      const configOverride = {
        prefix: 'OMH',
        env: {},
        constants: {
          paths: { foundryDataDirPath: configConstantDir },
        },
      };

      const result = findFoundryDataDir({
        platform: 'linux',
        user: 'testuser',
        config: configOverride,
      });

      expect(result.path).toBe(configConstantDir);
      expect(result.checkedPaths[0]).toBe(configConstantDir);
    });

    it('uses config defaults before hardcoded defaults', () => {
      const configDefaultDir = createTempDir();

      const configOverride = {
        prefix: 'OMH',
        env: {},
        constants: {
          defaults: {
            paths: {
              foundryDataDirPath: {
                linux: [configDefaultDir],
              },
            },
          },
        },
      };

      const result = findFoundryDataDir({
        platform: 'linux',
        user: 'testuser',
        config: configOverride,
      });

      expect(result.path).toBe(configDefaultDir);
      expect(result.checkedPaths[0]).toBe(configDefaultDir);
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
      const result = findFoundryDataDir({
        platform: 'win32',
        user: 'winuser',
      });

      expect(result.checkedPaths.length).toBeGreaterThan(0);
      expect(result.checkedPaths[0]).toContain('FoundryVTT');
    });

    it('prioritizes LOCALAPPDATA-backed defaults for Windows', () => {
      const fakeLocalAppData = createTempDir();
      process.env.LOCALAPPDATA = fakeLocalAppData;

      const result = findFoundryDataDir({
        platform: 'win32',
        user: 'winuser',
      });

      expect(result.checkedPaths[0]).toBe(`${fakeLocalAppData}/FoundryVTT`);
    });

    it('returns found=false when no directory exists', () => {
      const result = findFoundryDataDir({
        platform: 'linux',
        user: 'nonexistent',
      });

      expect(result.found).toBe(false);
      expect(result.checkedPaths.length).toBeGreaterThan(0);
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
      const pathResult = findFoundryDataDirPath({
        platform: 'linux',
        user: 'nonexistent',
      });

      expect(pathResult).toBe('');
    });

    it('returns path string directly when directory exists', () => {
      const explicitDir = createTempDir();

      const pathResult = findFoundryDataDirPath({
        path: explicitDir,
        platform: 'linux',
        user: 'testuser',
      });

      expect(pathResult).toBe(explicitDir);
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

    it('includes overrides in priority order', () => {
      const configOverride = {
        prefix: 'OMH',
        env: { OMH_FOUNDRY_DATA_DIR: '/config/env/path' },
        constants: {
          defaults: {
            paths: {
              foundryDataDirPath: {
                linux: ['/config/default/path'],
              },
            },
          },
          paths: { foundryDataDirPath: '/config/constant/path' },
        },
      };
      process.env.FOUNDRY_DATA_DIR = '/env/path';

      const paths = getFoundryDataDirPaths({
        platform: 'linux',
        user: 'testuser',
        path: '/explicit/path',
        config: configOverride,
      });

      expect(paths[0]).toBe('/explicit/path');
      expect(paths[1]).toBe('/env/path');
      expect(paths[2]).toBe('/config/env/path');
      expect(paths[3]).toBe('/config/constant/path');
      expect(paths[4]).toBe('/config/default/path');
    });

    it('returns array of paths for macOS', () => {
      const paths = getFoundryDataDirPaths({
        platform: 'darwin',
        user: 'macuser',
      });

      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
    });

    it('resolves template placeholders in config defaults', () => {
      const configOverride = {
        constants: {
          defaults: {
            paths: {
              foundryDataDirPath: {
                linux: [
                  '/opt/${user}/FoundryCustom',
                  '${getHomeDir(user)}/Library/FoundryCustom',
                ],
              },
            },
          },
        },
      };

      const paths = getFoundryDataDirPaths({
        platform: 'linux',
        user: 'testuser',
        config: configOverride,
      });

      expect(paths).toContain('/opt/testuser/FoundryCustom');
      expect(paths).toContain('/home/testuser/Library/FoundryCustom');
    });

    it('returns array of paths for Windows', () => {
      const paths = getFoundryDataDirPaths({
        platform: 'win32',
        user: 'winuser',
      });

      expect(Array.isArray(paths)).toBe(true);
      expect(paths.length).toBeGreaterThan(0);
    });

    it('resolves getLocalAppData template placeholders for Windows defaults', () => {
      const fakeLocalAppData = path.join(tmpdir(), 'omh-local-app-data-win');
      process.env.LOCALAPPDATA = fakeLocalAppData;

      const configOverride = {
        constants: {
          defaults: {
            paths: {
              foundryDataDirPath: {
                win32: ['${getLocalAppData()}/CustomFoundry'],
              },
            },
          },
        },
      };

      const paths = getFoundryDataDirPaths({
        platform: 'win32',
        user: 'winuser',
        config: configOverride,
      });

      expect(paths).toContain(`${fakeLocalAppData}/CustomFoundry`);
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
          platform,
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
