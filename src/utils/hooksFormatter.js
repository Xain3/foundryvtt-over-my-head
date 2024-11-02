/**
 * HookFormatter class to format hook names based on group and mappings.
 */
export class HookFormatter {
    /**
     * Creates an instance of HookFormatter.
     *
     * @param {Object} hookMappings - An object containing mappings of hook groups to their respective hooks.
     * @param {string} [prefix=""] - An optional prefix to prepend to the formatted hook name.
     * @throws {Error} If hookMappings are not provided.
     */
    constructor(hookMappings, prefix = "", noPrefixGroups, allowedGroups) {
        if (!hookMappings) {
            throw new Error("Hook mappings are required.");
        }
        this.hookMappings = hookMappings;
        this.prefix = prefix;
        this.noPrefixGroups = noPrefixGroups;
        this.allowedGroups = allowedGroups;
    }

    /**
     * Formats a hook name based on the provided hook group.
     *
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
        const currentHookGroup = this.hookMappings[hookGroup];
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
}