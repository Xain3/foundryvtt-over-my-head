/**
 * @file devcontainer-setup.unit.test.mjs
 * @description Validates the devcontainer setup script dry-run behavior.
 * @path tests/setup/devcontainer-setup.unit.test.mjs
 */

import { describe, it, expect } from 'vitest';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Creates an isolated HOME directory for the script invocation.
 * @returns {Promise<string>} Temporary directory path.
 */
async function createTemporaryHome() {
  return mkdtemp(path.join(os.tmpdir(), 'omh-devcontainer-'));
}

describe('devcontainer-setup.sh', () => {
  it('runs successfully in dry-run mode without mutating the environment', async () => {
    const temporaryHome = await createTemporaryHome();
    const scriptPath = path.join(
      process.cwd(),
      '.devcontainer',
      'devcontainer-setup.sh'
    );

    const { stdout, stderr } = await execFileAsync(scriptPath, ['--dry-run'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        HOME: temporaryHome,
        ZSH_CUSTOM: path.join(temporaryHome, '.oh-my-zsh', 'custom'),
      },
      maxBuffer: 1024 * 1024,
    });

    expect(stderr).toBe('');
    expect(stdout).toContain(
      'Running in dry-run mode. No changes will be made.'
    );
    expect(stdout).toContain('Dry-run finished! No changes were made.');
    expect(existsSync(path.join(temporaryHome, '.oh-my-zsh'))).toBe(false);
  });
});
