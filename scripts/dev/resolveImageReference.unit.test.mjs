import resolveImageReference, { BASE_REPO, DEFAULT_VERSION } from './resolveImageReference.mjs';
import path from 'node:path';

describe('resolveImageReference', () => {
  test('returns full image tag unchanged', () => {
    const input = `${BASE_REPO}:release`;
    expect(resolveImageReference(input)).toBe(input);
  });

  test('maps known alias to concrete tag', () => {
    expect(resolveImageReference('dev')).toBe(`${BASE_REPO}:develop`);
    expect(resolveImageReference('stable')).toBe(`${BASE_REPO}:release`);
  });

  test('accepts numeric versions', () => {
    expect(resolveImageReference('10')).toBe(`${BASE_REPO}:10`);
    expect(resolveImageReference('10.291')).toBe(`${BASE_REPO}:10.291`);
  expect(resolveImageReference('10.1.2')).toBe(`${BASE_REPO}:10.1.2`);
  });

  test('accepts simple alias tags', () => {
    expect(resolveImageReference('beta')).toBe(`${BASE_REPO}:beta`);
    expect(resolveImageReference('my-custom-tag')).toBe(`${BASE_REPO}:my-custom-tag`);
  });

  test('defaults to DEFAULT_VERSION when empty', () => {
    expect(resolveImageReference('')).toBe(`${BASE_REPO}:${DEFAULT_VERSION}`);
    expect(resolveImageReference()).toBe(`${BASE_REPO}:${DEFAULT_VERSION}`);
  });

  test('oututs the resolved value', () => {
    const out1 = resolveImageReference('dev');
    expect(out1).toBe(`${BASE_REPO}:develop`);

    const out2 = resolveImageReference('10.291');
    expect(out2).toBe(`${BASE_REPO}:10.291`);
  });

  test('throws on invalid inputs', () => {
    expect(() => resolveImageReference('!@#$')).toThrow(Error);
    expect(() => resolveImageReference('felddy/not-found:tag')).toThrow(Error);
    expect(() => resolveImageReference(123)).toThrow(TypeError);
  });

  describe('environment variable export', () => {
    let originalEnv;
    beforeEach(() => {
      originalEnv = { ...process.env };
      delete process.env.FOUNDRY_IMAGE;
    });

    afterEach(() => {
      process.env = { ...originalEnv };
    });

    test('sets env var when export flag is true', () => {
      const out = resolveImageReference('dev', true);
      expect(out).toBe(`${BASE_REPO}:develop`);
      expect(process.env.FOUNDRY_IMAGE).toBe(`${BASE_REPO}:develop`);
    });

    test('does not set env var when export flag is false', () => {
      const out = resolveImageReference('10.291', false);
      expect(out).toBe(`${BASE_REPO}:10.291`);
      expect(process.env.FOUNDRY_IMAGE).toBeFalsy();
    });
  });

  describe('resolveImageReference CLI script', () => {
    const scriptPath = path.resolve(process.cwd(), 'scripts/dev/resolveImageReference.js');

    function runCli(args = [], envOverrides = {}) {
      const originalArgv = [...process.argv];
      const originalEnv = { ...process.env };
      const logs = [];
      const errors = [];
      let envDuring = {};

      const logSpy = jest.spyOn(console, 'log').mockImplementation((...a) => logs.push(a.join(' ')));
      const errorSpy = jest.spyOn(console, 'error').mockImplementation((...a) => errors.push(a.join(' ')));

      let exitCode = null;
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
        exitCode = code;
        throw new Error('__EXIT__');
      });

      process.argv = [process.execPath, scriptPath, ...args];
      process.env = { ...originalEnv, ...envOverrides };

      try {
        jest.isolateModules(() => {
          try {
            // eslint-disable-next-line global-require, import/no-dynamic-require
            require(scriptPath);
            // Capture environment as set by the CLI before restoration
            envDuring = { ...process.env };
          } catch (e) {
            if (!(e instanceof Error && e.message === '__EXIT__')) {
              throw e;
            }
          }
        });
      } finally {
        logSpy.mockRestore();
        errorSpy.mockRestore();
        exitSpy.mockRestore();
        process.argv = originalArgv;
        process.env = originalEnv;
      }

      return {
        code: exitCode === null ? 0 : exitCode,
        exitCalled: exitCode !== null,
        stdout: logs.join('\n'),
        stderr: errors.join('\n'),
        envDuring,
      };
    }

    test('prints help and exits 0 with --help', () => {
      const res = runCli(['--help']);
      expect(res.code).toBe(0);
      expect(res.exitCalled).toBe(true);
      expect(res.stdout).toContain('Usage: resolveImageReference');
      expect(res.stderr).toBe('');
    });

    test('errors on unknown option and exits 2', () => {
      const res = runCli(['--what']);
      expect(res.code).toBe(2);
      expect(res.stderr).toContain('Unknown option: --what');
    });

    test('errors when --value missing argument and exits 2', () => {
      const res = runCli(['--value']);
      expect(res.code).toBe(2);
      expect(res.stderr).toContain('Error: --value requires an argument');
    });

    test('resolves positional alias and prints to stdout', () => {
      const res = runCli(['dev']);
      expect(res.code).toBe(0);
      expect(res.exitCalled).toBe(false);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:develop`);
      expect(res.stderr).toBe('');
    });

    test('resolves with --value flag', () => {
      const res = runCli(['--value', '10.291']);
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:10.291`);
    });

    test('falls back to env when no args provided', () => {
      const res = runCli([], { FOUNDRY_IMAGE: 'stable' });
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:release`);
    });

    test('defaults to release when env is empty', () => {
      const res = runCli([], { FOUNDRY_IMAGE: '' });
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:${DEFAULT_VERSION}`);
    });

    test('export flag sets env and prints confirmation', () => {
      const originalEnv = { ...process.env };
      const res = runCli(['-e', 'dev']);
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:develop`);
      expect(res.stdout).toContain('# Exported to environment variable FOUNDRY_IMAGE');
      // Cleanup env
      process.env = originalEnv;
    });

    test('exports environment variable when set', () => {
      const originalEnv = { ...process.env };
      const res = runCli(['-e', '10.291']);
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:10.291`);
      expect(res.envDuring.FOUNDRY_IMAGE).toBe(`${BASE_REPO}:10.291`);
      // Cleanup env
      process.env = originalEnv;
    });

    test('errors on invalid env value and exits 1', () => {
      const res = runCli([], { FOUNDRY_IMAGE: 'felddy/not-found:tag' });
      expect(res.code).toBe(1);
      expect(res.stderr).toContain('Invalid FOUNDRY_IMAGE argument: "felddy/not-found:tag"');
    });

    test('accepts full image reference unchanged', () => {
      const ref = `${BASE_REPO}:release`;
      const res = runCli([ref]);
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${ref}`);
    });
  });
});

