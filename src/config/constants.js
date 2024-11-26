// ./config/constants.js

// INIT constants
const CONTEXT_INIT = {
    flags: {
        settingsReady: false, // Flag to indicate if the settings are ready
    },
    data: {     
    }
}


// Module constants
const MODULE = {
    SHORT_NAME: "OMH", // Short name of the module
    ID: "foundryvtt-over-my-head",  // Module ID
    NAME: "OverMyHead", // Module name
    CONTEXT_REMOTE: "moduleContext", // Context remote path within the module object
    DEFAULTS: {
        DEBUG_MODE: true, // Debug mode default value
    },
    SETTINGS: {}
}

// Localization paths
const LOCALIZATION = {
    SETTINGS: "settings" // Localization path for settings
}


/**
 * An object containing various constants used throughout the application.
 * 
 * @constant
 * @type {Object}
 * @property {any} CONTEXT_INIT - Context initialization constants.
 * @property {any} MODULE - Module-related constants.
 * @property {any} LOCALIZATION - Localization-related constants.
 */
const CONSTANTS = {
    CONTEXT_INIT,
    MODULE,
    LOCALIZATION
}

export default CONSTANTS;