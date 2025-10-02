/**
 * @file deployer.mjs
 * @description Handles deployment of built files to the FoundryVTT module directory
<<<<<<<< HEAD:.dev/scripts/deployment/deployer.mjs
 * @path .dev/scripts/deployment/deployer.mjs
========
 * @path scripts/dev/deployer.mjs
>>>>>>>> 22b2c9fb4cf111e7e2c4ab8000ed344556b332b7:.dev/scripts/utilities/deployer.mjs
 */

import fs from 'fs';
import path from 'path';

const TO_DEPLOY = [
  './dist',
  './assets',
  './public',
  './lang',
  './packs',
  './styles',
  './module.json',
];

/**
 * @class ModuleDeployer
 * @description Handles deployment of built files to the FoundryVTT module directory.
 * Syncs all files and directories from TO_DEPLOY array to target directory.
 * Preserves directory structure and only copies changed files for efficiency.
 *
 * @export ModuleDeployer
 *
 * Public API:
 * - constructor(targetDir) - Creates a new deployer instance
 * - deploy() - Syncs files from TO_DEPLOY sources to target directory
 *
 * File handling:
 * - Processes both files and directories recursively
 * - Preserves directory structure
 * - Only copies files that have changed (based on mtime and size)
 * - Skips non-existent source paths
 * - Logs sync operations with change indicators
 * - Handles errors gracefully with informative messages
 *
 * @example
 * ```javascript
 * const deployer = new ModuleDeployer('/foundry/modules/my-module');
 * deployer.deploy(); // Syncs all TO_DEPLOY items to target directory
 * ```
 */
class ModuleDeployer {
  #targetDir;

  /**
   * @param {string} targetDir - The target directory where files should be deployed
   */
  constructor(targetDir) {
    this.#targetDir = targetDir;
  }

  /**
   * Syncs all items from TO_DEPLOY array to target directory.
   * Only copies files that have changed for better efficiency.
   * @throws {Error} When target directory is not specified
   */
  deploy() {
    if (!this.#targetDir) {
      throw new Error('Target directory not specified for deployment');
    }

    const deployTime = new Date().toLocaleString();
    console.log(
      `Syncing TO_DEPLOY items to ${this.#targetDir} at ${deployTime}`
    );
    this.#ensureTargetDirectory();
    this.#syncDeployItems();
  }

  /**
   * Ensures target directory exists.
   * @private
   */
  #ensureTargetDirectory() {
    if (!fs.existsSync(this.#targetDir)) {
      fs.mkdirSync(this.#targetDir, { recursive: true });
      console.log(`Created target directory: ${this.#targetDir}`);
    }
  }

  /**
   * Syncs all items from TO_DEPLOY array.
   * @private
   */
  #syncDeployItems() {
    for (const item of TO_DEPLOY) {
      if (!fs.existsSync(item)) {
        console.log(`Skipping ${item} - does not exist`);
        continue;
      }

      const stats = fs.statSync(item);
      const itemName = path.basename(item);
      const targetPath = path.join(this.#targetDir, itemName);

      if (stats.isFile()) {
        this.#syncFile(item, targetPath);
      } else if (stats.isDirectory()) {
        this.#syncDirectory(item, targetPath);
      }
    }
  }

  /**
   * Syncs a single file, only copying if it has changed.
   * @param {string} sourcePath - Source file path
   * @param {string} targetPath - Target file path
   * @private
   */
  #syncFile(sourcePath, targetPath) {
    const shouldCopy = this.#shouldCopyFile(sourcePath, targetPath);

    if (shouldCopy) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Synced: ${path.basename(sourcePath)}`);
    } else {
      console.log(`Unchanged: ${path.basename(sourcePath)}`);
    }
  }

  /**
   * Syncs a directory recursively, preserving structure.
   * @param {string} sourceDir - Source directory path
   * @param {string} targetDir - Target directory path
   * @private
   */
  #syncDirectory(sourceDir, targetDir) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`Created directory: ${path.basename(targetDir)}`);
    }

    const items = fs.readdirSync(sourceDir);
    for (const item of items) {
      const sourcePath = path.join(sourceDir, item);
      const targetPath = path.join(targetDir, item);
      const stats = fs.statSync(sourcePath);

      if (stats.isFile()) {
        this.#syncFile(sourcePath, targetPath);
      } else if (stats.isDirectory()) {
        this.#syncDirectory(sourcePath, targetPath);
      }
    }
  }

  /**
   * Determines if a file should be copied based on modification time and size.
   * @param {string} sourcePath - Source file path
   * @param {string} targetPath - Target file path
   * @returns {boolean} True if file should be copied
   * @private
   */
  #shouldCopyFile(sourcePath, targetPath) {
    if (!fs.existsSync(targetPath)) {
      return true;
    }

    const sourceStats = fs.statSync(sourcePath);
    const targetStats = fs.statSync(targetPath);

    // Copy if size differs or source is newer
    return (
      sourceStats.size !== targetStats.size ||
      sourceStats.mtime > targetStats.mtime
    );
  }
}

export default ModuleDeployer;
