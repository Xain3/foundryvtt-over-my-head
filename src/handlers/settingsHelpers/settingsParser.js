/**
 * @file settingsParser.js
 * @description Parses settings definitions (array or object) and reports results with counts and warnings.
 * @path src/handlers/settingsHelpers/settingsParser.js
 */

import Handler from "@/baseClasses/handler";
import SettingsChecker from "./settingsChecker";

/**
 * Factory for creating onChange callbacks that trigger hooks when settings change.
 * @type {Object}
 */
const onChangeActions = {
  /**
   * Creates an onChange callback that sends a hook when a setting changes.
   * Uses Hooks.callAll to ensure all listeners are notified without interruption.
   * @param {string} hookName - The hook name to call
   * @returns {Function} The onChange callback function
   */
  onChangeSendHook: (hookName) => {
    return (value) => {
      try {
        // Use Hooks.callAll for setting changes to ensure all listeners are notified
        // without interruption. Setting changes should notify all registered handlers.
        Hooks.callAll(hookName, value);
      } catch (error) {
        console.error(`Failed to trigger hook ${hookName} for setting change:`, error);
      }
    };
  }
};

/**
 * SettingsParser is responsible for validating and parsing module settings.
 *
 * It accepts settings provided either as an Array or as a plain Object map and
 * aggregates parsing results, including processed count, successes, and failures.
 *
 * In case of partial success, a warning will be logged listing succeeded and failed keys.
 *
 * Inherits from Handler to leverage shared constructor behavior and utilities.
 *
 * @class SettingsParser
 * @extends Handler
 * @export
 */
class SettingsParser extends Handler {
  /**
   * Create a SettingsParser.
   *
   * @param {Object} config - Module configuration object.
   * @param {Object} config.constants - Constants container.
   * @param {Object} config.constants.settings - Settings-related constants.
   * @param {Array<string>} config.constants.settings.requiredKeys - Keys required for a valid setting.
   * @param {Object} context - Execution context object.
   * @param {Object} utils - Utilities facade providing logging and error formatting.
   */
  constructor(config, context, utils) {
    super(config, context, utils);
    this.requiredKeys = config.constants.settings.requiredKeys;
  }

  #formatHookName(setting) {
    let hookName;
    if (setting.config && setting.config.onChange) {
      hookName = setting.config.onChange.hookName;
      if (hookName === undefined || hookName === "") {
        if (setting.key) {
          hookName = setting.key;
        } else {
          this.utils.logWarning(`Unknown hook name for setting ${setting.key}`);
          return null;
        }
      }
    }

