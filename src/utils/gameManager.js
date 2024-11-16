// ./src/utils/gameManager.js

/**
 * A class to manage the Game object for game-related configurations and paths.
 * Requires CONFIG to be passed in the constructor.

 * 
 * @class
 * @module GameManager
 * @export GameManager
 * @requires globalThis.game
 * @requires globalThis.game.modules
 * @requires globalThis.game.modules.get
 * 
 * @property {Object} const - The configuration object.
 * @property {Object} game - The global game object.
 * @property {string} moduleId - The module ID.
 * @property {string} contextPath - The context path.
 * @property {string} modulePath - The module path.
 * @property {string} remoteContext - The remote context path.
 * 
 * @static
 * @method getGameObject
 * @returns {Object} The global game object.
 * 
 * @static
 * @method getModulePath
 * @param {string} moduleId - The ID of the module to retrieve the path for.
 * @returns {string} The path of the specified module.
 * 
 * @static
 * @method getRemoteContextPath
 * @param {string} contextPath - The context path to retrieve.
 */
class GameManager {
    /**
     * Creates a new GameManager instance.
     *
     * @param {Object} CONFIG - The configuration object.
     */
    constructor(CONFIG, remoteContextManager) {
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
     * @param {string} moduleId - The ID of the module to retrieve the path for.
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

    writeToModuleObject(key, value) {
        this.moduleObject[key] = value;
    }

    readFromModuleObject(key) {
        return this.moduleObject[key];
    }

    // Delegated Remote Context Methods
    pushToRemoteContext(data) {
        this.remoteContextManager.pushToRemoteContext(data);
    }

    pullFromRemoteContext() {
        return this.remoteContextManager.pullFromRemoteContext();
    }

    writeToRemoteContext(key, value) {
        this.remoteContextManager.writeToRemoteContext(key, value);
    }

    readFromRemoteContext(key) {
        return this.remoteContextManager.readFromRemoteContext(key);
    }

    clearRemoteContext() {
        this.remoteContextManager.clearRemoteContext();
    }
}

export default GameManager;