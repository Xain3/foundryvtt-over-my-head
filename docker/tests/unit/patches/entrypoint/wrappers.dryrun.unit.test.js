const path = require('node:path');
const { spawnSync } = require('node:child_process');

function runScript(scriptPath, args = [], env = {}) {
  const result = spawnSync(scriptPath, args, {
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
  // Entry-point wrappers live in ../entrypoint, while .mjs files live in this common dir
  const baseDir = __dirname;
  // Tests run from docker/tests/unit/patches/entrypoint; wrappers live in
  // docker/patches/entrypoint at repository root
  const wrapperDir = path.join(__dirname, '..', '..', '..', '..', 'patches', 'entrypoint');

  describe('00-use-cache-or-stagger.sh', () => {
  const script = path.join(wrapperDir, '00-use-cache-or-stagger.sh');
  const expectedTarget = path.join(baseDir, '00-use-cache-or-stagger.mjs');
  const expectedViaWrapper = `${wrapperDir}/../common/00-use-cache-or-stagger.mjs`;
  const expectedViaWrapperAbs = path.normalize(path.join(wrapperDir, '..', 'common', '00-use-cache-or-stagger.mjs'));
  const { code, stdout, stderr } = runScript(script, [], { PATCH_DRY_RUN: '1' });

    test('prints correct dry-run command (via PATCH_DRY_RUN)', () => {
    expect([0, null]).toContain(code);
    expect(stderr).toBe('');
    expect(stdout).toContain('[patch][dry-run] Would run:');
    expect(stdout).toContain(expectedViaWrapper);
    });

    test('target .mjs file exists', () => {
      // verify the target .mjs file exists
  const fs = require('node:fs');
  const exists = fs.existsSync(expectedViaWrapperAbs);
  expect(exists).toBe(true);
    });
  });

  describe('10-sync-host-content.sh', () => {
  const script = path.join(wrapperDir, '10-sync-host-content.sh');
  const expectedTarget = path.join(baseDir, '10-sync-host-content.mjs');
  const expectedViaWrapper = `${wrapperDir}/../common/10-sync-host-content.mjs`;
  const expectedViaWrapperAbs = path.normalize(path.join(wrapperDir, '..', 'common', '10-sync-host-content.mjs'));
  const { code, stdout, stderr } = runScript(script, [], { DRY_RUN: '1' });

    test('prints correct dry-run command (via DRY_RUN)', () => {
    expect([0, null]).toContain(code);
    expect(stderr).toBe('');
    expect(stdout).toContain('[patch][dry-run] Would run:');
    expect(stdout).toContain(expectedViaWrapper);
    });

    test('target .mjs file exists', () => {
      // verify the target .mjs file exists
  const fs = require('node:fs');
  const exists = fs.existsSync(expectedViaWrapperAbs);
  expect(exists).toBe(true);
    });
  });

  describe('20-install-components.sh', () => {
  const script = path.join(wrapperDir, '20-install-components.sh');
  const expectedTarget = path.join(baseDir, '20-install-components.mjs');
  const expectedViaWrapper = `${wrapperDir}/../common/20-install-components.mjs`;
  const expectedViaWrapperAbs = path.normalize(path.join(wrapperDir, '..', 'common', '20-install-components.mjs'));
  const { code, stdout, stderr } = runScript(script, ['--dry-run']);

    test('prints correct dry-run command (via --dry-run flag)', () => {
    expect([0, null]).toContain(code);
    expect(stderr).toBe('');
    expect(stdout).toContain('[patch][dry-run] Would run:');
    expect(stdout).toContain(expectedViaWrapper);
    });

    test('target .mjs file exists', () => {
      // verify the target .mjs file exists
  const fs = require('node:fs');
  const exists = fs.existsSync(expectedViaWrapperAbs);
  expect(exists).toBe(true);
    });
  });
});