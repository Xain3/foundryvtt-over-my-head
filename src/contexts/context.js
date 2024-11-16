// ./src/contexts/context.js

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
     */
    constructor(CONFIG, utils) {
        this.manager = utils.gameManager;
        this.remoteContextManager = utils.remoteContextManager;
        const { CONFIG: modifiedConfig, contextInit } = this.extractContextInit(CONFIG);        
        this.config = modifiedConfig;
        this.contextInit = contextInit;
        this.initialState = this.contextInit;
        this.state = {};
        this.initializeContext();
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
    extractContextInit(CONFIG) {
        const contextInit = CONFIG.CONST.CONTEXT_INIT;
        delete CONFIG.CONST.CONTEXT_INIT;
        return { CONFIG, contextInit };
    }

    /**
     * Initializes the context with the given state.
     *
     * @param {Object} [state=this.initialState] - The initial state to set for the context.
     */
    initializeContext(state = this.initialState) {
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
        this.state.data = data;
        this.state.dateModified = Date.now();
    }

    /**
     * Initializes the flags and updates the date modified.
     *
     * @param {Object} flags - The flags to be initialized.
     */
    initialiseFlags(flags) {
        this.state.flags = flags;
        this.state.dateModified = Date.now();
    }

    /**
     * Updates the remote location state with the current state and sets the date modified.
     * If no remote location is provided, it uses the existing remote location.
     *
     * @param {Object|null} [remoteLocation=null] - The remote location object to update. If null, the existing remote location will be used.
     */
    pushState() {
        this.remoteContextManager.pushToRemoteContext(this.state);
    }
    
    /**
     * Updates the current state with the provided remote location or the existing remote location.
     * If no remote location is provided and there is no existing remote location, the function returns without making any changes.
     * The state is updated with the properties of the remote location and the current date and time as the dateModified property.
     *
     * @param {Object|null} [remoteLocation=null] - The remote location object to update the state with. If not provided, the existing remote location is used.
     */
    pullState() {
        const remoteState = this.remoteContextManager.pullFromRemoteContext();
        if (remoteState) {
            this.state = { ...remoteState };
        }
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
     * Clears the remote context by invoking the clearRemoteContext method
     * on the remoteContextManager instance.
     */
    clearRemoteContext() {
        this.remoteContextManager.clearRemoteContext();
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
    syncState(remoteLocation = null) {
      if (!remoteLocation && !this.remoteLocation) {
        return;
      }
      if (!remoteLocation) {
        remoteLocation = this.remoteLocation;
      }
      if (remoteLocation.dateModified > this.state.dateModified) {
        this.pullState(remoteLocation);
      } else {
        this.pushState(remoteLocation);
      }
    }

    /**
     * Pushes a key-value pair to the remote context.
     *
     * @param {string} key - The key to be pushed.
     * @param {*} value - The value to be associated with the key.
     * @param {string|null} [remoteLocation=null] - The remote location to push the key-value pair to. If not provided, defaults to the instance's remoteLocation.
     */
    pushKey(key, value, remoteLocation = null) {
        if (!remoteLocation && !this.remoteLocation) {
            return;
        }
        if (!remoteLocation) {
            remoteLocation = this.remoteLocation;
        }
        this.writeToRemoteContext(key, value);
        this.writeToRemoteContext('dateModified', Date.now());
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