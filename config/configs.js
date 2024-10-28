class ModuleConfig{
    static MODULE_ID = "foundryvtt-over-my-head";  // Module ID
    static MODULE_NAME = "OverMyHead"; // Module name
    
    static DEBUG_MODE = true;  // Debug mode default value
    
    // Settings to be registered on Foundry VTT
    static SETTINGS = {
        "enableModule": {
            name: `Enable ${configs.MODULE_NAME}`, // TODO - Implement localization
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
            default: configs.DEBUG_MODE,
            onChange: value => {
                Hooks.callAll("updateRoofVisionFadeDebugMode", value);
            }
        }
    }
}

const moduleConfig = new ModuleConfig();

export default moduleConfig;