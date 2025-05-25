import ConstantsParser from "./constantsParser.js";
import ConstantsGetter from "./constantsGetter.js";

/**
 * The ConstantsBuilder class is responsible for retrieving and parsing constant values
 * from a YAML source. It provides access to both the raw YAML string and its parsed
 * object representation. The class uses helper utilities to fetch and parse the constants,
 * and caches the results for efficient repeated access.
 *
 * @class
 * @classdesc Retrieves and parses constants from a YAML source, providing both string and object representations.
 *
 * @property {string} asString - The YAML string representation of the constants.
 * @property {Object} asObject - The parsed object representation of the constants.
 */
class ConstantsBuilder {
  #string; // Cache for the YAML string
  #parsedObject; // Cache for the parsed object

  constructor() {
    // Fetch the YAML string using the ConstantsGetter helper
    this.#string = ConstantsGetter.getConstantsYaml();
    // Parse constants without module dependency to avoid circular imports
    this.#parsedObject = ConstantsParser.parseConstants(this.#string, globalThis, true, false, null);
  }


  /**
   * Returns the YAML string representation of the constants.
   *
   * @returns {string} The YAML string of constants.
   */
  get asString() {
    return this.#string;
  }

  /**
   * Returns the parsed object representation of the constants.
   *
   * @returns {Object} The parsed object of constants.
   */
  get asObject() {
    return this.#parsedObject;
  }
}

export default ConstantsBuilder;