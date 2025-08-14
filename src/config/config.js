/**
 * @file config.js
 * @description This file provides the central configuration access point for the entire module.
 * @path src/config/config.js
 */

import constants from "./constants.js";
import manifest from "./manifest.js";

/**
 * Central configuration class that provides unified access to all module configuration.
 *
 * This class acts as a facade pattern, centralizing access to both constants (YAML configuration)
 * and manifest (module.json metadata) through a single, consistent interface. This design
 * simplifies imports throughout the module and provides a single source of truth for all
 * configuration data.
 *
 * The Config class provides:
 * - Access to parsed YAML constants via the constants property
 * - Access to validated module manifest via the manifest property
 * - A consistent interface for all configuration needs
 * - Encapsulation of configuration implementation details
 *
 * @class Config
 * @export
 *
 * @property {Object} constants - The parsed and frozen constants from YAML configuration
 * @property {Object} manifest - The validated and frozen manifest from module.json
 *
 * @example
 * import Config from './config/config.js';
 *
 * const config = new Config();
 *
 * // Access constants
 * const moduleRef = config.constants.referToModuleBy;
 * const errorConfig = config.constants.errors;
 * const contextDefaults = config.constants.context.sync.defaults;
 *
 * // Access manifest
 * const moduleId = config.manifest.id;
 * const moduleTitle = config.manifest.title;
 * const moduleVersion = config.manifest.version;
 *
 * // Use in module initialization
 * console.log(`Initializing ${config.manifest.title} v${config.manifest.version}`);
 * logger.log(`Using error separator: ${config.constants.errors.separator}`);
 *
 * @example
 * // Static usage pattern for consistent access
 * import Config from './config/config.js';
 *
 * const config = new Config();
 *
 * // Pass to other modules that need configuration
 * const contextManager = new ContextManager({
 *   moduleId: config.manifest.id,
 *   syncDefaults: config.constants.context.sync.defaults,
 *   rootMap: config.constants.context.external.rootMap
 * });
 *
 * const errorFormatter = new ErrorFormatter({
 *   pattern: config.constants.errors.pattern,
 *   separator: config.constants.errors.separator,
 *   moduleTitle: config.manifest.title
 * });
 *
 * @since 1.0.0
 */
class Config {
  /**
   * Creates a new Config instance with access to constants and manifest.
   *
   * The constructor initializes the config instance with both constants and manifest,
   * providing immediate access to all configuration data. Both properties are frozen
   * objects that cannot be modified, ensuring configuration integrity.
   *
   * @constructor
   * @throws {Error} If constants.yaml is missing or contains invalid YAML
   * @throws {Error} If module.json is missing or fails manifest validation
   * @throws {Error} If required manifest attributes are not defined in constants
   */
  constructor() {
    /**
     * The parsed and frozen constants object from YAML configuration.
     * Contains all configuration values from constants.yaml including error patterns,
     * context configuration, helper constants, and module reference settings.
     *
     * @type {Object}
     * @readonly
     */
    this.constants = constants;

    /**
     * The validated and frozen manifest object from module.json.
     * Contains module metadata including id, title, version, description,
     * and other FoundryVTT module properties. The manifest is validated
     * against required attributes defined in constants.
     *
     * @type {Object}
     * @readonly
     */
    this.manifest = manifest;
  }

  /**
   * Build and return a manifest object augmented with a shortName property.
   *
   * This method centralizes the logic of adding the backwards-compatible
   * `shortName` to the manifest using the value from `constants.moduleManagement`.
   * It returns a frozen object to preserve immutability.
   *
   * @returns {Object} A frozen manifest object containing the shortName
   */
  buildManifestWithShortName() {
    // Safely obtain the shortName from constants.moduleManagement if it exists.
    // If moduleManagement or its shortName is not present, return the manifest
    // unchanged (avoid adding `shortName: undefined`) and warn for visibility.
    let shortName = this.constants && this.constants.moduleManagement
      ? this.constants.moduleManagement.shortName
      : undefined;

    if (!shortName) {
      // Derive a deterministic shortName from manifest.title or manifest.id.
      // Example: "Test Module" -> "TM" (initials of words, up to 3 chars)
      const title = this.manifest && this.manifest.title;
      if (title && typeof title === 'string') {
        const initials = title
          .split(/\s+/)
          .map(w => w.replace(/[^A-Za-z0-9]/g, ''))
          .filter(Boolean)
          .map(w => w[0].toUpperCase())
          .join('')
          .slice(0, 3);
        shortName = initials || undefined;
      }

      if (!shortName && this.manifest && this.manifest.id) {
        // Fallback to a shortened module id (alphanumeric only, uppercase, first 3 chars)
        shortName = String(this.manifest.id).replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 3);
      }

      if (typeof console !== 'undefined' && console.info) {
        console.info(`Config.buildManifestWithShortName: derived default shortName='${shortName}' from manifest.`);
      }
    }

    return Object.freeze({
      ...this.manifest,
      shortName
    });
  }
}

/**
 * The singleton instance of the Config class.
 *
 * This instance provides global access to the module configuration
 * throughout the application. It is created once and reused wherever
 * configuration access is needed.
 *
 * @property {Object} constants - The parsed and frozen constants from YAML configuration
 * @property {Object} manifest - The validated and frozen manifest from module.json
 *
 * @type {Config}
 * @readonly
 */
const config = new Config();

export default config;
