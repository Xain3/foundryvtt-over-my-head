import fs from 'fs';
import { constant } from 'lodash';
import path from 'path';

/**
 * The filename of the YAML file containing application constants.
 * @type {string}
 */
const constantsFile = 'constants.yaml';

/**
 * A utility class for reading constants from a YAML file.
 *
 * @class
 */
class ConstantsGetter {
  /**
 * Reads the constants.yaml file and returns its content as a string.
 *
 * @returns {string} The content of constants.yaml.
 */
static getConstantsYaml(constantsFileName = constantsFile) {
  const yamlPath = path.resolve(process.cwd(), 'src', 'constants', constantsFileName);

  try {
    return fs.readFileSync(yamlPath, 'utf8');
  } catch (error) {
    console.error(`Error reading constants file at ${yamlPath}:`, error);
    // Decide how to handle the error: re-throw, return null, or a default string
    throw error;
  }
}
}

export default ConstantsGetter;