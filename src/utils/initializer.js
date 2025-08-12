/**
 * @file initializer.js
 * @description This file contains the Initializer class responsible for initializing the context and registering settings for a module.
 * @path src/utils/initializer.js
 */

/**
 * Class representing an Initializer.
 * This class is responsible for initializing the context and registering settings for a module.
 *
 * Dependencies:
 * - Context
 * - SettingsHandler
 * - Logger
 * - HookFormatter
 *
 * @class Initializer
 * @export
 *
 * @property {Object} constants - The constants configuration object
 * @property {Object} manifest - The manifest object containing module metadata
 * @property {Object} logger - The logger object
 * @property {Function} formatError - Error formatting function
 * @property {Function} formatHook - Hook formatting function
 * @property {Function} ContextClass - The context class constructor
 * @property {Object} contextInitParams - Parameters for context initialization
 * @property {Object} context - The initialized context instance
 *
 * @method #ensureConfig - Validates and returns configuration object
 * @method _initializeContextObject - Creates and returns a new context instance
 * @method _registerSettings - Registers module settings using handlers
 * @method _localizeSettings - Localizes settings after i18n initialization
 * @method initializeContext - Initializes context with i18n hook
 * @method initializeSettings - Initializes settings with i18n hook
 */
class Initializer {
    /**
     * Creates an Initializer instance.
     *
     * @param {Object} constants - The constants configuration object containing hooks and settings
     * @param {Object} manifest - The manifest object containing module metadata
     * @param {Object} logger - The logger object with log and warn methods
     * @param {Function} formatError - Function to format error messages
     * @param {Function} formatHook - Function to format hook names
     * @param {Function} ContextClass - The context class constructor
     * @param {Object} [contextInitParams] - Optional parameters for context initialization
     */
    constructor(constants, manifest, logger, formatError, formatHook, ContextClass, contextInitParams = undefined) {
        this.constants = constants;
        this.manifest = manifest;
        this.ContextClass = ContextClass;
        this.contextInitParams = contextInitParams;
        this.logger = logger;
        this.formatError = formatError;
        this.formatHook = formatHook;
    }

    /**
     * Validates and returns the provided configuration.
     * If the provided configuration is null, it uses the instance's configuration.
     * Throws an error if no configuration is provided.
     *
     * @private
     * @param {Object|null} config - The configuration object to validate
     * @returns {Object} The validated configuration object
     * @throws {Error} If no configuration is provided
     */
    #ensureConfig(config) {
        if (config === null && this.constants) {
            config = this.constants;
        } else if (config === null) {
            throw new Error(this.formatError(`No configuration provided.\nConfig: ${config}\nThis.config: ${this.constants}`, { includeCaller: true, caller: 'Initializer' }));
        }
        return config;
    }

    /**
     * Public wrapper for creating and initializing a context object.
     * Delegates to the protected _initializeContextObject to retain a clean facade.
     *
     * @public
     * @param {Object} [params=this.contextInitParams] - The parameters to initialize the context with
     * @returns {Object} The initialized context object
     */
    initializeContextObject(params = this.contextInitParams) {
        return this._initializeContextObject(params);
    }

    /**
     * Creates and initializes a context object.
     * This method sets up the module configuration and creates a context instance.
     *
     * @protected
     * @param {Object} [params] - The parameters to initialize the context with
     * @returns {Object} The initialized context object
     * @throws {Error} If invalid parameters are provided
     */
    _initializeContextObject(params = this.contextInitParams) {
        this.logger.log('Initializing context');
        if (!params || typeof params !== 'object') {
            this.logger.warn("Context initialization parameters are invalid. Using defaults instead");
            params = undefined;
        }
        const context = new this.ContextClass(params);
        this.logger.log('Context initialized');
        return context;
    }

    /**
     * Registers the module settings using the provided handlers.
     * This method registers the settings using the SettingsHandler.
     *
     * @protected
     * @param {Object} [handlers] - Optional settings handlers object
     * @param {Object} [handlers.settings] - The settings handler with registerSettings method
     */
    _registerSettings(handlers) {
        this.logger.log('Registering settings');
        if (handlers && handlers.settings && handlers.settings.registerSettings) {
            handlers.settings.registerSettings(this.constants.settings);
            this.logger.log('Settings registered');
        } else {
            this.logger.error("No settings handler found. Skipping registration.");
        }
    }

    /**
     * Localizes settings after i18n initialization.
     * This method ensures settings are properly localized once internationalization is ready.
     *
     * @protected
     * @param {Object} [handlers] - Optional settings handlers object
     * @param {Object} [handlers.settings] - The settings handler with localizeSettings method
     */
    _localizeSettings(handlers) {
        if (handlers && handlers.settings && handlers.settings.localizeSettings) {
            handlers.settings.localizeSettings();
            this.logger.log('Settings localized');
        } else {
            this.logger.warn('No settings localization handler found');
        }
    }

    /**
     * Initializes the context with the provided configuration.
     * Sets up a hook to initialize the context once i18n is ready.
     *
     * @param {Object|null} [config=null] - The configuration object to initialize the context with. If null, uses instance constants
     * @returns {Promise<Object>} A promise that resolves to the initialized context object
     * @fires contextReady - Fired when context initialization is complete
     */
    initializeContext(config = null) {
        config = this.#ensureConfig(config);
        return new Promise((resolve) => {
            Hooks.once('i18nInit', async () => {
                this.context = this._initializeContextObject(config);
                Hooks.callAll(this.formatHook(this.constants.hooks.contextReady));
                resolve(this.context);
            });
        });
    }

    /**
     * Initializes the module settings.
     * This method sets up the necessary hooks and initializes settings once the 'init' hook fires.
     *
     * @param {Object} handlers - The handlers object containing settings handler
     * @param {Object} [handlers.settings] - The settings handler with registerSettings and localizeSettings methods
     * @param {Object|null} [config=null] - An optional configuration object to override the default configuration
     * @fires settingsReady - Fired when settings registration is complete
     */
    initializeSettings(handlers, config = null) {
        config = this.#ensureConfig(config);
        this.logger.log('Initializing module');
        Hooks.once('init', () => {
            this._registerSettings(handlers);
            this.logger.log('Module initialized');
            this.context.setFlags('settingsReady', true);
            Hooks.callAll(this.formatHook(this.constants.hooks.settingsReady));
        });
        // Ensure settings are localized after i18n is ready
        Hooks.once('i18nInit', () => {
            this._localizeSettings(handlers);
        });
    }
}


export default Initializer;