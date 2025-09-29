/**
 * @file vitest.config.mjs
 * @description Vitest configuration for testing the Foundry VTT module
 * @path vitest.config.mjs
 */

const defaultExcludePatterns = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**'
];

const integrationTestsPatterns = [
  '**/*.int.test.{mjs,cjs,js}',
  '**/*.integration.test.{mjs,cjs,js}',
  '**/tests/integration/*.test.{mjs,cjs,js}'
];

const setupTestsPatterns = [
  '**/*.setup.test.{mjs,cjs,js}',
  '**/tests/setup/*.test.{mjs,cjs,js}'
];

const performanceTestsPatterns = [
  '**/*.performance.test.{mjs,cjs,js}',
  '**/*.perf.test.{mjs,cjs,js}',
  '**/tests/performance/*.test.{mjs,cjs,js}'
];

const smokeTestsPatterns = [
  '**/*.smoke.test.{mjs,cjs,js}',
  '**/tests/smoke/*.test.{mjs,cjs,js}'
];

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

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
          statements: [70, 90]
        }
      },
    },
  exclude: [...defaultExcludePatterns],

  projects: [
    { extend: true,
      test: {
        name: 'unit',
        include: ['**/*.test.{mjs,cjs,js}'],
        exclude: [
          ...integrationTestsPatterns,
          ...setupTestsPatterns,
          ...performanceTestsPatterns,
          ...smokeTestsPatterns,
          ...defaultExcludePatterns
        ]
      }
    },
    {
      extend: true,
      test: {
        name: 'integration',
        include: [...integrationTestsPatterns]
      }
    },
    {
      extend: true,
      test: {
        name: 'setup',
        include: [...setupTestsPatterns]
      }
    },
    {
      extend: true,
      test: {
        name: 'performance',
        include: [...performanceTestsPatterns]
      },
    },
    {
      extend: true,
      test: {
        name: 'smoke',
        include: [...smokeTestsPatterns]
      }
    }
  ],
  },
  resolve: {
    alias: [
      { find: '@', replacement: resolve(process.cwd(), 'src') },
      { find: '@baseClasses', replacement: resolve(process.cwd(), 'src/baseClasses') },
      { find: '@/baseClasses/handler', replacement: resolve(process.cwd(), 'src/baseClasses/handler.mjs') },
      { find: '@docker', replacement: resolve(process.cwd(), 'docker') },
      { find: '@config', replacement: resolve(process.cwd(), 'src/config/config.mjs') },
      { find: '@constants', replacement: resolve(process.cwd(), 'src/config/constants.mjs') },
      { find: '@manifest', replacement: resolve(process.cwd(), 'src/config/manifest.mjs') },
      { find: '@configFolder', replacement: resolve(process.cwd(), 'src/config') },
      { find: '@contexts', replacement: resolve(process.cwd(), 'src/contexts') },
      { find: '@data', replacement: resolve(process.cwd(), 'src/data') },
      { find: '@handlers', replacement: resolve(process.cwd(), 'src/handlers') },
      { find: '@utils', replacement: resolve(process.cwd(), 'src/utils') },
      { find: '@utils/static', replacement: resolve(process.cwd(), 'src/utils/static') },
      { find: '@listeners', replacement: resolve(process.cwd(), 'src/listeners') },
      { find: '@maps', replacement: resolve(process.cwd(), 'src/maps') },
      { find: '@helpers', replacement: resolve(process.cwd(), 'src/helpers') },
      { find: '@helpers/pathUtils.mjs', replacement: resolve(process.cwd(), 'src/helpers/pathUtils.mjs') },
      { find: '@configHelpers', replacement: resolve(process.cwd(), 'src/config/helpers') },
      { find: '@validator', replacement: resolve(process.cwd(), 'src/utils/static/validator.mjs') },
      { find: '@integrationTests', replacement: resolve(process.cwd(), 'tests/integration') },
      { find: '@mocks', replacement: resolve(process.cwd(), 'tests/mocks') },
      { find: '@module', replacement: resolve(process.cwd(), 'module.json') },
      { find: '@root', replacement: resolve(process.cwd(), '.') }
    ]
  },

  esbuild: {
    target: 'node18'
  },
  deps: {
    inline: true
  }
});