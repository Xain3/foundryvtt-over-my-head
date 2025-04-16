import Base from '../baseClasses/base.js';
import ContextExtractor from './contextHelpers/contextExtractor.js';
import ContextInitializer from './contextHelpers/contextInitializer.js';
import RemoteContextManager from './contextHelpers/remoteContextManager.js';

const validKeyTypes = ['string', 'symbol', 'number'];

/**
 * A class representing a context.
 * 
 * A context is a collection of data and flags that can be used to store and retrieve information.
 * The context can be used to store and retrieve data and flags, as well as push and pull the state to and from a remote location.
 * The context can be initialized with a configuration object and an optional remote location to sync with.
 * The remote location can be a server, a database, or the Foundry VTT world (e.g. the Game object).
 * 
 * @extends Base
 * 
 * @property {Object} extractor - The context extractor instance for extracting context information.
 * @property {Object} originalConfig - The original configuration object passed to the constructor.
 * @property {Object} config - The processed configuration object with CONTEXT_INIT removed.
 * @property {Object} initialState - The initial state of the context, extracted from the configuration.
 * @property {Object} state - The current state of the context, initialized as an empty object.
 * @property {Object} remoteContextManager - The remote context manager instance for handling remote operations.
 * @property {string} remotecontextRoot - The source for the remote context (e.g., 'module', 'game.settings', 'user'). Set to 'module' by default.
 * @property {Object} initializer - The context initializer instance for setting up the context.
 * @property {Object} validate - The validator instance for validating keys and values.
 * @property {Object} gameManager - The game manager instance for managing game-related operations.
 * 
 * Inherited from Base class:
 * @property {Object|null} context - Execution context for the component
 * @property {Object} globalContext - Reference to the global scope (defaults to globalThis)
 * @property {Object|null} const - General constants from configuration
 * @property {Object|null} moduleConstants - Module-specific constants
 * @property {Object|null} game - Reference to the FoundryVTT game object
 * @property {boolean|null} debugMode - Whether debug mode is enabled
 */
class Context extends Base {
    /**
     * Creates an instance of the context with the given configuration and optional remote location.
     *
     * @param {Object} CONFIG - The configuration object.
     * @param {Object} utils - The utility object containing the game manager and remote context manager.
     * @param {boolean} [initializeContext=true] - Whether to initialize the context immediately.
     * @param {string} [remotecontextRoot='module'] - The source for the remote context (e.g., 'module', 'game.settings', 'user').
     * @throws {Error} Throws an error if the configuration or utility object is not defined or not an object.
     * @throws {Error} Throws an error if the validator or game manager is not defined in the utility object.
     * @throws {Error} Throws an error if the CONFIG object does not contain the CONTEXT_INIT property.
     * @throws {Error} Throws an error if the CONTEXT_INIT property is not defined in the configuration object.
     * @throws {Error} Throws an error if the CONTEXT_INIT property is not an object.
     * 
     */
    constructor(CONFIG, utils, initializeContext=true, remotecontextRoot = '') {
        // Call the Base constructor with appropriate parameters
        super({
            config: CONFIG,
            shouldLoadConfig: true, 
            shouldLoadContext: false,
            shouldLoadGame: true,
            shouldLoadDebugMode: CONFIG?.CONSTANTS?.MODULE?.DEFAULTS?.DEBUG_MODE ? true : false,
            globalContext: globalThis
        });

        const validateArgs = (config, utils) => {
            // Check if CONFIG is defined and has the required properties
            if (!config) {
                throw new Error('CONFIG is not defined. Cannot initialize context');
            } 
            if (typeof config !== 'object') {
                throw new Error('CONFIG is not an object. Cannot initialize context');
            }
            if (!config.CONSTANTS) {
                throw new Error('CONFIG does not have a CONSTANTS property. Cannot initialize context');
            }
            if (typeof config.CONSTANTS !== 'object') {
                throw new Error('CONFIG.CONSTANTS is not an object. Cannot initialize context');
            }
            if (!config.CONSTANTS.CONTEXT_INIT) {
                throw new Error('CONFIG does not have a CONTEXT_INIT property. Cannot initialize context');
            }
            if (typeof config.CONSTANTS.CONTEXT_INIT !== 'object') {
                throw new Error('CONFIG.CONTEXT_INIT is not an object. Cannot initialize context');
            }
            if (Object.keys(config.CONSTANTS.CONTEXT_INIT).length === 0) {
                throw new Error('CONFIG.CONTEXT_INIT is an empty object. Cannot initialize context');
            }
            // Check if utils is defined and has the required properties
            if (!utils) {
                throw new Error('Utils is not defined. Cannot initialize context');
            }
            if (typeof utils !== 'object') {
                throw new Error('Utils is not an object. Cannot initialize context');
            }
            if (!utils.validator) {
                throw new Error('Validator not found in utilities. Cannot initialize context');
            }

            if (!utils.gameManager) {
                throw new Error('Utils does not have a gameManager property. Cannot initialize context');
            }
            if (typeof initializeContext !== 'boolean') {
                throw new Error('initializeContext is not a boolean. Cannot initialize context');
            }
        };

        validateArgs(CONFIG, utils);
        // Instantiate the RemoteContextManager
        this.extractor = ContextExtractor;
        this.originalConfig = CONFIG;
        const { CONFIG: newConfig, contextInit } = this.extractor.extractContextInit(CONFIG);
        this.config = newConfig; // Override the config from Base with the processed one
        this.remotecontextRoot = remotecontextRoot || this.originalConfig?.CONSTANTS?.MODULE?.DEFAULTS?.REMOTE_CONTEXT_ROOT || 'module';
        this.remoteContextManager = new RemoteContextManager(this.remotecontextRoot, newConfig); // Also use newConfig here if intended
        this.initializer = ContextInitializer; // Assuming these are static classes or objects
        this.validate = utils.validator;
        this.gameManager = utils.gameManager;
        // Use ContextExtractor to get the processed config and initial state
        this.initialState = contextInit;
        this.state = {}; // Initialize state as an empty object
        if (initializeContext) {
            // Call the initializer's method, passing the context instance (this)
            this.initializeContext(this.initialState); // Pass initialState directly
        }
    }
    
