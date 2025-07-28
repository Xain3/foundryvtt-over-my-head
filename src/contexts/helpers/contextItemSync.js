/**
 * @file contextItemSync.js
 * @description Provides synchronization capabilities specifically for ContextItem instances.
 * @path src/contexts/helpers/contextItemSync.js

 */

import { ContextItem } from './contextItem.js';
import ContextComparison from './contextComparison.js';
import { cloneDeep } from 'lodash';

/**
 * @class ContextItemSync
 * @description Provides synchronization capabilities specifically for ContextItem instances.
 * @export
 *
 * Public API:
 * - static updateTargetToMatchSource(source, target, options) - Updates target to match source values
 * - static updateSourceToMatchTarget(source, target, options) - Updates source to match target values
 * - static mergeNewerWins(source, target, options) - Merges items with newer timestamps taking precedence
 * - static mergeWithPriority(source, target, priority, options) - Merges items with specified priority
 * - static updateSourceToTarget(source, target, options) - Alias for updateTargetToMatchSource
 * - static updateTargetToSource(source, target, options) - Alias for updateSourceToMatchTarget
 * - static updateDestinationToMatchOrigin(origin, destination, options) - Origin/destination terminology alias
 * - static updateOriginToMatchDestination(origin, destination, options) - Origin/destination terminology alias
 */
class ContextItemSync {

  /**
   * Updates the destination item so its value and (optionally) metadata match the origin item.
   * @param {ContextItem} origin - The item to copy values from.
   * @param {ContextItem} destination - The item to update to match the origin.
   * @param {object} options - Update options.
   * @param {boolean} [options.syncMetadata=true] - If true, also copies metadata from origin to destination.
   * @param {object} [options.names] - Custom names for origin and destination items (for logging/messages).
   * @returns {object} Update result. Has `success`, `message`, and `changes` properties.
   */
  static #updateDestinationToMatchOrigin(origin, destination, { syncMetadata = true, names = {origin: 'source', destination: 'target'} } = {}) {
    const changes = [];
    const oldValue = destination.value;

    console.debug(`Updating ${names.destination} item value from ${oldValue} to ${origin.value}`);
    destination.value = cloneDeep(origin.value);
    changes.push({ type: 'value', from: oldValue, to: destination.value });

    if (syncMetadata) {
      console.debug('Preserving item metadata:', origin.metadata);
      destination.setMetadata(origin.metadata, false);
      changes.push({ type: 'metadata', to: destination.metadata });
    }

