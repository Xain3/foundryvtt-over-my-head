/**
 * @file resolveImageReference.unit.test.mjs
 * @description Unit tests for the resolveImageReference utility and CLI wrapper.
 * @path scripts/dev/resolveImageReference.unit.test.mjs
 */

import { describe, it, test, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import resolveImageReference, { BASE_REPO, DEFAULT_VERSION } from './resolveImageReference.mjs';
import path from 'node:path';
import { spawn } from 'node:child_process';

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
    const scriptPath = path.resolve(process.cwd(), 'scripts/dev/resolveImageReference.mjs');

    function runCli(args = [], envOverrides = {}) {
      return new Promise((resolve) => {
        const env = { ...process.env, ...envOverrides };
        const child = spawn(process.execPath, [scriptPath, ...args], { env, stdio: 'pipe' });

        let stdout = '';
        let stderr = '';
        let exitCode = null;

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          exitCode = code;
          resolve({
            code: exitCode,
            exitCalled: true,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            envDuring: env, // Note: env is not modified in subprocess
          });
        });
      });
    }

    test('prints help and exits 0 with --help', async () => {
      const res = await runCli(['--help']);
      expect(res.code).toBe(0);
      expect(res.exitCalled).toBe(true);
      expect(res.stdout).toContain('Usage: resolveImageReference');
      expect(res.stderr).toBe('');
    });

    test('errors on unknown option and exits 2', async () => {
      const res = await runCli(['--what']);
      expect(res.code).toBe(2);
      expect(res.stderr).toContain('Unknown option: --what');
    });

    test('errors when --value missing argument and exits 2', async () => {
      const res = await runCli(['--value']);
      expect(res.code).toBe(2);
      expect(res.stderr).toContain('Error: --value requires an argument');
    });

    test('resolves positional alias and prints to stdout', async () => {
      const res = await runCli(['dev']);
      expect(res.code).toBe(0);
      expect(res.exitCalled).toBe(true);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:develop`);
      expect(res.stderr).toBe('');
    });

    test('resolves with --value flag', async () => {
      const res = await runCli(['--value', '10.291']);
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:10.291`);
    });

    test('falls back to env when no args provided', async () => {
      const res = await runCli([], { FOUNDRY_IMAGE: 'stable' });
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:release`);
    });

    test('defaults to release when env is empty', async () => {
      const res = await runCli([], { FOUNDRY_IMAGE: '' });
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:${DEFAULT_VERSION}`);
    });

    test('export flag sets env and prints confirmation', async () => {
      const res = await runCli(['-e', 'dev']);
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:develop`);
      expect(res.stdout).toContain('# Exported to environment variable FOUNDRY_IMAGE');
    });

    test('exports environment variable when set', async () => {
      const res = await runCli(['-e', '10.291']);
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${BASE_REPO}:10.291`);
      expect(res.stdout).toContain('# Exported to environment variable FOUNDRY_IMAGE');
    });

    test('errors on invalid env value and exits 1', async () => {
      const res = await runCli([], { FOUNDRY_IMAGE: 'felddy/not-found:tag' });
      expect(res.code).toBe(1);
      expect(res.stderr).toContain('Invalid FOUNDRY_IMAGE argument: "felddy/not-found:tag"');
    });

    test('accepts full image reference unchanged', async () => {
      const ref = `${BASE_REPO}:release`;
      const res = await runCli([ref]);
      expect(res.code).toBe(0);
      expect(res.stdout).toContain(`FOUNDRY_IMAGE=${ref}`);
    });
  });
});

