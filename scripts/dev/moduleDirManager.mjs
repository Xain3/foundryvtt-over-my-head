/**
 * @file moduleDirManager.mjs
 * @description Manages module directory creation and validation
 * @path scripts/dev/moduleDirManager.mjs
 */

import fs from 'fs';
import path from 'path';
import { readFileSync } from 'fs';

// Must be a relative path segment, not absolute, so path.join(userDataDir, MODULE_DEFAULT_PATH)
// resolves under the foundry user data directory.
const MODULE_DEFAULT_PATH = 'Data/modules';

// Resolve module.json lazily with safe fallback so tests with mocked fs don't crash at import.
let MODULE_INFO_CACHE = null;
/**
 * Resolves module information from module.json file with safe fallback.
 * Uses lazy evaluation and caching to avoid file system operations at import time.
 * Searches multiple candidate paths for module.json file.
 *
 * @returns {Object} The module information object with at least an 'id' property
 */
const getModuleInfo = () => {
  if (MODULE_INFO_CACHE) return MODULE_INFO_CACHE;

  const tryRead = (p) => {
    try {
      return JSON.parse(readFileSync(p, 'utf8'));
    } catch (_) {
      return null;
    }
  };

  const candidates = [`${process.cwd()}/module.json`];
  if (typeof __dirname !== 'undefined') {
    candidates.push(path.resolve(__dirname, '../../module.json'));
    candidates.push(path.resolve(__dirname, '../module.json'));
    candidates.push(path.resolve(__dirname, './module.json'));
  }
  candidates.push('./module.json');

  for (const p of candidates) {
    const data = tryRead(p);
    if (data) {
      MODULE_INFO_CACHE = data;
      return MODULE_INFO_CACHE;
    }
  }

  // Fallback avoids throwing during test bootstrap when fs is mocked but not configured yet.
  MODULE_INFO_CACHE = { id: 'unknown-module' };
  return MODULE_INFO_CACHE;
};

/**
 * @class ModuleDirManager
 * @description Manages module directory creation and validation for FoundryVTT modules.
 * Handles the creation of the modules directory structure and ensures proper permissions.
 * Automatically resolves module ID from module.json if not provided.
 *
 * @export ModuleDirManager
 *
 * Public API:
 * - constructor(userDataDir, moduleId?) - Creates a new manager instance
 * - getModulesDir() - Returns the path to the FoundryVTT modules directory
 * - getModuleDir() - Returns the path to the specific module directory
 *
 * Directory structure created:
 * - {userDataDir}/Data/modules/ (modules directory)
 * - {userDataDir}/Data/modules/{moduleId}/ (specific module directory)
 *
 * @example
 * ```javascript
 * const manager = new ModuleDirManager('/home/user/.local/share/FoundryVTT', 'my-module');
 * const moduleDir = manager.getModuleDir();
 * // Returns: /home/user/.local/share/FoundryVTT/Data/modules/my-module
 * ```
 */
class ModuleDirManager {
  #userDataDir;
  #moduleId;

  /**
   * @param {string} userDataDir - The path to the FoundryVTT user data directory
   * @param {string} [moduleId] - The module ID. If not provided, will be resolved from module.json
   */
  constructor(userDataDir, moduleId) {
    this.#userDataDir = userDataDir;
    this.#moduleId = moduleId || getModuleInfo().id;
  }

  /**
   * Gets or creates the FoundryVTT modules directory.
   * @returns {string} The path to the modules directory
   * @throws {Error} When user data directory is not provided or invalid
   */
  getModulesDir() {
    if (!this.#userDataDir) {
      throw new Error('User data directory not found');
    }

    const moduleDirPath = path.join(this.#userDataDir, MODULE_DEFAULT_PATH);
    return this.#ensureDirectory(moduleDirPath, 'modules');
  }

  /**
   * Gets or creates the specific module directory within the modules directory.
   * @returns {string} The path to the module directory
   * @throws {Error} When modules directory cannot be created or accessed
   */
  getModuleDir() {
    const modulesDir = this.getModulesDir();
    const moduleDirPath = path.join(modulesDir, this.#moduleId);
    return this.#ensureDirectory(moduleDirPath, `module '${this.#moduleId}'`);
  }

  /**
   * Ensures a directory exists, creating it if necessary.
   * @private
   * @param {string} dirPath - The directory path to ensure
   * @param {string} description - Human-readable description for logging
   * @returns {string} The directory path
   */
  #ensureDirectory(dirPath, description) {
    if (fs.existsSync(dirPath)) {
      try {
        const stat = fs.statSync(dirPath);
        const isDir = typeof stat?.isDirectory === 'function' ? stat.isDirectory() : true;
        if (isDir) {
          console.log(`Found FoundryVTT ${description} directory: ${dirPath}`);
          return dirPath;
        }
      } catch (_) {
        // If stat fails, fall through to create directory
      }
    }

    console.log(`Creating FoundryVTT ${description} directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
    return dirPath;
  }
}

export default ModuleDirManager;
