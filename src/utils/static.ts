/**
 * @file static.ts
 * @description Centralized entrypoint for all static utility classes. Provides a StaticUtils class that aggregates all static utility functionality.
 * @path src/utils/static.ts
 */

import DevModeParser from './static/devModeParser.ts';
import { formatString } from './static/stringFormatter.ts';
import { formatHookName } from './static/hookFormatter.ts';
import { formatError } from './errorFormatter.mts';

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
 * const formatted = StaticUtils.formatString('world', { prefix: 'hello-' });
 *
 * // Use formatHookName functionality
 * const hookName = StaticUtils.formatHookName('settingsReady', config);
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
     * @param keyOrPattern - Hook key (P2) or pattern key (P3)
     * @param configOrParams - Config object (P2) or parameters object (P3)
     * @param config - Optional config for P3 overload
     * @returns The formatted hook name
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
}

export default StaticUtils;
