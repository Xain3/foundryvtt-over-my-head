/**
 * @file settingsHandler.js
 * @description Main handler for managing Foundry VTT module settings - coordinates parsing and registration
 * @path src/handlers/settingsHandler.js
 */

import Handler from "../baseClasses/handler.js";
import SettingsParser from "./settingsHelpers/settingsParser.js";
import SettingsRegistrar from "./settingsHelpers/settingsRegistrar.js";
import SettingLocalizer from "./settingsHelpers/settingLocalizer.js";

/**
 * SettingsHandler orchestrates the complete settings management workflow for Foundry VTT modules.
 *
 * This handler coordinates between SettingsParser (which handles parsing and hook setup) and
 * SettingsRegistrar (which handles actual registration with Foundry VTT). It provides a unified
 * interface for managing module settings with automatic hook integration and robust error handling.
 *
 * **Key Features:**
 * - **Unified Interface**: Single class to handle complete settings workflow
 * - **Automatic Parsing**: Settings are parsed during construction with hook setup
 * - **Foundry VTT Integration**: Full compatibility with game.settings.register() API
 * - **Hook Management**: Automatic setup of setting change hooks for reactive configuration
 * - **Error Resilience**: Robust error handling prevents configuration issues from breaking the module
 * - **Flexible Input**: Supports both default config settings and custom runtime settings
 *
 * **Usage Workflow:**
 * 1. Handler reads settings from `config.constants.settings`
 * 2. Settings are parsed and validated with hook setup
 * 3. Settings are registered with Foundry VTT's settings system
 * 4. Change hooks automatically trigger when settings values change
 *
 * **Integration with Foundry VTT:**
 * The handler ensures full compatibility with Foundry's settings API:
 * - Uses `game.settings.register(namespace, key, config)` format
 * - Supports all Foundry setting types (Boolean, Number, String, Object, Array)
 * - Handles all scopes correctly (world, client, user)
 * - Provides proper onChange callback integration
 * - Maintains Foundry's expected configuration structure
 *
 * @class SettingsHandler
 * @extends Handler
 * @export
 *
 * **Public API:**
 * - `constructor(config, utils, context)` - Creates handler and auto-parses settings
 * - `parse(settings)` - Parse settings with optional custom settings object
 * - `register(settings)` - Register settings with Foundry VTT (uses parsed settings by default)
 * - `registerDebugModeSetting()` - Register only the debugMode setting if present
 * - `hasDebugModeSetting()` - Check if debugMode setting exists in parsed settings
 * - `getDebugModeSetting()` - Get the debugMode setting configuration if available
 * - `registerSettingByKey(key)` - Register a single setting by its key
 * - `hasSettingByKey(key)` - Check if a setting with the given key exists
 * - `getSettingByKey(key)` - Get a setting configuration by its key
 * - `registerSettingHook(eventName, callback)` - Register a hook for setting registration events
 * - `triggerSettingHook(eventName, data)` - Trigger a setting registration hook
 * - `removeSettingHook(eventName, callback)` - Remove a setting registration hook
 * - `getRegisteredHooks()` - Get all registered hooks for debugging purposes
 * - `settingsConfig` - Reference to the settings configuration from constants
 * - `parsedSettings` - The parsed and processed settings ready for registration
 *
 * **Inherited from Handler:**
 * - `config` - Configuration object with manifest and constants
 * - `context` - Context object for module state management
 * - `utils` - Utilities object with helper methods
 */
class SettingsHandler extends Handler {
  /**
   * Private parser instance for handling settings parsing and hook setup
   * @type {SettingsParser}
   * @private
   */
  #parser;

  /**
   * Private registrar instance for handling Foundry VTT settings registration
   * @type {SettingsRegistrar}
   * @private
   */
  #registrar;

  /**
   * Private map to store setting registration hooks
   * @type {Map<string, Function[]>}
   * @private
   */
  #settingHooks;

