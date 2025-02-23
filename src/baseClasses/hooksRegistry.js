// ./src/baseClasses/hooks.js

/**
 * Class representing a Hooks Registry Getter.
 * The Hooks Registry Getter is used to get mappings and settings.
 */
export class HooksRegistryGetter {
    /**
     * Create a HooksRegistryGetter.
     * @param {Object} hookSettings - The settings object for hooks.
     */
    constructor(hooksSettings, hookRegistry, moduleShortName = "OverMyHead") {
        this.settings = hooksSettings;
        this.registry = hookRegistry;
        this.moduleShortName = moduleShortName;
    }

    #checkStandardGroups(groups = this.registry) {
        // Standard hook groups are checked both in camelCase and UPPER_CASE
        if (groups.out && groups.in && groups.builtIn) {
            return {
            OUT: groups.out,
            IN: groups.in,
            BUILT_IN: groups.builtIn,
            }
        } else if (groups.OUT && groups.IN && groups.BUILT_IN) {
            return {
            OUT: groups.OUT,
            IN: groups.IN,
            BUILT_IN: groups.BUILT_IN,
            }
        } else {
            return null;
        }
    }

    #parseMappings(allowNonStandard, standardGroupsChecker = this.#checkStandardGroups) {
        // Check for standard hook groups
        let standardGroups = standardGroupsChecker(this.registry);
        if (standardGroups) {
            console.debug(`${this.moduleShortName} | Standard hook groups detected.`);
            return standardGroups;
        } else if (allowNonStandard) {
            console.warn(`${this.moduleShortName} | Nonstandard hook groups detected. Retrieving mappings.`);
            // Return all groups if nonstandard hook groups are allowed
            return this.registry;
        } else {
            // Log an error if nonstandard hook groups are detected and not allowed
            let errorMessage = `${this.moduleShortName} | Nonstandard hook groups detected. Unable to retrieve mappings.`;
            console.error(errorMessage);
            return {};
    }
    }


    /**
     * Get the mappings for the hooks.
     * @returns {Object} The mappings for the hooks.
     * @throws Will throw an error if nonstandard hook groups are detected.
     */
    mappings = (allowNonStandard = false) => {
        try {
            if (this.throwError) {
                // Throw an error for testing purposes
                throw new Error("Error thrown for testing purposes.");
            }
            // Return the mappings
            return this.#parseMappings(allowNonStandard)
        } catch (err) {
            // Log an error if an error occurs
            let errorMessage = `${this.moduleShortName} | Unable to retrieve mappings. ${err}`;
            console.error(errorMessage);
            return {};
        }
    }

    /**
     * Processes an array of hook candidates based on the specified mode.
     *
     * @param {Array} hookCandidates - An array of hook candidates.
     * @param {string} mode - The mode to determine which hook candidate(s) to return. 
     *                        Can be "all", "first", or "last".
     * @returns {Array|null|any} - Returns the appropriate hook candidate(s) based on the mode:
     *                             - If the array is empty, returns null.
     *                             - If the array has one element, returns that element.
     *                             - If the mode is "all", returns the entire array.
     *                             - If the mode is "first", returns the first element.
     *                             - If the mode is "last", returns the last element.
     *                             - If the mode is unrecognized, returns null.
     */
    hookCandidates = (hookCandidates, mode) => {
        switch (hookCandidates.length) {
            case 0:
                return null;
            case 1:
                return hookCandidates[0];
            default:
                switch (mode) {
                    case "all":
                        return hookCandidates;
                    case "first":
                        return hookCandidates[0];
                    case "last":
                        return hookCandidates[hookCandidates.length - 1];
                    default:
                        return null;
                }
        }
    }

    /**
     * Retrieves a hook based on the provided parameters.
     *
     * @param {string} hook - The name of the hook to retrieve.
     * @param {string} [hookGroup] - The group to which the hook belongs. If not provided, all groups are searched.
     * @param {string} [selectionMode="all"] - The mode to use when retrieving hook candidates.
     * @param {boolean} [forceArray=false] - Whether to force the output to be an array.
     * @param {string} [returnMode="group.name"] - The format of the returned hook. Can be "group.name", "name", "group", or "object".
     * @returns {string|string[]|object|null} - The formatted hook(s) based on the provided parameters, or null if no hook is found.
     */
    hook = (hook, hookGroup, selectionMode = "all", forceArray = false, returnMode = "group.name", allowNonStandard = false) => {
        /**
         * Formats the hook based on the return mode.
         * 
         * @param {string} grp - The group of the hook.
         * @param {string} name - The name of the hook.
         * @returns {string|object} - The formatted hook.
         */
        
        let output;
        let hooks = this.mappings(allowNonStandard);
        if (!hookGroup) {
            let matchedHooks = [];
            for (let grp in hooks) {
                if (hooks[grp][hook]) {
                    matchedHooks.push(formatOutput(grp, hook, returnMode));
                }
            }
            output = this.hookCandidates(matchedHooks, selectionMode);
            if (!Array.isArray(output) && forceArray) {
                output = [output];
            }
            return output;
        }
        if (hookGroup && this.registry[hookGroup] && this.registry[hookGroup][hook]) {
            output = formatOutput(hookGroup, hook, returnMode);
            if (!Array.isArray(output) && forceArray) {
                output = [output];
            }
            return output;
        }
        return null;

        function formatOutput(grp, name, returnMode) {
            switch (returnMode) {
                case "group.name":
                    return `${grp}.${name}`;
                case "name":
                    return name;
                case "group":
                    return grp;
                case "object":
                    return { grp, name };
                default:
                    return `${grp}.${name}`;
            }
        }
    
    }

    /**
     * Parses a hook string into its group and name components.
     *
     * @param {string} hook - The hook string to be parsed. It can be in the format "group.name" or just "name".
     * @param {string} [separator="."] - The separator used to split the group and name parts of the hook.
     * @returns {Object} An object containing the group and name of the hook.
     * @returns {string|undefined} return.grp - The group part of the hook, or undefined if no group is specified.
     * @returns {string|undefined} return.name - The name part of the hook.
     */
    hookParts = (hook, separator = ".") => {
        try {
            validateParameters();
            let { grp, name } = handleSeparation();
            return { grp, name };
        } catch (err) {
            console.error(this.moduleShortName + ' | Unable to retrieve hook parts.' + err);
            return { grp: undefined, name: undefined };
        }

        function validateParameters() {
            if (hook && typeof hook !== "string") {
                throw new Error("The hook must be a string.");
            }
            if (!hook) {
                throw new Error("The hook cannot be empty.");
            }
            if (separator && typeof separator !== "string") {
                throw new Error("The separator must be a string.");
            }
            if (!separator) {
                throw new Error("The separator cannot be empty.");
            }
            const match = hook.match(new RegExp(`^(\\${separator}+)?(.+?)(\\${separator}+)?$`));
            const trimmedHook = match ? match[2] : hook;
            if (trimmedHook && trimmedHook.includes(separator)) {
                const separatorCount = (trimmedHook.split(separator).length - 1);
                if (separatorCount >= 2) {
                    throw new Error(`The separator "${separator}" occurs two or more times in the hook, excluding leading and trailing separators. Only one separator is allowed.`);
                }
            }
        }
    
        function handleSeparation() {
            if (!hook.includes(separator)) {
                return { grp: undefined, name: hook };
            }
            // Remove leading separator if present
            if (hook.startsWith(separator)) {
            hook = hook.slice(1);
            }
            // Removing trailing separator if present
            if (hook.endsWith(separator)) {
            hook = hook.slice(0, -1);
            }
            // Split the hook into group and name parts
            let [grp, name] = hook.split(separator);
            return { grp, name };
        }
    }

    /**
     * Returns the prefix for a given hook group.
     *
     * @param {string} hookGroup - The name of the hook group.
     * @param {string} [prefix=this.prefix] - The prefix to use if the hook group is not in the noPrefixGroups list.
     * @param {Array<string>} [noPrefixGroups=this.settings.NO_PREFIX_GROUPS] - The list of hook groups that should not have a prefix.
     * @returns {string} The prefix for the hook group, or an empty string if the hook group is in the noPrefixGroups list.
     */
    hookPrefix = (hookGroup, prefix = this.prefix, noPrefixGroups = this.settings.NO_PREFIX_GROUPS) => {
        // Check if the hook group is in the noPrefixGroups list
        if (noPrefixGroups.includes(hookGroup)) {
            // Return an empty string if the hook group should not have a prefix
            return "";
        }
        // Return the prefix if the hook group is not in the noPrefixGroups list
        return prefix;
    }
}

