/**
 * @file contextContainer.js
 * @description This file contains the ContextContainer class for managing collections of named ContextItems.
 * @path src/contexts/helpers/contextContainer.js
 */

import { ContextItem } from './contextItem.js';
import { ContextValueWrapper } from './contextValueWrapper.js';
import { ContextItemSetter } from './contextItemSetter.js';
import { Validator } from '../../utils/static/validator.js';
import PathUtils from '../../helpers/pathUtils.js';

/**
 * @class ContextContainer
 * @classdesc Represents a container that manages a collection of named ContextItems or nested ContextContainers.
 *            Extends ContextItem, inheriting metadata and timestamp features.
 * @extends ContextItem
 * @property {object} value - A plain object representation of all managed items, with their unwrapped values. Setting this clears and repopulates items.
 * @property {number} size - The number of items in the container.
 * @property {object} #defaultItemOptions - Default options for items added to this container.
 * @property {Map<string, ContextItem|ContextContainer>} #managedItems - Internal storage for managed items.
 */
class ContextContainer extends ContextItem {
  #managedItems;
  #defaultItemOptions;

  /**
   * Creates an instance of ContextContainer.
   * @param {object|*} [initialItemsOrValue={}] - An object where keys are item names and values are raw values to be managed,
   *                                            or a single value to be managed under the key "default" if `initialItemsOrValue` is not a plain object.
   * @param {object} [metadata={}] - Metadata for the container itself.
   * @param {object} [options={}] - Options for the container and default options for its items.
   * @param {boolean} [options.recordAccess=true] - If true, records access to the container itself (e.g., getting its overall value or size).
   * @param {boolean} [options.recordAccessForMetadata=false] - If true, records access to the container's metadata.
   * @param {boolean} [options.defaultItemWrapPrimitives=true] - Default for `wrapPrimitives` for items added to this container.
   * @param {"ContextItem"|"ContextContainer"} [options.defaultItemWrapAs="ContextItem"] - Default for `wrapAs` for items added to this container.
   * @param {boolean} [options.defaultItemRecordAccess=true] - Default `recordAccess` for items created within this container.
   * @param {boolean} [options.defaultItemRecordAccessForMetadata=false] - Default `recordAccessForMetadata` for items created within this container.
   */
  constructor(
    initialItemsOrValue = {},
    metadata = {},
    {
      recordAccess = true,
      recordAccessForMetadata = false,
      defaultItemWrapPrimitives = true,
      defaultItemWrapAs = "ContextItem",
      defaultItemRecordAccess = true,
      defaultItemRecordAccessForMetadata = false,
    } = {}
  ) {
    super(undefined, metadata, { recordAccess, recordAccessForMetadata });

    this.#managedItems = new Map();
    this.#defaultItemOptions = {
      wrapPrimitives: defaultItemWrapPrimitives,
      wrapAs: defaultItemWrapAs,
      recordAccess: defaultItemRecordAccess,
      recordAccessForMetadata: defaultItemRecordAccessForMetadata,
    };

