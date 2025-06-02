/**
 * @file inMemory.js
 * @description This file contains the InMemoryContextManager class for managing context data stored directly in application memory.
 * @path /src/contexts/inMemory.js
 * @date 26 May 2025
 */

import Context, { DEFAULT_INITIALIZATION_PARAMS } from "./context.js";
import BaseContextManager from "./baseContextManager.js";

/**
 * @class InMemoryContextManager
 * @extends BaseContextManager
 * @description Manages context data stored directly in application memory.
 * This context exists only during the application runtime and does not persist across sessions.
 * Inherits common functionality from BaseContextManager, eliminating code duplication.
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
class InMemoryContextManager extends BaseContextManager {

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
    // Merge with defaults and create context
    const mergedParams = { ...DEFAULT_INITIALIZATION_PARAMS, ...initializationParams };
    const context = new Context({ initializationParams: mergedParams });
    
    // Call parent constructor with the context instance
    super(context);
  }
}

export default InMemoryContextManager;
