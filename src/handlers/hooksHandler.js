// Fix in hooksHandler.js

import context from '../contexts/context.js';
import { HookFormatter } from '../utils/hooksFormatter.js';


/**
 * An object that provides the mapping of hook names to their respective functions.
*/
const HOOK_MAPPINGS = context.get('config').HOOKS;
const PREFIX = context.get('config').MODULE_SHORT_NAME;
const NO_PREFIX_GROUPS = context.get('config').NO_PREFIX_GROUPS || [];
const ALLOWED_GROUPS = context.get('config').ALLOWED_GROUPS || Object.keys(HOOK_MAPPINGS);

const runChecks = (hookGroup, allowedGroups = ALLOWED_GROUPS) => {
    if (!Array.isArray(hookGroup)) {
        throw new Error(`Hook group must be an array`);
    }
    if (hookGroup.length > 1) {
        throw new Error(`Hook group must be a single string inside a group, but received: ${hookGroup}`);
    }
    if (typeof hookGroup[0] !== 'string') {
        throw new Error(`Hook group must be a string, but received: ${hookGroup[0]}`);
    }
    if (!ALLOWED_GROUPS.includes(hookGroup[0])) {
        throw new Error(`Hook group must be one of the allowed groups: ${allowedGroups}`);
    }
}

/**
 * A class representing a wrapper for a hook using the HookFormatter class to format the hook name.
 * 
 * @class HookWrapper
 * @param {string} unformattedHook - The unformatted name of the hook.
 * @param {string} [hookGroup="builtIn"] - The group of the hook, defaults to "builtIn".
 * 
 * @property {string} hookName - The unformatted name of the hook.
 * @property {string} hookGroup - The group of the hook.
 * @property {string} hook - The formatted name of the hook.
 */
class HookWrapper {
    constructor(unformattedHook, hookGroup = "builtIn") {
        this.hookName = unformattedHook;
        this.hookGroup = hookGroup;
        this.hook = new HookFormatter(HOOK_MAPPINGS, PREFIX, NO_PREFIX_GROUPS, ALLOWED_GROUPS)
            .formatHook(this.hookName, this.hookGroup);
    }
}

/**
 * HookHandler class provides static methods to register and call hooks.
 * 
 * Methods:
 */
class HookHandler {
    static on(hookName, fn, hookGroup = ["builtIn"]) {
        runChecks(hookGroup);
        const wrapper = new HookWrapper(hookName, hookGroup[0]);
        Hooks.on(wrapper.hook, fn, hookGroup);
    }

    static once(hookName, fn, hookGroup = ["builtIn"]) {
        runChecks(hookGroup);
        const wrapper = new HookWrapper(hookName, hookGroup[0]);
        Hooks.once(wrapper.hook, fn, hookGroup);
    }

    static callAll(hookName, hookGroup = ["builtIn"], ...args) {
        runChecks(hookGroup);
        const wrapper = new HookWrapper(hookName, hookGroup[0]);
        Hooks.callAll(wrapper.hook, hookGroup, ...args);
    }
}

export default HookHandler;