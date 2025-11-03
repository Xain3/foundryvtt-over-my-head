/**
 * @file Config Helper Functions
 * @description Utility functions for loading, parsing, and merging configuration data
 * @path src/config/helpers/configHelpers.ts
 */

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { parse as parseYaml } from 'yaml';
import { fileURLToPath } from 'url';

export const REQUIRED_CONSTANT_FILES = [
  'configs.yaml',
  'errors.yaml',
  'foundry.yaml',
  'hooks.yaml',
];

export const REQUIRED_CONFIG_FILES = [
  'logging.yaml',
  'moduleManagement.yaml',
  'occlusion.yaml',
  'placeables.yaml',
];

// Backward compatibility: combined list
export const REQUIRED_YAML_FILES = [
  ...REQUIRED_CONSTANT_FILES,
  ...REQUIRED_CONFIG_FILES,
];

/**
 * Get the module root directory (one level up from src/)
 * @returns {string} Absolute path to module root
 * @private
 */
function getModuleRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const helpersDir = dirname(currentFile);
  const configDir = dirname(helpersDir);
  const srcDir = dirname(configDir);
  const moduleRoot = dirname(srcDir);
  return moduleRoot;
}

/**
 * Extract a YAML context snippet for error messages (scaffolding - not currently used)
 * @param {string} content YAML file content
 * @param {number} [lineNumber] Line number to extract context around
 * @returns {string} Context snippet (up to 5 lines)
 * @private
 */
function extractYamlContext(content: string, lineNumber?: number): string {
  const lines = content.split('\n');
  if (!lineNumber || lineNumber < 1 || lineNumber > lines.length) {
    return lines.slice(0, 3).join('\n');
  }
  const start = Math.max(0, lineNumber - 3);
  const end = Math.min(lines.length, lineNumber + 2);
  return lines.slice(start, end).join('\n');
}

/**
 * Load and parse YAML files from a specified directory
 * Each file is loaded into a namespace under the returned object
 * @param {string} directory Directory path (e.g., 'src/config/constants' or 'src/config/configs')
 * @param {string[]} files List of YAML files to load
 * @returns {Record<string, unknown>} Namespace-keyed YAML data
 * @throws {Error} If any YAML file cannot be parsed
 * @private
 * @example
 * const data = loadYamlFilesFromDirectory('src/config/constants', ['errors.yaml']);
 * // Returns { errors: {...} }
 */
function loadYamlFilesFromDirectory(
  directory: string,
  files: string[]
): Record<string, unknown> {
  const moduleRoot = getModuleRoot();
  const targetDir = resolve(moduleRoot, directory);

  const yamlFiles = [...files];

  const result: Record<string, unknown> = {};

  for (const fileName of yamlFiles) {
    const filePath = resolve(targetDir, fileName);
    try {
      const content = readFileSync(filePath, 'utf-8');
      if (!content.trim()) {
        // Empty YAML file → empty object
        result[fileName.replace('.yaml', '')] = {};
      } else {
        const parsed = parseYaml(content) || {};
        result[fileName.replace('.yaml', '')] = parsed;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load YAML from ${filePath}: ${errorMessage}`);
    }
  }

  return result;
}

/**
 * Load and parse all YAML constant files from src/config/constants/
 * Each file is loaded into a namespace under the returned object
 * @param {string[]} [files=REQUIRED_CONSTANT_FILES] List of YAML files to load
 * @returns {Record<string, unknown>} Namespace-keyed YAML data
 * @throws {Error} If any YAML file cannot be parsed
 * @example
 * const constants = loadYamlFiles();
 * // Returns { errors: {...}, foundry: {...}, hooks: {...} }
 */
export function loadYamlFiles(
  files = REQUIRED_CONSTANT_FILES
): Record<string, unknown> {
  return loadYamlFilesFromDirectory('src/config/constants', files);
}

/**
 * Load and parse all YAML config files from src/config/configs/
 * Each file is loaded into a namespace under the returned object
 * @param {string[]} [files=REQUIRED_CONFIG_FILES] List of YAML files to load
 * @returns {Record<string, unknown>} Namespace-keyed YAML data
 * @throws {Error} If any YAML file cannot be parsed
 * @example
 * const configs = loadConfigFiles();
 * // Returns { logging: {...}, moduleManagement: {...}, occlusion: {...}, placeables: {...} }
 */
export function loadConfigFiles(
  files = REQUIRED_CONFIG_FILES
): Record<string, unknown> {
  return loadYamlFilesFromDirectory('src/config/configs', files);
}

/**
 * Merge namespace-keyed YAML files into config constants structure
 * Each YAML file maintains its own namespace key to prevent collisions
 * @param {Record<string, unknown>} yamlFiles YAML data with namespace keys
 * @returns {Record<string, unknown>} Merged config constants
 * @throws {Error} If merge validation fails
 * @example
 * const files = { errors: {...}, foundry: {...} };
 * const merged = mergeConstants(files);
 * // Returns { errors: {...}, foundry: {...} }
 */
export function mergeConstants(
  yamlFiles: Record<string, unknown>
): Record<string, unknown> {
  try {
    // Namespace-keyed merge: each file becomes a top-level key
    // No deep merge needed; each file is independent
    const merged: Record<string, unknown> = {};

    for (const [namespace, data] of Object.entries(yamlFiles)) {
      if (data === null || data === undefined) {
        merged[namespace] = {};
      } else if (typeof data === 'object') {
        merged[namespace] = data;
      } else {
        throw new Error(
          `Invalid YAML structure for namespace '${namespace}': expected object, got ${typeof data}`
        );
      }
    }

    return merged;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to merge constants: ${errorMessage}`);
  }
}

/**
 * Extract configuration prefix from module manifest
 * Falls back to [OMH] with warning if shortName not found
 * @param {unknown} manifest Module manifest object (from module.json)
 * @returns {string} Prefix for logging and env vars (e.g., "OMH")
 * @throws {Error} If manifest is not an object
 * @example
 * const manifest = { shortName: 'OMH' };
 * const prefix = extractConfigPrefix(manifest);
 * // Returns "OMH"
 */
export function extractConfigPrefix(manifest: unknown): string {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error(
      'Module manifest must be an object, got ' + typeof manifest
    );
  }

  const manifestObj = manifest as Record<string, unknown>;
  const shortName = manifestObj.shortName;

  if (!shortName) {
    console.warn(
      '[OMH] CONFIG WARNING: Using fallback prefix "OMH". ' +
        'To customize, set "shortName" in src/config/constants/moduleManagement.yaml'
    );
    return 'OMH';
  }

  const prefix = String(shortName).toUpperCase();
  return prefix;
}

