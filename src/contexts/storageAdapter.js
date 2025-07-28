/**
 * @file storageAdapter.js
 * @description This file contains the StorageAdapter class for managing different storage backends for context data.
 * @path /src/contexts/storageAdapter.js
 */

import RootMapParser from "../helpers/rootMapParser.js";
import ContextMerger from './helpers/contextMerger.js';

/**
 * @class StorageAdapter
 * @description Handles different storage backends for context data including localStorage, sessionStorage,
 * and Foundry VTT game settings. Provides a unified interface for external storage operations.
 *
 * @property {string} #source - The storage source type ('localStorage', 'sessionStorage', 'module', 'user', 'world').
 * @property {object} #configuration - Storage configuration from constants.
 * @property {string} #rootIdentifier - Identifier for the root storage location.
 * @property {object} #rootMap - Mapping of root locations for context data.
 * @property {string} #pathFromRoot - Path from root to store context data.
 * @property {string} #mergeStrategy - Strategy to use when merging contexts.
 * @property {object} #contextRoot - The resolved root object for storage.
 */
class StorageAdapter {
  #source;
  #configuration;
  #rootIdentifier;
  #rootMap;
  #pathFromRoot;
  #mergeStrategy;
  #contextRoot;

  /**
   * @constructor
   * @description Creates a new StorageAdapter instance with the specified configuration.
   *
   * @param {object} options - Storage configuration options.
   * @param {string} [options.source='memory'] - Storage source type.
   * @param {object} options.configuration - Storage configuration from constants.
   * @param {string} [options.rootIdentifier] - Identifier for the root storage location.
   * @param {object} [options.rootMap] - Mapping of root locations for context data.
   * @param {string} [options.pathFromRoot] - Path from root to store context data.
   * @param {string} [options.mergeStrategy='mergeNewerWins'] - Strategy for merging contexts.
   *
   * @throws {Error} If required configuration is missing or invalid.
   *
   * @example
   * ```javascript
   * const adapter = new StorageAdapter({
   *   source: 'localStorage',
   *   configuration: constants.context.external,
   *   rootIdentifier: 'localStorage',
   *   pathFromRoot: 'myModule.context'
   * });
   * ```
   */
  constructor({
    source = 'memory',
    configuration,
    rootIdentifier,
    rootMap,
    pathFromRoot,
    mergeStrategy = 'mergeNewerWins'
  } = {}) {
    if (!configuration) {
      throw new Error('Storage configuration is required');
    }

    this.#source = source;
    this.#configuration = configuration;
    this.#mergeStrategy = mergeStrategy;

    // Use provided values or fall back to configuration defaults
    this.#rootIdentifier = rootIdentifier || configuration.defaults?.rootIdentifier;
    this.#rootMap = rootMap || configuration.rootMap;
    this.#pathFromRoot = pathFromRoot || configuration.defaults?.pathFromRoot;

    this.#validateConfiguration();
    this.#contextRoot = this.#determineRoot(this.#rootIdentifier);
  }

  /**
   * @description Validates the storage configuration.
   * @throws {Error} If configuration is invalid.
   * @private
   */
  #validateConfiguration() {
    if (!this.#rootIdentifier || typeof this.#rootIdentifier !== 'string') {
      throw new Error('Invalid configuration: rootIdentifier must be a non-empty string');
    }

    if (!this.#pathFromRoot || typeof this.#pathFromRoot !== 'string' || this.#pathFromRoot.trim() === '') {
      throw new Error('Invalid configuration: pathFromRoot must be a non-empty string');
    }

