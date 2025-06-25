/**
 * @file contextContainerSyncEngine.js
 * @description This file contains the ContextContainerSyncEngine class for handling complex recursive synchronization logic.
 * @path /src/contexts/helpers/contextContainerSyncEngine.js
 */

import { ContextContainer } from './contextContainer.js';
import ContextItemSync from './contextItemSync.js';

/**
 * @class ContextContainerSyncEngine
 * @classdesc Handles complex recursive synchronization operations between ContextContainer instances.
 * This class encapsulates the intricate logic for syncing nested containers and items.
 * It is designed to be instantiated for each sync operation, which improves testability and separates configuration from execution.
 */
class ContextContainerSyncEngine {
  #visitedContainers = new Set();

  /**
   * Creates an instance of ContextContainerSyncEngine.
   * @param {object} [options={}] - Synchronization options.
   * @param {boolean} [options.syncMetadata=false] - Whether to sync metadata during synchronization.
   */
  constructor({ syncMetadata = false } = {}) {
    /**
     * @private
     * @type {boolean}
     */
    this.syncMetadata = syncMetadata;
  }

  /**
   * Synchronizes items between two containers based on a specified direction.
   * @param {ContextContainer} container1 - The first container.
   * @param {ContextContainer} container2 - The second container.
   * @param {string} direction - The synchronization direction, either 'sourceToTarget' or 'targetToSource'.
   */
  sync(container1, container2, direction) {
    const [source, target] = direction === 'sourceToTarget'
      ? [container1, container2]
      : [container2, container1];

    this._syncContainer(target, source);
    this.#visitedContainers.clear();
  }

  /**
   * Recursively synchronizes a target container with a source container.
   * @param {ContextContainer} targetContainer - The container to update.
   * @param {ContextContainer} sourceContainer - The container to sync from.
   * @private
   */
  _syncContainer(targetContainer, sourceContainer) {
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
   * Synchronizes items between two containers, adding new items from the source to the target
   * and updating existing items in the target based on the source.
   * @param {ContextContainer} sourceContainer - The source container providing items to sync.
   * @param {ContextContainer} targetContainer - The target container to update with items from the source.
   * @private
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
        if (error instanceof StackOverflowError) {
          console.error(`Stack overflow detected while synchronizing ${key} from ${sourceContainer} to ${targetContainer}:`, error);
        } else {
          console.error(`Error synchronizing ${key} from ${sourceContainer} to ${targetContainer}:`, error);
        }
      }
    }
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
   * @param {ContextItem|ContextContainer} sourceItem - The source item providing the new data.
   * @param {ContextItem|ContextContainer} targetItem - The target item to be updated.
   * @private
   */
  _updateItem(sourceItem, targetItem) {
    if (sourceItem.isContextItem && targetItem.isContextItem) {
      ContextItemSync.updateTargetToMatchSource(sourceItem, targetItem, { syncMetadata: this.syncMetadata });
    } else if (sourceItem.isContextContainer && targetItem.isContextContainer) {
      this._syncContainer(targetItem, sourceItem);
    } else {
      targetItem.value = sourceItem.value;
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
}

export { ContextContainerSyncEngine };
export default ContextContainerSyncEngine;
