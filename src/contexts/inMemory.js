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
 * data access and state management.
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
 * // Compare with another context
 * const differences = contextManager.compare(otherContext);
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
}

export default InMemoryContextManager;
