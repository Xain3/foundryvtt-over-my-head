/**
 * @file overMyHead.integration.test.mjs
 * @description Integration tests for OverMyHead class focusing on config usage, dynamic constants export, and updated init workflow.
 * @path tests/integration/overMyHead.integration.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import OverMyHead from '../../src/overMyHead.mjs';
import config from '../../src/config/config.mjs';

// Mock the Utilities class since we're testing config integration and init flow wiring
vi.mock('../../src/utils/utils.mjs', () => {
  return vi.fn().mockImplementation(() => ({
    static: {
      unpack: vi.fn()
    },
    initializer: {
      initializeDevFeatures: vi.fn(),
      initializeContext: vi.fn().mockReturnValue(Promise.resolve({ setFlags: vi.fn() })),
      initializeHandlers: vi.fn().mockReturnValue({ settings: {} }),
      initializeSettings: vi.fn(),
      confirmInitialization: vi.fn()
    }
  }));
});

// Minimal Hooks mock for tests not running in Foundry
global.Hooks = {
  once: vi.fn((event, callback) => {}),
  callAll: vi.fn()
};

describe('OverMyHead Integration Tests', () => {
  let originalExportedVarNames;

  beforeEach(() => {
    // Capture any existing *Constants globals to restore later
    originalExportedVarNames = Object.keys(globalThis).filter(k => k.endsWith('Constants'));
    // Remove them for a clean slate
    for (const k of originalExportedVarNames) delete globalThis[k];

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up any exported constants
    Object.keys(globalThis).forEach(k => {
      if (k.endsWith('Constants')) delete globalThis[k];
    });

    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  describe('Config Integration', () => {
    it('uses config instance for constants and manifest', () => {
      const overMyHead = new OverMyHead();
      expect(overMyHead.constants).toBe(config.constants);
      expect(overMyHead.manifest).toEqual(config.buildManifestWithShortName());
    });

    it('exposes expected config properties', () => {
      const overMyHead = new OverMyHead();
      expect(overMyHead.constants.errors).toBeDefined();
      expect(overMyHead.constants.context).toBeDefined();
      expect(overMyHead.constants.moduleManagement).toBeDefined();
      expect(overMyHead.manifest.id).toBeDefined();
      expect(overMyHead.manifest.title).toBeDefined();
      expect(overMyHead.manifest.shortName).toBeDefined();
    });
  });

  describe('Dynamic Constants Export', () => {
    it('calls config.exportConstants during initialization', async () => {
      const overMyHead = new OverMyHead();
      const spy = vi.spyOn(config, 'exportConstants');
      await overMyHead.init();
      expect(spy).toHaveBeenCalledTimes(1);
      // Find exported var with dynamic name like OMHConstants
      const exportedVar = Object.keys(globalThis).find(
        k => k.endsWith('Constants') && globalThis[k] === config.constants
      );
      expect(exportedVar).toBeDefined();
      spy.mockRestore();
    });

    it('does not expose OverMyHead.exportConstants method', () => {
      const overMyHead = new OverMyHead();
      expect(typeof overMyHead.exportConstants).toBe('undefined');
      expect(typeof config.exportConstants).toBe('function');
    });

    it('exports correct constants structure globally with dynamic name', async () => {
      const overMyHead = new OverMyHead();
      await overMyHead.init();
      const exportedVar = Object.keys(globalThis).find(
        k => k.endsWith('Constants') && globalThis[k] === config.constants
      );
      expect(globalThis[exportedVar]).toBeDefined();
      expect(globalThis[exportedVar].errors.separator).toBeDefined();
      expect(globalThis[exportedVar].context.sync.defaults).toBeDefined();
      expect(globalThis[exportedVar].moduleManagement.referToModuleBy).toBeDefined();
    });

    it('logs informative messages with module title and variable name', async () => {
      const overMyHead = new OverMyHead();
      await overMyHead.init();
      const logCalls = console.log.mock.calls.map(c => String(c[0]));
      const exportLogCall = logCalls.find(m => m.includes('Constants exported to global scope'));
      expect(exportLogCall).toBeDefined();
      expect(exportLogCall).toMatch(/Over.*: Constants exported to global scope as \w+Constants\./);
    });

    it('warns on repeated initialization with same dynamic name', async () => {
      const overMyHead1 = new OverMyHead();
      const overMyHead2 = new OverMyHead();
      await overMyHead1.init();
      console.log.mockClear();
      console.warn.mockClear();
      await overMyHead2.init();
      const warnCalls = console.warn.mock.calls.map(c => String(c[0]));
      const exportWarnCall = warnCalls.find(m => m.includes('Constants already exported to global scope'));
      expect(exportWarnCall).toBeDefined();
      expect(exportWarnCall).toMatch(/: Constants already exported to global scope as \w+Constants\./);
    });
  });

  describe('Backwards Compatibility', () => {
    it('maintains same constants reference after export', async () => {
      const overMyHead = new OverMyHead();
      const instanceConstants = overMyHead.constants;
      await overMyHead.init();
      const exportedVar = Object.keys(globalThis).find(
        k => k.endsWith('Constants') && globalThis[k] === config.constants
      );
      expect(globalThis[exportedVar]).toBe(instanceConstants);
      expect(globalThis[exportedVar]).toBe(config.constants);
    });

    it('manifest includes shortName for backwards compatibility', () => {
      const overMyHead = new OverMyHead();
      expect(typeof overMyHead.manifest.shortName).toBe('string');
    });

    it('exports frozen objects (constants and manifest)', async () => {
      const overMyHead = new OverMyHead();
      await overMyHead.init();
      const exportedVar = Object.keys(globalThis).find(
        k => k.endsWith('Constants') && globalThis[k] === config.constants
      );
      expect(Object.isFrozen(globalThis[exportedVar])).toBe(true);
      expect(Object.isFrozen(overMyHead.manifest)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('surface errors from config.exportConstants during initialization', async () => {
      const overMyHead = new OverMyHead();
      const original = config.exportConstants;
      config.exportConstants = vi.fn(() => { throw new Error('Test error'); });
      await expect(overMyHead.init()).rejects.toThrow('Test error');
      expect(console.error).toHaveBeenCalled();
      config.exportConstants = original;
    });
  });
});
