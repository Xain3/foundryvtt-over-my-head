/**
 * @file adapter-registry.mjs
 * @description Singleton registry for managing configuration file adapters
 * @path .dev/utils/alias-adapters/adapter-registry.mjs
 */

/**
 * Registry singleton for managing configuration file adapters.
 * Provides registration, lookup by format or file path, and validation.
 *
 * @class AdapterRegistry
 */
export class AdapterRegistry {
  static #singleton = null;
  #adapters = new Map();
  #filePathIndex = new Map();

  /**
   * Private constructor (use getInstance()).
   * @private
   */
  constructor() {
    if (AdapterRegistry.#singleton) {
      return AdapterRegistry.#singleton;
    }
    AdapterRegistry.#singleton = this;
  }

  /**
   * Gets the singleton instance of AdapterRegistry.
   *
   * @static
   * @returns {AdapterRegistry} Singleton instance
   */
  static getInstance() {
    if (!AdapterRegistry.#singleton) {
      AdapterRegistry.#singleton = new AdapterRegistry();
    }
    return AdapterRegistry.#singleton;
  }

  /**
   * Registers a configuration file adapter.
   *
   * @param {BaseConfigAdapter} adapter - Adapter instance to register
   * @throws {Error} If adapter is invalid or format/filePath already registered
   *
   * @example
   * registry.register(new TsConfigAdapter());
   */
  register(adapter) {
    // Validate adapter interface
    if (typeof adapter.getFormat !== 'function') {
      throw new Error('[OMH] Adapter must implement getFormat() method');
    }
    if (typeof adapter.getFilePaths !== 'function') {
      throw new Error('[OMH] Adapter must implement getFilePaths() method');
    }
    if (typeof adapter.read !== 'function') {
      throw new Error('[OMH] Adapter must implement read() method');
    }
    if (typeof adapter.write !== 'function') {
      throw new Error('[OMH] Adapter must implement write() method');
    }

    const format = adapter.getFormat();
    const filePaths = adapter.getFilePaths();

    // Check for duplicate format
    if (this.#adapters.has(format)) {
      throw new Error(
        `[OMH] Adapter for format "${format}" is already registered`
      );
    }

    // Check for duplicate file paths
    for (const filePath of filePaths) {
      if (this.#filePathIndex.has(filePath)) {
        const existingFormat = this.#filePathIndex.get(filePath).getFormat();
        throw new Error(
          `[OMH] File path "${filePath}" is already registered by adapter "${existingFormat}"`
        );
      }
    }

    // Register adapter
    this.#adapters.set(format, adapter);
    for (const filePath of filePaths) {
      this.#filePathIndex.set(filePath, adapter);
    }
  }

  /**
   * Retrieves adapter by format identifier.
   *
   * @param {string} format - Format identifier (e.g., 'jsonc', 'json')
   * @returns {BaseConfigAdapter|undefined} Adapter instance or undefined
   *
   * @example
   * const adapter = registry.getByFormat('jsonc');
   */
  getByFormat(format) {
    return this.#adapters.get(format);
  }

  /**
   * Retrieves adapter by file path.
   *
   * @param {string} filePath - Absolute file path
   * @returns {BaseConfigAdapter|undefined} Adapter instance or undefined
   *
   * @example
   * const adapter = registry.getByFilePath('/path/to/tsconfig.json');
   */
  getByFilePath(filePath) {
    return this.#filePathIndex.get(filePath);
  }

  /**
   * Returns array of all registered adapters.
   *
   * @returns {BaseConfigAdapter[]} Array of adapters
   *
   * @example
   * const adapters = registry.getAll();
   */
  getAll() {
    return Array.from(this.#adapters.values());
  }

  /**
   * Returns array of all supported format identifiers.
   *
   * @returns {string[]} Array of format names
   *
   * @example
   * const formats = registry.getSupportedFormats();
   * // Returns: ['jsonc', 'json', 'js']
   */
  getSupportedFormats() {
    return Array.from(this.#adapters.keys());
  }

  /**
   * Checks if a format is supported.
   *
   * @param {string} format - Format identifier to check
   * @returns {boolean} True if format is supported
   *
   * @example
   * if (registry.supports('jsonc')) { ... }
   */
  supports(format) {
    return this.#adapters.has(format);
  }

  /**
   * Clears all registered adapters (for testing).
   *
   * @returns {void}
   */
  clear() {
    this.#adapters.clear();
    this.#filePathIndex.clear();
  }
}

// Export singleton instance
export const adapterRegistry = AdapterRegistry.getInstance();
