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
  /**
   * Alias for the 'src/baseClasses' directory.
   */
  {
    find: '#baseClasses',
    replacement: resolve(cwd, 'src/baseClasses'),
  },
  /**
   * Alias for the main config file.
   */
  {
    find: '#config',
    replacement: resolve(cwd, 'src/config/config.mjs'),
  },
  /**
   * Alias for the 'src/config' directory.
   */
  {
    find: '#configFolder',
    replacement: resolve(cwd, 'src/config'),
  },
  /**
   * Alias for the 'src/config/helpers' directory.
   */
  {
    find: '#configHelpers',
    replacement: resolve(cwd, 'src/config/helpers'),
  },
  /**
   * Alias for the config constants file.
   */
  {
    find: '#constants',
    replacement: resolve(cwd, 'src/config/constants.mjs'),
  },
  /**
   * Alias for the 'src/contexts' directory.
   */
  {
    find: '#contexts',
    replacement: resolve(cwd, 'src/contexts'),
  },
  /**
   * Alias for the 'src/data' directory.
   */
  {
    find: '#data',
    replacement: resolve(cwd, 'src/data'),
  },
  /**
   * Alias for the 'docker' directory.
   */
  {
    find: '#docker',
    replacement: resolve(cwd, 'docker'),
  },
  /**
   * Alias for the 'src/handlers' directory.
   */
  {
    find: '#handlers',
    replacement: resolve(cwd, 'src/handlers'),
  },
  /**
   * Alias for the 'src/helpers' directory.
   */
  {
    find: '#helpers',
    replacement: resolve(cwd, 'src/helpers'),
  },
  /**
   * Alias for the path utilities helper file.
   */
  {
    find: '#helpers/pathUtils.mjs',
    replacement: resolve(cwd, 'src/helpers/pathUtils.mjs'),
  },
  /**
   * Alias for the integration tests directory.
   */
  {
    find: '#integrationTests',
    replacement: resolve(cwd, 'tests/integration'),
  },
  /**
   * Alias for the 'src/listeners' directory.
   */
  {
    find: '#listeners',
    replacement: resolve(cwd, 'src/listeners'),
  },
  /**
   * Alias for the 'src/maps' directory.
   */
  {
    find: '#maps',
    replacement: resolve(cwd, 'src/maps'),
  },
  /**
   * Alias for the manifest config file.
   */
  {
    find: '#manifest',
    replacement: resolve(cwd, 'src/config/manifest.mjs'),
  },
  /**
   * Alias for the test mocks directory.
   */
  {
    find: '#mocks',
    replacement: resolve(cwd, 'tests/mocks'),
  },
  /**
   * Alias for the module.json file.
   */
  {
    find: '#module',
    replacement: resolve(cwd, 'module.json'),
  },
  /**
   * Alias for the 'src/utils' directory.
   */
  {
    find: '#utils',
    replacement: resolve(cwd, 'src/utils'),
  },
  /**
   * Alias for the 'src/utils/static' directory.
   */
  {
    find: '#utils/static',
    replacement: resolve(cwd, 'src/utils/static'),
  },
  /**
   * Alias for the validator utility file.
   */
  {
    find: '#validator',
    replacement: resolve(cwd, 'src/utils/static/validator.mjs'),
  },
];

export default aliasEntries;
