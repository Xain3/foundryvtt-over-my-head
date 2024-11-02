// ./src/data/settingData.js

import context from "../contexts/context.js";
import logger from "../utils/logger.js";

const configs = context.get("config");
const SETTINGS = configs.SETTINGS;  // Settings to be registered on Foundry VTT
const MODULE_ID = configs.MODULE.ID; // The ID of the module

/** 
 * A class to hold the setting data
 * @class
 * 
 * @property {string} id - The unique identifier for the instance.
 * @property {object} data - The data to be stored in the instance.
 */
export class SettingData {
    /**
     * Creates an instance of the class with the given id and data.
     * 
     * @constructor
     * @param {string} id - The unique identifier for the instance.
     * @param {any} data - The data to be stored in the instance.
     */
    constructor(id, data) {
        this.id = id;
        this.data = data;
    }

    /**
     * Registers a game setting using the provided module ID, setting ID, and setting data.
     *
     * @function
     * @name registerSetting
     */
    registerSetting() {
        logger.debug(`Registering setting: ${this.id}`);
        try {
            if (typeof game !== 'undefined' && game.settings) {
                game.settings.register(MODULE_ID, this.id, this.data);
                logger.debug(`Setting registered: ${this.id}`);
                
                // Check if 'settings' object exists in context state, if not initialize it
                let settings = getOrCreateSettings();
                
                // Set the key this.id to this.data within the 'settings' object
                settings[this.id] = this.data;
                context.set('settings', settings);
            } else {
                logger.error(`'game.settings' is undefined. Cannot register setting: ${this.id}`);
            }
        } catch (error) {
            logger.error(`Error registering setting: ${this.id}`);
            logger.error(error);
        }

        function getOrCreateSettings() {
            let settings = context.get('settings');
            if (!settings) {
                settings = {};
                context.set('settings', settings);
            }
            return settings;
        }
    }
}

const settings = SETTINGS ? Object.keys(SETTINGS).reduce((acc, key) => {
    if (typeof SETTINGS[key] === 'object') {
        acc[key] = new SettingData(key, SETTINGS[key]);
    } else {
        logger.error(`Invalid data type for setting: ${key}. Expected object, but received $${typeof SETTINGS[key]}`);
    }
    return acc;
}, {}) : {};

export default settings;