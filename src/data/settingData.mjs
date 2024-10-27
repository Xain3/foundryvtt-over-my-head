// ./src/data/settings.mjs

import context from "../contexts/context.mjs";
import logger from "../utils/logger.mjs";

const CONST = context.get("CONST");
const SETTINGS = CONST.SETTINGS;  // Settings to be registered on Foundry VTT
const MODULE_ID = CONST.MODULE_ID; // The ID of the module

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
            } else {
                logger.error(`'game.settings' is undefined. Cannot register setting: ${this.id}`);
            }
        } catch (error) {
            logger.error(`Error registering setting: ${this.id}`);
            logger.error(error);
        }
    }
}

const settings = SETTINGS ? Object.keys(SETTINGS).reduce((acc, key) => {
        acc[key] = new SettingData(key, SETTINGS[key]);
        return acc;
        }, {}) 
    : {};

export default settings;