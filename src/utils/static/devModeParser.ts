/**
 * @file devModeParser.ts
 * @description Static utility for evaluating development and debug mode status according to configuration hierarchy.
 * @feature 002-dev-mode-parser
 * @path src/utils/static/devModeParser.ts
 */

export type ConfigSource = string | boolean | undefined | null;

export type ModeStatus = boolean;

export type ConfigResult = {
  devMode: ModeStatus;
  debugMode: ModeStatus;
};

export type HierarchyKey = 'env' | 'module' | 'setting';

export type ModeEvaluationOptions = {
  hierarchy?: readonly HierarchyKey[];
};

export interface ConfigSingleton {
  get(key: string, source: 'env' | 'module' | 'setting'): ConfigSource;
  prefix?: string;
}

const LOG_PREFIX = '[DevModeParser]';

const DEFAULT_HIERARCHY: readonly HierarchyKey[] = ['env', 'module', 'setting'];

const TRUTHY_STRINGS = new Set(['true', '1', 'yes', 'on']);
const FALSY_STRINGS = new Set(['false', '0', 'no', 'off']);

/**
 * Coerces a raw configuration source value into a boolean representation.
 * Normalizes common string variants, supports primitive types, and logs when
 * encountering unexpected input so callers can correct misconfigurations.
 *
 * @param value - Raw value sourced from configuration hierarchy.
 * @param sourceLabel - Human-readable label describing the origin for logging.
 * @returns Boolean interpretation of the provided value.
 */
function _coerceToBoolean(
  value: ConfigSource,
  sourceLabel: string = 'value'
): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return false;
    }

    if (TRUTHY_STRINGS.has(normalized)) {
      return true;
    }

    if (FALSY_STRINGS.has(normalized)) {
      return false;
    }

    console.warn(
      `${LOG_PREFIX} Unexpected string for ${sourceLabel}: "${value}". Treating as false.`
    );
    return false;
  }

  if (typeof value === 'number') {
    const coerced = value !== 0;
    console.warn(
      `${LOG_PREFIX} Unexpected number for ${sourceLabel}: ${value}. Treating as ${coerced}.`
    );
    return coerced;
  }

  console.warn(
    `${LOG_PREFIX} Unexpected ${typeof value} for ${sourceLabel}. Treating as false.`
  );
  return false;
}

/**
 * Resolves mode activation by evaluating configuration sources in the specified order.
 * Unknown hierarchy keys trigger warnings and are ignored. If no valid keys are supplied,
 * the default hierarchy is evaluated instead so callers still receive deterministic results.
 *
 * @param envVar - Environment variable value (highest priority in default order).
 * @param moduleFlag - Module flag value (mid priority in default order).
 * @param inGameSetting - In-game setting value (lowest priority in default order).
 * @param order - Optional overrides for evaluation order; defaults to env → module → setting.
 * @returns True when any evaluated source resolves to true; otherwise false.
 */
function _evaluateHierarchy(
  envVar: ConfigSource,
  moduleFlag: ConfigSource,
  inGameSetting: ConfigSource,
  order: readonly HierarchyKey[] = DEFAULT_HIERARCHY
): boolean {
  const evaluationOrder = order?.length ? order : DEFAULT_HIERARCHY;
  let evaluatedAny = false;

  const evaluators: Record<HierarchyKey, () => boolean> = {
    env: () => _coerceToBoolean(envVar, 'environment variable'),
    module: () => _coerceToBoolean(moduleFlag, 'module flag'),
    setting: () => _coerceToBoolean(inGameSetting, 'in-game setting'),
  };

  for (const key of evaluationOrder) {
    const evaluate = evaluators[key];

    if (!evaluate) {
      console.warn(
        `${LOG_PREFIX} Unsupported hierarchy key "${String(key)}". Skipping.`
      );
      continue;
    }

    evaluatedAny = true;

    if (evaluate()) {
      return true;
    }
  }

  if (!evaluatedAny && evaluationOrder !== DEFAULT_HIERARCHY) {
    return _evaluateHierarchy(
      envVar,
      moduleFlag,
      inGameSetting,
      DEFAULT_HIERARCHY
    );
  }

  return false;
}

export const __internal = {
  _coerceToBoolean,
  _evaluateHierarchy,
  DEFAULT_HIERARCHY,
};

/**
 * DevModeParser provides static helpers for evaluating mode status.
 * Concrete implementation is completed in later tasks of the feature plan.
 */
