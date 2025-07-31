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
 * - GameManager
 * - SettingsHandler
 * - Logger
 * - HookFormatter
 *
 * @class Initializer
 * @export
 *
 * @property {Object} config - The configuration object
 * @property {Object} logger - The logger object
 * @property {Function} ContextClass - The context class constructor
 * @property {Object} context - The initialized context instance
 *
 * @method ensureConfig - Validates and returns configuration object
 * @method initializeContextObject - Creates and returns a new context instance
 * @method registerSettings - Registers module settings using handlers
 * @method initializeContext - Initializes context with i18n hook
 * @method initializeSettings - Initializes settings with i18n hook
 */
class Initializer {
    /**
     * Creates an Initializer instance.
     *
     * @param {Object} constants - The configuration object
     * @param {Object} logger - The logger object
     * @param {Function} ContextClass - The context class constructor
     */
    constructor(constants, manifest, logger, formatError, ContextClass, contextInitParams = undefined) {
        this.constants = constants;
        this.manifest = manifest;
        this.ContextClass = ContextClass;
        this.contextInitParams = contextInitParams;
        this.logger = logger;
        this.formatError = formatError;
    }

    /**
     * Validates and returns the provided configuration.
     * If the provided configuration is null, it uses the instance's configuration.
     * Throws an error if no configuration is provided.
     *
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
     * Creates and initializes a context object.
     * This method sets up the module configuration and creates a context instance.
     *
     * @param {Object} params - The parameters to initialize the context with
     * @returns {Object} The initialized context object
     * @throws {Error} If invalid parameters are provided
     */
    initializeContextObject(params = this.contextInitParams) {
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
     * @param {Object} handlers - The settings handlers object
     * @param {Object} handlers.settings - The settings handler with registerSettings method
     * @param {Object} config - The configuration object to register settings
     */
    registerSettings(handlers, config) {
        this.logger.log('Registering settings');
        handlers.settings.registerSettings(config = this.constants);
        this.logger.log('Settings registered');
    }

    /**
     * Initializes the context with the provided configuration.
     * Sets up a hook to initialize the context once i18n is ready.
     *
     * @param {Object|null} [config=null] - The configuration object to initialize the context with. If null, uses instance config
     * @returns {Promise<Object>} A promise that resolves to the initialized context object
     */
    initializeContext(config = null) {
        config = this.#ensureConfig(config);
        return new Promise((resolve) => {
            Hooks.once('i18nInit', async () => {
                this.context = this.initializeContextObject(config);
                resolve(this.context);
            });
        });
    }

    /**
     * Initializes the module settings.
     * This method sets up the necessary hooks and initializes settings once i18n initialization is complete.
     *
     * @param {Object|null} [config=null] - An optional configuration object to override the default configuration
     * @fires settingsReady
     */
    initializeSettings(config = null) {
        config = this.#ensureConfig(config);
        this.logger.log('Initializing module');
        Hooks.once('init', () => {
            this.registerSettings();
            this.logger.log('Module initialized');
            this.context.setFlags('settingsReady', true);
            Hooks.callAll(this.constants.hooks.settingsReady);
        });
    }
}


export default Initializer;