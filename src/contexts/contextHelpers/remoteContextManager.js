import Base from "@/baseClasses/base";
import set from 'lodash/set'; // Import the set function

const validKeyTypes = ['string', 'symbol', 'number'];

/**
 * RemoteContextManager is a class that manages a remote context, allowing for
 * synchronization, updates, and retrieval of state between a local and remote source.
 * It provides methods to set, update, clear, and synchronize the remote context
 * with a local state object.
 *
 * @class RemoteContextManager
 * @extends Base
 *
 * @param {string} [remoteContextSource='module'] - The source of the remote context. 
 *        Possible values include 'module', 'game', 'local', 'session', 'user', 'world', 'canvas', 'ui', or a custom string.
 * @param {Object} config - Configuration object passed to the parent class.
 *
 * @property {string} moduleId - The ID of the module.
 * @property {string} remoteObjectName - The name of the remote context object.
 * @property {Object} remoteContextSource - The source object of the remote context.
 * @property {Object} remoteContext - The actual remote context object being managed.
 * @property {Function} get - Alias for `getRemoteContext`.
 * @property {Function} update - Alias for `updateRemoteContext`.
 * @property {Function} clear - Alias for `clearRemoteContext`.
 * @property {Function} sync - Alias for `syncState`.
 *
 * Inherited properties from Base:
 * @property {Object|null} config - Configuration settings for the component.
 * @property {Object|null} context - Execution context for the component.
 * @property {Object} globalContext - Reference to the global scope (defaults to globalThis).
 * @property {Object|null} const - General constants from configuration.
 * @property {Object|null} moduleConstants - Module-specific constants.
 * @property {Object|null} game - Reference to the FoundryVTT game object.
 * @property {boolean|null} debugMode - Whether debug mode is enabled.
 *
 * @method setRemoteContextSource
 * @description Sets the source of the remote context.
 * @param {string} source - The new source of the remote context.
 * @param {boolean} [returnValue=false] - Whether to return the determined source.
 * @param {boolean} [setProperty=true] - Whether to set the source property.
 * @throws {Error} If the source is not provided or invalid.
 * @returns {Object|undefined} The determined source if `returnValue` is true.
 *
 * @method setRemoteContext
 * @description Sets the remote context object.
 * @param {Object} source - The source object containing the remote context.
 * @param {string} location - The property name of the remote context within the source.
 * @param {boolean} [returnValue=false] - Whether to return the determined context.
 * @param {boolean} [setProperty=true] - Whether to set the context property.
 * @throws {Error} If the source or location is not provided or invalid.
 * @returns {Object|undefined} The determined context if `returnValue` is true.
 *
 * @method determineContextSource
 * @description Determines the context source based on the provided string.
 * @param {string} source - The source string.
 * @throws {Error} If the source is not a string or is invalid.
 * @returns {Object|null} The determined context source or null if not found.
 *
 * @method getRemoteContext
 * @description Retrieves the remote context or a specific item within it.
 * @param {Object} [options] - Options for retrieving the context.
 * @param {string|null} [options.item=null] - The specific item to retrieve.
 * @throws {Error} If the remote context is not initialized or the item is invalid.
 * @returns {Object|any} The remote context or the specific item.
 *
 * @method updateRemoteContext
 * @description Updates the remote context with a new value.
 * @param {Object} value - The new value for the remote context.
 * @param {Object} [source=this.remoteContextSource] - The source object.
 * @param {string} [location=this.remoteObjectName] - The property name of the remote context.
 * @throws {Error} If the value, source, or location is invalid.
 *
 * @method pushState
 * @description Pushes the local state to the remote context.
 * @param {Object} localState - The local state object to push.
 * @throws {Error} If the local state or remote context is invalid.
 *
 * @method pullState
 * @description Pulls the remote state into the local state object.
 * @param {Object} localState - The local state object to update.
 * @param {boolean} [overwriteLocal=false] - Whether to overwrite the local state.
 * @throws {Error} If the local or remote state is invalid.
 *
 * @method clearRemoteContext
 * @description Clears the remote context by setting it to an empty object.
 * @throws {Error} If the remote context is not defined.
 *
 * @method syncState
 * @description Synchronizes the local and remote states based on their modification timestamps.
 * @param {Object} localState - The local state object to synchronize.
 * @throws {Error} If the local or remote state is invalid.
 *
 * @method pushKey
 * @description Pushes a single key-value pair to the *top level* of the remote context.
 * This method fetches the current remote state, updates the specified top-level key,
 * sets the dateModified timestamp, and pushes the entire state back.
 * For nested updates, use `updateRemoteProperty`.
 *
 * @param {string|symbol|number} key - The top-level key to push.
 * @param {any} value - The value to associate with the key.
 * @throws {Error} If the key, value, or remote context is invalid.
 */
