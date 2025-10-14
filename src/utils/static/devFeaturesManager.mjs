/**
 * @file devFeaturesManager.mjs
 * @description Static utility for managing development features and flag resolution
 * @path src/utils/static/devFeaturesManager.mjs
 */

/**
 * DevFeaturesManager provides static utilities for managing development-specific features.
 * This class handles logic for determining when dev features should be enabled and
 * provides flag resolution utilities for manifest flags.
 *
 * @class DevFeaturesManager
 * @export
 *
 * Public API:
 * - static shouldEnableDevFeatures(manifest) - Determines if dev features should be enabled
 * - static resolveManifestFlag(manifest, flagPath, defaultValue) - Resolves a flag from manifest
 *
 * @example
 * // Check if dev features should be enabled
 * const shouldEnable = DevFeaturesManager.shouldEnableDevFeatures(manifest);
 *
 * @example
 * // Resolve a specific flag from manifest
 * const debugMode = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.debugMode', false);
 */
class DevFeaturesManager {
  /**
   * Determines whether development features should be enabled based on the manifest.
   * Checks for the presence and truthiness of manifest.flags.dev.
   *
   * @static
   * @param {Object} manifest - The module manifest object
   * @returns {boolean} True if dev features should be enabled, false otherwise
   *
   * @example
   * const manifest = { flags: { dev: true } };
   * const shouldEnable = DevFeaturesManager.shouldEnableDevFeatures(manifest);
   * // Returns: true
   *
   * @example
   * const manifest = { flags: { dev: false } };
   * const shouldEnable = DevFeaturesManager.shouldEnableDevFeatures(manifest);
   * // Returns: false
   */
  static shouldEnableDevFeatures(manifest) {
    if (!manifest || typeof manifest !== 'object') {
      return false;
    }

    return Boolean(manifest?.flags?.dev);
  }

  /**
   * Resolves a flag value from the manifest using a dot-notation path.
   * Safely traverses the manifest object to retrieve nested flag values.
   *
   * @static
   * @param {Object} manifest - The module manifest object
   * @param {string} flagPath - Dot-notation path to the flag (e.g., 'flags.dev', 'flags.debugMode')
   * @param {*} defaultValue - Default value to return if flag is not found
   * @returns {*} The resolved flag value or default value
   *
   * @example
   * const manifest = { flags: { dev: true, debugMode: false } };
   * const dev = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.dev', false);
   * // Returns: true
   *
   * @example
   * const manifest = { flags: { dev: true } };
   * const missing = DevFeaturesManager.resolveManifestFlag(manifest, 'flags.missing', 'default');
   * // Returns: 'default'
   */
  static resolveManifestFlag(manifest, flagPath, defaultValue) {
    if (!manifest || typeof manifest !== 'object') {
      return defaultValue;
    }

    if (!flagPath || typeof flagPath !== 'string') {
      return defaultValue;
    }

    const parts = flagPath.split('.');
    let current = manifest;

    for (const part of parts) {
      if (!current || typeof current !== 'object' || !(part in current)) {
        return defaultValue;
      }
      current = current[part];
    }

    return current !== undefined ? current : defaultValue;
  }

  /**
   * Checks if a specific flag exists in the manifest.
   *
   * @static
   * @param {Object} manifest - The module manifest object
   * @param {string} flagPath - Dot-notation path to the flag
   * @returns {boolean} True if the flag exists (even if falsy), false otherwise
   *
   * @example
   * const manifest = { flags: { dev: false } };
   * const exists = DevFeaturesManager.hasManifestFlag(manifest, 'flags.dev');
   * // Returns: true (even though the value is false)
   *
   * @example
   * const manifest = { flags: { dev: true } };
   * const exists = DevFeaturesManager.hasManifestFlag(manifest, 'flags.missing');
   * // Returns: false
   */
  static hasManifestFlag(manifest, flagPath) {
    if (!manifest || typeof manifest !== 'object') {
      return false;
    }

    if (!flagPath || typeof flagPath !== 'string') {
      return false;
    }

    const parts = flagPath.split('.');
    let current = manifest;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current || typeof current !== 'object' || !(part in current)) {
        return false;
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    return current && typeof current === 'object' && lastPart in current;
  }
}

export default DevFeaturesManager;
