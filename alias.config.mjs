/**
 * @file alias.config.mjs
 * @description Shared alias configuration for build and test tooling
 * @path alias.config.mjs
 */

import process from 'node:process';
import { resolve } from 'node:path';

const cwd = process.cwd();

/**
 * @export
 * @type {import('vite').Alias[]}
 */
export const aliasEntries = [
  /**
   * Alias for the root 'src' directory.
   * Allows imports like `import x from '#/file'` to resolve to `src/file`.
   */
  {
    find: '#',
    replacement: resolve(cwd, 'src'),
  },
  {
    find: '#src',
    replacement: resolve(cwd, 'src'),
  },
  /**
   * Alias for the config singleton module.
   * Allows imports like `import { config } from '#config'` to resolve to `src/config/config.ts`.
   */
  {
    find: '#config',
    replacement: resolve(cwd, 'src/config/config.ts'),
  },
  /**
   * Alias for the logger utility module.
   * Allows imports like `import { Logger } from '#logger'` to resolve to `src/utils/logger.ts`.
   */
  {
    find: '#logger',
    replacement: resolve(cwd, 'src/utils/logger.ts'),
  },
  {
    find: '#/utils/errorFormatter',
    replacement: resolve(cwd, 'src/utils/errorFormatter.ts'),
  },
  {
    find: '#/utils/helpers/errorFormatterHelpers',
    replacement: resolve(cwd, 'src/utils/helpers/errorFormatterHelpers.ts'),
  },
  {
    find: '#tests',
    replacement: resolve(cwd, 'tests'),
  },
  {
    find: '#mocks',
    replacement: resolve(cwd, 'tests/mocks'),
  },
  {
    find: '#devutils',
    replacement: resolve(cwd, '.dev/utils'),
  },
];

export default aliasEntries;
