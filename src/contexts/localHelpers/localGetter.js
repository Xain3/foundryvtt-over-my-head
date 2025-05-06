import _ from 'lodash';
import { ContextContainer, ContextProperty } from '@/baseClasses/contextUnits';

/**
 * Helper class responsible for retrieving data from the LocalContextManager's state.
 */
class LocalContextGetter {
    #contextState; // Reference to the manager's context state container
    #manager;      // Reference to the LocalContextManager instance

    /**
     * @param {ContextContainer} contextState - The main state container from LocalContextManager.
     * @param {LocalContextManager} manager - The instance of the LocalContextManager.
     */
    constructor(contextState, manager) {
        if (!(contextState instanceof ContextContainer)) {
            throw new Error("LocalContextGetter requires a valid ContextContainer instance for contextState.");
        }
        if (!manager) {
             throw new Error("LocalContextGetter requires a valid LocalContextManager instance.");
        }
        this.#contextState = contextState;
        this.#manager = manager;
    }

    // --- Private Helper Methods  ---

    #returnCopy(object, shallowCopy = false) {
        if (shallowCopy) {
            return _.clone(object); // Shallow copy using lodash
        } else {
            try {
                return structuredClone(object); // Deep copy using structuredClone
            } catch (e) {
                console.error("Deep copy failed using structuredClone, falling back to shallow copy:", e);
                return _.clone(object); // Fallback to shallow copy
            }
        }
    }

    #getContextValues(updateTimestamp = true, shallowCopy = false) {
        const contextValues = {};
        // Iterate over the main container keys ('data', 'flags', 'settings')
        for (const mainKey in this.#contextState.value) {
            this.#extractContainerValues(mainKey, contextValues);
        }

        if (updateTimestamp) {
            // Update the access timestamp of the main context state container
            this.#contextState.updateTimestamp(Date.now(), 'accessed');
            // Also update the manager's accessed timestamp via its method
            this.#manager.updateAccessedTimestamp(this.#contextState.getTimestamp('accessed'));
        }

        // Use the #returnCopy method from this class
        return shallowCopy ? this.#returnCopy(contextValues, true) : this.#returnCopy(contextValues, false);
    }

    #extractContainerValues(mainKey, contextValues) {
        // Access #contextState directly
        if (this.#contextState.value.hasOwnProperty(mainKey)) {
            const innerContainer = this.#contextState.value[mainKey];
            if (innerContainer instanceof ContextContainer) {
                contextValues[mainKey] = innerContainer.getContent(innerContainer.value, 'values');
            } else {
                console.warn(`Expected ContextContainer at key "${mainKey}", but found ${innerContainer?.constructor?.name}`);
                contextValues[mainKey] = innerContainer instanceof ContextProperty ? innerContainer.value : innerContainer;
            }
        }
    }

    #returnContainerInstance(updateTimestamp) {
        if (updateTimestamp) {
            this.#contextState.updateTimestamp(Date.now(), 'accessed');
            // Update manager's accessed timestamp via its method
            this.#manager.updateAccessedTimestamp(this.#contextState.getTimestamp('accessed'));
        }
        return this.#contextState; // Return the actual container instance
    }

    #getContext(updateTimestamp = true, copyMode = 'shallow') {
        switch (copyMode) {
            case 'deep':
                return this.#getContextValues(updateTimestamp, false);
            case 'shallow':
                return this.#getContextValues(updateTimestamp, true);
            case 'reference':
                return this.#returnContainerInstance(updateTimestamp);
            default:
                console.error(`Invalid copy mode "${copyMode}" specified. Defaulting to shallow copy.`);
                return this.#getContextValues(updateTimestamp, true);
        }
    }

    #getSpecificProperty(container, key, updateTimestamp) {
        let result;
        try {
            // Get specific ContextProperty, record access on the property itself
            const dataProperty = container.getKey(key, updateTimestamp); // Let getKey handle property access time
            if (dataProperty instanceof ContextProperty) {
                 // Get value without re-recording access, get modified time
                 result = { value: dataProperty.getValue(false), timestamp: dataProperty.getTimestamp('modified') };
                 if (updateTimestamp) {
                    // Update manager's accessed timestamp if property access was recorded
                    this.#manager.updateAccessedTimestamp();
                 }
            } else {
                console.warn(`Expected ContextProperty at key "${key}" in container, but found ${dataProperty?.constructor?.name}`);
                result = undefined;
            }
        } catch (error) {
            // console.warn(`Key "${key}" not found in container: ${error.message}`);
            result = undefined;
        }
        return result;
    }

    #getAllValues(container, updateTimestamp) {
        let result = container.getContent(container.value, 'values');
        if (updateTimestamp) {
            // Update access time on the container itself when getting all
            container.updateTimestamp(Date.now(), 'accessed');
            // Update manager's accessed timestamp
            this.#manager.updateAccessedTimestamp();
        }
        return result;
    }

    #getContainer(containerKey, key, updateTimestamp) {
        // Get the specific inner ContextContainer (e.g., 'data'), don't record access yet
        const container = this.#contextState.getKey(containerKey, false);
        if (!container || !(container instanceof ContextContainer)) {
            console.error(`Container "${containerKey}" not found or is not a ContextContainer.`);
            return undefined;
        }

        let result;
        if (key === null) {
            // Pass the container itself to #getAllValues
            result = this.#getAllValues(container, updateTimestamp);
        } else {
            // Pass the container itself to #getSpecificProperty
            result = this.#getSpecificProperty(container, key, updateTimestamp);
        }
        return result;
    }

    #getData(key, updateTimestamp = true) {
        // Use manager's property for the key name
        return this.#getContainer(this.#manager.initialDataKey, key, updateTimestamp);
    }

    
    #getFlags(key, updateTimestamp = true) {
        // Use manager's property for the key name
        return this.#getContainer(this.#manager.initialFlagsKey, key, updateTimestamp);
    }

    /**
     * Retrieves settings from context. If a key is provided, it retrieves the specific setting associated with that key.
     *
     * @private
     * @param {string} key - The key for which to retrieve settings. If null, retrieves all settings.
     * @param {boolean} [updateTimestamp=true] - Whether to update the timestamp when retrieving the settings.
     * @returns {*} The settings object or value associated with the given key.
     */
    #getSettings(key, updateTimestamp = true) {
        // Use manager's property for the key name
        return this.#getContainer(this.#manager.initialSettingsKey, key, updateTimestamp);
    }

    // --- Public Interface ---

    /**
     * Gets data from the context.
     * @param {string|null} [key=null] - The specific key to retrieve. If null, retrieves all items within the target. For target 'all', this parameter specifies the copyMode ('shallow', 'deep', 'reference').
     * @param {'data'|'flags'|'settings'|'all'} [target='data'] - The section of the context to target.
     * @param {boolean} [updateTimestamp=true] - Whether to update the accessed timestamp (both on the specific unit/container and the manager).
     * @returns {*} The requested value, object, or context container.
     */
    get(key = null, target = 'data', updateTimestamp = true) {
        switch (target) {
            case 'data':
                return this.#getData(key, updateTimestamp);
            case 'flags':
                return this.#getFlags(key, updateTimestamp);
            case 'settings':
                return this.#getSettings(key, updateTimestamp);
            case 'all':
                // When target is 'all', the 'key' parameter acts as the 'copyMode'
                const copyMode = (key === null || typeof key !== 'string' || !['shallow', 'deep', 'reference'].includes(key)) ? 'shallow' : key;
                return this.#getContext(updateTimestamp, copyMode);
            default:
                console.error(`Invalid target "${target}" specified.`);
                return undefined;
        }
    }
}

export default LocalContextGetter;