// ./src/data/settings.mjs

import { context } from "../contexts/context.mjs";

const MODULENAME = context.get("module").title;  // Module name
const MODULE_ID = context.get("module").id;  // Module ID
const DEBUG_MODE = context.get("config").debugMode; // Debug mode flag

// The settings for the module
const SETTINGS = {
    "enableModule": {
        name: `Enable ${MODULENAME}`, // TODO - Implement localization
        hint: "Enable or disable the module", // TODO - Implement localization
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: value => {
            Hooks.callAll("updateRoofVisionFadeEnabled", value);
        }
    },
    "debugMode": {
        name: "Debug Mode", // TODO - Implement localization
        hint: "Enable or disable debug mode",   // TODO - Implement localization
        scope: "world",
        config: true,
        type: Boolean,
        default: DEBUG_MODE,
        onChange: value => {
            Hooks.callAll("updateRoofVisionFadeDebugMode", value);
        }
    }
}

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

export { settings };