  /**
   * Creates a new SettingsHandler instance and automatically parses the default settings.
   *
   * The constructor initializes the parser and registrar helper classes, stores a reference
   * to the settings configuration, and immediately parses the settings to prepare them
   * for registration. This ensures the handler is ready to register settings immediately
   * after construction.
   *
   * @param {Object} config - Configuration object containing manifest and constants
   * @param {Object} config.constants - Constants object containing settings definition
   * @param {Object} config.constants.settings - Settings configuration with settingsList array
   * @param {Array} config.constants.settings.settingsList - Array of setting definitions
   * @param {string[]} config.constants.settings.requiredKeys - Required keys for validation
   * @param {Object} config.manifest - Module manifest with id and other metadata
   * @param {string} config.manifest.id - Module identifier for settings namespace
   * @param {Object} context - Context object for module state management
   * @param {Object} utils - Utilities object with helper methods
   * @param {Function} utils.formatError - Error formatting utility
   * @param {Function} utils.formatHookName - Hook name formatting utility
   * @param {Function} utils.logWarning - Warning logging utility
   * @param {Function} utils.logDebug - Debug logging utility
   *
   * @example
   * ```javascript
   * const handler = new SettingsHandler(config, utils, context);
   * // Settings are automatically parsed and ready for registration
   * handler.register(); // Registers all parsed settings with Foundry VTT
   * ```
   */
  constructor(config, utils, context) {
    super(config, utils, context);
    this.#parser = new SettingsParser(config, utils, context);
    this.#registrar = new SettingsRegistrar(config, utils, context);
    this.#settingHooks = new Map();

    /**
     * Reference to the settings configuration from constants.
     * Contains the raw settings definition including settingsList and validation rules.
     * @type {Object}
     * @public
     */
    this.settingsConfig = config.constants.settings;

    /**
     * The parsed and processed settings ready for registration.
     * These settings have been validated, processed for hooks, and prepared for Foundry VTT.
     * @type {Array}
     * @public
     */
    this.parsedSettings = this.settingsConfig.settingsList;

    // Parse the settings to set up hooks and validation
    this.parseResult = this.parse(this.parsedSettings);

    // Initialize setting registration hooks
    this.#initializeSettingHooks();
  }

  /**
   * Parses settings configuration and prepares them for registration with Foundry VTT.
   *
   * This method delegates to the SettingsParser to handle:
   * - Validation of setting format and required fields
   * - Setup of onChange hook callbacks for reactive settings
   * - Processing of custom hook names and scope-based hook calling
   * - Error handling and fallback behavior
   *
   * The parser ensures that all settings are in the correct format for Foundry VTT's
   * `game.settings.register()` API while adding enhanced functionality like automatic
   * hook triggering.
   *
   * @param {Object} [settings=this.settingsConfig] - Settings object to parse
   * @param {Array} [settings.settingsList] - Array of setting definitions
   * @param {string[]} [settings.requiredKeys] - Required keys for validation
   * @returns {Object} Parsing result with success status and processed settings
   * @returns {number} returns.processed - Total number of settings processed
   * @returns {number} returns.successful - Number of settings successfully processed
   * @returns {string[]} returns.parsed - Array of keys that were successfully parsed
   * @returns {string[]} returns.failed - Array of keys that failed processing
   *
   * @example
   * ```javascript
   * // Parse default settings from config
   * const result = handler.parse();
   * console.log(`Parsed ${result.successful} of ${result.processed} settings`);
   *
   * // Parse custom settings
   * const customSettings = {
   *   settingsList: [
   *     {
   *       key: 'newSetting',
   *       config: {
   *         name: 'New Setting',
   *         type: Boolean,
   *         default: true,
   *         onChange: { sendHook: true }
   *       }
   *     }
   *   ]
   * };
   * const customResult = handler.parse(customSettings);
   * ```
   */
  parse(settings = this.settingsConfig.settingsList) {
    return this.#parser.parse(settings);
  }

  // Localization helpers moved to SettingLocalizer

