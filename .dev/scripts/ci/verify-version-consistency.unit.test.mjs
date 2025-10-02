/**
 * @file verify-version-consistency.unit.test.mjs
 * @description Unit tests for the version consistency verification script.
 * @path .dev/scripts/ci/verify-version-consistency.unit.test.mjs
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

const modulePath = './verify-version-consistency.mjs';

describe('verify-version-consistency CI helper', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('parses configured check level from ci-checks.yaml', async () => {
    const fsMock = {
      readFileSync: vi.fn((filePath) => {
        if (filePath.endsWith('ci-checks.yaml')) {
          return 'checkVersionConsistency: 3';
        }

        throw new Error(`Unexpected read for ${filePath}`);
      }),
    };

    vi.doMock('fs', () => fsMock);
    vi.doMock('js-yaml', () => {
      const loader = vi.fn(() => ({ checkVersionConsistency: 3 }));
      return {
        default: { load: loader },
        load: loader,
      };
    });

    const scriptModule = await import(modulePath);
    const level = scriptModule.loadCheckLevel();

    expect(level).toBe(scriptModule.CheckLevel.WARN);
  });

  it('identifies mismatched versions between VERSION and package.json', async () => {
    const fsMock = {
      readFileSync: vi.fn((filePath) => {
        if (filePath.endsWith('VERSION')) {
          return '1.0.0\n';
        }

        if (filePath.endsWith('package.json')) {
          return JSON.stringify({ version: '1.0.1' });
        }

        throw new Error(`Unexpected read for ${filePath}`);
      }),
    };

    vi.doMock('fs', () => fsMock);
    vi.doMock('js-yaml', () => {
      const loader = vi.fn(() => ({}));
      return {
        default: { load: loader },
        load: loader,
      };
    });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const scriptModule = await import(modulePath);
    const { issues } = scriptModule.gatherVersionData();

    expect(Array.isArray(issues)).toBe(true);
    expect(issues).toContainEqual(
      expect.objectContaining({ type: scriptModule.IssueType.MISMATCH })
    );

    consoleSpy.mockRestore();
  });

  it('suppresses missing file issues when configured to fail silently', async () => {
    vi.doMock('fs', () => ({ readFileSync: vi.fn() }));
    vi.doMock('js-yaml', () => {
      const loader = vi.fn(() => ({}));
      return {
        default: { load: loader },
        load: loader,
      };
    });

    const scriptModule = await import(modulePath);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { shouldExit, suppressedCount } = scriptModule.reportIssues(
      [
        {
          type: scriptModule.IssueType.MISSING_FILE,
          message: 'VERSION missing',
        },
      ],
      scriptModule.CheckLevel.MISSING_FAIL_SILENTLY
    );

    expect(shouldExit).toBe(false);
    expect(suppressedCount).toBe(1);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
