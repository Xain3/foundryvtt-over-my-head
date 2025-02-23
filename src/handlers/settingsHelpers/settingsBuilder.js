// ./src/config/SettingsBuilder.js

import Handler from "../../baseClasses/handler";
import SettingData from "../../data/settingData";

/**
 * Manages and creates settings for the Foundry VTT module.
 * 
 * @class ModuleSettingsBuilder
 * @extends Handler
 */
class SettingsBuilder extends Handler {
    /**
     * Creates an instance of ModuleSettingsBuilder.
     * 
     * @param {Object} config - The module configuration.
     * @param {Object} context - The context object.
     * @param {Object} utils - The utilities object.
     */
    constructor(config, context, utils) {
        super(config, context, utils);
        this.moduleId = this.moduleConstants.ID;
        this.formatter = utils.hookFormatter;
        this.localizer = utils.localizer;
        this.moduleSettings = this.moduleConstants.SETTINGS;
        this.settings = {};
    }

    /**
     * Sets the context for the settings.
     * 
     * @param {Object} context - The context to be set.
     */
    setContext(context) {
        this.context = context;
    }

    /**
     * Initializes and builds settings for the module.
     * 
     * @param {Object} [context=null] - The context for the settings.
     * @returns {Object} The initialized settings.
     */
    initializeSettings(context = null) {
        this.context = context || this.context;
        this.settings = {};
        const SETTINGS = this.moduleConstants.SETTINGS.initializeSettings(this.context);
        if (SETTINGS) {
            for (const key in SETTINGS) {
                if (typeof SETTINGS[key] === 'object') {
                    this.settings[key] = new SettingData(key, SETTINGS[key], this.config, this.context, this.utils);
                } else {
                    this.logger.error(`Invalid data type for setting: ${key}. Expected object.`);
                }
            }
        }
        return this.settings;
    }
}

export default SettingsBuilder;