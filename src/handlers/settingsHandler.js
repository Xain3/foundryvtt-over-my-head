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
  const localizedSettings = SettingLocalizer.localizeSettings(settings, this.utils); // Pass utils instead of localizer instance
    return this.#registrar.register(localizedSettings);
  }

  /**
   * Registers the debugMode setting specifically if it exists in the parsed settings.
   *
   * This method filters the parsed settings to find and register only the debugMode setting.
   * It's useful when you need to register the debug mode setting independently of other
   * settings, such as during early module initialization or for development purposes.
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
    return this.#registrar.register(localizedSetting);
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
}

export default SettingsHandler;