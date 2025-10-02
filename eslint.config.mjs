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
      ecmaVersion: 'latest',
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
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
    ignores: ['dist/', 'node_modules/', 'coverage/'],
  },
];
