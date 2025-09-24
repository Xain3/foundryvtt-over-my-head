import Handlers from './handlers.mjs';

import Handler from '../baseClasses/handler.mjs';
import SettingsHandler from './settingsHandler.mjs';

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
    it('should delegate hasDebugModeSettingConfig to settings handler', () => {
      const handlers = new Handlers(fakeConfigWithDebug, fakeUtils, fakeContext);
      jest.spyOn(handlers.settings, 'hasDebugModeSettingConfig').mockReturnValue(true);
      
      const result = handlers.hasDebugModeSettingConfig();
      
      expect(handlers.settings.hasDebugModeSettingConfig).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should delegate getDebugModeSettingConfig to settings handler', () => {
      const handlers = new Handlers(fakeConfigWithDebug, fakeUtils, fakeContext);
      const mockDebugSetting = { key: 'debugMode', config: { name: 'Debug Mode' } };
      jest.spyOn(handlers.settings, 'getDebugModeSettingConfig').mockReturnValue(mockDebugSetting);
      
      const result = handlers.getDebugModeSettingConfig();
      
      expect(handlers.settings.getDebugModeSettingConfig).toHaveBeenCalled();
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
      
      const hasDebug = handlers.hasDebugModeSettingConfig();
      const debugSetting = handlers.getDebugModeSettingConfig();
      
      expect(hasDebug).toBe(false);
      expect(debugSetting).toBe(null);
    });
  });

  describe('Generic setting convenience methods', () => {
    it('should delegate hasSettingConfigByKey to settings handler', () => {
      const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
      jest.spyOn(handlers.settings, 'hasSettingConfigByKey').mockReturnValue(true);
      
      const result = handlers.hasSettingConfigByKey('testSetting');
      
      expect(handlers.settings.hasSettingConfigByKey).toHaveBeenCalledWith('testSetting');
      expect(result).toBe(true);
    });

    it('should delegate getSettingConfigByKey to settings handler', () => {
      const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
      const mockSetting = { key: 'testSetting', config: { name: 'Test Setting' } };
      jest.spyOn(handlers.settings, 'getSettingConfigByKey').mockReturnValue(mockSetting);
      
      const result = handlers.getSettingConfigByKey('testSetting');
      
      expect(handlers.settings.getSettingConfigByKey).toHaveBeenCalledWith('testSetting');
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
      
      const hasSetting = handlers.hasSettingConfigByKey('nonExistentSetting');
      const setting = handlers.getSettingConfigByKey('nonExistentSetting');
      
      expect(hasSetting).toBe(false);
      expect(setting).toBe(null);
    });

    it('should return true for existing setting', () => {
      const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
      
      const hasSetting = handlers.hasSettingConfigByKey('testSetting');
      const setting = handlers.getSettingConfigByKey('testSetting');
      
      expect(hasSetting).toBe(true);
      expect(setting).toEqual({
        key: 'testSetting',
        config: { name: 'Test Setting', type: Boolean, default: true }
      });
    });
  });

  describe('Settings Value Retrieval Methods', () => {
    beforeEach(() => {
      global.game = {
        settings: {
          get: jest.fn()
        }
      };
    });

    afterEach(() => {
      delete global.game;
    });

    describe('hasSetting', () => {
      it('should delegate to settings handler hasSetting method', () => {
        global.game.settings.get.mockReturnValue(true);
        const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
        
        const result = handlers.hasSetting('testSetting');
        
        expect(result).toBe(true);
        expect(global.game.settings.get).toHaveBeenCalledWith('foundryvtt-over-my-head', 'testSetting');
      });

      it('should return false when setting does not exist', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
        
        const result = handlers.hasSetting('nonExistentSetting');
        
        expect(result).toBe(false);
      });
    });

    describe('getSettingValue', () => {
      it('should delegate to settings handler getSettingValue method', () => {
        const expectedValue = 'test value';
        global.game.settings.get.mockReturnValue(expectedValue);
        const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
        
        const result = handlers.getSettingValue('testSetting');
        
        expect(result).toBe(expectedValue);
        expect(global.game.settings.get).toHaveBeenCalledWith('foundryvtt-over-my-head', 'testSetting');
      });

      it('should return undefined when setting does not exist', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
        
        const result = handlers.getSettingValue('nonExistentSetting');
        
        expect(result).toBe(undefined);
      });
    });

    describe('hasDebugModeSetting', () => {
      it('should delegate to settings handler hasDebugModeSetting method', () => {
        global.game.settings.get.mockReturnValue(false);
        const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
        
        const result = handlers.hasDebugModeSetting();
        
        expect(result).toBe(true);
        expect(global.game.settings.get).toHaveBeenCalledWith('foundryvtt-over-my-head', 'debugMode');
      });

      it('should return false when debugMode setting does not exist', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
        
        const result = handlers.hasDebugModeSetting();
        
        expect(result).toBe(false);
      });
    });

    describe('getDebugModeSettingValue', () => {
      it('should delegate to settings handler getDebugModeSettingValue method', () => {
        global.game.settings.get.mockReturnValue(true);
        const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
        
        const result = handlers.getDebugModeSettingValue();
        
        expect(result).toBe(true);
        expect(global.game.settings.get).toHaveBeenCalledWith('foundryvtt-over-my-head', 'debugMode');
      });

      it('should return false when debugMode is disabled', () => {
        global.game.settings.get.mockReturnValue(false);
        const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
        
        const result = handlers.getDebugModeSettingValue();
        
        expect(result).toBe(false);
      });

      it('should return undefined when debugMode setting does not exist', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handlers = new Handlers(fakeConfig, fakeUtils, fakeContext);
        
        const result = handlers.getDebugModeSettingValue();
        
        expect(result).toBe(undefined);
      });
    });
  });
});
