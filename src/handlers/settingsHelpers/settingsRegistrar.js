/**
* @file settingsRegistrar.js
* @description This file contains the SettingsRegistrar class for registering Foundry VTT settings.
* @path src/handlers/settingsHelpers/settingsRegistrar.js
*/

import Handler from "@/baseClasses/handler";
import FlagEvaluator from "./flagEvaluator";

/**
 * SettingsRegistrar class for registering Foundry VTT settings
 * @extends Handler
 * @export
 *
 * Public API:
 * - constructor(config, context, utils, namespace) - Creates a new settings registrar
 * - registerSetting(setting) - Registers a single setting
 * - register(settings) - Registers multiple settings from array or object
 *
 * Inherits from Handler:
 * - config - Configuration object with manifest information
 * - context - Context object for module state
 * - utils - Utilities object with helper methods like formatError
 */
class SettingsRegistrar extends Handler {
  /**
   * Creates a new SettingsRegistrar instance
   * @param {Object} config - Configuration object containing manifest information
   * @param {Object} context - Context object for module state
   * @param {Object} utils - Utilities object with helper methods
   * @param {string|null} namespace - Optional namespace override, defaults to config.manifest.id
   */
  constructor(config, context, utils, namespace = null) {
    super(config, utils, context);
    this.namespace = namespace || this.#getNamespace(config);
  }

  /**
   * @private
   * Retrieves the namespace from the configuration object
   * @param {*} config - The configuration object
   * @returns {string} - The namespace string. It uses the manifest ID if available, otherwise throws an error.
   * @throws {Error} If the configuration is invalid or missing manifest ID
   */
  #getNamespace(config) {
    if (config && config.manifest && config.manifest.id) {
      return config.manifest.id;
    }
    throw new Error("Invalid configuration: missing manifest ID");
  }

  /**
   * Runs validation checks on the provided setting object
   * @param {Object} setting - The setting object to validate
   * @returns {Object} - The result of the validation checks
   */
  #runChecks(setting) {
    if (!setting || typeof setting !== 'object') {
      return { success: false, message: "Invalid setting format" };
    }

    if (!setting.key || setting.key === '' || !setting.config) {
      return { success: false, message: "Missing key or config" };
    }

    if (!globalThis.game || !globalThis.game.settings) {
      return { success: false, message: "Game settings not ready" };
    }

    return { success: true };
  }

  /**
   * Registers a single setting with the Foundry VTT game settings system
   * @param {Object} setting - The setting object to register
   * @param {string} setting.key - The unique key for the setting
   * @param {Object} setting.config - The configuration object for the setting
   * @returns {Object} Registration result with success status and message
   */
  registerSetting(setting) {
    let success = true;
    let message = "";
    let settingName = this.#getSettingName(setting);

    const checks = this.#runChecks(setting);
    if (!checks.success) {
      success = false;
      message = `Failed to register ${settingName}: ${checks.message}`;
      return { success, message };
    }

    // Check flag conditions to determine if setting should be registered
    const shouldShow = FlagEvaluator.shouldShow(
      setting.showOnlyIfFlag,
      setting.dontShowIfFlag,
      this.config
    );

    if (!shouldShow) {
      success = false;
      message = `Setting ${settingName} not registered due to flag conditions`;
      return { success, message };
    }

    try {
      globalThis.game.settings.register(this.namespace, setting.key, setting.config);
      message = `Setting ${settingName} registered successfully.`;
    } catch (error) {
      success = false;
      message = `Failed to register ${settingName}: ${error.message}`;
    }

    return { success, message };
  }

  /**
   * Retrieves the name of the setting
   * @param {Object} setting - The setting object
   * @returns {string} - The name of the setting
   */
  #getSettingName(setting) {
    if (!setting || typeof setting !== 'object' || !setting.key) {
  this.utils.logWarning && this.utils.logWarning("Invalid setting object provided, using default name.");
      return "Unknown Setting";
    }
    if (setting && setting.key !== undefined && setting.key !== null) {
      return setting.key;
    }
    return "Unknown Setting";
  }

  /**
   * Registers multiple settings using a provided iterator.
   * @param {Iterable} iterable - The iterable of settings.
   * @param {Function} getSetting - Function to extract the setting from the iterable element.
   * @returns {Object} Registration result summary.
   */
  #registerMultipleSettings(iterable, getSetting) {
    let counter = 0;
    let successCounter = 0;
    let errorMessages = [];

    for (const element of iterable) {
      const setting = getSetting(element);
      const output = this.registerSetting(setting);
      counter++;
      if (output.success) {
        successCounter++;
      } else {
        errorMessages.push(output.message);
      }
    }

    return { counter, successCounter, errorMessages };
  }


  /**
   * Processes the provided settings for registration
   * @param {Array|Object} settings - The settings to process
   * @returns {Object} - The result of the processing
   */
  #processSettings(settings) {
    let result;
    if (Array.isArray(settings)) {
      result = this.#registerMultipleSettings(settings, element => element);
    } else if (typeof settings === 'object') {
      result = this.#registerMultipleSettings(Object.entries(settings), ([, value]) => value);
    }
    return result;
  }

  /**
   * Registers multiple settings from an array or object
   * @param {Array|Object} settings - Array of setting objects or object with setting values
   * @returns {Object} Registration result summary with counters and error messages
   */
  register(settings) {
    if (!settings || typeof settings !== 'object') {
  throw new Error(this.utils.formatError("Settings cannot be registered: invalid format"));
    }

    const { counter = 0, successCounter = 0, errorMessages = [] } = this.#processSettings(settings);
    const success = successCounter > 0;
    let message = `Registered ${successCounter} out of ${counter} settings successfully.`;

    if (errorMessages.length > 0) {
      message += ` Errors: ${errorMessages.join('; ')}`;
    }

    return { success, message, counter, successCounter, errorMessages };
  }
}

export default SettingsRegistrar;