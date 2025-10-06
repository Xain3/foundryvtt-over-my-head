/**
 * @file settingsHandler.unit.test.mjs
 * @description Unit tests for SettingsHandler class and debug mode functionality
 * @path src/handlers/settingsHandler.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// Mock the dependencies using factory mocks to avoid problematic imports
vi.mock('./settingsHelpers/settingsParser.mjs', () => {
  const MockSettingsParser = vi.fn().mockImplementation(function() {
    this.parse = vi.fn().mockReturnValue({
      processed: 2,
      successful: 2,
      parsed: ['testSetting', 'debugMode'],
      failed: []
    });
  });
  return { default: MockSettingsParser };
});

vi.mock('./settingsHelpers/settingsRegistrar.mjs', () => {
  const MockSettingsRegistrar = vi.fn().mockImplementation(function() {
    this.register = vi.fn().mockReturnValue({
      success: true,
      counter: 1,
      successCounter: 1,
      errorMessages: [],
      message: 'Registration successful'
    });
  });
  return { default: MockSettingsRegistrar };
});

vi.mock('./settingsHelpers/settingLocalizer.mjs', () => {
  const MockSettingLocalizer = vi.fn().mockImplementation(function() {});
  MockSettingLocalizer.localizeSettings = vi.fn((settings) => settings);
  return { default: MockSettingLocalizer };
});

vi.mock('@helpers/settingsRetriever.mjs', () => {
  const MockSettingsRetriever = vi.fn().mockImplementation(function() {});
  return { default: MockSettingsRetriever };
});

import SettingsHandler from './settingsHandler.mjs';
import SettingsParser from './settingsHelpers/settingsParser.mjs';
import SettingsRegistrar from './settingsHelpers/settingsRegistrar.mjs';
import SettingLocalizer from './settingsHelpers/settingLocalizer.mjs';

describe('SettingsHandler', () => {
  const mockConfig = {
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

  const mockConfigWithoutDebug = {
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

  const mockUtils = {
    formatError: vi.fn((error) => error.toString()),
    formatHookName: vi.fn((name) => `test.${name}`),
    logWarning: vi.fn(),
    logDebug: vi.fn(),
    log: vi.fn()
  };

  const mockContext = { test: 'context' };

  beforeEach(() => {
    vi.clearAllMocks();

    // Factory mocks defined above already provide the necessary implementations,
    // eliminating the need for runtime mockImplementation calls.
  });

  describe('constructor', () => {
    it('should initialize properly with config containing debugMode', () => {
      const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

      expect(handler.settingsConfig).toBe(mockConfig.constants.settings);
      expect(handler.parsedSettings).toBe(mockConfig.constants.settings.settingsList);
      expect(SettingsParser).toHaveBeenCalledWith({ config: mockConfig, utils: mockUtils, context: mockContext });
      expect(SettingsRegistrar).toHaveBeenCalledWith({ config: mockConfig, utils: mockUtils, context: mockContext });
    });
  });

  describe('hasDebugModeSettingConfig', () => {
    it('should return true when debugMode setting exists', () => {
      const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

      const result = handler.hasDebugModeSettingConfig();

      expect(result).toBe(true);
    });

    it('should return false when debugMode setting does not exist', () => {
      const handler = new SettingsHandler({ config: mockConfigWithoutDebug, utils: mockUtils, context: mockContext });

      const result = handler.hasDebugModeSettingConfig();

      expect(result).toBe(false);
    });
  });

  describe('getDebugModeSettingConfig', () => {
    it('should return debugMode setting when it exists', () => {
      const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

      const result = handler.getDebugModeSettingConfig();

      expect(result).toEqual({
        key: 'debugMode',
        config: { name: 'Debug Mode', type: Boolean, default: false }
      });
    });

    it('should return null when debugMode setting does not exist', () => {
      const handler = new SettingsHandler({ config: mockConfigWithoutDebug, utils: mockUtils, context: mockContext });

      const result = handler.getDebugModeSettingConfig();

      expect(result).toBe(null);
    });
  });

  describe('registerDebugModeSetting', () => {
    it('should register debugMode setting when it exists', () => {
      const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

      // Mock the private registrar by spying on the register method
      const mockRegisterResult = {
        success: true,
        counter: 1,
        successCounter: 1,
        errorMessages: [],
        message: 'Debug mode setting registered successfully'
      };

      // We need to spy on the existing register method to test the interaction
      vi.spyOn(handler, 'register').mockReturnValue(mockRegisterResult);

      const result = handler.registerDebugModeSetting();

      expect(SettingLocalizer.localizeSettings).toHaveBeenCalledWith([{
        key: 'debugMode',
        config: { name: 'Debug Mode', type: Boolean, default: false }
      }], mockUtils);
      expect(result.success).toBe(true);
    });

    it('should return failure result when debugMode setting does not exist', () => {
      const handler = new SettingsHandler({ config: mockConfigWithoutDebug, utils: mockUtils, context: mockContext });

      const result = handler.registerDebugModeSetting();

      expect(result.success).toBe(false);
      expect(result.counter).toBe(0);
      expect(result.successCounter).toBe(0);
      expect(result.errorMessages).toEqual(['Debug mode setting not found in parsed settings']);
      expect(result.message).toBe('Debug mode setting not found in parsed settings');
    });
  });

  describe('register method', () => {
    it('should call localizeSettings and proceed with registration', () => {
      const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

      const result = handler.register();

      expect(SettingLocalizer.localizeSettings).toHaveBeenCalledWith(
        mockConfig.constants.settings.settingsList,
        mockUtils
      );
      // The result comes from the mocked registrar
      expect(result.success).toBe(true);
    });
  });

  describe('Generic setting methods', () => {
    describe('registerSettingByKey', () => {
      it('should register a setting by key when it exists', () => {
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const mockRegisterResult = {
          success: true,
          counter: 1,
          successCounter: 1,
          errorMessages: [],
          message: 'Setting registered successfully'
        };

        // Mock the registrar's register method to return success
        const mockRegistrarInstance = SettingsRegistrar.mock.instances[0];
        mockRegistrarInstance.register.mockReturnValue(mockRegisterResult);

        const result = handler.registerSettingByKey('testSetting');

        expect(SettingLocalizer.localizeSettings).toHaveBeenCalledWith([{
          key: 'testSetting',
          config: { name: 'Test Setting', type: Boolean, default: true }
        }], mockUtils);
        expect(result.success).toBe(true);
      });

      it('should return failure result when setting does not exist', () => {
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.registerSettingByKey('nonExistentSetting');

        expect(result.success).toBe(false);
        expect(result.counter).toBe(0);
        expect(result.successCounter).toBe(0);
        expect(result.errorMessages).toEqual(["Setting with key 'nonExistentSetting' not found in parsed settings"]);
        expect(result.message).toBe("Setting with key 'nonExistentSetting' not found in parsed settings");
      });
    });

    describe('hasSettingConfigByKey', () => {
      it('should return true when setting exists', () => {
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.hasSettingConfigByKey('testSetting');

        expect(result).toBe(true);
      });

      it('should return false when setting does not exist', () => {
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.hasSettingConfigByKey('nonExistentSetting');

        expect(result).toBe(false);
      });
    });

    describe('getSettingConfigByKey', () => {
      it('should return setting when it exists', () => {
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.getSettingConfigByKey('testSetting');

        expect(result).toEqual({
          key: 'testSetting',
          config: { name: 'Test Setting', type: Boolean, default: true }
        });
      });

      it('should return null when setting does not exist', () => {
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.getSettingConfigByKey('nonExistentSetting');

        expect(result).toBe(null);
      });
    });

    describe('hasSetting', () => {
      beforeEach(() => {
        global.game = {
          settings: {
            get: vi.fn()
          }
        };
      });

      afterEach(() => {
        delete global.game;
      });

      it('should return true when setting exists in game.settings', () => {
        global.game.settings.get.mockReturnValue(true);
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.hasSetting('testSetting');

        expect(result).toBe(true);
        expect(global.game.settings.get).toHaveBeenCalledWith('foundryvtt-over-my-head', 'testSetting');
      });

      it('should return false when setting does not exist in game.settings', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.hasSetting('nonExistentSetting');

        expect(result).toBe(false);
      });

      it('should return false when setting throws error', () => {
        global.game.settings.get.mockImplementation(() => {
          throw new Error('Setting not found');
        });
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.hasSetting('errorSetting');

        expect(result).toBe(false);
      });

      it('should return false when game.settings is not available', () => {
        delete global.game;
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.hasSetting('testSetting');

        expect(result).toBe(false);
      });

      it('should return false when game is not available', () => {
        global.game = null;
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.hasSetting('testSetting');

        expect(result).toBe(false);
      });
    });

    describe('getSettingValue', () => {
      beforeEach(() => {
        global.game = {
          settings: {
            get: vi.fn()
          }
        };
      });

      afterEach(() => {
        delete global.game;
      });

      it('should return setting value when it exists', () => {
        const expectedValue = true;
        global.game.settings.get.mockReturnValue(expectedValue);
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.getSettingValue('testSetting');

        expect(result).toBe(expectedValue);
        expect(global.game.settings.get).toHaveBeenCalledWith('foundryvtt-over-my-head', 'testSetting');
      });

      it('should return undefined when setting does not exist', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.getSettingValue('nonExistentSetting');

        expect(result).toBe(undefined);
      });

      it('should return undefined when setting throws error', () => {
        global.game.settings.get.mockImplementation(() => {
          throw new Error('Setting not found');
        });
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.getSettingValue('errorSetting');

        expect(result).toBe(undefined);
      });

      it('should return undefined when game.settings is not available', () => {
        delete global.game;
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.getSettingValue('testSetting');

        expect(result).toBe(undefined);
      });

      it('should return values of different types correctly', () => {
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        // Test boolean
        global.game.settings.get.mockReturnValue(false);
        expect(handler.getSettingValue('boolSetting')).toBe(false);

        // Test string
        global.game.settings.get.mockReturnValue('test string');
        expect(handler.getSettingValue('stringSetting')).toBe('test string');

        // Test number
        global.game.settings.get.mockReturnValue(42);
        expect(handler.getSettingValue('numberSetting')).toBe(42);

        // Test object
        const testObject = { key: 'value' };
        global.game.settings.get.mockReturnValue(testObject);
        expect(handler.getSettingValue('objectSetting')).toBe(testObject);
      });
    });

    describe('hasDebugModeSetting', () => {
      beforeEach(() => {
        global.game = {
          settings: {
            get: vi.fn()
          }
        };
      });

      afterEach(() => {
        delete global.game;
      });

      it('should return true when debugMode setting exists', () => {
        global.game.settings.get.mockReturnValue(false);
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.hasDebugModeSetting();

        expect(result).toBe(true);
        expect(global.game.settings.get).toHaveBeenCalledWith('foundryvtt-over-my-head', 'debugMode');
      });

      it('should return false when debugMode setting does not exist', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.hasDebugModeSetting();

        expect(result).toBe(false);
      });

      it('should return false when game.settings is not available', () => {
        delete global.game;
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.hasDebugModeSetting();

        expect(result).toBe(false);
      });
    });

    describe('getDebugModeSettingValue', () => {
      beforeEach(() => {
        global.game = {
          settings: {
            get: vi.fn()
          }
        };
      });

      afterEach(() => {
        delete global.game;
      });

      it('should return debugMode value when it exists', () => {
        global.game.settings.get.mockReturnValue(true);
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.getDebugModeSettingValue();

        expect(result).toBe(true);
        expect(global.game.settings.get).toHaveBeenCalledWith('foundryvtt-over-my-head', 'debugMode');
      });

      it('should return false value correctly', () => {
        global.game.settings.get.mockReturnValue(false);
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.getDebugModeSettingValue();

        expect(result).toBe(false);
      });

      it('should return undefined when debugMode setting does not exist', () => {
        global.game.settings.get.mockReturnValue(undefined);
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.getDebugModeSettingValue();

        expect(result).toBe(undefined);
      });

      it('should return undefined when game.settings is not available', () => {
        delete global.game;
        const handler = new SettingsHandler({ config: mockConfig, utils: mockUtils, context: mockContext });

        const result = handler.getDebugModeSettingValue();

        expect(result).toBe(undefined);
      });
    });
  });
});
