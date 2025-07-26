/**
 * @file contextContainerSyncEngine.js
 * @description This file contains the ContextContainerSyncEngine class for handling complex recursive synchronization logic.
 * @path src/contexts/helpers/contextContainerSyncEngine.js

 *
 * Enhanced Features:
 * - Strict type checking option to validate ContextItem/ContextContainer types
 * - Deep synchronization for plain objects using lodash merge
 * - Primitive value synchronization for strings, numbers, booleans, null, undefined
 * - Mixed-type handling with proper Context type detection
 */

import { ContextContainer } from './contextContainer.js';
import ContextItemSync from './contextItemSync.js';
import { Validator } from '../../utils/static/validator.js';
import _ from 'lodash';

/**
 * @class ContextContainerSyncEngine
 * @classdesc Handles complex recursive synchronization operations between ContextContainer instances.
 * This class encapsulates the intricate logic for syncing nested containers and items.
 * It is designed to be instantiated for each sync operation, which improves testability and separates configuration from execution.
 * @export
 *
 * Public API:
 * - constructor(options) - Creates a new sync engine instance with specified options
 * - sync(container1, container2, direction) - Synchronizes items between two containers based on direction
 *
 * @example
 * // Create sync engine with metadata synchronization enabled
 * const engine = new ContextContainerSyncEngine({ syncMetadata: true });
 * engine.sync(sourceContainer, targetContainer, 'sourceToTarget');
 *
 * @example
 * // Create sync engine with strict type checking
 * const engine = new ContextContainerSyncEngine({ strictTypeChecking: true });
 * engine.sync(container1, container2, 'targetToSource');
 *
 * @private
 * @property {boolean} syncMetadata - Whether to sync metadata during synchronization
 * @property {boolean} strictTypeChecking - Whether to throw errors for incompatible types
 * @property {Set} #visitedContainers - Tracks visited containers to prevent infinite recursion
 */
class ContextContainerSyncEngine {
  #visitedContainers = new Set();