    if (!this.#rootMap || typeof this.#rootMap !== 'object') {
      throw new Error('Invalid configuration: rootMap must be an object');
    }
  }

  /**
   * @description Determines the root storage object based on the identifier.
   * @param {string} identifier - The root identifier to resolve.
   * @returns {object} The resolved root object.
   * @throws {Error} If the identifier cannot be resolved.
   * @private
   */
  #determineRoot(identifier) {
    if (!identifier) {
      throw new Error('Root identifier is required');
    }

    try {
      return RootMapParser.parse({
        rootMap: this.#rootMap,
        key: identifier,
      });
    } catch (error) {
      console.error(`Failed to determine root for identifier "${identifier}":`, error);
      throw new Error(`Invalid root identifier: ${identifier}`);
    }
  }

  /**
   * @description Stores a context instance at the configured path.
   * Handles merging with existing contexts if they exist.
   *
   * @param {Context} context - The context instance to store.
   * @returns {Context} The stored context (may be merged with existing).
   * @throws {Error} If storage operation fails.
   *
   * @example
   * ```javascript
   * const adapter = new StorageAdapter(config);
   * const storedContext = adapter.store(contextInstance);
   * ```
   */
  store(context) {
    if (!context) {
      throw new Error('Context instance is required for storage');
    }

    try {
      return this.#buildContextInstance(context, this.#contextRoot, this.#pathFromRoot);
    } catch (error) {
      console.error('Failed to store context:', error);
      throw error;
    }
  }

  /**
   * @description Retrieves a context instance from storage.
   * @returns {Context|null} The retrieved context or null if not found.
   *
   * @example
   * ```javascript
   * const adapter = new StorageAdapter(config);
   * const context = adapter.retrieve();
   * ```
   */
  retrieve() {
    try {
      return this.#contextRoot[this.#pathFromRoot] || null;
    } catch (error) {
      console.error('Failed to retrieve context:', error);
      return null;
    }
  }

  /**
   * @description Removes a context instance from storage.
   * @returns {boolean} True if removal was successful, false otherwise.
   *
   * @example
   * ```javascript
   * const adapter = new StorageAdapter(config);
   * const removed = adapter.remove();
   * ```
   */
  remove() {
    try {
      if (this.#contextRoot[this.#pathFromRoot]) {
        delete this.#contextRoot[this.#pathFromRoot];
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove context:', error);
      return false;
    }
  }

  /**
   * @description Checks if a context exists at the storage path.
   * @returns {boolean} True if context exists, false otherwise.
   *
   * @example
   * ```javascript
   * const adapter = new StorageAdapter(config);
   * if (adapter.exists()) {
   *   console.log('Context exists in storage');
   * }
   * ```
   */
  exists() {
    try {
      return this.#contextRoot[this.#pathFromRoot] !== undefined;
    } catch (error) {
      console.error('Failed to check context existence:', error);
      return false;
    }
  }

  /**
   * @description Gets information about the storage adapter.
   * @returns {object} Storage adapter information.
   *
   * @example
   * ```javascript
   * const adapter = new StorageAdapter(config);
   * const info = adapter.getInfo();
   * console.log(`Storage: ${info.source} at ${info.path}`);
   * ```
   */
  getInfo() {
    return {
      source: this.#source,
      rootIdentifier: this.#rootIdentifier,
      pathFromRoot: this.#pathFromRoot,
      mergeStrategy: this.#mergeStrategy
    };
  }

  /**
   * @description Builds or updates a context instance in storage.
   * Handles merging with existing contexts.
   * @param {Context} context - The context to store.
   * @param {object} contextRoot - The root storage object.
   * @param {string} pathFromRoot - The storage path.
   * @returns {Context} The stored context instance.
   * @private
   */
  #buildContextInstance(context, contextRoot, pathFromRoot) {
    if (!contextRoot || typeof contextRoot !== 'object') {
      throw new Error('Invalid context root');
    }

    if (!pathFromRoot || typeof pathFromRoot !== 'string' || pathFromRoot.trim() === '') {
      throw new Error('Invalid path from root');
    }

    // Check if there's already a context at this path
    const existingValue = contextRoot[pathFromRoot];

    if (existingValue && typeof existingValue === 'object') {
      // Check if existingValue looks like a Context instance
      const isContextLike = existingValue.constants && existingValue.schema && existingValue.manifest &&
                            existingValue.flags && existingValue.state && existingValue.data &&
                            existingValue.settings && typeof existingValue.compare === 'function';

      if (isContextLike) {
        // Merge with existing Context instance
        contextRoot[pathFromRoot] = this.#mergeContextInstances(pathFromRoot, existingValue, context);
      } else {
        // Non-Context object exists - warn and replace
        contextRoot[pathFromRoot] = this.#warnAndReplaceContext(pathFromRoot, context);
      }
    } else {
      // No existing value or primitive value - safe to set
      contextRoot[pathFromRoot] = context;
    }

    return contextRoot[pathFromRoot];
  }

  /**
   * @description Warns about replacing existing non-context data and replaces it.
   * @param {string} pathFromRoot - The storage path.
   * @param {Context} newContext - The new context to store.
   * @returns {Context} The new context instance.
   * @private
   */
  #warnAndReplaceContext(pathFromRoot, newContext) {
    console.warn(`Overwriting existing property at path: ${pathFromRoot}`);
    return newContext;
  }

  /**
   * @description Merges an existing context with a new context instance.
   * @param {string} pathFromRoot - The storage path.
   * @param {Context} existingContext - The existing context.
   * @param {Context} newContext - The new context to merge.
   * @returns {Context} The merged context instance.
   * @throws {Error} If merge operation fails.
   * @private
   */
  #mergeContextInstances(pathFromRoot, existingContext, newContext) {
    console.warn(`Merging existing Context instance at path: ${pathFromRoot}`);

    try {
      const mergeResult = ContextMerger.merge(
        existingContext,
        newContext,
        this.#mergeStrategy
      );

      if (!mergeResult.success) {
        throw new Error(`Context merge failed: ${mergeResult.error}`);
      }

      return mergeResult.mergedContext || newContext;
    } catch (error) {
      console.error('Failed to merge contexts:', error);
      throw new Error(`Context merge operation failed: ${error.message}`);
    }
  }
}

export default StorageAdapter;
