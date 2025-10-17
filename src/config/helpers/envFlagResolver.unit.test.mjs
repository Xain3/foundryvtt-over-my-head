/**
 * @file envFlagResolver.unit.test.mjs
 * @description Unit tests for EnvFlagResolver class
 * @path src/config/helpers/envFlagResolver.unit.test.mjs
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import EnvFlagResolver from './envFlagResolver.mjs';

describe('EnvFlagResolver', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clean up test-related env vars to prevent interference
    delete process.env.DEBUG_MODE;
    delete process.env.DEV;
    delete process.env.TEST_MODULE_DEBUG_MODE;
    delete process.env.TM_DEBUG_MODE;
    delete process.env.FOUNDRYVTT_OVER_MY_HEAD_DEBUG_MODE;
    delete process.env.OMH_DEBUG_MODE;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('resolveFlag', () => {
    it('should return default value when no environment variable is set', () => {
      const result = EnvFlagResolver.resolveFlag(
        'debugMode',
        'test-module',
        false
      );
      expect(result).toBe(false);
    });

    it('should resolve flag from full module ID pattern', () => {
      process.env.TEST_MODULE_DEBUG_MODE = 'true';
      const result = EnvFlagResolver.resolveFlag(
        'debugMode',
        'test-module',
        false
      );
      expect(result).toBe(true);
    });

    it('should resolve flag from short name pattern', () => {
      process.env.TM_DEBUG_MODE = 'true';
      const result = EnvFlagResolver.resolveFlag(
        'debugMode',
        'test-module',
        false
      );
      expect(result).toBe(true);
    });

    it('should resolve flag from simple flag name', () => {
      process.env.DEBUG_MODE = 'true';
      const result = EnvFlagResolver.resolveFlag(
        'debugMode',
        'test-module',
        false
      );
      expect(result).toBe(true);
    });

    it('should prioritize full module ID pattern over short name', () => {
      process.env.TEST_MODULE_DEBUG_MODE = 'true';
      process.env.TM_DEBUG_MODE = 'false';
      const result = EnvFlagResolver.resolveFlag(
        'debugMode',
        'test-module',
        false
      );
      expect(result).toBe(true);
    });

    it('should prioritize short name pattern over simple flag name', () => {
      process.env.TM_DEBUG_MODE = 'false';
      process.env.DEBUG_MODE = 'true';
      const result = EnvFlagResolver.resolveFlag(
        'debugMode',
        'test-module',
        true
      );
      expect(result).toBe(false);
    });

    it('should handle multi-part module IDs', () => {
      process.env.FOUNDRYVTT_OVER_MY_HEAD_DEBUG_MODE = 'true';
      const result = EnvFlagResolver.resolveFlag(
        'debugMode',
        'foundryvtt-over-my-head',
        false
      );
      expect(result).toBe(true);
    });

    it('should extract correct short name from multi-part module ID', () => {
      process.env.OMH_DEBUG_MODE = 'true';
      const result = EnvFlagResolver.resolveFlag(
        'debugMode',
        'foundryvtt-over-my-head',
        false
      );
      expect(result).toBe(true);
    });

    it('should parse boolean string "true"', () => {
      process.env.DEBUG_MODE = 'true';
      const result = EnvFlagResolver.resolveFlag('debugMode', 'test', false);
      expect(result).toBe(true);
    });

    it('should parse boolean string "false"', () => {
      process.env.DEBUG_MODE = 'false';
      const result = EnvFlagResolver.resolveFlag('debugMode', 'test', true);
      expect(result).toBe(false);
    });

    it('should coerce numeric string "1" to boolean true when default is boolean', () => {
      process.env.DEV = '1';
      const result = EnvFlagResolver.resolveFlag('dev', 'test-module', false);
      expect(result).toBe(true);
    });

    it('should coerce numeric string "0" to boolean false when default is boolean', () => {
      process.env.DEV = '0';
      const result = EnvFlagResolver.resolveFlag('dev', 'test-module', true);
      expect(result).toBe(false);
    });

    it('should parse boolean string case-insensitively', () => {
      process.env.DEBUG_MODE = 'TRUE';
      const result = EnvFlagResolver.resolveFlag('debugMode', 'test', false);
      expect(result).toBe(true);
    });

    it('should parse integer strings', () => {
      process.env.MAX_COUNT = '42';
      const result = EnvFlagResolver.resolveFlag('maxCount', 'test', 0);
      expect(result).toBe(42);
    });

    it('should parse negative numeric strings', () => {
      process.env.NEGATIVE_THRESHOLD = '-17';
      const result = EnvFlagResolver.resolveFlag(
        'negativeThreshold',
        'test',
        0
      );
      expect(result).toBe(-17);
    });

    it('should parse float strings', () => {
      process.env.THRESHOLD = '3.14';
      const result = EnvFlagResolver.resolveFlag('threshold', 'test', 0);
      expect(result).toBe(3.14);
    });

    it('should parse scientific notation strings', () => {
      process.env.MIN_VALUE = '6.022e-23';
      const result = EnvFlagResolver.resolveFlag('minValue', 'test', 0);
      expect(result).toBe(6.022e-23);
    });

    it('should parse JSON object strings', () => {
      process.env.CONFIG = '{"key":"value","count":5}';
      const result = EnvFlagResolver.resolveFlag('config', 'test', {});
      expect(result).toEqual({ key: 'value', count: 5 });
    });

    it('should parse JSON array strings', () => {
      process.env.ITEMS = '["a","b","c"]';
      const result = EnvFlagResolver.resolveFlag('items', 'test', []);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should return string for invalid JSON', () => {
      process.env.INVALID = '{invalid json}';
      const result = EnvFlagResolver.resolveFlag('invalid', 'test', 'default');
      expect(result).toBe('{invalid json}');
    });

    it('should handle kebab-case flag names', () => {
      process.env.DEBUG_MODE = 'true';
      const result = EnvFlagResolver.resolveFlag('debug-mode', 'test', false);
      expect(result).toBe(true);
    });

    it('should handle camelCase flag names', () => {
      process.env.DEBUG_MODE = 'true';
      const result = EnvFlagResolver.resolveFlag('debugMode', 'test', false);
      expect(result).toBe(true);
    });

    it('should return default for non-string default values', () => {
      const result = EnvFlagResolver.resolveFlag('missing', 'test', null);
      expect(result).toBe(null);
    });

    it('should return default for object default values', () => {
      const defaultObj = { a: 1 };
      const result = EnvFlagResolver.resolveFlag('missing', 'test', defaultObj);
      expect(result).toBe(defaultObj);
    });
  });

  describe('resolveFlags', () => {
    it('should resolve multiple flags at once', () => {
      process.env.DEBUG_MODE = 'true';
      process.env.DEV = 'false';

      const result = EnvFlagResolver.resolveFlags(
        ['debugMode', 'dev'],
        'test-module',
        { debugMode: false, dev: true }
      );

      expect(result).toEqual({
        debugMode: true,
        dev: false,
      });
    });

    it('should use defaults for missing flags', () => {
      process.env.DEBUG_MODE = 'true';

      const result = EnvFlagResolver.resolveFlags(
        ['debugMode', 'dev'],
        'test-module',
        { debugMode: false, dev: true }
      );

      expect(result).toEqual({
        debugMode: true,
        dev: true, // Falls back to default
      });
    });

    it('should handle empty flag list', () => {
      const result = EnvFlagResolver.resolveFlags([], 'test-module', {});
      expect(result).toEqual({});
    });

    it('should handle flags with no defaults', () => {
      process.env.FLAG_ONE = 'true';

      const result = EnvFlagResolver.resolveFlags(
        ['flagOne', 'flagTwo'],
        'test-module'
      );

      expect(result).toEqual({
        flagOne: true,
        flagTwo: undefined,
      });
    });

    it('should respect namespacing for each flag', () => {
      process.env.TEST_MODULE_DEBUG_MODE = 'true';
      process.env.DEV = 'false';

      const result = EnvFlagResolver.resolveFlags(
        ['debugMode', 'dev'],
        'test-module',
        { debugMode: false, dev: true }
      );

      expect(result).toEqual({
        debugMode: true,
        dev: false,
      });
    });

    it('should coerce numeric env overrides to booleans in bulk resolution', () => {
      process.env.DEBUG_MODE = '1';
      process.env.DEV = '0';

      const result = EnvFlagResolver.resolveFlags(
        ['debugMode', 'dev'],
        'test-module',
        { debugMode: false, dev: true }
      );

      expect(result).toEqual({
        debugMode: true,
        dev: false,
      });
    });
  });

  describe('hasEnvOverride', () => {
    it('should return false when no override exists', () => {
      const result = EnvFlagResolver.hasEnvOverride('debugMode', 'test-module');
      expect(result).toBe(false);
    });

    it('should return true when full module ID pattern exists', () => {
      process.env.TEST_MODULE_DEBUG_MODE = 'true';
      const result = EnvFlagResolver.hasEnvOverride('debugMode', 'test-module');
      expect(result).toBe(true);
    });

    it('should return true when short name pattern exists', () => {
      process.env.TM_DEBUG_MODE = 'true';
      const result = EnvFlagResolver.hasEnvOverride('debugMode', 'test-module');
      expect(result).toBe(true);
    });

    it('should return true when simple flag name exists', () => {
      process.env.DEBUG_MODE = 'true';
      const result = EnvFlagResolver.hasEnvOverride('debugMode', 'test-module');
      expect(result).toBe(true);
    });

    it('should return true even if value is false', () => {
      process.env.DEBUG_MODE = 'false';
      const result = EnvFlagResolver.hasEnvOverride('debugMode', 'test-module');
      expect(result).toBe(true);
    });

    it('should return true even if value is empty string', () => {
      process.env.DEBUG_MODE = '';
      const result = EnvFlagResolver.hasEnvOverride('debugMode', 'test-module');
      expect(result).toBe(true);
    });

    it('should handle multi-part module IDs', () => {
      process.env.FOUNDRYVTT_OVER_MY_HEAD_DEBUG_MODE = 'true';
      const result = EnvFlagResolver.hasEnvOverride(
        'debugMode',
        'foundryvtt-over-my-head'
      );
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string flag name', () => {
      const result = EnvFlagResolver.resolveFlag('', 'test', 'default');
      expect(result).toBe('default');
    });

    it('should handle empty string module ID', () => {
      const result = EnvFlagResolver.resolveFlag('flag', '', 'default');
      expect(result).toBe('default');
    });

    it('should handle null default value', () => {
      const result = EnvFlagResolver.resolveFlag('flag', 'test', null);
      expect(result).toBe(null);
    });

    it('should handle undefined default value', () => {
      const result = EnvFlagResolver.resolveFlag('flag', 'test', undefined);
      expect(result).toBe(undefined);
    });

    it('should handle numeric zero as env value', () => {
      process.env.COUNT = '0';
      const result = EnvFlagResolver.resolveFlag('count', 'test', 100);
      expect(result).toBe(0);
    });

    it('should handle empty string as env value', () => {
      process.env.VALUE = '';
      const result = EnvFlagResolver.resolveFlag('value', 'test', 'default');
      expect(result).toBe('');
    });

    it('should trim whitespace from env values', () => {
      process.env.FLAG = '  true  ';
      const result = EnvFlagResolver.resolveFlag('flag', 'test', false);
      expect(result).toBe(true);
    });

    it('should handle module IDs with underscores', () => {
      process.env.MY_TEST_MODULE_FLAG = 'true';
      const result = EnvFlagResolver.resolveFlag(
        'flag',
        'my_test_module',
        false
      );
      expect(result).toBe(true);
    });

    it('should handle flag names with multiple uppercase letters', () => {
      // Note: 'APIKey' converts to 'APIKEY' (consecutive capitals not separated)
      // This is expected behavior as the regex only inserts underscores between lowercase and uppercase
      process.env.APIKEY = 'secret';
      const result = EnvFlagResolver.resolveFlag('APIKey', 'test', '');
      expect(result).toBe('secret');
    });
  });
});
