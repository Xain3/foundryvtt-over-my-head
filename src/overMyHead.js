/**
 * @file overMyHead.js
 * @description This file contains the main class for the OverMyHead module, responsible for initialization and core functionalities.
 * @path /src/overMyHead.js
 */
import config from './config/config.js';

import Utilities from "./utils/utils.js";

/**
 * @class OverMyHead
 * @description Main class for the "Over My Head" module.
 * It handles the initialization of the module, unpacks manifest data, and sets up constants.
 */
class OverMyHead {
  /**
   * @constructor
   * @description Initializes a new instance of the OverMyHead class.
   * It assigns the manifest and constants to instance properties and unpacks the manifest.
   */
  constructor() {
    /**
     * @property {object} constants - The module constants.
     */
  this.config = config;
  this.constants = this.config.constants;

  /**
   * @property {object} manifest - The module manifest data with shortName added for backward compatibility.
   * The manifest is constructed by the central config via buildManifestWithShortName().
   */
  this.manifest = this.config.buildManifestWithShortName();

  this.utils = new Utilities(this.constants, this.manifest);
  this.utils.static.unpack(this.manifest, this);
  }

  /**
   * Private post-localization initialization routine.
   *
   * This method performs the final initialization steps that must occur after localization:
   * - Initializes and assigns the execution context to this.context.
   * - Initializes and assigns the handlers collection to this.handlers.
   * - Initializes module settings via the settings handler.
   * - Confirms that initialization completed successfully.
   *
   * All work is delegated to this.utils.initializer and may reference this.config and this.utils.
   * Any error raised by the initializer is logged to the console and rethrown so that callers can
   * take appropriate action.
   *
   * @private
   * @returns {void}
   * @throws {Error} If any initialization step fails.
   */
  #postLocalizationInit() {
    try {
      // Initialize context
      this.context = this.utils.initializer.initializeContext();
      // Initialize handlers
      this.handlers = this.utils.initializer.initializeHandlers(this.config, this.utils, this.context);
      // Initialize settings
      const settingsHandler = this.handlers.settings;
      this.utils.initializer.initializeSettings(settingsHandler, this.utils);
      // Confirm initialization
      this.utils.initializer.confirmInitialization(this.config, this.context, this.utils);
    } catch (error) {
      console.error(`Error during post-localization initialization: `, error);
      throw error;
    }
  }

  /**
   * @private
   * @method #enableDevFeatures
   * @description Enables development-specific features if the dev flag is set in the manifest.
   */
  enableDevFeatures() {
    if (!this.manifest?.flags?.dev) return;
    Hooks.once('init', () => {
      this.utils.initializer.initializeDevFeatures(this.utils);
    });
  }

  // Manifest construction now handled by `config.buildManifestWithShortName()`

  /**
   * @async
   * @method init
   * @description Initializes the module.
   * This method is typically called during the Foundry VTT initialization phase.
   * It exports constants to the global scope and logs an initialization message.
   * @throws {Error} If an error occurs during the initialization process.
   */
  async init() {
    try {
      // Export constants to global scope via config
      config.exportConstants();
      Hooks.once('i18nInit',  () => {
        this.#postLocalizationInit();
      });
    } catch (error) {
      const manifestForLog = (this.config && this.config.manifest) || this.manifest || { title: 'Over My Head', version: 'unknown' };
      console.error(`Error initializing ${manifestForLog.title} v${manifestForLog.version}: `, error);
      throw error;
    }
  }
}

export default OverMyHead;