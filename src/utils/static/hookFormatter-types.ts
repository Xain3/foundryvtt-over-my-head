/**
 * @file hookFormatter-types.ts
 * @description Type definitions for the hook formatter utility.
 * @path src/utils/static/hookFormatter-types.ts
 */

/**
 * Configuration structure for hook formatting operations.
 *
 * This interface defines the expected shape of hook configuration data,
 * extracted from hooks.yaml and used to generate properly-formatted hook names.
 *
 * @interface HookFormatterConfig
 * @export
 *
 * @property {Record<string, string>} hooks - Mapping of hook keys to their display names
 *   Example: { settingsReady: "SettingsReady", contextReady: "ContextReady" }
 *
 * @property {Record<string, string>} hookPatterns - Template patterns for hook name generation
 *   Example: { module: "{moduleReference}{separator}{hook}", setting: "{moduleReference}{separator}setting{separator}{settingKey}" }
 *
 * @property {string} hookPatternSeparator - Separator used in hook names (typically ".")
 *   Example: "."
 */
export interface HookFormatterConfig {
  hooks: Record<string, string>;
  hookPatterns: Record<string, string>;
  hookPatternSeparator: string;
}

/**
 * Internal type for storing placeholder values during template replacement.
 *
 * Maps placeholder names (e.g., "moduleReference", "separator", "hook")
 * to their resolved values for injection into pattern templates.
 *
 * @internal
 */
export type PlaceholderValues = Record<string, string>;

/**
 * Validates that a config object has the required structure for hook formatting.
 *
 * Performs runtime type-checking to ensure config contains all required properties:
 * - hooks: Record<string, string>
 * - hookPatterns: Record<string, string>
 * - hookPatternSeparator: string
 *
 * @param {unknown} config - The config object to validate
 * @throws {Error} If config is missing required properties or has incorrect types
 * @export
 *
 * @example
 * try {
 *   assertValidConfig(config);
 * } catch (error) {
 *   console.error('[OMH] Invalid hook config:', error.message);
 * }
 */
export function assertValidConfig(
  config: unknown
): asserts config is HookFormatterConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('[OMH] Invalid hook config: config must be an object');
  }

  const obj = config as Record<string, unknown>;

  if (!obj.hooks || typeof obj.hooks !== 'object') {
    throw new Error(
      '[OMH] Invalid hook config: missing or invalid "hooks" property (must be an object)'
    );
  }

  if (!obj.hookPatterns || typeof obj.hookPatterns !== 'object') {
    throw new Error(
      '[OMH] Invalid hook config: missing or invalid "hookPatterns" property (must be an object)'
    );
  }

  if (typeof obj.hookPatternSeparator !== 'string') {
    throw new Error(
      '[OMH] Invalid hook config: missing or invalid "hookPatternSeparator" property (must be a string)'
    );
  }
}
