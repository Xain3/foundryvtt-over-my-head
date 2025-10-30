import { performance } from 'node:perf_hooks';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DevModeParser, {
  __internal as internals,
  type ConfigSingleton,
  type ConfigSource,
} from '#/utils/static/devModeParser.ts';

const { _coerceToBoolean, _evaluateHierarchy, DEFAULT_HIERARCHY } = internals;

type MockSources = {
  prefix?: string;
  env?: Record<string, ConfigSource>;
  module?: Record<string, ConfigSource>;
  setting?: Record<string, ConfigSource>;
};

function createMockConfig({
  prefix,
  env = {},
  module = {},
  setting = {},
}: MockSources): ConfigSingleton {
  const envStore = { ...env };
  const moduleStore = { ...module };
  const settingStore = { ...setting };

  return {
    prefix,
    get(key, source) {
      switch (source) {
        case 'env':
          return envStore[key];
        case 'module':
          return moduleStore[key];
        case 'setting':
          return settingStore[key];
        default:
          return undefined;
      }
    },
  };
}

describe('DevModeParser', () => {
  describe('_coerceToBoolean', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
        // suppress warnings during tests unless explicitly asserted
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns false for undefined values', () => {
      warnSpy.mockClear();
      expect(_coerceToBoolean(undefined)).toBe(false);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns false for null values', () => {
      warnSpy.mockClear();
      expect(_coerceToBoolean(null)).toBe(false);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('preserves explicit boolean values', () => {
      warnSpy.mockClear();
      expect(_coerceToBoolean(true)).toBe(true);
      expect(_coerceToBoolean(false)).toBe(false);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('normalizes common true string values regardless of casing or whitespace', () => {
      warnSpy.mockClear();
      expect(_coerceToBoolean('true')).toBe(true);
      expect(_coerceToBoolean(' TRUE ')).toBe(true);
      expect(_coerceToBoolean('TrUe')).toBe(true);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('treats unrecognized string values as false', () => {
      warnSpy.mockClear();
      expect(_coerceToBoolean('false')).toBe(false);
      expect(_coerceToBoolean('')).toBe(false);
      expect(_coerceToBoolean('nope')).toBe(false);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('coerces additional truthy strings to true without warnings', () => {
      warnSpy.mockClear();
      expect(_coerceToBoolean('yes')).toBe(true);
      expect(_coerceToBoolean('1')).toBe(true);
      expect(_coerceToBoolean('on')).toBe(true);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('logs a warning and returns false for unsupported types', () => {
      warnSpy.mockClear();
      const result = _coerceToBoolean({} as unknown as ConfigSource);
      expect(result).toBe(false);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('coerces numeric values while emitting a warning', () => {
      warnSpy.mockClear();
      expect(_coerceToBoolean(1 as unknown as ConfigSource)).toBe(true);
      expect(_coerceToBoolean(0 as unknown as ConfigSource)).toBe(false);
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('_evaluateHierarchy', () => {
    it('exposes the default hierarchy order', () => {
      expect(DEFAULT_HIERARCHY).toEqual(['env', 'module', 'setting']);
    });

    it('prefers environment variable over other sources', () => {
      expect(_evaluateHierarchy(true, false, false)).toBe(true);
      expect(_evaluateHierarchy('true', false, true)).toBe(true);
    });

    it('falls back to module flag when environment variable is false', () => {
      expect(_evaluateHierarchy(false, true, false)).toBe(true);
      expect(_evaluateHierarchy(undefined, 'true', false)).toBe(true);
    });

    it('uses in-game setting last', () => {
      expect(_evaluateHierarchy(false, false, true)).toBe(true);
      expect(_evaluateHierarchy(undefined, undefined, 'true')).toBe(true);
    });

    it('returns false when all sources are false-like', () => {
      expect(_evaluateHierarchy(false, false, false)).toBe(false);
      expect(_evaluateHierarchy(undefined, undefined, undefined)).toBe(false);
    });

    it('supports custom hierarchy order when provided', () => {
      expect(
        _evaluateHierarchy(false, true, false, ['module', 'setting'])
      ).toBe(true);

      // Environment variable is ignored because it is not part of the order array.
      expect(
        _evaluateHierarchy(true, false, false, ['module', 'setting'])
      ).toBe(false);
    });

    it('falls back to default hierarchy if no valid keys are supplied', () => {
      const warnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);

      const result = _evaluateHierarchy('true', false, false, [
        'custom',
      ] as unknown as Array<'env'>);

      expect(result).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unsupported hierarchy key "custom"')
      );

      warnSpy.mockRestore();
    });
  });

  it('cannot be instantiated directly', () => {
    const construct = () =>
      new (DevModeParser as unknown as { new (): unknown })();
    expect(construct).toThrowError(/cannot be instantiated/i);
  });

  describe('isDevMode', () => {
    it('returns true when environment variable resolves to true even if others are false', () => {
      expect(DevModeParser.isDevMode(true, false, false)).toBe(true);
      expect(DevModeParser.isDevMode('true', 'false', undefined)).toBe(true);
    });

    it('returns true when module flag resolves to true and env is false-like', () => {
      expect(DevModeParser.isDevMode(false, true, false)).toBe(true);
      expect(DevModeParser.isDevMode('false', 'true', false)).toBe(true);
    });

    it('returns true when in-game setting resolves to true and higher levels are false-like', () => {
      expect(DevModeParser.isDevMode(false, false, true)).toBe(true);
      expect(DevModeParser.isDevMode(undefined, undefined, 'true')).toBe(true);
    });

    it('returns false when all inputs resolve to false', () => {
      expect(DevModeParser.isDevMode(false, false, false)).toBe(false);
      expect(DevModeParser.isDevMode(undefined, undefined, undefined)).toBe(
        false
      );
    });

    it('respects hierarchy priority when values conflict', () => {
      expect(DevModeParser.isDevMode(true, false, false)).toBe(true);
      expect(DevModeParser.isDevMode(false, true, false)).toBe(true);
      expect(DevModeParser.isDevMode(false, false, true)).toBe(true);
      expect(DevModeParser.isDevMode('false', 'false', 'true')).toBe(true);
      expect(DevModeParser.isDevMode('true', 'false', 'false')).toBe(true);
    });

    it('accepts custom hierarchy order through options', () => {
      expect(
        DevModeParser.isDevMode('true', false, false, {
          hierarchy: ['module', 'setting'],
        })
      ).toBe(false);

      expect(
        DevModeParser.isDevMode(false, true, 'true', {
          hierarchy: ['setting', 'module', 'env'],
        })
      ).toBe(true);
    });
  });

  describe('isDebugMode', () => {
    it('returns true when environment variable resolves to true regardless of others', () => {
      expect(DevModeParser.isDebugMode(true, false, false)).toBe(true);
      expect(DevModeParser.isDebugMode('true', 'false', undefined)).toBe(true);
    });

    it('returns true when module flag resolves to true and env is false-like', () => {
      expect(DevModeParser.isDebugMode(false, true, false)).toBe(true);
      expect(DevModeParser.isDebugMode('false', 'true', false)).toBe(true);
    });

    it('returns true when in-game setting resolves to true and higher levels are false-like', () => {
      expect(DevModeParser.isDebugMode(false, false, true)).toBe(true);
      expect(DevModeParser.isDebugMode(undefined, undefined, 'true')).toBe(
        true
      );
    });

    it('returns false when all inputs resolve to false', () => {
      expect(DevModeParser.isDebugMode(false, false, false)).toBe(false);
      expect(DevModeParser.isDebugMode(undefined, undefined, undefined)).toBe(
        false
      );
    });

    it('remains independent from dev mode status', () => {
      expect(DevModeParser.isDebugMode(false, false, false)).toBe(false);
      expect(DevModeParser.isDevMode(true, false, false)).toBe(true);
      expect(DevModeParser.isDebugMode(undefined, undefined, undefined)).toBe(
        false
      );
    });
  });

  describe('fromConfig', () => {
    it('extracts values from config and returns correct mode status', () => {
      const config = createMockConfig({
        prefix: 'OMH',
        env: {
          OMH_DEV_MODE: 'true',
          OMH_DEBUG_MODE: 'false',
        },
        module: {
          devMode: false,
          debugMode: true,
        },
        setting: {
          devMode: false,
          debugMode: 'false',
        },
      });

      const result = DevModeParser.fromConfig(config);
      expect(result.devMode).toBe(true);
      expect(result.debugMode).toBe(true);
    });

    it('uses prefix override when provided', () => {
      const config = createMockConfig({
        prefix: 'OMH',
        env: {
          OMH_DEV_MODE: 'false',
          CUSTOM_DEV_MODE: 'true',
          CUSTOM_DEBUG_MODE: 'true',
        },
        module: {
          devMode: false,
          debugMode: false,
        },
        setting: {
          devMode: false,
          debugMode: false,
        },
      });

      const result = DevModeParser.fromConfig(config, 'CUSTOM');
      expect(result.devMode).toBe(true);
      expect(result.debugMode).toBe(true);
    });

    it('returns a new object each time while producing consistent results', () => {
      const config = createMockConfig({
        prefix: 'OMH',
        env: {
          OMH_DEV_MODE: 'true',
          OMH_DEBUG_MODE: 'true',
        },
        module: {},
        setting: {},
      });

      const first = DevModeParser.fromConfig(config);
      const second = DevModeParser.fromConfig(config);

      expect(first).toEqual(second);
      expect(first).not.toBe(second);
    });

    it('handles multiple configs without shared state', () => {
      const configA = createMockConfig({
        prefix: 'OMH',
        env: {
          OMH_DEV_MODE: 'true',
          OMH_DEBUG_MODE: 'false',
        },
        module: {},
        setting: {},
      });

      const configB = createMockConfig({
        prefix: 'ALT',
        env: {},
        module: {
          devMode: 'true',
          debugMode: 'true',
        },
        setting: {},
      });

      const resultA = DevModeParser.fromConfig(configA);
      const resultB = DevModeParser.fromConfig(configB);

      expect(resultA.devMode).toBe(true);
      expect(resultA.debugMode).toBe(false);
      expect(resultB.devMode).toBe(true);
      expect(resultB.debugMode).toBe(true);
    });

    it('handles missing get method gracefully', () => {
      const warnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);

      const brokenConfig = { prefix: 'OMH' } as unknown as ConfigSingleton;

      const call = () => DevModeParser.fromConfig(brokenConfig);
      expect(call).not.toThrow();
      const result = call();
      expect(result.devMode).toBe(false);
      expect(result.debugMode).toBe(false);
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('logs and continues when config.get throws for specific keys', () => {
      const warnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);

      const flakyConfig: ConfigSingleton = {
        prefix: 'OMH',
        get(key, source) {
          if (source === 'env' && key === 'OMH_DEBUG_MODE') {
            throw 'boom';
          }
          if (source === 'env' && key === 'OMH_DEV_MODE') {
            return 'true';
          }
          return undefined;
        },
      };

      const result = DevModeParser.fromConfig(flakyConfig);

      expect(result.devMode).toBe(true);
      expect(result.debugMode).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to read env key "OMH_DEBUG_MODE"')
      );

      warnSpy.mockRestore();
    });

    it('preserves thrown Error messages when config.get fails', () => {
      const warnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);

      const erroringConfig: ConfigSingleton = {
        prefix: 'OMH',
        get(key, source) {
          if (source === 'env' && key === 'OMH_DEV_MODE') {
            throw new Error('failure');
          }
          return undefined;
        },
      };

      const result = DevModeParser.fromConfig(erroringConfig);

      expect(result.devMode).toBe(false);
      expect(result.debugMode).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('failure'));

      warnSpy.mockRestore();
    });

    it('supports configs without a prefix by falling back to raw keys', () => {
      const config = createMockConfig({
        env: {
          DEV_MODE: 'true',
          DEBUG_MODE: 'false',
        },
        module: {
          devMode: undefined,
          debugMode: 'true',
        },
        setting: {
          devMode: 'false',
          debugMode: 'false',
        },
      });

      const result = DevModeParser.fromConfig(config);
      expect(result.devMode).toBe(true);
      expect(result.debugMode).toBe(true);
    });

    it('allows custom hierarchy order when extracting from config', () => {
      const config = createMockConfig({
        prefix: 'OMH',
        env: {
          OMH_DEV_MODE: 'true',
          OMH_DEBUG_MODE: 'true',
        },
        module: {
          devMode: false,
          debugMode: false,
        },
        setting: {
          devMode: 'false',
          debugMode: 'true',
        },
      });

      const result = DevModeParser.fromConfig(config, undefined, {
        hierarchy: ['setting', 'module'],
      });

      expect(result.devMode).toBe(false);
      expect(result.debugMode).toBe(true);
    });
  });

  describe('performance characteristics', () => {
    const iterations = 1000;

    it('evaluates isDevMode in under 1ms on average', () => {
      const start = performance.now();
      for (let i = 0; i < iterations; i += 1) {
        DevModeParser.isDevMode('true', 'false', 'false');
      }
      const duration = (performance.now() - start) / iterations;
      expect(duration).toBeLessThan(1);
    });

    it('evaluates isDebugMode in under 1ms on average', () => {
      const start = performance.now();
      for (let i = 0; i < iterations; i += 1) {
        DevModeParser.isDebugMode('false', 'true', 'false');
      }
      const duration = (performance.now() - start) / iterations;
      expect(duration).toBeLessThan(1);
    });

    it('evaluates fromConfig in under 1ms on average', () => {
      const config = createMockConfig({
        prefix: 'OMH',
        env: {
          OMH_DEV_MODE: 'true',
          OMH_DEBUG_MODE: 'true',
        },
        module: {
          devMode: 'false',
          debugMode: 'false',
        },
        setting: {
          devMode: 'false',
          debugMode: 'false',
        },
      });

      const start = performance.now();
      for (let i = 0; i < iterations; i += 1) {
        DevModeParser.fromConfig(config);
      }
      const duration = (performance.now() - start) / iterations;
      expect(duration).toBeLessThan(1);
    });
  });
});
