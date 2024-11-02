/**
 * Class representing the settings for a module.
 */
class Settings {
    /**
     * Create a Settings instance.
     * @param {string} moduleName - The name of the module.
     * @param {boolean} debugMode - The initial state of the debug mode.
     * @param {function} formatHook - A function to format hook names.
     */
    constructor(moduleName, debugMode, formatHook) { 
        this.moduleName = moduleName;
        this.debugMode = debugMode;
        this.formatHook = formatHook;
    
        /**
         * Settings to be registered on Foundry VTT.
         * @type {Object}
         * @property {Object} enableModule - Setting configuration for enabling the module.
         * @property {Object} debugMode - Setting configuration for debug mode.
         */
        this.SETTINGS = {
            /**
             * Setting configuration for enabling the module.
             * @type {Object}
             * @property {string} name - The name of the setting.
             * @property {string} hint - A hint for the setting.
             * @property {string} scope - The scope of the setting.
             * @property {boolean} config - Whether the setting is configurable.
             * @property {boolean} type - The type of the setting.
             * @property {boolean} default - The default value of the setting.
             * @property {function} onChange - The function to call when the setting changes.
             */
            enableModule: {
                name: `Enable ${this.moduleName}`, // TODO - Implement localization
                hint: "Enable or disable the module", // TODO - Implement localization
                scope: "world",
                config: true,
                type: Boolean,
                default: true,
                onChange: value => {
                    Hooks.callAll(this.formatHook("updateEnabled", "out"), value);
                }
            },
            /**
             * Setting configuration for debug mode.
             * @type {Object}
             * @property {string} name - The name of the setting.
             * @property {string} hint - A hint for the setting.
             * @property {string} scope - The scope of the setting.
             * @property {boolean} config - Whether the setting is configurable.
             * @property {boolean} type - The type of the setting.
             * @property {boolean} default - The default value of the setting.
             * @property {function} onChange - The function to call when the setting changes.
             */
            debugMode: {
                name: "Debug Mode", // TODO - Implement localization
                hint: "Enable or disable debug mode",   // TODO - Implement localization
                scope: "world",
                config: true,
                type: Boolean,
                default: this.debugMode,
                onChange: value => {
                    Hooks.callAll(this.formatHook("updateDebugMode", "out"), value);
                }
            }
        }
    }
}

export default Settings;