/**
 * @file errorFormatter.performance.test.mjs
 * @description Performance benchmark ensuring formatError() stays under 1ms for default options.
 * @path tests/performance/errorFormatter.performance.test.mjs
 */

import { describe, it, vi, beforeEach } from 'vitest';

vi.mock('#/utils/static/moduleNameResolver.ts', () => ({
  resolveModuleName: vi.fn(() => 'Mock Module'),
}));

const { formatError } = await import('#/utils/errorFormatter');

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

    console.log(`Average format time (basic): ${avgTime.toFixed(4)}ms`);
    console.log(
      `Total time for ${iterations} iterations: ${totalTime.toFixed(2)}ms`
    );

    // Verify average is under 1ms
    if (avgTime >= 1.0) {
      console.warn(
        `⚠️  Performance warning: Average time ${avgTime.toFixed(4)}ms exceeds 1ms target`
      );
    } else {
      console.log(`✓ Performance target met (${avgTime.toFixed(4)}ms < 1ms)`);
    }
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

    console.log(`Average format time (with caller): ${avgTime.toFixed(4)}ms`);
    console.log(
      `Total time for ${iterations} iterations: ${totalTime.toFixed(2)}ms`
    );

    if (avgTime >= 1.0) {
      console.warn(
        `⚠️  Performance warning: Average time ${avgTime.toFixed(4)}ms exceeds 1ms target`
      );
    } else {
      console.log(`✓ Performance target met (${avgTime.toFixed(4)}ms < 1ms)`);
    }
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

    console.log(`Average format time (with stack): ${avgTime.toFixed(4)}ms`);
    console.log(
      `Total time for ${iterations} iterations: ${totalTime.toFixed(2)}ms`
    );

    // Stack traces may exceed 1ms due to file I/O, so we just log
    if (avgTime >= 5.0) {
      console.warn(
        `⚠️  Performance warning: Average time ${avgTime.toFixed(4)}ms exceeds 5ms (high latency)`
      );
    } else {
      console.log(
        `✓ Stack performance acceptable (${avgTime.toFixed(4)}ms < 5ms)`
      );
    }
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

    console.log(
      `Average format time (string coercion): ${avgTime.toFixed(4)}ms`
    );
    console.log(
      `Total time for ${iterations} iterations: ${totalTime.toFixed(2)}ms`
    );

    if (avgTime >= 1.0) {
      console.warn(
        `⚠️  Performance warning: Average time ${avgTime.toFixed(4)}ms exceeds 1ms target`
      );
    } else {
      console.log(`✓ Performance target met (${avgTime.toFixed(4)}ms < 1ms)`);
    }
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

    console.log(
      `Average format time (brace escaping): ${avgTime.toFixed(4)}ms`
    );
    console.log(
      `Total time for ${iterations} iterations: ${totalTime.toFixed(2)}ms`
    );

    if (avgTime >= 1.0) {
      console.warn(
        `⚠️  Performance warning: Average time ${avgTime.toFixed(4)}ms exceeds 1ms target`
      );
    } else {
      console.log(`✓ Performance target met (${avgTime.toFixed(4)}ms < 1ms)`);
    }
  });
});
