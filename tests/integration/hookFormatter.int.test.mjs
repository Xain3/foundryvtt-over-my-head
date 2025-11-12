/**
 * @file hookFormatter.int.test.mjs
 * @description Integration tests for the hook formatter utility with real config
 * @path tests/integration/hookFormatter.int.test.mjs
 */

import { describe, it, expect } from 'vitest';
import { config } from '#/config/config.ts';
import { formatHookName } from '#/utils/static/hookFormatter.ts';

describe('hookFormatter (Integration - Real Config)', () => {
  // T034: Integration test with actual config.constants.hooks values
  describe('Hook formatting with real config (P2)', () => {
    it('should format hooks using real config.constants.hooks', () => {
      // Verify config structure is accessible
      expect(config.constants.hooks).toBeDefined();
      expect(config.constants.hooks.hooks).toBeDefined();
      expect(config.constants.hooks.hookPatterns).toBeDefined();
      expect(config.constants.hooks.hookPatternSeparator).toBeDefined();
    });

    it('should format settingsReady hook from real config', () => {
      const result = formatHookName('settingsReady', config.constants.hooks);
      expect(result).toBe('OMH.SettingsReady');
    });

    it('should format contextReady hook from real config', () => {
      const result = formatHookName('contextReady', config.constants.hooks);
      expect(result).toBe('OMH.ContextReady');
    });

    it('should handle all defined hooks in real config', () => {
      const hooks = config.constants.hooks.hooks;
      for (const [hookKey] of Object.entries(hooks)) {
        // Should not throw
        const result = formatHookName(hookKey, config.constants.hooks);
        expect(result).toBeTruthy();
        expect(result).toContain('OMH');
      }
    });
  });

  // T047: Integration test for P3 with real config patterns
  describe('Parameterized hook formatting with real config (P3)', () => {
    it('should format parameterized setting hook using real config', () => {
      const result = formatHookName(
        'setting',
        { settingKey: 'debugMode' },
        config.constants.hooks
      );
      expect(result).toBe('OMH.setting.debugMode');
    });

    it('should format multiple parameterized hooks with different settings', () => {
      const result1 = formatHookName(
        'setting',
        { settingKey: 'enableFeature' },
        config.constants.hooks
      );
      expect(result1).toBe('OMH.setting.enableFeature');

      const result2 = formatHookName(
        'setting',
        { settingKey: 'maxTokens' },
        config.constants.hooks
      );
      expect(result2).toBe('OMH.setting.maxTokens');
    });

    it('should verify parameterized pattern exists in real config', () => {
      expect(config.constants.hooks.hookPatterns.setting).toBeDefined();
      expect(config.constants.hooks.hookPatterns.setting).toContain(
        '{settingKey}'
      );
    });
  });
});
