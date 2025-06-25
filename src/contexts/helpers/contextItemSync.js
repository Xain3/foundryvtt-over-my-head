/**
 * @file contextItemSync.js
 * @description This file contains the ContextItemSync class for synchronizing ContextItem instances.
 * @path /src/contexts/helpers/contextItemSync.js
 */

import { ContextItem } from './contextItem.js';
import ContextComparison from './contextComparison.js';
import _ from 'lodash';

/**
 * @class ContextItemSync
 * @description Provides synchronization capabilities specifically for ContextItem instances.
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

    destination.value = _.cloneDeep(origin.value);
    changes.push({ type: 'value', from: oldValue, to: destination.value });
    console.debug(`Updating ${names.destination} item value from ${oldValue} to ${origin.value}`);

    if (syncMetadata) {
      destination.setMetadata(origin.metadata, false);
      changes.push({ type: 'metadata', to: destination.metadata });
      console.debug('Preserving item metadata:', origin.metadata);
    }

    return { success: true, message: `${names.destination} item updated to match ${names.origin}`, changes };
  }

  /**
   * Updates the target item so its value and (optionally) metadata match the source item.
   * @param {ContextItem} source - The item to copy values from.
   * @param {ContextItem} target - The item to update to match the source.
   * @param {object} [options] - Update options.
   * @param {boolean} [options.syncMetadata=true] - If true, also copies metadata from source to target.
   * @returns {object} Update result. Has `success`, `message`, and `changes` properties.
   */
  static updateTargetToMatchSource(source, target, options = {}) {
    const result = ContextItemSync.#updateDestinationToMatchOrigin(source, target, { ...options, names: { origin: 'source', destination: 'target' } });
    return result;
  }

  /**
   * Updates the source item so its value and (optionally) metadata match the target item.
   * @param {ContextItem} source - The item to update to match the target.
   * @param {ContextItem} target - The item to copy values from.
   * @param {object} [options] - Update options.
   * @param {boolean} [options.syncMetadata=true] - If true, also copies metadata from target to source.
   * @returns {object} Update result. Has `success`, `message`, and `changes` properties.
   */
  static updateSourceToMatchTarget(source, target, options = {}) {
    const result = ContextItemSync.#updateDestinationToMatchOrigin(target, source, { ...options, names: { origin: 'target', destination: 'source' } });
    return result;
  }

  /**
   * Merges items with newer timestamps taking precedence.
   * @param {ContextItem} source - The source item.
   * @param {ContextItem} target - The target item.
   * @param {object} options - Merge options.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to compare ('modifiedAt', 'createdAt').
   * @param {boolean} [options.syncMetadata=true] - Whether to sync metadata during synchronization.
   * @returns {object} Merge result.
   */
  static mergeNewerWins(source, target, options = {}) {
    const { compareBy = 'modifiedAt', syncMetadata = true } = options;
    const comparison = ContextComparison.compare(source, target, { compareBy });

    if (comparison.result === ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER) {
      return ContextItemSync.updateTargetToMatchSource(source, target, { syncMetadata });
    }

    if (comparison.result === ContextComparison.COMPARISON_RESULTS.TARGET_NEWER) {
      return ContextItemSync.updateSourceToMatchTarget(source, target, { syncMetadata });
    }

    return { success: true, message: 'Items are equal, no merge needed', changes: [] };
  }

  /**
   * Merges items with specified priority.
   * @param {ContextItem} source - The source item.
   * @param {ContextItem} target - The target item.
   * @param {string} priority - The priority ('source' or 'target').
   * @param {object} options - Merge options.
   * @param {boolean} [options.syncMetadata=true] - Whether to preserve metadata during synchronization.
   * @returns {object} Merge result.
   */
  static mergeWithPriority(source, target, priority, options = {}) {
    const { syncMetadata = true } = options;

    if (priority === 'source') {
      return ContextItemSync.updateTargetToMatchSource(source, target, { syncMetadata });
    }
    if (priority === 'target') {
      return ContextItemSync.updateSourceToMatchTarget(source, target, { syncMetadata });
    }

    const message = `Invalid priority: "${priority}". Must be 'source' or 'target'.`;
    console.warn(message);
    return { success: false, message, changes: [] };
  }
}

export { ContextItemSync };
export default ContextItemSync;
