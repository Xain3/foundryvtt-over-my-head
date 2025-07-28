/**
 * @file contextHelpers.js
 * @description This file contains the ContextHelpers class that serves as a centralized entry point for all context helper methods and classes.
 * @path src/contexts/helpers/contextHelpers.js
 */

import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';
import { ContextValueWrapper } from './contextValueWrapper.js';
import ContextSync from './contextSync.js';
import ContextItemSync from './contextItemSync.js';
import ContextContainerSync from './contextContainerSync.js';
import ContextContainerSyncEngine from './contextContainerSyncEngine.js';
import ContextAutoSync from './contextAutoSync.js';
import ContextLegacySync from './contextLegacySync.js';
import ContextMerger, { ItemFilter } from './contextMerger.js';
import ContextOperations from './contextOperations.js';
import ContextComparison from './contextComparison.js';
import { ContextItemSetter } from './contextItemSetter.js';
import ContextPathUtils from './contextPathUtils.js';
import RootMapValidator from './validators/rootMapValidator.js';

/**
 * @class ContextHelpers
 * @export
 * @description Centralized entry point for all context helper classes and methods.
 * This class provides access to all helper functionality through a single import,
 * reducing the need for multiple imports when using helpers from outside the helpers folder.
 *
 * For usage within the helpers folder, continue to use direct imports for better
 * dependency management and to avoid circular dependencies.
 *
 * ## Public API
 * ### Core Data Management
 * - `Item` - Class for individual data items with metadata and timestamps
 * - `Container` - Class for managing collections of items with dot-notation access
 * - `ValueWrapper` - Utility for wrapping values into Context objects
 * - `ItemSetter` - Utility for setting items in containers
 *
 * ### Synchronization
 * - `Sync` - Facade for all synchronization operations
 * - `ItemSync` - Specialized sync for ContextItem instances
 * - `ContainerSync` - Specialized sync for ContextContainer instances
 * - `ContainerSyncEngine` - Complex recursive sync engine
 * - `AutoSync` - Automatic synchronization capabilities
 * - `LegacySync` - Legacy synchronization operations
 *
 * ### Merging & Operations
 * - `Merger` - Sophisticated merging with conflict resolution
 * - `Operations` - Bulk and multi-context operations
 * - `Filter` - Filtering utilities for selective operations
 *
 * ### Utilities
 * - `Comparison` - Comparison utilities for contexts
 * - `Validator` - Validation utilities
 *
 * ## Static Methods
 * All helper classes are exposed as static properties, and key methods are exposed
 * as static methods for convenience.
 *
 * @example
 * // Instead of multiple imports:
 * // import { ContextItem } from './helpers/contextItem.js';
 * // import ContextSync from './helpers/contextSync.js';
 * // import ContextMerger from './helpers/contextMerger.js';
 *
 * // Use single import:
 * import ContextHelpers from './helpers/contextHelpers.js';
 *
 * // Access classes
 * const item = new ContextHelpers.Item('value');
 * const result = ContextHelpers.sync(source, target, 'mergeNewerWins');
 * const merged = ContextHelpers.merge(source, target);
 */
class ContextHelpers {
  // ===== Core Data Management =====

  /**
   * @static
   * @description ContextItem class for individual data items.
   */
  /**
   * @static
   * @description Item class for individual data items.
   */
  static Item = ContextItem;

  /**
   * @static
   * @description ContextContainer class for managing collections of items.
   */
  /**
   * @static
   * @description Container class for managing collections of items.
   */
  static Container = ContextContainer;

  /**
   * @static
   * @description ContextValueWrapper utility for wrapping values.
   */
  /**
   * @static
   * @description ValueWrapper utility for wrapping values.
   */
  static ValueWrapper = ContextValueWrapper;

  /**
   * @static
   * @description ContextItemSetter utility for setting items in containers.
   */
  /**
   * @static
   * @description ItemSetter utility for setting items in containers.
   */
  static ItemSetter = ContextItemSetter;

  // ===== Synchronization =====

  /**
   * @static
   * @description ContextSync facade for all synchronization operations.
   */
  /**
   * @static
   * @description Sync facade for all synchronization operations.
   */
  static Sync = ContextSync;

  /**
   * @static
   * @description ContextItemSync for ContextItem synchronization.
   */
  /**
   * @static
   * @description ItemSync for item-level synchronization.
   */
  static ItemSync = ContextItemSync;

  /**
   * @static
   * @description ContextContainerSync for ContextContainer synchronization.
   */
  /**
   * @static
   * @description ContainerSync for container synchronization.
   */
  static ContainerSync = ContextContainerSync;

  /**
   * @static
   * @description ContextContainerSyncEngine for complex recursive synchronization.
   */
  /**
   * @static
   * @description ContainerSyncEngine for complex recursive synchronization.
   */
  static ContainerSyncEngine = ContextContainerSyncEngine;

  /**
   * @static
   * @description ContextAutoSync for automatic synchronization.
   */
  /**
   * @static
   * @description AutoSync for automatic synchronization.
   */
  static AutoSync = ContextAutoSync;

  /**
   * @static
   * @description ContextLegacySync for legacy synchronization operations.
   */
  /**
   * @static
   * @description LegacySync for legacy synchronization operations.
   */
  static LegacySync = ContextLegacySync;

  // ===== Merging & Operations =====

  /**
   * @static
   * @description ContextMerger for sophisticated merging operations.
   */
  /**
   * @static
   * @description Merger for sophisticated merging operations.
   */
  static Merger = ContextMerger;

