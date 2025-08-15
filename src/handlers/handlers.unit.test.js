import Handlers from './handlers.js';

import Handler from '../baseClasses/handler.js';
import SettingsHandler from './settingsHandler.js';

describe('Handlers', () => {
  const fakeConfig = {
    constants: {
      settings: {
        requiredKeys: ['key', 'config'],
        settingsList: [
          {
            key: 'testSetting',
            config: { name: 'Test Setting', type: Boolean, default: true }
          }
        ]
      }
    },
    manifest: { id: 'foundryvtt-over-my-head' }
  };

  const fakeUtils = {
    formatError: (m) => m,
    formatHookName: (n) => `formatted.${n}`,
    logWarning: () => {},
    logDebug: () => {},
    log: () => {}
  };

  const fakeContext = { some: 'context' };

  it('constructs and creates a settings handler instance', () => {
    const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);

    expect(handlers).toBeDefined();
    // Handlers should inherit from Handler
    expect(handlers instanceof Handler).toBe(true);
    // Should have a settings property (SettingsHandler instance)
    expect(handlers.settings).toBeDefined();
    // It should carry through config, utils, and context
    expect(handlers.config).toBe(fakeConfig);
    expect(handlers.utils).toBe(fakeUtils);
    expect(handlers.context).toBe(fakeContext);
  });

  it('throws when missing parameters', () => {
    expect(() => new Handlers(null, fakeUtils, fakeContext)).toThrow();
    expect(() => new Handlers(fakeConfig, null, fakeContext)).toThrow();
    expect(() => new Handlers(fakeConfig, fakeUtils, null)).toThrow();
  });

  it('should create a settings handler instance', () => {
    const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
    expect(handlers.settings).toBeInstanceOf(SettingsHandler);
  });
});
