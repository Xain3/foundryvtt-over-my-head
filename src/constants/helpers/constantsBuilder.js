/**
 * @file constantsBuilder.js
 * @description This file contains the ConstantsBuilder class for retrieving and parsing constant values from YAML sources.
 * @path src/constants/helpers/constantsBuilder.js
 */

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
 * @export
 *
 * Public API:
 * - constructor() - Creates a new ConstantsBuilder instance and loads constants
 * - get asString() - Returns the YAML string representation of constants
 * - get asObject() - Returns the parsed object representation of constants
 *
 * @property {string} asString - The YAML string representation of the constants.
 * @property {Object} asObject - The parsed object representation of the constants.
 */
class ConstantsBuilder {
  #string; // Cache for the YAML string
  #parsedObject; // Cache for the parsed object

  /**
   * Creates a new ConstantsBuilder instance and initializes the constants cache.
   * Fetches YAML content and parses it without module dependencies to avoid circular imports.
   *
   * @constructor
   */
  constructor() {
    this.#initializeConstants();
  }

  /**
   * Initializes the constants by fetching YAML content and parsing it.
   * This method is called during construction to set up the internal cache.
   *
   * @private
   */
  #initializeConstants() {
    // Fetch the YAML string using the ConstantsGetter helper
    this.#string = ConstantsGetter.getConstantsYaml();
    // Parse constants without module dependency to avoid circular imports
    this.#parsedObject = ConstantsParser.parseConstants(this.#string, globalThis, true, null);
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