  /**
   * Registers settings with Foundry VTT's settings system.
   *
   * This method delegates to the SettingsRegistrar to handle:
   * - Individual setting registration with `game.settings.register()`
   * - Batch processing of multiple settings
   * - Namespace management using the module's manifest ID
   * - Error handling and recovery for failed registrations
   * - Detailed reporting of registration results
   * - Triggering setting registration hooks
   *
   * The registrar ensures that all settings are properly registered with Foundry VTT
   * and provides comprehensive feedback about the registration process.
   *
   * @param {Array|Object} [settings=this.parsedSettings] - Settings to register
   * @returns {Object} Registration result with success status and statistics
   * @returns {boolean} returns.success - Whether all settings registered successfully
   * @returns {number} returns.counter - Total number of settings processed
   * @returns {number} returns.successCounter - Number of settings successfully registered
   * @returns {string[]} returns.errorMessages - Array of error messages for failed registrations
   * @returns {string} returns.message - Summary message of registration results
   *
   * @example
   * ```javascript
   * // Register default parsed settings
   * const result = handler.register();
   * if (result.success) {
   *   console.log(`Successfully registered ${result.successCounter} settings`);
   * } else {
   *   console.warn(`Only ${result.successCounter} of ${result.counter} settings registered`);
   * }
   *
   * // Register custom settings array
   * const customSettings = [
   *   { key: 'setting1', config: { name: 'Setting 1', type: Boolean, default: true } },
   *   { key: 'setting2', config: { name: 'Setting 2', type: String, default: 'value' } }
   * ];
   * const customResult = handler.register(customSettings);
   * ```
   */
  register(settings = this.parsedSettings) {
    // Localize settings before registering them
    const localizedSettings = SettingLocalizer.localizeSettings(settings, this.utils);
    const result = this.#registrar.register(localizedSettings);

    // Trigger hooks for registered settings
    if (result.success && Array.isArray(localizedSettings)) {
      for (const setting of localizedSettings) {
        this.triggerSettingHook('settingRegistered', {
          key: setting.key,
          config: setting.config,
          success: true
        });
      }
      this.triggerSettingHook('settingsReady', {
        registeredCount: result.successCounter,
        totalCount: result.counter
      });
    }

    return result;
  }

  /**
   * Registers the debugMode setting specifically if it exists in the parsed settings.
   *
   * This method filters the parsed settings to find and register only the debugMode setting.
   * It's useful when you need to register the debug mode setting independently of other
   * settings, such as during early module initialization or for development purposes.
   * Also triggers setting registration hooks upon successful registration.
   *
   * @returns {Object} Registration result object
   * @returns {boolean} returns.success - Whether the debugMode setting was registered successfully
   * @returns {number} returns.counter - Number of settings processed (0 or 1)
   * @returns {number} returns.successCounter - Number of settings successfully registered (0 or 1)
   * @returns {string[]} returns.errorMessages - Array of error messages if registration failed
   * @returns {string} returns.message - Summary message of registration result
   *
   * @example
   * ```javascript
   * const handler = new SettingsHandler(config, utils, context);
   * const result = handler.registerDebugModeSetting();
   * if (result.success) {
   *   console.log('Debug mode setting registered successfully');
   * } else {
   *   console.warn('Debug mode setting not found or failed to register');
   * }
   * ```
   */
  registerDebugModeSetting() {
    const debugSetting = this.parsedSettings.find(setting => setting.key === 'debugMode');
    
    if (!debugSetting) {
      return {
        success: false,
        counter: 0,
        successCounter: 0,
        errorMessages: ['Debug mode setting not found in parsed settings'],
        message: 'Debug mode setting not found in parsed settings'
      };
    }

    // Localize the debug setting before registering
    const localizedSetting = SettingLocalizer.localizeSettings([debugSetting], this.utils);
    const result = this.#registrar.register(localizedSetting);

    // Trigger hooks for registered setting
    if (result.success) {
      this.triggerSettingHook('settingRegistered', {
        key: debugSetting.key,
        config: debugSetting.config,
        success: true
      });
    }

    return result;
  }

  /**
   * Convenience method to check if debugMode setting exists in parsed settings.
   *
   * @returns {boolean} True if debugMode setting exists in parsed settings, false otherwise
   *
   * @example
   * ```javascript
   * const handler = new SettingsHandler(config, utils, context);
   * if (handler.hasDebugModeSetting()) {
   *   handler.registerDebugModeSetting();
   * }
   * ```
   */
  hasDebugModeSetting() {
    return this.parsedSettings.some(setting => setting.key === 'debugMode');
  }

  /**
   * Convenience method to get the debugMode setting configuration if it exists.
   *
   * @returns {Object|null} The debugMode setting object if found, null otherwise
   *
   * @example
   * ```javascript
   * const handler = new SettingsHandler(config, utils, context);
   * const debugSetting = handler.getDebugModeSetting();
   * if (debugSetting) {
   *   console.log('Debug mode default value:', debugSetting.config.default);
   * }
   * ```
   */
  getDebugModeSetting() {
    return this.parsedSettings.find(setting => setting.key === 'debugMode') || null;
  }

