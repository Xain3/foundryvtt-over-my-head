/**
 * @file yaml-import.setup.mjs
 * @description Vitest setup file to mock YAML imports for tests that run in Node.js environment.
 * @path tests/yaml-import.setup.mjs
 */

import fs from 'fs';
import path from 'path';
import { vi } from 'vitest';

// Mock the YAML import that Vite handles in browser environment
// Vitest allows us to use vi.mock for virtual modules
vi.mock('../../../constants.yaml?raw', () => {
  const fs = require('fs');
  const path = require('path');
  const constantsPath = path.resolve(process.cwd(), 'constants.yaml');
  return { default: fs.readFileSync(constantsPath, 'utf8') };
});
