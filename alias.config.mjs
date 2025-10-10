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
  {
    find: '#',
    replacement: resolve(cwd, 'src'),
  },
  {
    find: '#baseClasses',
    replacement: resolve(cwd, 'src/baseClasses'),
  },
  {
    find: '#config',
    replacement: resolve(cwd, 'src/config/config.mjs'),
  },
  {
    find: '#configFolder',
    replacement: resolve(cwd, 'src/config'),
  },
  {
    find: '#configHelpers',
    replacement: resolve(cwd, 'src/config/helpers'),
  },
  {
    find: '#constants',
    replacement: resolve(cwd, 'src/config/constants.mjs'),
  },
  {
    find: '#contexts',
    replacement: resolve(cwd, 'src/contexts'),
  },
  {
    find: '#data',
    replacement: resolve(cwd, 'src/data'),
  },
  {
    find: '#docker',
    replacement: resolve(cwd, 'docker'),
  },
  {
    find: '#handlers',
    replacement: resolve(cwd, 'src/handlers'),
  },
  {
    find: '#helpers',
    replacement: resolve(cwd, 'src/helpers'),
  },
  {
    find: '#helpers/pathUtils.mjs',
    replacement: resolve(cwd, 'src/helpers/pathUtils.mjs'),
  },
  {
    find: '#integrationTests',
    replacement: resolve(cwd, 'tests/integration'),
  },
  {
    find: '#listeners',
    replacement: resolve(cwd, 'src/listeners'),
  },
  {
    find: '#maps',
    replacement: resolve(cwd, 'src/maps'),
  },
  {
    find: '#manifest',
    replacement: resolve(cwd, 'src/config/manifest.mjs'),
  },
  {
    find: '#mocks',
    replacement: resolve(cwd, 'tests/mocks'),
  },
  {
    find: '#module',
    replacement: resolve(cwd, 'module.json'),
  },
  {
    find: '#utils',
    replacement: resolve(cwd, 'src/utils'),
  },
  {
    find: '#utils/static',
    replacement: resolve(cwd, 'src/utils/static'),
  },
  {
    find: '#validator',
    replacement: resolve(cwd, 'src/utils/static/validator.mjs'),
  },
];

export default aliasEntries;
