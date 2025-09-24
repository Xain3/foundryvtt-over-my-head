/**
 * @file vitest.config.mjs
 * @description Vitest configuration for testing the Foundry VTT module
 * @path vitest.config.mjs
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      '**/*.unit.test.mjs',
      '**/*.int.test.mjs',
      '**/*.setup.test.mjs',
      '**/*.performance.test.mjs'
    ],
    globals: true,
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'clover', 'json'],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 90,
          statements: 90
        }
      },
      include: [
        'src/**/*.mjs'
      ],
      exclude: [
        'src/**/index.mjs',
        '**/node_modules/**',
        '**/*.test.mjs',
        '**/module.json',
        'src/helpers/errorFormatter.mjs'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@docker': resolve(process.cwd(), 'docker'),
      '@config': resolve(process.cwd(), 'src/config/config.mjs'),
      '@constants': resolve(process.cwd(), 'src/config/constants.mjs'),
      '@manifest': resolve(process.cwd(), 'src/config/manifest.mjs'),
      '@configFolder': resolve(process.cwd(), 'src/config'),
      '@contexts': resolve(process.cwd(), 'src/contexts'),
      '@data': resolve(process.cwd(), 'src/data'),
      '@handlers': resolve(process.cwd(), 'src/handlers'),
      '@utils': resolve(process.cwd(), 'src/utils'),
      '@listeners': resolve(process.cwd(), 'src/listeners'),
      '@maps': resolve(process.cwd(), 'src/maps'),
      '@helpers': resolve(process.cwd(), 'src/helpers'),
      '@configHelpers': resolve(process.cwd(), 'src/config/helpers'),
      '@validator': resolve(process.cwd(), 'src/utils/static/validator.mjs'),
      '@integrationTests': resolve(process.cwd(), 'tests/integration'),
      '@mocks': resolve(process.cwd(), 'tests/mocks'),
      '@module': resolve(process.cwd(), 'module.json')
    }
  },
  // Handle YAML imports with raw suffix - mock them for tests
  esbuild: {
    target: 'node18'
  }
});