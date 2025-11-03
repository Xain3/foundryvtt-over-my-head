/**
 * @file logger.performance.test.mjs
 * @description Performance validation for the Logger utility to ensure timing and memory constraints.
 * @path tests/performance/logger.performance.test.mjs
 */

import { performance } from 'node:perf_hooks';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Logger } from '#/utils/logger.ts';

describe('Logger performance characteristics', () => {
  let debugSpy;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  it('emits debug logs under 1ms per call on average', () => {
    const logger = new Logger({
      moduleName: 'OMH',
      level: 'debug',
      debugMode: true,
      colorize: false,
      timestamp: {
        enabled: false,
        format: 'iso',
      },
    });

    const iterations = 5000;
    const start = performance.now();

    for (let index = 0; index < iterations; index += 1) {
      logger.debug('Performance probe', { iteration: index });
    }

    const totalDuration = performance.now() - start;
    const averageDuration = totalDuration / iterations;

    expect(averageDuration).toBeLessThan(1);
  });

  it('maintains configuration footprint under one megabyte', () => {
    const logger = new Logger({
      moduleName: 'OMH',
      level: 'info',
      colorize: false,
      timestamp: {
        enabled: true,
        format: 'iso',
      },
    });

    const normalizedConfig = logger.baseConfig;
    const serializedBytes = Buffer.byteLength(
      JSON.stringify(normalizedConfig),
      'utf8'
    );

    expect(serializedBytes).toBeLessThan(1024 * 1024);
  });
});