  /**
   * @static
   * @description ContextOperations for bulk and multi-context operations.
   */
  /**
   * @static
   * @description Operations for bulk and multi-context operations.
   */
  static Operations = ContextOperations;

  /**
   * @static
   * @description ItemFilter for filtering utilities.
   */
  /**
   * @static
   * @description Filter utility for selective operations.
   */
  static Filter = ItemFilter;

  // ===== Utilities =====

  /**
   * @static
   * @description ContextComparison for comparison utilities.
   */
  /**
   * @static
   * @description Comparison utilities for contexts.
   */
  static Comparison = ContextComparison;

  /**
   * @static
   * @description RootMapValidator for validation utilities.
   */
  /**
   * @static
   * @description Validator for root map configurations.
   */
  static Validator = RootMapValidator;

  /**
   * @static
   * @description ContextPathUtils for context-aware path operations.
   */
  /**
   * @static
   * @description PathUtils for context-aware path operations.
   */
  static PathUtils = ContextPathUtils;

  // ===== Convenience Methods =====

  /**
   * Convenience method for synchronizing contexts.
   * @param {Context|ContextContainer|ContextItem} source - The source context.
   * @param {Context|ContextContainer|ContextItem} target - The target context.
   * @param {string} operation - The synchronization operation.
   * @param {object} options - Synchronization options.
   * @returns {object} The synchronization result.
   */
  static sync(source, target, operation, options = {}) {
    return ContextSync.sync(source, target, operation, options);
  }

  /**
   * Convenience method for safely synchronizing contexts.
   * @param {Context|ContextContainer|ContextItem} source - The source context.
   * @param {Context|ContextContainer|ContextItem} target - The target context.
   * @param {string} operation - The synchronization operation.
   * @param {object} options - Synchronization options.
   * @returns {object} The synchronization result.
   */
  static syncSafe(source, target, operation, options = {}) {
    return ContextSync.syncSafe(source, target, operation, options);
  }

  /**
   * Convenience method for automatic synchronization.
   * @param {Context|ContextContainer|ContextItem} source - The source context.
   * @param {Context|ContextContainer|ContextItem} target - The target context.
   * @param {object} options - Synchronization options.
   * @returns {object} The synchronization result.
   */
  static autoSync(source, target, options = {}) {
    return ContextSync.autoSync(source, target, options);
  }

  /**
   * Convenience method for merging contexts.
   * @param {Context} source - The source context.
   * @param {Context} target - The target context.
   * @param {string} strategy - The merge strategy.
   * @param {object} options - Merge options.
   * @returns {object} The merge result.
   */
  static merge(source, target, strategy = 'mergeNewerWins', options = {}) {
    return ContextMerger.merge(source, target, strategy, options);
  }

  /**
   * Convenience method for comparing contexts.
   * @param {Context|ContextContainer|ContextItem} source - The source context.
   * @param {Context|ContextContainer|ContextItem} target - The target context.
   * @param {object} options - Comparison options.
   * @returns {object} The comparison result.
   */
  static compare(source, target, options = {}) {
    return ContextComparison.compare(source, target, options);
  }

  /**
   * Convenience method for wrapping values.
   * @param {*} value - The value to wrap.
   * @param {object} options - Wrapping options.
   * @returns {ContextItem|ContextContainer} The wrapped value.
   */
  static wrap(value, options = {}) {
    return ContextValueWrapper.wrap(value, options);
  }

  /**
   * Convenience method for resolving mixed paths.
   * @param {Object} rootObject - The root object to start navigation from.
   * @param {string} path - The dot-notation path to resolve.
   * @returns {Object} The resolution result.
   */
  static resolveMixedPath(rootObject, path) {
    return ContextPathUtils.resolveMixedPath(rootObject, path);
  }

  /**
   * Convenience method for checking if a path exists in mixed structures.
   * @param {Object} rootObject - The root object to start navigation from.
   * @param {string} path - The dot-notation path to check.
   * @returns {boolean} True if the path exists.
   */
  static pathExists(rootObject, path) {
    return ContextPathUtils.pathExistsInMixedStructure(rootObject, path);
  }

  /**
   * Convenience method for getting values from mixed paths.
   * @param {Object} rootObject - The root object to start navigation from.
   * @param {string} path - The dot-notation path to resolve.
   * @returns {*} The resolved value or undefined if path doesn't exist.
   */
  static getValueFromMixedPath(rootObject, path) {
    return ContextPathUtils.getValueFromMixedPath(rootObject, path);
  }

  // ===== Constants and Enums =====

  /**
   * @static
   * @description Synchronization operations enum.
   */
  static get SYNC_OPERATIONS() {
    return ContextSync.SYNC_OPERATIONS;
  }

  /**
   * @static
   * @description Comparison results enum.
   */
  static get COMPARISON_RESULTS() {
    return ContextComparison.COMPARISON_RESULTS;
  }

  /**
   * @static
   * @description Merge strategies enum.
   */
  static get MERGE_STRATEGIES() {
    return ContextMerger.MERGE_STRATEGIES;
  }
}

export default ContextHelpers;
export { ContextHelpers,
  ContextItem, ContextContainer, ContextValueWrapper, ContextItemSetter,
  ContextSync, ContextItemSync, ContextContainerSync, ContextContainerSyncEngine,
  ContextAutoSync, ContextLegacySync, ContextMerger, ContextOperations,
  ItemFilter, ContextComparison, RootMapValidator };
