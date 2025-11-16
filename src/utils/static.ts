/**
 * @file static.ts
 * @description Centralized entrypoint for all static utility classes. Provides a StaticUtils class that aggregates all static utility functionality.
 * @path src/utils/static.ts
 */

import DevModeParser from './static/devModeParser.ts';
import { formatString } from './static/stringFormatter.ts';
import { formatHookName } from './static/hookFormatter.ts';
import { formatError } from './errorFormatter.mts';
import {
  findFoundryDataDir,
  findFoundryDataDirPath,
  getFoundryDataDirPaths,
} from './static/foundryDataDirFinder.ts';
import type {
  FinderOptions,
  FinderConfig,
} from './static/foundryDataDirFinder-types.ts';

// Re-export public type definitions for external use
export type {
  ConfigSource,
  ModeStatus,
  ConfigResult,
  HierarchyKey,
  ModeEvaluationOptions,
  ConfigSingleton,
} from './static-types.ts';

// Re-export string formatter types
export type { FormatOptions } from './static/stringFormatter-types.ts';

// Re-export hook formatter types
export type {
  HookFormatterConfig,
  PlaceholderValues,
} from './static/hookFormatter-types.ts';

// Re-export error formatter types
export type {
  ErrorContext,
  FormatOptions as ErrorFormatOptions,
  ErrorPattern,
} from './errorFormatter-types.ts';

// Re-export foundry data dir finder types
export type {
  PlatformType,
  FinderOptions,
  FindResult,
} from './static/foundryDataDirFinder-types.ts';

/**
 * StaticUtils provides a centralized interface to all static utility functionality.
 * This class aggregates static methods from various utility classes for convenient access.
 *
 * All static utilities should be accessed through this centralized entrypoint
 * rather than directly from their implementation files.
 *
 * @example
 * // Import the StaticUtils class
 * import StaticUtils from '#/utils/static.ts';
 *
 * // Use DevModeParser functionality
 * const result = StaticUtils.DevModeParser.fromConfig(config);
 * const isDev = StaticUtils.DevModeParser.isDevMode(env, module, setting);
 *
 * // Use formatString functionality
 * const formatted = StaticUtils.formatString.format('world', { prefix: 'hello-' });
 *
 * // Use formatHookName functionality
 * // Simple hook (P2): module-scoped hook name
 * const hookName = StaticUtils.formatHookName.format('settingsReady', config);
 * // Returns: 'OMH.SettingsReady'
 *
 * // Parameterized hook (P3): pattern-based hook name with parameters
 * const settingHook = StaticUtils.formatHookName.format(
 *   'setting',
 *   { settingKey: 'debugMode' },
 *   config
 * );
 * // Returns: 'OMH.setting.debugMode'
 *
 * // Use findFoundryDataDir functionality (Node.js/development only)
 * // Pass your config explicitly (this export does not inject defaults).
 * const dataDir = StaticUtils.findFoundryDataDir.find({ config });
 * if (dataDir.found) {
 *   console.log(`Found Foundry at: ${dataDir.path}`);
 * }
 */
class StaticUtils {
  private constructor() {
    throw new Error(
      'StaticUtils is a static utility class and cannot be instantiated'
    );
  }

  /**
   * DevModeParser provides static helpers for evaluating development and debug mode status.
   * Applies the configuration hierarchy: environment variables → module flags → in-game settings.
   */
  static readonly DevModeParser = {
    /**
     * Determine whether development mode should be active.
     * @param envVar - Environment variable value (highest priority)
     * @param moduleFlag - Module manifest flag value (medium priority)
     * @param inGameSetting - In-game setting value (lowest priority)
     * @param options - Optional overrides for evaluation order
     * @returns True when any higher-priority source resolves to true; otherwise false
     */
    isDevMode: DevModeParser.isDevMode.bind(DevModeParser),

    /**
     * Determine whether debug mode should be active.
     * @param envVar - Environment variable value (highest priority)
     * @param moduleFlag - Module manifest flag value (medium priority)
     * @param inGameSetting - In-game setting value (lowest priority)
     * @param options - Optional overrides for evaluation order
     * @returns True when any higher-priority source resolves to true; otherwise false
     */
    isDebugMode: DevModeParser.isDebugMode.bind(DevModeParser),

    /**
     * Convenience wrapper that extracts configuration values from the config singleton.
     * @param config - Config singleton providing access to environment, module, and setting sources
     * @param prefixOverride - Optional override for the configuration prefix
     * @param options - Optional overrides for evaluation order
     * @returns Object describing dev and debug mode status derived from the supplied config
     */
    fromConfig: DevModeParser.fromConfig.bind(DevModeParser),
  };

