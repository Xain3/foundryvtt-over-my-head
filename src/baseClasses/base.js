// .src/baseClasses/base.js

export const DEFAULT_ARGS = {
    config: null,
    context: null,
    globalContext: null,
    shouldLoadConfig: true,
    shouldLoadContext: false,
    shouldLoadGame: false,
    shouldLoadDebugMode: false
};

export const REQUIRED_KEYS = Object.keys(DEFAULT_ARGS);

export const ORDERED_KEYS = [
    'config',
    'context',
    'globalContext',
    'shouldLoadConfig',
    'shouldLoadContext',
    'shouldLoadGame',
    'shouldLoadDebugMode'
];

/**
 * Base class providing core functionality for module components.
 * 
 * This class handles initialization with configuration parameters, context setting,
 * constants management, and debug mode. It supports both named parameter and positional
 * argument initialization patterns.
 * 
 * @class Base
 * @property {Object|null} config - Configuration settings for the component
 * @property {Object|null} context - Execution context for the component
 * @property {Object} global - Reference to the global scope (defaults to globalThis)
 * @property {Object|null} const - General constants from configuration
 * @property {Object|null} moduleConstants - Module-specific constants
 * @property {Object|null} game - Reference to the FoundryVTT game object
 * @property {boolean|null} debugMode - Whether debug mode is enabled
 */
class Base {
    /**
     * 
     * @param {Object} config - The configuration object containing constants. 
     * @param {Object} context - The execution context. Default is null.
     * @param {Object} globalContext - The global object. Default is globalThis.
     * @param {boolean} shouldLoadConfig - Whether to load the configuration object. Default is true.
     * @param {boolean} shouldLoadContext - Whether to load the context object. Default is false.
     * @param {boolean} shouldLoadGame - Whether to load the game object. Default is false.
     * @param {boolean} shouldLoadDebugMode - Whether to load the debug mode. Default is false.
     */
    constructor(...args) {
        const parseArgs = (args) => {
            if (args.length === 0) {
                throw new Error('No arguments provided.');
            }
            
            const firstArg = args[0];
            
            // If the first argument is not an object, throw an error
            if (typeof firstArg !== 'object') {
                throw new Error('First argument should be an object');
            }
            // If the first argument is an empty object, throw an error
            if (Object.keys(firstArg).length === 0) {
                throw new Error('First argument should not be an empty object');
            }
            // If the first argument is an object containing at least one of the required keys
            if (REQUIRED_KEYS.some(key => key in firstArg)) {
            // Extract named parameters from the object
                return { ...firstArg };
            }
            // If the first argument is an object but doesn't contain any of the required keys
            // treat it as a config object
            if (args.length === 1 && typeof firstArg === 'object') {
                return { 
                    config: firstArg, 
                    context: DEFAULT_ARGS.context,
                    globalContext: DEFAULT_ARGS.globalContext,
                    shouldLoadConfig: DEFAULT_ARGS.shouldLoadConfig,
                    shouldLoadContext: DEFAULT_ARGS.shouldLoadContext,
                    shouldLoadGame: DEFAULT_ARGS.shouldLoadGame,
                    shouldLoadDebugMode: DEFAULT_ARGS.shouldLoadDebugMode
                };
            }
            // If multiple arguments are provided, treat them as positional arguments
            // and map them to the expected parameters
            if (args.length > 1) {
                const result = { ...DEFAULT_ARGS };
                ORDERED_KEYS.forEach((key, index) => {
                if (args[index] !== undefined) {
                    result[key] = args[index];
                    }
                });
                return result;
            }
        };
        
    this.parsedArgs = parseArgs(args);
    
    this.validateLoadParameters(
        this.parsedArgs
    );
    
    this.global = this.parsedArgs.globalContext ?? globalThis;
    this.config = this.parsedArgs.shouldLoadConfig ? this.parsedArgs.config : null;
    this.context = this.parsedArgs.shouldLoadContext ? this.parsedArgs.context : null;
    this.const = this.getConstants();
    this.moduleConstants = this.getModuleConstants();
    this.game = this.parsedArgs.shouldLoadGame ? this.getGameObject() : null;
    this.debugMode = this.parsedArgs.shouldLoadDebugMode ? this.getDebugMode() : null;
    }

    /**
     * Validates the load parameters.
     * 
     * @method validateLoadParameters
     * @param {boolean} shouldLoadConfig - Whether to load the configuration object.
     * @param {Object} config - The configuration object.
     * @param {boolean} shouldLoadContext - Whether to load the context object.
     * @param {Object} context - The context object.
     */
    validateLoadParameters(args) {
        if (args.shouldLoadConfig && !args.config) {
            throw new Error('Config is set up to be loaded, but no config was provided.');
        }
        if (args.shouldLoadConfig && args.config && typeof args.config !== 'object') {
            throw new Error('Config is set up to be loaded, but config is not an object.');
        }
        if (args.shouldLoadContext && !args.context) {
            throw new Error('Context is set up to be loaded, but no context was provided.');
        }
        if (args.shouldLoadContext && args.context && typeof args.context !== 'object') {
            throw new Error('Context is set up to be loaded, but context is not an object.');
        }
        if (args.shouldLoadConfig && typeof args.shouldLoadConfig !== 'boolean') {
            throw new Error('shouldLoadConfig should be a boolean.');
        }
        if (args.shouldLoadContext && typeof args.shouldLoadContext !== 'boolean') {
            throw new Error('shouldLoadContext should be a boolean.');
        }
        if (args.shouldLoadGame && typeof args.shouldLoadGame !== 'boolean') {
            throw new Error('shouldLoadGame should be a boolean.');
        }
        if (args.shouldLoadDebugMode && typeof args.shouldLoadDebugMode !== 'boolean') {
            throw new Error('shouldLoadDebugMode should be a boolean.');
        }
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