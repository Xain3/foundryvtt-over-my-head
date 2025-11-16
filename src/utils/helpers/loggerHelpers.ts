/**
 * @file loggerHelpers.ts
 * @description Helper utilities for logger configuration extraction and type checking.
 * @path src/utils/helpers/loggerHelpers.ts
 */

import type { Config } from '#/config/config.ts';
import type { LogConfigurationObject } from '../logger-types.ts';

const MODULE_PREFIX = '[OMH]';

/**
 * Default configuration path in Config.constants for logger settings.
 * When logging.yaml is loaded into constants, this can be changed to 'logging.console'.
 * @export
 */
export const DEFAULT_CONFIG_PATH = 'defaults.logging';

/**
 * Extracts LogConfigurationObject from a Config instance using a configuration path.
 *
 * @param {Config} config - Config singleton instance containing logging configuration.
 * @param {string} [configPath='defaults.logging'] - Dot-separated path to logging config in Config.constants.
 * @returns {LogConfigurationObject} Extracted logging configuration.
 * @throws {Error} If the configuration path is not properly structured.
 * @export
 *
 * @example
 * // Using default path (config.constants.defaults.logging)
 * const logConfig = extractLogConfigFromConfig(config);
 *
 * @example
 * // Using logging.yaml path once loaded (config.constants.logging.console)
 * const logConfig = extractLogConfigFromConfig(config, 'logging.console');
 */
export function extractLogConfigFromConfig(
  config: Config,
  configPath: string = DEFAULT_CONFIG_PATH
): LogConfigurationObject {
  const pathSegments = configPath.split('.');
  let current: unknown = config.constants;

  // Traverse the path to find the configuration object
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];

    if (!current || typeof current !== 'object') {
      const traversedPath = pathSegments.slice(0, i).join('.');
      throw new Error(
        `${MODULE_PREFIX} Config.constants.${traversedPath} is not available or invalid`
      );
    }

    const currentRecord = current as Record<string, unknown>;
    current = currentRecord[segment];

    if (current === undefined) {
      const fullPath = pathSegments.slice(0, i + 1).join('.');
      throw new Error(
        `${MODULE_PREFIX} Config.constants.${fullPath} is not available or invalid`
      );
    }
  }

  // Validate that we have a valid object at the end of the path
  if (!current || typeof current !== 'object') {
    throw new Error(
      `${MODULE_PREFIX} Config.constants.${configPath} is not available or invalid`
    );
  }

  // Safe to cast: runtime check confirms current is an object
  const loggingRecord = current as Record<string, unknown>;

  // Validate required fields for LogConfigurationObject
  if (typeof loggingRecord.moduleName !== 'string') {
    throw new Error(
      `${MODULE_PREFIX} Config.constants.${configPath}.moduleName must be a string`
    );
  }

  if (typeof loggingRecord.level !== 'string') {
    throw new Error(
      `${MODULE_PREFIX} Config.constants.${configPath}.level must be a string`
    );
  }

  // Safe to cast: validation confirms structure matches LogConfigurationObject
  // The normalizeConfig method will validate remaining fields
  return loggingRecord as unknown as LogConfigurationObject;
}

/**
 * Type guard to check if the provided value is a Config instance.
 * Uses structural typing to distinguish Config from LogConfigurationObject.
 *
 * The discriminator relies on:
 * - Config has: constants, module, settings, env (no moduleName)
 * - LogConfigurationObject has: moduleName, level (no constants/module/settings/env)
 *
 * This approach is safe because:
 * 1. The two types serve different purposes and have non-overlapping structures
 * 2. LogConfigurationObject is a flat configuration object
 * 3. Config is a complex singleton with nested properties
 *
 * @param {Config | LogConfigurationObject} value - Value to check.
 * @returns {boolean} True if value is a Config instance.
 * @export
 */
export function isConfig(
  value: Config | LogConfigurationObject
): value is Config {
  if (!value || typeof value !== 'object') {
    return false;
  }

  // Check for Config-specific structure with all required properties
  const hasConstants = 'constants' in value;
  const hasModule = 'module' in value;
  const hasSettings = 'settings' in value;
  const hasEnv = 'env' in value;

  // LogConfigurationObject must have moduleName, not module
  const hasModuleName = 'moduleName' in value;

  // A Config has constants/module/settings/env, while LogConfigurationObject has moduleName
  return hasConstants && hasModule && hasSettings && hasEnv && !hasModuleName;
}
