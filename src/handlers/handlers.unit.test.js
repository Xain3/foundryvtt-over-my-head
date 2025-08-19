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

  const fakeConfigWithDebug = {
    constants: {
      settings: {
        requiredKeys: ['key', 'config'],
        settingsList: [
          {
            key: 'testSetting',
            config: { name: 'Test Setting', type: Boolean, default: true }
          },
          {
            key: 'debugMode',
            config: { name: 'Debug Mode', type: Boolean, default: false }
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

  describe('Debug Mode convenience methods', () => {
    it('should delegate hasDebugModeSetting to settings handler', () => {
      const handlers = new Handlers(fakeConfigWithDebug, fakeUtils, fakeContext);
      jest.spyOn(handlers.settings, 'hasDebugModeSetting').mockReturnValue(true);
      
      const result = handlers.hasDebugModeSetting();
      
      expect(handlers.settings.hasDebugModeSetting).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should delegate getDebugModeSetting to settings handler', () => {
      const handlers = new Handlers(fakeConfigWithDebug, fakeUtils, fakeContext);
      const mockDebugSetting = { key: 'debugMode', config: { name: 'Debug Mode' } };
      jest.spyOn(handlers.settings, 'getDebugModeSetting').mockReturnValue(mockDebugSetting);
      
      const result = handlers.getDebugModeSetting();
      
      expect(handlers.settings.getDebugModeSetting).toHaveBeenCalled();
      expect(result).toBe(mockDebugSetting);
    });

    it('should delegate registerDebugModeSetting to settings handler', () => {
      const handlers = new Handlers(fakeConfigWithDebug, fakeUtils, fakeContext);
      const mockResult = { success: true, counter: 1, successCounter: 1 };
      jest.spyOn(handlers.settings, 'registerDebugModeSetting').mockReturnValue(mockResult);
      
      const result = handlers.registerDebugModeSetting();
      
      expect(handlers.settings.registerDebugModeSetting).toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });

    it('should return false when no debug setting exists', () => {
      const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
      
      const hasDebug = handlers.hasDebugModeSetting();
      const debugSetting = handlers.getDebugModeSetting();
      
      expect(hasDebug).toBe(false);
      expect(debugSetting).toBe(null);
    });
  });

  describe('Generic setting convenience methods', () => {
    it('should delegate hasSettingByKey to settings handler', () => {
      const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
      jest.spyOn(handlers.settings, 'hasSettingByKey').mockReturnValue(true);
      
      const result = handlers.hasSettingByKey('testSetting');
      
      expect(handlers.settings.hasSettingByKey).toHaveBeenCalledWith('testSetting');
      expect(result).toBe(true);
    });

    it('should delegate getSettingByKey to settings handler', () => {
      const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
      const mockSetting = { key: 'testSetting', config: { name: 'Test Setting' } };
      jest.spyOn(handlers.settings, 'getSettingByKey').mockReturnValue(mockSetting);
      
      const result = handlers.getSettingByKey('testSetting');
      
      expect(handlers.settings.getSettingByKey).toHaveBeenCalledWith('testSetting');
      expect(result).toBe(mockSetting);
    });

    it('should delegate registerSettingByKey to settings handler', () => {
      const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
      const mockResult = { success: true, counter: 1, successCounter: 1 };
      jest.spyOn(handlers.settings, 'registerSettingByKey').mockReturnValue(mockResult);
      
      const result = handlers.registerSettingByKey('testSetting');
      
      expect(handlers.settings.registerSettingByKey).toHaveBeenCalledWith('testSetting');
      expect(result).toBe(mockResult);
    });

    it('should return false when setting does not exist', () => {
      const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
      
      const hasSetting = handlers.hasSettingByKey('nonExistentSetting');
      const setting = handlers.getSettingByKey('nonExistentSetting');
      
      expect(hasSetting).toBe(false);
      expect(setting).toBe(null);
    });

    it('should return true for existing setting', () => {
      const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
      
      const hasSetting = handlers.hasSettingByKey('testSetting');
      const setting = handlers.getSettingByKey('testSetting');
      
      expect(hasSetting).toBe(true);
      expect(setting).toEqual({
        key: 'testSetting',
        config: { name: 'Test Setting', type: Boolean, default: true }
      });
    });
  });
});
