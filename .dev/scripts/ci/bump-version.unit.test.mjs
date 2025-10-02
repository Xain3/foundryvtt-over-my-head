/**
 * @file bump-version.unit.test.mjs
 * @description Unit tests for the hybrid release version bumping script.
 * @path .dev/scripts/ci/bump-version.unit.test.mjs
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

const modulePath = './bump-version.mjs';

describe('bump-version CI helper', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('calculates new version values for supported bump types', async () => {
    const { getNewVersion } = await import(modulePath);

    expect(getNewVersion('1.0.0', 'patch')).toBe('1.0.1');
    expect(getNewVersion('1.0.0', 'minor')).toBe('1.1.0');
    expect(getNewVersion('1.0.0', 'major')).toBe('2.0.0');
  });

  it('updates JSON files respecting dry-run mode', async () => {
    const writeFileSync = vi.fn();
    const readFileSync = vi.fn((targetPath) => {
      if (targetPath.endsWith('package.json')) {
        return JSON.stringify({ version: '1.0.0' });
      }

      throw new Error(`Unexpected read for ${targetPath}`);
    });

    const existsSync = vi.fn(() => true);
    const fsExports = { readFileSync, writeFileSync, existsSync };

    vi.doMock('fs', () => ({
      default: fsExports,
      ...fsExports,
    }));

    const { updateFileVersion } = await import(modulePath);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    updateFileVersion(
      'package.json',
      '1.2.3',
      '1.0.0',
      { rules: { 'package.json': { root: true } } },
      true
    );

    expect(readFileSync).toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('🧪 Would update package.json')
    );

    logSpy.mockRestore();
  });
});