/**
 * Class representing a Hooks Registry Checker.
 * The Hooks Registry Checker is used to check if a group or hook is allowed.
 */
export class HooksRegistryChecker {
    /**
     * Create a HooksRegistryChecker.
     * @param {Object} hookSettings - The settings object for hooks.
     * @param {Object} hookRegistry - The registry object for hooks.
     * @param {Object} getter - The getter object for hooks.
     * @param {Array<string>} settings.ALLOWED_GROUPS - The list of allowed groups.
     */
    constructor(hooksSettings, hookRegistry, getter) {
        this.settings = hooksSettings;
        this.get = getter;
        this.registry = hookRegistry;
    }

    /**
     * Check if a group is allowed.
     * @param {string} group - The group to check.
     * @param {Object} [settings=this.settings] - The settings object to use.
     * @throws Will throw an error if the group is not allowed.
     */
    groupIsAllowed = (group, settings = this.settings) => {
        if (!settings.ALLOWED_GROUPS.includes(group)) {
            throw new Error(`Group ${group} is not allowed.`);
        }
        return true;
    }

    /**
     * Check if a hook is allowed.
     * @param {string} hook - The hook to check.
     * @param {string} [hookGroup] - The group of the hook.
     * @param {Array<string>} [allowedGroups=this.settings.ALLOWED_GROUPS] - The list of allowed groups.
     * @returns {boolean} True if the hook is allowed, false otherwise.
     */
    hookIsAllowed = (hook, hookGroup, hookMappings = this.get.mappings(), allowedGroups = this.settings.ALLOWED_GROUPS) => {
        // Check if the hook group is allowed and if the hook exists in the allowed group
        let outcome = false;
        if (hookGroup && allowedGroups.includes(hookGroup) && this.registry[hookGroup][hook]) {
            outcome = true;
        }
        // Check if the hook exists in any allowed group if the hook group is not provided
        if (!hookGroup) {
            for (let [grp, values] of Object.entries(hookMappings)) {
                if (values.includes(hook) && allowedGroups.includes(grp)) {
                    outcome = true;
                }
            }
        }
        return outcome;
    }
}
export class HookBuilder {
    /**
     * Create a HookBuilder.
     * @param {Object} hooksSettings - The settings for hooks.
     * @param {Object} hookRegistry - The registry of hooks.
     * @param {Object} getter - The getter for hooks.
     * @param {string} [prefix=null] - The prefix for hooks.
     */
    constructor(hooksSettings, hookRegistry, getter, prefix = null) {
        this.settings = hooksSettings;
        this.get = getter;
        this.registry = hookRegistry;
        this.prefix = prefix || this.settings.DEFAULT_PREFIX;
    }

