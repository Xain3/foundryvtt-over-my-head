/**
 * @file tsconfig-adapter.mjs
 * @description Adapter for reading/writing aliases in tsconfig.json (TypeScript configuration)
 * @path src/utils/alias-adapters/tsconfig-adapter.mjs
 */

import { resolve } from 'path';
import { BaseConfigAdapter } from './base-adapter.mjs';
import { readJsoncWithFormat, writeJsoncFile } from './jsonc-helpers.mjs';
import {
  normalizeFromTsConfigPaths,
  normalizeToTsConfigPaths,
} from './normalization-helpers.mjs';

/**
 * Adapter for TypeScript configuration files (tsconfig.json).
 * Handles compilerOptions.paths field with JSONC format (comments allowed).
 *
 * @class TsConfigAdapter
 * @extends BaseConfigAdapter
 */
export class TsConfigAdapter extends BaseConfigAdapter {
  #filePath;

  /**
   * Creates TsConfigAdapter instance.
   *
   * @param {string} [projectRoot=process.cwd()] - Project root directory
   */
  constructor(projectRoot = process.cwd()) {
    super();
    this.#filePath = resolve(projectRoot, 'tsconfig.json');
  }

  /**
   * Returns format identifier.
   *
   * @returns {string} 'jsonc'
   */
  getFormat() {
    return 'jsonc';
  }

  /**
   * Returns file paths this adapter handles.
   *
   * @returns {string[]} Array containing tsconfig.json path
   */
  getFilePaths() {
    return [this.#filePath];
  }

  /**
   * Reads aliases from tsconfig.json and normalizes to interchange format.
   *
   * @returns {Promise<Object>} Normalized aliases
   * @throws {Error} If file cannot be read or parsed
   *
   * @example
   * const adapter = new TsConfigAdapter();
   * const aliases = await adapter.read();
   * // Returns: { "#/": "./src/", "#tests/": "./tests/" }
   */
  async read() {
    try {
      const { data } = readJsoncWithFormat(this.#filePath);

      if (!data.compilerOptions || !data.compilerOptions.paths) {
        return {};
      }

      return normalizeFromTsConfigPaths(data.compilerOptions.paths);
    } catch (error) {
      throw new Error(
        `[OMH] Failed to read aliases from ${this.#filePath}: ${error.message}`
      );
    }
  }

  /**
   * Writes normalized aliases to tsconfig.json in TypeScript paths format.
   * Preserves file formatting (comments, indentation, EOL style).
   *
   * @param {Object} aliases - Normalized aliases to write
   * @returns {Promise<void>}
   * @throws {Error} If file cannot be written
   *
   * @example
   * const adapter = new TsConfigAdapter();
   * await adapter.write({ "#/": "./src/", "#tests/": "./tests/" });
   */
  async write(aliases) {
    try {
      const { data, format } = readJsoncWithFormat(this.#filePath);

      // Ensure compilerOptions exists
      if (!data.compilerOptions) {
        data.compilerOptions = {};
      }

      // Convert normalized aliases to TypeScript paths format
      data.compilerOptions.paths = normalizeToTsConfigPaths(aliases);

      // Write back with preserved formatting
      writeJsoncFile(this.#filePath, data, format);
    } catch (error) {
      throw new Error(
        `[OMH] Failed to write aliases to ${this.#filePath}: ${error.message}`
      );
    }
  }
}
