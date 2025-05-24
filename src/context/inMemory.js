/**
 * @file memory.js
 * @description This file contains the InMemoryContextManager class for managing context data stored directly in application memory.
 * @path /src/context/memory.js
 * @date 23 May 2025
 */

import Context from "./context";

/**
 * @class InMemoryContextManager
 * @description Manages context data stored directly in application memory.
 * This context exists only during the application runtime and does not persist across sessions.
 * Provides a high-level interface for interacting with Context instances, including
 * synchronization operations, data access, and state management.
 *
 * @property {Context} #context - The internal Context instance managed by this class.
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
 * ```
 */
class InMemoryContextManager {
  #context;

  /**
   * @constructor
   * @description Creates a new InMemoryContextManager instance with a fresh Context.
   * The Context is initialized with default parameters and stored in memory.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * console.log(manager.context); // Access the underlying Context instance
   * ```
   */
  constructor() {
    this.#context = new Context();
  }

  /**
   * @description Gets the underlying Context instance.
   * @returns {Context} The managed Context instance.
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
   * @returns {ContextContainer} The schema container with context structure definitions.
   */
  get schema() {
    return this.#context.schema;
  }

  /**
   * @description Gets the module-wide constants available in this context.
   * @returns {ContextContainer} The constants container with read-only values.
   */
  get constants() {
    return this.#context.constants;
  }

  /**
   * @description Gets the module's manifest data.
   * @returns {ContextContainer} The manifest container with module metadata.
   */
  get manifest() {
    return this.#context.manifest;
  }

  /**
   * @description Gets the flags associated with this context.
   * @returns {ContextContainer} The flags container with boolean state indicators.
   */
  get flags() {
    return this.#context.flags;
  }

  /**
   * @description Gets the mutable state object for this context.
   * @returns {ContextContainer} The state container for runtime state management.
   */
  get state() {
    return this.#context.state;
  }

  /**
   * @description Gets the general data associated with this context.
   * @returns {ContextContainer} The data container for application-specific data.
   */
  get data() {
    return this.#context.data;
  }

  /**
   * @description Gets the settings associated with this context.
   * @returns {ContextContainer} The settings container for configuration values.
   */
  get settings() {
    return this.#context.settings;
  }

  /**
   * @description Compares this context with another context to identify differences.
   * @param {Context|ContextContainer|ContextItem} otherContext - The context to compare against.
   * @returns {object} Comparison result object detailing differences between contexts.
   *
   * @example
   * ```javascript
   * const manager1 = new InMemoryContextManager();
   * const manager2 = new InMemoryContextManager();
   * const differences = manager1.compare(manager2.context);
   * ```
   */
  compare(otherContext) {
    return this.#context.compare(otherContext);
  }

  /**
   * @description Performs a synchronization operation between this context and a target context.
   * @param {Context|ContextContainer|ContextItem} target - The target context to sync with.
   * @param {string} operation - The synchronization operation to perform (e.g., 'merge', 'replace', 'update').
   * @param {object} [options={}] - Additional options for the sync operation.
   * @returns {object} Result of the synchronization operation.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * const result = manager.sync(targetContext, 'merge', { preserveMetadata: true });
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
   * @description Creates a snapshot of the current context state.
   * @deprecated This method is WORK-IN-PROGRESS and UNSTABLE. Uses experimental ContextSync snapshot functionality.
   * @param {object} [options={}] - Options for snapshot creation.
   * @returns {object} A snapshot object representing the current state of the context.
   * @warning Snapshot functionality is experimental and may not work correctly. API may change without notice.
   *
   * @example
   * ```javascript
   * const manager = new InMemoryContextManager();
   * // WARNING: Snapshot functionality is unstable
   * const snapshot = manager.createSnapshot({
   *   includeMetadata: true,
   *   deep: true
   * });
   * // Use snapshot for backup, comparison, or restoration (with caution)
   * ```
   */
  createSnapshot(options = {}) {
    return this.#context.createSnapshot(options);
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
