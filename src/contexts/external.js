/**
 * @file external.js
 * @description This file contains the ExternalContextManager class for managing context data stored in external storage.
 * @path /src/contexts/external.js
 */

import _ from "lodash";
import Context, { DEFAULT_INITIALIZATION_PARAMS } from "./context.js";
import BaseContextManager from "./baseContextManager.js";
import StorageAdapter from "./storageAdapter.js";

/**
 * @class ExternalContextManager
 * @extends BaseContextManager
 * @description Manages context data stored in external storage backends.
 * Provides a structured way to access and manipulate context data with persistent storage.
 * Uses StorageAdapter to handle different storage types including localStorage, sessionStorage,
 * and Foundry VTT game settings. Inherits common functionality from BaseContextManager.
 *
 * @property {StorageAdapter} #storage - The storage adapter for managing external persistence.
 *
 * @example
 * ```javascript
 * const contextManager = new ExternalContextManager({
 *   source: 'localStorage',
 *   rootIdentifier: 'localStorage',
 *   pathFromRoot: 'myModule.context'
 * });
 *
 * // Access context data
 * const userData = contextManager.data.get('user');
 *
 * // Merge with another context
 * const result = contextManager.merge(otherContext, 'mergeNewerWins');
 * ```
 */
class ExternalContextManager extends BaseContextManager {
  #storage;

  /**
   * @constructor
   * @description Creates a new ExternalContextManager instance with external storage capabilities.
   * Uses StorageAdapter to handle different storage backends while inheriting common
   * functionality from BaseContextManager.
   *
   * @param {object} [options={}] - Configuration options
   * @param {string} [options.source='external'] - Storage source type ('localStorage', 'sessionStorage', 'module', 'user', 'world').
   * @param {string} [options.rootIdentifier] - Identifier for the root location.
   * @param {string} [options.pathFromRoot] - Path from root to store context data.
   * @param {object} [options.rootMap] - Mapping of root locations for context data.
   * @param {object} [options.initializationParams={}] - Context initialization parameters.
   * @param {string} [options.mergeStrategy='mergeNewerWins'] - Strategy for merging contexts.
   *
   * @throws {Error} If configuration is invalid or storage setup fails.
   *
   * @example
   * ```javascript
   * const manager = new ExternalContextManager({
   *   source: 'localStorage',
   *   rootIdentifier: 'localStorage',
   *   pathFromRoot: 'myModule.context'
   * });
   * ```
   */
  constructor({
    source = 'external',
    rootIdentifier = undefined,
    pathFromRoot = undefined,
    rootMap = undefined,
    initializationParams = {
      mergeStrategy: 'mergeOlderWins'
    }
  } = {}) {
    // Merge with defaults and create base context
    const mergedParams = { ...DEFAULT_INITIALIZATION_PARAMS, ...initializationParams };
    const baseContext = new Context({ initializationParams: mergedParams });

    // Get configuration from constants
    const constants = baseContext.constants;
    const configuration = constants.getItem?.('context')?.getItem?.('external') || constants.context?.external;

    if (!configuration) {
      throw new Error('External context configuration not found in constants');
    }

    // Call parent constructor first
    super(baseContext);

    try {
      // Create storage adapter after super() call
      this.#storage = new StorageAdapter({
        source,
        configuration,
        rootIdentifier,
        rootMap,
        pathFromRoot,
        mergeStrategy: mergedParams.mergeStrategy
      });

      // Store the context using the storage adapter
      this.#storage.store(this.context);
    } catch (error) {
      console.error('Failed to initialize ExternalContextManager:', error);
      throw error;
    }
  }

  /**
   * @description Gets information about the storage configuration.
   * @returns {object} Storage adapter information including source, path, and strategy.
   *
   * @example
   * ```javascript
   * const manager = new ExternalContextManager(config);
   * const info = manager.getStorageInfo();
   * console.log(`Storage: ${info.source} at ${info.path}`);
   * ```
   */
  getStorageInfo() {
    return this.#storage.getInfo();
  }

  /**
   * @description Retrieves the current context from storage.
   * Useful for refreshing the context with external changes.
   * @returns {Context|null} The context from storage or null if not found.
   *
   * @example
   * ```javascript
   * const manager = new ExternalContextManager(config);
   * const refreshedContext = manager.retrieveFromStorage();
   * ```
   */
  retrieveFromStorage() {
    return this.#storage.retrieve();
  }

  /**
   * @description Removes the context from external storage.
   * @returns {boolean} True if removal was successful, false otherwise.
   *
   * @example
   * ```javascript
   * const manager = new ExternalContextManager(config);
   * const removed = manager.removeFromStorage();
   * ```
   */
  removeFromStorage() {
    return this.#storage.remove();
  }

  /**
   * @description Checks if the context exists in external storage.
   * @returns {boolean} True if context exists in storage, false otherwise.
   *
   * @example
   * ```javascript
   * const manager = new ExternalContextManager(config);
   * if (manager.existsInStorage()) {
   *   console.log('Context persisted in storage');
   * }
   * ```
   */
  existsInStorage() {
    return this.#storage.exists();
  }
}

export default ExternalContextManager;