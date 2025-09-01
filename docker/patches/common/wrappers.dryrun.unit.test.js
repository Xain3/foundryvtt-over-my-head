const path = require('node:path');
const { spawnSync } = require('node:child_process');

function runScript(scriptPath, args = [], env = {}) {
  const result = spawnSync('bash', [scriptPath, ...args], {
    cwd: path.dirname(scriptPath),
    env: { ...process.env, ...env },
    encoding: 'utf8'
  });
  return {
    code: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

describe('wrapper scripts dry-run', () => {
  const baseDir = __dirname;

  describe('00-use-cache-or-stagger.sh', () => {
    const script = path.join(baseDir, '00-use-cache-or-stagger.sh');
    const expectedTarget = path.join(baseDir, '00-use-cache-or-stagger.mjs');
    const { code, stdout, stderr } = runScript(script, [], { PATCH_DRY_RUN: '1' });

    test('prints correct dry-run command (via PATCH_DRY_RUN)', () => {
      expect(code).toBe(0);
      expect(stderr).toBe('');
      expect(stdout).toContain('[patch][dry-run] Would run:');
      expect(stdout).toContain(expectedTarget);
    });

    test('target .mjs file exists', () => {
      // verify the target .mjs file exists
      const fs = require('node:fs');
      const exists = fs.existsSync(expectedTarget);
      expect(exists).toBe(true);
    });
  });

  describe('10-sync-host-content.sh', () => {
    const script = path.join(baseDir, '10-sync-host-content.sh');
    const expectedTarget = path.join(baseDir, '10-sync-host-content.mjs');
    const { code, stdout, stderr } = runScript(script, [], { DRY_RUN: '1' });

    test('prints correct dry-run command (via DRY_RUN)', () => {
      expect(code).toBe(0);
      expect(stderr).toBe('');
      expect(stdout).toContain('[patch][dry-run] Would run:');
      expect(stdout).toContain(expectedTarget);
    });

    test('target .mjs file exists', () => {
      // verify the target .mjs file exists
      const fs = require('node:fs');
      const exists = fs.existsSync(expectedTarget);
      expect(exists).toBe(true);
    });
  });

  describe('20-install-components.sh', () => {
    const script = path.join(baseDir, '20-install-components.sh');
    const expectedTarget = path.join(baseDir, '20-install-components.mjs');
    const { code, stdout, stderr } = runScript(script, ['--dry-run']);

    test('prints correct dry-run command (via --dry-run flag)', () => {
      expect(code).toBe(0);
      expect(stderr).toBe('');
      expect(stdout).toContain('[patch][dry-run] Would run:');
      expect(stdout).toContain(expectedTarget);
    });

    test('target .mjs file exists', () => {
      // verify the target .mjs file exists
      const fs = require('node:fs');
      const exists = fs.existsSync(expectedTarget);
      expect(exists).toBe(true);
    });
  });
});