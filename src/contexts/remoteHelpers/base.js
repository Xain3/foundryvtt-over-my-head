import Base from "@/baseClasses/base";
import RemoteContextRootMap from "./rootMap";
import BaseValidator, { VALID_CONFIG } from "./validators/baseValidator";
import _ from "lodash";

const remoteContextDefaultsPath = 'CONSTANTS.CONTEXT.DEFAULTS.REMOTE'



/**
 * Base class for managing remote contexts within the application.
 * It handles the initialization of configuration, global namespace, module object,
 * and the mapping of context roots.
 *
 * @extends Base
 */
class RemoteContextBase extends Base {
    /**
     * Creates an instance of RemoteContextBase.
     *
     * @constructor
     * @param {object} options - The configuration options for the RemoteContextBase.
     * @param {object} options.config - The configuration object. Must be provided and be a valid object.
     * @param {string} [options.contextRootIdentifier=undefined] - The identifier for the context root. Defaults to the value specified in config constants or 'module'.
     * @param {object} [options.overrideGlobal=null] - Allows overriding the global namespace object (e.g., `window` or `global`). Primarily used for testing.
     * @param {object} [options.overrideModule=null] - Allows overriding the module object. Primarily used for testing.
     * @throws {Error} If the config object is not provided or is not a valid object.
     */
    constructor({
        config,
        contextRootIdentifier = undefined,
        overrideGlobal = null, // Override the global namespace (mostly used for testing)
        overrideModule = null, // Override the module object (mostly used for testing)
        // initializeContext = false // Method is not implemented yet
    }) {
        // Validate arguments first
        BaseValidator.validateArgs({config, contextRootIdentifier, overrideGlobal, overrideModule});

        // Call super constructor
        super({
            config,
            shouldLoadGame: true
        });

        // Initialize properties using the helper method
        this._initializeProperties(config, contextRootIdentifier, overrideGlobal, overrideModule);
    }

    /**
     * Initializes or re-initializes the core properties of the instance.
     * This method centralizes the logic for setting up configuration, identifiers,
     * namespaces, and context maps, used by both the constructor and resetBase.
     *
     * @param {object} config - The configuration object.
     * @param {string|undefined} contextRootIdentifier - The identifier for the context root.
     * @param {object|null} overrideGlobal - Optional override for the global namespace.
     * @param {object|null} overrideModule - Optional override for the module object.
     * @private
     */
    _initializeProperties(config, contextRootIdentifier, overrideGlobal, overrideModule) {
        this.configArgs = config; // Store the config object for later use
        // Note: this.config comes from the Base class after super() is called
        this.remoteContextDefaults = _.get(this.config, remoteContextDefaultsPath, {}); // Get the remote context defaults
        this.rootIdentifier = this._determineRootIdentifier(contextRootIdentifier); // Store the identifier
        this.overrideGlobal = overrideGlobal;
        this.overrideModule = overrideModule;
        this.globalNamespace = this.overrideGlobal || global;
        this.module = this.overrideModule || this.getModule(); // Get the module object
        this.contextRootMap = new RemoteContextRootMap(this.globalNamespace, this);
    }


    /**
     * Determines the root identifier for the context.
     * Validates the provided `contextRootIdentifier`. If it's not a string or is falsy,
     * it logs a warning/info message and returns a default root identifier
     * (either `this.remoteContextDefaults.ROOT` or 'module').
     * Otherwise, it returns the provided `contextRootIdentifier`.
     *
     * @param {string|*} identifier - The potential root identifier provided for the context. Expected to be a string.
     * @returns {string} The validated or default root identifier to be used.
     * @private
     */
    _determineRootIdentifier(identifier, fallback1 = this.remoteContextDefaults.ROOT, fallback2 = 'module') {
        if (!BaseValidator.validateContextRootIdentifier(identifier)) {
            identifier = fallback1 || fallback2;
        }
        return identifier;
    }

    /**
     * Resets the base configuration and context properties for the remote helper.
     * It updates internal state based on the provided configuration and overrides.
     *
     * @param {object} options - The options for resetting the base.
     * @param {object} [options.config=this.configArgs] - The configuration object to use. Defaults to the previously stored config.
     * @param {string|undefined} [options.contextRootIdentifier=undefined] - The identifier for the context root. Defaults to the value from remote context defaults or 'module'.
     * @param {object|null} [options.overrideGlobal=null] - An optional object to override the global namespace (primarily for testing).
     * @param {object|null} [options.overrideModule=null] - An optional object to override the module object (primarily for testing).
     */
    resetBase({
            config = this.configArgs,
            contextRootIdentifier = undefined,
            overrideGlobal = null, // Override the global namespace (mostly used for testing)
            overrideModule = null, // Override the module object (mostly used for testing)
        }) {
        // Validate arguments first
        BaseValidator.validateArgs({config, contextRootIdentifier, overrideGlobal, overrideModule});
        // Re-initialize properties using the helper method
        // Note: this.config comes from the Base class after super() is called
        this._initializeProperties(config, contextRootIdentifier, overrideGlobal, overrideModule);
    }
}

export default RemoteContextBase;