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
    constructor(CONFIG) {
        this.const = CONFIG.CONST;
        this.game = globalThis.game;
        this.contextInit = this.const.CONTEXT_INIT;
        this.moduleConfig = this.const.MODULE;
        this.contextPath = this.const.MODULE.CONTEXT_REMOTE;
        this.moduleObject = GameManager.getModuleObject(this.moduleConfig);
        this.remoteContext = GameManager.getRemoteContextPath(this.moduleObject, this.contextPath, this.contextInit);
    }
    
    /**
     * Retrieves the global game object.
     *
     * @static
     * @method getGameObject
     * @returns {Object} The global game object.
     */
    static getGameObject() {
        return globalThis.game;
    }

    /**
     * Retrieves the path of a module by its ID.
     *
     * @static
     * @method getModulePath
     * @param {string} moduleId - The ID of the module to retrieve the path for.
     * @returns {Object} The module object.
     */
    static getModuleObject(moduleConfig) {
        if (game && game.modules && typeof game.modules.get === 'function') {
            const moduleObject = game.modules.get(moduleConfig.ID);
            console.debug(`${moduleConfig.SHORT_NAME} | Module object`, moduleObject);
            if (moduleConfig.DEFAULTS.DEBUG_MODE) {
                globalThis[moduleConfig.SHORT_NAME] = game.modules.get(moduleConfig.ID);
            }
            return moduleObject;
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
     * Retrieves the remote context path from the module path.
     *
     * @static
     * @method getRemoteContextPath
     * @param {string} contextPath - The context path to retrieve.
     * @returns {string} The remote context path.
     */
    static getRemoteContextPath(moduleObject, contextPath, init_data = {}) {
        if (moduleObject[`${contextPath}`]) {
            return moduleObject[`${contextPath}`];
        } else {
            init_data.dateModified = Date.now();
            moduleObject[`${contextPath}`] = init_data;
            return moduleObject[`${contextPath}`];
        }
    }

    updateConfig = (config) => {
        this.const = config.CONST;
        this.contextInit = this.const.CONTEXT_INIT;
        this.moduleConfig = this.const.MODULE;
        this.contextPath = this.const.MODULE.CONTEXT_REMOTE;
        this.moduleObject = this.constructor.getModuleObject(this.moduleConfig);
        this.remoteContext = this.constructor.getRemoteContextPath(this.moduleObject, this.contextPath, this.contextInit);
    }

    pushToRemoteContext = (data) => {
        Object.assign(this.remoteContext, data);
    }

    pullFromRemoteContext = () => {
        return this.remoteContext;
    }
    
    writeToRemoteContext = (key, value) => {
        this.remoteContext[key] = value;
    }

    readFromRemoteContext = (key) => {
        return this.remoteContext[key];
    }

    clearRemoteContext = () => {
        Object.keys(this.remoteContext).forEach(key => delete this.remoteContext[key]);
    }

    writeToModuleObject = (key, value) => {
        this.moduleObject[key] = value;
    }

    readFromModuleObject = (key) => {
        return this.moduleObject[key];
    }
}

export default GameManager;