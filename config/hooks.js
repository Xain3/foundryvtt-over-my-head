// ./config/hooks.js

/**
 * A collection of hooks that can be used to trigger and listen to events.
 * 
 * @module config/hooks
 * @constant
 * @type {Object}
 * @property {Object} out - A collection of hooks that are called by the module to trigger events inside or outside the module.
 * @property {Object} in - A collection of hooks that are called outside of the module that trigger module events.
 * @property {Object} builtIn - A collection of built-in hooks that are used by the module.
 */
export const HOOKS = {

    /**
     * A collection of hooks that are called by the module to trigger events inside or outside the module.
     * 
     * @type {Object}
     * @property {string} updateEnabled - A hook that is called when the module is enabled or disabled.
     * @property {string} updateDebugMode - A hook that is called when the module's debug mode is enabled or disabled.
    */
    out: {
        /**
         * A hook that is called when the module is enabled or disabled.
        */
        updateEnabled: "updateEnabled",
        
        /**
         * A hook that is called when the module's debug mode is enabled or disabled.
        */
        updateDebugMode: "updateDebugMode",

        /**
         * A hook that is called once the settings have been initialized.
        */
        settingsReady: "settingsReady",
    },

    /**
     * A collection of hooks that are called outside of the module that trigger module events.
     * Mostly for logging and debugging purposes.
     * 
     * @type {Object}
     * @property {string} logState - A hook that is called to log the module's state.
    */
    in: {
        logState: "logState",
    },

    /**
     * A collection of built-in hooks that are used by the module.
     * Built-in hooks always be called, regardless of if they are defined here or not.
     * This collection is used mostly to document the built-in hooks that are used by the module or 
     * to create aliases for the built-in hooks.
     * 
     * 
     * @type {Object}
     * @property {string} ready - A hook that is called when the module is ready.
    */
    builtIn: {
        /**
         * A hook that is called when the module is ready.
        */
        ready: "ready",
    }
};