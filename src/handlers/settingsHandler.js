// ./src/handlers/settingsHandler.js

import Handler from "../baseClasses/managers/handler.js";
import SettingsGetter from './settingsFunctions/settingsGetter.js';
import SettingsSetter from './settingsFunctions/settingsSetter.js';
import SettingsChecker from './settingsFunctions/settingsChecker.js';
import SettingsBuilder from './settingsFunctions/settingsBuilder.js';

/**
 * Class representing a handler for managing settings.
 * @class
 *
 * @property {object} logger - The logger object.
 * @property {object} config - The configuration object.
 * @property {boolean} settingsReady - Flag to indicate if the settings are ready.
 * @property {object} configSettings - The settings object from the configuration.
 * @property {object} settings - The settings for the module.
 * 
 * @method getReady - Checks if the settings are ready.
 * @method checkSettingsType - Checks if all settings in the provided object are instances of SettingData.
 * @method getSetting - Gets a setting by key.
 * @method getSettingValue - Gets a setting value by key.
 * @method setSettingValue - Sets a setting value by key.
 * @method registerSettings - Registers all settings.
 * @method createSettings - Constructs a settings object based on the provided configuration.
 */
export class SettingsHandler extends Handler {
    /**
     * Creates an instance of SettingsHandler.
     * 
     * @param {object} config - The configuration object.
     * @param {object} logger - The logger object.
     */
    constructor(config, context, utils) {
        super(config, context, utils);
        this.settingsReady = false;
        this.getter = new SettingsGetter(config, context, utils);
        this.setter = new SettingsSetter(config, context, utils);
        this.checker = new SettingsChecker(config, context, utils);
        this.builder = new SettingsBuilder(config, context, utils);
        this.settings = this.buildSettings();
    }

    /**
     * Registers all settings.
     * 
     * Registering settings will set the settingsReady flag to true if all settings are registered successfully.
     */
    registerSettings() {
        // Check if settings are valid
        if (!this.settings) {
            this.logger.error('Settings are not valid.');
            this.settingsReady = false;
            return;
        }
        try {
            // Register each setting
            for (const key in this.settings) {
                const setting = this.settings[key];
                this.logger.debug(`Registering setting: ${setting.id}`);
                setting.registerSetting();
            }
            
            // Set settings ready flag
            this.settingsReady = true;
            this.context.setFlags('settingsReady', true, true);
        } catch (error) {
            this.logger.error(`Error registering settings: ${error}`);
            this.settingsReady = false;
        }
    }

    // WRAPPER FUNCTIONS    
    
    /**
     * Checks if the settings are ready.
     * @returns {boolean} - True if settings are ready, otherwise false.
     */
    checkSettingsReady() {
        return this.checker.checkSettingsReady(this);
    }

    /**
     * Gets a setting by key.
     * 
     * @param {string} key - The key of the setting to get.
     * @param {string} valueKey - The key of the value to get.
     * @returns {object} - The setting object.
     */
    getSettingValue(settingKey, valueKey) {
        return this.getter.getSettingValue(settingKey, valueKey);
    }

    /**
     * Sets a setting value by key.
     * 
     * @param {string} settingKey - The key of the setting.
     * @param {string} valueKey - The key of the value to set.
     * @param {any} value - The value to set
     */
    setSettingValue(settingKey, valueKey, value) {
        this.setter.setSettingValue(settingKey, valueKey, value);
    }

    /**
     * Constructs a settings object based on the provided configuration.
     *
     * @returns {Object} An object where each key corresponds to a setting name and each value is an instance of SettingData.
     *
     * @throws Will log an error if a setting value is not an object.
     */
    buildSettings() {
        return this.builder.buildSettings();
    }
}

export default SettingsHandler;