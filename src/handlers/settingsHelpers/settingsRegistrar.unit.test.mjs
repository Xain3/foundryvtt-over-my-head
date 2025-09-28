/**
 * @file settingsRegistrar.unit.test.mjs
 * @description Unit tests for the SettingsRegistrar class for registering Foundry VTT settings.
 * @path src/handlers/settingsHelpers/settingsRegistrar.unit.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';

// Mock modules with problematic imports first
vi.mock('@/baseClasses/handler', () => ({
  default: class MockHandler {
    constructor(config, utils, context = {}) {
      this.config = config;
      this.utils = utils;
      this.context = context;
    }
  }
}));

vi.mock('./flagEvaluator.mjs', () => ({
  default: {
    evaluate: vi.fn(),
    checkConditions: vi.fn()
  }
}));

import SettingsRegistrar from './settingsRegistrar.mjs';
import MockSettings from '../../../tests/mocks/MockSettings.mjs';
import FlagEvaluator from './flagEvaluator.mjs';

describe('SettingsRegistrar', () => {
  let registrar;
  let mockConfig;
  let mockContext;
  let mockUtils;
  let mockGameSettings;

  beforeEach(() => {
    // Setup mock config
    mockConfig = {
      manifest: {
        id: 'test-module'
      }
    };

    // Setup mock context
    mockContext = {};

    // Setup mock utils
    mockUtils = {
      formatError: vi.fn((message) => `Formatted: ${message}`),
      logWarning: vi.fn()
    };

    // Setup mock game settings
    mockGameSettings = new MockSettings();

    // Mock globalThis.game
    globalThis.game = {
      settings: mockGameSettings
    };

    // Setup FlagEvaluator mock to return true by default (existing tests expect settings to register)
    FlagEvaluator.shouldShow = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    // Clean up global mocks
    delete globalThis.game;
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create registrar with provided namespace', () => {
      registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils, 'custom-namespace');

      expect(registrar.namespace).toBe('custom-namespace');
    });

    it('should create registrar with namespace from config manifest id', () => {
      registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils);

      expect(registrar.namespace).toBe('test-module');
    });

    it('should create registrar with namespace when no explicit namespace provided', () => {
      registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils, null);

      expect(registrar.namespace).toBe('test-module');
    });

    it('should throw error when config manifest id is missing', () => {
      const invalidConfig = { manifest: {} };

      expect(() => {
        new SettingsRegistrar(invalidConfig, mockContext, mockUtils);
      }).toThrow('Invalid configuration: missing manifest ID');
    });

    it('should throw error when config is missing', () => {
      expect(() => {
        new SettingsRegistrar(null, mockContext, mockUtils);
      }).toThrow('Invalid configuration: missing manifest ID');
    });

    it('should throw error when config manifest is missing', () => {
      const invalidConfig = {};

      expect(() => {
        new SettingsRegistrar(invalidConfig, mockContext, mockUtils);
      }).toThrow('Invalid configuration: missing manifest ID');
    });
  });

  describe('registerSetting', () => {
    beforeEach(() => {
      registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils);
    });

    describe('Input Validation', () => {
      it('should fail when setting is null', () => {
        const result = registrar.registerSetting(null);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to register Unknown Setting: Invalid setting format');
      });

      it('should fail when setting is undefined', () => {
        const result = registrar.registerSetting(undefined);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to register Unknown Setting: Invalid setting format');
      });

      it('should fail when setting is not an object', () => {
        const result = registrar.registerSetting('invalid');

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to register Unknown Setting: Invalid setting format');
      });

      it('should fail when setting is missing key', () => {
        const setting = { config: { name: 'Test' } };
        const result = registrar.registerSetting(setting);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to register Unknown Setting: Missing key or config');
      });

      it('should fail when setting is missing config', () => {
        const setting = { key: 'testKey' };
        const result = registrar.registerSetting(setting);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to register testKey: Missing key or config');
      });

      it('should fail when game is not available', () => {
        delete globalThis.game;
        const setting = { key: 'testKey', config: { name: 'Test' } };
        const result = registrar.registerSetting(setting);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to register testKey: Game settings not ready');
      });

      it('should fail when game.settings is not available', () => {
        globalThis.game = {};
        const setting = { key: 'testKey', config: { name: 'Test' } };
        const result = registrar.registerSetting(setting);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to register testKey: Game settings not ready');
      });
    });

    describe('Successful Cases', () => {
      it('should register valid setting successfully', () => {
        const setting = {
          key: 'testSetting',
          config: {
            name: 'Test Setting',
            scope: 'world',
            config: true,
            type: String,
            default: 'defaultValue'
          }
        };

        const result = registrar.registerSetting(setting);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting testSetting registered successfully.');
        expect(mockGameSettings.get('test-module', 'testSetting')).toBe('defaultValue');
      });

      it('should register setting with different data types', () => {
        const booleanSetting = {
          key: 'booleanSetting',
          config: { type: Boolean, default: true }
        };
        const numberSetting = {
          key: 'numberSetting',
          config: { type: Number, default: 42 }
        };
        const objectSetting = {
          key: 'objectSetting',
          config: { type: Object, default: { key: 'value' } }
        };

        const boolResult = registrar.registerSetting(booleanSetting);
        const numberResult = registrar.registerSetting(numberSetting);
        const objectResult = registrar.registerSetting(objectSetting);

        expect(boolResult.success).toBe(true);
        expect(numberResult.success).toBe(true);
        expect(objectResult.success).toBe(true);

        expect(mockGameSettings.get('test-module', 'booleanSetting')).toBe(true);
        expect(mockGameSettings.get('test-module', 'numberSetting')).toBe(42);
        expect(mockGameSettings.get('test-module', 'objectSetting')).toEqual({ key: 'value' });
      });

      it('should register setting with custom namespace', () => {
        registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils, 'custom-module');
        const setting = {
          key: 'customSetting',
          config: { name: 'Custom Setting', default: 'customValue' }
        };

        const result = registrar.registerSetting(setting);

        expect(result.success).toBe(true);
        expect(mockGameSettings.get('custom-module', 'customSetting')).toBe('customValue');
      });
    });

    describe('Error Cases', () => {
      it('should handle registration errors gracefully', () => {
        // Mock register to throw an error
        mockGameSettings.register = vi.fn(() => {
          throw new Error('Registration failed');
        });

        const setting = {
          key: 'failingSetting',
          config: { name: 'Failing Setting' }
        };

        const result = registrar.registerSetting(setting);

        expect(result.success).toBe(false);
        expect(result.message).toBe('Failed to register failingSetting: Registration failed');
      });

      it('should handle complex registration errors', () => {
        mockGameSettings.register = vi.fn(() => {
          throw new Error('Duplicate setting key');
        });

        const setting = {
          key: 'duplicateSetting',
          config: { name: 'Duplicate Setting' }
        };

        const result = registrar.registerSetting(setting);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to register duplicateSetting: Duplicate setting key');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string key', () => {
        const setting = {
          key: '',
          config: { name: 'Empty Key Setting' }
        };

        const result = registrar.registerSetting(setting);

        expect(result.success).toBe(false);
        expect(result.message).toContain('Failed to register Unknown Setting: Missing key or config');
        expect(mockUtils.logWarning).toHaveBeenCalledWith('Invalid setting object provided, using default name.');
      });

      it('should handle empty config object', () => {
        const setting = {
          key: 'emptySetting',
          config: {}
        };

        const result = registrar.registerSetting(setting);

        expect(result.success).toBe(true);
        expect(mockGameSettings.get('test-module', 'emptySetting')).toBeUndefined();
      });

      it('should handle setting with special characters in key', () => {
        const setting = {
          key: 'special-setting_123',
          config: { name: 'Special Setting', default: 'value' }
        };

        const result = registrar.registerSetting(setting);

        expect(result.success).toBe(true);
        expect(mockGameSettings.get('test-module', 'special-setting_123')).toBe('value');
      });
    });
  });

  describe('register', () => {
    beforeEach(() => {
      registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils);
    });

    describe('Input Validation', () => {
      it('should throw error for null settings', () => {
        expect(() => {
          registrar.register(null);
        }).toThrow('Formatted: Settings cannot be registered: invalid format');
        expect(mockUtils.formatError).toHaveBeenCalledWith('Settings cannot be registered: invalid format');
      });

      it('should throw error for undefined settings', () => {
        expect(() => {
          registrar.register(undefined);
        }).toThrow('Formatted: Settings cannot be registered: invalid format');
      });

      it('should throw error for non-object settings', () => {
        expect(() => {
          registrar.register('invalid');
        }).toThrow('Formatted: Settings cannot be registered: invalid format');
      });

      it('should throw error for primitive values', () => {
        expect(() => {
          registrar.register(123);
        }).toThrow('Formatted: Settings cannot be registered: invalid format');

        expect(() => {
          registrar.register(true);
        }).toThrow('Formatted: Settings cannot be registered: invalid format');
      });
    });

    describe('Array Input', () => {
      it('should register array of valid settings', () => {
        const settings = [
          { key: 'setting1', config: { name: 'Setting 1', default: 'value1' } },
          { key: 'setting2', config: { name: 'Setting 2', default: 'value2' } },
          { key: 'setting3', config: { name: 'Setting 3', default: 'value3' } }
        ];

        const result = registrar.register(settings);

        expect(result.success).toBe(true);
        expect(result.counter).toBe(3);
        expect(result.successCounter).toBe(3);
        expect(result.errorMessages).toHaveLength(0);
        expect(result.message).toBe('Registered 3 out of 3 settings successfully.');

        expect(mockGameSettings.get('test-module', 'setting1')).toBe('value1');
        expect(mockGameSettings.get('test-module', 'setting2')).toBe('value2');
        expect(mockGameSettings.get('test-module', 'setting3')).toBe('value3');
      });

      it('should handle mixed valid and invalid settings in array', () => {
        const settings = [
          { key: 'validSetting', config: { name: 'Valid Setting', default: 'valid' } },
          { key: 'invalidSetting' }, // missing config
          { config: { name: 'Missing Key' } }, // missing key
          { key: 'anotherValid', config: { name: 'Another Valid', default: 'valid2' } }
        ];

        const result = registrar.register(settings);

        expect(result.success).toBe(true);
        expect(result.counter).toBe(4);
        expect(result.successCounter).toBe(2);
        expect(result.errorMessages).toHaveLength(2);
        expect(result.message).toContain('Registered 2 out of 4 settings successfully.');
        expect(result.message).toContain('Errors:');

        expect(mockGameSettings.get('test-module', 'validSetting')).toBe('valid');
        expect(mockGameSettings.get('test-module', 'anotherValid')).toBe('valid2');
      });

      it('should handle empty array', () => {
        const result = registrar.register([]);

        expect(result.success).toBe(false);
        expect(result.counter).toBe(0);
        expect(result.successCounter).toBe(0);
        expect(result.errorMessages).toHaveLength(0);
        expect(result.message).toBe('Registered 0 out of 0 settings successfully.');
      });

      it('should handle array with all invalid settings', () => {
        const settings = [
          { key: 'invalid1' }, // missing config
          { config: { name: 'Invalid 2' } }, // missing key
          null, // invalid format
          'invalid' // invalid format
        ];

        const result = registrar.register(settings);

        expect(result.success).toBe(false);
        expect(result.counter).toBe(4);
        expect(result.successCounter).toBe(0);
        expect(result.errorMessages).toHaveLength(4);
        expect(result.message).toContain('Registered 0 out of 4 settings successfully.');
      });
    });

    describe('Object Input', () => {
      it('should register object with valid settings', () => {
        const settings = {
          setting1: { key: 'setting1', config: { name: 'Setting 1', default: 'value1' } },
          setting2: { key: 'setting2', config: { name: 'Setting 2', default: 'value2' } },
          setting3: { key: 'setting3', config: { name: 'Setting 3', default: 'value3' } }
        };

        const result = registrar.register(settings);

        expect(result.success).toBe(true);
        expect(result.counter).toBe(3);
        expect(result.successCounter).toBe(3);
        expect(result.errorMessages).toHaveLength(0);
        expect(result.message).toBe('Registered 3 out of 3 settings successfully.');

        expect(mockGameSettings.get('test-module', 'setting1')).toBe('value1');
        expect(mockGameSettings.get('test-module', 'setting2')).toBe('value2');
        expect(mockGameSettings.get('test-module', 'setting3')).toBe('value3');
      });

      it('should handle mixed valid and invalid settings in object', () => {
        const settings = {
          valid1: { key: 'validSetting', config: { name: 'Valid Setting', default: 'valid' } },
          invalid1: { key: 'invalidSetting' }, // missing config
          invalid2: { config: { name: 'Missing Key' } }, // missing key
          valid2: { key: 'anotherValid', config: { name: 'Another Valid', default: 'valid2' } }
        };

        const result = registrar.register(settings);

        expect(result.success).toBe(true);
        expect(result.counter).toBe(4);
        expect(result.successCounter).toBe(2);
        expect(result.errorMessages).toHaveLength(2);
        expect(result.message).toContain('Registered 2 out of 4 settings successfully.');
        expect(result.message).toContain('Errors:');

        expect(mockGameSettings.get('test-module', 'validSetting')).toBe('valid');
        expect(mockGameSettings.get('test-module', 'anotherValid')).toBe('valid2');
      });

      it('should handle empty object', () => {
        const result = registrar.register({});

        expect(result.success).toBe(false);
        expect(result.counter).toBe(0);
        expect(result.successCounter).toBe(0);
        expect(result.errorMessages).toHaveLength(0);
        expect(result.message).toBe('Registered 0 out of 0 settings successfully.');
      });

      it('should handle object with all invalid settings', () => {
        const settings = {
          invalid1: { key: 'invalid1' }, // missing config
          invalid2: { config: { name: 'Invalid 2' } }, // missing key
          invalid3: null, // invalid format
          invalid4: 'invalid' // invalid format
        };

        const result = registrar.register(settings);

        expect(result.success).toBe(false);
        expect(result.counter).toBe(4);
        expect(result.successCounter).toBe(0);
        expect(result.errorMessages).toHaveLength(4);
        expect(result.message).toContain('Registered 0 out of 4 settings successfully.');
      });
    });

    describe('Error Handling', () => {
      it('should handle registration errors during batch registration', () => {
        let callCount = 0;
        mockGameSettings.register = vi.fn(() => {
          callCount++;
          if (callCount === 2) {
            throw new Error('Second registration failed');
          }
        });

        const settings = [
          { key: 'setting1', config: { name: 'Setting 1' } },
          { key: 'setting2', config: { name: 'Setting 2' } },
          { key: 'setting3', config: { name: 'Setting 3' } }
        ];

        const result = registrar.register(settings);

        expect(result.success).toBe(true);
        expect(result.counter).toBe(3);
        expect(result.successCounter).toBe(2);
        expect(result.errorMessages).toHaveLength(1);
        expect(result.errorMessages[0]).toContain('Failed to register setting2: Second registration failed');
      });

      it('should handle game not ready during batch registration', () => {
        delete globalThis.game;

        const settings = [
          { key: 'setting1', config: { name: 'Setting 1' } },
          { key: 'setting2', config: { name: 'Setting 2' } }
        ];

        const result = registrar.register(settings);

        expect(result.success).toBe(false);
        expect(result.counter).toBe(2);
        expect(result.successCounter).toBe(0);
        expect(result.errorMessages).toHaveLength(2);
        expect(result.errorMessages[0]).toContain('Game settings not ready');
        expect(result.errorMessages[1]).toContain('Game settings not ready');
      });
    });

    describe('Constants Integration', () => {
      it('should work with typical module settings structure', () => {
        const moduleSettings = {
          enabled: {
            key: 'enabled',
            config: {
              name: 'Enable Module',
              hint: 'Enables the module functionality',
              scope: 'world',
              config: true,
              type: Boolean,
              default: true
            }
          },
          displayMode: {
            key: 'displayMode',
            config: {
              name: 'Display Mode',
              hint: 'How to display information',
              scope: 'client',
              config: true,
              type: String,
              choices: { tooltip: 'Tooltip', panel: 'Side Panel' },
              default: 'tooltip'
            }
          },
          debug: {
            key: 'debug',
            config: {
              name: 'Debug Mode',
              hint: 'Enable debug logging',
              scope: 'world',
              config: false,
              type: Boolean,
              default: false
            }
          }
        };

        const result = registrar.register(moduleSettings);

        expect(result.success).toBe(true);
        expect(result.counter).toBe(3);
        expect(result.successCounter).toBe(3);
        expect(result.errorMessages).toHaveLength(0);

        expect(mockGameSettings.get('test-module', 'enabled')).toBe(true);
        expect(mockGameSettings.get('test-module', 'displayMode')).toBe('tooltip');
        expect(mockGameSettings.get('test-module', 'debug')).toBe(false);
      });
    });

    describe('Alternative Constants Configuration', () => {
      it('should work with different namespace configurations', () => {
        // Test with different module ID
        const altConfig = { manifest: { id: 'different-module' } };
        const altRegistrar = new SettingsRegistrar(altConfig, mockContext, mockUtils);

        const settings = [
          { key: 'altSetting', config: { name: 'Alt Setting', default: 'altValue' } }
        ];

        const result = altRegistrar.register(settings);

        expect(result.success).toBe(true);
        expect(mockGameSettings.get('different-module', 'altSetting')).toBe('altValue');
      });

      it('should work with custom namespace override', () => {
        const customRegistrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils, 'override-namespace');

        const settings = [
          { key: 'overrideSetting', config: { name: 'Override Setting', default: 'overrideValue' } }
        ];

        const result = customRegistrar.register(settings);

        expect(result.success).toBe(true);
        expect(mockGameSettings.get('override-namespace', 'overrideSetting')).toBe('overrideValue');
      });
    });

    describe('Real-world Scenarios', () => {
      it('should handle Over My Head module settings registration', () => {
        const overMyHeadSettings = {
          enabled: {
            key: 'enabled',
            config: {
              name: 'Enable Over My Head',
              hint: 'Enables the Over My Head module functionality',
              scope: 'world',
              config: true,
              type: Boolean,
              default: true
            }
          },
          occlusionMode: {
            key: 'occlusionMode',
            config: {
              name: 'Occlusion Mode',
              hint: 'How to handle token occlusion',
              scope: 'world',
              config: true,
              type: String,
              choices: {
                none: 'No Occlusion',
                partial: 'Partial Occlusion',
                full: 'Full Occlusion'
              },
              default: 'partial'
            }
          },
          debugLevel: {
            key: 'debugLevel',
            config: {
              name: 'Debug Level',
              hint: 'Level of debug information to display',
              scope: 'client',
              config: false,
              type: Number,
              range: { min: 0, max: 3, step: 1 },
              default: 0
            }
          }
        };

        const result = registrar.register(overMyHeadSettings);

        expect(result.success).toBe(true);
        expect(result.counter).toBe(3);
        expect(result.successCounter).toBe(3);
        expect(result.message).toBe('Registered 3 out of 3 settings successfully.');

        // Verify all settings are registered correctly
        expect(mockGameSettings.get('test-module', 'enabled')).toBe(true);
        expect(mockGameSettings.get('test-module', 'occlusionMode')).toBe('partial');
        expect(mockGameSettings.get('test-module', 'debugLevel')).toBe(0);
      });

      it('should handle progressive settings registration', () => {
        // Register core settings first
        const coreSettings = [
          { key: 'enabled', config: { name: 'Enable Module', default: true } }
        ];

        const coreResult = registrar.register(coreSettings);
        expect(coreResult.success).toBe(true);
        expect(coreResult.successCounter).toBe(1);

        // Register additional settings
        const additionalSettings = [
          { key: 'advanced', config: { name: 'Advanced Mode', default: false } },
          { key: 'theme', config: { name: 'Theme', default: 'default' } }
        ];

        const additionalResult = registrar.register(additionalSettings);
        expect(additionalResult.success).toBe(true);
        expect(additionalResult.successCounter).toBe(2);

        // Verify all settings exist
        expect(mockGameSettings.get('test-module', 'enabled')).toBe(true);
        expect(mockGameSettings.get('test-module', 'advanced')).toBe(false);
        expect(mockGameSettings.get('test-module', 'theme')).toBe('default');
      });

      it('should handle large batch registration efficiently', () => {
        const largeBatch = [];
        for (let i = 0; i < 50; i++) {
          largeBatch.push({
            key: `setting${i}`,
            config: {
              name: `Setting ${i}`,
              default: `value${i}`
            }
          });
        }

        const result = registrar.register(largeBatch);

        expect(result.success).toBe(true);
        expect(result.counter).toBe(50);
        expect(result.successCounter).toBe(50);
        expect(result.errorMessages).toHaveLength(0);

        // Spot check a few settings
        expect(mockGameSettings.get('test-module', 'setting0')).toBe('value0');
        expect(mockGameSettings.get('test-module', 'setting25')).toBe('value25');
        expect(mockGameSettings.get('test-module', 'setting49')).toBe('value49');
      });
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils);
    });

    it('should integrate with Handler base class', () => {
      expect(registrar.config).toBe(mockConfig);
      expect(registrar.context).toBe(mockContext);
      expect(registrar.utils).toBe(mockUtils);
    });

    it('should handle complete settings lifecycle', () => {
      // Initial registration
      const settings = [
        { key: 'lifecycleSetting', config: { name: 'Lifecycle Setting', default: 'initial' } }
      ];

      const registerResult = registrar.register(settings);
      expect(registerResult.success).toBe(true);
      expect(mockGameSettings.get('test-module', 'lifecycleSetting')).toBe('initial');

      // Re-registration should work (overwrite)
      const updatedSettings = [
        { key: 'lifecycleSetting', config: { name: 'Updated Lifecycle Setting', default: 'updated' } }
      ];

      const updateResult = registrar.register(updatedSettings);
      expect(updateResult.success).toBe(true);
      expect(mockGameSettings.get('test-module', 'lifecycleSetting')).toBe('updated');
    });

    it('should work with various input formats', () => {
      // Array format
      const arrayResult = registrar.register([
        { key: 'arraySetting', config: { default: 'array' } }
      ]);
      expect(arrayResult.success).toBe(true);

      // Object format
      const objectResult = registrar.register({
        objectSetting: { key: 'objectSetting', config: { default: 'object' } }
      });
      expect(objectResult.success).toBe(true);

      expect(mockGameSettings.get('test-module', 'arraySetting')).toBe('array');
      expect(mockGameSettings.get('test-module', 'objectSetting')).toBe('object');
    });
  });

  describe('Inheritance Tests', () => {
    it('should inherit from Handler correctly', () => {
      registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils);

      // Check that the constructor was called with proper parameters
      expect(registrar.config).toBe(mockConfig);
      expect(registrar.context).toBe(mockContext);
      expect(registrar.utils).toBe(mockUtils);
    });

    it('should use inherited properties', () => {
      registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils);

      expect(registrar.config).toBe(mockConfig);
      expect(registrar.context).toBe(mockContext);
      expect(registrar.utils).toBe(mockUtils);
    });

    it('should extend Handler functionality', () => {
      registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils);

      // Should have Handler properties
      expect(registrar.config).toBeDefined();
      expect(registrar.context).toBeDefined();
      expect(registrar.utils).toBeDefined();

      // Should have SettingsRegistrar-specific functionality
      expect(registrar.namespace).toBeDefined();
      expect(typeof registrar.registerSetting).toBe('function');
      expect(typeof registrar.register).toBe('function');
    });
  });

  describe('Flag conditional registration', () => {
    beforeEach(() => {
      registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils);
      FlagEvaluator.shouldShow = vi.fn();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should register settings when flags allow showing', () => {
      FlagEvaluator.shouldShow.mockReturnValue(true);

      const setting = {
        key: 'testSetting',
        showOnlyIfFlag: 'manifest.debugMode',
        dontShowIfFlag: null,
        config: { name: 'Test', default: 'test' }
      };

      const result = registrar.registerSetting(setting);

      expect(FlagEvaluator.shouldShow).toHaveBeenCalledWith(
        'manifest.debugMode',
        null,
        mockConfig,
        undefined
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('registered successfully');
    });

    it('should not register settings when flags prevent showing', () => {
      FlagEvaluator.shouldShow.mockReturnValue(false);

      const setting = {
        key: 'hiddenSetting',
        showOnlyIfFlag: 'manifest.dev',
        dontShowIfFlag: null,
        config: { name: 'Hidden', default: 'hidden' }
      };

      const result = registrar.registerSetting(setting);

      expect(FlagEvaluator.shouldShow).toHaveBeenCalledWith(
        'manifest.dev',
        null,
        mockConfig,
        undefined
      );
      expect(result.success).toBe(false);
      expect(result.message).toContain('not registered due to flag conditions');
    });

    it('should handle complex flag conditions', () => {
      FlagEvaluator.shouldShow.mockReturnValue(true);

      const setting = {
        key: 'complexSetting',
        showOnlyIfFlag: { or: ['manifest.debugMode', 'manifest.dev'] },
        dontShowIfFlag: { and: ['someFlag', 'anotherFlag'] },
        config: { name: 'Complex', default: 'complex' }
      };

      const result = registrar.registerSetting(setting);

      expect(FlagEvaluator.shouldShow).toHaveBeenCalledWith(
        { or: ['manifest.debugMode', 'manifest.dev'] },
        { and: ['someFlag', 'anotherFlag'] },
        mockConfig,
        undefined
      );
      expect(result.success).toBe(true);
    });

    it('should register settings without flags normally', () => {
      FlagEvaluator.shouldShow.mockReturnValue(true);

      const setting = {
        key: 'normalSetting',
        showOnlyIfFlag: null,
        dontShowIfFlag: null,
        config: { name: 'Normal', default: 'normal' }
      };

      const result = registrar.registerSetting(setting);

      expect(FlagEvaluator.shouldShow).toHaveBeenCalledWith(
        null,
        null,
        mockConfig,
        undefined
      );
      expect(result.success).toBe(true);
    });

    it('should handle mixed settings with different flag results in batch registration', () => {
      FlagEvaluator.shouldShow
        .mockReturnValueOnce(true)  // First setting should register
        .mockReturnValueOnce(false) // Second setting should not register
        .mockReturnValueOnce(true); // Third setting should register

      const settings = [
        {
          key: 'visibleSetting',
          showOnlyIfFlag: 'manifest.debugMode',
          config: { name: 'Visible', default: 'visible' }
        },
        {
          key: 'hiddenSetting',
          showOnlyIfFlag: 'manifest.dev',
          config: { name: 'Hidden', default: 'hidden' }
        },
        {
          key: 'anotherVisibleSetting',
          showOnlyIfFlag: null,
          config: { name: 'Another Visible', default: 'anotherVisible' }
        }
      ];

      const result = registrar.register(settings);

      expect(result.counter).toBe(3);
      expect(result.successCounter).toBe(2);
      expect(result.errorMessages).toHaveLength(1);
      expect(result.errorMessages[0]).toContain('not registered due to flag conditions');

      // Verify only the allowed settings were registered
      expect(mockGameSettings.get('test-module', 'visibleSetting')).toBe('visible');
      expect(mockGameSettings.get('test-module', 'anotherVisibleSetting')).toBe('anotherVisible');
      expect(mockGameSettings.get('test-module', 'hiddenSetting')).toBeUndefined();
    });

    it('should handle flag evaluation with real context structure', () => {
      const contextWithManifest = {
        manifest: {
          debugMode: true,
          dev: false,
          id: 'test-module'
        }
      };

      const registrarWithContext = new SettingsRegistrar(contextWithManifest, mockContext, mockUtils);
      FlagEvaluator.shouldShow.mockReturnValue(true);

      const setting = {
        key: 'debugSetting',
        showOnlyIfFlag: { or: ['manifest.debugMode', 'manifest.dev'] },
        dontShowIfFlag: null,
        config: { name: 'Debug Setting', default: false }
      };

      const result = registrarWithContext.registerSetting(setting);

      expect(FlagEvaluator.shouldShow).toHaveBeenCalledWith(
        { or: ['manifest.debugMode', 'manifest.dev'] },
        null,
        contextWithManifest,
        undefined
      );
      expect(result.success).toBe(true);
    });
  });

  describe('Enhanced Failure Reporting', () => {
    beforeEach(() => {
      registrar = new SettingsRegistrar(mockConfig, mockContext, mockUtils);
      FlagEvaluator.shouldShow = vi.fn();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should differentiate between planned exclusions and unplanned failures', () => {
      // Set up mixed scenario: one setting hidden by flags, one with validation error
      FlagEvaluator.shouldShow = vi.fn()
        .mockReturnValueOnce(false) // first setting hidden by flags (planned)
        .mockReturnValueOnce(true); // second setting passes flags but fails validation (unplanned)

      const settings = [
        {
          key: 'hiddenSetting',
          showOnlyIfFlag: 'manifest.dev',
          config: { name: 'Hidden Setting', default: false }
        },
        {
          key: 'invalidSetting',
          // missing config causes validation failure
        }
      ];

      const result = registrar.register(settings);

      expect(result.success).toBe(false);
      expect(result.processed).toBe(2);
      expect(result.successful).toBe(0);
      expect(result.failed).toEqual(['hiddenSetting', 'invalidSetting']);
      expect(result.plannedExcluded).toEqual(['hiddenSetting']);
      expect(result.unplannedFailed).toEqual(['invalidSetting']);
      expect(result.registered).toEqual([]);
    });

    it('should handle planned-only exclusions', () => {
      FlagEvaluator.shouldShow = vi.fn().mockReturnValue(false);

      const settings = [
        {
          key: 'hiddenSetting1',
          showOnlyIfFlag: 'manifest.dev',
          config: { name: 'Hidden Setting 1', default: false }
        },
        {
          key: 'hiddenSetting2',
          dontShowIfFlag: 'manifest.production',
          config: { name: 'Hidden Setting 2', default: true }
        }
      ];

      const result = registrar.register(settings);

      expect(result.success).toBe(false);
      expect(result.processed).toBe(2);
      expect(result.successful).toBe(0);
      expect(result.failed).toEqual(['hiddenSetting1', 'hiddenSetting2']);
      expect(result.plannedExcluded).toEqual(['hiddenSetting1', 'hiddenSetting2']);
      expect(result.unplannedFailed).toEqual([]);
      expect(result.registered).toEqual([]);
    });

    it('should handle all-success cases', () => {
      FlagEvaluator.shouldShow = vi.fn().mockReturnValue(true);

      const settings = [
        {
          key: 'setting1',
          config: { name: 'Setting 1', default: 'value1' }
        },
        {
          key: 'setting2',
          config: { name: 'Setting 2', default: 'value2' }
        }
      ];

      const result = registrar.register(settings);

      expect(result.success).toBe(true);
      expect(result.processed).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toEqual([]);
      expect(result.plannedExcluded).toEqual([]);
      expect(result.unplannedFailed).toEqual([]);
      expect(result.registered).toEqual(['setting1', 'setting2']);
    });

    it('should handle unplanned-only failures', () => {
      FlagEvaluator.shouldShow = vi.fn().mockReturnValue(true);

      const settings = [
        {
          key: 'invalidSetting1'
          // missing config
        },
        {
          // missing key
          config: { name: 'Invalid Setting 2', default: 'value' }
        }
      ];

      const result = registrar.register(settings);

      expect(result.success).toBe(false);
      expect(result.processed).toBe(2);
      expect(result.successful).toBe(0);
      expect(result.failed).toEqual(['invalidSetting1', 'Unknown Setting']);
      expect(result.plannedExcluded).toEqual([]);
      expect(result.unplannedFailed).toEqual(['invalidSetting1', 'Unknown Setting']);
      expect(result.registered).toEqual([]);
    });

    it('should handle mixed scenarios with both success and failures', () => {
      FlagEvaluator.shouldShow = vi.fn()
        .mockReturnValueOnce(true)  // setting1: success
        .mockReturnValueOnce(false) // setting2: planned exclusion
        .mockReturnValueOnce(true); // setting3: unplanned failure

      const settings = [
        {
          key: 'setting1',
          config: { name: 'Setting 1', default: 'value1' }
        },
        {
          key: 'setting2',
          showOnlyIfFlag: 'manifest.dev',
          config: { name: 'Setting 2', default: 'value2' }
        },
        {
          key: 'setting3'
          // missing config causes unplanned failure
        }
      ];

      const result = registrar.register(settings);

      expect(result.success).toBe(true); // Has at least one success
      expect(result.processed).toBe(3);
      expect(result.successful).toBe(1);
      expect(result.failed).toEqual(['setting2', 'setting3']);
      expect(result.plannedExcluded).toEqual(['setting2']);
      expect(result.unplannedFailed).toEqual(['setting3']);
      expect(result.registered).toEqual(['setting1']);
    });
  });
});
