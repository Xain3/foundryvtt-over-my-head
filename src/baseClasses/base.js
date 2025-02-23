
// .src/baseClasses/base.js

/**
 * Base class for all functionality classes.
 * 
 * @class Base
 * @module Base
 * @constructor
 * @param {Object} config - The configuration object containing constants.
 * 
 * @property {Object} config - The configuration object.
 * @property {Object} const - The constant object.
 * @property {Object} moduleConstants - The module constants object.
 * @property {Object} game - The global game object.
 * @property {Object} context - The execution context.
 */
class Base {
    /**
     * 
     * @param {Object} config - The configuration object containing constants. 
     * @param {Object} context - The execution context. Default is null.
     * @param {Object} globalContext - The global object. Default is globalThis.
     * @param {boolean} shouldLoadConfig - Whether to load the configuration object. Default is true.
     * @param {boolean} shouldLoadContext - Whether to load the context object. Default is true.
     * @param {boolean} shouldLoadGame - Whether to load the game object. Default is true.
     * @param {boolean} shouldLoadDebugMode - Whether to load the debug mode. Default is true.
     */
    constructor(config=null, context = null, globalContext = null, shouldLoadConfig = true, shouldLoadContext = true, shouldLoadGame = true, shouldLoadDebugMode = true) {
        this.global = globalContext ?? globalThis;
        if (shouldLoadConfig && !config) {
            throw new Error('Config is set up to be loaded, but no config was provided.');
        }
        if (shouldLoadContext && !context) {
            throw new Error('Context is set up to be loaded, but no context was provided.');
        }

        this.config =  shouldLoadConfig ? config : null
        this.context = shouldLoadContext ? context : null;
        this.const = this.getConstants();
        this.moduleConstants = this.getModuleConstants();
        this.loadGame = shouldLoadGame ? this.getGameObject : null;
        this.loadDebugMode = shouldLoadDebugMode ? this.getDebugMode : null;
    }

    /**
     * Retrieves the debug mode flag.
     * 
     * @method getDebugMode
     * @param {boolean} fallback - The fallback value if the flag is not found. Default is true.
     * @returns {boolean} The debug mode flag.
     */
    getDebugMode(fallback = true) {
        try {
            return this.context?.getFlag('debugMode') ?? this.moduleConstants.DEFAULTS.DEBUG_MODE;
        } catch (error) {
            console.error('Error retrieving debug mode:', error);
            return fallback;
        }
    }

    /**
     * Retrieves the global game object.
     *
     * @method getGameObject
     * @returns {Object} The global game object.
     */
    getGameObject() {
        try {
            if (!this.global.game) {
               throw new Error('No game object found.');
            }
            return this.global.game;
        } catch (error) {
            console.error('Error retrieving game object:', error);
            return null;
        }
    }

    /**
     * Retrieves the constants object.
     *
     * @method getConstants
     * @returns {Object|null} The constants object or null if not found.
     */
    getConstants() {
        const output = this.config?.CONSTANTS ?? null;
        if (!output) {
            console.warn('No constants object found.');
        }
        return output;
    }

    /**
     * Retrieves the module constants object.
     *
     * @method getModuleConstants
     * @returns {Object|null} The module constants object or null if not found.
     */
    getModuleConstants() {
        const output = this.config?.CONSTANTS?.MODULE ?? null;
        if (!output) {
            console.warn('No module constants object found.');
        }
        return output;
    }
}

export default Base;