// ./src/utils/gameManager.js

import Utility from "../baseClasses/utility.js";

/**
 * The GameManager class is responsible for managing the game state and interacting with the remote context manager.
 *
 * @class GameManager
 * @extends Utility
 * @module GameManager
 * @export GameManager
 * @param {Object} CONFIG - The configuration object.
 * @param {Object} remoteContextManager - The remote context manager object.
 */
class GameManager extends Utility {
    
    /**
     * Creates a new GameManager instance.
     *
     * @param {Object} CONFIG - The configuration object.
     * @param {Object} remoteContextManager - The remote context manager object.
     */
    constructor(CONFIG, remoteContextManager) {
        super(CONFIG);
        this.remoteContextManager = remoteContextManager;
        this.game = this.getGameObject();
        this.updateConfig(CONFIG);
    }
    
    /**
     * Retrieves the global game object.
     *
     * @method getGameObject
     * @returns {Object} The global game object.
     */
    getGameObject() {
        return globalThis.game;
    }

    /**
     * Retrieves the path of a module by its ID.
     *
     * @method getModulePath
     * @param {Object} moduleConfig - The module configuration object.
     * @returns {Object} The module object.
     */
     getModuleObject(moduleConfig) {
        if (this.game && this.game.modules && typeof this.game.modules.get === 'function') {
            return this.game.modules.get(moduleConfig.ID);
        } else if (!game) {
            console.error('game is undefined.');
            return null;
        } else if (!game.modules) {
            console.error('game.modules is undefined.');
            return null;
        }
        else { 
            console.error('game.modules.get is not a function.');
            return null;
        }
    }

    /**
     * Updates the configuration for the game manager.
     *
     * @param {Object} config - The configuration object.
     * @param {Object} config.CONST - The constant values for the configuration.
     * @param {Object} config.CONST.CONTEXT_INIT - The initial context configuration.
     * @param {Object} config.CONST.MODULE - The module configuration.
     * @param {string} config.CONST.MODULE.CONTEXT_REMOTE - The remote context path for the module.
     */
    updateConfig = (config) => {
        this.const = config.CONST;
        this.contextInit = this.const.CONTEXT_INIT;
        this.moduleConfig = this.const.MODULE;
        this.contextPath = this.const.MODULE.CONTEXT_REMOTE;
        this.moduleObject = this.getModuleObject(this.moduleConfig);
        this.remoteContext = this.remoteContextManager.getRemoteContextPath(
            this.moduleObject,
            this.contextPath,
            this.contextInit
        );
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

    // Delegated Remote Context Methods
    /**
     * Pushes the provided data to the remote context.
     * Acts as a wrapper for the remote context manager's pushToRemoteContext method.
     *
     * @param {Object} data - The data to be pushed to the remote context.
     */
    pushToRemoteContext(data) {
        this.remoteContextManager.pushToRemoteContext(data);
    }

    /**
     * Pulls data from the remote context using the remote context manager.
     * Acts as a wrapper for the remote context manager's pullFromRemoteContext method.
     *
     * @returns {Promise<any>} A promise that resolves with the data pulled from the remote context.
     */
    pullFromRemoteContext() {
        return this.remoteContextManager.pullFromRemoteContext();
    }

    /**
     * Writes a key-value pair to the remote context.
     * Acts as a wrapper for the remote context manager's writeToRemoteContext method.
     *
     * @param {string} key - The key to write to the remote context.
     * @param {*} value - The value to associate with the key in the remote context.
     */
    writeToRemoteContext(key, value) {
        this.remoteContextManager.writeToRemoteContext(key, value);
    }

    /**
     * Reads a value from the remote context using the provided key.
     * Acts as a wrapper for the remote context manager's readFromRemoteContext method.
     *
     * @param {string} key - The key to read the value for.
     * @returns {*} The value associated with the provided key from the remote context.
     */
    readFromRemoteContext(key) {
        return this.remoteContextManager.readFromRemoteContext(key);
    }

    /**
     * Clears the remote context using the remoteContextManager.
     * Acts as a wrapper for the remote context manager's clearRemoteContext method.
     */
    clearRemoteContext() {
        this.remoteContextManager.clearRemoteContext();
    }
}

export default GameManager;