    /**
     * Initializes the context with the given state.
     *
     * @param {Object} [state=this.initialState] - The initial state to set for the context.
     */
    initializeContext(state = this.initialState) {
        // Use the initializer to set up the context
        this.initializer.initializeContext(this, state); 
    }

    /**
     * Pushes the current local state (`this.state`) to the remote context.
     */
    pushState() {
        // Pass the local state object to the manager's pushState
        this.remoteContextManager.pushState(this.state);
    }
    
    
    /**
     * Pulls the state from the remote context and updates the local state (`this.state`).
     * 
     * @param {boolean} [overwriteLocal=false] - If true, the local state will be completely overwritten by the remote state. 
     *                                           If false (default), the remote state will be merged into the local state.
     */
    pullState(overwriteLocal = false) {
        // Pass the local state object and the overwrite flag
        this.remoteContextManager.pullState(this.state, overwriteLocal);
    }

    /**
     * Writes a key-value pair to the remote context using pushKey.
     *
     * @param {string|symbol|number} key - The key to write to the remote context.
     * @param {*} value - The value to associate with the key in the remote context.
     */
    writeToRemoteContext(key, value) {
        // Use pushKey for writing individual key-value pairs
        this.remoteContextManager.pushKey(key, value);
    }

    /**
     * Reads a value from the remote context using the provided key.
     *
     * @param {string|symbol|number} key - The key to read the value for.
     * @returns {*} The value associated with the provided key from the remote context.
     */
    readFromRemoteContext(key) {
        if (!this._validateKey(key)) {
            return undefined; // Return undefined if key is invalid
        }
        // Use the manager's get method with the item option
        return this.remoteContextManager.get({ item: key });
    }

    /**
     * Validates the provided key for context operations.
     * Ensures key is defined and is a string, symbol, or number.
     *
     * @param {string|symbol|number} key - The key to validate.
     * @returns {boolean} True if the key is valid, false otherwise.
     * @private
     */
    _validateKey(key) {
        if (key == null) { // Check for null or undefined
            console.warn('Key is null or undefined.');
            return false;
        }
        if (!validKeyTypes.includes(typeof key)) {
            console.warn(`Invalid key type: Expected string, symbol, or number, but received ${typeof key}.`);
            return false;
        }
        if (typeof key === 'string' && key.trim() === '') {
            console.warn('Key cannot be an empty string.');
            return false;
        }
        return true;
    }

    /**
     * Clears the remote context.
     */
    clearRemoteContext() {
        // Call the manager's clearRemoteContext with no arguments
        this.remoteContextManager.clearRemoteContext();
    }

