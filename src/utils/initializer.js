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
 * @method #ensureInitParams - Validates and returns initialization params
 * @method _initializeContextObject - Creates and returns a new context instance
 * @method _registerSettings - Registers module settings using SettingsHandler
 * @method initializeContext - Initializes context with i18n hook
 * @method initializeSettings - Registers settings on init using SettingsHandler
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
     * Validates and returns the provided initialization parameters.
     * If the provided parameters are null, it uses the instance's default parameters.
     * Throws an error if no parameters are provided and no defaults exist.
     *
     * @private
     * @param {Object|null} initParams - The initialization parameters to validate
     * @returns {Object} The validated initialization parameters
     * @throws {Error} If no parameters are provided and no defaults exist
     */
    #ensureInitParams(initParams) {
        // If caller didn't provide params (null/undefined), prefer the instance default
        if (initParams == null) { // covers null and undefined
            return this.contextInitParams;
        }
        // Otherwise return whatever was provided (could be an object)
        return initParams;
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
     * Registers the module settings using the provided SettingsHandler (class or instance).
     * The modern SettingsHandler handles parsing and localization internally.
     *
     * @protected
     * @param {Function|Object} handlerOrClass - SettingsHandler class (constructor) or instance with `register()`
     * @param {Object} [utils] - Optional utilities object passed to SettingsHandler constructor
     * @returns {Object|undefined} The SettingsHandler instance used for registration
     */
    _registerSettings(handlerOrClass, utils) {
        this.logger.log('Registering settings');
        let instance;
        if (handlerOrClass && typeof handlerOrClass.register === 'function') {
            instance = handlerOrClass;
        } else if (typeof handlerOrClass === 'function') {
            instance = new handlerOrClass({ constants: this.constants, manifest: this.manifest }, utils, this.context);
        }
        if (!instance || typeof instance.register !== 'function') {
            this.logger.error('No SettingsHandler provided or invalid handler. Skipping registration.');
            return undefined;
        }
        instance.register();
        this.logger.log('Settings registered');
        return instance;
    }

    /**
     * Initializes the context with the provided initialization parameters.
     * Sets up a hook to initialize the context once i18n is ready.
     *
     * @param {Object|null} [initParams=null] - The initialization parameters for the context. If null, uses instance defaults
     * @returns {Promise<Object>} A promise that resolves to the initialized context object
     * @fires contextReady - Fired when context initialization is complete
     */
    initializeContext(initParams = null) {
        initParams = this.#ensureInitParams(initParams);
        return new Promise((resolve) => {
            Hooks.once('i18nInit', async () => {
                this.context = this._initializeContextObject(initParams);
                Hooks.callAll(this.formatHook(this.constants.hooks.contextReady));
                resolve(this.context);
            });
        });
    }

    /**
     * Initializes the module settings.
     * This method sets up the necessary hooks and initializes settings once the 'i18nInit' hook fires.
     *
     * @param {Function|Object} handlerOrClass - SettingsHandler class (constructor) or instance with `register()`
     * @param {Object} [utils] - Optional utilities object passed to SettingsHandler constructor
     * @fires settingsReady - Fired when settings registration is complete
     */
    initializeSettings(handlerOrClass, utils = undefined) {
        this.logger.log('Initializing module');
        Hooks.once('i18nInit', () => {
            this._registerSettings(handlerOrClass, utils);
            this.logger.log('Module initialized');
            if (this.context && typeof this.context.setFlags === 'function') {
                this.context.setFlags('settingsReady', true);
            } else {
                this.logger.warn('Context not available to set settingsReady flag during initialization.');
            }
            Hooks.callAll(this.formatHook(this.constants.hooks.settingsReady));
        });
    }

    /**
     * Initializes development-specific features if the manifest is flagged for development.
     * Optionally filters features to a specific module.
     *
     * @param {Object} utils - Utility object containing static helpers and loggers.
     * @param {boolean} [filter=false] - Whether to filter features to the current module.
     */
    initializeDevFeatures(utils, filter = false) {
        let moduleFilter;
        if (filter) {
            moduleFilter = this.constants.moduleManagement?.shortName;
        }
        if (this.manifest.flags.dev === true) {
            // Check if utils and required methods exist before calling
            if (utils?.static?.HooksLogger?.proxyFoundryHooks) {
                // Start Hooks proxying for debugging
                utils.static.HooksLogger.proxyFoundryHooks({
                    enabled: true,
                    logLevel: 'debug', // Can be 'log', 'debug', 'info', 'warn', 'error'
                    moduleFilter: moduleFilter
                });
            } else {
                this.logger.warn('HooksLogger utility not available for development features.');
            }
            // Additional development-specific features can be enabled here
            this.logger.log("Development features enabled.");
        }
    }

    confirmInitialization(config, context, utils) {
        utils.logger.log(`Module initialized (${config.manifest.version})`);
        if (context && typeof context.setFlags === 'function') {
            context.setFlags('ready', true);
        } else {
            utils.logger.warn('Context not available to set ready flag during initialization.');
        }
        Hooks.callAll(this.formatHook(this.constants.hooks.ready));
    }
}


export default Initializer;