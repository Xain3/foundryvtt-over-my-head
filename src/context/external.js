/**
 * @file external.js
 * @description This file contains the ExternalContextManager class for managing context data stored on external objects.
 * @path /src/context/external.js
 * @date 23 May 2025
 */

import Context from "./context";
import _ from "lodash";

import RootManager from "./helpers/externalCtxRootManager";

/**
 * @class ExternalContextManager
 * @description Manages context data stored on external objects such as global scope objects,
 * module objects, or external sources. This context may persist across sessions depending
 * on the storage location.
 *
 * @property {Context} #context - The internal Context instance
 * @property {object} #constants - Constants from the context
 * @property {object} #defaults - Default configuration values
 * @property {string} #rootIdentifier - The identifier for the root object being used
 * @property {RootManager} #rootManager - Manager for external root objects
 * @property {*} #root - The current root object being used for storage
 * @property {string} #pathFromRoot - Path from root to the context storage location
 * @property {Context} remoteContext - The context instance stored on the external object
 */
class ExternalContextManager {
  #context;
  #constants;
  #defaults;
  #rootIdentifier;
  #rootManager;
  #root;
  #pathFromRoot;

  /**
   * Creates a new ExternalContextManager instance.
   * Initializes the context, root manager, and sets up the remote context on the external object.
   * @param {string} [rootIdentifier] - The identifier for the root object to use for storage.
   *                                   If undefined, uses the default root identifier from constants.
   * @param {string} [pathFromRoot] - The property path from root where the context will be stored.
   *                                 If undefined, uses the default path from constants.
   */
  constructor(
    rootIdentifier = undefined,
    pathFromRoot = undefined
  ) {
    this.#context = new Context();
    this.#constants = this.#context.constants;
    this.#defaults = this.#constants.external.defaults;
    this.#rootIdentifier = rootIdentifier || this.#defaults.rootIdentifier;
    this.#rootManager = new RootManager({
      rootMap: this.#constants.external.rootMap,
      rootIdentifier: this.#rootIdentifier
    });

    this.#root = this.retrieveRoot(this.#rootIdentifier);
    this.#pathFromRoot = pathFromRoot || this.#defaults.defaultPathFromRoot;
    this.remoteContext = this.#initializeRemoteContext(this.#root, this.#pathFromRoot);
  }

  /**
   * @private
   * @method #initializeRemoteContext
   * @description Initializes the remote context on the specified root object at the given path.
   * Creates a deep clone of the internal context and stores it on the external object.
   * @param {*} [root=this.#root] - The root object to store the context on
   * @param {string} [pathFromRoot=this.#pathFromRoot] - The property path from root to store the context
   * @returns {Context} The initialized remote context instance
   */
  #initializeRemoteContext(root = this.#root, pathFromRoot = this.#pathFromRoot) {
    root[pathFromRoot] = _.cloneDeep(this.#context);
    return root[pathFromRoot];
  }

  /**
   * Retrieves a root object using the specified root identifier.
   * If no identifier is provided, uses the default root identifier.
   *
   * @param {string} [rootIdentifier] - The identifier for the root to retrieve.
   *                                   If undefined, uses the default root identifier.
   * @returns {*} The root object associated with the given identifier.
   *              It can be an object in global scope, a specific object in a module
   *              or an external source.
   */
  retrieveRoot(rootIdentifier = undefined) {
    return this.#rootManager.getRoot({
      rootIdentifier: rootIdentifier || this.#defaults.rootIdentifier
    });
  }

  /**
   * Gets the remote context stored on the external object.
   * @returns {Context} The context instance stored externally
   */
  get context() {
    return this.remoteContext;
  }

  /**
   * Gets the schema from the remote context.
   * @returns {object} The context schema
   */
  get schema() {
    return this.remoteContext.schema;
  }

  /**
   * Gets the constants object.
   * @returns {object} The constants configuration
   */
  get constants() {
    return this.#constants;
  }

  /**
   * Gets the default configuration values.
   * @returns {object} The default settings
   */
  get defaults() {
    return this.#defaults;
  }

  /**
   * Gets the manifest data from the remote context.
   * @returns {object} The manifest object
   */
  get manifest() {
    return this.remoteContext.manifest;
  }

  /**
   * Gets the flags from the remote context.
   * @returns {object} The flags object
   */
  get flags() {
    return this.remoteContext.flags;
  }

  /**
   * Gets the state from the remote context.
   * @returns {object} The state object
   */
  get state() {
    return this.remoteContext.state;
  }

  /**
   * Gets the data from the remote context.
   * @returns {object} The data object
   */
  get data() {
    return this.remoteContext.data;
  }

  /**
   * Gets the settings from the remote context.
   * @returns {object} The settings object
   */
  get settings()  {
    return this.remoteContext.settings;
  }

  /**
   * Compares this context with another context.
   * @param {Context} otherContext - The context to compare against
   * @returns {*} The comparison result from the remote context
   */
  compare(otherContext) {
    return this.remoteContext.compare(otherContext);
  }

  /**
   * Synchronizes this context with a target context using the specified operation.
   * @param {Context} target - The target context to sync with
   * @param {string} operation - The sync operation to perform
   * @param {object} [options={}] - Additional options for the sync operation
   * @returns {*} The result of the sync operation
   */
  sync(target, operation, options = {}) {
    return this.remoteContext.sync(target, operation, options);
  }

  /**
   * Automatically synchronizes this context with a target context.
   * @param {Context} target - The target context to auto-sync with
   * @param {object} [options={}] - Additional options for the auto-sync operation
   * @returns {*} The result of the auto-sync operation
   */
  autoSync(target, options = {}) {
    return this.remoteContext.autoSync(target, options);
  }

  /**
   * Updates this context to match the target context.
   * @param {Context} target - The target context to match
   * @param {object} [options={}] - Additional options for the update operation
   * @returns {*} The result of the update operation
   */
  updateToMatch(target, options = {}) {
    return this.remoteContext.updateToMatch(target, options);
  }

  /**
   * Updates the target context to match this context.
   * @param {Context} target - The target context to update
   * @param {object} [options={}] - Additional options for the update operation
   * @returns {*} The result of the update operation
   */
  updateTarget(target, options = {}) {
    return this.remoteContext.updateTarget(target, options);
  }

  /**
   * Merges this context with a target context, with newer values taking precedence.
   * @param {Context} target - The target context to merge with
   * @param {object} [options={}] - Additional options for the merge operation
   * @returns {*} The result of the merge operation
   */
  mergeNewerWins(target, options = {}) {
    return this.remoteContext.mergeNewerWins(target, options);
  }

  /**
   * Merges this context with a target context using priority-based merging.
   * @param {Context} target - The target context to merge with
   * @param {object} [options={}] - Additional options for the merge operation
   * @returns {*} The result of the merge operation
   */
  mergeWithPriority(target, options = {}) {
    return this.remoteContext.mergeWithPriority(target, options);
  }

  /**
   * Merges this context with a target context, giving priority to the target.
   * @param {Context} target - The target context to merge with
   * @param {object} [options={}] - Additional options for the merge operation
   * @returns {*} The result of the merge operation
   */
  mergeWithTargetPriority(target, options = {}) {
    return this.remoteContext.mergeWithTargetPriority(target, options);
  }

  /**
   * Checks if this context is compatible with the target context.
   * @param {Context} target - The target context to check compatibility with
   * @param {object} [options={}] - Additional options for the compatibility check
   * @returns {boolean} True if compatible, false otherwise
   */
  isCompatibleWith(target, options = {}) {
    return this.remoteContext.isCompatibleWith(target, options);
  }

  /**
   * Creates a snapshot of the remote context.
   * @deprecated This method is WORK-IN-PROGRESS and UNSTABLE. Uses experimental ContextSync snapshot functionality.
   * @param {object} [options={}] - Additional options for creating the snapshot
   * @returns {*} A snapshot of the remote context
   * @warning Snapshot functionality is experimental and may not work correctly. API may change without notice.
   */
  createSnapshot(options = {}) {
    return this.remoteContext.createSnapshot(options);
  }

  /**
   * @description Synchronizes a specific component with the same component in a target context.
   * @param {string} componentKey - The key of the component to sync ('schema', 'constants', 'manifest', 'flags', 'state', 'data', 'settings').
   * @param {Context|ExternalContextManager} target - The target context or context manager to sync with.
   * @param {string} operation - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncComponent(componentKey, target, operation, options = {}) {
    const targetContext = target instanceof ExternalContextManager ? target.context : target;
    return this.remoteContext.syncComponent(componentKey, targetContext, operation, options);
  }

  /**
   * @description Automatically synchronizes a specific component with the same component in a target context.
   * @param {string} componentKey - The key of the component to sync.
   * @param {Context|ExternalContextManager} target - The target context or context manager to sync with.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  autoSyncComponent(componentKey, target, options = {}) {
    const targetContext = target instanceof ExternalContextManager ? target.context : target;
    return this.remoteContext.autoSyncComponent(componentKey, targetContext, options);
  }

  /**
   * @description Synchronizes the data component with another context.
   * @param {Context|ExternalContextManager} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncData(target, operation = 'auto', options = {}) {
    const targetContext = target instanceof ExternalContextManager ? target.context : target;
    return this.remoteContext.syncData(targetContext, operation, options);
  }

  /**
   * @description Synchronizes the state component with another context.
   * @param {Context|ExternalContextManager} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncState(target, operation = 'auto', options = {}) {
    const targetContext = target instanceof ExternalContextManager ? target.context : target;
    return this.remoteContext.syncState(targetContext, operation, options);
  }

  /**
   * @description Synchronizes the flags component with another context.
   * @param {Context|ExternalContextManager} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncFlags(target, operation = 'auto', options = {}) {
    const targetContext = target instanceof ExternalContextManager ? target.context : target;
    return this.remoteContext.syncFlags(targetContext, operation, options);
  }

  /**
   * @description Synchronizes multiple components at once with another context.
   * @param {string[]} componentKeys - Array of component keys to sync.
   * @param {Context|ExternalContextManager} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Object containing results for each component sync operation.
   */
  syncComponents(componentKeys, target, operation = 'auto', options = {}) {
    const targetContext = target instanceof ExternalContextManager ? target.context : target;
    return this.remoteContext.syncComponents(componentKeys, targetContext, operation, options);
  }
}

export default ExternalContextManager;
