/**
 * @file static.unit.test.ts
 * @description Unit tests for the StaticUtils centralized entrypoint class
 * @path tests/unit/utils/static.unit.test.ts
 */

import { describe, expect, it, vi } from 'vitest';

import StaticUtils, {
  type ConfigResult,
  type ConfigSource,
  type ConfigSingleton,
  type FormatOptions,
  type HookFormatterConfig,
  type PlaceholderValues,
} from '#/utils/static.ts';

describe('StaticUtils', () => {
  describe('StaticUtils class structure', () => {
    it('should export StaticUtils as default', () => {
      expect(StaticUtils).toBeDefined();
      expect(typeof StaticUtils).toBe('function');
    });

    it('should have DevModeParser property', () => {
      expect(StaticUtils.DevModeParser).toBeDefined();
      expect(typeof StaticUtils.DevModeParser).toBe('object');
    });

    it('should prevent instantiation', () => {
      // @ts-expect-error Testing instantiation prevention
      expect(() => new StaticUtils()).toThrow(
        'StaticUtils is a static utility class and cannot be instantiated'
      );
    });
  });

  describe('DevModeParser delegation', () => {
    const mockConfig: ConfigSingleton = {
      prefix: 'TEST',
      get: vi.fn((key: string, source: 'env' | 'module' | 'setting') => {
        if (source === 'env') {
          if (key === 'TEST_DEV_MODE') return 'true';
          if (key === 'TEST_DEBUG_MODE') return 'false';
        }
        if (source === 'module') {
          if (key === 'devMode') return false;
          if (key === 'debugMode') return true;
        }
        if (source === 'setting') {
          if (key === 'devMode') return undefined;
          if (key === 'debugMode') return undefined;
        }
        return undefined;
      }),
    };

    it('should delegate isDevMode calls', () => {
      const result = StaticUtils.DevModeParser.isDevMode(
        'true',
        false,
        undefined
      );
      expect(result).toBe(true);

      const result2 = StaticUtils.DevModeParser.isDevMode(
        'false',
        false,
        false
      );
      expect(result2).toBe(false);
    });

    it('should delegate isDebugMode calls', () => {
      const result = StaticUtils.DevModeParser.isDebugMode(
        'true',
        false,
        undefined
      );
      expect(result).toBe(true);

      const result2 = StaticUtils.DevModeParser.isDebugMode(
        'false',
        false,
        false
      );
      expect(result2).toBe(false);
    });

    it('should delegate fromConfig calls', () => {
      const result: ConfigResult =
        StaticUtils.DevModeParser.fromConfig(mockConfig);
      expect(result).toEqual({
        devMode: true, // from env
        debugMode: true, // from module
      });
    });

    it('should delegate fromConfig with prefix override', () => {
      const customConfig: ConfigSingleton = {
        prefix: 'TEST',
        get: vi.fn((key: string, source: 'env' | 'module' | 'setting') => {
          if (source === 'env') {
            if (key === 'CUSTOM_DEV_MODE') return 'true'; // CUSTOM prefix
            if (key === 'CUSTOM_DEBUG_MODE') return 'false';
          }
          if (source === 'module') {
            if (key === 'devMode') return false;
            if (key === 'debugMode') return true;
          }
          if (source === 'setting') {
            if (key === 'devMode') return undefined;
            if (key === 'debugMode') return undefined;
          }
          return undefined;
        }),
      };

      const result: ConfigResult = StaticUtils.DevModeParser.fromConfig(
        customConfig,
        'CUSTOM'
      );
      expect(result).toEqual({
        devMode: true, // from env (with CUSTOM prefix)
        debugMode: true, // from module
      });
    });

    it('should delegate fromConfig with hierarchy override', () => {
      const result: ConfigResult = StaticUtils.DevModeParser.fromConfig(
        mockConfig,
        undefined,
        { hierarchy: ['setting', 'module', 'env'] }
      );
      expect(result).toEqual({
        devMode: true, // setting is undefined, module is false, env is true (highest priority in this order)
        debugMode: true, // setting is undefined, module is true
      });
    });
  });

  describe('TypeScript types', () => {
    it('should export ConfigSource type', () => {
      const source: ConfigSource = 'test';
      expect(source).toBe('test');
    });

    it('should export ConfigResult type', () => {
      const result: ConfigResult = { devMode: true, debugMode: false };
      expect(result.devMode).toBe(true);
      expect(result.debugMode).toBe(false);
    });

    it('should export ConfigSingleton type', () => {
      const config: ConfigSingleton = {
        get: (key: string, source: 'env' | 'module' | 'setting') => undefined,
      };
      expect(typeof config.get).toBe('function');
    });
  });

  describe('formatString utilities (P1)', () => {
    it('should have formatString property', () => {
      expect(StaticUtils.formatString).toBeDefined();
      expect(typeof StaticUtils.formatString).toBe('object');
    });

    it('should have format method on formatString', () => {
      expect(StaticUtils.formatString.format).toBeDefined();
      expect(typeof StaticUtils.formatString.format).toBe('function');
    });

    it('should format string with prefix only', () => {
      const result = StaticUtils.formatString.format('world', {
        prefix: 'hello-',
      });
      expect(result).toBe('hello-world');
    });

    it('should format string with suffix only', () => {
      const result = StaticUtils.formatString.format('world', {
        suffix: '!',
      });
      expect(result).toBe('world!');
    });

    it('should format string with both prefix and suffix', () => {
      const result = StaticUtils.formatString.format('world', {
        prefix: 'hello-',
        suffix: '!',
      });
      expect(result).toBe('hello-world!');
    });

    it('should return base string when no options provided', () => {
      const result = StaticUtils.formatString.format('world');
      expect(result).toBe('world');
    });

    it('should handle empty prefix/suffix gracefully', () => {
      const result = StaticUtils.formatString.format('world', {
        prefix: '',
        suffix: '',
      });
      expect(result).toBe('world');
    });

    it('should export FormatOptions type', () => {
      const options: FormatOptions = { prefix: 'pre-', suffix: '-suf' };
      expect(options.prefix).toBe('pre-');
      expect(options.suffix).toBe('-suf');
    });
  });

  describe('formatHookName utilities (P2/P3)', () => {
    it('should have formatHookName property', () => {
      expect(StaticUtils.formatHookName).toBeDefined();
      expect(typeof StaticUtils.formatHookName).toBe('object');
    });

    it('should have format method on formatHookName', () => {
      expect(StaticUtils.formatHookName.format).toBeDefined();
      expect(typeof StaticUtils.formatHookName.format).toBe('function');
    });

    it('should format simple hook name (P2)', () => {
      const mockConfig: HookFormatterConfig = {
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

      const result = StaticUtils.formatHookName.format(
        'settingsReady',
        mockConfig
      );
      expect(result).toBe('OMH.SettingsReady');
    });

    it('should format parameterized hook name (P3)', () => {
      const mockConfig: HookFormatterConfig = {
        hooks: {
          settingsReady: 'SettingsReady',
        },
        hookPatterns: {
          module: '{moduleReference}{separator}{hook}',
          setting: '{moduleReference}{separator}setting{separator}{settingKey}',
        },
        hookPatternSeparator: '.',
      };

      const result = StaticUtils.formatHookName.format(
        'setting',
        { settingKey: 'debugMode' },
        mockConfig
      );
      expect(result).toBe('OMH.setting.debugMode');
    });

    it('should throw error for missing hook key (P2)', () => {
      const mockConfig: HookFormatterConfig = {
        hooks: {
          settingsReady: 'SettingsReady',
        },
        hookPatterns: {
          module: '{moduleReference}{separator}{hook}',
        },
        hookPatternSeparator: '.',
      };

      expect(() => {
        StaticUtils.formatHookName.format('unknownHook', mockConfig);
      }).toThrow('[OMH] Hook key "unknownHook" not found in config');
    });

    it('should throw error for missing required parameter (P3)', () => {
      const mockConfig: HookFormatterConfig = {
        hooks: {},
        hookPatterns: {
          setting: '{moduleReference}{separator}setting{separator}{settingKey}',
        },
        hookPatternSeparator: '.',
      };

      expect(() => {
        StaticUtils.formatHookName.format('setting', {}, mockConfig);
      }).toThrow('[OMH] Missing required parameter "settingKey"');
    });

    it('should export HookFormatterConfig type', () => {
      const config: HookFormatterConfig = {
        hooks: { test: 'Test' },
        hookPatterns: { module: '{moduleReference}' },
        hookPatternSeparator: '.',
      };
      expect(config.hookPatternSeparator).toBe('.');
    });

    it('should export PlaceholderValues type', () => {
      const values: PlaceholderValues = {
        moduleReference: 'OMH',
        separator: '.',
        hook: 'Test',
      };
      expect(values.moduleReference).toBe('OMH');
    });
  });
});
