/**
 * @file foundryDataDirFinder.ts
 * @description Static utility for finding FoundryVTT data directory across platforms
 * @path src/utils/static/foundryDataDirFinder.ts
 */

import type {
  PlatformType,
  FinderOptions,
  FindResult,
  FinderConfig,
} from './foundryDataDirFinder-types.ts';

const ENV_OVERRIDE_KEY = 'FOUNDRY_DATA_DIR';

/**
 * FoundryDataDirFinder provides static methods for locating the FoundryVTT data directory
 * across different platforms (Linux, macOS, Windows). This is primarily useful for
 * development and deployment scripts running in Node.js environments.
 *
 * Note: This utility is designed for Node.js/development contexts. In-browser FoundryVTT
 * code should use the game.data.path or CONFIG.path APIs instead.
 *
 * @example
 * ```typescript
 * import StaticUtils from '#/utils/static.ts';
 *
 * // Simple usage - find with defaults
 * const result = StaticUtils.findFoundryDataDir();
 * if (result.found) {
 *   console.log(`Found Foundry at: ${result.path}`);
 * }
 *
 * // Custom platform/user
 * const customResult = StaticUtils.findFoundryDataDir({
 *   platform: 'linux',
 *   user: 'developer',
 *   verbose: true
 * });
 * ```
 */

/**
 * Default platform-specific paths for FoundryVTT installation
 */
const PLATFORM_PATHS: Record<PlatformType, (user: string) => string[]> = {
  linux: (user: string) => [
    `/home/${user}/.local/share/FoundryVTT`,
    `/home/${user}/FoundryVTT`,
    `/local/FoundryVTT`,
  ],
  darwin: (user: string) => [
    // macOS path construction requires proper joining
    `${getHomeDir(user)}/Library/Application Support/FoundryVTT`,
  ],
  win32: (_user: string) => [
    // Windows uses LOCALAPPDATA environment variable
    `${getLocalAppData()}/FoundryVTT`,
  ],
};

/**
 * Gets the home directory for a given user
 * @param user - The username
 * @returns The home directory path
 */
function getHomeDir(user: string): string {
  // In Node.js context
  if (typeof process !== 'undefined' && process.env) {
    return process.env.HOME || `/home/${user}`;
  }
  return `/home/${user}`;
}

/**
 * Gets the Windows LOCALAPPDATA path
 * @returns The LOCALAPPDATA path
 */
function getLocalAppData(): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.LOCALAPPDATA || '';
  }
  return '';
}

/**
 * Detects the current platform
 * @returns The platform identifier
 */
function detectPlatform(): PlatformType {
  if (typeof process !== 'undefined' && process.platform) {
    const platform = process.platform;
    if (platform === 'linux' || platform === 'darwin' || platform === 'win32') {
      return platform as PlatformType;
    }
  }
  return 'linux'; // Default fallback
}

/**
 * Detects the current user
 * @returns The username
 */
function detectUser(): string {
  if (typeof process !== 'undefined') {
    // Try os.userInfo() if available
    try {
      // Dynamic import to handle environments without 'os'
      const os = require('node:os');
      const info = os.userInfo?.();
      if (info?.username) return info.username;
    } catch {
      // Fall through to environment variables
    }

    // Try environment variables
    if (process.env) {
      return process.env.USER || process.env.USERNAME || 'foundry';
    }
  }
  return 'foundry'; // Default fallback
}

/**
 * Checks if a path exists and is a directory
 * @param path - The path to check
 * @returns True if the path exists and is a directory
 */
function dirExists(path: string): boolean {
  if (!path) return false;

  try {
    // Dynamic import to handle environments without 'fs'
    const fs = require('node:fs');
    if (!fs.existsSync(path)) return false;

    const stat = fs.statSync(path);
    if (typeof stat?.isDirectory === 'function') {
      return stat.isDirectory();
    }
    // If we can't determine, assume true since existsSync passed
    return true;
  } catch {
    return false;
  }
}

/**
 * Logs a message if verbose mode is enabled
 * @param message - The message to log
 * @param verbose - Whether verbose logging is enabled
 */
function log(message: string, verbose: boolean): void {
  if (verbose) {
    console.log(`[FoundryDataDirFinder] ${message}`);
  }
}

/**
 * Finds the FoundryVTT data directory using platform-specific paths
 *
 * @param options - Configuration options for the search
 * @returns Result object containing the found path and search metadata
 *
 * @example
 * ```typescript
 * // Find with defaults
 * const result = findFoundryDataDir();
 * console.log(result.found ? result.path : 'Not found');
 *
 * // Find with custom options
 * const result = findFoundryDataDir({
 *   platform: 'linux',
 *   user: 'developer',
 *   verbose: true
 * });
 * ```
 */
