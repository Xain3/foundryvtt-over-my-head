/**
 * @file rootMapParser.js
 * @description This file contains a function to parse root map configurations into resolved objects.
 * @path src/context/helpers/rootMapParser.js
 */

import manifest from '@manifest';
import Validator from '@utils/static/validator';
import { resolvePath } from '@helpers/resolvePath.js';
import { getModule } from '@/helpers/moduleGetter';

/**
 * Parses a root map configuration into resolved objects.
 * Handles special cases like 'module' key and null values.
 */
class RootMapParser {
  /**
   * Retrieves a module from the given namespace.
   *
   * @private
   * @param {string} module - The module ID to retrieve
   * @param {object} namespace - The namespace to search within
   * @returns {object} The found module object
   * @throws {Error} If the module is not found in the namespace
   */
  static #retrieveModuleInNamespace(module, namespace) {
    const moduleObject = getModule(module, namespace);
    if (!moduleObject) {
      throw new Error(`Module "${module}" not found in namespace.`);
    }
    return moduleObject;
  }

  /**
   * Resolves a string value to its actual reference.
   *
   * @private
   * @param {string} key - The key being resolved
   * @param {string} value - The string path to resolve
   * @param {object} context - The resolution context
   * @param {object} context.namespace - The namespace to resolve paths in
   * @param {string} context.module - The module ID to use for module resolution
   * @returns {*} The resolved reference
   * @throws {Error} If the path cannot be resolved
   */
  static #resolveStringValue(key, value, { namespace, module }) {
    if (key === 'module') {
      return RootMapParser.#retrieveModuleInNamespace(module, namespace);
    }

    const resolved = resolvePath(value, { namespace, module });
    if (resolved === undefined) {
      throw new Error(`Path "${value}" could not be resolved for key "${key}".`);
    }

    return resolved;
  }

  /**
   * Parses a single value from the root map.
   *
   * @private
   * @param {string} key - The key being parsed
   * @param {*} value - The value to parse
   * @param {object} context - The parsing context
   * @param {object} context.namespace - The namespace to resolve paths in
   * @param {string} context.module - The module ID to use for module resolution
   * @returns {*} The parsed value
   * @throws {Error} If the value type is invalid
   */
  static #parseValue(key, value, context) {
    if (value === null) return null;

    if (typeof value === 'string') {
      return this.#resolveStringValue(key, value, context);
    }

    if (typeof value === 'object') {
      return this.parse({ rootMap: value, ...context });
    }

    throw new Error(`Invalid value type for key "${key}": ${typeof value}`);
  }

  /**
   * Parses a specific key from the root map.
   *
   * @private
   * @param {string} key - The key to parse
   * @param {object} rootMap - The root map containing the key
   * @param {object} namespace - The namespace to resolve paths in
   * @param {string} module - The module ID for context
   * @returns {*} The parsed value for the specified key
   * @throws {Error} If the key doesn't exist in the root map
   */
  static #parseKey(key, rootMap, namespace, module) {
    if (!(key in rootMap)) {
      throw new Error(`Key "${key}" not found in rootMap`);
    }
    return this.#parseValue(key, rootMap[key], { namespace, module });
  }

  /**
   * Parses the entire root map object.
   *
   * @private
   * @param {object} rootMap - The root map to parse
   * @param {object} namespace - The namespace to resolve paths in
   * @param {string} module - The module ID for context
   * @returns {object} The parsed map with resolved references
   */
  static #parseRootMap(rootMap, namespace, module) {
    const parsedMap = {};
    for (const [mapKey, value] of Object.entries(rootMap)) {
      parsedMap[mapKey] = this.#parseValue(mapKey, value, { namespace, module });
    }

    return parsedMap;
  }

  /**
   * Parses a root map object into resolved references.
   * When key is provided, parses only that specific key-value pair.
   *
   * @param {object} options - Configuration options
   * @param {object} options.rootMap - The root map to parse
   * @param {string} [options.key] - Optional specific key to parse. If not provided, parses the entire root map
   * @param {object} [options.namespace=globalThis] - The namespace to resolve paths in
   * @param {string} [options.module=MODULE_ID] - The module ID to use for module resolution
   * @returns {object|*} Parsed map with resolved references, or single parsed value if key specified
   * @throws {Error} If the specified key doesn't exist in the root map (when key is provided)
   */
  static parse({ rootMap, key, namespace = globalThis, module = manifest.id || undefined }) {
    Validator.validateObject(rootMap, 'rootMap');
    if (key !== undefined && key !== null) Validator.validateString(key, 'key');
    Validator.validateObject(namespace, 'namespace');
    if (module !== undefined && module !== null) Validator.validateString(module, 'module');

    if (key !== undefined && key !== null) {
      return RootMapParser.#parseKey(key, rootMap, namespace, module);
    }

    return RootMapParser.#parseRootMap(rootMap, namespace, module);
  }
}

export default RootMapParser;