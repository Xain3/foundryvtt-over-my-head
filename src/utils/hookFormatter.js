// ./src/utils/hookFormatter.js

import Utility from '../baseClasses/utility.js';

/**
 * HookFormatter class to format hook names based on group and mappings.
 * Requires CONFIG to be passed in the constructor.
 * 
 * @class HookFormatter
 * @extends Utility
 * @module HookFormatter
 * @export HookFormatter
 * @property {Object} hookMappings - The module hooks.
 * @property {Object} SETTINGS - The hook settings.
 * @property {string} prefix - The module prefix.
 * @property {Array} noPrefixGroups - The groups that do not require a prefix.
 * @property {Array} allowedGroups - The allowed groups.
 *
 * @method formatHook
 */
class HookFormatter extends Utility {
    /**
     * Creates an instance of HookFormatter.
     *
     * @param {Object} CONFIG - The configuration object.
     */
    constructor(CONFIG) {
        super(CONFIG);
        // Remove the SETTINGS group from hookMappings if it exists
        this.mappings = this.config.HOOKS.getMappings();
        this.SETTINGS = this.config.HOOKS.getSettings();
        this.prefix = this.moduleConstants.SHORT_NAME;
        this.noPrefixGroups = this.SETTINGS.NO_PREFIX_GROUPS;
        this.allowedGroups = this.SETTINGS.ALLOWED_GROUPS;
    }

    /**
     * Formats a hook name based on the provided hook group.
     *
     * @method formatHook
     * @param {string} hookName - The name of the hook to format.
     * @param {string} hookGroup - The group to which the hook belongs.
     * @returns {string} The formatted hook name.
     * @throws {Error} If hookGroup or hookName are not provided or if the hookGroup is not allowed.
     */
    formatHook(hookName, hookGroup) {
        // Validate inputs
        if (!hookGroup) {
            throw new Error("Hook group is required.");
        }
        if (!this.allowedGroups.includes(hookGroup)) {
            throw new Error(`Hook group ${hookGroup} is not allowed.`);
        }
        if (!hookName) {
            throw new Error("Hook name is required.");
        }

        // Get the hook location
        const currentHookGroup = this.mappings[hookGroup];
        if (!currentHookGroup) {
            throw new Error(`Hook location for group ${hookGroup} not found.`);
        }
        if (typeof currentHookGroup !== "object") {
            throw new Error(`Hook location for group ${hookGroup} is not an object but a ${typeof currentHookGroup}.`);  
        }

        // Check if the hook group does not require a prefix
        if (this.noPrefixGroups.includes(hookGroup)) {
            if (hookName in currentHookGroup) {
                return currentHookGroup[hookName];
            } else {
                return hookName;
            }
        }

        // If the hook group requires a prefix, prepend the prefix to the hook name
        const hook = currentHookGroup[hookName];
        if (!hook) {
            throw new Error(`Hook ${hookName} not found in group ${hookGroup}.`);
        }

        const formattedHook = `${this.prefix}${hook}`;
        return formattedHook;
    }

    /**
     * Updates the configuration for the hook formatter.
     *
     * @override
     * @param {Object} config - The configuration object.
     * @param {Object} config.HOOKS - The hooks configuration.
     * @param {Function} config.HOOKS.getMappings - Function to get hook mappings.
     * @param {Function} config.HOOKS.getSettings - Function to get hook settings.
     * @param {Object} config.CONSTANTS - The constants configuration.
     * @param {Object} config.CONSTANTS.MODULE - The module constants.
     * @param {string} config.CONSTANTS.MODULE.SHORT_NAME - The short name of the module.
     * @param {Object} config.HOOKS.SETTINGS - The settings for hooks.
     * @param {Array} config.HOOKS.SETTINGS.NO_PREFIX_GROUPS - Groups that do not require a prefix.
     * @param {Array} config.HOOKS.SETTINGS.ALLOWED_GROUPS - Groups that are allowed.
     */
    updateConfig(config) {
    this.mappings = config.HOOKS.getMappings();
    this.SETTINGS = config.HOOKS.getSettings();
    this.prefix = config.CONSTANTS.MODULE.SHORT_NAME;
    this.noPrefixGroups = config.HOOKS.SETTINGS.NO_PREFIX_GROUPS;
    this.allowedGroups = config.HOOKS.SETTINGS.ALLOWED_GROUPS;
    }

}

export default HookFormatter;