/**
 * Load and parse settings.yaml from src/config/settings/
 * @returns {unknown} Parsed settings data
 * @throws {Error} If settings.yaml cannot be loaded or parsed
 * @example
 * const settings = loadSettings();
 * // Returns array of setting definitions
 */
export function loadSettings(): unknown {
  const moduleRoot = getModuleRoot();
  const settingsPath = resolve(moduleRoot, 'src/config/settings/settings.yaml');

  try {
    const content = readFileSync(settingsPath, 'utf-8');
    if (!content.trim()) {
      return [];
    }
    const parsed = parseYaml(content);
    return parsed || [];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to load settings from ${settingsPath}: ${errorMessage}`
    );
  }
}

/**
 * Load module manifest from module.json in project root
 * @returns {Record<string, unknown>} Module manifest data
 * @throws {Error} If module.json cannot be loaded or parsed
 * @example
 * const manifest = loadModuleManifest();
 * // Returns { id: 'vision-with-fade', title: '...', version: '12.1.0', ... }
 */
export function loadModuleManifest(): Record<string, unknown> {
  const moduleRoot = getModuleRoot();
  const manifestPath = resolve(moduleRoot, 'module.json');

  try {
    const content = readFileSync(manifestPath, 'utf-8');
    const parsed = JSON.parse(content);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('module.json must contain a JSON object');
    }

    return parsed as Record<string, unknown>;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to load module manifest from ${manifestPath}: ${errorMessage}`
    );
  }
}

/**
 * Load environment variables matching the module prefix pattern
 * Performs case-insensitive prefix matching and strips prefix from keys
 * @param {string} prefix Module prefix in SCREAMING_SNAKE_CASE (e.g., "OMH")
 * @returns {Record<string, string>} Environment variables with prefix stripped
 * @throws {Error} If prefix is not a valid string
 * @example
 * // With process.env.OMH_DEBUG_MODE = "true"
 * const env = loadEnvironmentVariables("OMH");
 * // Returns { OMH_DEBUG_MODE: "true" }
 */
export function loadEnvironmentVariables(
  prefix: string
): Record<string, string> {
  if (!prefix || typeof prefix !== 'string') {
    throw new Error(
      `Invalid prefix: expected non-empty string, got ${typeof prefix}`
    );
  }

  try {
    const envVars: Record<string, string> = {};
    const upperPrefix = prefix.toUpperCase();

    for (const [key, value] of Object.entries(process.env)) {
      // Case-insensitive prefix matching
      if (key.toUpperCase().startsWith(upperPrefix + '_')) {
        // Store with original key (includes prefix)
        envVars[key.toUpperCase()] = value ?? '';
      }
    }

    return envVars;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load environment variables: ${errorMessage}`);
  }
}
