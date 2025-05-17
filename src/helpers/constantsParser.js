import yaml from 'yaml-js';
import _ from 'lodash';

/**
 * A utility class for parsing and processing constants from YAML input.
 */
class ConstantsParser {
  /**
   * Parses a YAML string of constants, performs a deep copy.
   *
   * @param {string} constants - The YAML string containing the constants to parse.
   * @returns {Object} The parsed and processed constants object.
   */
  static parseConstants(constants) {
    try {
      const parsedConstants = _.cloneDeep(yaml.load(constants));
      return parsedConstants;
    } catch (error) {
      console.error('Error parsing constants:', error);
      throw new Error('Failed to parse constants');

    }
  }
}
export default ConstantsParser;