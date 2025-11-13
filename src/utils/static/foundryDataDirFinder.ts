/**
 * @file foundryDataDirFinder.ts
 * @description Static utility for finding FoundryVTT data directory across platforms
 * @path src/utils/static/foundryDataDirFinder.ts
 */

import type {
  PlatformType,
  FinderOptions,
  FindResult,
} from './foundryDataDirFinder-types.ts';

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
      const os = require('os');
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
    const fs = require('fs');
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

  log(`Searching for FoundryVTT data directory`, verbose);
  log(`Platform: ${platform}, User: ${user}`, verbose);

  const pathGenerator = PLATFORM_PATHS[platform];
  if (!pathGenerator) {
    log(`Unsupported platform: ${platform}`, verbose);
    return {
      path: '',
      found: false,
      platform,
      checkedPaths: [],
    };
  }

  const paths = pathGenerator(user);
  const checkedPaths: string[] = [];

  for (const path of paths) {
    checkedPaths.push(path);
    log(`Checking: ${path}`, verbose);

    if (dirExists(path)) {
      log(`Found: ${path}`, verbose);
      return {
        path,
        found: true,
        platform,
        checkedPaths,
      };
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

  const pathGenerator = PLATFORM_PATHS[platform];
  if (!pathGenerator) {
    return [];
  }

  return pathGenerator(user);
}
