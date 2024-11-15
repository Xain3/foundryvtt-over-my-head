import CONST from './constants.js';
import HOOKS from './hooks.js';
import ModuleSettings from './moduleSettings.js';

/**
 * Class representing a configuration object.
 * 
 * @class
 * @module Config
 * @since 0.0.1
 * @export Config
 * 
 * @property {Object} CONFIG - The module configuration.
 * @property {Object} CONFIG.CONST - The module constants.
 * @property {Object} CONFIG.HOOKS - The module hooks.
 * @property {Object} CONFIG.SETTINGS - The module settings.
 * @property {Function} CONFIG.formatHook - The hook formatter function.
 
 * @property {Function} formatHook - The hook formatter function.
 * @property {Object} gameObject - The FoundryVTT Game object.
 * @property {Object} formatter - The hook formatter.
 * @property {Object} localizer - The localizer.
 * @property {Function} getConfig - The configuration getter.
 * 
 */
class Config {
    static CONFIG = {
        CONST: CONST,
        HOOKS: HOOKS,
        formatHook: null
    };

    /**
     * Creates an instance of the configuration object.
     * 
     * @param {Object} hookFormatter - An instance of the HookFormatter class.
     * @param {Object} localizer - An instance of the Localizer class.
     */
    constructor(utils) {
        this.CONFIG = Config.CONFIG;
        this.gameObject = globalThis.game;
        this.utils = utils;
        this.formatter = this.utils.hookFormatter;
        this.moduleSettings = new ModuleSettings(this.CONFIG, this.utils);
        this.CONFIG.CONST.MODULE.SETTINGS = this.moduleSettings;
        this.CONFIG.formatHook = this.formatHook;
    }

    /**
     * Formats a hook name and group using the formatter.
     *
     * @param {string} hookName - The name of the hook to format.
     * @param {string} hookGroup - The group of the hook to format.
     * @returns {string} The formatted hook name and group.
     * @throws {Error} If the formatter is not defined.
     */
    formatHook = (hookName, hookGroup) => {
        if (!this.formatter) {
            throw new Error('Formatter is not defined');
        }
        return this.formatter.formatHook(hookName, hookGroup);
    };

    /**
     * Retrieves the current configuration.
     * 
     * @returns {Object} The current configuration object.
     */
    getConfig = () => this.CONFIG;
}

export default Config;