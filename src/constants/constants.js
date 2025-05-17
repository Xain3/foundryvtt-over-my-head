import ConstantsParser from "@/helpers/constantsParser";
import constantsYaml from "@/constants/constants.yaml";

/**
 * Parses the provided YAML constants and returns a constants object.
 *
 * @type {Object}
 * @constant
 * @see ConstantsParser.parseConstants
 * @param {string} constantsYaml - The YAML string containing constant definitions.
 * @returns {Object} The parsed constants object.
 */
const constants = ConstantsParser.parseConstants(constantsYaml);

export default constants;