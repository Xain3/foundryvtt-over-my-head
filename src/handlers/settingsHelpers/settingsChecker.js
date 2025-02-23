// ./src/handlers/settingsFunctions/settingsSetter.js

import Handler from "../../baseClasses/handler";

/**
 * Class representing a settings checker.
 * @extends Handler
 */
class SettingsChecker extends Handler {
    constructor(config, context, utils) {
        super(config, context, utils);
    }

    /**
     * Checks if the settings are ready.
     * @returns {boolean} - True if settings are ready, otherwise false.
     */
    checkSettingsReady(settings) {
        return settings.settingsReady;
    }
}

export default SettingsChecker;