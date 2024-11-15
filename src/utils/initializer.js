// ./src/utils/initializer.js

/**
 * Class representing an Initializer.
 * This class is responsible for initializing the context and registering settings for a module.
 * Dependencies: 
 * - Context
 * - GameManager
 * - SettingsHandler
 * - Logger
 * - HookFormatter
 * 
 * @class
 * @module Initializer
 * @export Initializer
 * @property {Object} config - The configuration object.
 * @property {Object} Context - The context class.
 * @property {Object} gameManager - The game manager.
 * @property {Object} settingsHandler - The settings handler.
 * @property {Object} logger - The logger.
 * @property {Object} hookFormatter - The hook formatter.
 * 
 * @method initializeContext
 * @method initializeRemoteContext
 * @method registerSettings
 * @method initializeModule
 */
class Initializer {
    /**
     * Create an Initializer.
     *
     * @param {Object} config - The configuration object.
     * @param {Object} Context - The context class.
     * @param {Object} gameManager - The game manager.
     * @param {Object} settingsHandler - The settings handler.
     * @param {Object} logger - The logger.
     * @param {Object} hookFormatter - The hook formatter.
     */
    constructor(config, Context, gameManager, logger, hookFormatter) {
        this.config = config;
        this.logger = logger;
        this.Context = Context;
        this.gameManager = gameManager;
        this.hookFormatter = hookFormatter;
    }
    
    /**
     * Checks and returns the provided configuration.
     * If the provided configuration is null, it uses the instance's configuration.
     * Throws an error if no configuration is provided.
     *
     * @param {Object|null} config - The configuration object to check.
     * @returns {Object} The validated configuration object.
     * @throws {Error} If no configuration is provided.
     */
    checkConfig(config) {
        if (config === null && this.config) {
            config = this.config;
        } else if (config === null) {
            throw new Error('No configuration provided');
        }
        return config;
    }

    /**
     * Initialize the context for the module.
     * This method sets up the module configuration and stores it in the context.
     * 
     * @param {Object} config - An optional configuration object to override the default configuration.
     */
    initializeContextObject(config = null) {
        config = this.checkConfig(config);
        this.logger.log('Initializing context');
        const context = new this.Context(config, this.gameManager);
        this.logger.log('Context initialized');
        return context;
    }

    /**
     * Initializes the session with the provided remote context.
     *
     * @param {Object} context - The context object to be initialized.
     * @returns {Object} The initialized context.
     */
    initializeRemoteContext(context) {
        this.logger.log('Initializing session with remote context');
        context.setRemoteLocation(this.gameManager.remoteContext, true);
        this.logger.log('Session initialized');
        return context;
    }

    /**
     * Register the settings for the module.
     * This method registers the settings using the SettingsHandler.
     */
    registerSettings(handlers, context) {
        this.logger.log('Registering settings');
        handlers.settings.registerSettings(context);
        this.logger.log('Settings registered');
    }

    initializeContext(config = null) {
        config = this.checkConfig(config);
        return new Promise((resolve) => {
            Hooks.once('i18nInit', async () => {
                this.context = this.initializeContextObject(config);
                this.context = this.initializeRemoteContext(this.context);
                resolve(this.context);
            });
        });
    }
    /**
     * Initialize the module.
     * This method sets up the necessary hooks and initializes the context and settings once the i18n initialization is complete.
     * 
     * @param {Object} settingsHandler - The settings handler.
     * @param {Object} config - An optional configuration object to override the default configuration.
     * @fires settingsReady
     */
    initializeSettings(config = null) {
        config = this.checkConfig(config);
        this.logger.log('Initializing module');
        Hooks.once('i18nInit', () => {
            settingsReady = this.registerSettings();
            logger.log('Module initialized');
            context.setFlags('settingsReady', true);
            Hooks.callAll(hookFormatter.formatHooks("settingsReady", "out"));
        });
    }

    updateConfig(config) {
        this.config = config;
    }

    getContext() {
        return this.context;
    }
}


export default Initializer;