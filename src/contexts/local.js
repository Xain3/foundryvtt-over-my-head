// filepath: /mnt/shared/drive-personal/Documents/Programming/foundryvtt-over-my-head/src/contexts/local.js
import { ContextContainer, ContextProperty } from '@/baseClasses/contextUnits';
import Timestamp from '@/baseClasses/timestamp.js'; // Import Timestamp
import LocalContextGetter from './localHelpers/localGetter.js';
import LocalContextSetter from './localHelpers/localSetter.js';
import LocalContextInitializer from './localHelpers/localInitializer.js';
import LocalContextEraser from './localHelpers/localEraser.js'; // Import the new eraser

/**
 * Manages a local context state, organizing data into distinct sections like 'data', 'flags', and 'settings'.
 * This class acts as a central hub, delegating operations like getting, setting, erasing, and initializing
 * context data to specialized helper classes (LocalContextGetter, LocalContextSetter, LocalContextEraser, LocalContextInitializer).
 * It also maintains timestamps (created, modified, accessed) for the context itself.
 *
 * The context state is stored internally in a `ContextContainer` instance, which in turn holds separate
 * `ContextContainer` instances for data, flags, and settings.
 *
 * @class LocalContextManager
 * @param {object} [options={}] - Configuration options for the context manager.
 * @param {object} [options.initialValues={data: {}, flags: {}, settings: {}}] - An object containing initial values for data, flags, and settings.
 * @param {object} [options.initialData] - Specific initial data. Overrides `initialValues.data` if provided.
 * @param {object} [options.initialFlags] - Specific initial flags. Overrides `initialValues.flags` if provided.
 * @param {object} [options.initialSettings] - Specific initial settings. Overrides `initialValues.settings` if provided.
 * @param {string} [options.initialDataKey='data'] - The key used to access the data section within the context state.
 * @param {string} [options.initialFlagsKey='flags'] - The key used to access the flags section within the context state.
 * @param {string} [options.initialSettingsKey='settings'] - The key used to access the settings section within the context state.
 * @param {boolean} [options.initialize=true] - Whether to automatically initialize the context with initial values upon construction.
 * @param {number|Date} [options.contextTimestamp=Date.now()] - The initial timestamp value to set for the context (used for created, modified, accessed initially).
 * @param {string} [options.contextName='local'] - A name identifier for this context instance.
 */
class LocalContextManager {
    #contextState; // Private field to store context state
    #getter;       // Private field for the getter instance
    #setter;       // Private field for the setter instance
    #initializer;  // Private field for the initializer instance
    #eraser;       // Private field for the eraser instance
    #timestamps;   // Private field for Timestamp instance

    // Public properties accessed by the getter
    initialDataKey;
    initialFlagsKey;
    initialSettingsKey;
    // removed accessedTimestamp

    constructor({
        initialValues = {data: {}, flags: {}, settings: {}},
        initialData = undefined,
        initialFlags = undefined,
        initialSettings = undefined,
        initialDataKey = 'data',
        initialFlagsKey = 'flags',
        initialSettingsKey = 'settings',
        initialize = true,
        contextTimestamp = Date.now(), // Keep parameter name for backward compatibility
        contextName = 'local',
     } = {}) {
        // Initialize the timestamps using the Timestamp class
        this.#timestamps = new Timestamp();
        if (typeof contextTimestamp === 'number') {
            this.#timestamps.setTimestamp('all', contextTimestamp);
        }

        // Assign public properties needed by the getter and the initializer
        this.initialDataKey = initialDataKey;
        this.initialFlagsKey = initialFlagsKey;
        this.initialSettingsKey = initialSettingsKey;

        this.initialValues = initialValues;
        this.initialData = initialData || initialValues.data;
        this.initialFlags = initialFlags || initialValues.flags;
        this.initialSettings = initialSettings || initialValues.settings;

        // Other properties
        this.contextName = contextName;

        // Create the main state container *first*
        this.#contextState = this.createNewContextState([initialDataKey, initialFlagsKey, initialSettingsKey]);

        // Create the getter instance, passing the state and the manager instance
        this.#getter = new LocalContextGetter(this.#contextState, this);

        // Create the setter instance, passing the state and the manager instance
        this.#setter = new LocalContextSetter(this.#contextState, this);

        // Create the eraser instance, passing the state and the manager instance
        this.#eraser = new LocalContextEraser(this.#contextState, this); // Instantiate the eraser

        // Create and use the initializer, passing state and manager instance
        this.#initializer = new LocalContextInitializer(this.#contextState, this);

        // Initialize if requested
        if (initialize) this.initialize(this.initialData, this.initialFlags, this.initialSettings);
    }

    // --- Timestamp Accessor ---
    /**
     * Provides access to the internal Timestamp instance.
     * @returns {Timestamp} The Timestamp instance managing created, modified, and accessed times.
     */
    get timestamps() {
        return this.#timestamps;
    }
    // --- End Timestamp Accessor ---


