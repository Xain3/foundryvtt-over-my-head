/**
 * @file contextFactory.js
 * @description This file contains the ContextFactory class for creating different types of context managers.
 * @path /src/contexts/contextFactory.js
 */

import InMemoryContextManager from "./inMemory.js";
import ExternalContextManager from "./external.js";

/**
 * @class ContextFactory
 * @description Factory class for creating different types of context managers.
 * Provides a unified interface for context creation with proper type handling.
 */
class ContextFactory {
  /**
   * @description Mapping of context types to their respective manager classes.
   * @type {object}
   * @private
   */
  static #CONTEXT_TYPES = {
    inMemory: InMemoryContextManager,
    external: ExternalContextManager,
    localStorage: ExternalContextManager,
    sessionStorage: ExternalContextManager,
    module: ExternalContextManager,
    user: ExternalContextManager,
    world: ExternalContextManager
  };

  /**
   * @description Creates a context manager of the specified type.
   * @param {string} type - The type of context manager to create.
   * @param {object} [options={}] - Configuration options for the context manager.
   * @returns {BaseContextManager|null} The created context manager or null if type is invalid.
   * @throws {Error} If context creation fails.
   *
   * @example
   * ```javascript
   * // Create in-memory context
   * const memoryContext = ContextFactory.create('inMemory', {
   *   data: { user: 'test' }
   * });
   *
   * // Create external context with localStorage
   * const storageContext = ContextFactory.create('localStorage', {
   *   rootIdentifier: 'localStorage',
   *   pathFromRoot: 'myApp.context'
   * });
   *
   * // Create external context with specific source
   * const moduleContext = ContextFactory.create('module', {
   *   source: 'module',
   *   rootIdentifier: 'game.modules',
   *   pathFromRoot: 'myModule.context'
   * });
   * ```
   */
  static create(type, options = {}) {
    const ManagerClass = ContextFactory.#CONTEXT_TYPES[type];
    
    if (!ManagerClass) {
      console.warn(`Unknown context type: ${type}`);
      return null;
    }

    try {
      if (type === 'inMemory') {
        return new ManagerClass(options);
      } else {
        // For external contexts, ensure source is set correctly
        const contextOptions = {
          source: type === 'external' ? options.source || 'external' : type,
          ...options
        };
        return new ManagerClass(contextOptions);
      }
    } catch (error) {
      console.error(`Failed to create ${type} context manager:`, error);
      throw error;
    }
  }

  /**
   * @description Gets the list of supported context types.
   * @returns {string[]} Array of supported context type names.
   *
   * @example
   * ```javascript
   * const supportedTypes = ContextFactory.getSupportedTypes();
   * console.log('Supported context types:', supportedTypes);
   * // Output: ['inMemory', 'external', 'localStorage', 'sessionStorage', 'module', 'user', 'world']
   * ```
   */
  static getSupportedTypes() {
    return Object.keys(ContextFactory.#CONTEXT_TYPES);
  }

  /**
   * @description Checks if a context type is supported.
   * @param {string} type - The context type to check.
   * @returns {boolean} True if the type is supported, false otherwise.
   *
   * @example
   * ```javascript
   * if (ContextFactory.isTypeSupported('localStorage')) {
   *   const context = ContextFactory.create('localStorage', config);
   * }
   * ```
   */
  static isTypeSupported(type) {
    return type in ContextFactory.#CONTEXT_TYPES;
  }

  /**
   * @description Creates multiple context managers from a configuration object.
   * @param {object} config - Configuration object with context types as keys.
   * @returns {object} Object with context type keys and manager instances as values.
   * @throws {Error} If any context creation fails.
   *
   * @example
   * ```javascript
   * const contexts = ContextFactory.createMultiple({
   *   inMemory: { data: { temp: true } },
   *   localStorage: { 
   *     rootIdentifier: 'localStorage',
   *     pathFromRoot: 'myApp.context'
   *   },
   *   module: {
   *     source: 'module',
   *     rootIdentifier: 'game.modules',
   *     pathFromRoot: 'myModule.context'
   *   }
   * });
   *
   * console.log(contexts.inMemory); // InMemoryContextManager instance
   * console.log(contexts.localStorage); // ExternalContextManager instance
   * console.log(contexts.module); // ExternalContextManager instance
   * ```
   */
  static createMultiple(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Configuration object is required');
    }

    const contexts = {};
    const errors = [];

    for (const [type, options] of Object.entries(config)) {
      try {
        contexts[type] = ContextFactory.create(type, options || {});
      } catch (error) {
        errors.push({ type, error: error.message });
      }
    }

    if (errors.length > 0) {
      const errorMessages = errors.map(e => `${e.type}: ${e.error}`).join(', ');
      throw new Error(`Failed to create contexts: ${errorMessages}`);
    }

    return contexts;
  }
}

export default ContextFactory;
