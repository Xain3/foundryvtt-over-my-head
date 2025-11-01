/**
 * @file vite-adapter.mjs
 * @description Adapter for validating Vite configuration imports from alias.config.mjs
 * @path src/utils/alias-adapters/vite-adapter.mjs
 */

import { resolve } from 'path';
import { readFileSync } from 'fs';
import { BaseConfigAdapter } from './base-adapter.mjs';

/**
 * Adapter for Vite configuration files (vite.config.mjs).
 * Validates that the config correctly imports from alias.config.mjs.
 * Does NOT support write operations (vite.config.mjs should always import from alias.config.mjs).
 *
 * @class ViteConfigAdapter
 * @extends BaseConfigAdapter
 */
export class ViteConfigAdapter extends BaseConfigAdapter {
  #filePath;

  /**
   * Creates ViteConfigAdapter instance.
   *
   * @param {string} [projectRoot=process.cwd()] - Project root directory
   */
  constructor(projectRoot = process.cwd()) {
    super();
    this.#filePath = resolve(projectRoot, 'vite.config.mjs');
  }

  /**
   * Returns format identifier.
   *
   * @returns {string} 'vite'
   */
  getFormat() {
    return 'vite';
  }

  /**
   * Returns file paths this adapter handles.
   *
   * @returns {string[]} Array containing vite.config.mjs path
   */
  getFilePaths() {
    return [this.#filePath];
  }

  /**
   * Validates that vite.config.mjs correctly imports from alias.config.mjs.
   * Returns empty object since Vite doesn't need explicit aliases (uses import).
   *
   * @returns {Promise<Object>} Empty object (Vite imports from alias.config.mjs)
   * @throws {Error} If file doesn't import from alias.config.mjs
   *
   * @example
   * const adapter = new ViteConfigAdapter();
   * const aliases = await adapter.read(); // Returns: {}
   */
  async read() {
    try {
      const content = readFileSync(this.#filePath, 'utf-8');

      // Check if file imports from alias.config.mjs
      const hasImport = /import.*from\s+['"]\.\/alias\.config\.mjs['"]/.test(
        content
      );
      const hasAliasEntries = /aliasEntries/.test(content);

      if (!hasImport || !hasAliasEntries) {
        throw new Error(
          `[OMH] vite.config.mjs must import aliasEntries from './alias.config.mjs'`
        );
      }

      // Return empty object - Vite uses import directly
      return {};
    } catch (error) {
      if (error.message.includes('[OMH]')) {
        throw error;
      }
      throw new Error(
        `[OMH] Failed to read ${this.#filePath}: ${error.message}`
      );
    }
  }

  /**
   * Write operation not supported for Vite config.
   * Vite should always import from alias.config.mjs.
   *
   * @throws {Error} Always throws - write not supported
   */
  async write(_aliases) {
    throw new Error(
      `[OMH] vite.config.mjs should import from alias.config.mjs - manual write not supported`
    );
  }

  /**
   * Validates that Vite config correctly imports from alias.config.mjs.
   * Always returns valid=true if import is present, valid=false otherwise.
   *
   * @param {Object} _expected - Expected aliases (ignored for Vite)
   * @returns {Promise<Object>} ValidationResult
   */
  async validate(_expected) {
    try {
      await this.read();
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        diff: {
          current: {},
          expected: {},
          missing: [],
          extra: [],
          mismatched: [],
          formatted: error.message,
        },
      };
    }
  }
}
