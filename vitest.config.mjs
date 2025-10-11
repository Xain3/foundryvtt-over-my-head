/**
 * @file vitest.config.mjs
 * @description Vitest configuration for testing the Foundry VTT module
 * @path vitest.config.mjs
 */

import { defineConfig } from 'vitest/config';

import aliasEntries from './alias.config.mjs';

const defaultExcludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
];

const integrationTestsPatterns = [
  '**/*.int.test.{mjs,cjs,js}',
  '**/*.integration.test.{mjs,cjs,js}',
  '**/tests/integration/*.test.{mjs,cjs,js}',
];

const setupTestsPatterns = [
  '**/*.setup.test.{mjs,cjs,js}',
  '**/tests/setup/*.test.{mjs,cjs,js}',
];

const performanceTestsPatterns = [
  '**/*.performance.test.{mjs,cjs,js}',
  '**/*.perf.test.{mjs,cjs,js}',
  '**/tests/performance/*.test.{mjs,cjs,js}',
];

const smokeTestsPatterns = [
  '**/*.smoke.test.{mjs,cjs,js}',
  '**/tests/smoke/*.test.{mjs,cjs,js}',
];

export default defineConfig({
  test: {
    name: 'Foundry VTT Module Tests',
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'clover', 'json'],
      thresholds: {
        global: {
          branches: [50, 80],
          functions: [55, 85],
          lines: [70, 90],
          statements: [70, 90],
        },
      },
    },
    exclude: [...defaultExcludePatterns],

    projects: [
      {
        extend: true,
        test: {
          name: 'unit',
          include: ['**/*.test.{mjs,cjs,js}'],
          exclude: [
            ...integrationTestsPatterns,
            ...setupTestsPatterns,
            ...performanceTestsPatterns,
            ...smokeTestsPatterns,
            ...defaultExcludePatterns,
          ],
        },
      },
      {
        extend: true,
        test: {
          name: 'integration',
          include: [...integrationTestsPatterns],
        },
      },
      {
        extend: true,
        test: {
          name: 'setup',
          include: [...setupTestsPatterns],
        },
      },
      {
        extend: true,
        test: {
          name: 'performance',
          include: [...performanceTestsPatterns],
        },
      },
      {
        extend: true,
        test: {
          name: 'smoke',
          include: [...smokeTestsPatterns],
        },
      },
    ],
  },
  resolve: {
    alias: aliasEntries,
  },

  esbuild: {
    target: 'node18',
  },
  deps: {
    inline: true,
  },
});