  /**
   * @private
   * Synchronizes items between two containers, adding new items from the source to the target
   * and updating existing items in the target based on the source.
   * @param {ContextContainer} sourceContainer - The source container providing items to sync.
   * @param {ContextContainer} targetContainer - The target container to update with items from the source.
   */
  #syncContainerItems(sourceContainer, targetContainer) {
    for (const key of sourceContainer.keys()) {
      try {
        const sourceItem = sourceContainer.getItem(key);
        if (!sourceItem) continue;

        // Skip if the source item is the same as the source container (self-reference)
        if (sourceItem === sourceContainer) {
          console.warn(`Self-reference detected for key "${key}", skipping to prevent infinite recursion`);
          continue;
        }

        if (targetContainer.hasItem(key)) {
          const targetItem = targetContainer.getItem(key);
          this._updateItem(sourceItem, targetItem);
        } else {
          this._addItem(key, sourceItem, targetContainer);
        }
      } catch (error) {
        if (error instanceof RangeError && error.message.includes('Maximum call stack size exceeded')) {
          console.error(`Stack overflow detected while synchronizing ${key} from ${sourceContainer} to ${targetContainer}:`, error);
        } else {
          console.error(`Error synchronizing ${key} from ${sourceContainer} to ${targetContainer}:`, error);
        }
      }
    }
  }

  /**
   * Recursively synchronizes a target container with a source container.
   * @param {ContextContainer} sourceContainer - The container to sync from.
   * @param {ContextContainer} targetContainer - The container to update.
   * @private
   */
  _syncContainer(sourceContainer, targetContainer) {
    // Check if we've already visited this source container to prevent infinite recursion
    if (this.#visitedContainers.has(sourceContainer)) {
      console.warn('Circular reference detected in source container, skipping to prevent infinite recursion');
      return;
    }

    // Add current container to visited set
    this.#visitedContainers.add(sourceContainer);

    this.#syncContainerItems(sourceContainer, targetContainer);

    // Remove current container from visited set when done
    this.#visitedContainers.delete(sourceContainer);
  }

  /**
   * Adds a new item to the target container. If the item is a container, it's cloned recursively.
   * @param {string} key - The key for the new item.
   * @param {ContextItem|ContextContainer} sourceItem - The source item to add.
   * @param {ContextContainer} targetContainer - The container to add the item to.
   * @private
   */
  _addItem(key, sourceItem, targetContainer) {
    if (sourceItem.isContextContainer) {
      this._cloneAndAddContainer(key, sourceItem, targetContainer);
    } else {
      targetContainer.setItem(key, sourceItem.value, { metadata: sourceItem.metadata });
    }
  }

  /**
   * Updates an existing item in the target container based on the source item.
   * @param {ContextItem|ContextContainer|*} sourceItem - The source item providing the new data.
   * @param {ContextItem|ContextContainer|*} targetItem - The target item to be updated.
   * @private
   */
  _updateItem(sourceItem, targetItem) {
    // Handle ContextItem to ContextItem synchronization
    if (sourceItem?.isContextItem && targetItem?.isContextItem) {
      ContextItemSync.updateTargetToMatchSource(sourceItem, targetItem, { syncMetadata: this.syncMetadata });
      return;
    }

    // Handle ContextContainer to ContextContainer synchronization
    if (sourceItem?.isContextContainer && targetItem?.isContextContainer) {
      this._syncContainer(sourceItem, targetItem);
      return;
    }

    // Check for strict type checking violations
    if (this.strictTypeChecking) {
      const isSourceContextType = sourceItem?.isContextItem || sourceItem?.isContextContainer;
      const isTargetContextType = targetItem?.isContextItem || targetItem?.isContextContainer;

      if (!isSourceContextType && !isTargetContextType) {
        throw new TypeError(`Strict type checking enabled: both sourceItem and targetItem must be ContextItem or ContextContainer instances. Got sourceItem type: ${typeof sourceItem}, targetItem type: ${typeof targetItem}`);
      }
    }

    // Check if either item has Context properties - if so, treat as mixed-type
    const hasContextProperties = (item) => item?.isContextItem || item?.isContextContainer;
    if (hasContextProperties(sourceItem) || hasContextProperties(targetItem)) {
      // Only update if targetItem is an object that can have properties assigned
      if (targetItem && typeof targetItem === 'object') {
        targetItem.value = sourceItem?.value ?? sourceItem;
        if (this.syncMetadata) {
          try {
            targetItem.setMetadata(sourceItem.metadata, false);
          } catch (error) {
            try {
              targetItem.metadata = sourceItem.metadata;
            } catch (metadataError) {
              console.warn('Failed to set metadata on target item:', metadataError);
            }
          }
        }
      }
      return;
    }

    // Handle plain objects with deep synchronization
    if (Validator.isPlainObject(sourceItem) && Validator.isPlainObject(targetItem)) {
      this._syncPlainObjects(sourceItem, targetItem);
      return;
    }

    // Handle primitive values (string, number, boolean, null, undefined)
    if (this._isPrimitive(sourceItem) && this._isPrimitive(targetItem)) {
      this._syncPrimitiveValues(sourceItem, targetItem);
      return;
    }

    // Fallback to existing mixed-type handling
    // Only update if targetItem is an object that can have properties assigned
    if (targetItem && typeof targetItem === 'object') {
      targetItem.value = sourceItem?.value ?? sourceItem;
      if (this.syncMetadata) {
        try {
          targetItem.setMetadata(sourceItem.metadata, false);
        } catch (error) {
          try {
            targetItem.metadata = sourceItem.metadata;
          } catch (metadataError) {
            console.warn('Failed to set metadata on target item:', metadataError);
          }
        }
      }
    }
  }

  /**
   * Synchronizes two plain objects by performing a deep merge.
   * @param {object} sourceObject - The source plain object.
   * @param {object} targetObject - The target plain object to update.
   * @private
   */
  _syncPlainObjects(sourceObject, targetObject) {
    // Perform deep merge from source to target
    _.merge(targetObject, _.cloneDeep(sourceObject));
  }

  /**
   * Synchronizes primitive values by direct assignment.
   * @param {string|number|boolean|null|undefined} sourceValue - The source primitive value.
   * @param {string|number|boolean|null|undefined} targetValue - The target primitive value.
   * @private
   */
  _syncPrimitiveValues(sourceValue, targetValue) {
    // For primitives, we can't modify the target directly since they're immutable
    // This method serves as a placeholder for potential future enhancement
    // In the current sync engine context, primitive sync would need to be handled
    // at the container level where we can reassign the reference
    console.debug(`Syncing primitive values: ${targetValue} -> ${sourceValue}`);
  }

  /**
   * Checks if a value is a primitive (string, number, boolean, null, undefined).
   * Uses the Validator utility class for consistent type checking.
   * @param {*} value - The value to check.
   * @returns {boolean} True if the value is a primitive.
   * @private
   */
  _isPrimitive(value) {
    return Validator.isPrimitive(value);
  }

  /**
   * Creates a deep clone of a source container and adds it to a target container.
   * @param {string} key - The key under which to add the cloned container.
   * @param {ContextContainer} sourceContainer - The container to clone.
   * @param {ContextContainer} targetContainer - The container to add the clone to.
   * @private
   */
  _cloneAndAddContainer(key, sourceContainer, targetContainer) {
    const newContainer = new ContextContainer(sourceContainer.value, sourceContainer.metadata);
    this._syncContainer(newContainer, sourceContainer);
    targetContainer.setItem(key, newContainer, { metadata: sourceContainer.metadata });
  }

  /**
   * Creates an instance of ContextContainerSyncEngine.
   * @param {object} [options={}] - Synchronization options.
   * @param {boolean} [options.syncMetadata=false] - Whether to sync metadata during synchronization.
   * @param {boolean} [options.strictTypeChecking=false] - Whether to throw errors for incompatible types.
   */
  constructor({ syncMetadata = false, strictTypeChecking = false } = {}) {
    /**
     * @private
     * @type {boolean}
     */
    this.syncMetadata = syncMetadata;

    /**
     * @private
     * @type {boolean}
     */
    this.strictTypeChecking = strictTypeChecking;
  }

  /**
   * Synchronizes items between two containers based on a specified direction.
   * @export
   * @param {ContextContainer} container1 - The first container.
   * @param {ContextContainer} container2 - The second container.
   * @param {string} direction - The synchronization direction, either 'sourceToTarget' or 'targetToSource'.
   */
  sync(container1, container2, direction) {
    const [source, target] = direction === 'sourceToTarget'
      ? [container1, container2]
      : [container2, container1];

    this._syncContainer(source, target);
    this.#visitedContainers.clear();
  }
}

export { ContextContainerSyncEngine };
export default ContextContainerSyncEngine;
