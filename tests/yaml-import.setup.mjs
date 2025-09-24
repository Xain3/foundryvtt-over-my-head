/**
 * @file yaml-import.setup.mjs
 * @description Jest setup file to mock YAML imports for tests that run in Node.js environment.
 * @path tests/setup/yaml-import.setup.mjs
 */

import fs from 'fs';
import path from 'path';

// Mock the YAML import that Vite handles in browser environment
// Jest requires the mock factory to be self-contained, so we inline the file reading
jest.mock('../../../constants.yaml?raw', () => {
  const fs = require('fs');
  const path = require('path');
  const constantsPath = path.resolve(process.cwd(), 'constants.yaml');
  return fs.readFileSync(constantsPath, 'utf8');
}, { virtual: true });
