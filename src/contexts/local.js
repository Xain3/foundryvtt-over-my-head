// filepath: /mnt/shared/drive-personal/Documents/Programming/foundryvtt-over-my-head/src/contexts/local.js
import { ContextContainer, ContextProperty } from '@/baseClasses/contextUnits';
import { getProperty, setProperty, deleteProperty } from '../utils/utils'; // Assuming utils exist for deep object manipulation

const DEFAULT_KEYS = [
    'data',
    'flags',
    'settings',
];

class LocalContextManager {
    #contextState; // Private field to store context { key: { value: data, timestamp: ms } }

    constructor({ 
        initialData = {},
        defaultKeys = DEFAULT_KEYS,
        initialize = true,
        contextTimestamp = Date.now(),
        contextName = 'local',
     } = {}) {
        this.createdTimestamp = contextTimestamp;
        this.contextTimestamp = contextTimestamp;
        this.contextName = contextName;
        this.#contextState = this.createNewContextState(defaultKeys);
        if (initialize) this.initialize(initialData);
    }

    createNewContextState(keys, containerType = ContextContainer, objectType = ContextContainer, setContextTimestamp = true) {
        let value;
        const newContext = new containerType();
        for (const key of keys) {
            value = new objectType();
            newContext.set(key, value);
        }
        if (setContextTimestamp) {
            this.contextTimestamp = Date.now();
        }
        return newContext;

    }
  
    initializeData(initialData = {}, containerKey = 'data', objectType = ContextProperty, setContextTimestamp = true) {
        const container = this.#contextState.get(containerKey);
        if (!container) {
            console.error(`Container "${containerKey}" not found in context state.`);
            return;
        }
        for (const key in initialData) {
            if (Object.hasOwnProperty.call(initialData, key)) {
                const value = initialData[key];
                container.set(key, new objectType(value));
            }
        }
        if (setContextTimestamp) {
            this.contextTimestamp = Date.now();
        }
    }

    /**
     * Retrieves data from the context.
     * @param {string} key - The key or path (e.g., 'user.preferences') to retrieve.
     * @returns {{value: any, timestamp: number}|undefined} - The data and timestamp, or undefined if not found.
     */
    get(key) {
        const dataEntry = getProperty(this.#contextState, key);
        // Optionally update a 'lastAccessed' timestamp if needed, separate from modification timestamp
        // if (dataEntry) { dataEntry.lastAccessed = Date.now(); }
        return dataEntry;
    }

    /**
     * Retrieves the entire context object containing values only.
     * @returns {object} - A deep copy of the context values.
     */
    getContext() {
        const contextValues = {};
        for (const key in this.#contextState) {
            if (Object.hasOwnProperty.call(this.#contextState, key)) {
                // Simple copy for top-level; use deep copy if nested objects need isolation
                 setProperty(contextValues, key, this.#contextState[key].value);
            }
        }
        return contextValues; // Consider using structuredClone for deep copy if needed
    }


    /**
     * Sets or updates data in the context.
     * @param {string} key - The key or path (e.g., 'user.preferences') to set.
     * @param {*} value - The value to store.
     * @returns {boolean} - True if the operation was successful.
     */
    set(key, value) {
       try {
            setProperty(this.#contextState, key, { value: value, timestamp: Date.now() });
            return true;
       } catch (error) {
            console.error(`Error setting local context key "${key}":`, error);
            return false;
       }
    }

    /**
     * Erases data from the context.
     * @param {string} key - The key or path (e.g., 'user.preferences') to erase.
     * @returns {boolean} - True if data was found and erased, false otherwise.
     */
    erase(key) {
        return deleteProperty(this.#contextState, key);
    }

    /**
     * Clears the entire context.
     */
    clear() {
        this.#contextState = {};
        console.log("Local context cleared.");
    }
}

export default LocalContextManager;

