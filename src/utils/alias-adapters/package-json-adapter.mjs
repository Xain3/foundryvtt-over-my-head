/**
 * @file package-json-adapter.mjs
 * @description Adapter for reading/writing aliases in package.json (Node.js imports field)
 * @path src/utils/alias-adapters/package-json-adapter.mjs
 */

import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { BaseConfigAdapter } from './base-adapter.mjs';
import {
  normalizeFromPackageJsonImports,
  normalizeToPackageJsonImports,
} from './normalization-helpers.mjs';
import {
  detectIndentation,
  detectEolStyle,
  detectTrailingNewline,
} from './jsonc-helpers.mjs';

/**
 * Adapter for Node.js package.json files.
 * Handles imports field with JSON format (no comments allowed).
 *
 * @class PackageJsonAdapter
 * @extends BaseConfigAdapter
 */
export class PackageJsonAdapter extends BaseConfigAdapter {
  #filePath;

  /**
   * Creates PackageJsonAdapter instance.
   *
   * @param {string} [projectRoot=process.cwd()] - Project root directory
   */
  constructor(projectRoot = process.cwd()) {
    super();
    this.#filePath = resolve(projectRoot, 'package.json');
  }

  /**
   * Returns format identifier.
   *
   * @returns {string} 'json'
   */
  getFormat() {
    return 'json';
  }

  /**
   * Returns file paths this adapter handles.
   *
   * @returns {string[]} Array containing package.json path
   */
  getFilePaths() {
    return [this.#filePath];
  }

  /**
   * Reads aliases from package.json imports field and normalizes.
   *
   * @returns {Promise<Object>} Normalized aliases
   * @throws {Error} If file cannot be read or parsed
   *
   * @example
   * const adapter = new PackageJsonAdapter();
   * const aliases = await adapter.read();
   * // Returns: { "#/": "./src/", "#tests/": "./tests/" }
   */
  async read() {
    try {
      const content = readFileSync(this.#filePath, 'utf-8');
      const data = JSON.parse(content);

      if (!data.imports) {
        return {};
      }

      return normalizeFromPackageJsonImports(data.imports);
    } catch (error) {
      throw new Error(
        `[OMH] Failed to read aliases from ${this.#filePath}: ${error.message}`
      );
    }
  }

  /**
   * Writes normalized aliases to package.json imports field.
   * Preserves file formatting (indentation, EOL style).
   *
   * @param {Object} aliases - Normalized aliases to write
   * @returns {Promise<void>}
   * @throws {Error} If file cannot be written
   *
   * @example
   * const adapter = new PackageJsonAdapter();
   * await adapter.write({ "#/": "./src/", "#tests/": "./tests/" });
   */
  async write(aliases) {
    try {
      const content = readFileSync(this.#filePath, 'utf-8');
      const data = JSON.parse(content);

      // Detect formatting
      const indent = detectIndentation(content);
      const eol = detectEolStyle(content);
      const trailingNewline = detectTrailingNewline(content);

      // Update imports field
      data.imports = normalizeToPackageJsonImports(aliases);

      // Stringify with detected formatting
      const indentStr = indent.useTabs ? '\t' : ' '.repeat(indent.size);
      let output = JSON.stringify(data, null, indentStr);

      // Apply EOL style
      if (eol !== '\n') {
        output = output.replace(/\n/g, eol);
      }

      // Add trailing newline if needed
      if (trailingNewline && !output.endsWith(eol)) {
        output += eol;
      }

      writeFileSync(this.#filePath, output, 'utf-8');
    } catch (error) {
      throw new Error(
        `[OMH] Failed to write aliases to ${this.#filePath}: ${error.message}`
      );
    }
  }
}
