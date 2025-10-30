/**
 * API Contracts: Development Mode Parser
 *
 * @feature 002-dev-mode-parser
 * @date October 29, 2025
 * @spec ../spec.md
 * @data-model ../data-model.md
 */

// ===== TYPE DEFINITIONS =====

/**
 * Input type for configuration sources.
 * Accepts strings, booleans, or undefined/null values.
 */
export type ConfigSource = string | boolean | undefined | null;

/**
 * Result type for mode status checking.
 * Always returns a boolean value.
 */
export type ModeStatus = boolean;

/**
 * Result type for the fromConfig convenience method.
 * Returns both dev and debug mode status.
 */
export type ConfigResult = {
  devMode: ModeStatus;
  debugMode: ModeStatus;
};

// ===== INTERFACE CONTRACTS =====

/**
 * Static utility class for checking development and debug mode status.
 * All methods are pure functions with no internal state.
 */
export interface DevModeParserStatic {
  /**
   * Check if development mode is enabled.
   *
   * Evaluates the configuration hierarchy: environment variables > module manifest > in-game settings.
   * Returns true if any higher-priority source indicates development mode should be enabled.
   *
   * @param envVar - Environment variable value (highest priority)
   * @param moduleFlag - Module manifest flag value (medium priority)
   * @param inGameSetting - In-game setting value (lowest priority)
   * @returns true if development mode is enabled, false otherwise
   *
   * @example
   * ```typescript
   * const isDev = DevModeParser.isDevMode(
   *   process.env.DEV_MODE,     // "true"
   *   module.flags?.devMode,    // false
   *   game.settings.get('devMode') // true
   * );
   * // Returns: true (env var takes precedence)
   * ```
   */
  isDevMode(
    envVar: ConfigSource,
    moduleFlag: ConfigSource,
    inGameSetting: ConfigSource
  ): ModeStatus;

  /**
   * Check if debug mode is enabled.
   *
   * Evaluates the configuration hierarchy: environment variables > module manifest > in-game settings.
   * Returns true if any higher-priority source indicates debug mode should be enabled.
   * Debug mode is independent from development mode.
   *
   * @param envVar - Environment variable value (highest priority)
   * @param moduleFlag - Module manifest flag value (medium priority)
   * @param inGameSetting - In-game setting value (lowest priority)
   * @returns true if debug mode is enabled, false otherwise
   *
   * @example
   * ```typescript
   * const isDebug = DevModeParser.isDebugMode(
   *   process.env.DEBUG_MODE,   // undefined
   *   module.flags?.debugMode,  // "yes"
   *   game.settings.get('debugMode') // false
   * );
   * // Returns: true (module flag takes precedence)
   * ```
   */
  isDebugMode(
    envVar: ConfigSource,
    moduleFlag: ConfigSource,
    inGameSetting: ConfigSource
  ): ModeStatus;

  /**
   * Convenience method to extract mode values from a config singleton.
   *
   * This method provides a convenient wrapper around the core isDevMode/isDebugMode methods
   * by automatically extracting values from a config singleton instance. The config singleton
   * is expected to provide get() methods for retrieving values from different sources.
   *
   * @param config - Config singleton instance with get() method
   * @param prefixOverride - Optional override for the module prefix (defaults to config.prefix)
   * @returns Object containing both devMode and debugMode status
   *
   * @example
   * ```typescript
   * import { config } from '../config/config';
   *
   * const modes = DevModeParser.fromConfig(config);
   * // Returns: { devMode: true, debugMode: false }
   *
   * const modes = DevModeParser.fromConfig(config, 'MY_MODULE');
   * // Uses 'MY_MODULE' as prefix instead of config.prefix
   * ```
   */
  fromConfig(config: ConfigSingleton, prefixOverride?: string): ConfigResult;
}

// ===== DEPENDENCY CONTRACTS =====

/**
 * Minimal interface for config singleton dependency.
 * Only the methods used by fromConfig() are specified.
 */
export interface ConfigSingleton {
  /**
   * Get a configuration value from the specified source.
   * @param key - Configuration key (e.g., 'devMode', 'debugMode')
   * @param source - Source to retrieve from ('env', 'module', 'setting')
   * @returns Configuration value or undefined if not found
   */
  get(key: string, source: 'env' | 'module' | 'setting'): ConfigSource;

  /**
   * Module prefix used for namespacing (optional override available).
   */
  prefix?: string;
}

// ===== IMPLEMENTATION CONTRACT =====

/**
 * The DevModeParser class implementation contract.
 * This class provides static methods for checking development and debug mode status.
 */
export declare class DevModeParser implements DevModeParserStatic {
  // Private constructor to prevent instantiation
  private constructor();
  isDevMode(
    envVar: ConfigSource,
    moduleFlag: ConfigSource,
    inGameSetting: ConfigSource
  ): ModeStatus;
  isDebugMode(
    envVar: ConfigSource,
    moduleFlag: ConfigSource,
    inGameSetting: ConfigSource
  ): ModeStatus;
  fromConfig(config: ConfigSingleton, prefixOverride?: string): ConfigResult;

  // Static method implementations
  static isDevMode(
    envVar: ConfigSource,
    moduleFlag: ConfigSource,
    inGameSetting: ConfigSource
  ): ModeStatus;

  static isDebugMode(
    envVar: ConfigSource,
    moduleFlag: ConfigSource,
    inGameSetting: ConfigSource
  ): ModeStatus;

  static fromConfig(
    config: ConfigSingleton,
    prefixOverride?: string
  ): ConfigResult;
}

// ===== USAGE EXAMPLES =====

/**
 * Example usage patterns for the DevModeParser API.
 */
export const DevModeParserUsageExamples = {
  /**
   * Basic usage with explicit parameters
   */
  basic: `
import { DevModeParser } from './devModeParser';

const isDev = DevModeParser.isDevMode(
  process.env.DEV_MODE,
  game.modules.get('my-module')?.flags?.devMode,
  game.settings.get('my-module', 'devMode')
);
`,

  /**
   * Using the convenience method with config singleton
   */
  withConfig: `
import { DevModeParser } from './devModeParser';
import { config } from '../config/config';

const { devMode, debugMode } = DevModeParser.fromConfig(config);

if (devMode) {
  console.log('Development mode enabled');
}
if (debugMode) {
  console.log('Debug mode enabled');
}
`,

  /**
   * Conditional logic based on mode status
   */
  conditional: `
import { DevModeParser } from './devModeParser';

function logDebug(message: string) {
  if (DevModeParser.isDebugMode(
    process.env.DEBUG_MODE,
    game.modules.get('my-module')?.flags?.debugMode,
    game.settings.get('my-module', 'debugMode')
  )) {
    console.debug(message);
  }
}
`,
} as const;
