import path from 'node:path';
import { spawnSync } from 'node:child_process';

function runScript(rel, args = [], env = {}) {
  const abs = path.resolve(process.cwd(), rel);
  const res = spawnSync(process.execPath, [abs, ...args], { env: { ...process.env, ...env }, encoding: 'utf8' });
  return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

describe('patch scripts accept --procedural-number and --patch-name', () => {
  test('00-use-cache-or-stagger.mjs uses prefix', () => {
    const r = runScript('docker/patches/common/00-use-cache-or-stagger.mjs', ['--procedural-number', '01', '--patch-name', 'x-test'], { CONTAINER_CACHE: '/does/not/exist', FETCH_STAGGER_SECONDS: '0', PATCH_DRY_RUN: '1' });
    expect([0, null]).toContain(r.status);
    expect(r.stdout + r.stderr).toMatch(/\[patch] 01-x-test:/);
  });

  test('10-sync-host-content.mjs uses prefix', () => {
    const r = runScript('docker/patches/common/10-sync-host-content.mjs', ['--procedural-number', '11', '--patch-name', 'y-test', '--initial-only'], { PATCH_DRY_RUN: '1', WORLD_SYNC_ENABLED: '0' });
    expect([0, null]).toContain(r.status);
    expect(r.stdout + r.stderr).toMatch(/\[patch] 11-y-test:/);
  });

  // Note: 20-install-components is exercised separately; argument parsing is covered by 00 and 10
});
