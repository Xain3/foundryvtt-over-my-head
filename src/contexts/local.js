// filepath: /mnt/shared/drive-personal/Documents/Programming/foundryvtt-over-my-head/src/contexts/local.js
import { ContextContainer, ContextProperty } from '@/baseClasses/contextUnits';
import Timestamp from '@/baseClasses/timestamp.js'; // Import Timestamp
import LocalContextGetter from './localHelpers/localGetter.js';
import LocalContextInitializer from './localHelpers/localInitializer.js';

class LocalContextManager {
    #contextState; // Private field to store context state
    #getter;       // Private field for the getter instance
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
        this.#contextState = this.#createNewContextState([initialDataKey, initialFlagsKey, initialSettingsKey]);

        // Create the getter instance, passing the state and the manager instance
        this.#getter = new LocalContextGetter(this.#contextState, this);

        // Create and use the initializer, passing state and manager instance
        this.initializer = new LocalContextInitializer(this.#contextState, this); // Updated instantiation

        // Initialize if requested
        if (initialize) this.initialize(this.initialData, this.initialFlags, this.initialSettings);
    }

    // --- Timestamp Management Methods ---
    /**
     * Updates the manager's accessed timestamp.
     * @param {number|Date} [timestamp=Date.now()] - The timestamp value.
     */
    updateAccessedTimestamp(timestamp = Date.now()) {
        this.#timestamps.updateTimestamp(timestamp, 'accessed');
    }

    /**
     * Updates the manager's modified timestamp.
     * @param {number|Date} [timestamp=Date.now()] - The timestamp value.
     */
    updateModifiedTimestamp(timestamp = Date.now()) {
        this.#timestamps.updateTimestamp(timestamp, 'modified');
    }

    /**
     * Gets a specific timestamp from the manager.
     * @param {'created'|'modified'|'accessed'} [mode='modified'] - The type of timestamp to retrieve.
     * @returns {Date} The requested timestamp Date object.
     */
    getTimestamp(mode = 'modified') {
        return this.#timestamps.getTimestamp(mode);
    }
    // --- End Timestamp Management Methods ---


    #createNewContextState(
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
            this.updateModifiedTimestamp(newContext.getTimestamp('created'));
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

    // --- Other Methods (initialize, set, erase, clear - remain here) ---

    initialize(initialData = {}, initialFlags = {}, initialSettings = {}, setContextTimestamp = true) {
        // Call initializer's method without passing state
        this.initializer.initialize(initialData, initialFlags, initialSettings);
        if (setContextTimestamp) {
            // Update manager's modified timestamp based on the state's modification time
            this.updateModifiedTimestamp(this.#contextState.getTimestamp('modified'));
        }
    }

    /**
     * Sets or updates data in the context.
     * Needs refinement based on ContextContainer/ContextProperty structure.
     * @param {string} key - The key or path (e.g., 'data.user.preferences') to set.
     * @param {*} value - The value to store.
     * @param {'data'|'flags'|'settings'} [target='data'] - The section of the context to target.
     * @returns {boolean} - True if the operation was successful.
     */
    set(key, value, target = 'data') {
       try {
            let targetKey;
            switch(target) {
                case 'data': targetKey = this.initialDataKey; break;
                case 'flags': targetKey = this.initialFlagsKey; break;
                case 'settings': targetKey = this.initialSettingsKey; break;
                default:
                    console.error(`Invalid target "${target}" for set operation.`);
                    return false;
            }

            const targetContainer = this.#contextState.getKey(targetKey);
            if (!targetContainer || !(targetContainer instanceof ContextContainer)) {
                 console.error(`Target container "${targetKey}" not found or invalid.`);
                 return false;
            }

            // Assuming key is a direct key within the target container for now
            // If key is a path like 'user.preferences', more complex logic is needed
            targetContainer.set(key, new ContextProperty({ value })); // Wrap value in ContextProperty

            // Update manager's modified timestamp using the state's modified time
            this.updateModifiedTimestamp(this.#contextState.getTimestamp('modified'));

            return true;
       } catch (error) {
            console.error(`Error setting local context key "${key}" in target "${target}":`, error);
            return false;
       }
    }

    /**
     * Erases data from the context.
     * Needs refinement based on ContextContainer/ContextProperty structure.
     * @param {string} key - The key or path (e.g., 'data.user.preferences') to erase.
     * @param {'data'|'flags'|'settings'} [target='data'] - The section of the context to target.
     * @returns {boolean} - True if data was found and erased, false otherwise.
     */
    erase(key, target = 'data') {
        try {
            let targetKey;
            switch(target) {
                case 'data': targetKey = this.initialDataKey; break;
                case 'flags': targetKey = this.initialFlagsKey; break;
                case 'settings': targetKey = this.initialSettingsKey; break;
                default:
                    console.error(`Invalid target "${target}" for erase operation.`);
                    return false;
            }
            const targetContainer = this.#contextState.getKey(targetKey);
             if (!targetContainer || !(targetContainer instanceof ContextContainer)) {
                 console.error(`Target container "${targetKey}" not found or invalid.`);
                 return false;
            }

            // Assuming key is direct for now. Use delete or similar on ContextContainer
            const success = targetContainer.delete(key); // Assuming ContextContainer has a delete method

            if (success) {
                // Update manager's modified timestamp using the state's modified time
                this.updateModifiedTimestamp(this.#contextState.getTimestamp('modified'));
            }
            return success;

        } catch (error) {
            console.error(`Error erasing local context key "${key}" in target "${target}":`, error);
            return false;
        }
    }

    /**
     * Clears the entire context by re-initializing the state.
     */
    clear() {
        console.log("Clearing local context...");
        // Re-create the state container
        this.#contextState = this.#createNewContextState(
            [this.initialDataKey, this.initialFlagsKey, this.initialSettingsKey],
            ContextContainer,
            ContextContainer,
            false // Don't update manager timestamp here, reset below
        );
        // Re-assign the new state to the getter AND initializer
        this.#getter = new LocalContextGetter(this.#contextState, this);
        this.initializer = new LocalContextInitializer(this.#contextState, this); // Re-create initializer with new state
        // Reset manager's timestamps
        this.#timestamps.resetTimestamps();
        console.log("Local context cleared.");
    }
}

export default LocalContextManager;

