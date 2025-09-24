/**
 * @file contextContainerSync.js
 * @description This file contains the ContextContainerSync class for synchronizing ContextContainer instances.
 * @path src/contexts/helpers/contextContainerSync.js

 */

import ContextComparison from './contextComparison.mjs';
import ContextContainerSyncEngine from './contextContainerSyncEngine.mjs';

/**
 * @class ContextContainerSync
 * @classdesc Provides synchronization capabilities for {@link ContextContainer} instances.
 * Uses {@link ContextContainerSyncEngine} for complex recursive synchronization.
 * @export
 *
 * Public API:
 * - updateSourceToMatchTarget(source, target, options) - Updates the source container to match the target
 * - updateTargetToMatchSource(source, target, options) - Updates the target container to match the source
 * - mergeNewerWins(source, target, options) - Merges containers, preferring the one with the newer timestamp
 * - mergeWithPriority(source, target, priority, options) - Merges containers, preferring the specified priority ('source' or 'target')
 * - updateSourceToTarget(source, target, options) - Alias for updateTargetToMatchSource for compatibility
 * - updateTargetToSource(source, target, options) - Alias for updateSourceToMatchTarget for compatibility
 *
 * @example
 * // Synchronize two containers deeply, including metadata
 * ContextContainerSync.updateTargetToMatchSource(sourceContainer, targetContainer, { deepSync: true, syncMetadata: true });
 *
 * @example
 * // Merge containers with the newer one taking precedence
 * ContextContainerSync.mergeNewerWins(sourceContainer, targetContainer, { compareBy: 'modifiedAt' });
 *
 * @private
 * @property {Function} #syncContainerItems - Delegates synchronization to the ContextContainerSyncEngine
 */
class ContextContainerSync {
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

  /**
   * Updates source container with target's data.
   * @export
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
      ContextContainerSync.#syncContainerItems(source, target, 'targetToSource', { syncMetadata });
      changes.push({ type: 'containerSync', direction: 'targetToSource' });
    } else {
      source.value = target.value;
      changes.push({ type: 'containerValue', to: target.value });
    }

    return {
      success: true,
      message: 'Source container updated to match target',
      changes,
      operation: 'updateSourceToMatchTarget'
    };
  }

  /**
   * Updates target container with source's data.
   * @export
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
      ContextContainerSync.#syncContainerItems(source, target, 'sourceToTarget', { syncMetadata });
      changes.push({ type: 'containerSync', direction: 'sourceToTarget' });
    } else {
      target.value = source.value;
      changes.push({ type: 'containerValue', to: source.value });
    }

    return {
      success: true,
      message: 'Target container updated to match source',
      changes,
      operation: 'updateTargetToMatchSource'
    };
  }

  /**
   * Merges containers with newer timestamps taking precedence.
   * @export
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

    if (comparison.result === ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER) {
      const result = ContextContainerSync.updateTargetToMatchSource(source, target, { deepSync, syncMetadata });
      return { ...result, operation: 'mergeNewerWins' };
    }
    if (comparison.result === ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER) {
      const result = ContextContainerSync.updateSourceToMatchTarget(source, target, { deepSync, syncMetadata });
      return { ...result, operation: 'mergeNewerWins' };
    }
    return {
      success: true,
      message: 'Containers are equal, no merge needed',
      changes: [],
      operation: 'mergeNewerWins'
    };
  }

  /**
   * Merges containers with specified priority.
   * @export
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
      const result = ContextContainerSync.updateTargetToMatchSource(source, target, { deepSync, syncMetadata });
      return { ...result, operation: 'mergeWithPriority' };
    }
    const result = ContextContainerSync.updateSourceToMatchTarget(source, target, { deepSync, syncMetadata });
    return { ...result, operation: 'mergeWithPriority' };
  }

  /**
   * Alias for updateTargetToMatchSource for compatibility with ContextLegacySync.
   * @export
   * @param {ContextContainer} source - The source container.
   * @param {ContextContainer} target - The target container.
   * @param {object} options - Update options.
   * @returns {object} Update result.
   */
  static updateSourceToTarget(source, target, options = {}) {
    const result = ContextContainerSync.updateTargetToMatchSource(source, target, options);
    return { ...result, operation: 'updateSourceToTarget' };
  }

  /**
   * Alias for updateSourceToMatchTarget for compatibility with ContextLegacySync.
   * @export
   * @param {ContextContainer} source - The source container.
   * @param {ContextContainer} target - The target container.
   * @param {object} options - Update options.
   * @returns {object} Update result.
   */
  static updateTargetToSource(source, target, options = {}) {
    const result = ContextContainerSync.updateSourceToMatchTarget(source, target, options);
    return { ...result, operation: 'updateTargetToSource' };
  }
}

export { ContextContainerSync };
export default ContextContainerSync;