    try {
      const settingHook = this.config.constants.hooks?.setting || ".setting";
      const formattedHookName = this.utils.formatHookName(`${settingHook}${hookName}`);
      return formattedHookName;
    } catch (error) {
      this.utils.logWarning(`Failed to format hook name for setting ${setting.key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Initialize an empty aggregate parse result object.
   *
   * @private
   * @returns {{ processed: number, successful: number, parsed: string[], failed: string[] }} Empty result container.
   */
  #initializeParseResult() {
    return {
      processed: 0,
      successful: 0,
      parsed: [],
      failed: []
    };
  }

  /**
   * Parse a single setting definition.
   *
   * @private
   * @param {Object} setting - A single setting definition object.
   * @returns {{ success: boolean, key?: string, data: any, message: string }} Parsed result for a single setting.
   */
  #parseSingleSetting(setting) {
    if (!SettingsChecker.check(setting, this.requiredKeys)) {
      return { success: false, data: null, message: `Failed to parse setting: invalid format` };
    }

    const settingKey = setting.key || "Unknown";

    // Check if setting should trigger hooks on change
    if (setting.config && setting.config.onChange && setting.config.onChange.sendHook) {
      const hookName = this.#formatHookName(setting);
      if (!hookName) {
        // Skip hook setup if hook name formatting failed
        this.utils.logWarning(`Skipping hook setup for setting ${settingKey} due to invalid hook name`);
      } else {
        const scope = setting.config.scope || 'world'; // Default to 'world' if not specified

        // Store the original onChange config for reference
        const originalOnChange = { ...setting.config.onChange };

        // Replace the onChange object with the actual callback function
        setting.config.onChange = onChangeActions.onChangeSendHook(hookName);

        // Log successful hook setup for debugging
        this.utils.logDebug && this.utils.logDebug(`Set up hook "${hookName}" for setting "${settingKey}" with scope "${scope}"`);
      }
    } else if (setting.config && setting.config.onChange) {
      // Remove the onChange object if sendHook is false or not specified
      delete setting.config.onChange;
      this.utils.logDebug && this.utils.logDebug(`Removed onChange config for setting "${settingKey}" (sendHook is false)`);
    }

    return { success: true, key: settingKey, data: setting, message: `Successfully parsed setting ${settingKey}` };
  }

  /**
   * Parse settings provided as an array.
   *
   * @private
   * @param {Array<Object>} settings - Array of setting definitions.
   * @returns {{ processed: number, successful: number, parsed: string[], failed: string[] }} Aggregate parse result.
   */
  #parseArraySettings(settings) {
    const output = this.#initializeParseResult();
    if (!Array.isArray(settings)) return output;

    output.processed += settings.length;
    settings.forEach(element => {
      const parsedSetting = this.#parseSingleSetting(element);
      if (parsedSetting.success) {
        output.successful++;
        output.parsed.push(parsedSetting.key || "Unknown");
      } else {
        output.failed.push(parsedSetting.key || "Unknown");
      }
    });
    return output;
  }

  /**
   * Parse settings provided as an object map.
   *
   * @private
   * @param {Object<string, Object>} settings - Map of key to setting definition.
   * @returns {{ processed: number, successful: number, parsed: string[], failed: string[] }} Aggregate parse result.
   */
  #parseObjectSettings(settings) {
    const output = this.#initializeParseResult();
    if (typeof settings !== 'object') return output;

    output.processed += Object.keys(settings).length;
    Object.entries(settings).forEach(([key, value]) => {
      const parsedSetting = this.#parseSingleSetting(value);
      if (parsedSetting.success) {
        output.successful++;
        output.parsed.push(parsedSetting.key || "Unknown");
      } else {
        output.failed.push(parsedSetting.key || "Unknown");
      }
    });
    return output;
  }

  /**
   * Parse incoming settings definitions and return an aggregate result.
   *
   * Throws formatted errors when input is invalid, when no valid settings are found,
   * or when all settings are invalid.
   *
   * When only a subset is valid, logs a warning with details and returns the result.
   *
   * @public
   * @param {Object|Array} settings - Settings provided as array or object map.
   * @returns {{ processed: number, successful: number, parsed: string[], failed: string[] }} Aggregate parse result.
   * @throws {Error} When settings input is invalid or contains no valid entries.
   */
  parse(settings) {
    if (!settings || typeof settings !== 'object') {
      throw new Error(this.utils.formatError("Settings cannot be parsed: invalid format"));
    }

    let parsedSettings;

    if (Array.isArray(settings)) {
      parsedSettings = this.#parseArraySettings(settings);
    } else if (typeof settings === 'object') {
      parsedSettings = this.#parseObjectSettings(settings);
    }

    if (parsedSettings.processed === 0) {
      throw new Error(this.utils.formatError("Settings cannot be parsed: no valid settings found"));
    }
    if (parsedSettings.successful === 0) {
      throw new Error(this.utils.formatError("Settings cannot be parsed: all settings are invalid"));
    }
    if (parsedSettings.successful < parsedSettings.processed) {
      const warningMessage = `SettingsParser: ${parsedSettings.successful} out of ${parsedSettings.processed} settings were successfully parsed.
        Successfully parsed settings:
- ${parsedSettings.parsed.join("\n- ")}
        The following settings failed to parse:
- ${parsedSettings.failed.join("\n- ")}`;
      this.utils.logWarning(warningMessage);
    }
    return parsedSettings;
  }
}

export default SettingsParser;