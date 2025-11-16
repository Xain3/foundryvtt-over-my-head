/**
 * @file errorFormatter.performance.test.mjs
 * @description Performance benchmark ensuring formatError() stays under 1ms for default options.
 * @path tests/performance/errorFormatter.performance.test.mjs
 */

import { describe, it, vi, beforeEach, expect } from 'vitest';

vi.mock('#/utils/static/moduleNameResolver.ts', () => ({
  resolveModuleName: vi.fn(() => 'Mock Module'),
}));

const { formatError } = await import('#/utils/errorFormatter');

/**
 * Performance metrics for reporting.
 * Stores benchmark results to be included in test output.
 * @type {Map<string, {avgTime: number, totalTime: number, iterations: number}>}
 */
const performanceMetrics = new Map();

describe('formatError – Performance Benchmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('formats basic errors under 1ms on average', () => {
    const iterations = 1000;
    const testError = new Error('Performance test');
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      formatError(testError);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    performanceMetrics.set('basic', { avgTime, totalTime, iterations });

    // Assertion enforces performance requirement
    expect(avgTime).toBeLessThan(1.0);
  });

  it('formats errors with caller context under 1ms on average', () => {
    const iterations = 1000;
    const testError = new Error('Performance test with caller');
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      formatError(testError, {
        includeCaller: true,
        caller: 'testFunction',
      });
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    performanceMetrics.set('with-caller', { avgTime, totalTime, iterations });

    expect(avgTime).toBeLessThan(1.0);
  });

  it('formats errors with stack traces efficiently', () => {
    const iterations = 100; // Fewer iterations due to stack I/O
    const testError = new Error('Performance test with stack');
    testError.stack = Array.from(
      { length: 30 },
      (_, i) => `  at line ${i}`
    ).join('\n');

    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      formatError(testError, {
        includeStack: true,
      });
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    performanceMetrics.set('with-stack', { avgTime, totalTime, iterations });

    // Stack traces may exceed 1ms due to file I/O, allow up to 5ms
    expect(avgTime).toBeLessThan(5.0);
  });

  it('handles string coercion efficiently', () => {
    const iterations = 1000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      formatError('Simple string message');
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    performanceMetrics.set('string-coercion', {
      avgTime,
      totalTime,
      iterations,
    });

    expect(avgTime).toBeLessThan(1.0);
  });

  it('handles brace escaping in caller names efficiently', () => {
    const iterations = 1000;
    const testError = new Error('Brace test');
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      formatError(testError, {
        includeCaller: true,
        caller: 'function{{with}}{{braces}}',
      });
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    performanceMetrics.set('brace-escaping', {
      avgTime,
      totalTime,
      iterations,
    });

    expect(avgTime).toBeLessThan(1.0);
  });
});
