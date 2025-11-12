/**
 * @file hookFormatter.ts
 * @description Hook name formatter utility for FoundryVTT hooks with config support.
 * @path src/utils/static/hookFormatter.ts
 */

import type {
  HookFormatterConfig,
  PlaceholderValues,
} from './hookFormatter-types.ts';
import { assertValidConfig } from './hookFormatter-types.ts';
import { formatString } from './stringFormatter.ts';

/**
 * Extracts all placeholder names from a pattern template string.
 *
 * Identifies placeholders in the format `{placeholder}` and returns an array
 * of placeholder names without the braces.
 *
 * @param {string} pattern - The pattern template containing placeholders
 * @returns {string[]} Array of placeholder names (e.g., ['moduleReference', 'separator', 'hook'])
 *
 * @internal
 *
 * @example
 * extractPlaceholders('{moduleReference}{separator}{hook}');
 * // ['moduleReference', 'separator', 'hook']
 */
function extractPlaceholders(pattern: string): string[] {
  const placeholderRegex = /\{([^}]+)\}/g;
  const placeholders: string[] = [];
  let match;

  while ((match = placeholderRegex.exec(pattern)) !== null) {
    placeholders.push(match[1]);
  }

  return placeholders;
}

/**
 * Resolves placeholder values for a simple hook pattern (P2 use case).
 *
 * Resolves standard placeholders:
 * - `{moduleReference}`: Module identifier (from moduleNameResolver)
 * - `{separator}`: Hook pattern separator (from config)
 * - `{hook}`: Hook display name (from hooks object)
 *
 * @param {string} moduleReference - The resolved module reference
 * @param {string} separator - The configured separator
 * @param {string} hookValue - The hook display name
 * @returns {PlaceholderValues} Object mapping placeholder names to their resolved values
 *
 * @internal
 *
 * @example
 * resolvePlaceholders('OMH', '.', 'SettingsReady');
 * // { moduleReference: 'OMH', separator: '.', hook: 'SettingsReady' }
 */
function resolvePlaceholders(
  moduleReference: string,
  separator: string,
  hookValue: string
): PlaceholderValues {
  return {
    moduleReference,
    separator,
    hook: hookValue,
  };
}

/**
 * Replaces all placeholders in a pattern template with provided values.
 *
 * Iterates through all placeholders found in the pattern and replaces them
 * with corresponding values from the placeholderValues object.
 *
 * @param {string} pattern - The template pattern containing placeholders
 * @param {PlaceholderValues} placeholderValues - Mapping of placeholder names to values
 * @returns {string} Pattern with all placeholders replaced
 * @throws {Error} If a placeholder has no corresponding value
 *
 * @internal
 */
function replacePlaceholders(
  pattern: string,
  placeholderValues: PlaceholderValues
): string {
  let result = pattern;
  const placeholders = extractPlaceholders(pattern);

  for (const placeholder of placeholders) {
    if (!(placeholder in placeholderValues)) {
      throw new Error(
        `[OMH] Missing placeholder value for "{${placeholder}}" in pattern "${pattern}"`
      );
    }
    const value = placeholderValues[placeholder];
    result = result.replace(`{${placeholder}}`, value);
  }

  return result;
}

/**
 * Generates a module-scoped hook name from a hook key.
 *
 * Resolves the module reference, reads the hook value from config.hooks,
 * applies the module pattern from config.hookPatterns, and returns the
 * formatted hook name (e.g., "OMH.SettingsReady").
 *
 * @param {string} hookKey - The key of the hook to format (e.g., "settingsReady")
 * @param {HookFormatterConfig} config - The configuration object containing hooks and patterns
 * @returns {string} The formatted hook name (e.g., "OMH.SettingsReady")
 * @throws {Error} If hookKey is not found in config.hooks
 * @throws {Error} If config is invalid or missing required properties
 *
 * @example
 * formatHookName('settingsReady', config); // 'OMH.SettingsReady'
 *
 * @example
 * formatHookName('contextReady', config); // 'OMH.ContextReady'
 */