class DevModeParser {
  private constructor() {
    throw new Error(
      'DevModeParser is a static utility and cannot be instantiated'
    );
  }

  /**
   * Determine whether development mode should be active.
   * Applies the configuration hierarchy: environment variables → module flags → in-game settings.
   *
   * @example
   * const isDev = DevModeParser.isDevMode(
   *   process.env.OMH_DEV_MODE,
   *   game.modules.get('omh')?.flags?.devMode,
   *   game.settings.get('omh', 'devMode')
   * );
   *
   * @param envVar - Environment variable value (highest priority)
   * @param moduleFlag - Module manifest flag value (medium priority)
   * @param inGameSetting - In-game setting value (lowest priority)
   * @param options - Optional overrides for evaluation order.
   * @returns True when any higher-priority source resolves to true; otherwise false.
   */
  static isDevMode(
    envVar: ConfigSource,
    moduleFlag: ConfigSource,
    inGameSetting: ConfigSource,
    options?: ModeEvaluationOptions
  ): ModeStatus {
    return _evaluateHierarchy(
      envVar,
      moduleFlag,
      inGameSetting,
      options?.hierarchy
    );
  }

  /**
   * Determine whether debug mode should be active.
   * Applies the same configuration hierarchy as development mode but evaluates dedicated debug values.
   *
   * @example
   * const isDebug = DevModeParser.isDebugMode(
   *   process.env.OMH_DEBUG_MODE,
   *   game.modules.get('omh')?.flags?.debugMode,
   *   game.settings.get('omh', 'debugMode')
   * );
   *
   * @param envVar - Environment variable value (highest priority)
   * @param moduleFlag - Module manifest flag value (medium priority)
   * @param inGameSetting - In-game setting value (lowest priority)
   * @param options - Optional overrides for evaluation order.
   * @returns True when any higher-priority source resolves to true; otherwise false.
   */
  static isDebugMode(
    envVar: ConfigSource,
    moduleFlag: ConfigSource,
    inGameSetting: ConfigSource,
    options?: ModeEvaluationOptions
  ): ModeStatus {
    return _evaluateHierarchy(
      envVar,
      moduleFlag,
      inGameSetting,
      options?.hierarchy
    );
  }

  /**
   * Convenience wrapper that extracts configuration values from the config singleton
   * before delegating to the pure hierarchy evaluators.
   *
   * @example
   * const { devMode, debugMode } = DevModeParser.fromConfig(config);
   * const { devMode } = DevModeParser.fromConfig(config, 'CUSTOM');
   *
   * @param config - Config singleton providing access to environment, module, and setting sources
   * @param prefixOverride - Optional override for the configuration prefix when reading environment variables
   * @param options - Optional overrides for evaluation order.
   * @returns Object describing dev and debug mode status derived from the supplied config
   */
  static fromConfig(
    config: ConfigSingleton,
    prefixOverride?: string,
    options?: ModeEvaluationOptions
  ): ConfigResult {
    if (!config || typeof config.get !== 'function') {
      console.warn(
        `${LOG_PREFIX} Config instance is missing a usable get() method. Returning default mode values.`
      );
      return { devMode: false, debugMode: false };
    }

    const resolvedPrefix = (prefixOverride ?? config.prefix ?? '').trim();
    const normalizedPrefix = resolvedPrefix ? resolvedPrefix.toUpperCase() : '';

    const envKey = (suffix: string): string =>
      normalizedPrefix ? `${normalizedPrefix}_${suffix}` : suffix;

    const safeGet = (key: string, source: 'env' | 'module' | 'setting') => {
      try {
        return config.get(key, source);
      } catch (error) {
        console.warn(
          `${LOG_PREFIX} Failed to read ${source} key "${key}" from config: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return undefined;
      }
    };

    const devEnv = safeGet(envKey('DEV_MODE'), 'env');
    const devModule = safeGet('devMode', 'module');
    const devSetting = safeGet('devMode', 'setting');

    const debugEnv = safeGet(envKey('DEBUG_MODE'), 'env');
    const debugModule = safeGet('debugMode', 'module');
    const debugSetting = safeGet('debugMode', 'setting');

    return {
      devMode: DevModeParser.isDevMode(devEnv, devModule, devSetting, options),
      debugMode: DevModeParser.isDebugMode(
        debugEnv,
        debugModule,
        debugSetting,
        options
      ),
    };
  }
}

export default DevModeParser;
