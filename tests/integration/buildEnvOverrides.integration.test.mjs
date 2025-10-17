/**
 * @file buildEnvOverrides.integration.test.mjs
 * @description Integration tests verifying ModuleBuilder respects environment flag overrides during build execution.
 * @path tests/integration/buildEnvOverrides.integration.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

const restoreEnv = () => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) {
      delete process.env[key];
    }
  }
  for (const key of Object.keys(ORIGINAL_ENV)) {
    process.env[key] = ORIGINAL_ENV[key];
  }
};

const createSpawnStub = () => ({
  stdout: {
    setEncoding: vi.fn(),
    on: vi.fn(),
  },
  stderr: {
    setEncoding: vi.fn(),
    on: vi.fn(),
  },
  on: vi.fn(),
  kill: vi.fn(),
});

describe('Build process environment overrides', () => {
  let spawnMock;

  beforeEach(() => {
    restoreEnv();
    vi.resetModules();
    spawnMock = vi.fn(() => createSpawnStub());
  });

  afterEach(() => {
    restoreEnv();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('applies short-name override before running the build action', async () => {
    process.env.OMH_DEV = 'false';
    vi.doMock('child_process', () => ({ spawn: spawnMock }));

    const { default: ModuleBuilder } = await import(
      '../../.dev/scripts/build/moduleBuilder.mjs'
    );
    const { default: config } = await import('../../src/config/config.mjs');

    expect(config.manifest.flags.dev).toBe(false);

    const builder = new ModuleBuilder();
    await builder.build();

    expect(spawnMock).toHaveBeenCalledTimes(1);
    const [command, args, options] = spawnMock.mock.calls[0];
    expect(command).toBe('npx');
    expect(args).toContain('vite');
    expect(args).toContain('build');
    expect(options.cwd).toBe(process.cwd());
  });

  it('prioritizes full module id override over short name override', async () => {
    process.env.OMH_DEV = 'true';
    process.env.FOUNDRYVTT_OVER_MY_HEAD_DEV = 'false';
    vi.doMock('child_process', () => ({ spawn: spawnMock }));

    const { default: ModuleBuilder } = await import(
      '../../.dev/scripts/build/moduleBuilder.mjs'
    );
    const { default: config } = await import('../../src/config/config.mjs');

    expect(config.manifest.flags.dev).toBe(false);

    const builder = new ModuleBuilder();
    await builder.build();

    expect(spawnMock).toHaveBeenCalledTimes(1);
  });
});
