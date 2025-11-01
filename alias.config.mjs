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
