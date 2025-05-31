/**
 * @file external.js
 * @description This file contains the ExternalContextManager class for managing context data stored directly in application memory.
 * @path /src/contexts/external.js
 */

import _ from "lodash";
import Context, { DEFAULT_INITIALIZATION_PARAMS } from "./context.js";
import RootMapParser from "../helpers/rootMapParser.js";
import ContextMerger from './helpers/contextMerger.js';

/**
 * @class ExternalContextManager
 * @description Manages context data stored in application memory.
 * Provides a structured way to access and manipulate context data, including schema definitions,
 * constants, flags, state, data, and settings.
 * Depending on the location, this context might persist in memory, module scope, or user-specific storage.
 * Provides a high-level interface for interacting with Context instances, including
 * data access and state management.
 *
 * @property {Context} #context - The Context instance managed by this class. Private property that holds the actual context data and provides isolation from direct access.
 *
 * @example
 * ```javascript
 * const contextManager = new ExternalContextManager();
 *
 * // Access context data
 * const userData = contextManager.data.get('user');
 *
 * // Merge with another context
 * const result = contextManager.merge(otherContext, 'mergeNewerWins');
 *
 * // Create a snapshot
 * const snapshot = contextManager.createSnapshot();
 *
 * // Call with overrides
 * const customManager = new ExternalContextManager({
 *   data: { customKey: 'customValue' },
 *   flags: { customFlag: true }
 * });
 * ```
 */
class ExternalContextManager {
  #context;
  #constants;
  #configuration;
  #rootIdentifier;
  #rootMap;
  #mergeStrategy;
  #pathFromRoot;
  #contextRoot;

  /**
   * @constructor
   * @param {object} [options={}] - Configuration options
   * @param {string} [options.rootIdentifier] - Identifier for the root location. Using the default identifier from the configuration if not provided.
   * @param {string} [options.pathFromRoot] - Path from root to store context data. Defaults to the path defined in the configuration.
   * @param {object} [options.rootMap] - Mapping of root locations for context data. Defaults to the root map defined in the configuration.
   * @param {object} [options.initializationParams={}] - Context initialization parameters
   */
  constructor({
    rootIdentifier = undefined,
    pathFromRoot = undefined,
    rootMap = undefined,
    initializationParams = {
      mergeStrategy: 'mergeOlderWins'
    }
  } = {}) {
    // Merge with defaults and wrap in the expected structure
    const mergedParams = { ...DEFAULT_INITIALIZATION_PARAMS, ...initializationParams };
    const baseContext = new Context({ initializationParams: mergedParams });

    this.#constants = baseContext.constants;
    this.#configuration = this.#constants.getItem?.('context')?.getItem?.('external') || this.#constants.context?.external;

    if (!this.#configuration) {
      throw new Error('External context configuration not found in constants');
    }

    // Validate explicit parameters before fallback to defaults
    if (pathFromRoot !== undefined && (typeof pathFromRoot !== 'string' || pathFromRoot.trim() === '')) {
      throw new Error('Invalid configuration: rootIdentifier, pathFromRoot, and rootMap must be defined');
    }
    if (rootIdentifier !== undefined && (!rootIdentifier || typeof rootIdentifier !== 'string')) {
      throw new Error('Invalid configuration: rootIdentifier, pathFromRoot, and rootMap must be defined');
    }

    this.#rootIdentifier = rootIdentifier || this.#configuration.defaults?.rootIdentifier;
    this.#rootMap = rootMap || this.#configuration.rootMap;
    this.#pathFromRoot = pathFromRoot || this.#configuration.defaults?.pathFromRoot;
    this.#mergeStrategy = mergedParams.mergeStrategy;

    if (!this.#rootIdentifier || !this.#pathFromRoot || !this.#rootMap) {
      throw new Error('Invalid configuration: rootIdentifier, pathFromRoot, and rootMap must be defined');
    }

    try {
      this.#contextRoot = this.#determineRoot(this.#rootIdentifier);
      this.#context = this.#buildContextInstance(baseContext, this.#contextRoot, this.#pathFromRoot);
    } catch (error) {
      console.error('Failed to initialize ExternalContextManager:', error);
      throw error;
    }
  }

  // Private helper methods - organized at top per style guidelines
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

  #buildContextInstance(context, contextRoot, pathFromRoot) {
    if (!contextRoot || typeof contextRoot !== 'object') {
      throw new Error('Invalid context root');
    }

    if (!pathFromRoot || typeof pathFromRoot !== 'string' || pathFromRoot.trim() === '') {
      throw new Error('Invalid path from root');
    }

    // Use the original context instance directly instead of cloning to preserve methods
    const newContextInstance = context;

