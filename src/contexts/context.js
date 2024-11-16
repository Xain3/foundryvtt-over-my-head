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
     * @param {string|null} [remoteLocation=null] - The optional remote location to sync with. If not provided, the default remote location is used.
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

    writeToRemoteContext(key, value) {
        this.remoteContextManager.writeToRemoteContext(key, value);
    }

    readFromRemoteContext(key) {
        return this.remoteContextManager.readFromRemoteContext(key);
    }

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
     * @param {string|null} [remoteLocation=null] - The remote location to pull the state from, if pullAndGet is true.
     * @returns {*} The value associated with the specified key from the state.
     */
    get(key, pullAndGet = false) {
      if (pullAndGet) {
          this.pullState();
      }  
      return this.state[key];
    }
    
    getRemoteLocation() {
        return this.remoteLocation;
    }

    getState(pullAndGet = false) {
        if (pullAndGet) {
            this.pullState();
        }
        return this.state;
    }
   
    getConfig(key = null, pullAndGet = false) {
        if (pullAndGet) {
            this.pullState();
        }
        if (key) {
            return this.config[key];
        }
        return this.config;
    }

    getFlags(key = null, pullAndGet = false) {
        if (pullAndGet) {
            this.pullState();
        }
        if (key) {
            return this.state.flags[key];
        }
        return this.state.flags;
    }

    getData(key = null, pullAndGet = false) {
        if (pullAndGet) {
            this.pullState();
        }
        if (key) {
            return this.state.data[key];
        }
        return this.state.data;
    }

    set(key, value, alsoPush = false, onlyRemote = false) {
        if (!onlyRemote) {
            this.state[key] = value;
            this.state.dateModified = Date.now();
        }
        if (alsoPush || onlyRemote) {
            this.pushKey(key, value);
        }
    }

    setRemoteLocation(remoteLocation, alsoPush = false) {
        this.remoteLocation = remoteLocation;
        this.state.dateModified = Date.now();
        if (alsoPush) {
            this.pushState(remoteLocation);
        }
    }

    /**
     * Sets a value in the state and optionally pushes the state to a remote location.
     *
     * @param {string} key - The key to set in the state.
     * @param {*} value - The value to set for the given key.
     * @param {boolean} [alsoPush=false] - Whether to also push the state to a remote location.
     * @param {string|null} [remoteLocation=null] - The remote location to push the state to, if alsoPush is true.
     */
    setData(key, value, alsoPush = false, onlyRemote = false) {
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
     * @param {Object} [remoteLocation=null] - The remote location to push the state to. If null, the class instance remote location is used.
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