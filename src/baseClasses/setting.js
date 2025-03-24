import Base from "./base.js";

/**
 * The Setting class extends the Base class and provides functionality for managing settings.
 * It includes methods for selecting, validating, and updating settings, as well as handling
 * changes to settings and updating context flags.
 * 
 * @class Setting
 * @extends Base
 * 
 * @param {Object} config - The configuration object for the setting.
 * @param {Object} [setting=null] - The initial setting object. Defaults to null.
 * 
 * @property {Object} moduleSettings - The module settings constants.
 * @property {string} moduleShortName - The short name of the module.
 * @property {Object} settingsConfig - The configuration for the settings.
 * @property {Array} allowedProps - The allowed properties for the settings.
 * @property {Array} essentialProps - The essential properties for the settings.
 * @property {Array} contextFlags - The context flags for the settings.
 * @property {Object} selectedSetting - The currently selected setting.
 * @property {Object} settingProps - The properties of the current setting.
 * 
 * Inherits properties from Base:
 * @property {Object} config - The configuration object.
 * @property {Object} const - The constant object.
 * @property {Object} moduleConstants - The module constants object.
 * 
 */
class Setting extends Base {
    constructor(config, setting = null) {
        super({
            config,
            shouldLoadConfig: true,
        });
        this.moduleSettings = this.moduleConstants.SETTINGS;
        this.moduleShortName = this.moduleConstants.SHORT_NAME;
        this.settingsConfig = this.moduleSettings.CONFIG;
        this.allowedProps = this.settingsConfig.ALLOWED_SETTING_PROPS;
        this.essentialProps = this.settingsConfig.ESSENTIAL_SETTING_PROPS;
        this.contextFlags = [];
        this.selectedSetting = setting || {props: {}};
        this.selectedSettingProps = this.selectedSetting.props;
    }

    /**
     * Selects a setting and validates it.
     * 
     * @param {string} setting - The name of the setting to select.
     */
    selectSetting(setting) {
        this.checkSetting(setting);
        this.selectedSetting = this.moduleSettings[setting];
    }


    ensureIsObject(setting = this.selectedSetting) {
        let isObject = true
        if (typeof setting !== 'object') {
            isObject = false;
            console.error(`${this.moduleShortName} | Setting must be an object, received ${typeof setting}`);
        }
        return isObject;
    }

    /**
     * Ensures that all essential properties are present in the setting.
     * Iterates over the essentialProps array and checks if each property is present.
     */
    ensureEssentialProperties(settingProps = this.selectedSettingProps) {
        let essential = true
        this.essentialProps.forEach((prop) => {
            if (!settingProps[prop]) {
                console.error(`${this.moduleShortName} | Missing essential property: ${prop}`);
                essential = false;
            }
        });
        return essential;
    }

    /**
     * Ensures that all properties of the setting object are valid.
     * Iterates over the keys of the setting object and checks if each key is allowed.
     */
    ensureValidProperties(settingProps = this.selectedSettingProps) {
        let valid = true;
        let settingKeys = Object.keys(settingProps);
        settingKeys.forEach((key) => {
            if (!this.allowedProps[key]) {
                console.error(`${this.moduleShortName} | Invalid property: ${key}`);
                valid = false;
            }
        });
        return valid;
    }

    /**
     * Ensures that the properties of the setting object have valid types.
     * Iterates over each key in the setting object and checks if the type of the property
     * matches the allowed type specified in the allowedProps object.
     */
    ensureValidPropertyTypes(settingProps = this.selectedSettingProps) {
        /**
         * Checks if the type of the property does not match the allowed type (unless the allowed type is 'any', 'undefined' or 'CustomFormInfo').
         *
         * @param {string} propertyType - The type of the property.
         * @returns {boolean} - True if the property type is not the same as the allowed type and the allowed type is not 'any' or 'undefined', otherwise false.
         */
        const checkWrongType = (key, propertyType) => {
            let isWrongType = (
                propertyType.toLowerCase() !== this.allowedProps[key].toLowerCase() // Check if the property type is not the same as the allowed type
                && !['any', 'undefined', 'CustomFormInput'].includes(this.allowedProps[key]) // Check if the allowed type is not 'any', 'undefined or 'CustomFormInput'
            ); 
            // If the property type is not the same as the allowed type and the allowed type is not 'any' or 'undefined', return true
            return isWrongType
            };
            
        let propertyType = '';
        let validTypes = true;
        let settingKeys = Object.keys(settingProps);
        settingKeys.forEach((key) => {
            propertyType = typeof settingProps[key];
            if (checkWrongType(key, propertyType)) {
                console.error(`${this.moduleShortName} | Invalid type for property ${key} - expected ${this.allowedProps[key]}, received ${typeof settingProps[key]}`);
                validTypes = false;
            }

        });
        return validTypes;
    }

