/**
 * @file userDataDirFinder.js
 * @description Finds the FoundryVTT user data directory across platforms
 * @path scripts/dev/userDataDirFinder.js
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

const PLATFORM = (typeof os.platform === 'function' ? os.platform() : process.platform) || process.platform;
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
   * Returns platform-specific default paths for FoundryVTT installation.
   * @private
   * @returns {string[]} Array of potential FoundryVTT directory paths
   */
  #getPlatformPaths() {
    const platform = this.#platform;
    const user = this.#user;

    switch (platform) {
      case 'linux':
        return [
          `/home/${user}/.local/share/FoundryVTT`,
          `/home/${user}/FoundryVTT`,
          `/local/FoundryVTT`
        ];
      case 'darwin':
        return [path.join(os.homedir(), 'Library/Application Support/FoundryVTT')];
      case 'win32':
        return [path.join(process.env.LOCALAPPDATA || '', 'FoundryVTT')];
      default:
        return [];
    }
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
