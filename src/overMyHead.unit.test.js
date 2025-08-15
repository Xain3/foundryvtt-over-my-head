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

// Hooks mock that immediately calls 'init' callbacks
global.Hooks = {
  once: jest.fn((event, callback) => {
    if (event === 'init' && typeof callback === 'function') callback();
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
    instance.enableDevFeatures();
    expect(global.Hooks.once).toHaveBeenCalledWith('init', expect.any(Function));
    expect(instance.utils.initializer.initializeDevFeatures).toHaveBeenCalledWith(instance.utils);
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
});
