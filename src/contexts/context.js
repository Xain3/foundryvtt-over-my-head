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
 */
class Context {
    /**
     * Creates an instance of the context with the given configuration and optional remote location.
     *
     * @param {Object} CONFIG - The configuration object.
     * @param {Object} utils - The utility object containing the game manager and remote context manager.
     * @param {boolean} [initializeContext=true] - Whether to initialize the context immediately.
     * @throws {Error} Throws an error if the configuration or utility object is not defined or not an object.
     * @throws {Error} Throws an error if the validator or game manager is not defined in the utility object.
     * @throws {Error} Throws an error if the CONFIG object does not contain the CONTEXT_INIT property.
     * @throws {Error} Throws an error if the CONTEXT_INIT property is not defined in the configuration object.
     * @throws {Error} Throws an error if the CONTEXT_INIT property is not an object.
     */
    constructor(CONFIG, utils, initializeContext=true) {
        validateArgs = (config, utils) => {
            if (!config) {
                throw new Error('CONFIG is not defined. Cannot initialize context');
            } 
            if (typeof config !== 'object') {
                throw new Error('CONFIG is not an object. Cannot initialize context');
            }
            if (!utils) {
                throw new Error('Utils is not defined. Cannot initialize context');
            }
            if (typeof utils !== 'object') {
                throw new Error('Utils is not an object. Cannot initialize context');
            }
            if (!utils.validator) {
                throw new Error('Validator not found in utilities. Cannot initialize context');
            }
            if (typeof initializeContext !== 'boolean') {
                throw new Error('initializeContext is not a boolean. Cannot initialize context');
            }

            if (!utils.gameManager) {
                throw new Error('Utils does not have a gameManager property. Cannot initialize context');
            }
        }

        validateArgs(CONFIG, utils);
        this.remoteContextManager = RemoteContextManager;
        this.extractor = ContextExtractor;
        this.initializer = ContextInitializer;
        this.remoteLocation = null; // remote location to sync with
        this.validate = utils.validator;
        this.manager = utils.gameManager;
        this.remoteContext = {}; // local remote context storage
        this.originalConfig = CONFIG;
        const { CONFIG: newConfig, contextInit } = this.extractor.extractContextInit(CONFIG);
        this.config = newConfig;
        this.initialState = contextInit;
        this.state = {};
        if (initializeContext) {
            this.initializer.initializeContext(this);
        }
    }
    
    /**
     * Extracts the context initialization configuration from the provided CONFIG object.
     * 
     * This function retrieves the `CONTEXT_INIT` property from the `CONFIG.CONST` object,
     * deletes it from the original object, and returns a new object containing the modified
     * CONFIG and the extracted context initialization configuration.
     * 
     * @param {Object} CONFIG - The configuration object containing the context initialization settings.
     * @returns {Object} An object containing the modified CONFIG and the extracted context initialization configuration.
     * @returns {Object} return.CONFIG - The modified configuration object with the `CONTEXT_INIT` property removed.
     * @returns {any} return.contextInit - The extracted context initialization configuration.
     */
    extractContextInit(CONFIG, returnMode = 'both') {
        try {
            validateArgs();
            const contextInit = CONFIG.CONSTANTS.CONTEXT_INIT;
            delete CONFIG.CONSTANTS.CONTEXT_INIT;
            if (returnMode === 'config') {
                return CONFIG;
            }
            if (returnMode === 'contextInit') {
                return contextInit;
            }
            return { CONFIG, contextInit };
        } catch (error) {
            return handleError(error);
        }

        function validateArgs() {
            if (!CONFIG.CONSTANTS.CONTEXT_INIT) {
                throw new Error('CONTEXT_INIT is not defined in the configuration object');
            }
            if (typeof returnMode !== 'string') {
                throw new Error('Return Mode is not a string');
            }
        }

        function handleError(error) {
            if (returnMode === 'config') {
                console.warn(error.message + '. Defaulting to CONFIG');
                    return CONFIG;
                }
                error.message += '. Could not initialize context';
                throw new Error(error.message);
        }
    }

    /**
     * Initializes the context with the given state.
     *
     * @param {Object} [state=this.initialState] - The initial state to set for the context.
     */
    initializeContext(state = this.initialState) {
        const validateArgs = () => {
            if (!state) {
                console.warn('State is not defined, defaulting to an empty object');
                return {};
            }
            if (typeof state !== 'object') {
                console.warn('State is not an object, defaulting to an empty object');
                return {};
            }   
            return state
        }

        state = validateArgs(state);
        this.state = state;
        this.initialiseData(state);
        this.initialiseFlags({});

    }

