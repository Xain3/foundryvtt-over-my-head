/**
 * @file userDataDirFinder.mjs
 * @description Finds the FoundryVTT user data directory across platforms
 * @path .dev/scripts/utilities/userDataDirFinder.mjs
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

const PLATFORM =
  (typeof os.platform === 'function' ? os.platform() : process.platform) ||
  process.platform;
const USER = (() => {
  try {
    if (typeof os.userInfo === 'function') {
      const info = os.userInfo();
      if (info?.username) return info.username;
    }
  } catch (_) {
    // ignore
  }
  return process.env.USER || process.env.USERNAME || '';
})();

const LINUX_PATHS = [
  `~/.local/share/foundrydata`,
  `~/.local/share/FoundryVTT`,
  `~/foundrydata`,
  `~/FoundryVTT`,
  `/local/FoundryVTT`,
];
const MACOS_PATHS = [`~/Library/Application Support/FoundryVTT`];
const WINDOWS_PATHS = [`%LOCALAPPDATA%/FoundryVTT`];

/**
 * @class UserDataDirFinder
 * @description Finds the FoundryVTT user data directory across different platforms (Linux, macOS, Windows).
 * The class uses platform-specific default paths to locate the FoundryVTT installation directory.
 *
 * @export UserDataDirFinder
 *
 * Public API:
 * - constructor(platform?, user?) - Creates a new finder instance
 * - find() - Searches for and returns the FoundryVTT user data directory path
 *
 * Platform-specific search paths:
 * - Linux: ~/.local/share/FoundryVTT, ~/FoundryVTT, /local/FoundryVTT
 * - macOS: ~/Library/Application Support/FoundryVTT
 * - Windows: %LOCALAPPDATA%/FoundryVTT
 *
 * @example
 * ```javascript
 * const finder = new UserDataDirFinder();
 * const userDataPath = finder.find();
 * if (userDataPath) {
 *   console.log(`Found FoundryVTT at: ${userDataPath}`);
 * }
 * ```
 */
class UserDataDirFinder {
  #platform;
  #user;

  /**
   * @param {string} [platform=PLATFORM] - The platform identifier ('linux', 'darwin', 'win32')
   * @param {string} [user=USER] - The username to use for path construction
   */
  constructor(platform = PLATFORM, user = USER) {
    this.#platform = platform;
    this.#user = user;
  }

  /**
   * Searches for the FoundryVTT user data directory using platform-specific paths.
   * @returns {string} The path to the FoundryVTT user data directory, or empty string if not found
   */
  find() {
    return this.#getUserDataDir();
  }

  /**
   * Gets the FoundryVTT user data directory by checking platform-specific paths.
   * @private
   * @returns {string} The path to the user data directory, or empty string if not found
   */
  #getUserDataDir() {
    const foundryUserdataDirs = this.#getPlatformPaths();

    for (const dir of foundryUserdataDirs) {
      if (this.#dirExists(dir)) {
        console.log(`Found FoundryVTT user data directory: ${dir}`);
        return dir;
      }
    }

    console.warn('No FoundryVTT user data directory found');
    return '';
  }

  /**
   * Parses and normalizes an array of paths, replacing environment variables and user home shortcuts.
   * @private
   * @param {string[]} paths - The array of paths to parse
   * @param {string} user - The username to use for path construction
   * @returns {string[]} The array of parsed and normalized paths
   */
  #parsePaths(paths, user) {
    return paths.map((p) => {
      let parsed = p;
      if (p.includes('%LOCALAPPDATA%')) {
        const localAppData =
          process.env.LOCALAPPDATA ||
          path.join('C:', 'Users', user, 'AppData', 'Local');
        parsed = p.replace('%LOCALAPPDATA%', localAppData);
      }
      if (p.includes('~')) {
        const homeDir = os.homedir ? os.homedir() : `/home/${user}`;
        parsed = p.replace('~', homeDir);
      }
      return path.normalize(parsed);
    });
  }

  /**
   * Returns platform-specific default paths for FoundryVTT installation.
   * @private
   * @returns {string[]} Array of potential FoundryVTT directory paths
   */
  #getPlatformPaths() {
    const platform = this.#platform;
    const user = this.#user;
    let paths;

    switch (platform) {
      case 'linux':
        paths = LINUX_PATHS;
        break;
      case 'darwin':
        paths = MACOS_PATHS;
        break;
      case 'win32':
        paths = WINDOWS_PATHS;
        break;
      default:
        paths = [];
    }

    const parsedPaths = this.#parsePaths(paths, user);
    return parsedPaths;
  }

  /**
   * Checks if a directory exists and is actually a directory.
   * @private
   * @param {string} dir - The directory path to check
   * @returns {boolean} True if the path exists and is a directory
   */
  #dirExists(dir) {
    if (!fs.existsSync(dir)) return false;
    try {
      const stat = fs.statSync(dir);
      if (typeof stat?.isDirectory === 'function') return stat.isDirectory();
    } catch (_) {
      // ignore
    }
    // If we can't determine, err on the side of true since existsSync passed
    return true;
  }
}

export default UserDataDirFinder;
