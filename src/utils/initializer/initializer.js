// ./src/utils/initializer.js

import Utility from '@baseClasses/utility.js';

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
 * @extends Utility
 * @module Initializer
 * @export Initializer
 *
 * @property {Object} config - The configuration object.
 * @property {Object} utils - The utilities object.
 * @property {Object} logger - The logger object.
 * @property {Object} gameManager - The game manager object.
 * @property {Object} hookFormatter - The hook formatter object.
 * @property {Object} Context - The context class.
 *
 * @method initializeContext
 * @method initializeRemoteContext
 * @method registerSettings
 * @method initializeModule
 */
class Initializer extends Utility {
    /**
     * Create an Initializer.
     *
     * @param {Object} config - The configuration object.
     * @param {Object} utils - The utilities object.
     * @param {Object} Context - The context class.
     */
    constructor(config, utils, Context) {
        super(config);
        this.utils = utils;
        this.logger = this.utils.logger;
        this.gameManager = this.utils.gameManager;
        this.hookFormatter = this.utils.hookFormatter;
        this.Context = Context;
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
    ensureConfig(config) {
        if (config === null && this.config) {
            config = this.config;
        } else if (config === null) {
            throw new Error(`No configuration provided.\nConfig: ${config}\nThis.config: ${this.config}`);
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
        config = this.ensureConfig(config);
        this.logger.log('Initializing context');
        const context = new this.Context(config, this.utils);
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
     *
     * @param {Object} handlers - The settings handlers.
     * @param {Object} context - The context object.
     */
    registerSettings(handlers, context) {
        this.logger.log('Registering settings');
        handlers.settings.registerSettings(context);
        this.logger.log('Settings registered');
    }

    /**
     * Initializes the context with the provided configuration.
     *
     * @param {Object|null} config - The configuration object to initialize the context with. If null, a default configuration will be used.
     * @returns {Promise<Object>} A promise that resolves to the initialized context object.
     */
    initializeContext(config = null) {
        config = this.ensureConfig(config);
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
     * @param {Object} config - An optional configuration object to override the default configuration.
     * @fires settingsReady
     */
    initializeSettings(config = null) {
        config = this.ensureConfig(config);
        this.logger.log('Initializing module');
        Hooks.once('i18nInit', () => {
            settingsReady = this.registerSettings();
            this.logger.log('Module initialized');
            this.context.setFlags('settingsReady', true);
            Hooks.callAll(this.hookFormatter.formatHooks("settingsReady", "out"));
        });
    }
}


export default Initializer;