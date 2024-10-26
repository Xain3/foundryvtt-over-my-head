// ./src/handlers/settingsHandler.mjs
import CONST from '.../constants.mjs';
import settings from '../data/settings.mjs';

const MODULE_ID = CONST.MODULE_ID;

/**
 * Class representing a handler for managing settings.
 * @class
 * 
 * @property {boolean} settingsReady - Flag to indicate if the settings are ready.
 * @property {object} settings - The settings for the module.
 */
class SettingsHandler {
    /**
     * Creates an instance of SettingsHandler.
     */
    constructor() {
        this.settingsReady = false;
        this.settings = settings;
    }
    
    /**
     * Checks if the settings are ready.
     * @returns {boolean} - True if settings are ready, otherwise false.
     */
    getReady() {
        return this.settingsReady;
    }


    /**
     * Registers all settings.
     */
    registerSettings() {
        try {
            for (let setting in this.settings) { 
                setting.registerSetting();
            }
            this.settingsReady = true;
        } catch (error) {
            console.error(`${MODULE_ID} | Error registering settings: ${error}`);
            this.settingsReady = false;
        }
    }
}