// ./config/constants.js

// Module constants
export const MODULE = {
    SHORT_NAME: "OMH", // Short name of the module
    ID: "foundryvtt-over-my-head",  // Module ID
    NAME: "OverMyHead", // Module name
}

// Debug settings
export const DEBUG = {
    DEBUG_MODE: true  // Debug mode default value
}

// Hooks settings
export const HOOKS = {
    NO_PREFIX_GROUPS: ["builtIn"], // Groups that do not require a prefix
    ALLOWED_GROUPS: ["out", "in", "builtIn"], // Allowed groups for hooks
    DEFAULT_GROUP: "builtIn", // Default group for hooks
}

const CONST = {
    MODULE,
    DEBUG,
    HOOKS
}

export default CONST;