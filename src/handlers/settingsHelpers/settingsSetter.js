// ./src/handlers/settingsFunctions/settingsGetter.js

import Handler from "../../baseClasses/managers/handler";

class SettingsSetter extends Handler {
    constructor(config, context, utils) {
        super(config, context, utils);
    }

    setSettingValue(settingKey, valueKey, value) {
        const setting = this.settings[settingKey];
        if (!setting) {
            this.logger.error(`Setting with key ${settingKey} does not exist.`);
            return;
        }
        setting.setValue(valueKey, value);
    }
}

export default SettingsSetter;