export function findFoundryDataDir(options: FinderOptions = {}): FindResult {
  const platform = options.platform || detectPlatform();
  const user = options.user || detectUser();
  const verbose = options.verbose || false;
  const configRef = options.config ?? null;
  const checkedPaths: string[] = [];
  const seenCandidates = new Set<string>();

  log(`Searching for FoundryVTT data directory`, verbose);
  log(`Platform: ${platform}, User: ${user}`, verbose);

  const attemptCandidate = (
    candidate: string | undefined,
    source: string
  ): FindResult | null => {
    const normalized = normalizeCandidate(candidate);
    if (!normalized || seenCandidates.has(normalized)) {
      return null;
    }

    seenCandidates.add(normalized);
    checkedPaths.push(normalized);
    log(`Checking (${source}): ${normalized}`, verbose);

    if (dirExists(normalized)) {
      log(`Found (${source}): ${normalized}`, verbose);
      return {
        path: normalized,
        found: true,
        platform,
        checkedPaths,
      };
    }

    return null;
  };

  const explicitResult = attemptCandidate(options.path, 'argument');
  if (explicitResult) {
    return explicitResult;
  }

  const envResult = attemptCandidate(
    getEnvironmentOverride(configRef),
    'environment'
  );
  if (envResult) {
    return envResult;
  }

  const configEnvResult = attemptCandidate(
    getConfigEnvOverride(configRef),
    'config.env'
  );
  if (configEnvResult) {
    return configEnvResult;
  }

  const configConstantResult = attemptCandidate(
    getConfigConstantOverride(configRef),
    'config.constants'
  );
  if (configConstantResult) {
    return configConstantResult;
  }

  const configDefaultCandidates = getConfigDefaultPaths(
    configRef,
    platform,
    user
  );
  for (const candidate of configDefaultCandidates) {
    const result = attemptCandidate(candidate, 'config.defaults');
    if (result) {
      return result;
    }
  }

  const pathGenerator = PLATFORM_PATHS[platform];
  if (!pathGenerator) {
    log(`Unsupported platform: ${platform}`, verbose);
    return {
      path: '',
      found: false,
      platform,
      checkedPaths,
    };
  }

  const defaults = pathGenerator(user);
  for (const candidate of defaults) {
    const result = attemptCandidate(candidate, 'defaults');
    if (result) {
      return result;
    }
  }

  log('No FoundryVTT data directory found', verbose);
  return {
    path: '',
    found: false,
    platform,
    checkedPaths,
  };
}

/**
 * Convenience method that returns just the path string or empty string if not found
 *
 * @param options - Configuration options for the search
 * @returns The found path or empty string
 *
 * @example
 * ```typescript
 * const path = findFoundryDataDirPath();
 * if (path) {
 *   console.log(`Found at: ${path}`);
 * }
 * ```
 */
export function findFoundryDataDirPath(options: FinderOptions = {}): string {
  return findFoundryDataDir(options).path;
}

/**
 * Gets platform-specific paths without checking if they exist
 *
 * @param options - Configuration options
 * @returns Array of potential paths for the platform
 *
 * @example
 * ```typescript
 * const paths = getFoundryDataDirPaths({ platform: 'linux', user: 'dev' });
 * console.log('Will check:', paths);
 * ```
 */
export function getFoundryDataDirPaths(options: FinderOptions = {}): string[] {
  const platform = options.platform || detectPlatform();
  const user = options.user || detectUser();
  const configRef = options.config ?? null;
  const paths: string[] = [];
  const seen = new Set<string>();

  const addPath = (candidate?: string) => {
    const normalized = normalizeCandidate(candidate);
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    paths.push(normalized);
  };

  addPath(options.path);
  addPath(getEnvironmentOverride(configRef));
  addPath(getConfigEnvOverride(configRef));
  addPath(getConfigConstantOverride(configRef));

  const configDefaults = getConfigDefaultPaths(configRef, platform, user);
  configDefaults.forEach((candidate) => addPath(candidate));

  const pathGenerator = PLATFORM_PATHS[platform];
  if (!pathGenerator) {
    return paths;
  }

  for (const candidate of pathGenerator(user)) {
    addPath(candidate);
  }

  return paths;
}

function normalizeCandidate(candidate?: string | null): string {
  if (typeof candidate !== 'string') {
    return '';
  }
  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : '';
}

