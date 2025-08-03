/**
 * @file utils.js
 * @description This file contains the Utilities class that serves as a unified interface for all utility operations.
 * @path src/utils/utils.js
 */

import StaticUtils from "./static/static.js";
import Logger from "./logger.js";
import HookFormatter from "./hookFormatter.js";
import Initializer from "./initializer.js";
import Context from "@contexts/context.js";

/**
 * Central utility class that provides a unified interface for all utility operations.
 * This class acts as a composition root, aggregating various utility classes and providing
 * convenient access to their functionality through a single interface.
 *
 * The Utilities class follows the facade pattern, exposing commonly used methods
 * directly while maintaining access to the underlying utility instances.
 *
 * @class Utilities
 * @export
 *
 * @property {typeof StaticUtils} static - Reference to the StaticUtils class for static utility operations
 * @property {Object} constants - The constants configuration object
 * @property {Object} manifest - The manifest object containing module metadata
 * @property {Function} formatError - Bound method for error formatting from StaticUtils
 * @property {Logger} logger - Logger instance for module-specific logging
 * @property {HookFormatter} hookFormatter - Hook formatter instance for consistent hook naming
 * @property {Initializer} initializer - Initializer instance for context and settings initialization
 * @property {Function} formatHookName - Convenience method bound to hookFormatter.formatHookName
 * @property {Function} initializeContext - Convenience method bound to initializer.initializeContextObject
 *
 * @example
 * // Creating a Utilities instance
 * const constants = { hooks: { ready: '.ready' }, debug: { enabled: true } };
 * const manifest = { shortName: 'OMH', title: 'Over My Head' };
 * const utilities = new Utilities(constants, manifest);
 *
 * @example
 * // Using error formatting
 * const error = new Error('Something went wrong');
 * const formattedError = utilities.formatError(error, { includeStack: true });
 *
 * @example
 * // Using hook formatting
 * const hookName = utilities.formatHookName('ready'); // Returns 'OMH.ready'
 *
 * @example
 * // Initializing context
 * const context = utilities.initializeContext({ data: 'test' });
 *
 * @example
 * // Using logger
 * utilities.logger.debug('Debug message');
 * utilities.logger.error('Error message');
 *
 * @since 1.0.0
 */
class Utilities {
  /**
   * Creates a new Utilities instance with all necessary utility classes initialized.
   *
   * @constructor
   * @param {Object} constants - The constants configuration object
   * @param {Object} constants.hooks - Object containing hook name mappings
   * @param {Object} constants.debug - Object containing debug configuration
   * @param {Object} manifest - The manifest object containing module metadata
   * @param {string} manifest.shortName - The short name used as prefix for hooks
   * @param {string} manifest.title - The full title of the module
   * @param {string} manifest.id - The unique identifier of the module
   *
   * @throws {Error} When utility class instantiation fails
   *
   * @example
   * const constants = {
   *   hooks: { ready: '.ready', init: '.init' },
   *   debug: { enabled: true }
   * };
   * const manifest = {
   *   shortName: 'OMH',
   *   title: 'Over My Head',
   *   id: 'foundryvtt-over-my-head'
   * };
   * const utilities = new Utilities(constants, manifest);
   */
  constructor(constants, manifest) {
    /**
     * Reference to the StaticUtils class for static utility operations.
     * @type {typeof StaticUtils}
     */
    this.static = StaticUtils;

    /**
     * The constants configuration object.
     * @type {Object}
     */
    this.constants = constants;

    /**
     * The manifest object containing module metadata.
     * @type {Object}
     */
    this.manifest = manifest;

    /**
     * Bound method for error formatting from StaticUtils.
     * @type {Function}
     */
    this.formatError = this.static.formatError.bind(this.static);

    /**
     * Logger instance for module-specific logging.
     * @type {Logger}
     */
    this.logger = new Logger(this.constants, this.manifest, this.formatError);

    /**
     * Hook formatter instance for consistent hook naming.
     * @type {HookFormatter}
     */
    this.hookFormatter = new HookFormatter(this.constants, this.manifest, this.formatError);

    /**
     * Initializer instance for context and settings initialization.
     * @type {Initializer}
     */
    this.initializer = new Initializer(this.constants, this.manifest, this.logger, this.formatError, Context);

    // Convenience methods for frequently used operations

    /**
     * Convenience method for formatting hook names.
     * Bound to hookFormatter.formatHookName for consistent hook naming.
     * @type {Function}
     */
    this.formatHookName = this.hookFormatter.formatHookName.bind(this.hookFormatter);

    /**
     * Convenience method for initializing context objects.
     * Bound to initializer.initializeContextObject for context setup.
     * @type {Function}
     */
    this.initializeContext = this.initializer.initializeContextObject.bind(this.initializer);
  }
}

export default Utilities;