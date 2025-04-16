// ./config/constants.js

import MODULE_SETTINGS, { MODULE_SETTINGS_INTERFACE } from './moduleSettings.js';

// INIT constants
const CONTEXT_INIT = {
    flags: {
        settingsReady: false, // Flag to indicate if the settings are ready
    },
    data: {     
    }
}

// Module constants
export const MODULE = {
    
    SHORT_NAME: "OMH", // Short name of the module
    ID: "foundryvtt-over-my-head",  // Module ID
    NAME: "OverMyHead", // Module name
    CONTEXT_REMOTE: "moduleContext", // Context remote path within the context root object
    DEFAULTS: {
        DEBUG_MODE: true, // Debug mode default value
        ONLY_GM: true, // Load only for GM default value
        REMOTE_CONTEXT_ROOT: "module", // Root of the remote context
    },
    
    SETTINGS: {
        ...MODULE_SETTINGS,
        INTERFACE: MODULE_SETTINGS_INTERFACE
    }
}

// Localization paths
const LOCALIZATION = {
    SETTINGS: "settings" // Localization path for settings
}

const HANDLERS = {
    TILE: {
        PLACEABLE_TYPE: "tiles",
        ALLOWED_CORNERS: ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'],
    },
    TOKEN: {
        PLACEABLE_TYPE: "tokens",
        ALLOWED_CORNERS: ['topLeft', 'bottomLeft', 'topRight', 'bottomRight'],
    }
}

/*
/**
 * Constants used across the application for configuration and localization.
 *
 * @class CONSTANTS
 * @@static {Object} CONTEXT_INIT - Initial context configuration.
 * @static {Object} SETTINGS_CONFIGURATION - Settings configuration options.
 * @static {Object} MODULE - Module-related constants.
 * @static {Object} LOCALIZATION - Localization strings and settings.
 * @static {Object} HANDLERS - Handler functions and utilities.
 */
export class Constants {
    constructor(
        contextInit = CONTEXT_INIT,
        module = MODULE,
        localization = LOCALIZATION,
        handlers = HANDLERS
    ) {
        this.CONTEXT_INIT = contextInit;
        this.MODULE = module;
        this.LOCALIZATION = localization;
        this.HANDLERS = handlers;
    }
}

const CONSTANTS = new Constants();
export default CONSTANTS;