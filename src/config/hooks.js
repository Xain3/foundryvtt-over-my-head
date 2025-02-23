// POSSIBLY DEPRECATED - Check for redundancy with the base HookRegistry class

// ./config/hooks.jss

import HooksRegistry from "../baseClasses/hooksRegistry.js";
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



const hookCollection = {
    OUT: OUT,
    IN: IN,
    BUILT_IN: BUILT_IN,
}


export function setUpHooks(collection = hookCollection, settings = HOOKS_SETTINGS) {
    return new HooksRegistry(collection, settings);
}

/**
 * An object containing the module's hooks.
 * 
 * @type {HooksRegistry}
 * 
 * @property {Object} out - A collection of hooks that are called by the module to trigger events inside or outside the module.
 * @property {Object} in - A collection of hooks that are called outside of the module that trigger module events.
 * @property {Object} builtIn - A collection of built-in hooks that are used by the module.
 * @property {Object} settings - A collection of settings for the module.
 * @property {string} prefix - The prefix for the module's hooks.
 */
const HOOKS = setUpHooks();

export default HOOKS;