    /**
     * Initializes the state with the provided data and sets the dateModified to the current timestamp.
     *
     * @param {Object} data - The data to initialize the state with.
     */
    initialiseData(data) {
        this.state.data = data || {};
        this.state.dateModified = Date.now();
    }

    /**
     * Initializes the flags and updates the date modified.
     *
     * @param {Object} flags - The flags to be initialized.
     */
    initialiseFlags(flags) {
        this.state.flags = flags || {};
        this.state.dateModified = Date.now();
    }

    /**
     * Updates the remote location state with the current state and sets the date modified.
     * If no remote location is provided, it uses the existing remote location.
     *
     * @param {Object|null} [remoteLocation=null] - The remote location object to update. If null, the existing remote location will be used.
     */
    pushState() {
        this.remoteContextManager.pushState(this);
    }
    
    
    /**
     * Pulls the state from the remote context and updates the local state.
     * 
     * @param {boolean} [overwriteLocal=false] - If true, the local state will be completely overwritten by the remote state. 
     *                                           If false, the remote state will be merged into the local state.
     * @param {Object} [remoteState=this.remoteContext] - The remote state to pull from.
     * @throws {Error} Throws an error if the remote state is not defined or is not an object.
     */
    pullState(remoteState = this.remoteContext, overwriteLocal = false) {
        this.remoteContextManager.pullState(this, remoteState, overwriteLocal);
    }

    /**
     * Writes a key-value pair to the remote context.
     * Acts as a wrapper for the remote context manager's writeToRemoteContext method.
     *
     * @param {string} key - The key to write to the remote context.
     * @param {*} value - The value to associate with the key in the remote context.
     */
    writeToRemoteContext(key, value) {
        if (!validateArgs(key, value)) {
            return;
        }
        this.remoteContextManager.writeToRemoteContext(key, value);

        function validateArgs(key, value) {
            if (!key && !value) {
                console.warn('Key and value are not defined, remote context not updated');
                return false;
            }
            if (!key || !value) {
                let missing = !key ? 'Key' : 'Value'
                console.warn(`${missing} is not defined, remote context not updated`);
                return false;
            }
            if (typeof key !== 'string' && typeof key !== 'symbol' && typeof key !== 'number') {
                console.warn('Key is not a string, a symbol, or a number. Remote context not updated');
                return false;
            }
            return true;
        }
    }

    /**
     * Reads a value from the remote context using the provided key.
     * Acts as a wrapper for the remote context manager's readFromRemoteContext method.
     *
     * @param {string} key - The key to read the value for.
     * @returns {*} The value associated with the provided key from the remote context.
     */
    readFromRemoteContext(key) {
        if (!validateArgs(key)) {
            return;
        }
        return this.remoteContextManager.readFromRemoteContext(key);

        function validateArgs(key) {
            if (!key) {
                console.warn('Key is not defined, remote context not read');
                return false;
            }
            if (typeof key !== 'string' && typeof key !== 'symbol' && typeof key !== 'number') {
                console.warn('Key is not a string, a symbol, or a number. Remote context not read');
                return false;
            }
            return true;
        }
    }

    /**
     * Clears the remote context by invoking the clearRemoteContext method
     * on the remoteContextManager instance.
     */
    clearRemoteContext() {
        this.remoteContextManager.clearRemoteContext(this);
    }

    clearLocalContext(localContext = this.state) {
        try {
            validateArgs();
            this.state = {};
        } catch (error) {
            console.error(error.message + '. Local context not cleared');
        }

        function validateArgs() {
            if (!localContext) {
                throw new Error('Local context is not defined');
            }
            if (typeof localContext !== 'object') {
                throw new Error('Local context is not an object');
            }
        }
    }

