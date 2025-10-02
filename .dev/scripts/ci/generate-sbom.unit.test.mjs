/**
 * @file generate-sbom.unit.test.mjs
 * @description Unit tests for the SBOM generation stub script.
 * @path .dev/scripts/ci/generate-sbom.unit.test.mjs
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

const modulePath = './generate-sbom.mjs';

describe('generate-sbom CI helper', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('detects executable availability through isCommandAvailable', async () => {
    const execMock = vi.fn(() => {});

    vi.doMock('child_process', () => ({ execSync: execMock }));
    vi.doMock('fs', () => {
      const fsMock = {
        existsSync: vi.fn(),
        readFileSync: vi.fn(),
      };

      return {
        default: fsMock,
        ...fsMock,
      };
    });

    const scriptModule = await import(modulePath);
    const available = scriptModule.isCommandAvailable('syft');

    expect(available).toBe(true);
    expect(execMock).toHaveBeenCalledWith('syft --version', { stdio: 'pipe' });
  });

  it('runs syft workflow when command is available', async () => {
    const execMock = vi.fn((command) => {
      if (command.includes('--version')) {
        return;
      }

      if (command.startsWith('syft packages')) {
        return;
      }

      throw new Error(`Unexpected command ${command}`);
    });

    const fsMock = {
      existsSync: vi.fn(() => false),
      readFileSync: vi.fn(),
    };

    vi.doMock('child_process', () => ({ execSync: execMock }));
    vi.doMock('fs', () => ({
      default: fsMock,
      ...fsMock,
    }));

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const chdirSpy = vi.spyOn(process, 'chdir').mockImplementation(() => {});

    const scriptModule = await import(modulePath);
    scriptModule.generateSbom();

    expect(execMock).toHaveBeenCalledWith(
      'syft packages . -o json=sbom.json -o table',
      {
        stdio: 'inherit',
      }
    );
    expect(chdirSpy).toHaveBeenCalledTimes(1);

    consoleLogSpy.mockRestore();
    chdirSpy.mockRestore();
  });

  it('falls back to dependency listing when syft is unavailable', async () => {
    const execMock = vi.fn(() => {
      throw new Error('not installed');
    });

    const fsMock = {
      existsSync: vi.fn(() => true),
      readFileSync: vi.fn(() =>
        JSON.stringify({
          dependencies: { lodash: '^4.17.0' },
          devDependencies: { vitest: '^1.0.0' },
        })
      ),
    };

    vi.doMock('child_process', () => ({ execSync: execMock }));
    vi.doMock('fs', () => ({
      default: fsMock,
      ...fsMock,
    }));

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const scriptModule = await import(modulePath);
    scriptModule.generateSbom();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '⚠️  syft not installed - generating basic dependency list instead'
    );
    expect(consoleLogSpy).toHaveBeenCalledWith('Development dependencies:');
    expect(consoleLogSpy).toHaveBeenCalledWith('  vitest: ^1.0.0');
    expect(consoleLogSpy).toHaveBeenCalledWith('Runtime dependencies:');
    expect(consoleLogSpy).toHaveBeenCalledWith('  lodash: ^4.17.0');

    consoleLogSpy.mockRestore();
  });
});
