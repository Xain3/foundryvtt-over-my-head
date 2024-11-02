import CONST from "./constants.js";
import { HookFormatter } from "../src/utils/hooksFormatter.js";
import { HOOKS } from "./hooks.js";
import Settings from "./settings.js";

const hooksFormatter = (hooks, shortName, noPrefixGroups, allowedGroups, ) => new HookFormatter(hooks, shortName, noPrefixGroups, allowedGroups); // HookFormatter class
const settingsClass = (moduleName, debugMode, formatHook) => new Settings(moduleName, debugMode, formatHook); // Settings class

class ModuleConfig {
    // Module constants
    static MODULE = {...CONST.MODULE}
    
    // Debug mode default value
    static DEBUG = {...CONST.DEBUG};  // Debug mode default value
    
    // Hooks settings
    static HOOKS = {...HOOKS} // Custom hooks to be registered on Foundry VTT and mappings of default hooks
    static HOOKS_SETTINGS = {...CONST.HOOKS}; // Hooks settings
    // Formats a hook name based on the provided hook group.
    static formatHook(hookName, hookGroup = this.HOOKS_SETTINGS.DEFAULT_GROUP) {
         return hooksFormatter(
            this.HOOKS, 
            this.MODULE.SHORT_NAME, 
            this.HOOKS_SETTINGS.NO_PREFIX_GROUPS, 
            this.HOOKS_SETTINGS.ALLOWED_GROUPS
         )
         .formatHook(hookName, hookGroup); 
        }
    
    // Settings to be registered on Foundry VTT
    static SETTINGS = settingsClass(this.MODULE.NAME, this.DEBUG.DEBUG_MODE, this.formatHook).SETTINGS;   
}

export default ModuleConfig;