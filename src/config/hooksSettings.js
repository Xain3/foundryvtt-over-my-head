// ./src/config/hooksSettings.js

/**
 * Configuration object for hook settings.
 * 
 * @property {string[]} NO_PREFIX_GROUPS - Groups that do not require a prefix.
 * @property {string[]} ALLOWED_GROUPS - Allowed groups for hooks.
 * @property {string} DEFAULT_GROUP - Default group for hooks.
 */
const HOOKS_SETTINGS = {
    NO_PREFIX_GROUPS: ["BUILT_IN"], // Groups that do not require a prefix
    ALLOWED_GROUPS: ["OUT", "IN", "BUILT_IN"], // Allowed groups for hooks
    DEFAULT_GROUP: "BUILT_IN", // Default group for hooks
}

export default HOOKS_SETTINGS;