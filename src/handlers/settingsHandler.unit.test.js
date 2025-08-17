/**
 * @file settingsHandler.unit.test.js
 * @description Unit tests for SettingsHandler class and debug mode functionality
 * @path src/handlers/settingsHandler.unit.test.js
 */

import SettingsHandler from './settingsHandler.js';
import SettingsParser from './settingsHelpers/settingsParser.js';
import SettingsRegistrar from './settingsHelpers/settingsRegistrar.js';
import SettingLocalizer from './settingsHelpers/settingLocalizer.js';

// Mock the dependencies
jest.mock('./settingsHelpers/settingsParser.js');
jest.mock('./settingsHelpers/settingsRegistrar.js');
jest.mock('./settingsHelpers/settingLocalizer.js');

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
    manifest: { id: 'test-module' }
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
    manifest: { id: 'test-module' }
  };

  const mockUtils = {
    formatError: jest.fn((error) => error.toString()),
    formatHookName: jest.fn((name) => `test.${name}`),
    logWarning: jest.fn(),
    logDebug: jest.fn(),
    log: jest.fn()
  };

  const mockContext = { test: 'context' };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock SettingsParser
    SettingsParser.mockImplementation(() => ({
      parse: jest.fn().mockReturnValue({
        processed: 2,
        successful: 2,
        parsed: ['testSetting', 'debugMode'],
        failed: []
      })
    }));

    // Mock SettingsRegistrar
    SettingsRegistrar.mockImplementation(() => ({
      register: jest.fn().mockReturnValue({
        success: true,
        counter: 1,
        successCounter: 1,
        errorMessages: [],
        message: 'Registration successful'
      })
    }));

    // Mock SettingLocalizer
    SettingLocalizer.localizeSettings = jest.fn((settings) => settings);
  });

  describe('constructor', () => {
    it('should initialize properly with config containing debugMode', () => {
      const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
      
      expect(handler.settingsConfig).toBe(mockConfig.constants.settings);
      expect(handler.parsedSettings).toBe(mockConfig.constants.settings.settingsList);
      expect(SettingsParser).toHaveBeenCalledWith(mockConfig, mockUtils, mockContext);
      expect(SettingsRegistrar).toHaveBeenCalledWith(mockConfig, mockUtils, mockContext);
    });
  });

  describe('hasDebugModeSetting', () => {
    it('should return true when debugMode setting exists', () => {
      const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
      
      const result = handler.hasDebugModeSetting();
      
      expect(result).toBe(true);
    });

    it('should return false when debugMode setting does not exist', () => {
      const handler = new SettingsHandler(mockConfigWithoutDebug, mockUtils, mockContext);
      
      const result = handler.hasDebugModeSetting();
      
      expect(result).toBe(false);
    });
  });

  describe('getDebugModeSetting', () => {
    it('should return debugMode setting when it exists', () => {
      const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
      
      const result = handler.getDebugModeSetting();
      
      expect(result).toEqual({
        key: 'debugMode',
        config: { name: 'Debug Mode', type: Boolean, default: false }
      });
    });

    it('should return null when debugMode setting does not exist', () => {
      const handler = new SettingsHandler(mockConfigWithoutDebug, mockUtils, mockContext);
      
      const result = handler.getDebugModeSetting();
      
      expect(result).toBe(null);
    });
  });

  describe('registerDebugModeSetting', () => {
    it('should register debugMode setting when it exists', () => {
      const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
      
      // Mock the private registrar by spying on the register method
      const mockRegisterResult = {
        success: true,
        counter: 1,
        successCounter: 1,
        errorMessages: [],
        message: 'Debug mode setting registered successfully'
      };
      
      // We need to spy on the existing register method to test the interaction
      jest.spyOn(handler, 'register').mockReturnValue(mockRegisterResult);
      
      const result = handler.registerDebugModeSetting();
      
      expect(SettingLocalizer.localizeSettings).toHaveBeenCalledWith([{
        key: 'debugMode',
        config: { name: 'Debug Mode', type: Boolean, default: false }
      }], mockUtils);
      expect(result.success).toBe(true);
    });

    it('should return failure result when debugMode setting does not exist', () => {
      const handler = new SettingsHandler(mockConfigWithoutDebug, mockUtils, mockContext);
      
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
      const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
      
      const result = handler.register();
      
      expect(SettingLocalizer.localizeSettings).toHaveBeenCalledWith(
        mockConfig.constants.settings.settingsList,
        mockUtils
      );
      // The result comes from the mocked registrar
      expect(result.success).toBe(true);
    });
  });
});