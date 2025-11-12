/**
 * @file hookFormatter.int.test.mjs
 * @description Integration tests for the hook formatter utility with real config
 * @path tests/integration/hookFormatter.int.test.mjs
 */

import { describe, it, expect } from 'vitest';
import { config } from '#/config/config.ts';
import { formatHookName } from '#/utils/hookFormatter.ts';

describe('hookFormatter (Integration - Real Config)', () => {
  // T034: Integration test with actual config.constants.hooks values
  describe('Hook formatting with real config', () => {
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
});
