/**
 * @file constantsGetter.js
 * @description This file contains the ConstantsGetter class for reading constants from YAML files.
 * @path src/constants/helpers/constantsGetter.js
 */

import fs from 'fs';
import path from 'path';

/**
 * The filename of the YAML file containing application constants.
 * @type {string}
 */
const CONSTANTS_FILE = 'constants.yaml';
const ENCODING = 'utf8';

/**
 * A utility class for reading constants from a YAML file.
 * Provides static methods for file system operations with configurable file names and error handling.
 *
 * @class
 * @classdesc Static utility class for reading constants from YAML files with configurable file names and error handling.
 * @export
 *
 * Public API:
 * - static getConstantsYaml(constantsFileName) - Reads YAML file content and returns as string
 *
 * Features:
 * - Default file support (constants.yaml)
 * - Custom file name support
 * - Path resolution from project root
 * - Error handling with logging and re-throwing
 * - UTF-8 encoding
 */
class ConstantsGetter {
  /**
   * Reads the constants.yaml file and returns its content as a string.
   * Uses the project root directory as the base path for file resolution.
   *
   * @param {string} [constantsFileName=CONSTANTS_FILE] - The name of the YAML file to read. Defaults to 'constants.yaml'.
   * @returns {string} The content of the YAML file as a UTF-8 string.
   * @throws {Error} If the file cannot be read or does not exist.
   * @static
   */
  static getConstantsYaml(constantsFileName = CONSTANTS_FILE, encoding = ENCODING) {
    const yamlPath = path.resolve(process.cwd(), constantsFileName);

    try {
      return fs.readFileSync(yamlPath, encoding);
    } catch (error) {
      console.error(`Error reading constants file at ${yamlPath}:`, error);
      // Decide how to handle the error: re-throw, return null, or a default string
      throw error;
    }
  }
}

export default ConstantsGetter;