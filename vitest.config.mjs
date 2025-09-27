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
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@baseClasses': resolve(process.cwd(), 'src/baseClasses'),
      '@/baseClasses/handler': resolve(process.cwd(), 'src/baseClasses/handler.mjs'),
      '@docker': resolve(process.cwd(), 'docker'),
      '@config': resolve(process.cwd(), 'src/config/config.mjs'),
      '@constants': resolve(process.cwd(), 'src/config/constants.mjs'),
      '@manifest': resolve(process.cwd(), 'src/config/manifest.mjs'),
      '@configFolder': resolve(process.cwd(), 'src/config'),
      '@contexts': resolve(process.cwd(), 'src/contexts'),
      '@data': resolve(process.cwd(), 'src/data'),
      '@handlers': resolve(process.cwd(), 'src/handlers'),
      '@utils': resolve(process.cwd(), 'src/utils'),
      '@utils/static': resolve(process.cwd(), 'src/utils/static'),
      '@listeners': resolve(process.cwd(), 'src/listeners'),
      '@maps': resolve(process.cwd(), 'src/maps'),
      '@helpers': resolve(process.cwd(), 'src/helpers'),
      '@helpers/pathUtils.mjs': resolve(process.cwd(), 'src/helpers/pathUtils.mjs'),
      '@configHelpers': resolve(process.cwd(), 'src/config/helpers'),
      '@validator': resolve(process.cwd(), 'src/utils/static/validator.mjs'),
      '@integrationTests': resolve(process.cwd(), 'tests/integration'),
      '@mocks': resolve(process.cwd(), 'tests/mocks'),
      '@module': resolve(process.cwd(), 'module.json'),
      '@root': resolve(process.cwd(), '.')
    }
  },

  esbuild: {
    target: 'node18'
  }
});