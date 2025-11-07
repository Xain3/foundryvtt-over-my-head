/**
 * @file static.ts
 * @description Centralized entrypoint for all static utility classes. Provides a StaticUtils class that aggregates all static utility functionality.
 * @path src/utils/static.ts
 */

import DevModeParser from './static/devModeParser.ts';

// Re-export public type definitions for external use
export type {
  ConfigSource,
  ModeStatus,
  ConfigResult,
  HierarchyKey,
  ModeEvaluationOptions,
  ConfigSingleton,
} from './static-types.ts';

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
}

export default StaticUtils;
