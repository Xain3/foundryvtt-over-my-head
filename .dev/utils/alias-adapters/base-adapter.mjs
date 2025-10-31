/**
 * @file base-adapter.mjs
 * @description Base adapter class providing common interface for configuration file adapters
 * @path .dev/utils/alias-adapters/base-adapter.mjs
 */

/**
 * Base adapter class for configuration file handling.
 * All concrete adapters must extend this class and implement abstract methods.
 *
 * @class BaseConfigAdapter
 * @abstract
 */
export class BaseConfigAdapter {
  /**
   * Returns the format identifier for this adapter.
   *
   * @abstract
   * @returns {string} Format identifier (e.g., 'jsonc', 'json', 'js')
   * @throws {Error} If not implemented by subclass
   */
  getFormat() {
    throw new Error('[OMH] getFormat() must be implemented by subclass');
  }

  /**
   * Returns the file paths this adapter handles.
   *
   * @abstract
   * @returns {string[]} Array of absolute file paths
   * @throws {Error} If not implemented by subclass
   */
  getFilePaths() {
    throw new Error('[OMH] getFilePaths() must be implemented by subclass');
  }

  /**
   * Checks if this adapter can handle the given file path.
   *
   * @param {string} filePath - Absolute file path to check
   * @returns {boolean} True if this adapter handles the file
   */
  canHandle(filePath) {
    const filePaths = this.getFilePaths();
    return filePaths.some((path) => path === filePath);
  }

  /**
   * Reads aliases from the configuration file and normalizes to interchange format.
   *
   * @abstract
   * @returns {Promise<Object>} Normalized aliases { "#/": "./src/", ... }
   * @throws {Error} If not implemented by subclass or if read fails
   */
  async read() {
    throw new Error('[OMH] read() must be implemented by subclass');
  }

  /**
   * Writes normalized aliases to the configuration file in format-specific syntax.
   *
   * @abstract
   * @param {Object} _aliases - Normalized aliases to write
   * @returns {Promise<void>}
   * @throws {Error} If not implemented by subclass or if write fails
   */
  async write(_aliases) {
    throw new Error('[OMH] write() must be implemented by subclass');
  }

  /**
   * Validates that current aliases match expected aliases.
   *
   * @param {Object} expected - Expected normalized aliases
   * @returns {Promise<Object>} ValidationResult { valid: boolean, diff?: Object }
   */
  async validate(expected) {
    const current = await this.read();
    const { compareAliases, formatDiff } = await import(
      './normalization-helpers.mjs'
    );

    const diff = compareAliases(current, expected);
    const valid =
      diff.missing.length === 0 &&
      diff.extra.length === 0 &&
      diff.mismatched.length === 0;

    if (valid) {
      return { valid: true };
    }

    return {
      valid: false,
      diff: {
        current,
        expected,
        ...diff,
        formatted: formatDiff(diff, current, expected),
      },
    };
  }
}
