/**
 * @file hookFormatter.unit.test.mjs
 * @description Unit tests for the hook formatter utility (P2 - module-scoped hook names)
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
