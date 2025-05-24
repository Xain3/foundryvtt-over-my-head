/**
 * @file contextSync.js
 * @description This file contains the ContextSync class for synchronizing Context instances, ContextContainers, and ContextItems based on timestamps.
 * @path /src/context/helpers/contextSync.js
 */

import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';
import Context from '../context.js';

/**
 * @class ContextSync
 * @description Provides synchronization capabilities for Context instances and their components.
 * Compares timestamps and performs appropriate operations like updates, merges, and restorations.
 *
 * @warning Snapshot functionality (createSnapshot, createAndStoreSnapshot, getSnapshot, etc.)
 * is currently WORK-IN-PROGRESS and UNSTABLE. These methods may not work as expected and
 * their API may change without notice. Use with caution in production environments.
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
    RESTORE_FROM_BACKUP: 'restoreFromBackup',
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
   * @static
   * @private
   * @description Internal storage for snapshots.
   */
  static #snapshots = new Map();

  /**
   * Compares two context objects and determines their temporal relationship.
   * @param {Context|ContextContainer|ContextItem} source - The source context object.
   * @param {Context|ContextContainer|ContextItem} target - The target context object.
   * @param {object} [options={}] - Comparison options.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to compare ('createdAt', 'modifiedAt', 'lastAccessedAt').
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
   * @param {Context|ContextContainer|ContextItem} source - The source context object.
   * @param {Context|ContextContainer|ContextItem} target - The target context object.
   * @param {string} operation - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @param {boolean} [options.deepSync=true] - Whether to recursively sync nested containers.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to use for comparisons.
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during sync.
   * @param {boolean} [options.autoSync=false] - If true and operation is 'auto', uses autoSync logic.
   * @returns {object} Synchronization result with details.
   */
  static sync(source, target, operation, { deepSync = true, compareBy = 'modifiedAt', preserveMetadata = true, autoSync = false } = {}) {
    const comparison = ContextSync.compare(source, target, { compareBy });

    // Handle 'auto' operation by delegating to autoSync
    if (operation === 'auto' || autoSync) {
      return ContextSync.autoSync(source, target, { deepSync, compareBy, preserveMetadata });
    }

    switch (operation) {
      case ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET:
        return ContextSync.#updateSourceToTarget(source, target, { deepSync, preserveMetadata });

      case ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE:
        return ContextSync.#updateTargetToSource(source, target, { deepSync, preserveMetadata });

      case ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS:
        return ContextSync.#mergeNewerWins(source, target, { deepSync, compareBy, preserveMetadata });

      case ContextSync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY:
        return ContextSync.#mergeWithPriority(source, target, 'source', { deepSync, preserveMetadata });

      case ContextSync.SYNC_OPERATIONS.MERGE_TARGET_PRIORITY:
        return ContextSync.#mergeWithPriority(source, target, 'target', { deepSync, preserveMetadata });

      case ContextSync.SYNC_OPERATIONS.NO_ACTION:
        return { success: true, message: 'No synchronization performed', changes: [] };

      default:
        throw new Error(`Unknown synchronization operation: ${operation}`);
    }
  }

  /**
   * Automatically determines the best synchronization operation based on timestamp comparison.
   * @param {Context|ContextContainer|ContextItem} source - The source context object.
   * @param {Context|ContextContainer|ContextItem} target - The target context object.
   * @param {object} [options={}] - Options for automatic sync determination.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to use for comparisons.
   * @param {boolean} [options.deepSync=true] - Whether to recursively sync nested containers.
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during sync.
   * @returns {object} Automatic synchronization result.
   */
  static autoSync(source, target, { compareBy = 'modifiedAt', deepSync = true, preserveMetadata = true } = {}) {
    const comparison = ContextSync.compare(source, target, { compareBy });

    let operation;
    switch (comparison.result) {
      case ContextSync.COMPARISON_RESULTS.SOURCE_NEWER:
        operation = ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE;
        break;

      case ContextSync.COMPARISON_RESULTS.TARGET_NEWER:
        operation = ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET;
        break;

      case ContextSync.COMPARISON_RESULTS.EQUAL:
        operation = ContextSync.SYNC_OPERATIONS.NO_ACTION;
        break;

      case ContextSync.COMPARISON_RESULTS.SOURCE_MISSING:
        operation = ContextSync.SYNC_OPERATIONS.NO_ACTION;
        break;

      case ContextSync.COMPARISON_RESULTS.TARGET_MISSING:
        operation = ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE;
        break;

      default:
        operation = ContextSync.SYNC_OPERATIONS.NO_ACTION;
    }

    return ContextSync.sync(source, target, operation, { deepSync, compareBy, preserveMetadata });
  }

  /**
   * @private
   * Updates source object with target's data.
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
   */
  static #mergeNewerWins(source, target, { deepSync, compareBy, preserveMetadata }) {
    const comparison = ContextSync.compare(source, target, { compareBy });

    if (comparison.result === ContextSync.COMPARISON_RESULTS.SOURCE_NEWER) {
      return ContextSync.#updateTargetToSource(source, target, { deepSync, preserveMetadata });
    } else if (comparison.result === ContextSync.COMPARISON_RESULTS.TARGET_NEWER) {
      return ContextSync.#updateSourceToTarget(source, target, { deepSync, preserveMetadata });
    } else {
      return { success: true, message: 'Objects are equal, no merge needed', changes: [] };
    }
  }

  /**
   * @private
   * Merges objects with specified priority.
   */
  static #mergeWithPriority(source, target, priority, { deepSync, preserveMetadata }) {
    if (priority === 'source') {
      return ContextSync.#updateTargetToSource(source, target, { deepSync, preserveMetadata });
    } else {
      return ContextSync.#updateSourceToTarget(source, target, { deepSync, preserveMetadata });
    }
  }

  /**
   * @private
   * Synchronizes items within containers.
   */
  static #syncContainerItems(container1, container2, direction, { preserveMetadata }) {
    if (direction === 'sourceToTarget') {
      // Update container1 with items from container2
      for (const key of container2.keys()) {
        const item2 = container2.getItem(key);
        if (container1.hasItem(key)) {
          const item1 = container1.getItem(key);
          ContextSync.autoSync(item1, item2, { preserveMetadata });
        } else {
          container1.setItem(key, item2.value, { metadata: item2.metadata });
        }
      }
    } else {
      // Update container2 with items from container1
      for (const key of container1.keys()) {
        const item1 = container1.getItem(key);
        if (container2.hasItem(key)) {
          const item2 = container2.getItem(key);
          ContextSync.autoSync(item1, item2, { preserveMetadata });
        } else {
          container2.setItem(key, item1.value, { metadata: item1.metadata });
        }
      }
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

    // Both must be of the same type or compatible types
    const sourceType = ContextSync.#getObjectType(source);
    const targetType = ContextSync.#getObjectType(target);

    return sourceType === targetType;
  }

  /**
   * @private
   * Gets the type of a context object.
   */
  static #getObjectType(obj) {
    if (obj instanceof Context) return 'Context';
    if (obj instanceof ContextContainer) return 'ContextContainer';
    if (obj instanceof ContextItem) return 'ContextItem';
    return 'Unknown';
  }

  /**
   * Creates a snapshot of a context object for backup purposes.
   * @deprecated This method is WORK-IN-PROGRESS and UNSTABLE. API may change without notice.
   * @param {Context|ContextContainer|ContextItem} contextObj - The context object to snapshot.
   * @returns {object} A serializable snapshot of the object.
   * @warning This functionality is experimental and may not work correctly.
   */
  static createSnapshot(contextObj) {
    const snapshot = {
      type: ContextSync.#getObjectType(contextObj),
      createdAt: contextObj.createdAt,
      modifiedAt: contextObj.modifiedAt,
      lastAccessedAt: contextObj.lastAccessedAt,
      metadata: contextObj.metadata
    };

    if (contextObj instanceof ContextItem) {
      snapshot.value = contextObj.value;
    } else if (contextObj instanceof ContextContainer) {
      snapshot.items = {};
      for (const key of contextObj.keys()) {
        snapshot.items[key] = ContextSync.createSnapshot(contextObj.getItem(key));
      }
    } else if (contextObj instanceof Context) {
      snapshot.components = {};
      const componentKeys = ['schema', 'constants', 'manifest', 'flags', 'state', 'data', 'settings'];
      for (const key of componentKeys) {
        snapshot.components[key] = ContextSync.createSnapshot(contextObj[key]);
      }
      snapshot.namingConvention = ContextSync.createSnapshot(contextObj.namingConvention);
    }

    return snapshot;
  }

  /**
   * Creates and stores a snapshot of a context object.
   * @deprecated This method is WORK-IN-PROGRESS and UNSTABLE. API may change without notice.
   * @param {Context|ContextContainer|ContextItem} contextObj - The context object to snapshot.
   * @param {string} [snapshotId] - Optional ID for the snapshot. If not provided, generates a timestamp-based ID.
   * @returns {object} Object containing the snapshot ID and the snapshot data.
   * @warning This functionality is experimental and may not work correctly.
   */
  static createAndStoreSnapshot(contextObj, snapshotId) {
    const snapshot = ContextSync.createSnapshot(contextObj);
    const id = snapshotId || `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    ContextSync.#snapshots.set(id, {
      ...snapshot,
      snapshotId: id,
      snapshotCreatedAt: new Date()
    });

    return { snapshotId: id, snapshot };
  }

  /**
   * Retrieves a stored snapshot by ID.
   * @deprecated This method is WORK-IN-PROGRESS and UNSTABLE. API may change without notice.
   * @param {string} snapshotId - The ID of the snapshot to retrieve.
   * @returns {object|null} The snapshot object or null if not found.
   * @warning This functionality is experimental and may not work correctly.
   */
  static getSnapshot(snapshotId) {
    return ContextSync.#snapshots.get(snapshotId) || null;
  }

  /**
   * Retrieves all snapshots for objects of a specific type.
   * @deprecated This method is WORK-IN-PROGRESS and UNSTABLE. API may change without notice.
   * @param {string} [objectType] - Filter by object type ('Context', 'ContextContainer', 'ContextItem').
   * @returns {Array<object>} Array of snapshot objects.
   * @warning This functionality is experimental and may not work correctly.
   */
  static getSnapshots(objectType) {
    const snapshots = Array.from(ContextSync.#snapshots.values());

    if (objectType) {
      return snapshots.filter(snapshot => snapshot.type === objectType);
    }

    return snapshots;
  }

  /**
   * Removes a snapshot from storage.
   * @deprecated This method is WORK-IN-PROGRESS and UNSTABLE. API may change without notice.
   * @param {string} snapshotId - The ID of the snapshot to remove.
   * @returns {boolean} True if the snapshot was removed, false if it didn't exist.
   * @warning This functionality is experimental and may not work correctly.
   */
  static removeSnapshot(snapshotId) {
    return ContextSync.#snapshots.delete(snapshotId);
  }

  /**
   * Clears all stored snapshots.
   * @deprecated This method is WORK-IN-PROGRESS and UNSTABLE. API may change without notice.
   * @returns {void}
   * @warning This functionality is experimental and may not work correctly.
   */
  static clearSnapshots() {
    ContextSync.#snapshots.clear();
  }

  /**
   * Restores a context object from a snapshot.
   * @deprecated This method is WORK-IN-PROGRESS and UNSTABLE. API may change without notice.
   * @param {object} snapshot - The snapshot object to restore from.
   * @param {Context|ContextContainer|ContextItem} [targetObj] - Optional target object to restore into.
   * @returns {Context|ContextContainer|ContextItem} The restored context object.
   * @warning This functionality is experimental and may not work correctly.
   */
  static restoreFromSnapshot(snapshot, targetObj) {
    if (!snapshot || !snapshot.type) {
      throw new Error('Invalid snapshot: missing type information');
    }

    switch (snapshot.type) {
      case 'ContextItem':
        return ContextSync.#restoreContextItem(snapshot, targetObj);

      case 'ContextContainer':
        return ContextSync.#restoreContextContainer(snapshot, targetObj);

      case 'Context':
        return ContextSync.#restoreContext(snapshot, targetObj);

      default:
        throw new Error(`Unknown snapshot type: ${snapshot.type}`);
    }
  }

  /**
   * @private
   * Restores a ContextItem from snapshot.
   */
  static #restoreContextItem(snapshot, targetItem) {
    if (targetItem && !(targetItem instanceof ContextItem)) {
      throw new Error('Target object must be a ContextItem');
    }

    const item = targetItem || new ContextItem(snapshot.value);

    item.value = snapshot.value;
    item.setMetadata(snapshot.metadata, false);

    // Restore timestamps if the item supports it
    if (item.createdAt && snapshot.createdAt) {
      item.createdAt = new Date(snapshot.createdAt);
    }
    if (item.modifiedAt && snapshot.modifiedAt) {
      item.modifiedAt = new Date(snapshot.modifiedAt);
    }
    if (item.lastAccessedAt && snapshot.lastAccessedAt) {
      item.lastAccessedAt = new Date(snapshot.lastAccessedAt);
    }

    return item;
  }

  /**
   * @private
   * Restores a ContextContainer from snapshot.
   */
  static #restoreContextContainer(snapshot, targetContainer) {
    if (targetContainer && !(targetContainer instanceof ContextContainer)) {
      throw new Error('Target object must be a ContextContainer');
    }

    const container = targetContainer || new ContextContainer();

    // Clear existing items if restoring to existing container
    if (targetContainer) {
      container.clear();
    }

    // Restore items
    if (snapshot.items) {
      for (const [key, itemSnapshot] of Object.entries(snapshot.items)) {
        const restoredItem = ContextSync.restoreFromSnapshot(itemSnapshot);
        container.setItem(key, restoredItem.value, { metadata: restoredItem.metadata });
      }
    }

    // Restore metadata and timestamps
    container.setMetadata(snapshot.metadata, false);
    ContextSync.#restoreTimestamps(container, snapshot);

    return container;
  }

  /**
   * @private
   * Restores a Context from snapshot.
   */
  static #restoreContext(snapshot, targetContext) {
    if (targetContext && !(targetContext instanceof Context)) {
      throw new Error('Target object must be a Context');
    }

    const context = targetContext || new Context();

    // Restore components
    if (snapshot.components) {
      const componentKeys = ['schema', 'constants', 'manifest', 'flags', 'state', 'data', 'settings'];
      for (const key of componentKeys) {
        if (snapshot.components[key] && context[key]) {
          ContextSync.restoreFromSnapshot(snapshot.components[key], context[key]);
        }
      }
    }

    // Restore naming convention
    if (snapshot.namingConvention && context.namingConvention) {
      ContextSync.restoreFromSnapshot(snapshot.namingConvention, context.namingConvention);
    }

    // Restore metadata and timestamps
    context.setMetadata(snapshot.metadata, false);
    ContextSync.#restoreTimestamps(context, snapshot);

    return context;
  }

  /**
   * @private
   * Helper to restore timestamps from snapshot.
   */
  static #restoreTimestamps(obj, snapshot) {
    if (obj.createdAt && snapshot.createdAt) {
      obj.createdAt = new Date(snapshot.createdAt);
    }
    if (obj.modifiedAt && snapshot.modifiedAt) {
      obj.modifiedAt = new Date(snapshot.modifiedAt);
    }
    if (obj.lastAccessedAt && snapshot.lastAccessedAt) {
      obj.lastAccessedAt = new Date(snapshot.lastAccessedAt);
    }
  }
}

export { ContextSync };
export default ContextSync;