    /**
     * Get a hook name.
     * @param {string} hookName - The name of the hook.
     * @param {string} [hookGroup=null] - The group of the hook.
     * @param {string} [prefix=this.prefix] - The prefix for the hook.
     * @param {boolean} [tryDefaultFirst=true] - Whether to try the default group first.
     * @param {boolean} [tryAllGroups=true] - Whether to try all groups.
     * @returns {string|null} The hook name or null if not found.
     */
    hook = (hookName, hookGroup = null, prefix = this.prefix, tryDefaultFirst = true, tryAllGroups = true) => {    
        /**
         * Format a hook name using the group and prefix.
         * @param {string} hookGroup - The group of the hook.
         * @param {string} hookName - The name of the hook.
         * @param {string} [prefix=this.prefix] - The prefix for the hook.
         * @returns {string|null} The formatted hook name or null if not found.
         */
        
        const checkHookExists = (hookGroup, hookName) => {
            if (this.registry[hookGroup] && this.registry[hookGroup][hookName] && hookName !== "doesNotExist") {
                return true;
            }
            return false;
        }

        const formatHookName = (hookGroup, hookName, prefix) => {
            // Check if the hook group and hook name exist in the registry
            if (checkHookExists(hookGroup, hookName)) {
                // Return the formatted hook name
                return `${this.get.hookPrefix(hookGroup, prefix)}${this.registry[hookGroup][hookName]}`;
            }
            return null;
        }

        // If the group is provided, return the formatted hook name
        if (hookGroup) {
            return formatHookName(hookGroup, hookName, prefix);
        }
        // If the group is not provided and the flag to try the default group first is set, try the default group
        if (tryDefaultFirst && this.settings.DEFAULT_GROUP[hookName]) {
            // If the hook exists in the default group, return the formatted hook name
            return formatHookName(this.settings.DEFAULT_GROUP[hookName], hookName, prefix);
        }
        // If the flag to try all groups is set, try all groups
        if (tryAllGroups) {
            // Get all hooks that match the provided hook name
            let matchedHooks = this.get.hook(hookName, null, "all", true);
            // If there is only one matched hook, return the formatted hook name
            if (matchedHooks && matchedHooks.length === 1) {
                let { grp } = this.get.hookParts(matchedHooks[0]);
                return formatHookName(grp, hookName, prefix);
            }
            // If there are multiple matched hooks, log a warning 
            else if (matchedHooks && matchedHooks.length > 1) {
                console.warn(`Multiple hooks found for ${hookName}.`);
            }
        }
        // Return null if the hook cannot be built
        console.warn(`Hook ${hookName} cannot be built.`);
        return null;
    }

}


