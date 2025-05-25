/**
 * @file constantsParser.js
 * @description This file contains a utility class for parsing and processing constants from YAML input, including root map creation.
 * @path src/constants/helpers/constantsParser.js
 */

import yaml from 'js-yaml';
import _ from 'lodash';
import { z } from 'zod';
import { stringToZodType } from '@maps/stringToZodType';
import { resolvePath } from '@helpers/resolvePath';

/**
 * A utility class for parsing and processing constants from YAML input.
 */
class ConstantsParser {
  /**
   * Builds a Zod schema object from a given context schema string object.
   *
   * @param {Object.<string, string>} schemaDefinition - An object where each key is a field name and each value is a string representing the Zod type.
   * @returns {import('zod').ZodObject} The constructed Zod schema object.
   * @throws {Error} If the schema cannot be built due to invalid input or processing errors.
   */
  static buildContextSchema(schemaDefinition) {
    const validateArgs = () => {
      if (typeof schemaDefinition !== 'object' || schemaDefinition === null) {
      throw new TypeError('contextSchemaString must be an object')
    };
    }

    validateArgs();  // Validate the input argument
    const innerObject = {};  // Initialize an empty object to hold the Zod schema fields
    try {
      for (const [key, value] of Object.entries(schemaDefinition)) {
        const zodType = stringToZodType(value);
        innerObject[key] = zodType;
      }
      const schema = z.object(innerObject);
      return schema;
    } catch (error) {
      console.error('Error building context schema:', error);
      throw new Error('Failed to build context schema');
    }
  }

  /**
   * Parses a YAML string of constants, performs a deep copy, and processes the context schema.
   *
   * Loads the YAML string, deeply clones the resulting object, and optionally replaces the `context.schema`
   * property with a Zod schema built from its original value.
   * It also optionally parses the `context.rootMap` property to create a root map function.
   *
   * @param {string} constants - The YAML string containing the constants to parse.
   * @param {Object} [globalNamespace=globalThis] - The global namespace to use for path resolution.
   * @param {boolean} [buildContextSchema=true] - Whether to build and replace `context.schema` with a Zod schema. Defaults to true.
   * @param {boolean} [parseContextRootMap=true] - Whether to parse the `context.rootMap` property. Defaults to true.
   * @param {Object} [module=null] - The module object to use for root map creation.
   * @returns {Object} The parsed constants object, with `context.schema` as a Zod schema if `buildContextSchema` is true.
   * @throws {Error} If parsing or schema building fails.
   */
  static parseConstants(constants, globalNamespace = globalThis, buildContextSchema = true, parseContextRootMap = true, module = null) {
    const validateArgs = () => {
      if (typeof constants !== 'string') {
        throw new TypeError('constants must be a string');
      }
      if (typeof buildContextSchema !== 'boolean') {
        throw new TypeError('buildContextSchema must be a boolean');
      }
      if (typeof parseContextRootMap !== 'boolean') {
        throw new TypeError('parseContextRootMap must be a boolean');
      }
    };

    validateArgs();  // Validate the input arguments
    try {
      const parsedConstants = yaml.load(constants);
      globalNamespace = globalNamespace || globalThis;
      if (buildContextSchema && parsedConstants.context?.schema) {
        parsedConstants.context.schema = this.buildContextSchema(parsedConstants.context.schema);
      }
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
          rootMap[key] = resolvePath(globalNamespace, value);
        }
      }

      return rootMap;
    };
  }
}

export default ConstantsParser;