    /**
     * Clears the local state (`this.state`) by resetting it to an empty object.
     */
    clearLocalContext() { // Removed localContext parameter as it should always operate on this.state
        try {
            // Directly reset the state object
            this.state = {}; 
            console.log('Local context cleared.');
        } catch (error) {
                        console.error(error.message + '. Local context not cleared');
        }
    }

    /**
     * Clears the remote and/or local context based on flags.
     * @param {boolean} clearRemote - If true, clears the remote context.
     * @param {boolean} clearLocal - If true, clears the local context.
     */
    clearContext(clearRemote, clearLocal) {
        try {
            if (!clearRemote && !clearLocal) {
                // Changed to warning as it's not necessarily an error
                console.warn('Both clearRemote and clearLocal are false, no context cleared');
                return; 
            }
            if (clearRemote) {
                this.clearRemoteContext();
            }
            if (clearLocal) {
                this.clearLocalContext();
            }
        } catch (error) {
            console.error(error.message);            
        }
    }

    /**
     * Synchronizes the local state (`this.state`) with the remote context based on modification dates.
     */
    syncState() {
        // Pass the local state object to the manager's syncState
        this.remoteContextManager.syncState(this.state);
    }

    /**
     * Pushes a single key-value pair to the remote context.
     *
     * @param {string|symbol|number} key - The key to be pushed.
     * @param {*} value - The value to be associated with the key.
     */
    pushKey(key, value) {
        // Pass only key and value to the manager's pushKey
        this.remoteContextManager.pushKey(key, value);
    }

    /**
     * Retrieves the value associated with the specified key from the local state (`this.state`).
     * Optionally pulls the state from the remote context before retrieving the value.
     *
     * @param {string|symbol|number} key - The key of the value to retrieve from the state.
     * @param {boolean} [pullFirst=false] - Whether to pull the state from the remote context before retrieving the value.
     * @returns {*} The value associated with the specified key from the state, or undefined if not found.
     */
    get(key, pullFirst = false) {
      if (pullFirst) {
          this.pullState(); // Pulls the latest state (merges by default)
      }  
      // Access the state directly
      return this.state && this.state.data ? this.state.data[key] : undefined;
    }
    
    /**
     * Retrieves the remote context source used by the manager.
     * @returns {string | undefined} The remote context source string.
     */
    getRemotecontextRoot() {
        // The manager holds the source object, not just the string name after initialization.
        // Returning the initial source string might be more useful for the user.
        // if this exact functionality is required. For now, returning the manager's source object.
        return this.remoteContextManager.remotecontextRoot;  
    }
    /**
     * Accessing the initial config or storing the source string separately might be needed
     * in the future. For now, this is just a placeholder.
     */

    /**
     * Retrieves the current local state (`this.state`). Optionally pulls from remote first.
     *
     * @param {boolean} [pullFirst=false] - If true, the state will be pulled (merged) before being returned.
     * @returns {Object} The current state object.
     */
    getState(pullFirst = false) {
        if (pullFirst) {
            this.pullState(); // Pulls the latest state (merges by default)
        }
        return this.state;
    }
   
    /**
     * Retrieves the configuration value for a given key or the entire configuration object (`this.config`).
     * Note: This retrieves the processed config (CONTEXT_INIT removed). Use `this.originalConfig` for the initial one.
     *
     * @param {string|null} [key=null] - The key of the configuration value to retrieve. If null, the entire configuration object is returned.
     * @param {boolean} [pullFirst=false] - If true, the state is pulled before retrieving the configuration.
     * @returns {*} - The configuration value for the specified key, or the entiFfiguration object if no key is provided.
     */
    getConfig(key = null, pullFirst = false) {
        if (pullFirst) {
            this.pullState();
        }
        if (key) {
            return this.config ? this.config[key] : undefined;
        }
        return this.config;
    }

    /**
     * Retrieves the flags from the local state (`this.state.flags`).
     *
     * @param {string|null} [key=null] - The specific key of the flag to retrieve. If null, all flags are returned.
     * @param {boolean} [pullFirst=false] - If true, the state is pulled (merged) before retrieving the flags.
     * @returns {Object|any} - The flags object or the specific flag value if a key is provided. Returns undefined if state or flags don't exist.
     */
    getFlags(key = null, pullFirst = false) {
        if (pullFirst) {
            this.pullState(); // Pulls the latest state (merges by default)
        }
        if (!this.state || !this.state.flags) return undefined; // Guard against undefined state/flags
        if (key) {
            return this.state.flags[key];
        }
        return this.state.flags;
    }

