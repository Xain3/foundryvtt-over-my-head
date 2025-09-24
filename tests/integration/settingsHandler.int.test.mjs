/**
 * @file settingsHandler.int.test.js
 * @description Integration tests for the SettingsHandler class with real helper classes
 * @path tests/integration/settingsHandler.int.test.js
 */

import SettingsHandler from '../../src/handlers/settingsHandler.mjs';
import SettingsParser from '../../src/handlers/settingsHelpers/settingsParser.mjs';
import SettingsRegistrar from '../../src/handlers/settingsHelpers/settingsRegistrar.mjs';

// Mock Foundry VTT API
global.game = {
  settings: {
    register: jest.fn(),
    get: jest.fn(),
    set: jest.fn()
  }
};

global.Hooks = {
  call: jest.fn(),
  callAll: jest.fn()
};

describe('SettingsHandler Integration Tests', () => {
  let config, context, utils, settingsHandler;

  beforeEach(() => {
    jest.clearAllMocks();

    config = {
      constants: {
        settings: {
          requiredKeys: ['key', 'config.name', 'config.type'],
          settingsList: [
            {
              key: 'debugMode',
              config: {
                name: 'Debug Mode',
                hint: 'Enable debug logging',
                scope: 'client',
                config: true,
                type: Boolean,
                default: false,
                onChange: {
                  sendHook: true,
                  hookName: 'debugModeChanged'
                }
              }
            },
            {
              key: 'maxTokens',
              config: {
                name: 'Maximum Tokens',
                hint: 'Set the maximum number of tokens',
                scope: 'world',
                config: true,
                type: Number,
                default: 10,
                range: {
                  min: 1,
                  max: 100,
                  step: 1
                },
                onChange: {
                  sendHook: true
                }
              }
            },
            {
              key: 'hiddenSetting',
              config: {
                name: 'Hidden Setting',
                scope: 'world',
                config: false,
                type: String,
                default: 'internal',
                onChange: {
                  sendHook: false
                }
              }
            }
          ]
        },
        hooks: {
          setting: '.setting'
        }
      },
      manifest: {
        id: 'test-module',
        title: 'Test Module'
      }
    };

    context = {
      state: {},
      flags: {},
      settings: {}
    };

    utils = {
      formatError: jest.fn((error) => `Error: ${error.message || error}`),
      formatHookName: jest.fn((base, suffix) => `TEST${base}${suffix || ''}`),
      logWarning: jest.fn(),
      logDebug: jest.fn(),
      logInfo: jest.fn()
    };
  });

  describe('Full Integration Workflow', () => {
    beforeEach(() => {
      settingsHandler = new SettingsHandler(config, utils, context);
    });

    it('should successfully parse and register all settings', () => {
      const registerResult = settingsHandler.register();

      expect(registerResult.success).toBe(true);
      expect(registerResult.counter).toBe(3);
      expect(registerResult.successCounter).toBe(3);
      expect(game.settings.register).toHaveBeenCalledTimes(3);
    });

    it('should register settings with correct parameters', () => {
      settingsHandler.register();

      // Check first setting (with custom hook name)
      expect(game.settings.register).toHaveBeenCalledWith(
        'test-module',
        'debugMode',
        expect.objectContaining({
          name: 'Debug Mode',
          hint: 'Enable debug logging',
          scope: 'client',
          config: true,
          type: Boolean,
          default: false,
          onChange: expect.any(Function)
        })
      );

      // Check second setting (with default hook name)
      expect(game.settings.register).toHaveBeenCalledWith(
        'test-module',
        'maxTokens',
        expect.objectContaining({
          name: 'Maximum Tokens',
          scope: 'world',
          config: true,
          type: Number,
          default: 10,
          range: {
            min: 1,
            max: 100,
            step: 1
          },
          onChange: expect.any(Function)
        })
      );

      // Check third setting (no hook)
      expect(game.settings.register).toHaveBeenCalledWith(
        'test-module',
        'hiddenSetting',
        expect.objectContaining({
          name: 'Hidden Setting',
          scope: 'world',
          config: false,
          type: String,
          default: 'internal'
          // Should NOT have onChange since sendHook is false
        })
      );
    });

    it('should create working onChange callbacks for hook-enabled settings', () => {
      settingsHandler.register();

      // Get the onChange function from the first call
      const debugModeCall = game.settings.register.mock.calls.find(
        call => call[1] === 'debugMode'
      );
      const debugModeOnChange = debugModeCall[2].onChange;

      // Test the onChange callback - now always uses Hooks.callAll
      debugModeOnChange(true);
      expect(Hooks.callAll).toHaveBeenCalledWith('TEST.settingdebugModeChanged', true);

      // Get the onChange function from the second call
      const maxTokensCall = game.settings.register.mock.calls.find(
        call => call[1] === 'maxTokens'
      );
      const maxTokensOnChange = maxTokensCall[2].onChange;

      // Test the onChange callback (should use default hook name)
      maxTokensOnChange(25);
      expect(Hooks.callAll).toHaveBeenCalledWith('TEST.settingmaxTokens', 25);
    });

    it('should not add onChange callback for settings with sendHook: false', () => {
      settingsHandler.register();

      const hiddenSettingCall = game.settings.register.mock.calls.find(
        call => call[1] === 'hiddenSetting'
      );
      const hiddenSettingConfig = hiddenSettingCall[2];

      expect(hiddenSettingConfig).not.toHaveProperty('onChange');
    });
  });

  describe('Error Recovery Integration', () => {
    it('should continue registration even if one setting fails', () => {
      // Make the first setting registration fail
      game.settings.register
        .mockImplementationOnce(() => {
          throw new Error('Registration failed');
        })
        .mockImplementation(() => {
          // Succeed for other calls
        });

      settingsHandler = new SettingsHandler(config, utils, context);
      const result = settingsHandler.register();

      expect(result.counter).toBe(3);
      expect(result.successCounter).toBe(2); // 2 succeeded, 1 failed
      expect(result.success).toBe(true); // Partial success (successCounter > 0)
    });

    it('should handle hook formatting failures gracefully', () => {
      // Make hook formatting fail
      utils.formatHookName.mockImplementation(() => {
        throw new Error('Hook formatting failed');
      });

      settingsHandler = new SettingsHandler(config, utils, context);
      const result = settingsHandler.register();

      // Settings should still register, just without hooks
      expect(result.counter).toBe(3);
      expect(result.successCounter).toBe(3);
      expect(utils.logWarning).toHaveBeenCalled();
    });
  });

  describe('Custom Settings Integration', () => {
    it('should parse and register custom settings provided at runtime', () => {
      settingsHandler = new SettingsHandler(config, utils, context);

      const customSettings = [
        {
          key: 'runtimeSetting',
          config: {
            name: 'Runtime Setting',
            scope: 'client',
            config: true,
            type: String,
            default: 'custom',
            onChange: {
              sendHook: true,
              hookName: 'runtimeChanged'
            }
          }
        }
      ];

      const parseResult = settingsHandler.parse(customSettings);
      const registerResult = settingsHandler.register(customSettings); // Pass the modified settings array

      expect(registerResult.success).toBe(true);
      expect(registerResult.counter).toBe(1);
      expect(game.settings.register).toHaveBeenCalledWith(
        'test-module',
        'runtimeSetting',
        expect.objectContaining({
          name: 'Runtime Setting',
          onChange: expect.any(Function)
        })
      );
    });
  });

  describe('Real-world Foundry VTT Compatibility', () => {
    it('should register settings that match Foundry VTT expected format', () => {
      settingsHandler = new SettingsHandler(config, utils, context);
      settingsHandler.register();

      // Verify all registered settings follow Foundry patterns
      game.settings.register.mock.calls.forEach(([namespace, key, config]) => {
        expect(typeof namespace).toBe('string');
        expect(typeof key).toBe('string');
        expect(typeof config).toBe('object');
        expect(config).toHaveProperty('name');
        expect(['world', 'client', 'user']).toContain(config.scope);
        expect([Boolean, Number, String, Object, Array]).toContain(config.type);
        expect(config).toHaveProperty('default');
      });
    });

    it('should support all Foundry VTT setting scopes using Hooks.callAll', () => {
      const multiScopeConfig = {
        ...config,
        constants: {
          ...config.constants,
          settings: {
            ...config.constants.settings,
            settingsList: [
              {
                key: 'worldSetting',
                config: {
                  name: 'World Setting',
                  scope: 'world',
                  type: Boolean,
                  default: true,
                  onChange: { sendHook: true }
                }
              },
              {
                key: 'clientSetting',
                config: {
                  name: 'Client Setting',
                  scope: 'client',
                  type: String,
                  default: 'client',
                  onChange: { sendHook: true }
                }
              },
              {
                key: 'userSetting',
                config: {
                  name: 'User Setting',
                  scope: 'user',
                  type: Number,
                  default: 5,
                  onChange: { sendHook: true }
                }
              }
            ]
          }
        }
      };

      settingsHandler = new SettingsHandler(multiScopeConfig, utils, context);
      settingsHandler.register();

      // Test hook calling behavior for different scopes
      const worldCall = game.settings.register.mock.calls.find(call => call[1] === 'worldSetting');
      const clientCall = game.settings.register.mock.calls.find(call => call[1] === 'clientSetting');
      const userCall = game.settings.register.mock.calls.find(call => call[1] === 'userSetting');

      // World scope should use Hooks.callAll
      worldCall[2].onChange('newValue');
      expect(Hooks.callAll).toHaveBeenCalledWith('TEST.settingworldSetting', 'newValue');

      // Client scope now also uses Hooks.callAll
      clientCall[2].onChange('clientValue');
      expect(Hooks.callAll).toHaveBeenCalledWith('TEST.settingclientSetting', 'clientValue');

      // User scope now also uses Hooks.callAll
      userCall[2].onChange(10);
      expect(Hooks.callAll).toHaveBeenCalledWith('TEST.settinguserSetting', 10);
    });
  });

  describe('Performance Integration', () => {
    it('should handle large numbers of settings efficiently', () => {
      const largeSettingsConfig = {
        ...config,
        constants: {
          ...config.constants,
          settings: {
            ...config.constants.settings,
            settingsList: Array.from({ length: 100 }, (_, i) => ({
              key: `setting${i}`,
              config: {
                name: `Setting ${i}`,
                scope: 'world',
                type: Boolean,
                default: false,
                onChange: { sendHook: true }
              }
            }))
          }
        }
      };

      const startTime = Date.now();
      settingsHandler = new SettingsHandler(largeSettingsConfig, utils, context);
      const result = settingsHandler.register();
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.counter).toBe(100);
      expect(result.successCounter).toBe(100);
      expect(game.settings.register).toHaveBeenCalledTimes(100);

      // Should complete in reasonable time (under 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Settings Retrieval Integration', () => {
    let settingsHandler;

    beforeEach(() => {
      // Ensure clean setup of global.game for retrieval tests
      global.game = {
        settings: {
          register: jest.fn(),
          get: jest.fn(),
          set: jest.fn()
        }
      };

      global.Hooks = {
        call: jest.fn(),
        callAll: jest.fn()
      };

      settingsHandler = new SettingsHandler(config, utils, context);
      
      // Mock settings values for retrieval testing
      global.game.settings.get.mockImplementation((namespace, key) => {
        const mockValues = {
          'test-module': {
            debugMode: true,
            maxTokens: 25,
            hiddenSetting: 'secret-value'
          }
        };
        return mockValues[namespace]?.[key];
      });
    });

    describe('hasSetting method', () => {
      it('should correctly identify existing settings', () => {
        expect(settingsHandler.hasSetting('debugMode')).toBe(true);
        expect(settingsHandler.hasSetting('maxTokens')).toBe(true);
        expect(settingsHandler.hasSetting('hiddenSetting')).toBe(true);
      });

      it('should return false for non-existent settings', () => {
        expect(settingsHandler.hasSetting('nonExistentSetting')).toBe(false);
      });

      it('should handle game settings API unavailability', () => {
        delete global.game;
        expect(settingsHandler.hasSetting('debugMode')).toBe(false);
      });
    });

    describe('getSettingValue method', () => {
      it('should retrieve correct setting values', () => {
        expect(settingsHandler.getSettingValue('debugMode')).toBe(true);
        expect(settingsHandler.getSettingValue('maxTokens')).toBe(25);
        expect(settingsHandler.getSettingValue('hiddenSetting')).toBe('secret-value');
      });

      it('should return undefined for non-existent settings', () => {
        expect(settingsHandler.getSettingValue('nonExistentSetting')).toBe(undefined);
      });

      it('should handle game settings API unavailability', () => {
        delete global.game;
        expect(settingsHandler.getSettingValue('debugMode')).toBe(undefined);
      });
    });

    describe('Debug mode convenience methods', () => {
      it('should correctly check for debug mode setting existence', () => {
        expect(settingsHandler.hasDebugModeSetting()).toBe(true);
      });

      it('should correctly retrieve debug mode setting value', () => {
        expect(settingsHandler.getDebugModeSettingValue()).toBe(true);
      });

      it('should handle disabled debug mode correctly', () => {
        global.game.settings.get.mockImplementation((namespace, key) => {
          if (namespace === 'test-module' && key === 'debugMode') return false;
          return undefined;
        });

        expect(settingsHandler.hasDebugModeSetting()).toBe(true);
        expect(settingsHandler.getDebugModeSettingValue()).toBe(false);
      });
    });

    describe('Integration with Handlers class', () => {
      it('should provide access to settings retrieval through Handlers convenience methods', () => {
        const handlers = { settings: settingsHandler };
        
        // Simulate the Handlers class delegation methods
        const hasSetting = (key) => handlers.settings.hasSetting(key);
        const getSettingValue = (key) => handlers.settings.getSettingValue(key);
        const hasDebugModeSetting = () => handlers.settings.hasDebugModeSetting();
        const getDebugModeSettingValue = () => handlers.settings.getDebugModeSettingValue();

        expect(hasSetting('debugMode')).toBe(true);
        expect(getSettingValue('maxTokens')).toBe(25);
        expect(hasDebugModeSetting()).toBe(true);
        expect(getDebugModeSettingValue()).toBe(true);
      });
    });

    describe('Mixed configuration and value retrieval workflow', () => {
      it('should handle complete workflow of checking config, registering, and retrieving values', () => {
        // 1. Check if setting exists in configuration
        expect(settingsHandler.hasSettingConfigByKey('debugMode')).toBe(true);
        expect(settingsHandler.hasSettingConfigByKey('nonExistentSetting')).toBe(false);

        // 2. Get setting configuration details
        const debugConfig = settingsHandler.getSettingConfigByKey('debugMode');
        expect(debugConfig).toBeTruthy();
        expect(debugConfig.config.type).toBe(Boolean);
        expect(debugConfig.config.default).toBe(false);

        // 3. Register the settings with Foundry VTT
        const registerResult = settingsHandler.register();
        expect(registerResult.success).toBe(true);

        // 4. Retrieve actual values from Foundry VTT
        expect(settingsHandler.hasSetting('debugMode')).toBe(true);
        expect(settingsHandler.getSettingValue('debugMode')).toBe(true);

        // 5. Compare config default vs actual value
        expect(settingsHandler.getSettingValue('debugMode')).not.toBe(debugConfig.config.default);
      });
    });
  });
});
