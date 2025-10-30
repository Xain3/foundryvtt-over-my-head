/**
 * @file static.unit.test.mjs
 * @description Unit tests for the StaticUtils centralized entrypoint class
 * @path tests/unit/utils/static.unit.test.mjs
 */

import { describe, expect, it, vi } from 'vitest';

import StaticUtils, {
  type ConfigResult,
  type ConfigSource,
  type ConfigSingleton,
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
});
