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
     */
    this.manifest = this.#buildManifestWithShortName();

    this.utils = new Utilities(this.constants, this.manifest);
    this.utils.static.unpack(this.manifest, this);

    this.#enableDevFeatures(); // If dev flag is enabled in the manifest
  }

  /**
   * @private
   * @method #enableDevFeatures
   * @description Enables development-specific features.
   */
  #enableDevFeatures() {
    Hooks.once('init', () => {
      this.utils.initializer.initializeDevFeatures(this.utils);
    });
  }

  /**
   * @private
   * @method #buildManifestWithShortName
   * @description Builds the module manifest with shortName added for backward compatibility.
   * @returns {object} The frozen manifest object.
   */
  #buildManifestWithShortName() {
    return Object.freeze({
      ...config.manifest,
      shortName: this.constants.moduleManagement.shortName
    });
  }

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
      // Export constants to global scope
      this.exportConstants();
      // Initialization logic to go here

      console.log(`${this.title} v${this.version} initialized.`);
    } catch (error) {
      console.error(`Error initializing ${this.title} v${this.version}: `, error);
      throw error;
    }
  }

  exportConstants() {
    if (!globalThis.OMHconstants) {
      globalThis.OMHconstants = this.constants;
      console.log("OverMyHead: Constants exported to global scope.");
    } else {
      console.warn("OverMyHead: Constants already exported to global scope.");
    }
  }
}

export default OverMyHead;