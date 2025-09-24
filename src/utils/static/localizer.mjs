/**
 * @file localizer.mjs
 * @description This file contains the Localizer class that acts as an interface for Foundry VTT's i18n localization system.
 * @path src/utils/static/localizer.mjs
 */

/**
 * @class Localizer
 * @description Interface for Foundry VTT's i18n localization system.
 * Provides methods to localize strings using Foundry's i18n instance.
 *
 * @export
 */
class Localizer {
    /**
     * Creates a Localizer instance.
     *
     * @param {Object} [i18nInstance] - Optional i18n instance to use. Defaults to game?.i18n
     */
    constructor(i18nInstance = null) {
        // Use provided i18n instance or fallback to Foundry VTT's global game.i18n instance
        this.i18n = i18nInstance || game?.i18n;
    }    /**
     * Localizes a string using Foundry VTT's localization system.
     * This method only translates the string without any variable substitution.
     * For variable substitution, use the format() method instead.
     *
     * @param {string} stringId - The localization key to translate
     * @returns {string} The localized string, or the original string if translation is not found
     * @throws {Error} If no i18n instance is available
     */
    localize(stringId) {
        if (!this.i18n) {
            throw new Error('Foundry VTT i18n instance not available. Ensure this is called after game initialization.');
        }
        return this.i18n.localize(stringId);
    }

    /**
     * Formats a localized string with variable substitution.
     * Uses Foundry VTT's format method for string interpolation with variables.
     * Variables in the localization string should be enclosed in braces: {variable}
     *
     * @param {string} stringId - The localization key to translate
     * @param {Object} [data={}] - Data object for variable substitution
     * @returns {string} The formatted localized string with variables substituted
     * @throws {Error} If no i18n instance is available
     */
    format(stringId, data = {}) {
        if (!this.i18n) {
            throw new Error('Foundry VTT i18n instance not available. Ensure this is called after game initialization.');
        }
        return this.i18n.format(stringId, data);
    }

    /**
     * Checks if a localization key exists in the translation dictionary.
     *
     * @param {string} stringId - The localization key to check
     * @returns {boolean} True if the key exists, false otherwise
     */
    has(stringId) {
        if (!this.i18n) return false;
        return this.i18n.has(stringId);
    }

    /**
     * Static method to localize a string using a provided i18n instance or Foundry VTT's global i18n instance.
     * This method only translates the string without any variable substitution.
     * For variable substitution, use the static format() method instead.
     *
     * @static
     * @param {string} stringId - The localization key to translate
     * @param {Object} [i18nInstance] - Optional i18n instance to use. Defaults to game?.i18n
     * @returns {string} The localized string, or the original string if translation is not found
     * @throws {Error} If no i18n instance is available
     */
    static localize(stringId, i18nInstance = null) {
        const i18n = i18nInstance || game?.i18n;
        if (!i18n) {
            throw new Error('Foundry VTT i18n instance not available. Ensure this is called after game initialization or provide an i18n instance.');
        }
        return i18n.localize(stringId);
    }

    /**
     * Static method to format a localized string with variable substitution.
     * Uses a provided i18n instance or Foundry VTT's global i18n instance for string interpolation.
     * Variables in the localization string should be enclosed in braces: {variable}
     *
     * @static
     * @param {string} stringId - The localization key to translate
     * @param {Object} [data={}] - Data object for variable substitution
     * @param {Object} [i18nInstance] - Optional i18n instance to use. Defaults to game?.i18n
     * @returns {string} The formatted localized string with variables substituted
     * @throws {Error} If no i18n instance is available
     */
    static format(stringId, data = {}, i18nInstance = null) {
        const i18n = i18nInstance || game?.i18n;
        if (!i18n) {
            throw new Error('Foundry VTT i18n instance not available. Ensure this is called after game initialization or provide an i18n instance.');
        }
        return i18n.format(stringId, data);
    }

    /**
     * Static method to check if a localization key exists in the translation dictionary.
     *
     * @static
     * @param {string} stringId - The localization key to check
     * @param {Object} [i18nInstance] - Optional i18n instance to use. Defaults to game?.i18n
     * @returns {boolean} True if the key exists, false otherwise
     */
    static has(stringId, i18nInstance = null) {
        const i18n = i18nInstance || game?.i18n;
        if (!i18n) return false;
        return i18n.has(stringId);
    }
}

export default Localizer;
