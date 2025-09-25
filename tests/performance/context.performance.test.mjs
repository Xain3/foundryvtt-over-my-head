/**
 * @file context.performance.test.mjs
 * @description Performance tests for the Context class to measure operation timing and resource usage
 * @path src/contexts/context.performance.test.mjs
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import Context from '@contexts/context.mjs';
import { ContextItem } from '@contexts/helpers/contextItem.mjs';
import { ContextContainer } from '@contexts/helpers/contextContainer.mjs';

describe('Context Performance Tests', () => {
  let context;
  let sourceContext;
  let largeDataSet;

  // Performance thresholds (adjust based on requirements)
  const SLOW_ENV = process.env.CI || process.env.VITEST_WORKER_ID === undefined;
  const SCALE = SLOW_ENV ? 3 : 1; // Loosen thresholds on CI/slow runners
  const PERFORMANCE_THRESHOLDS = {
    simpleGet: 1 * SCALE,
    simpleSet: 1 * SCALE,
    nestedGet: 2 * SCALE,
    nestedSet: 2 * SCALE,
  bulkOperations: 1000 * SCALE,
    largeObjectGet: 5 * SCALE,
    largeObjectSet: 10 * SCALE,
    complexMerge: 50 * SCALE,
    multiContextSync: 200 * SCALE
  };

  beforeAll(() => {
    // Create large dataset for stress testing
    largeDataSet = {
      players: {},
      inventory: {},
      gameState: {},
      statistics: {}
    };

    // Generate large nested data structures
    for (let i = 0; i < 1000; i++) {
      largeDataSet.players[`player_${i}`] = {
        id: i,
        name: `Player${i}`,
        stats: {
          level: Math.floor(Math.random() * 100),
          health: Math.floor(Math.random() * 1000),
          mana: Math.floor(Math.random() * 500),
          experience: Math.floor(Math.random() * 100000)
        },
        inventory: {
          weapons: Array.from({ length: 10 }, (_, j) => `weapon_${i}_${j}`),
          armor: Array.from({ length: 5 }, (_, j) => `armor_${i}_${j}`),
          items: Array.from({ length: 50 }, (_, j) => ({ id: j, count: Math.floor(Math.random() * 99) }))
        }
      };
    }

    for (let i = 0; i < 500; i++) {
      largeDataSet.statistics[`metric_${i}`] = {
        amount: Math.random() * 1000,
        timestamp: Date.now() - Math.floor(Math.random() * 1000000),
        info: {
          source: `source_${i}`,
          accuracy: Math.random(),
          tags: Array.from({ length: 10 }, (_, j) => `tag_${i}_${j}`)
        }
      };
    }
  });

  beforeEach(() => {
    // Create contexts with minimal overhead for baseline testing
    context = new Context({
      initializationParams: {
        data: {
          player: { name: 'TestPlayer', level: 5 },
          settings: { theme: 'dark', quality: 'high' }
        },
        settings: {
          ui: { theme: 'dark' },
          graphics: { quality: 'high', shadows: true }
        }
      },
      operationsParams: {
        alwaysPullBeforeGetting: false,
        alwaysPullBeforeSetting: false,
        alwaysPushAfterSetting: false,
        pullFrom: [],
        pushTo: []
      }
    });

    sourceContext = new Context({
      initializationParams: {
        data: largeDataSet
      },
      operationsParams: {
        alwaysPullBeforeGetting: false,
        alwaysPullBeforeSetting: false,
        alwaysPushAfterSetting: false
      }
    });
  });

  describe('Simple Operations Performance', () => {
    it('should perform simple getItem operations within threshold', () => {
      const iterations = 1000;
      const measurements = [];

      // Warm up
      for (let i = 0; i < 100; i++) {
        context.getItem('data.player.name');
      }

      // Measure performance
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const result = context.getItem('data.player.name');
        const endTime = performance.now();

        measurements.push(endTime - startTime);
        expect(result).toBe('TestPlayer');
      }

      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const medianTime = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];
      const maxTime = Math.max(...measurements);

      console.log(`Simple getItem - Average: ${averageTime.toFixed(3)}ms, Median: ${medianTime.toFixed(3)}ms, Max: ${maxTime.toFixed(3)}ms`);

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.simpleGet);
      expect(medianTime).toBeLessThan(PERFORMANCE_THRESHOLDS.simpleGet);
    });

    it('should perform simple setItem operations within threshold', () => {
      const iterations = 1000;
      const measurements = [];

      // Warm up
      for (let i = 0; i < 100; i++) {
        context.setItem('data.temp', `warmup_${i}`);
      }

      // Measure performance
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        context.setItem('data.temp', `test_${i}`);
        const endTime = performance.now();

        measurements.push(endTime - startTime);
      }

      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const medianTime = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];

      console.log(`Simple setItem - Average: ${averageTime.toFixed(3)}ms, Median: ${medianTime.toFixed(3)}ms`);

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.simpleSet);
      expect(medianTime).toBeLessThan(PERFORMANCE_THRESHOLDS.simpleSet);
    });
  });

  describe('Nested Path Operations Performance', () => {
    it('should perform nested getItem operations within threshold', () => {
      const iterations = 1000;
      const measurements = [];
      const paths = [
        'data.player.name',
        'settings.ui.theme',
        'settings.graphics.quality',
        'data.player.level'
      ];

      // Warm up
      for (let i = 0; i < 100; i++) {
        context.getItem(paths[i % paths.length]);
      }

      // Measure performance
      for (let i = 0; i < iterations; i++) {
        const path = paths[i % paths.length];
        const startTime = performance.now();
        const result = context.getItem(path);
        const endTime = performance.now();

        measurements.push(endTime - startTime);
        expect(result).toBeDefined();
      }

      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const medianTime = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];

      console.log(`Nested getItem - Average: ${averageTime.toFixed(3)}ms, Median: ${medianTime.toFixed(3)}ms`);

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.nestedGet);
      expect(medianTime).toBeLessThan(PERFORMANCE_THRESHOLDS.nestedGet);
    });

    it('should perform nested setItem operations within threshold', () => {
      const iterations = 1000;
      const measurements = [];
      const basePaths = [
        'data.performance.test',
        'settings.performance.config',
        'state.performance.metrics',
        'flags.performance.enabled'
      ];

      // Warm up
      for (let i = 0; i < 100; i++) {
        context.setItem(`${basePaths[i % basePaths.length]}.warmup`, i);
      }

      // Measure performance
      for (let i = 0; i < iterations; i++) {
        const path = `${basePaths[i % basePaths.length]}.value${i}`;
        const startTime = performance.now();
        context.setItem(path, `testValue_${i}`);
        const endTime = performance.now();

        measurements.push(endTime - startTime);
      }

      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const medianTime = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];

      console.log(`Nested setItem - Average: ${averageTime.toFixed(3)}ms, Median: ${medianTime.toFixed(3)}ms`);

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.nestedSet);
      expect(medianTime).toBeLessThan(PERFORMANCE_THRESHOLDS.nestedSet);
    });
  });

  describe('Bulk Operations Performance', () => {
    it('should handle bulk operations within threshold', () => {
      const iterations = 1000;
      const startTime = performance.now();

      // Bulk set operations
      for (let i = 0; i < iterations; i++) {
        context.setItem(`data.bulk.item${i}`, {
          id: i,
          content: `bulk_content_${i}`,
          timestamp: Date.now(),
          info: { index: i, type: 'bulk' }
        });
      }

      // Bulk get operations
      for (let i = 0; i < iterations; i++) {
        const result = context.getItem(`data.bulk.item${i}`);
        expect(result.id).toBe(i);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log(`Bulk operations (${iterations * 2} ops) - Total: ${totalTime.toFixed(3)}ms, Average: ${(totalTime / (iterations * 2)).toFixed(3)}ms per op`);

      // Note: Bulk operations can vary significantly due to GC pressure and system factors
      // This threshold allows for reasonable variance while catching major performance regressions
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.bulkOperations);
    });    it('should handle bulk mixed operations efficiently', () => {
      const iterations = 500;
      const measurements = {
        set: [],
        get: [],
        has: [],
        component: []
      };

      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        // Mixed operations
        const setStart = performance.now();
        context.setItem(`data.mixed.${i}`, { content: i });
        measurements.set.push(performance.now() - setStart);

        const getStart = performance.now();
        context.getItem(`data.mixed.${i}`);
        measurements.get.push(performance.now() - getStart);

        const hasStart = performance.now();
        context.hasItem(`data.mixed.${i}`);
        measurements.has.push(performance.now() - hasStart);

        const compStart = performance.now();
        context.data.getItem(`mixed.${i}`);
        measurements.component.push(performance.now() - compStart);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      Object.entries(measurements).forEach(([operation, times]) => {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        console.log(`${operation} average: ${avg.toFixed(3)}ms`);
      });

      console.log(`Mixed operations total: ${totalTime.toFixed(3)}ms`);
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLDS.bulkOperations * 2);
    });
  });

  describe('Large Object Performance', () => {
    it('should handle large object retrieval within threshold', () => {
      // Set a large object
      context.setItem('data.largeObject', largeDataSet);

      const iterations = 100;
      const measurements = [];

      // Warm up
      for (let i = 0; i < 10; i++) {
        context.getItem('data.largeObject');
      }

      // Measure performance
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const result = context.getItem('data.largeObject');
        const endTime = performance.now();

        measurements.push(endTime - startTime);
        expect(result.players).toBeDefined();
        expect(Object.keys(result.players)).toHaveLength(1000);
      }

      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const medianTime = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];

      console.log(`Large object get - Average: ${averageTime.toFixed(3)}ms, Median: ${medianTime.toFixed(3)}ms`);

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.largeObjectGet);
      expect(medianTime).toBeLessThan(PERFORMANCE_THRESHOLDS.largeObjectGet);
    });

    it('should handle large object setting within threshold', () => {
      const iterations = 50;
      const measurements = [];

      // Create variations of large data
      const variants = Array.from({ length: iterations }, (_, i) => ({
        ...largeDataSet,
        variant: i,
        timestamp: Date.now() + i
      }));

      // Measure performance
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        context.setItem(`data.largeVariant${i}`, variants[i]);
        const endTime = performance.now();

        measurements.push(endTime - startTime);
      }

      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const medianTime = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];

      console.log(`Large object set - Average: ${averageTime.toFixed(3)}ms, Median: ${medianTime.toFixed(3)}ms`);

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.largeObjectSet);
      expect(medianTime).toBeLessThan(PERFORMANCE_THRESHOLDS.largeObjectSet);
    });
  });

  describe('Complex Operations Performance', () => {
    it('should handle merge operations within threshold', async () => {
      const iterations = 20;
      const measurements = [];

      // Warm up
      for (let i = 0; i < 3; i++) {
        context.merge(sourceContext, 'mergeNewerWins', { allowOnly: ['data.players'] });
      }

      // Measure performance
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const result = context.merge(sourceContext, 'mergeNewerWins', {
          allowOnly: [`data.players.player_${i}`]
        });
        const endTime = performance.now();

        measurements.push(endTime - startTime);
        expect(result.success).toBe(true);
      }

      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const medianTime = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];

      console.log(`Merge operations - Average: ${averageTime.toFixed(3)}ms, Median: ${medianTime.toFixed(3)}ms`);

      expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.complexMerge);
    });

    it('should handle comparison operations efficiently', () => {
      const iterations = 1000;
      const measurements = [];

      // Create target context for comparison
      const targetContext = new Context({
        initializationParams: {
          data: { player: { name: 'TargetPlayer', level: 10 } }
        }
      });

      // Warm up
      for (let i = 0; i < 100; i++) {
        context.compare(targetContext);
      }

      // Measure performance
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const result = context.compare(targetContext, { compareBy: 'modifiedAt' });
        const endTime = performance.now();

        measurements.push(endTime - startTime);
        expect(result.result).toBeDefined();
      }

      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const medianTime = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];

      console.log(`Comparison operations - Average: ${averageTime.toFixed(3)}ms, Median: ${medianTime.toFixed(3)}ms`);

      expect(averageTime).toBeLessThan(1); // Should be very fast
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not leak memory during intensive operations', () => {
      // Get initial memory usage (if available in test environment)
      const initialHeapUsed = process.memoryUsage?.()?.heapUsed || 0;

      // Perform intensive operations
      for (let i = 0; i < 10000; i++) {
        context.setItem(`data.memory.test${i}`, {
          id: i,
          data: Array.from({ length: 100 }, (_, j) => `item_${j}`)
        });

        if (i % 100 === 0) {
          // Clear some items to test cleanup
          context.setItem(`data.memory.test${i - 50}`, null);
        }
      }

      // Perform cleanup
      context.clear();

      // Check memory usage after cleanup (if available)
      const finalHeapUsed = process.memoryUsage?.()?.heapUsed || 0;
      const memoryDelta = finalHeapUsed - initialHeapUsed;

      console.log(`Memory delta: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);

      // Memory usage should not grow indefinitely
      // This is a loose test since exact memory usage depends on many factors
      if (process.memoryUsage) {
        expect(memoryDelta).toBeLessThan(100 * 1024 * 1024); // Less than 100MB growth
      }
    });

    it('should handle deep path resolution efficiently', () => {
      // Create deeply nested structure
      const deepPath = Array.from({ length: 20 }, (_, i) => `level${i}`).join('.');
      const deepValue = 'deep_value';

      context.setItem(`data.${deepPath}`, deepValue);

      const iterations = 1000;
      const measurements = [];

      // Warm up
      for (let i = 0; i < 100; i++) {
        context.getItem(`data.${deepPath}`);
      }

      // Measure performance
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const result = context.getItem(`data.${deepPath}`);
        const endTime = performance.now();

        measurements.push(endTime - startTime);
        expect(result).toBe(deepValue);
      }

      const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const medianTime = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];

      console.log(`Deep path resolution - Average: ${averageTime.toFixed(3)}ms, Median: ${medianTime.toFixed(3)}ms`);

      expect(averageTime).toBeLessThan(5); // Should still be reasonably fast
    });
  });

  describe('Performance Degradation Tests', () => {
    it('should maintain performance as context size grows', () => {
      const sizeTests = [100, 500, 1000, 5000];
      const results = {};

      sizeTests.forEach(size => {
        // Populate context with items
        for (let i = 0; i < size; i++) {
          context.setItem(`data.scale.item${i}`, {
            id: i,
            content: `content_${i}`,
            info: { created: Date.now() }
          });
        }

        // Measure random access performance
        const iterations = 100;
        const measurements = [];

        for (let i = 0; i < iterations; i++) {
          const randomIndex = Math.floor(Math.random() * size);
          const startTime = performance.now();
          context.getItem(`data.scale.item${randomIndex}`);
          const endTime = performance.now();
          measurements.push(endTime - startTime);
        }        const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
        results[size] = averageTime;

        console.log(`Scale ${size} - Average access time: ${averageTime.toFixed(3)}ms`);
      });

      // Performance should not degrade significantly with size
      // Allow for some degradation but not exponential
      const performance100 = results[100];
      const performance5000 = results[5000];
      const degradationRatio = performance5000 / performance100;

      console.log(`Performance degradation ratio (5000/100): ${degradationRatio.toFixed(2)}x`);
      expect(degradationRatio).toBeLessThan(5); // Should not be more than 5x slower
    });

    it('should handle concurrent access patterns efficiently', async () => {
      const concurrentOperations = 100;
      const operationsPerTask = 50;

      const tasks = Array.from({ length: concurrentOperations }, (_, i) => {
        return new Promise(resolve => {
          setTimeout(() => {
            const measurements = [];

            for (let j = 0; j < operationsPerTask; j++) {
              const startTime = performance.now();

              // Mix of operations
              if (j % 3 === 0) {
                context.setItem(`data.concurrent.task${i}.op${j}`, { taskId: i, opId: j });
              } else if (j % 3 === 1) {
                context.getItem(`data.concurrent.task${i}.op${j - 1}`);
              } else {
                context.hasItem(`data.concurrent.task${i}.op${j - 1}`);
              }

              const endTime = performance.now();
              measurements.push(endTime - startTime);
            }

            const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
            resolve({ taskId: i, averageTime: avgTime });
          }, Math.random() * 10); // Random delay to simulate concurrent access
        });
      });

      const results = await Promise.all(tasks);
      const overallAverage = results.reduce((sum, result) => sum + result.averageTime, 0) / results.length;
      const maxTime = Math.max(...results.map(r => r.averageTime));

      console.log(`Concurrent operations - Overall average: ${overallAverage.toFixed(3)}ms, Max: ${maxTime.toFixed(3)}ms`);

      expect(overallAverage).toBeLessThan(5); // Should maintain reasonable performance
      expect(maxTime).toBeLessThan(20); // No single task should be extremely slow
    });
  });

  afterEach(() => {
    // Cleanup
    context.clear();
    sourceContext.clear();
  });

  afterAll(() => {
    // Final cleanup
    largeDataSet = null;
  });
});