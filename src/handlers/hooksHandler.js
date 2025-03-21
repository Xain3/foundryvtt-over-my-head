// Dependencies
import Handler from "../baseClasses/managers/handler.js";

const globalHooks = globalThis.Hooks;

class HooksHandler extends Handler {
    constructor(config, context, utils) {
        super(config, context, utils);
        this.hooks = this.config.HOOKS;
    }
    
   on(hookName, hookGroup = BUILT_IN, ...args) {
        let hook = this.hooks.buildHook(hookName, hookGroup);
        if (!hook) {
            throw new Error(`Hook ${hookName} does not exist`);
        }
        return globalHooks.on(hook, ...args);
    }

    once(hookName, hookGroup = BUILT_IN, ...args) {
        let hook = this.hooks.buildHook(hookName, hookGroup);
        if (!hook) {
            throw new Error(`Hook ${hookName} does not exist`);
        }
        return globalHooks.once(hook, ...args);
    }

    callAll(hookName, hookGroup = BUILT_IN, ...args) {
        let hook = this.hooks.buildHook(hookName, hookGroup);
        if (!hook) {
            throw new Error(`Hook ${hookName} does not exist`);
        }
        return globalHooks.callAll(hook, ...args);
    }
}

export default HooksHandler;