  /**
   * Registers a setting by its key if it exists in the parsed settings.
   *
   * This method filters the parsed settings to find and register only the setting with
   * the specified key. It's useful when you need to register individual settings
   * independently, such as during conditional initialization or for specific features.
   * Also triggers setting registration hooks upon successful registration.
   *
   * @param {string} key - The key of the setting to register
   * @returns {Object} Registration result object
   * @returns {boolean} returns.success - Whether the setting was registered successfully
   * @returns {number} returns.counter - Number of settings processed (0 or 1)
   * @returns {number} returns.successCounter - Number of settings successfully registered (0 or 1)
   * @returns {string[]} returns.errorMessages - Array of error messages if registration failed
   * @returns {string} returns.message - Summary message of registration result
   *
   * @example
   * ```javascript
   * const handler = new SettingsHandler(config, utils, context);
   * const result = handler.registerSettingByKey('myCustomSetting');
   * if (result.success) {
   *   console.log('Setting registered successfully');
   * } else {
   *   console.warn('Setting not found or failed to register:', result.message);
   * }
   * ```
   */
  registerSettingByKey(key) {
    const setting = this.parsedSettings.find(setting => setting.key === key);
    
    if (!setting) {
      return {
        success: false,
        counter: 0,
        successCounter: 0,
        errorMessages: [`Setting with key '${key}' not found in parsed settings`],
        message: `Setting with key '${key}' not found in parsed settings`
      };
    }

    // Localize the setting before registering
    const localizedSetting = SettingLocalizer.localizeSettings([setting], this.utils);
    const result = this.#registrar.register(localizedSetting);

    // Trigger hooks for registered setting
    if (result.success) {
      this.triggerSettingHook('settingRegistered', {
        key: setting.key,
        config: setting.config,
        success: true
      });
    }

    return result;
  }

  /**
   * Convenience method to check if a setting with the specified key exists in parsed settings.
   *
   * @param {string} key - The key of the setting to check for
   * @returns {boolean} True if setting with the key exists in parsed settings, false otherwise
   *
   * @example
   * ```javascript
   * const handler = new SettingsHandler(config, utils, context);
   * if (handler.hasSettingByKey('myCustomSetting')) {
   *   handler.registerSettingByKey('myCustomSetting');
   * }
   * ```
   */
  hasSettingByKey(key) {
    return this.parsedSettings.some(setting => setting.key === key);
  }

  /**
   * Convenience method to get a setting configuration by its key if it exists.
   *
   * @param {string} key - The key of the setting to retrieve
   * @returns {Object|null} The setting object if found, null otherwise
   *
   * @example
   * ```javascript
   * const handler = new SettingsHandler(config, utils, context);
   * const customSetting = handler.getSettingByKey('myCustomSetting');
   * if (customSetting) {
   *   console.log('Setting default value:', customSetting.config.default);
   * }
   * ```
   */
  getSettingByKey(key) {
    return this.parsedSettings.find(setting => setting.key === key) || null;
  }

