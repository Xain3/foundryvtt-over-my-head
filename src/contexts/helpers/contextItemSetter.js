/**
 * @file contextItemSetter.js
 * @description Static class for managing item setting operations in ContextContainer instances.
 * @path src/contexts/helpers/contextItemSetter.js

 */

import { ContextValueWrapper } from './contextValueWrapper.js';
import PathUtils from '../../helpers/pathUtils.js';
import constants from '../../constants/constants.js';

/**
 * @class ContextItemSetter
 * @description Static class that manages setting items in ContextContainer instances.
 *              Handles dot notation, validation, and wrapping logic.
 * @export
 * 
 * Public API:
 * - static setItem(key, rawValue, containerInstance, itemOptionsOverrides) - Sets or updates an item in the provided container instance
 */
class ContextItemSetter {
  /**
   * Handles setting an item with dot notation (nested path).
   * @private
   * @param {string} key - The dot-notated key.
   * @param {*} rawValue - The raw value of the item.
   * @param {ContextContainer} containerInstance - The ContextContainer instance to operate on.
   * @param {object} itemOptionsOverrides - Options to override container's default item options.
   * @returns {ContextContainer} The instance of the container for chaining.
   */
  static #handleNestedItemSetting(key, rawValue, containerInstance, itemOptionsOverrides) {
    const { firstKey, remainingPath } = PathUtils.extractKeyComponents(key, {
      validateFirstKey: (firstKey) => {
        if (containerInstance._isReservedKey(firstKey)) {
          throw new TypeError(`Key "${firstKey}" is reserved and cannot be used for an item.`);
        }
      }
    });

    // Get or create the nested container using helper method
    const container = containerInstance._createNestedContainer(firstKey);

    // Check if container has setItem method (duck typing to avoid circular dependency)
    if (!container || typeof container.setItem !== 'function') {
      throw new TypeError(`Cannot set nested value on non-container item at key "${firstKey}"`);
    }

    container.setItem(remainingPath, rawValue, itemOptionsOverrides);
    containerInstance._updateModificationTimestamps();
    return containerInstance;
  }

  /**
   * Handles setting a simple item (no dot notation).
   * @private
   * @param {string} key - The simple key.
   * @param {*} rawValue - The raw value of the item.
   * @param {ContextContainer} containerInstance - The ContextContainer instance to operate on.
   * @param {object} itemOptionsOverrides - Options to override container's default item options.
   * @returns {ContextContainer} The instance of the container for chaining.
   */
  static #handleSimpleItemSetting(key, rawValue, containerInstance, itemOptionsOverrides) {
    if (containerInstance._isReservedKey(key)) {
      console.warn(constants.contextHelpers.errorMessages.keyRenamed.replace(/\{key\}/g, key));
      key = `_${key}`; // Prefix reserved keys to avoid conflicts
    }

    // Check if we're trying to overwrite a frozen item using helper method
    const existingItem = containerInstance._getManagedItem(key);
    const ignoreFrozen = itemOptionsOverrides.ignoreFrozen || false;

    if (existingItem && typeof existingItem.isFrozen === 'function' && existingItem.isFrozen() && !ignoreFrozen) {
      throw new Error(constants.contextHelpers.errorMessages.cannotOverwriteFrozen.replace(/\{key\}/g, key));
    }

    const itemSpecificMetadata = itemOptionsOverrides.metadata || {};
    const defaultItemOptions = containerInstance._getDefaultItemOptions();
    const itemOptionsForWrapper = {
      ...defaultItemOptions,
      ...itemOptionsOverrides,
      metadata: itemSpecificMetadata,
    };
    itemOptionsForWrapper.wrapAs = itemOptionsForWrapper.wrapAs || defaultItemOptions.wrapAs;

    const wrappedValue = ContextValueWrapper.wrap(rawValue, itemOptionsForWrapper);
    containerInstance._setManagedItem(key, wrappedValue);
    containerInstance._updateModificationTimestamps();
    return containerInstance;
  }

  /**
   * Sets or updates an item in the provided container instance.
   * Supports dot-notation path traversal for nested items (e.g., 'player.stats.level').
   * @param {string} key - The key for the item. Must be a non-empty string. Can use dot notation for nested access.
   * @param {*} rawValue - The raw value of the item.
   * @param {ContextContainer} containerInstance - The ContextContainer instance to operate on.
   * @param {object} [itemOptionsOverrides={}] - Options to override container's default item options for this specific item.
   * @param {boolean} [itemOptionsOverrides.wrapPrimitives] - Whether to wrap primitive values.
   * @param {"ContextItem"|"ContextContainer"} [itemOptionsOverrides.wrapAs] - How to wrap the value.
   * @param {boolean} [itemOptionsOverrides.recordAccess] - Whether to record access to the item's value.
   * @param {boolean} [itemOptionsOverrides.recordAccessForMetadata] - Whether to record access to the item's metadata.
   * @param {boolean} [itemOptionsOverrides.frozen] - Whether the item should start in a frozen state.
   * @param {object} [itemOptionsOverrides.metadata] - Metadata to associate with the item.
   * @param {boolean} [itemOptionsOverrides.ignoreFrozen=false] - If true, allows overwriting frozen items without error.
   * @returns {ContextContainer} The instance of the container for chaining.
   * @throws {TypeError} If the key is invalid, reserved, or if wrapping fails.
   * @throws {Error} If attempting to modify a frozen item and ignoreFrozen is false.
   */
  static setItem(key, rawValue, containerInstance, itemOptionsOverrides = {}) {
    if (typeof key !== 'string' || key.length === 0) {
      throw new TypeError('Item key must be a non-empty string.');
    }

    // Handle dot notation for nested setting
    if (key.includes('.')) {
      return this.#handleNestedItemSetting(key, rawValue, containerInstance, itemOptionsOverrides);
    }

    // Simple key setting (no dot notation)
    return this.#handleSimpleItemSetting(key, rawValue, containerInstance, itemOptionsOverrides);
  }
}

export { ContextItemSetter };
