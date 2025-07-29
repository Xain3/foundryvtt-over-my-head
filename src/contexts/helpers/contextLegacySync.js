/**
 * @file contextLegacySync.js
 * @description Legacy synchronization operations for ContextContainer and ContextItem instances.
 * @path src/contexts/helpers/contextLegacySync.js

 */

import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';
import ContextComparison from './contextComparison.js';
import ContextItemSync from './contextItemSync.js';
import ContextContainerSync from './contextContainerSync.js';
import constants from '../../constants/constants.js';

/**
 * @class ContextLegacySync
 * @description Handles legacy synchronization operations for ContextContainer and ContextItem instances.
 * This class contains deprecated sync methods that will be replaced by newer implementations.
 * @export
 * 
 * Public API:
 * - static SYNC_OPERATIONS - Enum of legacy synchronization operation types
 * - static performLegacySync(source, target, operation, options) - Performs legacy sync operations
 * - static validateCompatibility(source, target) - Validates object compatibility for synchronization
 */
class ContextLegacySync {
  /**
   * @private
   * Gets the type of a context object.
   * @param {ContextContainer|ContextItem} obj - The object to classify.
   * @returns {string} The type of the object.
   */
  static #getObjectType(obj) {
    if (obj instanceof ContextContainer) return 'ContextContainer';
    if (obj instanceof ContextItem) return 'ContextItem';
    console.warn(
      'Unknown object type for synchronization:', obj,
      'Expected ContextContainer or ContextItem but got:', obj.constructor.name,
      'Returning "Unknown" type.'
    );
    return 'Unknown';
  }

  /**
   * @private
   * Gets the appropriate sync class for the given object type.
   * @param {ContextContainer|ContextItem} obj - The object to get sync class for.
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
   * @param {ContextContainer|ContextItem} source - The source object.
   * @param {ContextContainer|ContextItem} target - The target object.
   * @param {object} options - Update options.
   * @returns {object} Update result.
   */
  static #updateSourceToTarget(source, target, options) {
    const syncClass = ContextLegacySync.#getSyncClass(source);
    if (syncClass) {
      return syncClass.updateSourceToTarget(source, target, options);
    }
    throw new Error(constants.context.helpers.errorMessages.unsupportedObjectType);
  }

  /**
   * @private
   * Updates target object with source's data using appropriate sync class.
   * @param {ContextContainer|ContextItem} source - The source object.
   * @param {ContextContainer|ContextItem} target - The target object.
   * @param {object} options - Update options.
   * @returns {object} Update result.
   */
  static #updateTargetToSource(source, target, options) {
    const syncClass = ContextLegacySync.#getSyncClass(source);
    if (syncClass) {
      return syncClass.updateTargetToSource(source, target, options);
    }
    throw new Error(constants.context.helpers.errorMessages.unsupportedObjectType);
  }

  /**
   * @private
   * Merges objects with newer timestamps taking precedence using appropriate sync class.
   * @param {ContextContainer|ContextItem} source - The source object.
   * @param {ContextContainer|ContextItem} target - The target object.
   * @param {object} options - Merge options.
   * @returns {object} Merge result.
   */
  static #mergeNewerWins(source, target, options) {
    const syncClass = ContextLegacySync.#getSyncClass(source);
    if (syncClass) {
      return syncClass.mergeNewerWins(source, target, options);
    }
    throw new Error(constants.context.helpers.errorMessages.unsupportedObjectType);
  }

  /**
   * @private
   * Merges objects with specified priority using appropriate sync class.
   * @param {ContextContainer|ContextItem} source - The source object.
   * @param {ContextContainer|ContextItem} target - The target object.
   * @param {string} priority - The priority ('source' or 'target').
   * @param {object} options - Merge options.
   * @returns {object} Merge result.
   */
  static #mergeWithPriority(source, target, priority, options) {
    const syncClass = ContextLegacySync.#getSyncClass(source);
    if (syncClass) {
      return syncClass.mergeWithPriority(source, target, priority, options);
    }
    throw new Error(constants.context.helpers.errorMessages.unsupportedObjectType);
  }

  /**
   * @enum {string}
   * @description Legacy synchronization operation types.
   */
  static SYNC_OPERATIONS = {
    UPDATE_SOURCE_TO_TARGET: constants.context.helpers.mergeStrategies.UPDATE_SOURCE_TO_TARGET,
    UPDATE_TARGET_TO_SOURCE: constants.context.helpers.mergeStrategies.UPDATE_TARGET_TO_SOURCE,
    MERGE_NEWER_WINS: constants.context.helpers.mergeStrategies.MERGE_NEWER_WINS,
    MERGE_SOURCE_PRIORITY: constants.context.helpers.mergeStrategies.MERGE_SOURCE_PRIORITY,
    MERGE_TARGET_PRIORITY: constants.context.helpers.mergeStrategies.MERGE_TARGET_PRIORITY,
    NO_ACTION: constants.context.helpers.mergeStrategies.NO_ACTION
  };

  /**
   * Performs legacy sync operations for ContextContainer and ContextItem instances.
   * @param {ContextContainer|ContextItem} source - The source object.
   * @param {ContextContainer|ContextItem} target - The target object.
   * @param {string} operation - The sync operation.
   * @param {object} options - Sync options.
   * @returns {object} Sync result.
   */
  static performLegacySync(source, target, operation, options = {}) {
    // Validate object types before attempting comparison
    const sourceType = ContextLegacySync.#getObjectType(source);
    const targetType = ContextLegacySync.#getObjectType(target);

    if (sourceType === 'Unknown' || targetType === 'Unknown') {
      throw new Error(constants.context.helpers.errorMessages.unsupportedObjectType);
    }

    const comparison = ContextComparison.compare(source, target, { compareBy: options.compareBy });

    switch (operation) {
      case ContextLegacySync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET:
        const updateSourceResult = ContextLegacySync.#updateSourceToTarget(source, target, options);
        updateSourceResult.operation = operation; // Ensure operation name matches
        return updateSourceResult;

      case ContextLegacySync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE:
        const updateTargetResult = ContextLegacySync.#updateTargetToSource(source, target, options);
        updateTargetResult.operation = operation; // Ensure operation name matches
        return updateTargetResult;

      case ContextLegacySync.SYNC_OPERATIONS.MERGE_NEWER_WINS:
        const mergeNewerResult = ContextLegacySync.#mergeNewerWins(source, target, options);
        mergeNewerResult.operation = operation; // Ensure operation name matches
        return mergeNewerResult;

      case ContextLegacySync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY:
        const sourcePriorityResult = ContextLegacySync.#mergeWithPriority(source, target, 'source', options);
        sourcePriorityResult.operation = operation; // Ensure operation name matches the requested operation
        return sourcePriorityResult;

      case ContextLegacySync.SYNC_OPERATIONS.MERGE_TARGET_PRIORITY:
        const targetPriorityResult = ContextLegacySync.#mergeWithPriority(source, target, 'target', options);
        targetPriorityResult.operation = operation; // Ensure operation name matches the requested operation
        return targetPriorityResult;

      case ContextLegacySync.SYNC_OPERATIONS.NO_ACTION:
        return {
          success: true,
          message: 'No synchronization performed',
          operation,
          comparison,
          changes: []
        };

      default:
        throw new Error(constants.context.helpers.errorMessages.unknownSyncOperation.replace('{operation}', operation));
    }
  }

  /**
   * Validates that objects are compatible for legacy synchronization.
   * @param {ContextContainer|ContextItem} source - The source object.
   * @param {ContextContainer|ContextItem} target - The target object.
   * @returns {boolean} True if objects are compatible for sync.
   */
  static validateCompatibility(source, target) {
    if (!source || !target) return false;

    const sourceType = ContextLegacySync.#getObjectType(source);
    const targetType = ContextLegacySync.#getObjectType(target);

    return sourceType === targetType;
  }
}

export { ContextLegacySync };
export default ContextLegacySync;
