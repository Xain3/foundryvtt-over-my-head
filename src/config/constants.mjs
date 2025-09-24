/**
 * @file constants.js
 * @description This file exports the parsed and frozen constants object from YAML configuration.
 * @path src/config/constants.js
 */

import ConstantsBuilder from "./helpers/constantsBuilder.mjs";

/**
 * Parsed and frozen constants object from YAML configuration.
 *
 * This module provides access to all configuration values defined in constants.yaml,
 * parsed and validated through the ConstantsBuilder helper. The returned object is
 * deeply frozen to prevent accidental mutations and ensure configuration integrity.
 *
 * The constants include:
 * - Module reference configuration (referToModuleBy)
 * - Error formatting patterns and separators
 * - Context system configuration (sync, external, operations)
 * - Helper constants for context operations
 * - Placeable configuration for FoundryVTT
 * - Debug and logging configuration
 *
 * @example
 * import constants from './config/constants.mjs';
 *
 * // Access module configuration
 * const moduleRef = constants.referToModuleBy; // "title"
 *
 * // Access error configuration
 * const errorSeparator = constants.errors.separator; // " || "
 * const errorPattern = constants.errors.pattern; // "{{module}}{{caller}}{{error}}{{stack}}"
 *
 * // Access context configuration
 * const syncDefaults = constants.context.sync.defaults; // { autoSync: true, ... }
 * const rootMap = constants.context.external.rootMap; // { window: "globalNamespace.window", ... }
 *
 * // Access helper constants
 * const mergeStrategies = constants.contextHelpers.mergeStrategies; // { MERGE_NEWER_WINS: "mergeNewerWins", ... }
 *
 * @type {Object} The parsed and frozen constants object
 * @readonly
 * @throws {Error} If constants.yaml is missing or contains invalid YAML
 * @throws {Error} If YAML parsing fails due to syntax errors
 *
 * @since 1.0.0
 * @export
 */
const constants = Object.freeze(new ConstantsBuilder().asObject);

export default constants;