/**
 * @file settingsParser.js
 * @description Parses settings definitions (array or object) and reports results with counts and warnings.
 * @path src/handlers/settingsHelpers/settingsParser.js
 */

import Handler from "@/baseClasses/handler";
import SettingsChecker from "./settingsChecker";
import FlagEvaluator from "./flagEvaluator";

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
   * Normalize config.type when loaded from YAML where primitives are strings.
   * Converts 'Boolean'|'Number'|'String'|'Object'|'Array' into constructors.
   * Leaves DataField/DataModel/function values untouched.
   * @private
   * @param {Object} setting - The setting to normalize
   */
  #normalizeType(setting) {
    if (!setting || !setting.config) return;
    const { type } = setting.config;
    if (!type) return;

    if (typeof type === 'string') {
      const trimmed = type.trim();
      const lc = trimmed.toLowerCase();

      // Case-insensitive primitives and common synonyms
      const primitiveMap = {
        boolean: Boolean,
        number: Number,
        string: String,
        object: Object,
        array: Array,
        int: Number,
        integer: Number,
        float: Number,
        double: Number
      };
      if (primitiveMap[lc]) {
        setting.config.type = primitiveMap[lc];
        return;
      }

      // Try resolving Foundry paths (e.g., 'foundry.data.fields.BooleanField')
      const resolveFromGlobal = (pathStr) => {
        try {
          const parts = pathStr.split('.').filter(Boolean);
          let ref = globalThis;
          for (const p of parts) {
            if (ref == null) return undefined;
            ref = ref[p];
          }
          return ref;
        } catch {
          return undefined;
        }
      };

      // Direct dotted path
      let resolved = trimmed.includes('.') ? resolveFromGlobal(trimmed) : undefined;

      // Aliases for DataField classes when only class name is provided
      if (!resolved && /field$/i.test(trimmed)) {
        const className = trimmed.replace(/^.*\./, ''); // strip any prefix
        const fieldsRoot = globalThis?.foundry?.data?.fields;
        const candidate = fieldsRoot?.[className];
        if (typeof candidate === 'function') {
          resolved = candidate;
        } else if (fieldsRoot) {
          // Try common canonical names mapping to Foundry fields when user wrote primitive names
          const canonicalMap = {
            booleanfield: fieldsRoot.BooleanField,
            stringfield: fieldsRoot.StringField,
            numberfield: fieldsRoot.NumberField,
            arrayfield: fieldsRoot.ArrayField,
            objectfield: fieldsRoot.ObjectField,
            schemafield: fieldsRoot.SchemaField
          };
          const lk = className.toLowerCase();
          if (typeof canonicalMap[lk] === 'function') resolved = canonicalMap[lk];
        }
      }

      // Prefix notations like 'datafield:boolean' or 'field:boolean'
      if (!resolved && /^(datafield|field):/i.test(trimmed)) {
        const name = trimmed.split(':')[1] || '';
        const className = `${name.charAt(0).toUpperCase()}${name.slice(1).toLowerCase()}Field`;
        const candidate = globalThis?.foundry?.data?.fields?.[className];
        if (typeof candidate === 'function') resolved = candidate;
      }

      // DataModel path alias
      if (!resolved && /^datamodel:/i.test(trimmed)) {
        const mm = trimmed.split(':')[1];
        if (mm) {
          resolved = resolveFromGlobal(mm) || globalThis?.foundry?.abstract?.DataModel;
        } else {
          resolved = globalThis?.foundry?.abstract?.DataModel;
        }
      }

      if (typeof resolved === 'function') {
        setting.config.type = resolved;
      }
    }
  }
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
  constructor(config, utils, context) {
    super(config, utils, context);
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
          this.utils.logWarning && this.utils.logWarning(`Unknown hook name for setting ${setting.key}`);
          return null;
        }
      }
    }

    try {
      const settingHook = this.config.constants.hooks?.setting || ".setting";
      const formattedHookName = this.utils.formatHookName(`${settingHook}${hookName}`);
      return formattedHookName;
    } catch (error) {
      this.utils.logWarning && this.utils.logWarning(`Failed to format hook name for setting ${setting.key}: ${error.message}`);
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
  failed: [],
  // planned exclusions (e.g., hidden by flags) vs unplanned failures (errors)
  plannedExcluded: [],
  unplannedFailed: []
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
  return { success: false, key: (setting && setting.key) || "Unknown", data: null, planned: false, reason: 'invalid-format', message: `Failed to parse setting: invalid format` };
    }

    const settingKey = setting.key || "Unknown";

    // Check flag conditions to determine if setting should be shown
    const flagEvaluatorConfig = this.config?.constants?.flagEvaluator?.contextMapping;
    const shouldShow = FlagEvaluator.shouldShow(
      setting.showOnlyIfFlag,
      setting.dontShowIfFlag,
      this.config,
      flagEvaluatorConfig
    );

    if (!shouldShow) {
      return {
        success: false,
        key: settingKey,
        data: null,
        planned: true,
        reason: 'flag-hidden',
        message: `Setting ${settingKey} hidden due to flag conditions`
      };
    }

  // Ensure the type is in a Foundry-acceptable format (constructor/function/DataField)
  this.#normalizeType(setting);

    // Check if setting should trigger hooks on change
    if (setting.config && setting.config.onChange && setting.config.onChange.sendHook) {
      const hookName = this.#formatHookName(setting);
      if (!hookName) {
        // Skip hook setup if hook name formatting failed
        this.utils.logWarning && this.utils.logWarning(`Skipping hook setup for setting ${settingKey} due to invalid hook name`);
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

  return { success: true, key: settingKey, data: setting, reason: 'ok', message: `Successfully parsed setting ${settingKey}` };
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
        const key = parsedSetting.key || "Unknown";
        output.failed.push(key);
        if (parsedSetting.planned) {
          output.plannedExcluded.push(key);
        } else {
          output.unplannedFailed.push(key);
        }
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
        const k = parsedSetting.key || "Unknown";
        output.failed.push(k);
        if (parsedSetting.planned) {
          output.plannedExcluded.push(k);
        } else {
          output.unplannedFailed.push(k);
        }
      }
    });
    return output;
  }

  /**
   * Analyze parsed settings and log messages depending on planned/unplanned failures.
   * @private
   * @param {Object} parsedSettings Aggregate parse result returned by parsers
   */
  #analyzeParsedSettings(parsedSettings) {
    const report = this.#generateSettingsReport(parsedSettings);
    if (report.unplanned.length > 0) {
      // Warn only about true failures, but also list planned exclusions distinctly
      this.#warnAboutParsingIssues(report);
    } else if (report.planned.length > 0) {
      // Only planned exclusions: log at debug level at most
      this.#logParsingExclusions(report);
    }
  }

  /**
   * Generate a human-friendly report structure for parsed settings.
   * @private
   * @param {Object} parsedSettings Aggregate parse result
   * @returns {{unplanned: string[], header: string, parsedList: string, planned: string[]}}
   */
  #generateSettingsReport(parsedSettings) {
    const planned = parsedSettings.plannedExcluded || [];
    const unplanned = parsedSettings.unplannedFailed || [];
    const header = `SettingsParser: ${parsedSettings.successful} out of ${parsedSettings.processed} settings were successfully parsed.`;
    const parsedList = parsedSettings.parsed.length ? `Successfully parsed settings:\n- ${parsedSettings.parsed.join("\n- ")}` : "";
    return { unplanned, header, parsedList, planned };
  }

  /**
   * Log only planned parsing exclusions at debug level.
   * @private
   * @param {{header:string,parsedList:string,planned:string[]}} report
   */
  #logParsingExclusions(report) {
    const sections = [report.header];
    if (report.parsedList) sections.push(report.parsedList);
    sections.push(`Intentionally excluded (flag conditions):\n- ${report.planned.join("\n- ")}`);
    const debugMessage = sections.join("\n        ");
    if (this.utils.logDebug) this.utils.logDebug(debugMessage);
  }

  /**
   * Warn about unplanned parsing failures (and include planned exclusions for context).
   * @private
   * @param {{header:string,parsedList:string,planned:string[],unplanned:string[]}} report
   */
  #warnAboutParsingIssues(report) {
    const sections = [report.header];
    if (report.parsedList) sections.push(report.parsedList);
    if (report.planned.length > 0) sections.push(`Intentionally excluded (flag conditions):\n- ${report.planned.join("\n- ")}`);
    sections.push(`Failed to parse (errors):\n- ${report.unplanned.join("\n- ")}`);
    const warningMessage = sections.join("\n        ");
    this.utils.logWarning && this.utils.logWarning(warningMessage);
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
   * @returns {{ processed: number, successful: number, parsed: string[], failed: string[], plannedExcluded: string[], unplannedFailed: string[] }} Aggregate parse result with failure breakdown.
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
      this.#analyzeParsedSettings(parsedSettings);
    }

    // Ensure callers receive the detailed breakdown
    parsedSettings.plannedExcluded = parsedSettings.plannedExcluded || [];
    parsedSettings.unplannedFailed = parsedSettings.unplannedFailed || [];

    return parsedSettings;
  }

  #analyzeParsedSettings(parsedSettings) {
    const report = this.#generateSettingsReport(parsedSettings);
    if (report.unplanned.length > 0) {
      // Warn only about true failures, but also list planned exclusions distinctly
      this.#warnAboutParsingIssues(report);
    } else if (report.planned.length > 0) {
      // Only planned exclusions: log at debug level at most
      this.#logParsingExclusions(report);
    }
  }

  #generateSettingsReport(parsedSettings) {
    const planned = parsedSettings.plannedExcluded || [];
    const unplanned = parsedSettings.unplannedFailed || [];
    const header = `SettingsParser: ${parsedSettings.successful} out of ${parsedSettings.processed} settings were successfully parsed.`;
    const parsedList = parsedSettings.parsed.length ? `Successfully parsed settings:\n- ${parsedSettings.parsed.join("\n- ")}` : "";
    return { unplanned, header, parsedList, planned };
  }

  #logParsingExclusions(report) {
    const sections = [report.header];
    if (report.parsedList) sections.push(report.parsedList);
    sections.push(`Intentionally excluded (flag conditions):\n- ${report.planned.join("\n- ")}`);
    const debugMessage = sections.join("\n        ");
    if (this.utils.logDebug) this.utils.logDebug(debugMessage);
  }

  #warnAboutParsingIssues(report) {
    const sections = [report.header];
    if (report.parsedList) sections.push(report.parsedList);
    if (report.planned.length > 0) sections.push(`Intentionally excluded (flag conditions):\n- ${report.planned.join("\n- ")}`);
    sections.push(`Failed to parse (errors):\n- ${report.unplanned.join("\n- ")}`);
    const warningMessage = sections.join("\n        ");
    this.utils.logWarning && this.utils.logWarning(warningMessage);
  }
}

export default SettingsParser;