/**
 * @file contextContainerSync.js
 * @description This file contains the ContextContainerSync class for synchronizing ContextContainer instances.
 * @path /src/contexts/helpers/contextContainerSync.js
 */

import ContextComparison from './contextComparison.js';
import ContextContainerSyncEngine from './contextContainerSyncEngine.js';

/**
 * @class ContextContainerSync
 * @classdesc Provides synchronization capabilities for {@link ContextContainer} instances.
 * Uses {@link ContextContainerSyncEngine} for complex recursive synchronization.
 *
 * @example
 * // Synchronize two containers deeply, including metadata
 * ContextContainerSync.updateTargetToMatchSource(sourceContainer, targetContainer, { deepSync: true, syncMetadata: true });
 *
 * @property {Function} updateSourceToMatchTarget - Updates the source container to match the target.
 * @property {Function} updateTargetToMatchSource - Updates the target container to match the source.
 * @property {Function} mergeNewerWins - Merges containers, preferring the one with the newer timestamp.
 * @property {Function} mergeWithPriority - Merges containers, preferring the specified priority ('source' or 'target').
 * @private
 * @property {Function} #syncContainerItems - Delegates synchronization to the ContextContainerSyncEngine.
 */
class ContextContainerSync {
  /**
   * Updates source container with target's data.
   * @param {ContextContainer} source - The source container.
   * @param {ContextContainer} target - The target container.
   * @param {object} options - Update options.
   * @param {boolean} [options.deepSync=true] - Whether to perform deep synchronization of container items.
   * @param {boolean} [options.syncMetadata=true] - Whether to sync metadata during synchronization.
   * @returns {object} Update result.
   */
  static updateSourceToMatchTarget(source, target, options = {}) {
    const { deepSync = true, syncMetadata = true } = options;
    const changes = [];

    if (deepSync) {
      ContextContainerSync.#syncContainerItems(source, target, 'sourceToTarget', { syncMetadata });
      changes.push({ type: 'containerSync', direction: 'sourceToTarget' });
    } else {
      source.value = target.value;
      changes.push({ type: 'containerValue', to: target.value });
    }

    return { success: true, message: 'Source container updated to match target', changes };
  }

  /**
   * Updates target container with source's data.
   * @param {ContextContainer} source - The source container.
   * @param {ContextContainer} target - The target container.
   * @param {object} options - Update options.
   * @param {boolean} [options.deepSync=true] - Whether to perform deep synchronization of container items.
   * @param {boolean} [options.syncMetadata=true] - Whether to sync metadata during synchronization.
   * @returns {object} Update result.
   */
  static updateTargetToMatchSource(source, target, options = {}) {
    const { deepSync = true, syncMetadata = true } = options;
    const changes = [];

    if (deepSync) {
      ContextContainerSync.#syncContainerItems(source, target, 'targetToSource', { syncMetadata });
      changes.push({ type: 'containerSync', direction: 'targetToSource' });
    } else {
      target.value = source.value;
      changes.push({ type: 'containerValue', to: source.value });
    }

    return { success: true, message: 'Target container updated to match source', changes };
  }

  /**
   * Merges containers with newer timestamps taking precedence.
   * @param {ContextContainer} source - The source container.
   * @param {ContextContainer} target - The target container.
   * @param {object} options - Merge options.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to compare ('modifiedAt', 'createdAt').
   * @param {boolean} [options.deepSync=true] - Whether to perform deep synchronization of container items.
   * @param {boolean} [options.syncMetadata=true] - Whether to sync metadata during synchronization.
   * @returns {object} Merge result.
   */
  static mergeNewerWins(source, target, options = {}) {
    const { compareBy = 'modifiedAt', deepSync = true, syncMetadata = true } = options;
    const comparison = ContextComparison.compare(source, target, { compareBy });

    if (comparison.result === ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER) {
      return ContextContainerSync.updateTargetToMatchSource(source, target, { deepSync, syncMetadata });
    }

    if (comparison.result === ContextComparison.COMPARISON_RESULTS.TARGET_NEWER) {
      return ContextContainerSync.updateSourceToMatchTarget(source, target, { deepSync, syncMetadata });
    }

    return { success: true, message: 'Containers are equal, no merge needed', changes: [] };
  }

  /**
   * Merges containers with specified priority.
   * @param {ContextContainer} source - The source container.
   * @param {ContextContainer} target - The target container.
   * @param {string} priority - The priority ('source' or 'target').
   * @param {object} options - Merge options.
   * @param {boolean} [options.deepSync=true] - Whether to perform deep synchronization of container items.
   * @param {boolean} [options.syncMetadata=true] - Whether to sync metadata during synchronization.
   * @returns {object} Merge result.
   */
  static mergeWithPriority(source, target, priority, options = {}) {
    const { deepSync = true, syncMetadata = true } = options;

    if (priority === 'source') {
      return ContextContainerSync.updateTargetToMatchSource(source, target, { deepSync, syncMetadata });
    }
    return ContextContainerSync.updateSourceToMatchTarget(source, target, { deepSync, syncMetadata });
  }

  /**
   * @private
   * Delegates synchronization to the ContextContainerSyncEngine.
   * @param {ContextContainer} container1 - First container.
   * @param {ContextContainer} container2 - Second container.
   * @param {string} direction - Sync direction ('sourceToTarget' or 'targetToSource').
   * @param {object} options - Sync options.
   * @param {boolean} options.syncMetadata - Whether to sync metadata.
   */
  static #syncContainerItems(container1, container2, direction, { syncMetadata }) {
    const syncEngine = new ContextContainerSyncEngine({ syncMetadata });
    syncEngine.sync(container1, container2, direction);
  }
}

export { ContextContainerSync };
export default ContextContainerSync;
