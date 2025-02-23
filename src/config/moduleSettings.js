// ./src/config/moduleSettings.js

/**
 * Configuration class for module settings.
 * 
 * @class MODULE_SETTINGS_INTERFACE
 * @property {Object} ALLOWED_SETTING_PROPS - Allowed setting properties from the SettingConfig interface.
 * @property {string[]} ESSENTIAL_SETTING_PROPS - Essential setting properties.
 * 
 * @export MODULE_SETTINGS_INTERFACE
 */
export class MODULE_SETTINGS_INTERFACE {
    /**
     * Allowed setting properties from the SettingConfig interface.
     * This object is used to validate the setting properties.
     * The keys are the property names and the values are the property types expressed as strings.
     * 
     * @static
     * @type {Object}
     */  
    static ALLOWED_SETTING_PROPS = { 
        key: "string",
        namespace: "string",
        nameKey: "string",
        hintKey: "string",
        scope: "string",
        config: "boolean",
        type: "any",
        choices: "Object",
        range: "Object",
        default: "any",
        onChange: "Function",
        input: "CustomFormInput",
        };
        
        /**
         * Essential setting properties.
         * These properties are required for a setting to be valid.
         * 
         * @static
         * @type {string[]}
         */

        static ESSENTIAL_SETTING_PROPS = ["nameKey", "hintKey", "type", "default"]; // Essential setting properties
}

/**
 * Configuration class for module settings.
 * This class contains the settings to register for the module.
 * 
 */
class MODULE_SETTINGS {
    // Setting to enable or disable the module
    static enableModule = {
        // The onChangeActions property is used to dynamically construct the onChange function.
        onChangeActions:{
            hooksCalled: ['updateEnabled'],
            contextFlags: ['enabled'],
        },
        // The props property contains the setting properties.
        props:{
            nameKey: `LOCALIZATION.SETTINGS.enableModule.name`,
            hintKey: `LOCALIZATION.SETTINGS.enableModule.hint`,
            scope: "world",
            config: true,
            type: Boolean,
            default: true,

            // The onChange function below is commented out for documentation but it is 
            // now dynamically constructed through the onChangeActions property.
            //
            // onChange: (value, context, formatter) => {
            //     Hooks.callAll(formatter.formatHook("updateEnabled", "OUT"), value);
            //     if (context) {
            //         contextFlags.forEach((flag) => {
            //         context.setFlags(flag, value, true);
            //         });
        }
    };

    // Setting to enable or disable debug mode
    static debugMode = {
        // The onChangeActions property is used to dynamically construct the onChange function.
        onChangeActions:{
            hooksCalled: ['updateDebugMode'],
            contextFlags: ['debugMode'],
        },
        // The props property contains the setting properties.
        props:{
            nameKey: `LOCALIZATION.SETTINGS.debugMode.name`,
            hintKey: `LOCALIZATION.SETTINGS.debugMode.hint`,
            type: Boolean,
            default: false,

            // The onChange function below is commented out for documentation but it is
            // now dynamically constructed through the onChangeActions property.
            //
            // onChange: (value, context, formatter) => {
            //     Hooks.callAll(formatter.formatHook("updateDebugMode", "OUT"), value);
            //     if (context) {
            //         contextFlags.forEach((flag) => {
            //         context.setFlags('debugMode', value, true);
            //         })
            //     }
            //     console.debug(`debugMode.onChange: ${value}`);
            // }
        }
    };
};

export default MODULE_SETTINGS;