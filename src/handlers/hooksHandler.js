// Dependencies
import Handler from '../classes/handler.js';
import HookFormatter from '../utils/hookFormatter.js';

const runChecks = (hookGroup, allowedGroups) => {
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
 * @param {object} formatterSettings - The settings for the HookFormatter class.
 * 
 * @property {string} hookName - The unformatted name of the hook.
 * @property {string} hookGroup - The group of the hook.
 * @property {string} hook - The formatted name of the hook.
 */
class HookWrapper {
    constructor(unformattedHook, hookGroup = "builtIn", formatterSettings) {
        this.hookName = unformattedHook;
        this.hookGroup = hookGroup;
        this.hook = new HookFormatter(...formatterSettings)
            .formatHook(this.hookName, this.hookGroup);
    }
}

/**
 * HookHandler class provides static methods to register and call hooks.
 * 
 * Methods:
 */
class HooksHandler extends Handler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.HOOKS_MAPPINGS = config.HOOKS.getMappings();
        this.HOOKS_SETTINGS = config.HOOKS.getSettings();
        this.PREFIX = config.CONST.MODULE.SHORT_NAME;
        this.NO_PREFIX_GROUPS = this.HOOKS_SETTINGS.NO_PREFIX_GROUPS || [];
        this.ALLOWED_GROUPS = this.HOOKS_SETTINGS.ALLOWED_GROUPS || Object.keys(HOOK_MAPPINGS);
        this.formatterSettings = [this.HOOKS_MAPPINGS, this.PREFIX, this.NO_PREFIX_GROUPS, this.ALLOWED_GROUPS];
    }
    
    on(hookName, fn, hookGroup = ["builtIn"]) {
        runChecks(hookGroup, this.ALLOWED_GROUPS);
        const wrapper = new HookWrapper(hookName, hookGroup[0], this.formatterSettings);
        Hooks.on(wrapper.hook, fn, hookGroup);
    }

    once(hookName, fn, hookGroup = ["builtIn"]) {
        runChecks(hookGroup, this.ALLOWED_GROUPS);
        const wrapper = new HookWrapper(hookName, hookGroup[0], this.formatterSettings);
        Hooks.once(wrapper.hook, fn, hookGroup);
    }

    callAll(hookName, hookGroup = ["builtIn"], ...args) {
        runChecks(hookGroup, this.ALLOWED_GROUPS);
        const wrapper = new HookWrapper(hookName, hookGroup[0], this.formatterSettings);
        Hooks.callAll(wrapper.hook, hookGroup, ...args);
    }
}

export default HooksHandler;