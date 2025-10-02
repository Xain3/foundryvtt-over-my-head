/**
 * @file check-licenses.unit.test.mjs
 * @description Unit tests for the license compliance CI helper script.
 * @path .dev/scripts/ci/check-licenses.unit.test.mjs
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

const modulePath = './check-licenses.mjs';

async function importScript({ yamlValue = {}, readContent = '' } = {}) {
  const fsMock = {
    readFileSync: vi.fn(() => readContent),
    existsSync: vi.fn(() => false),
    readdirSync: vi.fn(() => []),
    statSync: vi.fn(() => ({
      isDirectory: () => false,
      isFile: () => false,
    })),
  };

  const yamlLoad = vi.fn(() => yamlValue);

  vi.doMock('fs', () => ({
    default: fsMock,
    ...fsMock,
  }));
  vi.doMock('js-yaml', () => ({
    default: { load: yamlLoad },
    load: yamlLoad,
  }));

  const scriptModule = await import(modulePath);
  return { scriptModule, fsMock, yamlLoad };
}

describe('check-licenses CI helper', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('returns configured level when ci-checks.yaml provides a numeric value', async () => {
    const configuredValue = 3;
    const { scriptModule } = await importScript({
      yamlValue: { checkLicenses: configuredValue },
      readContent: 'checkLicenses: 3',
    });

    const level = scriptModule.loadCheckConfiguration();

    expect(level).toBe(scriptModule.LicenseCheckLevel.WARN);
  });

  it('defaults to strict mode when configuration is invalid', async () => {
    const { scriptModule } = await importScript({
      yamlValue: { checkLicenses: 'invalid' },
      readContent: 'checkLicenses: invalid',
    });

    const level = scriptModule.loadCheckConfiguration();

    expect(level).toBe(scriptModule.LicenseCheckLevel.ERROR);
  });

  it('reports issues respecting severity and suppression rules', async () => {
    const { scriptModule } = await importScript();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const errorResult = scriptModule.reportIssues(
      [
        {
          type: scriptModule.IssueType.MISSING_LICENSE_FILE,
          message: 'Missing license file',
        },
      ],
      scriptModule.LicenseCheckLevel.ERROR,
      false
    );

    expect(errorResult.shouldExit).toBe(true);
    expect(errorResult.suppressedCount).toBe(0);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Missing license file')
    );

    errorSpy.mockClear();
    logSpy.mockClear();

    const silentResult = scriptModule.reportIssues(
      [
        {
          type: scriptModule.IssueType.MISSING_LICENSE_FILE,
          message: 'Missing license file',
        },
      ],
      scriptModule.LicenseCheckLevel.FAIL_SILENTLY,
      false
    );

    expect(silentResult.shouldExit).toBe(false);
    expect(silentResult.suppressedCount).toBe(1);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    logSpy.mockRestore();
  });
});
