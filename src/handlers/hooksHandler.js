// Dependencies
import Handler from "../baseClasses/handler.js";
/**
 * A class that handles Foundry VTT hook registrations and calls.
 * Wraps the global Hooks system while providing validation and hook name building.
 * @extends Handler
*/
class HooksHandler extends Handler {
    /**
     * Creates a new HooksHandler instance.
     * @param {Object} config - Configuration object containing hooks definitions
     * @param {Object} context - Context object for the handler
     * @param {Object} utils - Utility functions available to the handler
    */
    constructor(config, context, utils) {
        super(config, context, utils);
        this.hooks = this.config.HOOKS;
        this.globalHooks = globalThis.Hooks;
    }

    /**
     * Registers a persistent hook event listener.
     * @param {string} hookName - The name of the hook to register
     * @param {string} [hookGroup=BUILT_IN] - The group the hook belongs to
     * @param {...any} args - Arguments to pass to the hook registration
     * @returns {number} The ID of the registered hook
     * @throws {Error} If the specified hook does not exist
     */
    on(hookName, hookGroup = BUILT_IN, ...args) {
        let hook = this.hooks.buildHook(hookName, hookGroup);
        if (!hook) {
            throw new Error(`Hook ${hookName} does not exist`);
        }
        return this.globalHooks.on(hook, ...args);
    }

    /**
     * Registers a one-time hook event listener that is automatically removed after being triggered.
     * @param {string} hookName - The name of the hook to register
     * @param {string} [hookGroup=BUILT_IN] - The group the hook belongs to
     * @param {...any} args - Arguments to pass to the hook registration
     * @returns {number} The ID of the registered hook
     * @throws {Error} If the specified hook does not exist
     */
    once(hookName, hookGroup = BUILT_IN, ...args) {
        let hook = this.hooks.buildHook(hookName, hookGroup);
        if (!hook) {
            throw new Error(`Hook ${hookName} does not exist`);
        }
        return this.globalHooks.once(hook, ...args);
    }

    /**
     * Calls all registered listeners for a hook in sequence.
     * @param {string} hookName - The name of the hook to call
     * @param {string} [hookGroup=BUILT_IN] - The group the hook belongs to
     * @param {...any} args - Arguments to pass to the hook listeners
     * @returns {boolean} Whether all hook listeners executed without interruption
     * @throws {Error} If the specified hook does not exist
     */
    callAll(hookName, hookGroup = BUILT_IN, ...args) {
        let hook = this.hooks.buildHook(hookName, hookGroup);
        if (!hook) {
            throw new Error(`Hook ${hookName} does not exist`);
        }
        return this.globalHooks.callAll(hook, ...args);
    }
}
    
export default HooksHandler;