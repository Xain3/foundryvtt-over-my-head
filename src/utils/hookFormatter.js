// ./src/utils/hookFormatter.js

/**
 * HookFormatter class to format hook names based on group and mappings.
 * Requires CONFIG to be passed in the constructor.
 * 
 * @class HookFormatter
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
class HookFormatter {
    /**
     * Creates an instance of HookFormatter.
     *
     * @param {Object} CONFIG - The configuration object.
     */
    constructor(CONFIG) {
        // Remove the SETTINGS group from hookMappings if it exists
        this.mappings = CONFIG.HOOKS.getMappings();
        this.SETTINGS = CONFIG.HOOKS.getSettings();
        this.prefix = CONFIG.CONST.MODULE.SHORT_NAME;
        this.noPrefixGroups = CONFIG.HOOKS.SETTINGS.NO_PREFIX_GROUPS;
        this.allowedGroups = CONFIG.HOOKS.SETTINGS.ALLOWED_GROUPS;
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
            throw new Error(`Hook location for group ${hookGroup} is not an object.`);  
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

    updateConfig(config) {
    this.mappings = config.HOOKS.getMappings();
    this.SETTINGS = config.HOOKS.getSettings();
    this.prefix = config.CONST.MODULE.SHORT_NAME;
    this.noPrefixGroups = config.HOOKS.SETTINGS.NO_PREFIX_GROUPS;
    this.allowedGroups = config.HOOKS.SETTINGS.ALLOWED_GROUPS;
    }

}

export default HookFormatter;