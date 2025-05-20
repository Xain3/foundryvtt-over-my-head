import yaml from 'js-yaml';
import _ from 'lodash';
import { z } from 'zod';
import { stringToZodType } from '@maps/stringToZodType';

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
   *
   * @param {string} constants - The YAML string containing the constants to parse.
   * @param {boolean} [buildContextSchema=true] - Whether to build and replace `context.schema` with a Zod schema. Defaults to true.
   * @returns {Object} The parsed constants object, with `context.schema` as a Zod schema if `buildContextSchema` is true.
   * @throws {Error} If parsing or schema building fails.
   */
  static parseConstants(constants, buildContextSchema = true) {
    const validateArgs = () => {
      if (typeof constants !== 'string') {
        throw new TypeError('constants must be a string');
      }
      if (typeof buildContextSchema !== 'boolean') {
        throw new TypeError('buildContextSchema must be a boolean');
      }
    };

    validateArgs();  // Validate the input arguments
    try {
      const parsedConstants = yaml.load(constants);
      if (buildContextSchema) parsedConstants.context.schema = this.buildContextSchema(parsedConstants.context.schema);
      return parsedConstants;
    } catch (error) {
      console.error('Error parsing constants:', error);
      throw new Error('Failed to parse constants');
    }
  }
}
export default ConstantsParser;