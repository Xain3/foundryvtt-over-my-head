/**
 * @file inMemory.js
 * @description This file contains the InMemoryContextManager class for managing context data stored directly in application memory.
 * @path /src/context/inMemory.js
 * @date 26 May 2025
 */

import Context, { DEFAULT_INITIALIZATION_PARAMS } from "./context.js";

/**
 * @class InMemoryContextManager
 * @description Manages context data stored directly in application memory.
 * This context exists only during the application runtime and does not persist across sessions.
 * Provides a high-level interface for interacting with Context instances, including
 * synchronization operations, data access, and state management.
 *
 * @property {Context} #context - The internal Context instance managed by this class. Private property that holds the actual context data and provides isolation from direct access.
 *
 * @example
 * ```javascript
 * const contextManager = new InMemoryContextManager();
 *
 * // Access context data
 * const userData = contextManager.data.get('user');
 *
 * // Sync with another context
 * const result = contextManager.sync(otherContext, 'merge');
 *
 * // Create a snapshot
 * const snapshot = contextManager.createSnapshot();
 *
 * // Call with overrides
 * const customManager = new InMemoryContextManager({
 *   data: { customKey: 'customValue' },
 *   flags: { customFlag: true }
 * });
 * ```
 */
class InMemoryContextManager {
  #context;

  /**
   * @constructor
   * @description Creates a new InMemoryContextManager instance with a fresh Context.
   * The Context is initialized with default parameters and stored in memory.
   * Initializes the internal context with merged parameters from defaults and user-provided overrides.
   *
   * @param {object} [initializationParams={}] - Parameters to override defaults for context initialization.
   * @param {object} [initializationParams.data] - Initial data to populate the context with.
   * @param {object} [initializationParams.flags] - Initial flags to set in the context.
   * @param {object} [initializationParams.state] - Initial state values for the context.
   * @param {object} [initializationParams.settings] - Initial settings configuration for the context.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * console.log(manager.context); // Access the underlying Context instance
   *
   * // With custom parameters
   * const customManager = new InMemoryContextManager({
   *   data: { customKey: 'customValue' },
   *   flags: { customFlag: true }
   * });
   * ```
   */
  constructor(initializationParams = {}) {
    // Merge with defaults and wrap in the expected structure
    const mergedParams = { ...DEFAULT_INITIALIZATION_PARAMS, ...initializationParams };
    this.#context = new Context({ initializationParams: mergedParams });
  }

  /**
   * @description Gets the underlying Context instance.
   * Provides direct access to the managed Context for advanced operations.
   *
   * @returns {Context} The managed Context instance containing all context data and methods.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const context = manager.context;
   * // Direct access to Context methods and properties
   * ```
   */
  get context() {
    return this.#context;
  }

  /**
   * @description Gets the schema definition for this context.
   * Provides access to the structure definitions and validation rules for context data.
   *
   * @returns {ContextContainer} The schema container with context structure definitions and validation rules.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const schema = manager.schema;
   * console.log(schema.get('userSchema')); // Access specific schema definitions
   * ```
   */
  get schema() {
    return this.#context.schema;
  }

  /**
   * @description Gets the module-wide constants available in this context.
   * Provides access to read-only values that remain constant throughout the application lifecycle.
   *
   * @returns {ContextContainer} The constants container with read-only values and configuration constants.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const constants = manager.constants;
   * console.log(constants.get('MAX_RETRIES')); // Access constant values
   * ```
   */
  get constants() {
    return this.#context.constants;
  }

  /**
   * @description Gets the module's manifest data.
   * Provides access to module metadata including version, author, and configuration information.
   *
   * @returns {ContextContainer} The manifest container with module metadata and configuration details.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const manifest = manager.manifest;
   * console.log(manifest.get('version')); // Access module version
   * ```
   */
  get manifest() {
    return this.#context.manifest;
  }

  /**
   * @description Gets the flags associated with this context.
   * Provides access to boolean state indicators that control application behavior and feature toggles.
   *
   * @returns {ContextContainer} The flags container with boolean state indicators and feature flags.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
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
   * @description Gets the mutable state object for this context.
   * Provides access to runtime state that can be modified during application execution.
   *
   * @returns {ContextContainer} The state container for runtime state management and temporary data storage.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const state = manager.state;
   * state.set('currentUser', userObject); // Update runtime state
   * ```
   */
  get state() {
    return this.#context.state;
  }

  /**
   * @description Gets the general data associated with this context.
   * Provides access to application-specific data that persists during the context lifecycle.
   *
   * @returns {ContextContainer} The data container for application-specific data and user information.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const data = manager.data;
   * const userData = data.get('users'); // Access application data
   * ```
   */
  get data() {
    return this.#context.data;
  }

