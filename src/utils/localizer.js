// ./src/utils/localizer.js

/**
 * A utility class for localization within a specific module.
 * CONFIG and the game object are passed in the constructor.
 * 
 * @class
 * @module Localizer
 * @since 0.0.1
 * @export Localizer
 * @requires globalThis.game
 *
 * @property {string} MODULE_ID - The ID of the module.
 * @property {Object} gameObject - The game object.
 * @property {Object} i18nService - The i18n service.
 */
class Localizer {
    /**
     * Creates an instance of Localizer.
     * @param {Object} CONFIG - The configuration object containing constants.
     * @param {Object} gameObject - The game object containing the i18n service.
     */
    constructor(CONFIG, gameObject) {
        this.MODULE_ID = CONFIG.CONST.MODULE.ID
        this.gameObject = gameObject
        this.i18nService = this.gameObject.i18n
    }

    /**
     * Localizes a string key using the i18n service.
     * If additional arguments are provided, the string will be formatted with those arguments.
     * 
     * @param {string} stringKey - The key of the string to localize.
     * @param {...any} args - Additional arguments for string formatting.
     * @returns {string} - The localized string.
     */
    localize(stringKey, ...args) {
        if (args.length > 0) {
            return this.i18nService.format(`${this.MODULE_ID}.${stringKey}`, args);
        } else {
            return this.i18nService.localize(`${this.MODULE_ID}.${stringKey}`);
        }    
    }

    /**
     * Updates the configuration with the provided CONFIG object.
     *
     * @param {Object} CONFIG - The configuration object.
     * @param {Object} CONFIG.CONST - The constants object within the configuration.
     * @param {Object} CONFIG.CONST.MODULE - The module object within the constants.
     * @param {string} CONFIG.CONST.MODULE.ID - The ID of the module.
     */
    updateConfig(CONFIG) {
        this.MODULE_ID = CONFIG.CONST.MODULE.ID
    }
}

export default Localizer;