    /**
     * Creates a new context container and populates it with inner containers for specified keys.
     * Optionally updates the managing object's modified timestamp based on the new container's creation time.
     *
     * @param {Array<string>} keys - An array of keys for which to create inner containers within the main context.
     * @param {Function} [containerType=ContextContainer] - The constructor function/class to use for the main context container. Defaults to ContextContainer.
     * @param {Function} [objectType=ContextContainer] - The constructor function/class to use for the inner containers (e.g., data, flags, settings). Defaults to ContextContainer.
     * @param {boolean} [setContextTimestamp=true] - If true, updates the manager's modified timestamp using the creation timestamp of the new main container.
     * @returns {ContextContainer} An instance of the specified `containerType`, populated with inner containers and configured with 'keep' timestamp behavior for manual management.
     */
    createNewContextState(
        keys,
        containerType = ContextContainer,
        objectType = ContextContainer, // Inner containers are also ContextContainers
        setContextTimestamp = true // Renamed for clarity, still controls manager timestamp update
    ) {
        const newContext = new containerType({ timestampBehavior: 'keep' }); // Main container timestamp managed manually
        for (const key of keys) {
            // Create inner containers (data, flags, settings)
            const innerContainer = new objectType({ timestampBehavior: 'keep' });
            newContext.set(key, innerContainer);
        }
        if (setContextTimestamp) {
            // Use the container's creation time to set the manager's modified time
            this.#timestamps.updateTimestamp(newContext.getTimestamp('created'), 'modified');
        }
        return newContext;
    }

    // --- Getter Method (Delegates to the helper) ---

    /**
     * Gets data from the context. Delegates to the LocalContextGetter.
     * @param {string|null} [key=null] - The specific key to retrieve. If null, retrieves all items within the target. For target 'all', this parameter specifies the copyMode ('shallow', 'deep', 'reference').
     * @param {'data'|'flags'|'settings'|'all'} [target='data'] - The section of the context to target.
     * @param {boolean} [updateTimestamp=true] - Whether to update the accessed timestamp.
     * @returns {*} The requested value, object, or context container.
     */
    get(key = null, target = 'data', updateTimestamp = true) {
        // Delegate the call to the getter instance
        return this.#getter.get(key, target, updateTimestamp);
    }

    // --- Initializer Method (Delegates to the helper) ---

    /**
     * Initializes the context with provided data, flags, and settings.
     * It delegates the core initialization logic to an internal initializer object
     * and optionally updates the manager's modified timestamp based on the context's state.
     *
     * @param {object} [initialData={}] - The initial data to set for the context.
     * @param {object} [initialFlags={}] - The initial flags to set for the context.
     * @param {object} [initialSettings={}] - The initial settings to set for the context.
     * @param {boolean} [setContextTimestamp=true] - Whether to update the manager's modified timestamp
     *                                               based on the context state's modification time after initialization.
     * @returns {void}
     */
    initialize(initialData = {}, initialFlags = {}, initialSettings = {}, setContextTimestamp = true) {
        // Call initializer's method without passing state
        this.#initializer.initialize(initialData, initialFlags, initialSettings);
        if (setContextTimestamp) {
            // Update manager's modified timestamp based on the state's modification time
            this.#timestamps.updateTimestamp(this.#contextState.getTimestamp('modified'), 'modified');
        }
    }

    // --- Setter Method (Delegates to the helper) ---

    /**
     * Sets or updates data in the context.
     * Needs refinement based on ContextContainer/ContextProperty structure.
     * @param {string} key - The key or path (e.g., 'data.user.preferences') to set.
     * @param {*} value - The value to store.
     * @param {'data'|'flags'|'settings'} [target='data'] - The section of the context to target.
     * @returns {boolean} - True if the operation was successful.
     */
    set(key, value, target = 'data', behavior = 'set') {
        try{
            this.#setter.set(key, value, { target, behavior });
            return true;
        } catch (error) {
            console.error(`Error setting local context key "${key}" in target "${target}":`, error);
            return false;
        }
    }

    // --- Eraser Method (Delegates to the helper) ---

    /**
     * Erases data from the context. Delegates to the LocalContextEraser.
     * @param {string} key - The key or path (e.g., 'data.user.preferences') to erase.
     * @param {'data'|'flags'|'settings'} [target='data'] - The section of the context to target.
     * @param {boolean} [timestamp=true] - Whether to update the manager's modified timestamp.
     * @returns {boolean} - True if data was found and erased, false otherwise.
     */
    erase(key, target = 'data', timestamp = true) {
        // Delegate the call to the eraser instance
        return this.#eraser.erase(key, target, timestamp);
    }

    /**
     * Clears the context state, delegating to the internal context state manager.
     *
     * @param {('data'|'flags'|'settings'|'all')} [target='all'] - Specifies which part of the context to clear. 
     * Defaults to clearing everything ('all').
     * @returns {*} The result returned by the internal `#contextState.clear` method.
     */
    clear(target = 'all') {
        return this.#contextState.clear(target);
    }

    // --- Other Methods ---

    /**
     * Resets the entire context by re-initializing the state.
     */
    reset() {
        console.log("Resetting local context...");
        // Re-create the state container
        this.#contextState = this.createNewContextState(
            [this.initialDataKey, this.initialFlagsKey, this.initialSettingsKey],
            ContextContainer,
            ContextContainer,
            false // Don't update manager timestamp here, reset below
        );
        // Re-assign the new state to the helpers that depend on it
        // Note: We need to recreate helpers that hold a reference to the *old* state.
        this.#getter = new LocalContextGetter(this.#contextState, this);
        this.#setter = new LocalContextSetter(this.#contextState, this); // Recreate setter with new state
        this.#eraser = new LocalContextEraser(this.#contextState, this); // Recreate eraser with new state
        this.#initializer = new LocalContextInitializer(this.#contextState, this); // Recreate initializer with new state

        // Reset manager's timestamps
        this.#timestamps.resetTimestamps();
        console.log("Local context reset.");
    }
}

export default LocalContextManager;

