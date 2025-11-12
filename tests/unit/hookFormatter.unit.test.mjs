/**
 * @file hookFormatter.unit.test.mjs
 * @description Unit tests for the hook formatter utility (P2/P3 - module-scoped and parameterized hook names)
 * @path tests/unit/hookFormatter.unit.test.mjs
 */

import { describe, it, expect } from 'vitest';
import { formatHookName } from '#/utils/hookFormatter.ts';

describe('hookFormatter (P2 - Module-Scoped Hook Names)', () => {
  // Mock config matching the structure in hooks.yaml
  const mockConfig = {
    hooks: {
      settingsReady: 'SettingsReady',
      contextReady: 'ContextReady',
    },
    hookPatterns: {
      module: '{moduleReference}{separator}{hook}',
      setting: '{moduleReference}{separator}setting{separator}{settingKey}',
    },
    hookPatternSeparator: '.',
  };

  describe('Simple hook name generation', () => {
    // T030: Test formatHookName('settingsReady')
    it('should format settingsReady hook to OMH.SettingsReady', () => {
      const result = formatHookName('settingsReady', mockConfig);
      expect(result).toBe('OMH.SettingsReady');
    });

    // T031: Test formatHookName('contextReady')
    it('should format contextReady hook to OMH.ContextReady', () => {
      const result = formatHookName('contextReady', mockConfig);
      expect(result).toBe('OMH.ContextReady');
    });

    // T032: Test error case when hook key not found
    it('should throw error with available hooks when hook key not found', () => {
      expect(() => {
        formatHookName('unknownHook', mockConfig);
      }).toThrow('[OMH] Hook key "unknownHook" not found in config');

      expect(() => {
        formatHookName('unknownHook', mockConfig);
      }).toThrow(/Available hooks:/);
    });
  });

  describe('Edge cases', () => {
    it('should throw error if config.hooks is missing', () => {
      const invalidConfig = {
        hookPatterns: mockConfig.hookPatterns,
        hookPatternSeparator: mockConfig.hookPatternSeparator,
      };

      expect(() => {
        formatHookName('settingsReady', invalidConfig);
      }).toThrow('[OMH] Invalid hook config');
    });

    it('should throw error if config.hookPatterns is missing', () => {
      const invalidConfig = {
        hooks: mockConfig.hooks,
        hookPatternSeparator: mockConfig.hookPatternSeparator,
      };

      expect(() => {
        formatHookName('settingsReady', invalidConfig);
      }).toThrow('[OMH] Invalid hook config');
    });

    it('should throw error if config.hookPatternSeparator is missing', () => {
      const invalidConfig = {
        hooks: mockConfig.hooks,
        hookPatterns: mockConfig.hookPatterns,
      };

      expect(() => {
        formatHookName('settingsReady', invalidConfig);
      }).toThrow('[OMH] Invalid hook config');
    });

    it('should handle custom separator in config', () => {
      const customConfig = {
        hooks: {
          settingsReady: 'SettingsReady',
        },
        hookPatterns: {
          module: '{moduleReference}:{hook}', // Using ':' instead of '.'
        },
        hookPatternSeparator: ':',
      };

      const result = formatHookName('settingsReady', customConfig);
      expect(result).toBe('OMH:SettingsReady');
    });
  });
});

describe('hookFormatter (P3 - Parameterized Hook Names)', () => {
  // Mock config with parameterized patterns
  const mockConfig = {
    hooks: {
      settingsReady: 'SettingsReady',
      contextReady: 'ContextReady',
    },
    hookPatterns: {
      module: '{moduleReference}{separator}{hook}',
      setting: '{moduleReference}{separator}setting{separator}{settingKey}',
    },
    hookPatternSeparator: '.',
  };

  describe('Parameterized hook name generation', () => {
    // T043: Test formatHookName('setting', { settingKey: 'debugMode' })
    it('should format parameterized setting hook with settingKey parameter', () => {
      const result = formatHookName(
        'setting',
        { settingKey: 'debugMode' },
        mockConfig
      );
      expect(result).toBe('OMH.setting.debugMode');
    });

    it('should format parameterized setting hook with different setting keys', () => {
      const result1 = formatHookName(
        'setting',
        { settingKey: 'enableFeature' },
        mockConfig
      );
      expect(result1).toBe('OMH.setting.enableFeature');

      const result2 = formatHookName(
        'setting',
        { settingKey: 'maxTokens' },
        mockConfig
      );
      expect(result2).toBe('OMH.setting.maxTokens');
    });

    // T044: Test missing required parameter error
    it('should throw error when required parameter is missing', () => {
      expect(() => {
        formatHookName('setting', {}, mockConfig);
      }).toThrow('[OMH] Missing required parameter');

      expect(() => {
        formatHookName('setting', {}, mockConfig);
      }).toThrow(/settingKey/);
    });

    // T045: Test extra unused parameters are ignored
    it('should ignore extra unused parameters in parameterized hooks', () => {
      const result = formatHookName(
        'setting',
        { settingKey: 'debugMode', extra: 'ignored', another: 'unused' },
        mockConfig
      );
      expect(result).toBe('OMH.setting.debugMode');
    });

    // T046: Test error when pattern key not found
    it('should throw error when pattern key is not found', () => {
      expect(() => {
        formatHookName('unknownPattern', { someParam: 'value' }, mockConfig);
      }).toThrow('[OMH] Pattern key "unknownPattern" not found in config');

      expect(() => {
        formatHookName('unknownPattern', { someParam: 'value' }, mockConfig);
      }).toThrow(/Available patterns:/);
    });
  });

  describe('P3 Edge cases', () => {
    it('should throw error with list of available patterns when pattern not found', () => {
      const error = expect(() => {
        formatHookName('invalid', { key: 'value' }, mockConfig);
      });

      error.toThrow('[OMH] Pattern key "invalid" not found in config');
    });

    it('should handle multiple parameter placeholders in a single pattern', () => {
      const configWithMultiParams = {
        hooks: {},
        hookPatterns: {
          module: '{moduleReference}{separator}{hook}',
          setting: '{moduleReference}{separator}setting{separator}{settingKey}',
          custom:
            '{moduleReference}{separator}custom{separator}{entityId}{separator}{action}',
        },
        hookPatternSeparator: '.',
      };

      const result = formatHookName(
        'custom',
        { entityId: 'abc123', action: 'update' },
        configWithMultiParams
      );
      expect(result).toBe('OMH.custom.abc123.update');
    });

    it('should validate all required parameters are present before substitution', () => {
      const configWithMultiParams = {
        hooks: {},
        hookPatterns: {
          custom:
            '{moduleReference}{separator}custom{separator}{entityId}{separator}{action}',
        },
        hookPatternSeparator: '.',
      };

      // Missing 'action' parameter
      expect(() => {
        formatHookName('custom', { entityId: 'abc123' }, configWithMultiParams);
      }).toThrow('[OMH] Missing required parameter');
    });
  });
});
