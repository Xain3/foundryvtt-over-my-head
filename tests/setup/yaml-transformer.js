/**
 * @file yaml-transformer.js
 * @description Jest mock for handling YAML files with ?raw imports
 * @path tests/setup/yaml-transformer.js
 */

const fs = require('fs');
const path = require('path');

// Read the constants.yaml file content
const constantsPath = path.resolve(process.cwd(), 'constants.yaml');
const yamlContent = fs.readFileSync(constantsPath, 'utf8');

// Export the YAML content directly
module.exports = yamlContent;