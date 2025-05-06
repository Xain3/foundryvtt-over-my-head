import { ContextContainer } from '@/baseClasses/contextUnits';
import LocalContextManager from '@/contexts/local';

/**
 * Provides a controlled interface for erasing values within the local context state
 * managed by a LocalContextManager.
 *
 * @param {ContextContainer} contextState - A reference to the main ContextContainer holding the state.
 * @param {LocalContextManager} manager - A reference to the managing LocalContextManager instance.
 * @throws {Error} If contextState is not a valid ContextContainer instance.
 * @throws {Error} If manager is not a valid LocalContextManager instance.
 */
class LocalContextEraser {
    #contextState; // Reference to the manager's context state container
    #manager;      // Reference to the LocalContextManager instance

    constructor(contextState, manager) {
        if (!(contextState instanceof ContextContainer)) {
            throw new Error("LocalContextEraser requires a valid ContextContainer instance for contextState.");
        }
        if (!manager || !(manager instanceof LocalContextManager)) {
            throw new Error("LocalContextEraser requires a valid LocalContextManager instance.");
        }
        this.#contextState = contextState;
        this.#manager = manager;
    }

    /**
     * Erases data from the context.
     * @param {string} key - The key or path to erase.
     * @param {'data'|'flags'|'settings'} [target='data'] - The section of the context to target.
     * @param {boolean} [timestamp=true] - Whether to update the manager's modified timestamp.
     * @returns {boolean} - True if data was found and erased, false otherwise.
     */
    erase(key, target = 'data', timestamp = true) {
        try {
            let targetKey;
            // Access manager's properties for target keys
            switch(target) {
                case 'data': targetKey = this.#manager.initialDataKey; break;
                case 'flags': targetKey = this.#manager.initialFlagsKey; break;
                case 'settings': targetKey = this.#manager.initialSettingsKey; break;
                default:
                    console.error(`[LocalContextEraser] Invalid target "${target}" for erase operation.`);
                    return false;
            }

            // Access contextState passed in constructor
            const targetContainer = this.#contextState.getKey(targetKey);
             if (!targetContainer || !(targetContainer instanceof ContextContainer)) {
                 console.error(`[LocalContextEraser] Target container "${targetKey}" not found or invalid.`);
                 return false;
            }

            const success = targetContainer.delete(key);

            if (success && timestamp) {
                // Update manager's modified timestamp directly
                this.#manager.updateModifiedTimestamp();
            }
            return success;

        } catch (error) {
            console.error(`[LocalContextEraser] Error erasing local context key "${key}" in target "${target}":`, error);
            return false;
        }
    }

    /**
     * Clears data from a specified part of the local context.
     *
     * @param {('data'|'flags'|'settings'|'all')} [target='data'] - Specifies which part of the context to clear.
     *   - 'data': Clears the data identified by `initialDataKey`.
     *   - 'flags': Clears the data identified by `initialFlagsKey`.
     *   - 'settings': Clears the data identified by `initialSettingsKey`.
     *   - 'all': Clears the entire context state.
     * @returns {boolean} `true` if the specified context part was successfully cleared, `false` otherwise (e.g., invalid target, target container not found, or internal error). Logs errors to the console on failure.
     */
    clear(target = 'data') {
        try {
            let targetKey;
            switch(target) {
                case 'data': targetKey = this.#manager.initialDataKey; break;
                case 'flags': targetKey = this.#manager.initialFlagsKey; break;
                case 'settings': targetKey = this.#manager.initialSettingsKey; break;
                case 'all': targetKey = this.#manager; break;
                default:
                    console.error(`[LocalContextEraser] Invalid target "${target}" for clear operation.`);
                    return false;
            }

            const targetContainer = (targetKey !== this.#contextState) ? this.#contextState.getKey(targetKey) : this.#contextState;
             if (!targetContainer || !(targetContainer instanceof ContextContainer)) {
                 console.error(`[LocalContextEraser] Target container "${targetKey}" not found or invalid.`);
                 return false;
            }

            targetContainer.clear();
            return true;

        } catch (error) {
            console.error(`[LocalContextEraser] Error clearing local context in target "${target}":`, error);
            return false;
        }
    }
}

export default LocalContextEraser;