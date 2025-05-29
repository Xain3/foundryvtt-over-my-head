/**
 * @file contextSync.js
 * @description This file contains the ContextSync class for synchronizing Context instances, ContextContainers, and ContextItems based on timestamps.
 * @path /src/contexts/helpers/contextSync.js
 * @date 29 May 2025
 */

import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';
import Context from '../context.js';
import ContextMerger from './contextMerger.js';

/**
 * @class ContextSync
 * @description Provides synchronization capabilities for Context instances and their components.
 * Compares timestamps and performs appropriate operations like updates, merges, and restorations.
 * For Context instances, delegates complex operations to ContextMerger for better consistency.
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
  static COMPARISON_RESULTS = {
    SOURCE_NEWER: 'sourceNewer',
    TARGET_NEWER: 'targetNewer',
    EQUAL: 'equal',
    SOURCE_MISSING: 'sourceMissing',
    TARGET_MISSING: 'targetMissing',
    BOTH_MISSING: 'bothMissing'
  };

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
    return 'Unknown';
  }

  /**
   * @private
   * Updates source object with target's data.
   * @param {Context|ContextContainer|ContextItem} source - The source object.
   * @param {Context|ContextContainer|ContextItem} target - The target object.
   * @param {object} options - Update options.
   * @returns {object} Update result.
   */
  static #updateSourceToTarget(source, target, { deepSync, preserveMetadata }) {
    const changes = [];

    if (source instanceof ContextItem && target instanceof ContextItem) {
      const oldValue = source.value;
      source.value = target.value;
      changes.push({ type: 'value', from: oldValue, to: target.value });

      if (preserveMetadata) {
        source.setMetadata(target.metadata, false);
        changes.push({ type: 'metadata', to: target.metadata });
      }
    } else if (source instanceof ContextContainer && target instanceof ContextContainer) {
      if (deepSync) {
        ContextSync.#syncContainerItems(source, target, 'sourceToTarget', { preserveMetadata });
        changes.push({ type: 'containerSync', direction: 'sourceToTarget' });
      } else {
        source.value = target.value;
        changes.push({ type: 'containerValue', to: target.value });
      }
    }

    return { success: true, message: 'Source updated to match target', changes };
  }

  /**
   * @private
   * Updates target object with source's data.
   * @param {Context|ContextContainer|ContextItem} source - The source object.
   * @param {Context|ContextContainer|ContextItem} target - The target object.
   * @param {object} options - Update options.
   * @returns {object} Update result.
   */
  static #updateTargetToSource(source, target, { deepSync, preserveMetadata }) {
    const changes = [];

    if (source instanceof ContextItem && target instanceof ContextItem) {
      const oldValue = target.value;
      target.value = source.value;
      changes.push({ type: 'value', from: oldValue, to: source.value });

      if (preserveMetadata) {
        target.setMetadata(source.metadata, false);
        changes.push({ type: 'metadata', to: source.metadata });
      }
    } else if (source instanceof ContextContainer && target instanceof ContextContainer) {
      if (deepSync) {
        ContextSync.#syncContainerItems(target, source, 'targetToSource', { preserveMetadata });
        changes.push({ type: 'containerSync', direction: 'targetToSource' });
      } else {
        target.value = source.value;
        changes.push({ type: 'containerValue', to: source.value });
      }
    }

    return { success: true, message: 'Target updated to match source', changes };
  }

  /**
   * @private
   * Merges objects with newer timestamps taking precedence.
   * @param {Context|ContextContainer|ContextItem} source - The source object.
   * @param {Context|ContextContainer|ContextItem} target - The target object.
   * @param {object} options - Merge options.
   * @returns {object} Merge result.
   */
  static #mergeNewerWins(source, target, { deepSync, compareBy, preserveMetadata }) {
    const comparison = ContextSync.compare(source, target, { compareBy });

    if (comparison.result === ContextSync.COMPARISON_RESULTS.SOURCE_NEWER) {
      return ContextSync.#updateTargetToSource(source, target, { deepSync, preserveMetadata });
    }

    if (comparison.result === ContextSync.COMPARISON_RESULTS.TARGET_NEWER) {
      return ContextSync.#updateSourceToTarget(source, target, { deepSync, preserveMetadata });
    }

    return { success: true, message: 'Objects are equal, no merge needed', changes: [] };
  }

  /**
   * @private
   * Merges objects with specified priority.
   * @param {Context|ContextContainer|ContextItem} source - The source object.
   * @param {Context|ContextContainer|ContextItem} target - The target object.
   * @param {string} priority - The priority ('source' or 'target').
   * @param {object} options - Merge options.
   * @returns {object} Merge result.
   */
  static #mergeWithPriority(source, target, priority, { deepSync, preserveMetadata }) {
    if (priority === 'source') {
      return ContextSync.#updateTargetToSource(source, target, { deepSync, preserveMetadata });
    }
    return ContextSync.#updateSourceToTarget(source, target, { deepSync, preserveMetadata });
  }

  /**
   * @private
   * Synchronizes items within containers.
   * @param {ContextContainer} container1 - First container.
   * @param {ContextContainer} container2 - Second container.
   * @param {string} direction - Sync direction.
   * @param {object} options - Sync options.
   */
  static #syncContainerItems(container1, container2, direction, { preserveMetadata }) {
    if (direction === 'sourceToTarget') {
      ContextSync.#updateContainerFromSource(container1, container2, { preserveMetadata });
    } else {
      ContextSync.#updateContainerFromSource(container2, container1, { preserveMetadata });
    }
  }

  /**
   * @private
   * Updates container with items from source container.
   * @param {ContextContainer} targetContainer - Target container to update.
   * @param {ContextContainer} sourceContainer - Source container to copy from.
   * @param {object} options - Update options.
   */
  static #updateContainerFromSource(targetContainer, sourceContainer, { preserveMetadata }) {
    for (const key of sourceContainer.keys()) {
      const sourceItem = sourceContainer.getItem(key);

      if (targetContainer.hasItem(key)) {
        const targetItem = targetContainer.getItem(key);
        ContextSync.autoSync(targetItem, sourceItem, { preserveMetadata });
      } else {
        targetContainer.setItem(key, sourceItem.value, { metadata: sourceItem.metadata });
      }
    }
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
    if (!source && !target) {
      return {
        result: ContextSync.COMPARISON_RESULTS.BOTH_MISSING,
        sourceTimestamp: null,
        targetTimestamp: null,
        timeDifference: 0
      };
    }

    if (!source) {
      return {
        result: ContextSync.COMPARISON_RESULTS.SOURCE_MISSING,
        sourceTimestamp: null,
        targetTimestamp: target[compareBy],
        timeDifference: null
      };
    }

    if (!target) {
      return {
        result: ContextSync.COMPARISON_RESULTS.TARGET_MISSING,
        sourceTimestamp: source[compareBy],
        targetTimestamp: null,
        timeDifference: null
      };
    }

    return ContextSync.#compareTimestamps(source, target, compareBy);
  }

  /**
   * @private
   * Compares timestamps between two objects.
   * @param {object} source - Source object with timestamp.
   * @param {object} target - Target object with timestamp.
   * @param {string} compareBy - Timestamp property to compare.
   * @returns {object} Comparison result.
   */
  static #compareTimestamps(source, target, compareBy) {
    const sourceTimestamp = source[compareBy];
    const targetTimestamp = target[compareBy];
    const timeDifference = sourceTimestamp.getTime() - targetTimestamp.getTime();

    let result;
    if (timeDifference > 0) {
      result = ContextSync.COMPARISON_RESULTS.SOURCE_NEWER;
    } else if (timeDifference < 0) {
      result = ContextSync.COMPARISON_RESULTS.TARGET_NEWER;
    } else {
      result = ContextSync.COMPARISON_RESULTS.EQUAL;
    }

    return {
      result,
      sourceTimestamp,
      targetTimestamp,
      timeDifference
    };
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
  static sync(source, target, operation, options = {}) {
    const {
      deepSync = true,
      compareBy = 'modifiedAt',
      preserveMetadata = true,
      autoSync = false
    } = options;

    // Handle 'auto' operation by delegating to autoSync
    if (operation === 'auto' || autoSync) {
      return ContextSync.autoSync(source, target, { deepSync, compareBy, preserveMetadata });
    }

    // For Context instances, delegate to ContextMerger
    if (source instanceof Context && target instanceof Context) {
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
   * Performs legacy sync operations for non-Context instances.
   * @param {ContextContainer|ContextItem} source - The source object.
   * @param {ContextContainer|ContextItem} target - The target object.
   * @param {string} operation - The sync operation.
   * @param {object} options - Sync options.
   * @returns {object} Sync result.
   */
  static #performLegacySync(source, target, operation, options) {
    const { deepSync, preserveMetadata } = options;
    const comparison = ContextSync.compare(source, target, { compareBy: options.compareBy });

    switch (operation) {
      case ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET:
        return ContextSync.#updateSourceToTarget(source, target, { deepSync, preserveMetadata });

      case ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE:
        return ContextSync.#updateTargetToSource(source, target, { deepSync, preserveMetadata });

      case ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS:
        return ContextSync.#mergeNewerWins(source, target, {
          deepSync,
          compareBy: options.compareBy,
          preserveMetadata
        });

      case ContextSync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY:
        return ContextSync.#mergeWithPriority(source, target, 'source', { deepSync, preserveMetadata });

      case ContextSync.SYNC_OPERATIONS.MERGE_TARGET_PRIORITY:
        return ContextSync.#mergeWithPriority(source, target, 'target', { deepSync, preserveMetadata });

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
   * For Context instances, delegates to ContextMerger with 'mergeNewerWins' strategy.
   * @param {Context|ContextContainer|ContextItem} source - The source context object.
   * @param {Context|ContextContainer|ContextItem} target - The target context object.
   * @param {object} [options={}] - Options for automatic sync determination.
   * @returns {object} Automatic synchronization result.
   */
  static autoSync(source, target, options = {}) {
    const {
      compareBy = 'modifiedAt',
      deepSync = true,
      preserveMetadata = true
    } = options;

    // For Context instances, delegate to ContextMerger
    if (source instanceof Context && target instanceof Context) {
      return ContextMerger.merge(source, target, 'mergeNewerWins', {
        compareBy,
        preserveMetadata,
        createMissing: deepSync
      });
    }

    const operation = ContextSync.#determineAutoSyncOperation(source, target, { compareBy });
    return ContextSync.sync(source, target, operation, { deepSync, compareBy, preserveMetadata });
  }

  /**
   * @private
   * Determines the appropriate sync operation based on comparison.
   * @param {ContextContainer|ContextItem} source - The source object.
   * @param {ContextContainer|ContextItem} target - The target object.
   * @param {object} options - Comparison options.
   * @returns {string} The determined operation.
   */
  static #determineAutoSyncOperation(source, target, { compareBy }) {
    const comparison = ContextSync.compare(source, target, { compareBy });

    switch (comparison.result) {
      case ContextSync.COMPARISON_RESULTS.SOURCE_NEWER:
        return ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE;
      case ContextSync.COMPARISON_RESULTS.TARGET_NEWER:
        return ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET;
      case ContextSync.COMPARISON_RESULTS.TARGET_MISSING:
        return ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE;
      default:
        return ContextSync.SYNC_OPERATIONS.NO_ACTION;
    }
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