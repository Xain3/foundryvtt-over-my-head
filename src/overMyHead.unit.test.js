/**
 * @file overMyHead.unit.test.js
 * @description Unit tests for OverMyHead class to verify constructor wiring, dev features hook registration, and init workflow.
 * @path src/overMyHead.unit.test.js
 */

import OverMyHead from './overMyHead.js';
import config from './config/config.js';
import Utilities from './utils/utils.js';

jest.mock('./utils/utils.js', () => {
  return jest.fn().mockImplementation(() => ({
    static: {
      unpack: jest.fn()
    },
    initializer: {
      initializeDevFeatures: jest.fn(),
      initializeContext: jest.fn().mockReturnValue({ setFlags: jest.fn() }),
      initializeHandlers: jest.fn().mockReturnValue({ settings: {} }),
      initializeSettings: jest.fn(),
      confirmInitialization: jest.fn()
    }
  }));
});

// Hooks mock that immediately calls 'init' and 'i18nInit' callbacks
global.Hooks = {
  once: jest.fn((event, callback) => {
    if ((event === 'init' || event === 'i18nInit') && typeof callback === 'function') callback();
  }),
  callAll: jest.fn()
};

describe('OverMyHead (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('constructs with config constants and manifest and unpacks manifest', () => {
    const expectedManifest = config.buildManifestWithShortName();
    const instance = new OverMyHead();

    // Utilities constructor called with constants and manifest
    expect(Utilities).toHaveBeenCalledWith(config.constants, expectedManifest);

    // Instance properties are set
    expect(instance.constants).toBe(config.constants);
    expect(instance.manifest).toEqual(expectedManifest);

    // Unpack called with manifest and instance
    expect(instance.utils.static.unpack).toHaveBeenCalledWith(instance.manifest, instance);
  });

  it('enableDevFeatures registers an init hook and calls initializer.initializeDevFeatures', () => {
    const instance = new OverMyHead();
  // Ensure manifest indicates dev mode so the hook is registered
  instance.manifest = { ...instance.manifest, flags: { dev: true } };
    instance.enableDevFeatures();
    expect(global.Hooks.once).toHaveBeenCalledWith('init', expect.any(Function));
    expect(instance.utils.initializer.initializeDevFeatures).toHaveBeenCalledWith(instance.utils);
  });

  it('enableDevFeatures does not register hook when dev flag is false', () => {
    const instance = new OverMyHead();
  instance.manifest = { ...instance.manifest, flags: { dev: false } };
    instance.enableDevFeatures();
    expect(global.Hooks.once).not.toHaveBeenCalledWith('init', expect.any(Function));
    expect(instance.utils.initializer.initializeDevFeatures).not.toHaveBeenCalled();
  });

  it('enableDevFeatures is a no-op when manifest.flags is missing', () => {
    const instance = new OverMyHead();
    // Ensure there's no flags property at all
    instance.manifest = { ...instance.manifest };
    delete instance.manifest.flags;

    instance.enableDevFeatures();

    expect(global.Hooks.once).not.toHaveBeenCalledWith('init', expect.any(Function));
    expect(instance.utils.initializer.initializeDevFeatures).not.toHaveBeenCalled();
  });

  it('init exports constants and runs initializer workflow', async () => {
    const instance = new OverMyHead();
    const exportSpy = jest.spyOn(config, 'exportConstants');

    await instance.init();

    expect(exportSpy).toHaveBeenCalledTimes(1);
    expect(instance.utils.initializer.initializeContext).toHaveBeenCalled();
  expect(instance.utils.initializer.initializeHandlers).toHaveBeenCalledWith(instance.config, instance.utils, instance.context);
    expect(instance.utils.initializer.initializeSettings).toHaveBeenCalledWith(instance.handlers.settings, instance.utils);
    expect(instance.utils.initializer.confirmInitialization).toHaveBeenCalledWith(instance.config, instance.context, instance.utils);

    exportSpy.mockRestore();
  });

  it('init rejects when config.exportConstants throws', async () => {
    const instance = new OverMyHead();
    const exportSpy = jest.spyOn(config, 'exportConstants').mockImplementation(() => { throw new Error('export failed'); });

    await expect(instance.init()).rejects.toThrow('export failed');

    exportSpy.mockRestore();
  });

  it('init rejects when post-localization initialization throws', async () => {
    const instance = new OverMyHead();
    // Make exportConstants succeed
    const exportSpy = jest.spyOn(config, 'exportConstants').mockImplementation(() => {});

    // Force initializer.initializeContext to throw when called from postLocalization
    instance.utils.initializer.initializeContext.mockImplementation(() => { throw new Error('post-init failed'); });

    await expect(instance.init()).rejects.toThrow('post-init failed');

    exportSpy.mockRestore();
  });
});