  /**
   * Initialize the setting registration hook system.
   * Sets up listeners for common setting registration events.
   *
   * @private
   */
  #initializeSettingHooks() {
    // Register hook for when settings are ready
    const settingsReadyHook = this.config.constants.hooks?.settingsReady;
    if (settingsReadyHook) {
      try {
        const formattedHookName = this.utils.formatHookName(settingsReadyHook);
        this.registerSettingHook('settingsReady', (data) => {
          this.utils.logDebug && this.utils.logDebug(`Settings ready hook triggered: ${formattedHookName}`);
          if (globalThis.Hooks) {
            globalThis.Hooks.callAll(formattedHookName, data);
          }
        });
      } catch (error) {
        this.utils.logWarning && this.utils.logWarning(`Failed to initialize settingsReady hook: ${error.message}`);
      }
    }
  }

  /**
   * Register a hook for setting registration events.
   *
   * This method allows registering callbacks that will be triggered when specific setting
   * registration events occur. This enables event-driven setting registration and allows
   * modules to react to setting registration events.
   *
   * @param {string} eventName - The name of the event to listen for
   * @param {Function} callback - The callback function to execute when the event occurs
   * @returns {boolean} True if the hook was registered successfully, false otherwise
   *
   * @example
   * ```javascript
   * const handler = new SettingsHandler(config, utils, context);
   * 
   * // Register hook for when a setting is registered
   * handler.registerSettingHook('settingRegistered', (data) => {
   *   console.log(`Setting ${data.key} was registered successfully`);
   * });
   * 
   * // Register hook for when all settings are ready
   * handler.registerSettingHook('settingsReady', () => {
   *   console.log('All settings have been initialized');
   * });
   * ```
   */
  registerSettingHook(eventName, callback) {
    if (typeof eventName !== 'string' || typeof callback !== 'function') {
      this.utils.logWarning && this.utils.logWarning('Invalid parameters for registerSettingHook: eventName must be string, callback must be function');
      return false;
    }

    if (!this.#settingHooks.has(eventName)) {
      this.#settingHooks.set(eventName, []);
    }

    this.#settingHooks.get(eventName).push(callback);
    this.utils.logDebug && this.utils.logDebug(`Registered setting hook for event: ${eventName}`);
    return true;
  }

  /**
   * Trigger a setting registration hook.
   *
   * This method executes all registered callbacks for the specified event name.
   * It's used internally to trigger events during setting registration but can
   * also be used externally to trigger custom setting registration events.
   *
   * @param {string} eventName - The name of the event to trigger
   * @param {*} data - Optional data to pass to the hook callbacks
   * @returns {number} The number of callbacks that were executed
   *
   * @example
   * ```javascript
   * const handler = new SettingsHandler(config, utils, context);
   * 
   * // Trigger a custom setting event
   * handler.triggerSettingHook('customEvent', { 
   *   message: 'Custom setting event triggered',
   *   timestamp: Date.now()
   * });
   * ```
   */
  triggerSettingHook(eventName, data = null) {
    if (!this.#settingHooks.has(eventName)) {
      return 0;
    }

    const callbacks = this.#settingHooks.get(eventName);
    let executedCount = 0;

    for (const callback of callbacks) {
      try {
        callback(data);
        executedCount++;
      } catch (error) {
        this.utils.logWarning && this.utils.logWarning(`Error executing setting hook callback for ${eventName}: ${error.message}`);
      }
    }

    this.utils.logDebug && this.utils.logDebug(`Triggered ${executedCount} callbacks for setting hook: ${eventName}`);
    return executedCount;
  }

  /**
   * Remove a setting registration hook.
   *
   * This method removes a previously registered callback for the specified event.
   * Useful for cleanup or when the callback is no longer needed.
   *
   * @param {string} eventName - The name of the event to remove the callback from
   * @param {Function} callback - The specific callback function to remove
   * @returns {boolean} True if the callback was removed, false if not found
   *
   * @example
   * ```javascript
   * const handler = new SettingsHandler(config, utils, context);
   * 
   * const myCallback = (data) => console.log('Setting registered:', data.key);
   * handler.registerSettingHook('settingRegistered', myCallback);
   * 
   * // Later, remove the callback
   * handler.removeSettingHook('settingRegistered', myCallback);
   * ```
   */
  removeSettingHook(eventName, callback) {
    if (!this.#settingHooks.has(eventName)) {
      return false;
    }

    const callbacks = this.#settingHooks.get(eventName);
    const index = callbacks.indexOf(callback);
    
    if (index === -1) {
      return false;
    }

    callbacks.splice(index, 1);
    
    // Remove the event entry if no callbacks remain
    if (callbacks.length === 0) {
      this.#settingHooks.delete(eventName);
    }

    this.utils.logDebug && this.utils.logDebug(`Removed setting hook callback for event: ${eventName}`);
    return true;
  }

  /**
   * Get all registered hooks for debugging purposes.
   *
   * @returns {Object} Object containing event names as keys and callback counts as values
   *
   * @example
   * ```javascript
   * const handler = new SettingsHandler(config, utils, context);
   * const hooks = handler.getRegisteredHooks();
   * console.log('Registered hooks:', hooks);
   * // Output: { settingsReady: 1, settingRegistered: 2 }
   * ```
   */
  getRegisteredHooks() {
    const result = {};
    for (const [eventName, callbacks] of this.#settingHooks.entries()) {
      result[eventName] = callbacks.length;
    }
    return result;
  }
}

export default SettingsHandler;