/**
 * @file config-types.ts
 * @description Type definitions for the centralized configuration singleton
 * @path src/config/config-types.ts
 */

/**
 * Configuration interface
 * @typedef {Object} Config
 * @property {Record<string, unknown>} constants - Merged YAML constants from all constant files
 * @property {unknown} settings - Settings definitions array
 * @property {Record<string, unknown>} module - Module manifest from module.json
 * @property {Record<string, string>} env - Environment variables matching prefix pattern
 * @property {string} toString - Method to serialize config to string
 */
export interface Config {
  constants: Record<string, unknown>;
  settings: unknown[];
  module: Record<string, unknown>;
  env: Record<string, string>;
  prefix: string;
  toString(): string;
}
