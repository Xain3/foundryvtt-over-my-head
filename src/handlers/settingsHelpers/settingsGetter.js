// ./src/handlers/settingsFunctions/settingsGetter.js

import Handler from "../../baseClasses/managers/handler";

/**
 * Class responsible for retrieving settings values.
 *
 * @class SettingsGetter
 * @extends Handler
 * @param {Object} config - Configuration object.
 * @param {Object} context - Context object.
 * @param {Object} utils - Utility functions.
 */
class SettingsGetter extends Handler {
    constructor(config, context, utils) {
        super(config, context, utils);
    }

    /**
     * Retrieves the value of a specific setting.
     *
     * @param {string} settingKey - The key of the setting to retrieve.
     * @param {string} valueKey - The key of the value within the setting to retrieve.
     * @returns {*} The value of the setting, or null if the setting does not exist.
     */
    getSettingValue(settingKey, valueKey) {
        const setting = this.settings[settingKey];
        if (!setting) {
            this.logger.error(`Setting with key ${settingKey} does not exist.`);
            return null;
        }
        return setting.getValue(valueKey);
    }
}

export default SettingsGetter;