/**
 * @file overMyHead.devFeatures.integration.test.mjs
 * @description Integration tests exercising OverMyHead dev feature toggling using real utilities.
 * @path tests/integration/overMyHead.devFeatures.integration.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import OverMyHead from '../../src/overMyHead.mjs';

describe('OverMyHead Dev Features (real utilities)', () => {
  let originalHooks;
  let originalWindow;

  beforeEach(() => {
    originalHooks = globalThis.Hooks;
    originalWindow = globalThis.window;
    globalThis.Hooks = {
      once: vi.fn(),
      callAll: vi.fn(),
    };
    globalThis.window = globalThis;
  });

  afterEach(() => {
    globalThis.Hooks = originalHooks;
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow;
    } else {
      delete globalThis.window;
    }
    vi.restoreAllMocks();
  });

  it('preserves manifest object after unpacking', () => {
    const omh = new OverMyHead();
    expect(omh.manifest).toBeDefined();
    expect(typeof omh.manifest).toBe('object');
    expect(omh.manifest.flags).toBeDefined();
    expect(Boolean(omh.manifest.flags.dev)).toBe(true);
  });

  it('registers init hook when dev flag is enabled', () => {
    const omh = new OverMyHead();
    omh.enableDevFeatures();

    expect(globalThis.Hooks.once).toHaveBeenCalledWith(
      'init',
      expect.any(Function)
    );
  });
});
