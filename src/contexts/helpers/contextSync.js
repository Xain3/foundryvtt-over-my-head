/**
 * @file contextSync.js
 * @description This file contains the ContextSync class for synchronizing Context instances, ContextContainers, and ContextItems based on timestamps.
 * @path /src/contexts/helpers/contextSync.js
 * @date 29 May 2025
 */

import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';
import Context from '../context.js';
import ContextComparison from './contextComparison.js';
import ContextAutoSync from './contextAutoSync.js';
import ContextItemSync from './contextItemSync.js';
import ContextContainerSync from './contextContainerSync.js';

/**
 * @class ContextSync
 * @description Facade class that provides synchronization capabilities for Context instances and their components.
 * Delegates to specialized sync classes (ContextItemSync, ContextContainerSync) based on object type.
 * For Context instances, delegates to ContextMerger for sophisticated handling.
 */
class ContextSync {
  /**
   * @enum {string}
   * @description Synchronization operation types.
   */
  static SYNC_OPERATIONS = {
    UPDATE_SOURCE_TO_TARGET: 'updateSourceToTarget',
    UPDATE_TARGET_TO_SOURCE: 'updateTargetToSource',
    MERGE_NEWER_WINS: 'mergeNewerWins',
    MERGE_SOURCE_PRIORITY: 'mergeSourcePriority',
    MERGE_TARGET_PRIORITY: 'mergeTargetPriority',
    NO_ACTION: 'noAction'
  };

  /**
   * @enum {string}
   * @description Comparison results for timestamps.
   */
  static COMPARISON_RESULTS = ContextComparison.COMPARISON_RESULTS;