    clearContext(clearRemote, clearLocal) {
        try {
            if (!clearRemote && !clearLocal) {
                throw new Error('Both clearRemote and clearLocal are false, no context cleared');
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
     * Synchronizes the current state with a remote location.
     * If no remote location is provided, it uses the stored remote location.
     * If the remote location's dateModified is more recent than the current state's dateModified,
     * it pulls the state from the remote location. Otherwise, it pushes the current state to the remote location.
     *
     * @param {Object|null} remoteLocation - The remote location to sync with. If null, uses the stored remote location.
     * @param {Date} remoteLocation.dateModified - The date the remote location was last modified.
     */
    syncState(remoteLocation = this.remoteLocation) {
        this.remoteContextManager.syncState(this, remoteLocation);
    }

    /**
     * Pushes a key-value pair to the remote context.
     *
     * @param {string} key - The key to be pushed.
     * @param {*} value - The value to be associated with the key.
     * @param {string|null} [remoteLocation=null] - The remote location to push the key-value pair to. If not provided, defaults to the instance's remoteLocation.
     */
    pushKey(key, value, remoteLocation = this.remoteLocation) {
        this.remoteContextManager.pushKey(this, key, value, remoteLocation);
    }

    /**
     * Retrieves the value associated with the specified key from the state.
     * Optionally pulls the state from a remote location before retrieving the value.
     *
     * @param {string} key - The key of the value to retrieve from the state.
     * @param {boolean} [pullAndGet=false] - Whether to pull the state from a remote location before retrieving the value.
     * @returns {*} The value associated with the specified key from the state.
     */
    get(key, pullAndGet = false) {
      if (pullAndGet) {
          this.pullState();
      }  
      return this.state[key];
    }
    
    /**
     * Retrieves the remote location.
     *
     * @returns {string} The remote location.
     */
    getRemoteLocation() {
        return this.remoteLocation;
    }

    /**
     * Retrieves the current state. Optionally pulls the state before returning it.
     *
     * @param {boolean} [pullAndGet=false] - If true, the state will be pulled before being returned.
     * @returns {*} The current state.
     */
    getState(pullAndGet = false) {
        if (pullAndGet) {
            this.pullState();
        }
        return this.state;
    }
   
    /**
     * Retrieves the configuration value for a given key or the entire configuration object.
     *
     * @param {string|null} [key=null] - The key of the configuration value to retrieve. If null, the entire configuration object is returned.
     * @param {boolean} [pullAndGet=false] - If true, the state is pulled before retrieving the configuration.
     * @returns {*} - The configuration value for the specified key, or the entire configuration object if no key is provided.
     */
    getConfig(key = null, pullAndGet = false) {
        if (pullAndGet) {
            this.pullState();
        }
        if (key) {
            return this.config[key];
        }
        return this.config;
    }

    /**
     * Retrieves the flags from the state.
     *
     * @param {string|null} [key=null] - The specific key of the flag to retrieve. If null, all flags are returned.
     * @param {boolean} [pullAndGet=false] - If true, the state is pulled before retrieving the flags.
     * @returns {Object|any} - The flags object or the specific flag value if a key is provided.
     */
    getFlags(key = null, pullAndGet = false) {
        if (pullAndGet) {
            this.pullState();
        }
        if (key) {
            return this.state.flags[key];
        }
        return this.state.flags;
    }

    /**
     * Retrieves data from the state.
     *
     * @param {string|null} [key=null] - The key of the data to retrieve. If null, returns the entire data object.
     * @param {boolean} [pullAndGet=false] - If true, pulls the latest state before retrieving the data.
     * @returns {*} - The data associated with the specified key, or the entire data object if no key is provided.
     */
    getData(key = null, pullAndGet = false) {
        if (pullAndGet) {
            this.pullState();
        }
        if (key) {
            return this.state.data[key];
        }
        return this.state.data;
    }

    /**
     * Sets a value for a specified key in the state and optionally pushes the key-value pair to a remote location.
     *
     * @param {string} key - The key to set in the state.
     * @param {*} value - The value to set for the specified key.
     * @param {boolean} [alsoPush=false] - If true, the key-value pair will also be pushed to a remote location.
     * @param {boolean} [onlyRemote=false] - If true, the key-value pair will only be pushed to a remote location and not set in the state.
     */
    set(key, value, alsoPush = false, onlyRemote = false) {
        if (!onlyRemote) {
            this.state.data[key] = value;
            this.state.dateModified = Date.now();
        }
        if (alsoPush || onlyRemote) {
            this.pushKey('data', this.state.data);
        }
    }

    /**
     * Sets the remote location and updates the date modified state.
     * Optionally pushes the state if alsoPush is true.
     *
     * @param {string} remoteLocation - The new remote location to set.
     * @param {boolean} [alsoPush=false] - Whether to push the state after setting the remote location.
     */
    setRemoteLocation(remoteLocation, alsoPush = false) {
        this.remoteLocation = remoteLocation;
        this.state.dateModified = Date.now();
        if (alsoPush) {
            this.pushState(remoteLocation);
        }
    }

    /**
     * Sets a flag in the state and updates the date modified.
     *
     * @param {string} key - The key of the flag to set.
     * @param {*} value - The value to set for the flag.
     * @param {boolean} [alsoPush=false] - Whether to push the state after setting the flag.
     * @param {boolean} [onlyRemote=false] - Whether to only set the flag in the remote location.
     */
    setFlags(key, value, alsoPush = false, onlyRemote = false) {
        if (!onlyRemote) {
            this.state.flags[key] = value;
            this.state.dateModified = Date.now();
        }
        if (alsoPush || onlyRemote) {
            this.pushKey('flags', this.state.flags);
        }
    }
    
}

export default Context;