  /**
   * @description Gets the settings associated with this context.
   * Provides access to configuration values that control application behavior and user preferences.
   *
   * @returns {ContextContainer} The settings container for configuration values and user preferences.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const settings = manager.settings;
   * const theme = settings.get('theme'); // Access configuration settings
   * ```
   */
  get settings() {
    return this.#context.settings;
  }

  /**
   * @description Compares this context with another context to identify differences.
   * Performs a deep comparison between contexts and returns detailed information about differences,
   * including added, removed, and modified properties across all context containers.
   *
   * @param {Context|ContextContainer|ContextItem} otherContext - The context to compare against. Can be a full Context instance, a specific container, or an individual item.
   * @returns {object} Comparison result object detailing differences between contexts, including arrays of added, removed, and modified properties.
   *
   * @example
   * ```javascript
   * const manager1 = new InMemoryContextManager();
   * const manager2 = new InMemoryContextManager();
   * const differences = manager1.compare(manager2.context);
   * console.log(differences.added); // Properties added in otherContext
   * console.log(differences.removed); // Properties removed from otherContext
   * console.log(differences.modified); // Properties with different values
   * ```
   */
  compare(otherContext) {
    return this.#context.compare(otherContext);
  }

  /**
   * @description Performs a synchronization operation between this context and a target context.
   * Executes various synchronization strategies to align context data between instances,
   * supporting different merge strategies and conflict resolution approaches.
   *
   * @param {Context|ContextContainer|ContextItem} target - The target context to sync with. Can be a full Context instance, a specific container, or an individual item.
   * @param {string} operation - The synchronization operation to perform. Supported operations include 'merge' (combine data), 'replace' (overwrite with target), 'update' (selective updates).
   * @param {object} [options={}] - Additional options for the sync operation to customize behavior.
   * @param {boolean} [options.preserveMetadata=false] - Whether to preserve metadata during synchronization.
   * @param {boolean} [options.allowConflicts=true] - Whether to allow conflicting values during merge operations.
   * @param {string[]} [options.excludeKeys=[]] - Array of keys to exclude from synchronization.
   * @param {Function} [options.conflictResolver] - Custom function to resolve conflicts during merge operations.
   * @returns {object} Result of the synchronization operation, including success status, applied changes, and any conflicts encountered.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const result = manager.sync(targetContext, 'merge', {
   *   preserveMetadata: true,
   *   excludeKeys: ['temporaryData']
   * });
   *
   * if (result.success) {
   *   console.log('Sync completed successfully');
   *   console.log('Changes applied:', result.changes);
   * } else {
   *   console.log('Sync failed:', result.errors);
   * }
   * ```
   */
  sync(target, operation, options = {}) {
    return this.#context.sync(target, operation, options);
  }

  /**
   * @description Performs an automatic synchronization with a target context using intelligent merge strategies.
   * @param {Context|ContextContainer|ContextItem} target - The target context to auto-sync with.
   * @param {object} [options={}] - Options to control the auto-sync behavior.
   * @returns {object} Result of the auto-sync operation.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const result = manager.autoSync(targetContext, { strategy: 'intelligent' });
   * ```
   */
  autoSync(target, options = {}) {
    return this.#context.autoSync(target, options);
  }

  /**
   * @description Updates this context to match the target context.
   * @param {Context|ContextContainer|ContextItem} target - The target context to match.
   * @param {object} [options={}] - Options for the update operation.
   * @returns {object} Result of the update operation.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * manager.updateToMatch(sourceContext, { preserveLocal: false });
   * ```
   */
  updateToMatch(target, options = {}) {
    return this.#context.updateToMatch(target, options);
  }

  /**
   * @description Updates the target context to match this context.
   * @param {Context|ContextContainer|ContextItem} target - The target context to update.
   * @param {object} [options={}] - Options for the update operation.
   * @returns {object} Result of the target update operation.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * manager.updateTarget(targetContext, { force: true });
   * ```
   */
  updateTarget(target, options = {}) {
    return this.#context.updateTarget(target, options);
  }

  /**
   * @description Merges this context with a target context, with newer values taking precedence.
   * @param {Context|ContextContainer|ContextItem} target - The target context to merge with.
   * @param {object} [options={}] - Options for the merge operation.
   * @returns {object} Result of the merge operation.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const result = manager.mergeNewerWins(targetContext, { timestampField: 'modifiedAt' });
   * ```
   */
  mergeNewerWins(target, options = {}) {
    return this.#context.mergeNewerWins(target, options);
  }

