/**
 * @file hookFormatter.ts
 * @description Hook name formatter utility for FoundryVTT hooks with config support.
 * @path src/utils/hookFormatter.ts
 */

import type { HookFormatterConfig } from './hookFormatter-types.ts';

/**
 * Generates a module-scoped hook name from a hook key.
 *
 * @param {string} hookKey - The key of the hook to format
 * @param {HookFormatterConfig} config - The configuration object
 * @returns {string} The formatted hook name
 *
 * @example
 * formatHookName('settingsReady', config); // 'OMH.SettingsReady'
 */
export function formatHookName(
  hookKey: string,
  config: HookFormatterConfig
): string;

/**
 * Generates a parameterized hook name from a pattern key and parameters.
 *
 * @param {string} patternKey - The key of the hook pattern to use
 * @param {Record<string, string>} params - Parameters to substitute into the pattern
 * @param {HookFormatterConfig} config - The configuration object
 * @returns {string} The formatted hook name
 *
 * @example
 * formatHookName('setting', { settingKey: 'debugMode' }, config); // 'OMH.setting.debugMode'
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
  // Stub implementation; actual logic in T025–T027
  return keyOrPattern;
}