/**
 * Class representing a collection of hooks.
 */
class HookRegistry {
    /**
     * Create a Hooks instance.
     * @param {Object} hookCollection - A collections containing all the groups and hooks.
     * @param {Object} hooksSettings - The settings object.
     * @param {string} [prefix=null] - The prefix for hooks.
     */
    constructor(
        hookCollection, 
        hooksSettings, 
        prefix = null, 
        getter = HooksRegistryGetter, 
        checker = HooksRegistryChecker, 
        builder = HookBuilder
    ) {
        this.collection = hookCollection;
        this.settings = hooksSettings;
        this.prefix = prefix || this.settings.DEFAULT_PREFIX;
        this.get = new getter(this.settings, this.collection, this.prefix);
        this.check = new checker(this.settings, this.collection, this.get);
        this.build = new builder(this.settings, this.collection, this.get, this.prefix);
        this.unpackCollection(this.collection);
    }


    /**
     * Unpacks the groups object and assigns the groups to the instance.
     * 
     * @param {Object} groups - The groups object to unpack.
     * 
     * @callback ensureGroupIsAllowed
     * @throws {Error} If a group is not allowed.
     */
    unpackCollection(groups) {
        try{
            for (let grp in groups) {
                this.check.groupIsAllowed(grp);
                if (this[grp]) {
                    throw new Error(`Group ${grp}'s name conflicts with a property of the same name.`);
                }
                this[grp] = groups[grp];
            }
        } catch (err) {
            console.error(err.message);
        }
    }
    /**
     * Formats a hook name and group using the buildHook method.
     * This is a wrapper function for backwards compatibility.
     * 
     * @param {string} hookName - The name of the hook to format.
     * @param {string} hookGroup - The group of the hook to format.
     * @param {string} [prefix=this.prefix] - The prefix to use for the hook.
     * @param {boolean} [tryDefaultFirst=true] - Whether to try the default group if the hook group is not declared.
     * @param {boolean} [tryAllGroups=true] - Whether to try all groups if the hook group is not declared.
     * @returns {string} The formatted hook name and group.
     */
    formatHook(hookName, hookGroup = null, prefix = this.prefix, tryDefaultFirst = true, tryAllGroups = true) {
        return this.build.hook(hookName, hookGroup, prefix, tryDefaultFirst, tryAllGroups);
    }

}

export default HookRegistry;