  /**
   * @description Merges this context with a target context using priority-based resolution.
   * @param {Context|ContextContainer|ContextItem} target - The target context to merge with.
   * @param {object} [options={}] - Options including priority configuration.
   * @returns {object} Result of the priority-based merge operation.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const result = manager.mergeWithPriority(targetContext, {
   *   priority: 'source',
   *   conflictResolution: 'manual'
   * });
   * ```
   */
  mergeWithPriority(target, options = {}) {
    return this.#context.mergeWithPriority(target, options);
  }

  /**
   * @description Merges this context with a target context, giving priority to the target context.
   * @param {Context|ContextContainer|ContextItem} target - The target context to merge with (takes priority).
   * @param {object} [options={}] - Options for the target-priority merge operation.
   * @returns {object} Result of the target-priority merge operation.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const result = manager.mergeWithTargetPriority(targetContext, {
   *   preserveSourceMetadata: true
   * });
   * ```
   */
  mergeWithTargetPriority(target, options = {}) {
    return this.#context.mergeWithTargetPriority(target, options);
  }

  /**
   * @description Checks if this context is compatible with another context for synchronization.
   * @param {Context|ContextContainer|ContextItem} target - The target context to validate compatibility with.
   * @param {object} [options={}] - Validation options.
   * @returns {boolean} True if contexts are compatible for sync operations.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const isCompatible = manager.isCompatibleWith(otherContext);
   * if (isCompatible) {
   *   // Safe to perform sync operations
   *   manager.sync(otherContext, 'merge');
   * }
   * ```
   */
  isCompatibleWith(target, options = {}) {
    return this.#context.isCompatibleWith(target, options);
  }

  /**
   * @description Synchronizes a specific component with the same component in a target context.
   * @param {string} componentKey - The key of the component to sync ('schema', 'constants', 'manifest', 'flags', 'state', 'data', 'settings').
   * @param {Context|InMemoryContextManager} target - The target context or context manager to sync with.
   * @param {string} operation - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   *
   * @example
   * ```javascript
   * const manager1 = new InMemoryContextManager();
   * const manager2 = new InMemoryContextManager();
   * const result = manager1.syncComponent('data', manager2, 'merge');
   * ```
   */
  syncComponent(componentKey, target, operation, options = {}) {
    const targetContext = target instanceof InMemoryContextManager ? target.context : target;
    return this.#context.syncComponent(componentKey, targetContext, operation, options);
  }

  /**
   * @description Automatically synchronizes a specific component with the same component in a target context.
   * @param {string} componentKey - The key of the component to sync.
   * @param {Context|InMemoryContextManager} target - The target context or context manager to sync with.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  autoSyncComponent(componentKey, target, options = {}) {
    const targetContext = target instanceof InMemoryContextManager ? target.context : target;
    return this.#context.autoSyncComponent(componentKey, targetContext, options);
  }

  /**
   * @description Synchronizes the schema component with another context.
   * @param {Context|InMemoryContextManager} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncSchema(target, operation = 'auto', options = {}) {
    const targetContext = target instanceof InMemoryContextManager ? target.context : target;
    return this.#context.syncSchema(targetContext, operation, options);
  }

  /**
   * @description Synchronizes the data component with another context.
   * @param {Context|InMemoryContextManager} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncData(target, operation = 'auto', options = {}) {
    const targetContext = target instanceof InMemoryContextManager ? target.context : target;
    return this.#context.syncData(targetContext, operation, options);
  }

  /**
   * @description Synchronizes the state component with another context.
   * @param {Context|InMemoryContextManager} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncState(target, operation = 'auto', options = {}) {
    const targetContext = target instanceof InMemoryContextManager ? target.context : target;
    return this.#context.syncState(targetContext, operation, options);
  }

  /**
   * @description Synchronizes the flags component with another context.
   * @param {Context|InMemoryContextManager} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncFlags(target, operation = 'auto', options = {}) {
    const targetContext = target instanceof InMemoryContextManager ? target.context : target;
    return this.#context.syncFlags(targetContext, operation, options);
  }

  /**
   * @description Synchronizes the settings component with another context.
   * @param {Context|InMemoryContextManager} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncSettings(target, operation = 'auto', options = {}) {
    const targetContext = target instanceof InMemoryContextManager ? target.context : target;
    return this.#context.syncSettings(targetContext, operation, options);
  }

  /**
   * @description Synchronizes multiple components at once with another context.
   * @param {string[]} componentKeys - Array of component keys to sync.
   * @param {Context|InMemoryContextManager} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Object containing results for each component sync operation.
   */
  syncComponents(componentKeys, target, operation = 'auto', options = {}) {
    const targetContext = target instanceof InMemoryContextManager ? target.context : target;
    return this.#context.syncComponents(componentKeys, targetContext, operation, options);
  }
}

export default InMemoryContextManager;