    if (initialItemsOrValue !== undefined) {
      if (Validator.isPlainObject(initialItemsOrValue)) {
        for (const [key, value] of Object.entries(initialItemsOrValue)) {
          ContextItemSetter.setItem(key, value, this, {
            wrapPrimitives: this.#defaultItemOptions.wrapPrimitives,
            wrapAs: this.#defaultItemOptions.wrapAs,
            recordAccess: this.#defaultItemOptions.recordAccess,
            recordAccessForMetadata: this.#defaultItemOptions.recordAccessForMetadata
          });
        }
      } else {
        // If initialItemsOrValue is not a plain object, treat it as a single value under the key "default"
        ContextItemSetter.setItem('default', initialItemsOrValue, this, {
          wrapPrimitives: this.#defaultItemOptions.wrapPrimitives,
          wrapAs: this.#defaultItemOptions.wrapAs,
          recordAccess: this.#defaultItemOptions.recordAccess,
          recordAccessForMetadata: this.#defaultItemOptions.recordAccessForMetadata
        });
      }
    }
  }

  /**
   * Checks if a value is a plain object.
   * @protected
   * @param {*} value - The value to check.
   * @returns {boolean} True if the value is a plain object, false otherwise.
   */
  _isPlainObject(value) {
    return Validator.isPlainObject(value);
  }

  /**
   * Checks if a key is reserved.
   * @protected
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key is reserved, false otherwise.
   */
  _isReservedKey(key) {
    return this.#isReservedKey(key);
  }

  /**
   * Extracts key components from a dot-notation path.
   * @protected
   * @param {string} path - The dot-notation path.
   * @returns {object} Object with firstKey and remainingPath.
   */
  _extractKeyComponents(path) {
    return PathUtils.extractKeyComponents(path, {
      validateFirstKey: (firstKey) => {
        if (this.#isReservedKey(firstKey)) {
          throw new TypeError(`Key "${firstKey}" is reserved and cannot be used for an item.`);
        }
      }
    });
  }

  /**
   * Creates or returns a nested container for a given key.
   * @protected
   * @param {string} key - The key for the nested container.
   * @returns {ContextContainer} The nested container.
   */
  _createNestedContainer(key) {
    let container = this.#managedItems.get(key);
    if (!container) {
      container = ContextValueWrapper.wrap({}, {
        ...this.#defaultItemOptions,
        wrapAs: 'ContextContainer'
      });
      this.#managedItems.set(key, container);
    }

    if (!(container instanceof ContextContainer)) {
      throw new TypeError(`Cannot set nested value on non-container item at key "${key}"`);
    }

    return container;
  }

  /**
   * Sets an item in a nested container using dot notation.
   * @protected
   * @param {ContextContainer} nestedContainer - The container to set the item in.
   * @param {string} path - The path to set the item at.
   * @param {*} value - The value to set.
   * @param {object} itemOptions - Options for the item.
   * @returns {ContextContainer} The nested container.
   */
  _setNestedItem(nestedContainer, path, value, itemOptions) {
    nestedContainer.setItem(path, value, itemOptions);
    this._updateModificationTimestamps();
    return nestedContainer;
  }

  /**
   * Validates if a key is reserved.
   * Checks if a key is reserved (e.g., a property/method of ContextItem or ContextContainer).
   * @private
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key is reserved, false otherwise.
   */
  #isReservedKey(key) {
    return Validator.isReservedKey(key, {
      classPrototypes: [ContextItem, ContextContainer],
      additionalReservedKeys: ['value', 'metadata', 'createdAt', 'modifiedAt', 'lastAccessedAt', 'size'],
      instance: this
    });
  }

  /**
   * Handles nested access using dot notation.
   * @private
   * @param {string} key - The dot-notated key.
   * @returns {*} The unwrapped value, or undefined if not found.
   */
  #handleNestedAccess(key) {
    const { firstKey, remainingPath, parts } = PathUtils.extractKeyComponents(key, {
      returnParts: true,
      validateFirstKey: (firstKey) => {
        if (this.#isReservedKey(firstKey)) {
          throw new TypeError(`Key "${firstKey}" is reserved and cannot be used for an item.`);
        }
      }
    });

    const item = this.#managedItems.get(firstKey);
    if (item && this.recordAccess) this._updateAccessTimestamp();

    if (!item) return undefined;

    if (item instanceof ContextContainer) {
      return item.getItem(remainingPath);
    }

    const value = item.value;
    if (value && typeof value === 'object') {
      return PathUtils.getNestedObjectValue(value, parts, { startIndex: 1 });
    }

    return undefined;
  }

  /**
   * Sets or updates an item in the container.
   * Supports dot-notation path traversal for nested items (e.g., 'player.stats.level').
   * @param {string} key - The key for the item. Must be a non-empty string. Can use dot notation for nested access.
   * @param {*} rawValue - The raw value of the item.
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
  setItem(key, rawValue, itemOptionsOverrides = {}) {
    return ContextItemSetter.setItem(key, rawValue, this, itemOptionsOverrides);
  }

  /**
   * Checks if an item exists in the container.
   * Supports dot-notation path traversal for nested items (e.g., 'player.stats.level').
   * @param {string} key - The key of the item to check. Can use dot notation for nested access.
   * @returns {boolean} True if the item exists, false otherwise.
   */
  hasItem(key) {
    if (typeof key !== 'string' || key.length === 0) {
      return false;
    }

    // Handle dot notation for nested access
    if (key.includes('.')) {
      const { firstKey, remainingPath } = PathUtils.extractKeyComponents(key, {
        validateFirstKey: (firstKey) => {
          if (this.#isReservedKey(firstKey)) {
            throw new TypeError(`Key "${firstKey}" is reserved and cannot be used for an item.`);
          }
        }
      });
      const item = this.#managedItems.get(firstKey);
      if (item && item instanceof ContextContainer) {
        return item.hasItem(remainingPath);
      }
      return false;
    }

    return this.#managedItems.has(key);
  }

  /**
   * Retrieves the unwrapped value of a managed item.
   * Supports dot-notation path traversal for nested items (e.g., 'player.stats.level').
   * This is an alias for getItem() that updates both container and item access timestamps.
   * @param {string} key - The key of the item to retrieve. Can use dot notation for nested access.
   * @returns {*} The unwrapped value, or undefined if not found.
   */
  getValue(key) {
    const result = this.getItem(key);
    // Update item access timestamp if it exists and recordAccess is enabled
    if (result !== undefined && typeof key === 'string' && !key.includes('.')) {
      const item = this.#managedItems.get(key);
      if (item && item.recordAccess && typeof item._updateAccessTimestamp === 'function') {
        item._updateAccessTimestamp();
      }
    }
    return result;
  }

  /**
   * Retrieves a managed item wrapper (ContextItem or ContextContainer instance).
   * Supports dot-notation path traversal for nested items (e.g., 'player.stats.level').
   * Accessing an item updates the container's lastAccessedAt timestamp if its recordAccess is true.
   * @param {string} key - The key of the item to retrieve. Can use dot notation for nested access.
   * @returns {ContextItem|ContextContainer|undefined} The wrapped item, or undefined if not found.
   */
  getWrappedItem(key) {
    if (typeof key !== 'string') {
      return undefined;
    }

    if (key.includes('.')) {
      const { firstKey, remainingPath } = PathUtils.extractKeyComponents(key, {
        validateFirstKey: (firstKey) => {
          if (this.#isReservedKey(firstKey)) {
            throw new TypeError(`Key "${firstKey}" is reserved and cannot be used for an item.`);
          }
        }
      });

      const item = this.#managedItems.get(firstKey);
      if (item && this.recordAccess) this._updateAccessTimestamp();

      if (!item) return undefined;

      if (item instanceof ContextContainer) {
        return item.getWrappedItem(remainingPath);
      }

      return undefined;
    }

    const item = this.#managedItems.get(key);
    if (item && this.recordAccess) this._updateAccessTimestamp();
    return item;
  }

  /**
   * Removes an item from the container.
   * @param {string} key - The key of the item to remove.
   * @returns {boolean} True if an item was removed, false otherwise.
   */
  removeItem(key) {
    const deleted = this.#managedItems.delete(key);
    if (deleted) this._updateModificationTimestamps();
    return deleted;
  }

  /**
   * Clears all managed items from the container.
   * Updates container's modification timestamps if items were present.
   */
  clearItems() {
    if (this.#managedItems.size > 0) {
      this.#managedItems.clear();
      this._updateModificationTimestamps();
    }
  }

  /**
   * Gets an iterator for the keys of the managed items.
   * Updates container's access timestamp if its recordAccess is true.
   * @returns {IterableIterator<string>}
   */
  keys() {
    if (this.recordAccess) this._updateAccessTimestamp();
    return this.#managedItems.keys();
  }

  /**
   * Gets an iterator for the managed items (ContextItem/ContextContainer instances).
   * Updates container's access timestamp if its recordAccess is true.
   * @returns {IterableIterator<ContextItem|ContextContainer>}
   */
  items() {
    if (this.recordAccess) this._updateAccessTimestamp();
    return this.#managedItems.values();
  }

  /**
   * Gets an iterator for the [key, managedItem] pairs.
   * Updates container's access timestamp if its recordAccess is true.
   * @returns {IterableIterator<[string, ContextItem|ContextContainer]>}
   */
  entries() {
    if (this.recordAccess) this._updateAccessTimestamp();
    return this.#managedItems.entries();
  }

  /**
   * Gets the number of items in the container.
   * Updates container's access timestamp if its recordAccess is true.
   * @type {number}
   */
  get size() {
    if (this.recordAccess) this._updateAccessTimestamp();
    return this.#managedItems.size;
  }

  /**
   * Gets a plain object representation of all managed items, with their unwrapped values.
   * Accessing this property updates the container's lastAccessedAt timestamp if its recordAccess is true.
   * @type {object}
   * @override
   */
  get value() {
    if (this.recordAccess) this._updateAccessTimestamp();
    const result = {};
    for (const [key, managedItem] of this.#managedItems) {
      result[key] = managedItem.value;
    }
    return result;
  }

  /**
   * Sets the container's managed items from a plain object.
   * Clears existing items and populates new ones from the properties of the provided object.
   * Values from the object are wrapped according to the container's default item options.
   * Updates the container's modifiedAt and lastAccessedAt timestamps.
   * @param {object} newItemsObject - An object whose properties will become the new managed items.
   * @throws {TypeError} If newItemsObject is not a non-null object.
   * @override
   */
  set value(newItemsObject) {
    if (typeof newItemsObject !== 'object' || newItemsObject === null) {
      throw new TypeError('ContextContainer value to set must be an object to populate items.');
    }
    this.clearItems();
    for (const [key, val] of Object.entries(newItemsObject)) {
      this.setItem(key, val);
    }
    this._updateModificationTimestamps();
  }

  /**
   * Reinitializes the ContextContainer.
   * Clears all managed items, resets container's metadata and timestamps (via super.reinitialize).
   * Updates default item options and repopulates items if initialItemsOrValue is provided.
   * @param {object|*} [initialItemsOrValue={}] - Same as constructor's initialItemsOrValue.
   * @param {object} [metadata={}] - New metadata for the container itself.
   * @param {object} [options={}] - New options for the container and default options for its items (same structure as constructor options).
   * @override
   */
  reinitialize(
    initialItemsOrValue = {},
    metadata = {},
    options = {}
  ) {
    const containerRecordAccess = options.recordAccess !== undefined ? options.recordAccess : this.recordAccess;
    const containerRecordAccessForMetadata = options.recordAccessForMetadata !== undefined ? options.recordAccessForMetadata : this.recordAccessForMetadata;
    super.reinitialize(undefined, metadata, { recordAccess: containerRecordAccess, recordAccessForMetadata: containerRecordAccessForMetadata });

    this.#defaultItemOptions.wrapPrimitives = options.defaultItemWrapPrimitives !== undefined ? options.defaultItemWrapPrimitives : this.#defaultItemOptions.wrapPrimitives;
    this.#defaultItemOptions.wrapAs = options.defaultItemWrapAs || this.#defaultItemOptions.wrapAs;
    this.#defaultItemOptions.recordAccess = options.defaultItemRecordAccess !== undefined ? options.defaultItemRecordAccess : this.#defaultItemOptions.recordAccess;
    this.#defaultItemOptions.recordAccessForMetadata = options.defaultItemRecordAccessForMetadata !== undefined ? options.defaultItemRecordAccessForMetadata : this.#defaultItemOptions.recordAccessForMetadata;

    this.#managedItems.clear();

    if (initialItemsOrValue !== undefined) {
      if (Validator.isPlainObject(initialItemsOrValue)) {
        for (const [key, value] of Object.entries(initialItemsOrValue)) {
          this.setItem(key, value);
        }
      } else {
        this.setItem('default', initialItemsOrValue);
      }
    }
  }

  /**
   * Clears the container and resets its metadata and timestamps.
   * @override
   */
  clear() {
    this.clearItems();
    super.clear();
  }
}

export { ContextContainer };