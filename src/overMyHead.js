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
    this.constants = config.constants;

  /**
   * @property {object} manifest - The module manifest data with shortName added for backward compatibility.
   * The manifest is constructed by the central config via buildManifestWithShortName().
   */
  this.manifest = config.buildManifestWithShortName();

    this.utils = new Utilities(this.constants, this.manifest);
    this.utils.static.unpack(this.manifest, this);
  }

  /**
   * @private
   * @method #enableDevFeatures
   * @description Enables development-specific features if the dev flag is set in the manifest.
   */
  enableDevFeatures() {
    Hooks.once('init', () => {
      // Method already checks for the dev flag in the manifest
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
      // Initialization logic to go here

      console.log(`${this.title} v${this.version} initialized.`);
    } catch (error) {
      console.error(`Error initializing ${this.title} v${this.version}: `, error);
      throw error;
    }
  }
}

export default OverMyHead;