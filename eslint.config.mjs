/**
 * @file eslint.config.mjs
 * @description ESLint configuration file using ES modules syntax.
 * @path eslint.config.mjs
 */

import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        // Foundry VTT globals
        game: 'readonly',
        canvas: 'readonly',
        Hooks: 'readonly',
        ui: 'readonly',
        CONFIG: 'readonly',
        foundry: 'readonly',
        // Add more as needed
      },
    },
    rules: {
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      }],
      'no-console': 'off',
    },
  },
  // Specific rules for test files
  {
    files: ['**/*.test.mjs', '**/*.unit.test.mjs', '**/*.int.test.mjs', '**/*.performance.test.mjs', '**/*.smoke.test.mjs', '**/*.setup.test.mjs'],
    rules: {
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^(beforeEach|afterEach|beforeAll|afterAll|vi)$',
        argsIgnorePattern: '^_',
      }],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', 'src/config/manifest.mjs'],
  },
];