  /**
   * formatString provides a pure utility for prefixing and/or suffixing strings.
   * Zero external dependencies, deterministic behavior.
   */
  static readonly formatString = {
    /**
     * Formats a string by prepending an optional prefix and/or appending an optional suffix.
     * @param base - The base string to format
     * @param options - Optional formatting configuration
     * @returns The formatted string with prefix and/or suffix applied
     */
    format: formatString,
  };

  /**
   * formatHookName provides utilities for generating FoundryVTT hook names.
   * Supports both simple module-scoped names and parameterized patterns.
   */
  static readonly formatHookName = {
    /**
     * Generates a module-scoped hook name or a parameterized hook name based on arguments.
     *
     * This function has two overloads:
     *
     * **Overload 1 (P2): Simple module-scoped hook**
     * - Generates a hook name from a hook key defined in config.hooks
     * - Applies the module pattern from config.hookPatterns.module
     * - Example: `format('settingsReady', config)` → `'OMH.SettingsReady'`
     *
     * **Overload 2 (P3): Parameterized pattern-based hook**
     * - Generates a hook name from a pattern template with custom parameters
     * - Allows dynamic placeholder substitution beyond standard module/separator/hook
     * - Example: `format('setting', { settingKey: 'debugMode' }, config)` → `'OMH.setting.debugMode'`
     *
     * @param keyOrPattern - Hook key from config.hooks (P2) or pattern key from config.hookPatterns (P3)
     * @param configOrParams - Config object (P2) or parameters object for placeholder substitution (P3)
     * @param config - Config object (required for P3 overload, omitted for P2)
     * @returns The formatted hook name with module reference and separators applied
     * @throws {Error} If hook key or pattern key is not found in config
     * @throws {Error} If required parameters are missing for P3 overload
     *
     * @example
     * // P2: Simple hook
     * const readyHook = StaticUtils.formatHookName.format('settingsReady', config);
     * // 'OMH.SettingsReady'
     *
     * @example
     * // P3: Parameterized hook
     * const settingHook = StaticUtils.formatHookName.format(
     *   'setting',
     *   { settingKey: 'debugMode' },
     *   config
     * );
     * // 'OMH.setting.debugMode'
     */
    format: formatHookName,
  };

  /**
   * errorFormatter centralizes module-aware error formatting logic.
   */
  static readonly errorFormatter = {
    /**
     * Formats errors using the currently configured pattern and separator.
     * @param errorOrMessage - Error instance or string message to format
     * @param options - Optional overrides for caller and stack inclusion
     * @returns Formatted error string with module prefix
     */
    format: formatError,
  };

  /**
   * findFoundryDataDir provides utilities for locating the FoundryVTT data directory.
   * Useful for development and deployment scripts in Node.js environments.
   *
   * Note: These methods are pure exports without config defaults.
   * Initialize with config at call or via a wrapper utility if needed.
   */
  static readonly findFoundryDataDir = {
    /**
     * Finds the FoundryVTT data directory using platform-specific paths.
     * @param options - Configuration options for the search
     * @returns Result object containing the found path and search metadata
     */
    find: findFoundryDataDir,

    /**
     * Convenience method that returns just the path string or empty string if not found.
     * @param options - Configuration options for the search
     * @returns The found path or empty string
     */
    findPath: findFoundryDataDirPath,

    /**
     * Gets platform-specific paths without checking if they exist.
     * @param options - Configuration options
     * @returns Array of potential paths for the platform
     */
    getPaths: getFoundryDataDirPaths,
  };
}

export default StaticUtils;