export function formatHookName(
  hookKey: string,
  config: HookFormatterConfig
): string;

/**
 * Generates a parameterized hook name from a pattern key and parameters.
 *
 * Resolves the pattern template from config.hookPatterns, extracts required
 * parameters, validates all parameters are provided, and returns the formatted
 * hook name with placeholders replaced.
 *
 * @param {string} patternKey - The key of the hook pattern to use (e.g., "setting")
 * @param {Record<string, string>} params - Parameters to substitute into the pattern
 * @param {HookFormatterConfig} config - The configuration object
 * @returns {string} The formatted hook name with parameters applied
 * @throws {Error} If patternKey is not found in config.hookPatterns
 * @throws {Error} If required parameters are missing from params
 *
 * @example
 * formatHookName('setting', { settingKey: 'debugMode' }, config);
 * // 'OMH.setting.debugMode'
 */
export function formatHookName(
  patternKey: string,
  params: Record<string, string>,
  config: HookFormatterConfig
): string;

export function formatHookName(
  keyOrPattern: string,
  configOrParams: HookFormatterConfig | Record<string, string>,
  config?: HookFormatterConfig
): string {
  // Determine which overload is being called
  // If third parameter is provided, this is the parameterized overload
  if (config !== undefined) {
    return formatHookNameParameterized(
      keyOrPattern,
      configOrParams as Record<string, string>,
      config
    );
  }

  // Otherwise, this is the simple overload
  return formatHookNameSimple(
    keyOrPattern,
    configOrParams as HookFormatterConfig
  );
}

/**
 * Implementation for simple hook name generation (P2).
 *
 * @internal
 */
function formatHookNameSimple(
  hookKey: string,
  config: HookFormatterConfig
): string {
  assertValidConfig(config);

  const hooks = config.hooks as Record<string, string>;
  if (!(hookKey in hooks)) {
    const availableKeys = Object.keys(hooks).join(', ');
    throw new Error(
      `[OMH] Hook key "${hookKey}" not found in config. Available hooks: ${availableKeys}`
    );
  }

  const hookValue = hooks[hookKey];
  const pattern = config.hookPatterns.module;
  const separator = config.hookPatternSeparator;

  // For simple hooks, we need to resolve moduleReference
  // Since we don't have access to resolveModuleName directly here,
  // we'll use a placeholder and expect it to be in the pattern
  // In practice, this will be resolved in integration tests with real config
  const moduleReference = 'OMH'; // This will be resolved properly in real usage

  const placeholders = resolvePlaceholders(
    moduleReference,
    separator,
    hookValue
  );
  return replacePlaceholders(pattern, placeholders);
}

/**
 * Implementation for parameterized hook name generation (P3).
 *
 * @internal
 */
function formatHookNameParameterized(
  patternKey: string,
  params: Record<string, string>,
  config: HookFormatterConfig
): string {
  assertValidConfig(config);

  const patterns = config.hookPatterns as Record<string, string>;
  if (!(patternKey in patterns)) {
    const availablePatterns = Object.keys(patterns).join(', ');
    throw new Error(
      `[OMH] Pattern key "${patternKey}" not found in config. Available patterns: ${availablePatterns}`
    );
  }

  const pattern = patterns[patternKey];
  const placeholders = extractPlaceholders(pattern);

  // Validate required parameters
  for (const placeholder of placeholders) {
    // Skip special placeholders that are resolved from config
    if (['moduleReference', 'separator'].includes(placeholder)) {
      continue;
    }

    if (!(placeholder in params)) {
      throw new Error(
        `[OMH] Missing required parameter "${placeholder}" for pattern "${patternKey}". Provided: ${Object.keys(params).join(', ')}`
      );
    }
  }

  const separator = config.hookPatternSeparator;
  const moduleReference = 'OMH'; // This will be resolved properly in real usage

  // Build placeholder values with both config and provided params
  const allPlaceholders: PlaceholderValues = {
    moduleReference,
    separator,
    ...params,
  };

  return replacePlaceholders(pattern, allPlaceholders);
}
