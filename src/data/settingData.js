// ./src/data/settingData.js

/** 
 * A class to hold the setting data
 * @class
 * 
 * @property {string} id - The unique identifier for the instance.
 * @property {object} data - The data to be stored in the instance.
 * @property {object} context - The context object.
 * @property {object} logger - The logger object.
 * @property {string} MODULE_ID - The module ID.
 */
export class SettingData {
    /**
     * Creates an instance of the class with the given id and data.
     * 
     * @constructor
     * @param {string} id - The unique identifier for the instance.
     * @param {any} data - The data to be stored in the instance.
     * @param {Object} config - The configuration object.
     * @param {Object} context - The context object.
     * @param {Object} logger - The logger object.
     */
    constructor(id, data, config, context, utils) {
        this.id = id;
        this.data = data;
        this.context = context;
        this.utils = utils;
        this.logger = utils.logger;
        this.MODULE_ID = config.CONST.MODULE.ID;

    }

    /**
     * Registers a game setting using the provided module ID, setting ID, and setting data.
     *
     * @function
     * @name registerSetting
     */
    registerSetting() {
        this.logger.debug(`Registering setting: ${this.id}`);
        try {
            if (typeof game !== 'undefined' && game.settings) {
                game.settings.register(this.MODULE_ID, this.id, this.data);
                this.logger.debug(`Setting registered: ${this.id}`);
                
                // Check if 'settings' object exists in context state, if not initialize it
                let settings = this.getOrCreateSettings();
                
                // Set the key this.id to this.data within the 'settings' object
                settings[this.id] = this.data;
                this.context.set('settings', settings);
            } else {
                this.logger.error(`'game.settings' is undefined. Cannot register setting: ${this.id}`);
            }
        } catch (error) {
            this.logger.error(`Error registering setting: ${this.id}`);
            this.logger.error(error);
        }
    }

    getOrCreateSettings() {
            let settings = this.context.get('settings');
            if (!settings) {
                settings = {};
                this.context.set('settings', settings);
            }
            return settings;
    }
}

export default SettingData;