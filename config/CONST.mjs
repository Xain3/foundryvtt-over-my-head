import config from './config.js';
import visionFadeModule from '../module.json';

class CONST{
    static MODULE_ID = visionFadeModule.id;  // Module ID
    static MODULE_NAME = visionFadeModule.title; // Module name
    static DEBUG_MODE = config.debugMode;  // Debug mode default value
    // Settings to be registered on Foundry VTT
    static SETTINGS = {
        "enableModule": {
            name: `Enable ${CONST.MODULE_NAME}`, // TODO - Implement localization
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
            default: CONST.DEBUG_MODE,
            onChange: value => {
                Hooks.callAll("updateRoofVisionFadeDebugMode", value);
            }
        }
    }
}

export default CONST;