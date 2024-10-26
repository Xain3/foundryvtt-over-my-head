// ./src/data/settings.mjs

import CONST from "../../config/CONST.mjs";

const SETTINGS = CONST.SETTINGS; // Settings to be registered on Foundry VTT
const MODULE_ID = CONST.MODULE_ID; // Module ID


/** 
 * A class to hold the setting data
 * @class
 * 
 * @property {string} id - The unique identifier for the instance.
 * @property {object} data - The data to be stored in the instance.
 */
class SettingData {
    /**
     * Creates an instance of the class with the given id and data.
     * 
     * @constructor
     * @param {string} id - The unique identifier for the instance.
     * @param {...any} data - Additional data to be stored in the instance.
     */
    constructor(id, ...data) {
        this.id = id;
        this.data = {...data};
    }

    /**
     * Registers a game setting using the provided module ID, setting ID, and setting data.
     *
     * @function
     * @name registerSetting
     */
    registerSetting() {
        game.settings.register(MODULE_ID, this.id, this.data);
    }
}

const settings = Object.keys(SETTINGS).reduce((acc, key) => {
    acc[key] = new SettingData(key, SETTINGS[key]);
    return acc;
}
, {});

export default settings;