  /**
   * @private
   * Gets the type of a context object.
   * @param {Context|ContextContainer|ContextItem} obj - The object to classify.
   * @returns {string} The type of the object.
   */
  static #getObjectType(obj) {
    if (obj instanceof Context) return 'Context';
    if (obj instanceof ContextContainer) return 'ContextContainer';
    if (obj instanceof ContextItem) return 'ContextItem';
    console.warn('Unknown object type for synchronization:', obj
      , 'Expected Context, ContextContainer, or ContextItem but got:', obj.constructor.name
      , 'Returning "Unknown" type.'
    );
    return 'Unknown';
  }

  /**
   * @private
   * Gets the appropriate sync class for the given object type.
   * @param {Context|ContextContainer|ContextItem} obj - The object to get sync class for.
   * @returns {object} The appropriate sync class.
   */
  static #getSyncClass(obj) {
    if (obj instanceof ContextItem) return ContextItemSync;
    if (obj instanceof ContextContainer) return ContextContainerSync;
    return null;
  }

  /**
   * @private
   * Updates source object with target's data using appropriate sync class.
   * @param {Context|ContextContainer|ContextItem} source - The source object.
   * @param {Context|ContextContainer|ContextItem} target - The target object.
   * @param {object} options - Update options.
   * @returns {object} Update result.
   */
  static #updateSourceToTarget(source, target, options) {
    const syncClass = ContextSync.#getSyncClass(source);
    if (syncClass) {
      return syncClass.updateSourceToTarget(source, target, options);
    }
    throw new Error(`Unsupported object type for synchronization: ${source.constructor.name}`);
  }

  /**
   * @private
   * Updates target object with source's data using appropriate sync class.
   * @param {Context|ContextContainer|ContextItem} source - The source object.
   * @param {Context|ContextContainer|ContextItem} target - The target object.
   * @param {object} options - Update options.
   * @returns {object} Update result.
   */
  static #updateTargetToSource(source, target, options) {
    const syncClass = ContextSync.#getSyncClass(source);
    if (syncClass) {
      return syncClass.updateTargetToSource(source, target, options);
    }
    throw new Error(`Unsupported object type for synchronization: ${source.constructor.name}`);
  }

  /**
   * @private
   * Merges objects with newer timestamps taking precedence using appropriate sync class.
   * @param {Context|ContextContainer|ContextItem} source - The source object.
   * @param {Context|ContextContainer|ContextItem} target - The target object.
   * @param {object} options - Merge options.
   * @returns {object} Merge result.
   */
  static #mergeNewerWins(source, target, options) {
    const syncClass = ContextSync.#getSyncClass(source);
    if (syncClass) {
      return syncClass.mergeNewerWins(source, target, options);
    }
    throw new Error(`Unsupported object type for synchronization: ${source.constructor.name}`);
  }

  /**
   * @private
   * Merges objects with specified priority using appropriate sync class.
   * @param {Context|ContextContainer|ContextItem} source - The source object.
   * @param {Context|ContextContainer|ContextItem} target - The target object.
   * @param {string} priority - The priority ('source' or 'target').
   * @param {object} options - Merge options.
   * @returns {object} Merge result.
   */
  static #mergeWithPriority(source, target, priority, options) {
    const syncClass = ContextSync.#getSyncClass(source);
    if (syncClass) {
      return syncClass.mergeWithPriority(source, target, priority, options);
    }
    throw new Error(`Unsupported object type for synchronization: ${source.constructor.name}`);
  }

  /**
   * Compares two context objects and determines their temporal relationship.
   * @param {Context|ContextContainer|ContextItem} source - The source context object.
   * @param {Context|ContextContainer|ContextItem} target - The target context object.
   * @param {object} [options={}] - Comparison options.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to compare.
   * @returns {object} Comparison result with details.
   */
  static compare(source, target, { compareBy = 'modifiedAt' } = {}) {
    return ContextComparison.compare(source, target, { compareBy });
  }

  /**
   * Synchronizes two context objects based on the specified operation.
   * For Context instances, delegates to ContextMerger for sophisticated handling.
   * @param {Context|ContextContainer|ContextItem} source - The source context object.
   * @param {Context|ContextContainer|ContextItem} target - The target context object.
   * @param {string} operation - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  static async sync(source, target, operation, options = {}) {
    const {
      deepSync = true,
      compareBy = 'modifiedAt',
      preserveMetadata = true,
      autoSync = false
    } = options;

    // Handle 'auto' operation by delegating to ContextAutoSync
    if (operation === 'auto' || autoSync) {
      return ContextAutoSync.autoSync(source, target, { deepSync, compareBy, preserveMetadata });
    }

    // For Context instances, delegate to ContextMerger
    if (source instanceof Context && target instanceof Context) {
      const { default: ContextMerger } = await import('./contextMerger.js');
      return ContextMerger.merge(source, target, operation, {
        compareBy,
        preserveMetadata,
        createMissing: deepSync
      });
    }

    return ContextSync.#performLegacySync(source, target, operation, options);
  }

  /**
   * @private
   * Performs legacy sync operations for non-Context instances using specialized sync classes.
   * @param {ContextContainer|ContextItem} source - The source object.
   * @param {ContextContainer|ContextItem} target - The target object.
   * @param {string} operation - The sync operation.
   * @param {object} options - Sync options.
   * @returns {object} Sync result.
   */
  static #performLegacySync(source, target, operation, options) {
    const comparison = ContextSync.compare(source, target, { compareBy: options.compareBy });

    switch (operation) {
      case ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET:
        return ContextSync.#updateSourceToTarget(source, target, options);

      case ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE:
        return ContextSync.#updateTargetToSource(source, target, options);

      case ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS:
        return ContextSync.#mergeNewerWins(source, target, options);

      case ContextSync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY:
        return ContextSync.#mergeWithPriority(source, target, 'source', options);

      case ContextSync.SYNC_OPERATIONS.MERGE_TARGET_PRIORITY:
        return ContextSync.#mergeWithPriority(source, target, 'target', options);

      case ContextSync.SYNC_OPERATIONS.NO_ACTION:
        return {
          success: true,
          message: 'No synchronization performed',
          operation,
          comparison,
          changes: []
        };

      default:
        throw new Error(`Unknown synchronization operation: ${operation}`);
    }
  }

  /**
   * Automatically determines the best synchronization operation based on timestamp comparison.
   * Delegates to ContextAutoSync for implementation.
   * @param {Context|ContextContainer|ContextItem} source - The source context object.
   * @param {Context|ContextContainer|ContextItem} target - The target context object.
   * @param {object} [options={}] - Options for automatic sync determination.
   * @returns {object} Automatic synchronization result.
   */
  static async autoSync(source, target, options = {}) {
    return ContextAutoSync.autoSync(source, target, options);
  }

  /**
   * Validates that objects are compatible for synchronization.
   * @param {Context|ContextContainer|ContextItem} source - The source object.
   * @param {Context|ContextContainer|ContextItem} target - The target object.
   * @returns {boolean} True if objects are compatible for sync.
   */
  static validateCompatibility(source, target) {
    if (!source || !target) return false;

    const sourceType = ContextSync.#getObjectType(source);
    const targetType = ContextSync.#getObjectType(target);

    return sourceType === targetType;
  }
}

export { ContextSync };
export default ContextSync;