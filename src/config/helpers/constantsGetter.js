/**
 * @file constantsGetter.js
 * @description This file contains the ConstantsGetter class for reading constants from YAML files.
 * @path src/config/helpers/constantsGetter.js
 */

// Import the YAML content as a static string asset
// Vite will handle this import and bundle the content directly
import constantsYamlContent from '../../../constants.yaml?raw';

/**
 * The filename of the YAML file containing application constants.
 * @type {string}
 */
const CONSTANTS_FILE = 'constants.yaml';
const ENCODING = 'utf8';

/**
 * A utility class for reading constants from a YAML file.
 * Provides static methods for accessing YAML content with configurable file names and error handling.
 * In browser environments, the YAML content is bundled directly into the module.
 *
 * @class
 * @classdesc Static utility class for reading constants from YAML files with configurable file names and error handling.
 * @export
 *
 * Public API:
 * - static getConstantsYaml(constantsFileName) - Returns YAML content as string
 *
 * Features:
 * - Default file support (constants.yaml)
 * - Browser-compatible (no file system access)
 * - Bundled YAML content for production use
 * - Error handling with logging and re-throwing
 * - UTF-8 encoding
 */
class ConstantsGetter {
  /**
   * Returns the constants.yaml content as a string.
   * In browser environments, this returns the bundled YAML content.
   *
   * @param {string} [constantsFileName=CONSTANTS_FILE] - The name of the YAML file (for compatibility, currently only supports default file).
   * @param {string} [encoding=ENCODING] - File encoding (for compatibility, not used in browser environment).
   * @returns {string} The content of the YAML file as a UTF-8 string.
   * @throws {Error} If the YAML content cannot be accessed.
   * @static
   */
  static getConstantsYaml(constantsFileName = CONSTANTS_FILE, encoding = ENCODING) {
    try {
      // In browser environment, return the bundled YAML content
      if (constantsFileName !== CONSTANTS_FILE) {
        console.warn(`Custom constants file '${constantsFileName}' not supported in browser environment. Using default constants.`);
      }

      if (!constantsYamlContent) {
        throw new Error('Constants YAML content is not available');
      }

      return constantsYamlContent;
    } catch (error) {
      console.error(`Error accessing constants content:`, error);
      throw error;
    }
  }
}

export default ConstantsGetter;