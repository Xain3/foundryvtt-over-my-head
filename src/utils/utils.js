// ./src/utils/utils.js

import GameManager from "./gameManager.js";
import HookFormatter from "./hookFormatter.js";
import Initializer from "./initializer.js";
import Logger from "./logger.js";
import Localizer from "./localizer.js";
import Context from "../contexts/context.js";
import RemoteContextManager from "./remoteContextManager.js";
import JsonDataManager from "./jsonDataManager.js";

/**
 * A utility class that provides various functionalities such as managing remote contexts,
 * game state, logging, hook formatting, localization, and application initialization.
 * @property {Object} CONFIG - The configuration object.
 * @property {JsonDataManager} json - Manages JSON
 * @property {RemoteContextManager} remoteContextManager - Manages remote contexts.
 * @property {GameManager} gameManager - Manages game state and operations.
 * @property {Logger} logger - Handles logging operations.
 * @property {HookFormatter} hookFormatter - Formats hooks.
 * @property {Localizer} localizer - Handles localization.
 * @property {Initializer} initializer - Initializes the application.
 */
class Utilities {
    /**
     * Creates an instance of the class with the provided configuration.
     * 
     * @constructor
     * @param {Object} CONFIG - The configuration object.
     * @param {RemoteContextManager} [RemoteContextManager=RemoteContextManager] - The class that manages remote contexts.
     */
    constructor(
        CONFIG,
    ) {
        this.CONFIG = CONFIG;
        this.json = new JsonDataManager();
        this.remoteContextManager = new RemoteContextManager();
        this.gameManager = new GameManager(CONFIG, this.remoteContextManager);
        this.logger = new Logger(CONFIG, this.gameManager);
        this.hookFormatter = new HookFormatter(CONFIG);
        this.localizer = new Localizer(CONFIG, this.gameManager.game);
        const utils = this;
        this.initializer = new Initializer(
            CONFIG,
            utils,
            Context
        );
        
    }

    /**
     * Updates the configuration for various components.
     *
     * @param {Object} CONFIG - The configuration object the components will use.
     */
    updateConfig(CONFIG) {
        this.CONFIG = CONFIG;
        this.gameManager.updateConfig(CONFIG);
        this.hookFormatter.updateConfig(CONFIG);
        this.initializer.updateConfig(CONFIG); // Added missing parentheses
        this.localizer.updateConfig(CONFIG);
        this.logger.updateConfig(CONFIG);
    }
}

export default Utilities;