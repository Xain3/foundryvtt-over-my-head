// ./src/config/moduleSettings.js

/**
 * Configuration object for module settings.
 * 
 * @class
 * @exports ModuleSettings
 * 
 * @property {Object} SETTINGS - The module settings.
 * @property {Object} SETTINGS.enableModule - Setting configuration for enabling the module.
 * @property {Object} SETTINGS.debugMode - Setting configuration for debug mode.
 * @property {Object} const - The module constants.
 * @property {function} formatHook - The hook formatter function.
 * @property {string} moduleId - The module ID.
 * @property {boolean} debugMode - The default debug mode value.
 * @property {Object} localizer - The localization utility.
 * @requires Localizer
 * @requires formatHook
 */
class ModuleSettings {
    /**
     * Create a Settings instance.
     * 
     * @param {Object} CONFIG - The module configuration.
     * @param {Object} utils - The utility classes.     
     */
    constructor(CONFIG, utils) { 
        this.const = CONFIG.CONST;
        this.moduleId = this.const.MODULE.ID;
        this.debugMode = this.const.MODULE.DEFAULTS.DEBUG_MODE;
        this.formatter = utils.hookFormatter;
        this.localizer = utils.localizer;
        this.settings = {};
    }

    setContext(context) {
        this.context = context;
    }

    initializeSettings(context=null) {
        /**
         * Settings to be registered on Foundry VTT.
         * @type {Object}
         * @property {Object} enableModule - Setting configuration for enabling the module.
         * @property {Object} debugMode - Setting configuration for debug mode.
         */

        this.context = context || this.context;
        this.settings = {
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
                name: this.localizer.localize(`${this.const.LOCALIZATION.SETTINGS}.enableModule.name`, this.moduleId),
                hint: this.localizer.localize(`${this.const.LOCALIZATION.SETTINGS}.enableModule.hint`),
                scope: "world",
                config: true,
                type: Boolean,
                default: true,
                onChange: value => {
                    Hooks.callAll(this.formatter.formatHook("updateEnabled", "OUT"), value);
                    if (this.context) {
                        this.context.setFlags('enabled', value, true);
                    }
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
                name: this.localizer.localize(`${this.const.LOCALIZATION.SETTINGS}.debugMode.name`),
                hint: this.localizer.localize(`${this.const.LOCALIZATION.SETTINGS}.debugMode.hint`),
                scope: "world",
                config: true,
                type: Boolean,
                default: this.debugMode,
                onChange: value => {
                    Hooks.callAll(this.formatter.formatHook("updateDebugMode", "OUT"), value);
                    if (this.context) {
                        this.context.setFlags('debugMode', value, true);
                    }
                }
            }
        }
        return this.settings;
    }
}

export default ModuleSettings;