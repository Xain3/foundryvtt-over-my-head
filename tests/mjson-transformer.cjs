/**
 * @file mjson-transformer.cjs
 * @description Jest transformer for .mjson files
 * @path tests/mjson-transformer.cjs
 */

const fs = require('fs');
const path = require('path');

module.exports = {
  process(sourceText, sourcePath, config, options) {
    // For .mjson files, just export the parsed JSON as the default export
    const jsonContent = JSON.parse(sourceText);
    
    // Create named exports for all top-level properties
    const namedExports = Object.keys(jsonContent)
      .map(key => `exports.${key} = ${JSON.stringify(jsonContent[key])};`)
      .join('\n');
    
    return {
      code: `
const moduleData = ${JSON.stringify(jsonContent)};
module.exports = moduleData;
module.exports.default = moduleData;
${namedExports}
      `
    };
  },
  
  getCacheKey() {
    return 'mjson-transformer';
  }
};