    /**
     * Retrieves data from the local state (`this.state.data`).
     *
     * @param {string|null} [key=null] - The key of the data to retrieve. If null, returns the entire data object.
     * @param {boolean} [pullFirst=false] - If true, pulls the latest state (merged) before retrieving the data.
     * @returns {*} - The data associated with the specified key, or the entire data object if no key is provided. Returns undefined if state or data don't exist.
     */
    getData(key = null, pullFirst = false) {
        if (pullFirst) {
            this.pullState(); // Pulls the latest state (merges by default)
        }
         if (!this.state || !this.state.data) return undefined; // Guard against undefined state/data
        if (key) {
            return this.state.data[key];
        }
        return this.state.data;
    }

    /**
     * Sets a value for a specified key within the local state's `data` object (`this.state.data`)
     * and optionally pushes the specific change to the remote context.
     *
     * @param {string|symbol|number} key - The key to set within the state's data object.
     * @param {*} value - The value to set for the specified key.
     * @param {boolean} [pushChange=false] - If true, the specific change (`data.${key}`) is pushed to the remote context.
     * @param {boolean} [remoteOnly=false] - If true, only pushes the specific change (`data.${key}`) remotely; does not modify local state.
     */
    set(key, value, pushChange = false, remoteOnly = false) {
         // Ensure state and data objects exist
        this.state = typeof this.state === 'object' && this.state !== null ? this.state : {};
        this.state.data = typeof this.state.data === 'object' && this.state.data !== null ? this.state.data : {};

        // Always validate key first, before any action
        if (!this._validateKey(key)) {
            // Always log error if invalid, regardless of remoteOnly/pushChange
            console.error(`Invalid key '${String(key)}' provided to set method.`);
            return;
        }

        if (!remoteOnly) {
            this.state.data[key] = value;
            this.state.dateModified = Date.now(); // Update local timestamp
        }

        if (pushChange || remoteOnly) {
            // Construct the path and push the specific property change
            const path = `data.${String(key)}`; // Ensure key is string for path
            this.remoteContextManager.updateRemoteProperty(path, value);
        }
    }

    /**
     * Sets the remote context source for the manager. Note: This re-initializes the remote context.
     *
     * @param {string} remoteSource - The new remote context source string (e.g., 'module', 'game.settings').
     * @param {boolean} [alsoPush=false] - Whether to push the current local state after setting the new source.
     */
    setRemoteLocation(remoteSource, alsoPush = false) {
        try {
            // Use the manager's method to change the source
            this.remoteContextManager.setRemotecontextRoot(remoteSource); 
            // Re-set the remote context based on the new source
            this.remoteContextManager.setRemoteContext(
                remoteSource, 
                this.remoteContextManager.remoteObjectName
            );
            
            // Update local timestamp as the context definition changed
            this.state.dateModified = Date.now(); 
            if (alsoPush) {
                this.pushState(); // Push current state to the *new* remote location
            }
        } catch (error) {
            console.error(`Failed to set remote location to '${remoteSource}': ${error.message}`);
        }
    }

    /**
     * Sets a flag within the local state's `flags` object (`this.state.flags`) 
     * and optionally pushes the specific change to the remote context.
     *
     * @param {string|symbol|number} key - The key of the flag to set.
     * @param {*} value - The value to set for the flag.
     * @param {boolean} [pushChange=false] - If true, the specific change (`flags.${key}`) is pushed to the remote context.
     * @param {boolean} [remoteOnly=false] - If true, only pushes the specific change (`flags.${key}`) remotely; does not modify local state.
     */
    setFlags(key, value, pushChange = false, remoteOnly = false) {
        // Ensure state and flags objects exist
        this.state = typeof this.state === 'object' && this.state !== null ? this.state : {};
        this.state.flags = typeof this.state.flags === 'object' && this.state.flags !== null ? this.state.flags : {};

        // Always validate key first, before any action
        if (!this._validateKey(key)) {
            console.error(`Invalid key '${String(key)}' provided to setFlags method.`);
            return;
        }

        if (!remoteOnly) {
            this.state.flags[key] = value;
            this.state.dateModified = Date.now(); // Update local timestamp
        }

        if (pushChange || remoteOnly) {
            const path = `flags.${String(key)}`; // Ensure key is string for path
            this.remoteContextManager.updateRemoteProperty(path, value);
        }
    }
    
}

export default Context;