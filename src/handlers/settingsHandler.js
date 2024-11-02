// ./src/handlers/settingsHandler.js
import context from '../contexts/context.js';
import settings, {SettingData} from '../data/settingData.js';
import logger from '../utils/logger.js';
import Hooks from './hooksHandler.js';

/**
 * Class representing a handler for managing settings.
 * @class
 *
 * @property {boolean} settingsReady - Flag to indicate if the settings are ready.
 * @property {object} settings - The settings for the module.
 * 
 * @method getReady - Checks if the settings are ready.
 * @method checkSettingsType - Checks if all settings in the provided object are instances of SettingData.
 * @method getSetting - Gets a setting by key.
 * @method getSettingValue - Gets a setting value by key.
 * @method setSettingValue - Sets a setting value by key.
 * @method registerSettings - Registers all settings.
 */
export class SettingsHandler {
    /**
     * Creates an instance of SettingsHandler.
     */
    constructor(settings) {
        this.settingsReady = false;
        this.settings = this.checkSettingsType(settings);
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
                logger.warn(`Setting is not an instance of SettingData: ${setting}`);
                return false;
            }
        }
        return settings;
    }

    getSetting(setting) {
        if (!this.settings[setting]) {
            logger.error(`Setting with key ${setting} does not exist.`);
            return null;
        }
        return this.settings[setting];
    }

    getSettingValue(setting, key) {
        if (!this.settings[setting]) {
            logger.error(`Setting with key ${setting} does not exist.`);
            return null;
        }
        return this.settings[setting].getValue(key);
    }
    
    setSettingValue(setting, key, value) {
        if (!this.settings[setting]) {
            logger.error(`Setting with key ${setting} does not exist.`);
            return;
        }
        this.settings[setting].setValue(key, value);
    }

    /**
     * Registers all settings.
     */
    registerSettings() {
        if (!this.settings) {
            logger.error('Settings are not valid.');
            settingsReady = false;
            return;
        }
        try {
            for (let key in this.settings) {
                const setting = this.settings[key];
                logger.debug(`Registering setting: ${setting.id}`);
                setting.registerSetting();
            }
            this.settingsReady = true;
            context.set('settingsReady', true);
            Hooks.callAll('settingsReady', ['out']);
        } catch (error) {
            logger.error(`Error registering settings: ${error}`);
            this.settingsReady = false;
        }
    }
}

const handler = new SettingsHandler(settings);

export default handler;