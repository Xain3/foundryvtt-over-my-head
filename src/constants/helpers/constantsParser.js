/**
 * @file constantsParser.js
 * @description This file contains a utility class for parsing and processing constants from YAML input, including root map creation.
 * @path src/constants/helpers/constantsParser.js
 */

import yaml from 'js-yaml';
import _ from 'lodash';
import PathUtils from '../../helpers/pathUtils.js';

/**
 * A utility class for parsing and processing constants from YAML input.
 */
class ConstantsParser {
  /**
   * Parses a YAML string of constants, performs a deep copy, and processes the context configuration.
   *
   * Loads the YAML string, deeply clones the resulting object, and optionally parses the `context.rootMap` 
   * property to create a root map function.
   *
   * @param {string} constants - The YAML string containing the constants to parse.
   * @param {Object} [globalNamespace=globalThis] - The global namespace to use for path resolution.
   * @param {boolean} [parseContextRootMap=true] - Whether to parse the `context.rootMap` property. Defaults to true.
   * @param {Object} [module=null] - The module object to use for root map creation.
   * @returns {Object} The parsed constants object.
   * @throws {Error} If parsing fails.
   */
  static parseConstants(constants, globalNamespace = globalThis, parseContextRootMap = true, module = null) {
    const validateArgs = () => {
      if (typeof constants !== 'string') {
        throw new TypeError('constants must be a string');
      }
      if (typeof parseContextRootMap !== 'boolean') {
        throw new TypeError('parseContextRootMap must be a boolean');
      }
    };

    validateArgs();  // Validate the input arguments
    try {
      const parsedConstants = yaml.load(constants);
      globalNamespace = globalNamespace || globalThis;
      if (parseContextRootMap && parsedConstants.context?.remote?.rootMap) {
        parsedConstants.context.rootMap = this.createRootMapFromYaml(parsedConstants.context.remote.rootMap, globalNamespace, module);
      }
      return parsedConstants;
    } catch (error) {
      console.error('Error parsing constants:', error);
      throw new Error('Failed to parse constants');
    }
  }

  /**
   * Creates a root map function from configuration object
   * @param {Object} config - The configuration object containing rootMap
   * @returns {Function} A function that creates the root map
   */
  static createRootMapFromYaml(config, globalNamespace = undefined, module = undefined) {
    return (globalNamespace, module) => {
      const rootMap = {};

      for (const [key, value] of Object.entries(config.rootMap)) {
        if (value === null) {
          rootMap[key] = null;
        } else if (value === "module") {
          rootMap[key] = module;
        } else {
          // Dynamically resolve the path
          rootMap[key] = PathUtils.resolvePath(globalNamespace, value);
        }
      }

      return rootMap;
    };
  }
}

export default ConstantsParser;