class RemoteContextManager extends Base {
    /**
     * Constructs a new instance of the RemoteContextManager.
     *
     * @param {string} [remoteContextSource='module'] - The source of the remote context. Defaults to 'module'.
     * @param {Object} config - The configuration object for the context manager.
     *
     * @property {string} moduleId - The ID of the module, derived from module constants.
     * @property {string} remoteObjectName - The name of the remote object, derived from module constants.
     * @property {string} remoteContextSource - The source of the remote context, set using the provided method.
     * @property {Object} remoteContext - The remote context object, initialized using the provided method.
     * @property {Function} get - Alias for the method to retrieve the remote context.
     * @property {Function} update - Alias for the method to update the remote context.
     * @property {Function} clear - Alias for the method to clear the remote context.
     * @property {Function} sync - Alias for the method to synchronize the state.
     * 
     * * Inherited properties from Base:
     * @property {Object|null} config - Configuration settings for the component.
     * @property {Object|null} context - Execution context for the component.
     * @property {Object} globalContext - Reference to the global scope (defaults to globalThis).
     * @property {Object|null} const - General constants from configuration.
     * @property {Object|null} moduleConstants - Module-specific constants.
     * @property {Object|null} game - Reference to the FoundryVTT game object.
     * @property {boolean|null} debugMode - Whether debug mode is enabled.
     */
    constructor(remoteContextSource = 'module', config) {
        super({
            config,
            shouldLoadGame: true

        });
        this.moduleId = this.moduleConstants.ID;
        this.remoteObjectName = this.moduleConstants.CONTEXT_REMOTE;
        this.remoteContextSource = this.setRemoteContextSource(remoteContextSource, true, false);
        this.remoteContext = this.setRemoteContext(this.remoteContextSource, this.remoteObjectName, true, false);
        this.get = this.getRemoteContext;
        this.update = this.updateRemoteContext;
        this.clear = this.clearRemoteContext;
        this.sync = this.syncState;
        
    }

    setRemoteContextSource(source, returnValue = false, setProperty = true) {
        if (!source) {
            throw new Error('Source must be provided');
        }
        if (source === this.remoteContextSource) {
            console.warn('Remote context source is the same as the current source, no changes made');
            return;
        }
        if (setProperty) {
            this.remoteContextSource = this.determineContextSource(source);
        }
        if (returnValue) {
            return this.determineContextSource(source);
        }
    }

    setRemoteContext (source, location, returnValue = false, setProperty = true) {
        if (!source || !location) {
            throw new Error('Source and location must be provided');
        }
        if (source[location] === undefined) {
            source[location] = {};
        }
        if (typeof source[location] !== 'object') {
            throw new Error('Source location must be an object');
        }
        if (source[location] === this.remoteContext) {
            console.warn('Remote context location is the same as the current location, no changes made');
            return;
        }
        if (setProperty) {
            this.remoteContext = source[location];
        }
        if (returnValue) {
            return source[location];
        }
    }
    
        determineContextSource(source) {
        if (typeof source !== 'string') {
            throw new Error('Remote context location must be a string');
        }
    
        switch (source) {
            case '':
                throw new Error('Remote context location cannot be an empty string');
            case 'game':
                return globalThis.game;
            case 'module':
                return this.getModule({
                    setProperty: true,
                    returnValue: true
                });
            case 'local':
                return globalThis.localStorage;
            case 'session':
                return globalThis.sessionStorage;
            case 'user':
                return globalThis.game.user;
            case 'world':
                return globalThis.game.world;
            case 'canvas':
                return globalThis.canvas;
            case 'ui':
                return globalThis.ui;
            default:
                return null;
        }
    }

