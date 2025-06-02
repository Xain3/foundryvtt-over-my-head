/**
 * @file baseContextManager.js
 * @description This file contains the BaseContextManager class that provides a common interface for all context managers.
 * @path /src/contexts/baseContextManager.js
 */

/**
 * @class BaseContextManager
 * @description Base class for all context managers, providing a common interface and eliminating code duplication.
 * This class delegates all common functionality to the underlying Context instance while maintaining
 * a consistent API across different storage implementations.
 *
 * @property {Context} #context - The internal Context instance managed by this class.
 */
class BaseContextManager {
  #context;

  /**
   * @constructor
   * @description Creates a new BaseContextManager instance with the provided Context.
   * This constructor is intended to be called by subclasses.
   *
   * @param {Context} context - The Context instance to manage.
   * @throws {Error} If context is not provided or is invalid.
   *
   * @example
   * ```javascript
   * // Used by subclasses
   * class CustomContextManager extends BaseContextManager {
   *   constructor(options) {
   *     const context = new Context(options);
   *     super(context);
   *   }
   * }
   * ```
   */
  constructor(context) {
    if (!context) {
      throw new Error('Context instance is required');
    }
    this.#context = context;
  }

  /**
   * @description Gets the underlying Context instance.
   * Provides direct access to the managed Context for advanced operations.
   *
   * @returns {Context} The managed Context instance containing all context data and methods.
   *
   * @example
   * ```javascript
   * const manager = new CustomContextManager();
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
   * const manager = new CustomContextManager();
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
   * const manager = new CustomContextManager();
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
   * const manager = new CustomContextManager();
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
   * const manager = new CustomContextManager();
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
   * const manager = new CustomContextManager();
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
   * const manager = new CustomContextManager();
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
   * const manager = new CustomContextManager();
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
   * @param {Context|ContextContainer|ContextItem} otherContext - The context to compare against.
   * @param {object} [options={}] - Comparison options.
   * @returns {object} Comparison result object detailing differences between contexts.
   *
   * @example
   * ```javascript
   * const manager1 = new CustomContextManager();
   * const manager2 = new CustomContextManager();
   * const differences = manager1.compare(manager2.context);
   * console.log(differences.added); // Properties added in otherContext
   * ```
   */
  compare(otherContext, options = {}) {
    return this.#context.compare(otherContext, options);
  }

  /**
   * @description Performs a deep merge of this context with a target context.
   * Delegates to the underlying Context's merge functionality.
   *
   * @param {Context|BaseContextManager} target - The target context to merge with.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply.
   * @param {object} [options={}] - Merge options to control behavior.
   * @returns {object} Detailed merge result with statistics and applied changes.
   *
   * @example
   * ```javascript
   * const manager1 = new CustomContextManager();
   * const manager2 = new CustomContextManager();
   * const result = manager1.merge(manager2, 'mergeNewerWins');
   * ```
   */
  merge(target, strategy = 'mergeNewerWins', options = {}) {
    const targetContext = target instanceof BaseContextManager ? target.context : target;
    return this.#context.merge(targetContext, strategy, options);
  }
}

export default BaseContextManager;
