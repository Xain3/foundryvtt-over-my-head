// ./config/constants.js

import manifest from '@manifest'; // Import manifest data
import MODULE_SETTINGS, { MODULE_SETTINGS_INTERFACE } from './moduleSettings.js';

// Context constants
export const CONTEXT = {
    INITIAL_STATE: manifest.constants.context.initialState, // Initial state from module.json

    DEFAULTS: {
        REMOTE: {
            ROOT: manifest.constants.context.remote.root, // Root of the remote context
            PATH: manifest.constants.context.remote.path, // Path to the remote context
            DATA_PATH: manifest.constants.context.remote.dataPath, // Path to the data
            FLAGS_PATH: manifest.constants.context.remote.flagsPath, // Path to the flags
            SETTINGS_PATH: manifest.constants.context.remote.settingsPath, // Path to the settings
            TIMESTAMP_KEY: manifest.constants.context.remote.timestampKey, // Key for the timestamp
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
            }
        }
    }
}

// Module constants
export const MODULE = {
    // Kept for backwards compatibility - import directly from module.json in the future
    SHORT_NAME: manifest.shortName, // Short name of the module from module.json
    ID: manifest.id,  // Module ID from module.json
    NAME: manifest.title, // Module name from module.json (using title field)
    REFER_BY: manifest.referToModuleBy, // If the module's name should be the short name, the title, or the id
    DEFAULTS: {
        DEBUG_MODE: manifest.flags.debugMode, // Default debug mode from module.json
        ONLY_GM: manifest.flags.onlyGM, // Default only GM mode from module.json

    },

    SETTINGS: { // Module settings to be loaded by the VTT
        ...MODULE_SETTINGS,
        INTERFACE: MODULE_SETTINGS_INTERFACE,
    }
}

// Localization paths
const LOCALIZATION = {
    SETTINGS: manifest.constants.localizationPathForSettings // Localization path for settings
}

const HANDLERS = {
    TILE: {
        PLACEABLE_TYPE: manifest.constants.placeables.tile.type,
        ALLOWED_CORNERS: manifest.constants.placeables.tile.allowedCorners,
    },
    TOKEN: {
        PLACEABLE_TYPE: manifest.constants.placeables.token.type,
        ALLOWED_CORNERS: manifest.constants.placeables.token.allowedCorners,
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
        handlers = HANDLERS,
        manifest = manifest
    ) {
        this.CONTEXT = context;
        this.MODULE = module;
        this.LOCALIZATION = localization;
        this.HANDLERS = handlers;
        this.MANIFEST = manifest;
    }
}

const CONSTANTS = new Constants();
export default CONSTANTS;