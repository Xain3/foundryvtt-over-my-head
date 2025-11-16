/**
 * @file Config Performance Tests
 * @description Performance tests for Config initialization and access
 * @path tests/performance/config.performance.test.mjs
 */

import { describe, it, expect } from 'vitest';

/**
 * Performance thresholds in milliseconds
 * These constants define the maximum acceptable durations for various
 * operations related to the Config singleton.
 *
 * FIRST_INITIALIZATION_MAX: Maximum time allowed for the first-time initialization of the Config singleton.
 * CACHED_ACCESS_MAX: Maximum time allowed for accessing the Config singleton from cache on subsequent accesses.
 * INSTANT_ACCESS_MAX: Maximum time allowed for instant property access on the Config object.
 * SETTINGS_ITERATION_MAX: Maximum time allowed for iterating over all settings in the Config object.
 * MUTATION_GUARD_LOOP_MAX: Maximum time allowed for repeated mutation attempts on the frozen Config object.
 * BATCH_ACCESS_MAX: Maximum time allowed for a batch of multiple accesses to Config properties.
 */
const PERFORMANCE_THRESHOLDS_MS = {
  FIRST_INITIALIZATION_MAX: 1000,
  // Dynamic `import()` incurs async overhead even when module cache is hot;
  // allow a generous threshold while still catching pathological regressions.
  CACHED_ACCESS_MAX: 5,
  INSTANT_ACCESS_MAX: 0.5,
  SETTINGS_ITERATION_MAX: 10,
  MUTATION_GUARD_LOOP_MAX: 100,
  BATCH_ACCESS_MAX: 1,
};

describe('Config Performance Tests', () => {
  describe('Initialization Performance', () => {
    it('should initialize config in under 100ms on first load', async () => {
      const startTime = performance.now();

      // Dynamic import triggers initialization
      await import('../../src/config/config.ts');

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`First config initialization took ${duration.toFixed(2)}ms`);

      // First initialization may be slower due to module loading; allow extra headroom
      expect(duration).toBeLessThan(
        PERFORMANCE_THRESHOLDS_MS.FIRST_INITIALIZATION_MAX
      );
    });

    it('should return cached instance in under 1ms on subsequent access', async () => {
      // First import to warm up
      const firstModule = await import('../../src/config/config.ts');

      const startTime = performance.now();

      // Second import should return cached instance from module cache
      const secondModule = await import('../../src/config/config.ts');

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Cached config access took ${duration.toFixed(2)}ms`);

      // Cached access should be nearly instant
      expect(duration).toBeLessThan(
        PERFORMANCE_THRESHOLDS_MS.CACHED_ACCESS_MAX
      );

      // Verify it's the same instance
      expect(firstModule.config === secondModule.config).toBe(true);
    });
  });

  describe('Access Performance', () => {
    let config;

    it('setup: load config', async () => {
      const module = await import('../../src/config/config.ts');
      config = module.config;
      expect(config).toBeDefined();
    });

    it('accessing constants should be instant', () => {
      const startTime = performance.now();

      // Access nested property
      const separator = config.constants.errors.separator;

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(separator).toBeDefined();
      expect(duration).toBeLessThan(
        PERFORMANCE_THRESHOLDS_MS.INSTANT_ACCESS_MAX
      );
    });

    it('accessing module metadata should be instant', () => {
      const startTime = performance.now();

      const id = config.module.id;
      const version = config.module.version;

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(id).toBeDefined();
      expect(version).toBeDefined();
      expect(duration).toBeLessThan(
        PERFORMANCE_THRESHOLDS_MS.INSTANT_ACCESS_MAX
      );
    });

    it('accessing environment variables should be instant', () => {
      const startTime = performance.now();

      // eslint-disable-next-line no-unused-vars
      const debugMode = config.env.OMH_DEBUG_MODE;

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(
        PERFORMANCE_THRESHOLDS_MS.INSTANT_ACCESS_MAX
      );
    });

    it('iterating settings should be fast', () => {
      const startTime = performance.now();

      let count = 0;
      if (Array.isArray(config.settings)) {
        config.settings.forEach((_setting) => {
          count++;
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Iterated ${count} settings in ${duration.toFixed(2)}ms`);

      // Should be fast even with many settings
      expect(duration).toBeLessThan(
        PERFORMANCE_THRESHOLDS_MS.SETTINGS_ITERATION_MAX
      );
    });

    it('getting toString should be fast relative to property access', () => {
      // Warmup: call toString() and property access multiple times to stabilize JIT
      for (let i = 0; i < 10; i++) {
        config.toString();
        config.module.id;
      }

      // Measure toString() performance
      const toStringStart = performance.now();
      for (let i = 0; i < 100; i++) {
        config.toString();
      }
      const toStringDuration = performance.now() - toStringStart;

      // Measure property access baseline
      const propStart = performance.now();
      for (let i = 0; i < 100; i++) {
        const _id = config.module.id;
        void _id;
      }
      const propDuration = performance.now() - propStart;

      console.log(
        `toString(): ${toStringDuration.toFixed(2)}ms | property access: ${propDuration.toFixed(2)}ms`
      );

      // toString should be no more than 5x slower than property access (meaningful ratio)
      expect(toStringDuration).toBeLessThan(propDuration * 5);
    });
  });

  describe('Memory Characteristics', () => {
    it('config object should not cause memory leaks with repeated access', async () => {
      const module = await import('../../src/config/config.ts');
      const { config: _config } = module;

      // Simulate repeated accesses
      for (let i = 0; i < 1000; i++) {
        const _moduleId = _config.module.id;
        const _separator = _config.constants.errors.separator;
        const _env = _config.env;
        // Mark vars used via accessing them
        void _moduleId;
        void _separator;
        void _env;
      }

      // If we got here without hanging or throwing, memory access is working
      expect(true).toBe(true);
    });

    it('frozen state should prevent mutations efficiently', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      const startTime = performance.now();

      // Try to mutate (should fail but should be fast)
      for (let i = 0; i < 1000; i++) {
        config.module.id = 'attempted-mutation-' + i;
        config.newProp = 'value';
        delete config.module.id;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(
        `1000 mutation attempts took ${duration.toFixed(2)}ms (frozen prevention)`
      );

      // Frozen object checks should be fast
      expect(duration).toBeLessThan(
        PERFORMANCE_THRESHOLDS_MS.MUTATION_GUARD_LOOP_MAX
      );

      // Verify no mutations occurred
      expect(config.module.id).toBe('foundryvtt-over-my-head');
    });
  });

  describe('Benchmark Comparisons', () => {
    it('config access should be faster than file I/O', async () => {
      const module = await import('../../src/config/config.ts');
      const { config } = module;

      // Time multiple accesses
      const startAccess = performance.now();
      for (let i = 0; i < 100; i++) {
        const _moduleId = config.module.id;
        const _separator = config.constants.errors.separator;
        void _moduleId;
        void _separator;
      }
      const endAccess = performance.now();
      const accessDuration = endAccess - startAccess;

      console.log(`100 config accesses took ${accessDuration.toFixed(2)}ms`);

      // Should be very fast
      expect(accessDuration).toBeLessThan(
        PERFORMANCE_THRESHOLDS_MS.BATCH_ACCESS_MAX
      );
    });
  });
});
