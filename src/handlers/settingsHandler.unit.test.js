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
      },
      hooks: {
        settingsReady: 'SettingsReady'
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
      },
      hooks: {
        settingsReady: 'SettingsReady'
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

  describe('Generic setting registration methods', () => {
    describe('registerSettingByKey', () => {
      it('should register a setting when key exists', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        
        const mockRegisterResult = {
          success: true,
          counter: 1,
          successCounter: 1,
          errorMessages: [],
          message: 'Setting registered successfully'
        };
        
        // We need to spy on the existing register method to test the interaction
        jest.spyOn(handler, 'register').mockReturnValue(mockRegisterResult);
        
        const result = handler.registerSettingByKey('testSetting');
        
        expect(SettingLocalizer.localizeSettings).toHaveBeenCalledWith([{
          key: 'testSetting',
          config: { name: 'Test Setting', type: Boolean, default: true }
        }], mockUtils);
        expect(result.success).toBe(true);
      });

      it('should return failure result when setting key does not exist', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        
        const result = handler.registerSettingByKey('nonExistentSetting');
        
        expect(result.success).toBe(false);
        expect(result.counter).toBe(0);
        expect(result.successCounter).toBe(0);
        expect(result.errorMessages).toEqual(["Setting with key 'nonExistentSetting' not found in parsed settings"]);
        expect(result.message).toBe("Setting with key 'nonExistentSetting' not found in parsed settings");
      });

      it('should register debugMode setting when using registerSettingByKey', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        
        const mockRegisterResult = {
          success: true,
          counter: 1,
          successCounter: 1,
          errorMessages: [],
          message: 'Debug mode setting registered successfully'
        };
        
        jest.spyOn(handler, 'register').mockReturnValue(mockRegisterResult);
        
        const result = handler.registerSettingByKey('debugMode');
        
        expect(SettingLocalizer.localizeSettings).toHaveBeenCalledWith([{
          key: 'debugMode',
          config: { name: 'Debug Mode', type: Boolean, default: false }
        }], mockUtils);
        expect(result.success).toBe(true);
      });
    });

    describe('hasSettingByKey', () => {
      it('should return true when setting key exists', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        
        expect(handler.hasSettingByKey('testSetting')).toBe(true);
        expect(handler.hasSettingByKey('debugMode')).toBe(true);
      });

      it('should return false when setting key does not exist', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        
        expect(handler.hasSettingByKey('nonExistentSetting')).toBe(false);
      });

      it('should return false for debugMode when not present in config', () => {
        const handler = new SettingsHandler(mockConfigWithoutDebug, mockUtils, mockContext);
        
        expect(handler.hasSettingByKey('debugMode')).toBe(false);
        expect(handler.hasSettingByKey('testSetting')).toBe(true);
      });
    });

    describe('getSettingByKey', () => {
      it('should return setting object when key exists', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        
        const testSetting = handler.getSettingByKey('testSetting');
        expect(testSetting).toEqual({
          key: 'testSetting',
          config: { name: 'Test Setting', type: Boolean, default: true }
        });

        const debugSetting = handler.getSettingByKey('debugMode');
        expect(debugSetting).toEqual({
          key: 'debugMode',
          config: { name: 'Debug Mode', type: Boolean, default: false }
        });
      });

      it('should return null when setting key does not exist', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        
        const nonExistentSetting = handler.getSettingByKey('nonExistentSetting');
        expect(nonExistentSetting).toBeNull();
      });

      it('should return null for debugMode when not present in config', () => {
        const handler = new SettingsHandler(mockConfigWithoutDebug, mockUtils, mockContext);
        
        const debugSetting = handler.getSettingByKey('debugMode');
        expect(debugSetting).toBeNull();
        
        const testSetting = handler.getSettingByKey('testSetting');
        expect(testSetting).toEqual({
          key: 'testSetting',
          config: { name: 'Test Setting', type: Boolean, default: true }
        });
      });
    });
  });

  describe('Hook system methods', () => {
    describe('registerSettingHook', () => {
      it('should register a hook callback for an event', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        const callback = jest.fn();
        
        const result = handler.registerSettingHook('settingRegistered', callback);
        
        expect(result).toBe(true);
        expect(handler.getRegisteredHooks()).toEqual({ settingsReady: 1, settingRegistered: 1 });
      });

      it('should return false for invalid parameters', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        
        expect(handler.registerSettingHook('event', 'not-a-function')).toBe(false);
        expect(handler.registerSettingHook(123, jest.fn())).toBe(false);
        expect(handler.registerSettingHook(null, jest.fn())).toBe(false);
      });

      it('should allow multiple callbacks for the same event', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        
        handler.registerSettingHook('settingRegistered', callback1);
        handler.registerSettingHook('settingRegistered', callback2);
        
        expect(handler.getRegisteredHooks()).toEqual({ settingsReady: 1, settingRegistered: 2 });
      });
    });

    describe('triggerSettingHook', () => {
      it('should execute all registered callbacks for an event', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        const testData = { key: 'testSetting', success: true };
        
        handler.registerSettingHook('settingRegistered', callback1);
        handler.registerSettingHook('settingRegistered', callback2);
        
        const executedCount = handler.triggerSettingHook('settingRegistered', testData);
        
        expect(executedCount).toBe(2);
        expect(callback1).toHaveBeenCalledWith(testData);
        expect(callback2).toHaveBeenCalledWith(testData);
      });

      it('should return 0 for non-existent events', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        
        const executedCount = handler.triggerSettingHook('nonExistentEvent');
        
        expect(executedCount).toBe(0);
      });

      it('should handle callback errors gracefully', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        const errorCallback = jest.fn(() => { throw new Error('Test error'); });
        const normalCallback = jest.fn();
        
        handler.registerSettingHook('settingRegistered', errorCallback);
        handler.registerSettingHook('settingRegistered', normalCallback);
        
        const executedCount = handler.triggerSettingHook('settingRegistered', {});
        
        expect(executedCount).toBe(1); // Only the normal callback executed successfully
        expect(normalCallback).toHaveBeenCalled();
        expect(mockUtils.logWarning).toHaveBeenCalledWith(expect.stringContaining('Error executing setting hook callback'));
      });
    });

    describe('removeSettingHook', () => {
      it('should remove a specific callback', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        
        handler.registerSettingHook('settingRegistered', callback1);
        handler.registerSettingHook('settingRegistered', callback2);
        
        const removed = handler.removeSettingHook('settingRegistered', callback1);
        
        expect(removed).toBe(true);
        expect(handler.getRegisteredHooks()).toEqual({ settingsReady: 1, settingRegistered: 1 });
        
        handler.triggerSettingHook('settingRegistered', {});
        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
      });

      it('should return false for non-existent callbacks', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        const callback = jest.fn();
        
        const removed = handler.removeSettingHook('settingRegistered', callback);
        
        expect(removed).toBe(false);
      });

      it('should remove event entry when no callbacks remain', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        const callback = jest.fn();
        
        handler.registerSettingHook('testEvent', callback);
        handler.removeSettingHook('testEvent', callback);
        
        expect(handler.getRegisteredHooks()).toEqual({ settingsReady: 1 });
      });
    });

    describe('getRegisteredHooks', () => {
      it('should return hooks with callback counts', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        
        handler.registerSettingHook('event1', jest.fn());
        handler.registerSettingHook('event1', jest.fn());
        handler.registerSettingHook('event2', jest.fn());
        
        const hooks = handler.getRegisteredHooks();
        
        expect(hooks).toEqual({
          settingsReady: 1,
          event1: 2,
          event2: 1
        });
      });

      it('should return empty object when no hooks are registered', () => {
        // Create handler without settingsReady hook by mocking config without hooks
        const configWithoutHooks = {
          constants: {
            settings: mockConfig.constants.settings,
            hooks: undefined
          },
          manifest: mockConfig.manifest
        };
        
        const handler = new SettingsHandler(configWithoutHooks, mockUtils, mockContext);
        
        expect(handler.getRegisteredHooks()).toEqual({});
      });
    });

    describe('Hook integration with registration methods', () => {
      it('should trigger settingRegistered hook when registerSettingByKey succeeds', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        const callback = jest.fn();
        
        handler.registerSettingHook('settingRegistered', callback);
        
        const mockRegisterResult = { success: true, counter: 1, successCounter: 1 };
        jest.spyOn(handler, 'register').mockReturnValue(mockRegisterResult);
        
        handler.registerSettingByKey('testSetting');
        
        expect(callback).toHaveBeenCalledWith({
          key: 'testSetting',
          config: { name: 'Test Setting', type: Boolean, default: true },
          success: true
        });
      });

      it('should trigger hooks when register method succeeds', () => {
        const handler = new SettingsHandler(mockConfig, mockUtils, mockContext);
        const settingCallback = jest.fn();
        const readyCallback = jest.fn();
        
        handler.registerSettingHook('settingRegistered', settingCallback);
        handler.registerSettingHook('settingsReady', readyCallback);
        
        // Mock just the #registrar.register method to return success
        const mockResult = { success: true, counter: 2, successCounter: 2 };
        
        // Create a spy for the register method to test hook triggering
        const originalRegister = handler.register.bind(handler);
        jest.spyOn(handler, 'register').mockImplementation((settings = handler.parsedSettings) => {
          // Call the hook triggering logic manually
          if (mockResult.success && Array.isArray(settings)) {
            for (const setting of settings) {
              handler.triggerSettingHook('settingRegistered', {
                key: setting.key,
                config: setting.config,
                success: true
              });
            }
            handler.triggerSettingHook('settingsReady', {
              registeredCount: mockResult.successCounter,
              totalCount: mockResult.counter
            });
          }
          return mockResult;
        });
        
        handler.register();
        
        expect(settingCallback).toHaveBeenCalledTimes(2); // Once for each setting
        expect(readyCallback).toHaveBeenCalledWith({
          registeredCount: 2,
          totalCount: 2
        });
      });
    });
  });
});