// ./src/handlers/settingsHandler.js

import SettingData from '../data/settingData.js';
import Handler from '../baseClasses/handler.js';

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
        this.utils = utils;
        this.settingsReady = false;
        this.configSettings = this.const.MODULE.SETTINGS.initializeSettings(this.context);
        this.settings = this.checkSettingsType(this.createSettings(this.config));
    }

    /**
     * Checks if the settings are ready.
     * @returns {boolean} - True if settings are ready, otherwise false.
     */
    getReady() {
        return this.settingsReady;
    }

    /**
     * Checks if all settings in the provided object are instances of SettingData.
     *
     * @param {Object} settings - The settings object to check.
     * @returns {boolean|Object} - Returns the settings object if all settings are valid, otherwise returns false.
     */
    checkSettingsType(settings) {
        for (let key in settings) {
            const setting = settings[key];
            if (!(setting instanceof SettingData)) {
                this.logger.warn(`Setting is not an instance of SettingData: ${setting}`);
                return false;
            }
        }
        return settings;
    }

    getSetting(setting) {
        if (!this.settings[setting]) {
            this.logger.error(`Setting with key ${setting} does not exist.`);
            return null;
        }
        return this.settings[setting];
    }

    getSettingValue(setting, key) {
        if (!this.settings[setting]) {
            this.logger.error(`Setting with key ${setting} does not exist.`);
            return null;
        }
        return this.settings[setting].getValue(key);
    }
    
    setSettingValue(setting, key, value) {
        if (!this.settings[setting]) {
            this.logger.error(`Setting with key ${setting} does not exist.`);
            return;
        }
        this.settings[setting].setValue(key, value);
    }

    /**
     * Registers all settings.
     */
    registerSettings() {
        if (!this.settings) {
            this.logger.error('Settings are not valid.');
            this.settingsReady = false;
            return;
        }
        try {
            for (let key in this.settings) {
                const setting = this.settings[key];
                this.logger.debug(`Registering setting: ${setting.id}`);
                setting.registerSetting();
            }
            this.settingsReady = true;
            this.context.setFlags('settingsReady', true, true);
            return this.settingsReady;
        } catch (error) {
            this.logger.error(`Error registering settings: ${error}`);
            this.settingsReady = false;
            return this.settingsReady
        }
    }

    /**
     * Constructs a settings object based on the provided configuration.
     *
     * @returns {Object} An object where each key corresponds to a setting name and each value is an instance of SettingData.
     *
     * @throws Will log an error if a setting value is not an object.
     */
    createSettings() {
        const SETTINGS = this.configSettings;
        let settings = {};
        if (SETTINGS) {
            for (let key in SETTINGS) {
                if (typeof SETTINGS[key] === 'object') {
                    settings[key] = new SettingData(key, SETTINGS[key], this.config, this.context, this.utils);
                } else {
                    this.logger.error(`Invalid data type for setting: ${key}. Expected object, but received $${typeof SETTINGS[key]}`);
                }
            }
        }
        return settings;
}
}

export default SettingsHandler;