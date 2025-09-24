/**
 * @file settingsChecker.unit.test.mjs
 * @description Unit tests for the SettingsChecker class
 * @path src/handlers/settingsHelpers/settingsChecker.unit.test.mjs
 */

import SettingsChecker from './settingsChecker.mjs';

describe('SettingsChecker', () => {
  describe('checkSetting', () => {
    const REQUIRED_KEYS = ['key', 'config.type'];
    
    describe('input validation', () => {
      it('should return false for null setting', () => {
        const result = SettingsChecker.check(null, REQUIRED_KEYS);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid setting format');
      });

      it('should return false for undefined setting', () => {
        const result = SettingsChecker.check(undefined, REQUIRED_KEYS);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid setting format');
      });

      it('should return false for string setting', () => {
        const result = SettingsChecker.check('invalid', REQUIRED_KEYS);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid setting format');
      });

      it('should return false for number setting', () => {
        const result = SettingsChecker.check(123, REQUIRED_KEYS);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid setting format');
      });

      it('should return false for array setting', () => {
        const result = SettingsChecker.check([], REQUIRED_KEYS);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid setting format');
      });

      it('should return false for boolean setting', () => {
        const result = SettingsChecker.check(true, REQUIRED_KEYS);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid setting format');
      });
    });

    describe('successful cases', () => {
      it('should validate setting with all required simple keys', () => {
        const setting = {
          key: 'testKey',
          config: {
            type: 'string'
          }
        };
        
        const result = SettingsChecker.check(setting, REQUIRED_KEYS);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });

      it('should validate setting with extra properties', () => {
        const setting = {
          key: 'testKey',
          config: {
            type: 'string',
            hint: 'Test hint'
          },
          extraProperty: 'extra'
        };
        
        const result = SettingsChecker.check(setting, REQUIRED_KEYS);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });

      it('should validate setting with empty required keys array', () => {
        const setting = { key: 'testKey' };
        
        const result = SettingsChecker.check(setting, []);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });

      it('should validate setting with only simple keys', () => {
        const setting = {
          key: 'testKey',
          name: 'Test Name'
        };
        
        const result = SettingsChecker.check(setting, ['key', 'name']);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });

      it('should validate setting with deeply nested properties', () => {
        const setting = {
          key: 'testKey',
          config: {
            type: 'string',
            nested: {
              deep: {
                value: 'test'
              }
            }
          }
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.nested.deep.value']);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });
    });

    describe('error cases and handling', () => {
      it('should return false for missing simple key', () => {
        const setting = {
          config: {
            type: 'string'
          }
        };
        
        const result = SettingsChecker.check(setting, REQUIRED_KEYS);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required settings: key');
      });

      it('should return false for missing nested key', () => {
        const setting = {
          key: 'testKey',
          config: {}
        };
        
        const result = SettingsChecker.check(setting, REQUIRED_KEYS);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required settings: config.type');
      });

      it('should return false for completely missing nested object', () => {
        const setting = {
          key: 'testKey'
        };
        
        const result = SettingsChecker.check(setting, REQUIRED_KEYS);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required settings: config.type');
      });

      it('should return false for multiple missing keys', () => {
        const setting = {};
        
        const result = SettingsChecker.check(setting, REQUIRED_KEYS);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required settings: key, config.type');
      });

      it('should return false when nested property exists but is null', () => {
        const setting = {
          key: 'testKey',
          config: {
            type: null
          }
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.type.invalid']);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required settings: config.type.invalid');
      });

      it('should return false when nested property exists but is undefined', () => {
        const setting = {
          key: 'testKey',
          config: {
            type: undefined
          }
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.type.invalid']);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required settings: config.type.invalid');
      });
    });

    describe('edge cases', () => {
      it('should handle setting with null nested property', () => {
        const setting = {
          key: 'testKey',
          config: null
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.type']);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required settings: config.type');
      });

      it('should handle setting with undefined nested property', () => {
        const setting = {
          key: 'testKey',
          config: undefined
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.type']);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required settings: config.type');
      });

      it('should handle setting with non-object nested property', () => {
        const setting = {
          key: 'testKey',
          config: 'string'
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.type']);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required settings: config.type');
      });

      it('should handle setting with array as nested property', () => {
        const setting = {
          key: 'testKey',
          config: ['array', 'value']
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.type']);
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('Missing required settings: config.type');
      });

      it('should validate when nested property value is falsy but exists', () => {
        const setting = {
          key: 'testKey',
          config: {
            type: false
          }
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.type']);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });

      it('should validate when nested property value is empty string', () => {
        const setting = {
          key: 'testKey',
          config: {
            type: ''
          }
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.type']);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });

      it('should validate when nested property value is zero', () => {
        const setting = {
          key: 'testKey',
          config: {
            type: 0
          }
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.type']);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });
    });

    describe('constants integration', () => {
      it('should validate setting with constants-defined required keys', () => {
        const requiredKeys = ['key', 'config.type']; // From constants.yaml
        const setting = {
          key: 'useModule',
          config: {
            type: 'boolean'
          }
        };
        
        const result = SettingsChecker.check(setting, requiredKeys);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });

      it('should handle settings from constants settingsList structure', () => {
        const requiredKeys = ['key', 'config.type'];
        const setting = {
          key: 'useModule',
          config: {
            type: 'boolean',
            name: 'Use Module',
            hint: 'Enable or disable this module'
          }
        };
        
        const result = SettingsChecker.check(setting, requiredKeys);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });
    });

    describe('real-world scenarios', () => {
      it('should validate a complete Foundry VTT setting object', () => {
        const setting = {
          key: 'debugMode',
          config: {
            name: 'Debug Mode',
            hint: 'Enable debug logging for this module',
            type: 'boolean',
            default: false,
            scope: 'world',
            requiresReload: true
          }
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.type', 'config.name']);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });

      it('should validate setting with complex nested configuration', () => {
        const setting = {
          key: 'advancedConfig',
          config: {
            type: 'object',
            name: 'Advanced Configuration',
            default: {
              ui: {
                theme: 'dark',
                animations: true
              },
              performance: {
                cacheEnabled: true,
                maxItems: 100
              }
            }
          }
        };
        
        const result = SettingsChecker.check(setting, ['key', 'config.type', 'config.default.ui.theme']);
        
        expect(result.success).toBe(true);
        expect(result.message).toBe('Setting is valid');
      });
    });
  });
});