    // Check if there's already a context at this path
    const existingValue = contextRoot[pathFromRoot];

    if (existingValue && typeof existingValue === 'object') {
      // Check if existingValue looks like a Context instance by checking for Context-specific properties
      const isContextLike = existingValue.constants && existingValue.schema && existingValue.manifest && 
                           existingValue.flags && existingValue.state && existingValue.data && 
                           existingValue.settings && typeof existingValue.compare === 'function';
      
      if (isContextLike) {
        // Merge with existing Context instance using the configured strategy
        contextRoot[pathFromRoot] = this.#mergeContextInstances(pathFromRoot, existingValue, newContextInstance);
      } else {
        // Non-Context object exists - warn and replace
        contextRoot[pathFromRoot] = this.#warnAndReplaceContext(pathFromRoot, newContextInstance);
      }
    } else {
      // No existing value or primitive value - safe to set
      contextRoot[pathFromRoot] = newContextInstance;
    }

    return contextRoot[pathFromRoot];
  }

  #warnAndReplaceContext(pathFromRoot, newContextInstance) {
    console.warn(`Overwriting existing property at path: ${pathFromRoot}`);
    return newContextInstance;
  }

  #mergeContextInstances(pathFromRoot, existingValue, newContextInstance) {
    console.warn(`Merging existing Context instance at path: ${pathFromRoot}`);

    try {
      const mergeResult = ContextMerger.merge(
        existingValue,
        newContextInstance,
        this.#mergeStrategy
      );

      if (!mergeResult.success) {
        throw new Error(`Context merge failed: ${mergeResult.error}`);
      }

      return mergeResult.mergedContext || newContextInstance;
    } catch (error) {
      console.error('Failed to merge contexts:', error);
      throw new Error(`Context merge operation failed: ${error.message}`);
    }
  }

  // Getters - direct property access
  /**
   * Gets the underlying Context instance.
   * Provides direct access to the managed Context for advanced operations.
   * @type {Context}
   * @returns {Context} The managed Context instance containing all context data and methods.
   * @example
   * ```javascript
   * const manager = new ExternalContextManager();
   * const context = manager.context;
   * // Direct access to Context methods and properties
   * ```
   */
  get context() {
    return this.#context;
  }

  /**
   * Gets the schema definition for this context.
   * Provides access to the structure definitions and validation rules for context data.
   * @type {ContextContainer}
   * @returns {ContextContainer} The schema container with context structure definitions and validation rules.
   * @example
   * ```javascript
   * const manager = new ExternalContextManager();
   * const schema = manager.schema;
   * console.log(schema.get('userSchema')); // Access specific schema definitions
   * ```
   */
  get schema() {
    return this.#context.schema;
  }

  /**
   * Gets the module-wide constants available in this context.
   * Provides access to read-only values that remain constant throughout the application lifecycle.
   * @type {ContextContainer}
   * @returns {ContextContainer} The constants container with read-only values and configuration constants.
   * @example
   * ```javascript
   * const manager = new ExternalContextManager();
   * const constants = manager.constants;
   * console.log(constants.get('MAX_RETRIES')); // Access constant values
   * ```
   */
  get constants() {
    return this.#context.constants;
  }

  /**
   * Gets the module's manifest data.
   * Provides access to module metadata including version, author, and configuration information.
   * @type {ContextContainer}
   * @returns {ContextContainer} The manifest container with module metadata and configuration details.
   * @example
   * ```javascript
   * const manager = new ExternalContextManager();
   * const manifest = manager.manifest;
   * console.log(manifest.get('version')); // Access module version
   * ```
   */
  get manifest() {
    return this.#context.manifest;
  }

  /**
   * Gets the flags associated with this context.
   * Provides access to boolean state indicators that control application behavior and feature toggles.
   * @type {ContextContainer}
   * @returns {ContextContainer} The flags container with boolean state indicators and feature flags.
   * @example
   * ```javascript
   * const manager = new ExternalContextManager();
   * const flags = manager.flags;
   * if (flags.get('debugMode')) {
   *   console.log('Debug mode is enabled');
   * }
   * ```
   */
  get flags() {
    return this.#context.flags;
  }

  /**
   * Gets the mutable state object for this context.
   * Provides access to runtime state that can be modified during application execution.
   * @type {ContextContainer}
   * @returns {ContextContainer} The state container for runtime state management and temporary data storage.
   * @example
   * ```javascript
   * const manager = new ExternalContextManager();
   * const state = manager.state;
   * state.set('currentUser', userObject); // Update runtime state
   * ```
   */
  get state() {
    return this.#context.state;
  }

  /**
   * Gets the general data associated with this context.
   * Provides access to application-specific data that persists during the context lifecycle.
   * @type {ContextContainer}
   * @returns {ContextContainer} The data container for application-specific data and user information.
   * @example
   * ```javascript
   * const manager = new ExternalContextManager();
   * const data = manager.data;
   * const userData = data.get('users'); // Access application data
   * ```
   */
  get data() {
    return this.#context.data;
  }

  /**
   * Gets the settings associated with this context.
   * Provides access to configuration values that control application behavior and user preferences.
   * @type {ContextContainer}
   * @returns {ContextContainer} The settings container for configuration values and user preferences.
   * @example
   * ```javascript
   * const manager = new ExternalContextManager();
   * const settings = manager.settings;
   * const theme = settings.get('theme'); // Access configuration settings
   * ```
   */
  get settings() {
    return this.#context.settings;
  }

  // Comparison methods
  /**
   * Compares this context with another context to identify differences.
   * Performs a deep comparison between contexts and returns detailed information about differences,
   * including added, removed, and modified properties across all context containers.
   * @param {Context|ContextContainer|ContextItem} otherContext - The context to compare against. Can be a full Context instance, a specific container, or an individual item.
   * @param {object} [options={}] - Comparison options.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to compare ('createdAt', 'modifiedAt', 'lastAccessedAt').
   * @param {Context|ContextContainer|ContextItem} [options.sourceContext=this] - The source context to use for comparison.
   * @returns {object} Comparison result object detailing differences between contexts, including arrays of added, removed, and modified properties.
   * @example
   * ```javascript
   * const manager1 = new ExternalContextManager();
   * const manager2 = new ExternalContextManager();
   * const differences = manager1.compare(manager2.context);
   * console.log(differences.added); // Properties added in otherContext
   * console.log(differences.removed); // Properties removed from otherContext
   * console.log(differences.modified); // Properties with different values
   * ```
   */
  compare(otherContext, options = {}) {
    return this.#context.compare(otherContext, options);
  }

  // Primary merge method - preferred public API
  /**
   * Performs a deep merge of this context with a target context using ContextMerger.
   * This method provides granular synchronization at the ContextItem level with comprehensive
   * options for conflict resolution and change tracking.
   * @param {Context|ExternalContextManager} target - The target context to merge with.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply. Options include:
   *   - 'mergeNewerWins': Choose the item with the newer timestamp
   *   - 'mergeSourcePriority': Always prefer source context items
   *   - 'mergeTargetPriority': Always prefer target context items
   *   - 'updateSourceToTarget': Update source items to match target
   *   - 'updateTargetToSource': Update target items to match source
   *   - 'replace': Replace entire containers rather than merging items
   *   - 'noAction': Compare but don't modify anything
   * @param {object} [options={}] - Merge options to control behavior.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to use for comparisons ('createdAt', 'modifiedAt', 'lastAccessedAt').
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during merge operations.
   * @param {boolean} [options.createMissing=true] - Whether to create missing items in the target context.
   * @param {string[]} [options.excludeComponents=[]] - Array of component keys to exclude from merging.
   * @param {string[]} [options.includeComponents] - Array of component keys to include (if specified, only these will be merged).
   * @param {boolean} [options.dryRun=false] - If true, performs comparison without making changes.
   * @param {Function} [options.onConflict] - Custom callback function called for each conflict: (sourceItem, targetItem, path) => chosenItem
   * @returns {object} Detailed merge result with statistics and applied changes.
   * @example
   * ```javascript
   * const manager1 = new ExternalContextManager();
   * const manager2 = new ExternalContextManager();
   *
   * // Merge with newer items taking precedence
   * const result = manager1.merge(manager2, 'mergeNewerWins', {
   *   excludeComponents: ['schema'], // Don't merge schema
   *   preserveMetadata: true
   * });
   *
   * console.log(`Merged ${result.itemsProcessed} items with ${result.conflicts} conflicts`);
   * console.log('Changes applied:', result.changes);
   *
   * // Custom conflict resolution
   * const customResult = manager1.merge(manager2, 'mergeNewerWins', {
   *   onConflict: (sourceItem, targetItem, path) => {
   *     if (path.includes('criticalData')) {
   *       return sourceItem; // Always prefer source for critical data
   *     }
   *     return null; // Use default strategy for other items
   *   }
   * });
   * ```
   */
  merge(target, strategy = 'mergeNewerWins', options = {}) {
    const targetContext = target instanceof ExternalContextManager ? target.context : target;
    return this.#context.merge(targetContext, strategy, options);
  }
}

export default ExternalContextManager;