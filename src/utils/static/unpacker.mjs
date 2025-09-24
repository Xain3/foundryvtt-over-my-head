/**
 * @file unpacker.mjs
 * @description This file contains a utility class for unpacking object properties onto instances.
 * @path src/utils/static/unpacker.mjs
 */

/**
 * Static utility class for unpacking object properties onto class instances.
 * Provides methods for transferring properties from plain objects to class instances.
 *
 * @class Unpacker
 * @export
 */
class Unpacker {
  /**
   * Unpacks properties from an object directly onto the class instance.
   * This makes properties (like title, version, etc.) directly accessible via `this.propertyName`.
   * Handles both string and symbol keys, and includes proper error handling and logging.
   *
   * @param {Object} object - The object to unpack properties from
   * @param {Object} instance - The instance to unpack properties onto
   * @param {string} [objectName="object"] - Name for error reporting purposes
   * @throws {TypeError} If object or instance are null/undefined, or if object is not an object type
   * @throws {Error} If an error occurs during the unpacking process (e.g., frozen instance)
   *
   * @example
   * // Basic usage
   * const unpacker = new Unpacker();
   * const instance = {};
   * const data = { title: 'Test', version: '1.0.0', active: true };
   * unpacker.unpack(data, instance);
   * // instance now has: instance.title, instance.version, instance.active
   *
   * @example
   * // With custom object name for error reporting
   * unpacker.unpack(moduleData, moduleInstance, 'module');
   *
   * @example
   * // Handles symbol keys
   * const sym = Symbol('test');
   * const data = { normalKey: 'value', [sym]: 'symbolValue' };
   * unpacker.unpack(data, instance);
   * // Both instance.normalKey and instance[sym] are available
   */
  unpack(object, instance, objectName = "object") {
    try {
      // Input validation
      if (object === null || object === undefined) {
        throw new TypeError('Object to unpack cannot be null or undefined');
      }

      if (instance === null || instance === undefined) {
        throw new TypeError('Instance cannot be null or undefined');
      }

      // Validate that object is actually an object (not primitive)
      if (typeof object !== 'object') {
        throw new TypeError(`Expected object to unpack, but received ${typeof object}`);
      }

      // Get class name safely
      const className = instance.constructor?.name || 'Unknown';

      // Handle both string and symbol keys
      // First handle string keys
      for (const [key, value] of Object.entries(object)) {
        instance[key] = value;
      }

      // Then handle symbol keys
      for (const sym of Object.getOwnPropertySymbols(object)) {
        instance[sym] = object[sym];
      }
    } catch (error) {
      // Get class name for error reporting
      const className = instance?.constructor?.name || 'Unknown';
      console.error(`Error unpacking ${objectName} to ${className} instance:`, error);
      throw error;
    }
  }
}

export default Unpacker;