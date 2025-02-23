// ./src/config/hooksSettings.js

import CONSTANTS from "./constants.js";

// Fallback prefix for hooks to be used if the module has no short name
const fallbackPrefix = "OMH:";

// If the module has a short name, use it as the default prefix
// Otherwise, use the custom prefix
export const getPrefix = (customPrefix = CONSTANTS.MODULE.SHORT_NAME, fallback = fallbackPrefix) => {
    if (typeof customPrefix !== "string" || customPrefix.trim() === "") {
        if (typeof fallback !== "string" || fallback.trim() === "") {
            throw new Error("The custom prefix and the fallback prefix must be strings.");
        }
        return fallback;
    }
    return customPrefix;
}

/**
 * Configuration class for hook settings.
 * 
 * @property {string[]} NO_PREFIX_GROUPS - Groups that do not require a prefix.
 * @property {string[]} ALLOWED_GROUPS - Allowed groups for hooks.
 * @property {string} DEFAULT_GROUP - Default group for hooks.
 */
class HOOKS_SETTINGS {
    static NO_PREFIX_GROUPS = ["BUILT_IN"]; // Groups that do not require a prefix
    static ALLOWED_GROUPS = ["OUT", "IN", "BUILT_IN"]; // Allowed groups for hooks
    static DEFAULT_GROUP = "BUILT_IN"; // Default group for hooks
    static DEFAULT_PREFIX = getPrefix(); // Default prefix for hooks
}

export default HOOKS_SETTINGS;