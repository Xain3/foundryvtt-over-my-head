/**
* @file settingsRegistrar.mjs
* @description This file contains the SettingsRegistrar class for registering Foundry VTT settings.
* @path src/handlers/settingsHelpers/settingsRegistrar.mjs
*/

import Handler from "../../baseClasses/handler.mjs";
import FlagEvaluator from "./flagEvaluator.mjs";

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
   * @param {Object} args - Arguments object
   * @param {Object} args.config - Configuration object containing manifest information
   * @param {Object} args.context - Context object for module state
   * @param {Object} args.utils - Utilities object with helper methods
   * @param {string|null} [args.namespace=null] - Optional namespace override, defaults to config.manifest.id
   */
  constructor({ config, context, utils, namespace = null }) {
    super({ config, utils, context });
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
   * @returns {Object} Registration result with success status, message, and failure categorization
   */
  registerSetting(setting) {
    let success = true;
    let message = "";
    let planned = false;
    let reason = 'ok';
    let settingName = this.#getSettingName(setting);

    const checks = this.#runChecks(setting);
    if (!checks.success) {
      success = false;
      planned = false;
      reason = 'invalid-format';
      message = `Failed to register ${settingName}: ${checks.message}`;
      return { success, message, planned, reason, key: settingName };
    }

    // Check flag conditions to determine if setting should be registered
    const flagEvaluatorConfig = this.config?.constants?.flagEvaluator?.contextMapping;
    const shouldShow = FlagEvaluator.shouldShow(
      setting.showOnlyIfFlag,
      setting.dontShowIfFlag,
      this.config,
      flagEvaluatorConfig
    );

    if (!shouldShow) {
      success = false;
      planned = true;
      reason = 'flag-hidden';
      message = `Setting ${settingName} not registered due to flag conditions`;
      return { success, message, planned, reason, key: settingName };
    }

    try {
      globalThis.game.settings.register(this.namespace, setting.key, setting.config);
      message = `Setting ${settingName} registered successfully.`;
    } catch (error) {
      success = false;
      planned = false;
      reason = 'registration-error';
      message = `Failed to register ${settingName}: ${error.message}`;
    }

    return { success, message, planned, reason, key: settingName };
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
   * Initialize an empty aggregate registration result object.
   *
   * @private
   * @returns {{ processed: number, successful: number, registered: string[], failed: string[], plannedExcluded: string[], unplannedFailed: string[], errorMessages: string[] }} Empty result container.
   */
  #initializeRegistrationResult() {
    return {
      processed: 0,
      successful: 0,
      registered: [],
      failed: [],
      // planned exclusions (e.g., hidden by flags) vs unplanned failures (errors)
      plannedExcluded: [],
      unplannedFailed: [],
      errorMessages: []
    };
  }

  /**
   * Registers multiple settings using a provided iterator.
   * @param {Iterable} iterable - The iterable of settings.
   * @param {Function} getSetting - Function to extract the setting from the iterable element.
   * @returns {Object} Registration result summary.
   */
  #registerMultipleSettings(iterable, getSetting) {
    const output = this.#initializeRegistrationResult();

    for (const element of iterable) {
      const setting = getSetting(element);
      const result = this.registerSetting(setting);
      output.processed++;
      
      if (result.success) {
        output.successful++;
        output.registered.push(result.key || "Unknown");
      } else {
        const key = result.key || "Unknown";
        output.failed.push(key);
        output.errorMessages.push(result.message);
        if (result.planned) {
          output.plannedExcluded.push(key);
        } else {
          output.unplannedFailed.push(key);
        }
      }
    }

    return output;
  }


  /**
   * Processes the provided settings for registration
   * @param {Array|Object} settings - The settings to process
   * @returns {Object} - The result of the processing
   */
  #processSettings(settings) {
    if (Array.isArray(settings)) {
      return this.#registerMultipleSettings(settings, element => element);
    } else if (typeof settings === 'object') {
      return this.#registerMultipleSettings(Object.entries(settings), ([, value]) => value);
    }
    return this.#initializeRegistrationResult();
  }

  /**
   * Analyze registration results and log messages depending on planned/unplanned failures.
   * @private
   * @param {Object} registrationResults Aggregate registration result returned by processors
   */
  #analyzeRegistrationResults(registrationResults) {
    const report = this.#generateRegistrationReport(registrationResults);
    if (report.unplanned.length > 0) {
      // Warn only about true failures, but also list planned exclusions distinctly
      this.#warnAboutRegistrationIssues(report);
    } else if (report.planned.length > 0) {
      // Only planned exclusions: log at debug level at most
      this.#logRegistrationExclusions(report);
    }
  }

  /**
   * Generate a human-friendly report structure for registration results.
   * @private
   * @param {Object} registrationResults Aggregate registration result
   * @returns {{unplanned: string[], header: string, registeredList: string, planned: string[]}}
   */
  #generateRegistrationReport(registrationResults) {
    const planned = registrationResults.plannedExcluded || [];
    const unplanned = registrationResults.unplannedFailed || [];
    const header = `SettingsRegistrar: ${registrationResults.successful} out of ${registrationResults.processed} settings were successfully registered.`;
    const registeredList = registrationResults.registered.length ? `Successfully registered settings:\n- ${registrationResults.registered.join("\n- ")}` : "";
    return { unplanned, header, registeredList, planned };
  }

  /**
   * Log only planned registration exclusions at debug level.
   * @private
   * @param {{header:string,registeredList:string,planned:string[]}} report
   */
  #logRegistrationExclusions(report) {
    const sections = [report.header];
    if (report.registeredList) sections.push(report.registeredList);
    sections.push(`Intentionally excluded (flag conditions):\n- ${report.planned.join("\n- ")}`);
    const debugMessage = sections.join("\n        ");
    if (this.utils.logDebug) this.utils.logDebug(debugMessage);
  }

  /**
   * Warn about unplanned registration failures (and include planned exclusions for context).
   * @private
   * @param {{header:string,registeredList:string,planned:string[],unplanned:string[]}} report
   */
  #warnAboutRegistrationIssues(report) {
    const sections = [report.header];
    if (report.registeredList) sections.push(report.registeredList);
    if (report.planned.length > 0) sections.push(`Intentionally excluded (flag conditions):\n- ${report.planned.join("\n- ")}`);
    sections.push(`Failed to register (errors):\n- ${report.unplanned.join("\n- ")}`);
    const warningMessage = sections.join("\n        ");
    this.utils.logWarning && this.utils.logWarning(warningMessage);
  }

  /**
   * Registers multiple settings from an array or object
   * @param {Array|Object} settings - Array of setting objects or object with setting values
   * @returns {Object} Registration result summary with counters, detailed breakdown, and error messages
   */
  register(settings) {
    if (!settings || typeof settings !== 'object') {
      throw new Error(this.utils.formatError("Settings cannot be registered: invalid format"));
    }

    const registrationResults = this.#processSettings(settings);
    
    // Unlike SettingsParser, SettingsRegistrar doesn't throw on empty/failed cases
    // It returns failure results for backward compatibility
    if (registrationResults.successful < registrationResults.processed) {
      this.#analyzeRegistrationResults(registrationResults);
    }

    // Ensure callers receive the detailed breakdown
    registrationResults.plannedExcluded = registrationResults.plannedExcluded || [];
    registrationResults.unplannedFailed = registrationResults.unplannedFailed || [];

    // For backward compatibility, also include legacy format
    const success = registrationResults.successful > 0;
    let message = `Registered ${registrationResults.successful} out of ${registrationResults.processed} settings successfully.`;
    const errorMessages = registrationResults.errorMessages || [];

    if (errorMessages.length > 0) {
      message += ` Errors: ${errorMessages.join('; ')}`;
    }

    return {
      success,
      message,
      counter: registrationResults.processed,
      successCounter: registrationResults.successful,
      errorMessages,
      // Enhanced breakdown for programmatic inspection
      processed: registrationResults.processed,
      successful: registrationResults.successful,
      registered: registrationResults.registered,
      failed: registrationResults.failed,
      plannedExcluded: registrationResults.plannedExcluded,
      unplannedFailed: registrationResults.unplannedFailed
    };
  }
}

export default SettingsRegistrar;