function getEnvironmentOverride(configRef: FinderConfig | null): string {
  if (typeof process === 'undefined' || !process.env) {
    return '';
  }

  const direct = normalizeCandidate(process.env[ENV_OVERRIDE_KEY]);
  if (direct) {
    return direct;
  }

  const prefix = configRef?.prefix;
  if (prefix) {
    const prefixedKey = `${prefix}_${ENV_OVERRIDE_KEY}`;
    const prefixed = normalizeCandidate(process.env[prefixedKey]);
    if (prefixed) {
      return prefixed;
    }
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (key.toUpperCase().endsWith(`_${ENV_OVERRIDE_KEY}`)) {
      const resolved = normalizeCandidate(value);
      if (resolved) {
        return resolved;
      }
    }
  }

  return '';
}

function getConfigEnvOverride(configRef: FinderConfig | null): string {
  if (!configRef || !configRef.env) {
    return '';
  }

  const envEntries = configRef.env as Record<string, string>;

  const direct = normalizeCandidate(envEntries[ENV_OVERRIDE_KEY]);
  if (direct) {
    return direct;
  }

  const prefix = configRef.prefix;
  if (prefix) {
    const prefixedKey = `${prefix}_${ENV_OVERRIDE_KEY}`;
    const prefixed = normalizeCandidate(envEntries[prefixedKey]);
    if (prefixed) {
      return prefixed;
    }
  }

  for (const [key, value] of Object.entries(envEntries)) {
    if (key.toUpperCase().endsWith(`_${ENV_OVERRIDE_KEY}`)) {
      const resolved = normalizeCandidate(value);
      if (resolved) {
        return resolved;
      }
    }
  }

  return '';
}

function getConfigConstantOverride(configRef: FinderConfig | null): string {
  if (!configRef || !configRef.constants) {
    return '';
  }

  const constants = configRef.constants as Record<string, unknown>;
  const pathsNamespace = constants.paths as Record<string, unknown> | undefined;
  const candidate = pathsNamespace?.foundryDataDirPath;

  if (typeof candidate === 'string') {
    return normalizeCandidate(candidate);
  }

  return '';
}

function getConfigDefaultPaths(
  configRef: FinderConfig | null,
  platform: PlatformType,
  user: string
): string[] {
  if (!configRef || !configRef.constants) {
    return [];
  }

  const constants = configRef.constants as Record<string, unknown>;
  const defaultsNamespace = constants.defaults as
    | Record<string, unknown>
    | undefined;
  const pathsNamespace = defaultsNamespace?.paths as
    | Record<string, unknown>
    | undefined;
  if (!pathsNamespace) {
    return [];
  }

  const platformCandidates = extractPlatformDefaults(pathsNamespace, platform);
  if (!platformCandidates.length) {
    return [];
  }

  return platformCandidates
    .map((candidate) => resolveDefaultTemplate(candidate, user))
    .map((resolved) => normalizeCandidate(resolved))
    .filter((candidate) => candidate.length > 0);
}

function extractPlatformDefaults(
  pathsNamespace: Record<string, unknown>,
  platform: PlatformType
): string[] {
  const foundryDataDirPath = pathsNamespace.foundryDataDirPath as
    | Record<string, unknown>
    | string
    | string[]
    | undefined;

  const candidates: string[] = [];

  if (Array.isArray(foundryDataDirPath)) {
    candidates.push(...(foundryDataDirPath as string[]));
  } else if (typeof foundryDataDirPath === 'string') {
    candidates.push(foundryDataDirPath);
  } else if (foundryDataDirPath && typeof foundryDataDirPath === 'object') {
    const perPlatform = (foundryDataDirPath as Record<string, unknown>)[
      platform
    ];
    if (Array.isArray(perPlatform)) {
      candidates.push(
        ...perPlatform.filter(
          (value): value is string => typeof value === 'string'
        )
      );
    } else if (typeof perPlatform === 'string') {
      candidates.push(perPlatform);
    }
  }

  const directPlatform = pathsNamespace[platform];
  if (Array.isArray(directPlatform)) {
    candidates.push(
      ...(directPlatform.filter(
        (value): value is string => typeof value === 'string'
      ) as string[])
    );
  } else if (typeof directPlatform === 'string') {
    candidates.push(directPlatform);
  }

  return candidates;
}

function resolveDefaultTemplate(template: string, user: string): string {
  return template
    .replace(/\$\{user\}/g, user)
    .replace(/\$\{getHomeDir\(user\)\}/g, getHomeDir(user))
    .replace(/\$\{getLocalAppData\(\)\}/g, getLocalAppData());
}
