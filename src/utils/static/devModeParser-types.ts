/**
 * @file devModeParser-types.ts
 * @description Type definitions for development and debug mode status evaluation
 * @path src/utils/static/devModeParser-types.ts
 */

/**
 * Configuration source value that can be evaluated as a mode status.
 */
export type ConfigSource = string | boolean | undefined | null;

/**
 * Boolean representation of a mode's activation status.
 */
export type ModeStatus = boolean;

/**
 * Result object containing both development and debug mode status.
 */
export type ConfigResult = {
  devMode: ModeStatus;
  debugMode: ModeStatus;
};

/**
 * Key identifying a configuration source within the evaluation hierarchy.
 */
export type HierarchyKey = 'env' | 'module' | 'setting';

/**
 * Options for customizing mode evaluation behavior.
 */
export type ModeEvaluationOptions = {
  hierarchy?: readonly HierarchyKey[];
};

/**
 * Configuration singleton interface for reading mode values from multiple sources.
 */
export interface ConfigSingleton {
  get(key: string, source: 'env' | 'module' | 'setting'): ConfigSource;
  prefix?: string;
}
