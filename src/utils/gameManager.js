// ./src/utils/gameManager.js

import Utility from "../baseClasses/utility.js";


/**
 * A utility class for managing game modules and remote contexts.
 * GameManager provides methods to interact with module objects,
 * acting as a bridge between the game system and module configurations.
 * 
 * @class
 * @extends Utility
 * @param {Object} CONFIG - The configuration object containing constants and module settings.
 *
 * @property {Object} game - The game instance.
 * @property {Object} const - The constant values for the game configuration.
 * @property {Object} contextInit - The initial context configuration.
 * @property {Object} moduleConstants - The module configuration containing ID and paths.
 * @property {string} contextPath - The path to the module context.
 * @property {Object} moduleObject - The module object retrieved from the game instance.
 */
class GameManager extends Utility {
    
    /**
     * Creates a new GameManager instance.
     *
     * @param {Object} CONFIG - The configuration object.
     */
    constructor(CONFIG) {
        super(CONFIG, {
            shouldLoadConfig: true,
            shouldLoadGame: true,
        });
        this.updateConfig(CONFIG);
    }

    /**
     * Retrieves the path of a module by its ID.
     *
     * @method getModuleObject
     * @param {Object} moduleConfig - The module configuration object.
     * @returns {Object} The module object.
     */
    getModuleObject(moduleConfig) {
        // First try with the instance property
        if (this.game && this.game.modules && typeof this.game.modules.get === 'function') {
            return this.game.modules.get(moduleConfig.ID);
        }
        
        // If the instance property doesn't work, try with the global game object
        if (globalThis.game && globalThis.game.modules && typeof globalThis.game.modules.get === 'function') {
            return globalThis.game.modules.get(moduleConfig.ID);
        }
        
        // Error handling
        if (!this.game && !globalThis.game) {
            console.error('Game object is not available in instance or global scope.');
        } else if ((this.game && !this.game.modules) || (globalThis.game && !globalThis.game.modules)) {
            console.error('Game modules collection is not available.');
        } else {
            console.error('Game modules collection does not have a get function.');
        }
        
        return null;
    }

    /**
     * Updates the configuration for the game manager with new constants and initializes
     * required properties based on the provided configuration.
     *
     * @override
     * @param {Object} config - The configuration object.
     * @param {Object} config.CONSTANTS - The constant values for the configuration.
     * @param {Object} config.CONSTANTS.CONTEXT.INIT - The initial context configuration.
     * @param {Object} config.CONSTANTS.MODULE - The module configuration containing ID and paths.
     * @param {string} config.CONSTANTS.CONTEXT.DEFAULTS.REMOTE.PATH - The remote context path for the module.
     * @returns {void}
     * @throws {Error} Will console.error if module object cannot be retrieved.
     */
    updateConfig(config) {
        this.const = config.CONSTANTS;
        this.contextInit = this.const.CONTEXT.INIT;
        this.moduleConstants = this.const.MODULE;
        this.contextPath = this.const.CONTEXT.DEFAULTS.REMOTE.PATH;
        this.moduleObject = this.getModuleObject(this.moduleConstants);
    }

    /**
     * Writes a key-value pair to the module object.
     *
     * @param {string} key - The key to be added or updated in the module object.
     * @param {*} value - The value to be associated with the key in the module object.
     */
    writeToModuleObject(key, value) {
        this.moduleObject[key] = value;
    }

    /**
     * Reads a value from the module object using the provided key.
     *
     * @param {string} key - The key to look up in the module object.
     * @returns {*} The value associated with the provided key.
     */
    readFromModuleObject(key) {
        return this.moduleObject[key];
    }
}

export default GameManager;