    _getSpecificItem(item) {
        // Prefer .get() if it exists and is a function
        if (typeof this.remoteContext.get === 'function') {
            return this.remoteContext.get(item);
        }
        // Fallback to direct property access if remoteContext is an object
        else if (typeof this.remoteContext === 'object' && this.remoteContext !== null) {
            // Check if the property exists before accessing
            if (item in this.remoteContext) {
                return this.remoteContext[item];
            } else {
                // Item not found via direct access
                console.warn(`Item '${item}' not found in remote context via direct access.`);
                return undefined; // Or throw an error if preferred
            }
        } else {
            throw new Error(`Cannot retrieve item '${item}': Remote context does not have a .get() method and is not a standard object.`);
        }
    }

    _getWholeContext() {
        // Prefer .get() if it exists and is a function
        if (typeof this.remoteContext.get === 'function') {
            return this.remoteContext.get();
        }
        // Fallback to returning the object directly if it's an object
        else if (typeof this.remoteContext === 'object' && this.remoteContext !== null) {
            return this.remoteContext;
        } else {
            throw new Error('Cannot retrieve context: Remote context does not have a .get() method and is not a standard object.');
        }
    }

    getRemoteContext({item = null} = {}) {
        if (!this.remoteContext) {
            throw new Error('Remote context is not initialized.');
        }

        if (item !== null) {
            // Specific item requested
            if (typeof item !== 'string') {
                throw new Error('Item must be a string');
            }
            return this._getSpecificItem(item);
        } else {
            // No specific item requested, return the whole context
            return this._getWholeContext();
        }
    }

    updateRemoteContext(value, source = this.remoteContextSource, location = this.remoteObjectName) {
        if (source === undefined || location === undefined) {
            throw new Error('Source and location must be defined');
        }
        if (value === undefined) {
            throw new Error('Value cannot be undefined');
        }
        if (typeof value !== 'object' || value === null) { // Ensure value is an object
            throw new Error('Value must be an object');
        }
        // Check if the source requires a specific update method (like game.settings)
        // This example assumes direct assignment works or that the source object handles its own updates (like a Proxy or game.settings object reference)
        // A more robust solution might check the source type here.
        try {
            // Add/update the dateModified timestamp directly on the value being set
            const valueToSet = { ...value, dateModified: Date.now() };

            // Perform the update
            // For game.settings, this assumes 'source' is game.settings and 'location' is the module ID.
            // If location is actually the context object name within settings, this needs adjustment.
            // Assuming location is the top-level key (like moduleConstants.CONTEXT_REMOTE)
            if (source && typeof source.set === 'function' && location === this.moduleId) {
                 // Special handling potentially needed if source is game.settings and location is module ID
                 // game.settings.set(moduleId, settingKey, value)
                 // Here, the 'settingKey' would be this.remoteObjectName
                 console.warn("Attempting update via source.set - ensure 'location' is the correct key for the source.");
                 source.set(location, this.remoteObjectName, valueToSet); // Example if location=moduleId
            } else if (source && location) {
                 // Direct assignment (works for module objects, user flags, etc.)
                 source[location] = valueToSet;
            } else {
                 throw new Error('Invalid source or location for update.');
            }

            // Update the internal reference
            this.remoteContext = source[location];

        } catch (error) {
             console.error(`Failed to update remote context at location '${location}': ${error.message}`);
             throw error; // Re-throw after logging
        }
    }

    pushState(localState) { // Accept only the local state to push
        const validateArgs = () => {
            if (!this.remoteContext) { // Use 'this'
                throw new Error('Remote context is not defined');
            }
            if (localState === undefined) { // Check the passed parameter
                throw new Error('Local state is not defined');
            }
            // Ensure localState is an object for consistency with updateRemoteContext
            if (typeof localState !== 'object' || localState === null) {
                throw new Error('Local state must be an object.');
            }
        }

        try {
            validateArgs();
            // Use 'this' for source and location
            this.updateRemoteContext(localState, this.remoteContextSource, this.remoteObjectName);
            // updateRemoteContext already handles setting dateModified on this.remoteContext
        } catch (error) {
            console.error(error.message + '. State not pushed to remote context');
        }
    }