     /**
     * Validates the settings by ensuring that all properties are valid,
     * have the correct types, and that all essential properties are present.
     * 
     * @throws {Error} If any property is invalid, has an incorrect type, or if any essential property is missing.
     */
     checkSetting(setting = this.selectedSetting) {
        /**
         * Validates a setting and throws an error if invalid.
         *
         * @param {boolean} isObject - Indicates if the setting is an object.
         * @param {boolean} valid - Indicates if the setting is valid.
         * @param {Array} validTypes - Array of valid types for the setting.
         * @param {boolean} essential - Indicates if the setting is essential.
         * @throws {Error} If the setting is invalid.
         */
        const checkForErrors = (isObject, valid, validTypes, essential) => {
            if (!isObject || !valid || !validTypes || !essential) {
                let settingName = setting.nameKey || 'Unknown setting';
                throw new Error('Invalid setting: ' + settingName);
            }
        }

        try {
            const isObject = this.ensureIsObject(setting);
            const valid = this.ensureValidProperties(setting.props);
            const validTypes = this.ensureValidPropertyTypes(setting.props);
            const essential = this.ensureEssentialProperties(setting.props);
            checkForErrors(isObject, valid, validTypes, essential);
            return true;
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
            return false;
        }
    }


    /**
     * Updates the context flags with the specified value.
     *
     * @param {Object} context - The context object to update.
     * @param {*} value - The value to set for each flag.
     * @param {Array} [flags=this.contextFlags] - The array of flags to update. Defaults to this.contextFlags.
     */
    updateContextFlags(context, value, flags = this.contextFlags, selectedSettingFlags = this.selectedSetting.contextFlags) {
        if (context && selectedSettingFlags) {
            flags.forEach((flag) => {
                context.setFlags(flag, value, true);
                console.debug(`Setting ${flag} to ${value}`);
            });
        }
    }

    /**
     * Calls a hook when a setting changes and logs the change.
     *
     * @param {string} hook - The name of the hook to call.
     * @param {*} value - The new value of the setting.
     * @param {Object} formatter - An object with a method to format the hook name.
     * @param {Function} formatter.formatHook - A method to format the hook name.
     */
    onChangeCallHook(
        hook,
        value,
        formatter,
        hookGroup = "OUT",
        hookFunction = this.global.Hooks.callAll
        ) {
        try {
            validateArguments(hook, value, formatter);
            hookFunction(formatter.formatHook(hook, hookGroup), value);
            console.debug(`${hook}.onChange: ${value}`);
        } catch (error) {
            console.error(error.message);
        }

        function validateArguments(hook, value, formatter) {
            let error;
            if (!hook) {
                error = new Error('Hook is not defined');
                error.name = 'HookError';
                throw error;
            }

            if (!value) {
                error = new Error('Value is not defined');
                error.name = 'ValueError';
                throw error;
            }

            if (!formatter) {
                error = new Error('Formatter is not defined');
                error.name = 'FormatterError';
                throw error;
            }

            if (!formatter.formatHook) {
                error = new Error('Formatter.formatHook is not defined');
                error.name = 'FormatterMethodError';
                throw error;
            }

            if (typeof(formatter.formatHook) !== 'function') {
                error = new Error('Formatter.formatHook must be a function');
                error.name = 'TypeError';
                throw error;
            }
        }
        
    }

    /**
     * Handles the change event and updates the context flags.
     *
     * @param {Object} context - The context in which the flags are being updated.
     * @param {*} value - The new value to set for the context flags.
     * @param {Object} [selectedSetting=this.selectedSetting] - The selected setting object. Defaults to this.selected
     */
    onChangeUpdateFlags(context, value, selectedSetting = this.selectedSetting) {
        try {
            validateArguments(context, value, selectedSetting);
            this.updateContextFlags(context, value);
            console.debug(`${selectedSetting.nameKey}.onChange: ${value}`);
        } catch (error) {
            console.error(error.message);
        }
        
        function validateArguments(context, value, selectedSetting) {
            let error;
            if (!context) {
                error = new Error('Context is not defined');
                error.name = 'ContextError';
                throw error;
            }

            if (typeof(context) !== 'object') {
                error = new Error('Context must be an object');
                error.name = 'TypeError';
                throw error;
            }
            if (!selectedSetting) {
                error = new Error('Setting is not defined');
                error.name = 'SettingError';
                throw error;
            }

            if (!selectedSetting.contextFlags) {
                error = new Error('Context flags are not defined');
                error.name = 'ContextFlagsError';
                throw error;
            }
            if (!value) {
                error = new Error('Value is not defined');
                error.name = 'ValueError';
                throw error;
            }
            if (typeof value !== 'boolean') {
                error = new Error('Value must be a boolean');
                error.name = 'TypeError';
                throw error;
            }
        }
    }

    /**
     * The function to call when a setting changes.
     * Depending on the setting, this function will call hooks and / or update context flags.
     * 
     * @param {*} value - The new value of the setting.
     * @param {*} context - The context object fot updating the flags.
     * @param {*} formatter - The formatter object for formatting hook names.
     */
    onChangeFunction(value, context, formatter, selectedSetting = this.selectedSetting) {
        if (selectedSetting.props.hooksCalled) {
            selectedSetting.props.hooksCalled.forEach((hook) => {
                this.onChangeCallHook(hook, value, formatter);
            });
        }
        if (selectedSetting.props.contextFlags) {
            selectedSetting.props.contextFlags.forEach(flag => {
                this.onChangeUpdateFlags(context, value);
            })
        }
    }
}

export default Setting;