    return { success: true, message: `${names.destination} item updated to match ${names.origin}`, changes, operation: 'updateDestinationToMatchOrigin' };
  }

  /**
   * Updates the target item so its value and (optionally) metadata match the source item.
   * @param {ContextItem} source - The item to copy values from.
   * @param {ContextItem} target - The item to update to match the source.
   * @param {object} [options] - Update options.
   * @param {boolean} [options.syncMetadata=true] - If true, also copies metadata from source to target.
   * @returns {object} Update result. Has `success`, `message`, `changes`, and `operation` properties.
   */
  static updateTargetToMatchSource(source, target, options = {}) {
    const result = ContextItemSync.#updateDestinationToMatchOrigin(source, target, { ...options, names: { origin: 'source', destination: 'target' } });
    result.operation = 'updateTargetToMatchSource';
    return result;
  }

  /**
   * Updates the source item so its value and (optionally) metadata match the target item.
   * @param {ContextItem} source - The item to update to match the target.
   * @param {ContextItem} target - The item to copy values from.
   * @param {object} [options] - Update options.
   * @param {boolean} [options.syncMetadata=true] - If true, also copies metadata from target to source.
   * @returns {object} Update result. Has `success`, `message`, `changes`, and `operation` properties.
   */
  static updateSourceToMatchTarget(source, target, options = {}) {
    const result = ContextItemSync.#updateDestinationToMatchOrigin(target, source, { ...options, names: { origin: 'target', destination: 'source' } });
    result.operation = 'updateSourceToMatchTarget';
    return result;
  }

  /**
   * Merges items with newer timestamps taking precedence.
   * @param {ContextItem} source - The source item.
   * @param {ContextItem} target - The target item.
   * @param {object} options - Merge options.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to compare ('modifiedAt', 'createdAt').
   * @param {boolean} [options.syncMetadata=true] - Whether to sync metadata during synchronization.
   * @returns {object} Merge result with `operation` property.
   */
  static mergeNewerWins(source, target, options = {}) {
    const { compareBy = 'modifiedAt', syncMetadata = true } = options;
    const comparison = ContextComparison.compare(source, target, { compareBy });

    if (comparison.result === ContextComparison.COMPARISON_RESULTS.CONTAINER_A_NEWER) {
      const result = ContextItemSync.updateTargetToMatchSource(source, target, { syncMetadata });
      result.operation = 'mergeNewerWins';
      return result;
    }

    if (comparison.result === ContextComparison.COMPARISON_RESULTS.CONTAINER_B_NEWER) {
      const result = ContextItemSync.updateSourceToMatchTarget(source, target, { syncMetadata });
      result.operation = 'mergeNewerWins';
      return result;
    }

    return { success: true, message: 'Items are equal, no merge needed', changes: [], operation: 'mergeNewerWins' };
  }

  /**
   * Merges items with specified priority.
   * @param {ContextItem} source - The source item.
   * @param {ContextItem} target - The target item.
   * @param {string} priority - The priority ('source' or 'target').
   * @param {object} options - Merge options.
   * @param {boolean} [options.syncMetadata=true] - Whether to preserve metadata during synchronization.
   * @returns {object} Merge result with `operation` property.
   */
  static mergeWithPriority(source, target, priority, options = {}) {
    const { syncMetadata = true } = options;

    if (priority === 'source') {
      const result = ContextItemSync.updateTargetToMatchSource(source, target, { syncMetadata });
      result.operation = 'mergeWithPriority';
      return result;
    }
    if (priority === 'target') {
      const result = ContextItemSync.updateSourceToMatchTarget(source, target, { syncMetadata });
      result.operation = 'mergeWithPriority';
      return result;
    }

    const message = `Invalid priority: "${priority}". Must be 'source' or 'target'.`;
    console.warn(message);
    return { success: false, message, changes: [], operation: 'mergeWithPriority' };
  }

  /**
   * Alias for updateTargetToMatchSource for compatibility with ContextLegacySync.
   * @param {ContextItem} source - The source item.
   * @param {ContextItem} target - The target item.
   * @param {object} options - Update options.
   * @returns {object} Update result with `operation` property.
   */
  static updateSourceToTarget(source, target, options = {}) {
    const result = ContextItemSync.updateTargetToMatchSource(source, target, options);
    result.operation = 'updateSourceToTarget';
    return result;
  }

  /**
   * Alias for updateSourceToMatchTarget for compatibility with ContextLegacySync.
   * @param {ContextItem} source - The source item.
   * @param {ContextItem} target - The target item.
   * @param {object} options - Update options.
   * @returns {object} Update result with `operation` property.
   */
  static updateTargetToSource(source, target, options = {}) {
    const result = ContextItemSync.updateSourceToMatchTarget(source, target, options);
    result.operation = 'updateTargetToSource';
    return result;
  }

  /**
   * Alias for updateTargetToMatchSource using origin/destination terminology.
   * @param {ContextItem} origin - The origin item (source).
   * @param {ContextItem} destination - The destination item (target).
   * @param {object} options - Update options.
   * @returns {object} Update result with `operation` property.
   */
  static updateDestinationToMatchOrigin(origin, destination, options = {}) {
    const result = ContextItemSync.updateTargetToMatchSource(origin, destination, options);
    result.operation = 'updateDestinationToMatchOrigin';
    return result;
  }

  /**
   * Alias for updateSourceToMatchTarget using origin/destination terminology.
   * @param {ContextItem} origin - The origin item (source).
   * @param {ContextItem} destination - The destination item (target).
   * @param {object} options - Update options.
   * @returns {object} Update result with `operation` property.
   */
  static updateOriginToMatchDestination(origin, destination, options = {}) {
    const result = ContextItemSync.updateSourceToMatchTarget(origin, destination, options);
    result.operation = 'updateOriginToMatchDestination';
    return result;
  }
}

export { ContextItemSync };
export default ContextItemSync;
