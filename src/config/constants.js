// ./config/constants.js

import MODULE_SETTINGS, { MODULE_SETTINGS_INTERFACE } from './moduleSettings.js';

// Context constants
export const CONTEXT = {
    INIT: {
        flags: {
            settingsReady: false, // Flag to indicate if the settings are ready
        },
        data: {

        },
        settings: {

        }
    },
    
    DEFAULTS: {
        REMOTE: {
            ROOT: "module", // Root of the remote context
            PATH: "moduleContext", // Path to the remote context
            DATA_PATH: 'data', // Path to the data
            FLAGS_PATH: 'flags', // Path to the flags
            SETTINGS_PATH: 'settings', // Path to the settings
            TIMESTAMP_KEY: 'timestamp', // Key for the timestamp
            ROOT_MAP: (globalNamespace, module) => {
                return {
                    window: globalNamespace.window,
                    document: globalNamespace.document,
                    game: globalNamespace.game,
                    user: globalNamespace.game?.user,
                    world: globalNamespace.game?.world,
                    canvas: globalNamespace.canvas,
                    ui: globalNamespace.ui,
                    local: globalNamespace.localStorage,
                    session: globalNamespace.sessionStorage,
                    module: module,
                    invalid: null, // Example of an invalid source
                }
            },
        }
    }
};

// Module constants
export const MODULE = {
    
    SHORT_NAME: "OMH", // Short name of the module
    ID: "foundryvtt-over-my-head",  // Module ID
    NAME: "OverMyHead", // Module name
    // CONTEXT_REMOTE: "moduleContext", // Deprecated, use DEFAULT.CONTEXT.REMOTE.PATH instead
    DEFAULTS: {
        DEBUG_MODE: true, // Debug mode default value
        ONLY_GM: true, // Load only for GM default value

    },
    
    SETTINGS: { // Module settings to be loaded by the VTT
        ...MODULE_SETTINGS,
        INTERFACE: MODULE_SETTINGS_INTERFACE,
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
 * @@static {Object} CONTEXT.INIT - Initial context configuration.
 * @static {Object} SETTINGS_CONFIGURATION - Settings configuration options.
 * @static {Object} MODULE - Module-related constants.
 * @static {Object} LOCALIZATION - Localization strings and settings.
 * @static {Object} HANDLERS - Handler functions and utilities.
 */
export class Constants {
    constructor(
        context = CONTEXT,
        module = MODULE,
        localization = LOCALIZATION,
        handlers = HANDLERS
    ) {
        this.CONTEXT = context;
        this.MODULE = module;
        this.LOCALIZATION = localization;
        this.HANDLERS = handlers;
    }
}

const CONSTANTS = new Constants();
export default CONSTANTS;