    // Accepts the local state object to update
    pullState(localState, overwriteLocal = false) {
        const remoteState = this.getRemoteContext(); // Get the current remote state

        const validateArgs = () => {
            if (remoteState === undefined) { // Check if remote state could be retrieved
                throw new Error('Remote state could not be retrieved');
            }
            if (localState === undefined) {
                throw new Error('Local state target object is not defined');
            }
             // Ensure localState is an object
            if (typeof localState !== 'object' || localState === null) {
                throw new Error('Local state target must be an object.');
            }
        }

        try {
            validateArgs();
            const stateToApply = remoteState || {}; // Use empty object if remoteState is null/undefined

            if (overwriteLocal) {
                // Clear local state first before assigning
                Object.keys(localState).forEach(key => delete localState[key]);
                Object.assign(localState, stateToApply);
            } else {
                // Merge remote state into local state
                Object.assign(localState, stateToApply);
            }
            // Update local state's timestamp
            if (typeof localState === 'object' && localState !== null) {
                 localState['dateModified'] = Date.now();
            }
        } catch (error) {
            console.error(error.message + '. State not pulled from remote context');
        }
    }

    // Clears the remote context
    clearRemoteContext() {
        try {
            if (!this.remoteContext) {
                 throw new Error('Remote context is not defined');
            }
            // Update the remote context to an empty object
            this.updateRemoteContext({}, this.remoteContextSource, this.remoteObjectName);
            // updateRemoteContext handles setting dateModified
        } catch (error) {
             console.error(error.message + '. Remote context not cleared');
        }
    }

    // Syncs based on dateModified, accepts the local state object
    syncState(localState) {
        try {
            const remoteState = this.getRemoteContext();

            if (localState === undefined || typeof localState !== 'object' || localState === null) {
                throw new Error('Valid local state object must be provided for sync');
            }
            if (remoteState === undefined || typeof remoteState !== 'object' || remoteState === null) {
                 // Cannot sync if remote state is invalid or inaccessible
                 console.warn('Remote state is invalid or inaccessible, cannot sync.');
                 return;
            }

            const remoteDate = remoteState.dateModified || 0; // Default to 0 if undefined
            const localDate = localState.dateModified || 0;  // Default to 0 if undefined

            if (remoteDate > localDate) {
                console.log('Remote state is newer, pulling.');
                this.pullState(localState, true); // Overwrite local with remote
            } else if (localDate > remoteDate) {
                console.log('Local state is newer, pushing.');
                this.pushState(localState); // Push local to remote
            } else {
                 console.log('Local and remote states are in sync or timestamps missing.');
            }
        } catch (error) {
            console.error(error.message + '. State not synced');
        }
    }

    /**
     * Updates a specific property within the remote context using a path.
     * This method fetches the current remote state, uses lodash/set to update the nested property,
     * sets the dateModified timestamp, and pushes the entire state back.
     *
     * @param {string} path - The dot-notation path to the property (e.g., 'data.key', 'flags.nested.flag').
     * @param {any} value - The new value for the property.
     * @throws {Error} If the path, value, or remote context is invalid.
     */
    updateRemoteProperty(path, value) {
        const validateArgs = () => {
            if (!this.remoteContext) {
                throw new Error('Remote context is not defined');
            }
            if (typeof path !== 'string' || path === '') {
                throw new Error('Path must be a non-empty string');
            }
             // Allow value to be null/undefined
        }

        try {
            validateArgs();
            // Get the current state
            const currentState = this.getRemoteContext() || {};
             if (typeof currentState !== 'object' || currentState === null) {
                 throw new Error('Cannot update property: Remote context is not a valid object.');
            }
            // Create a new object to avoid modifying the potentially cached currentState directly
            const newState = { ...currentState };

            // Use lodash set to update the property at the given path
            set(newState, path, value);

            // Update the timestamp on the root object
            newState.dateModified = Date.now();

            // Use updateRemoteContext to push the entire modified state back
            this.updateRemoteContext(newState, this.remoteContextSource, this.remoteObjectName);

        } catch (error) {
             console.error(`${error.message}. Property at path '${path}' not updated in remote context.`);
             // Optionally re-throw or handle differently
        }
    }
}

export default RemoteContextManager;
