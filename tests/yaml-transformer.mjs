/**
 * @file yaml-transformer.mjs
 * @description Jest mock for handling YAML files with ?raw imports
 * @path tests/yaml-transformer.mjs
 */

import fs from 'fs';
import path from 'path';

// Read the constants.yaml file content
const constantsPath = path.resolve(process.cwd(), 'constants.yaml');
const yamlContent = fs.readFileSync(constantsPath, 'utf8');

// Export the YAML content directly
export default yamlContent;