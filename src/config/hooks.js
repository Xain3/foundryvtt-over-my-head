// ./config/hooks.js

import HOOKS_SETTINGS from "./hooksSettings.js";

/**
* A collection of hooks that are called by the module to trigger events inside or outside the module.
* 
* @type {Object}
* @property {string} updateEnabled - A hook that is called when the module is enabled or disabled.
* @property {string} updateDebugMode - A hook that is called when the module's debug mode is enabled or disabled.
*/
const OUT = {
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
}

/**
     * A collection of hooks that are called outside of the module that trigger module events.
     * Mostly for logging and debugging purposes.
     * 
     * @type {Object}
     * @property {string} logState - A hook that is called to log the module's state.
    */
const IN = {
    logState: "logState",
    logRemoteState: "logRemoteState",
    getRemoteState: "getRemoteState",
}


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
const BUILT_IN = {
        /**
         * A hook that is called when the module is ready.
        */
        ready: "ready",
    }


/**
 * A collection of hooks that can be used to trigger and listen to events.
 * 
 * @module config/hooks
 * @constant
 * @type {Object}
 * @property {Object} OUT - A collection of hooks that are called by the module to trigger events inside or outside the module.
 * @property {Object} IN - A collection of hooks that are called outside of the module that trigger module events.
 * @property {Object} BUILT_IN - A collection of built-in hooks that are used by the module.
 * @property {Object} SETTINGS - A collection of settings for the module.
 */
class HOOKS {
    static OUT = OUT;
    static IN = IN;
    static BUILT_IN = BUILT_IN;
    static SETTINGS = HOOKS_SETTINGS;

    static getMappings = () => {
        return {
            OUT: HOOKS.OUT,
            IN: HOOKS.IN,
            BUILT_IN: HOOKS.BUILT_IN,
        }
    }

    static getSettings = () => {
        return HOOKS.SETTINGS;
    }
};

export default HOOKS;