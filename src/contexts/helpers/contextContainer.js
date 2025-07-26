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

const RESERVED_KEYS = [
  'value', 'metadata', 'createdAt', 'modifiedAt', 'lastAccessedAt', 'size'
];

/**
 * @class ContextContainer
 * @classdesc Represents a container that manages a collection of named ContextItems or nested ContextContainers.
 * @export
 *
 * Public API:
 * - constructor(initialItemsOrValue, metadata, options) - Creates a new ContextContainer instance
 * - setItem(key, rawValue, itemOptionsOverrides) - Sets or updates an item in the container
 * - hasItem(key) - Checks if an item exists in the container
 * - getItem(key) - Retrieves the unwrapped value of a managed item
 * - getValue(key) - Alias for getItem() that updates access timestamps
 * - getWrappedItem(key) - Retrieves a managed item wrapper (ContextItem or ContextContainer instance)
 * - removeItem(key) - Removes an item from the container
 * - clearItems() - Clears all managed items from the container
 * - keys() - Gets an iterator for the keys of the managed items
 * - items() - Gets an iterator for the managed items
 * - entries() - Gets an iterator for the [key, managedItem] pairs
 * - freeze() - Freezes the container, preventing further modifications
 * - unfreeze() - Unfreezes the container, allowing modifications again
 * - isFrozen() - Checks if the container is currently frozen
 * - setMetadata(metadata) - Sets the metadata for the container
 * - changeAccessRecord(recordAccess, recordAccessForMetadata) - Changes the access recording settings
 * - reinitialize(initialItemsOrValue, metadata, options) - Reinitializes the ContextContainer
 * - clear() - Clears the container and resets its metadata and timestamps
 *
 * @property {object} value - A plain object representation of all managed items, with their unwrapped values. Setting this clears and repopulates items.
 * @property {number} size - The number of items in the container.
 * @property {object} metadata - Metadata for the container itself (delegated to internal ContextItem).
 * @property {Date} createdAt - Creation timestamp (delegated to internal ContextItem).
 * @property {Date} modifiedAt - Last modification timestamp (delegated to internal ContextItem).
 * @property {Date} lastAccessedAt - Last access timestamp (delegated to internal ContextItem).
 * @property {boolean} recordAccess - Whether to record access to the container (delegated to internal ContextItem).
 * @property {boolean} recordAccessForMetadata - Whether to record metadata access (delegated to internal ContextItem).
 * @property {boolean} isContextContainer - Indicates if this instance is a ContextContainer (for duck typing).
 * @private
 * @property {object} #defaultItemOptions - Default options for items added to this container.
 * @property {Map<string, ContextItem|ContextContainer>} #managedItems - Internal storage for managed items.
 * @property {ContextItem} #containerItem - Internal ContextItem for container metadata and timestamps.
 * @property {boolean} #isContextContainer - Indicates if this instance is a ContextContainer (for duck typing).
 *
 * @example
 * // Basic usage
 * const container = new ContextContainer({ player: { name: 'John', level: 5 } });
 * console.log(container.getItem('player.name')); // 'John'
 */
class ContextContainer {
  /**
   * Internal storage for managed items.
   * @type {Map<string, ContextItem|ContextContainer>}
   * @private
   */
  #managedItems;

  /**
   * Default options for items added to this container.
   * @type {object}
   * @private
   */
  #defaultItemOptions;

  /**
   * Internal ContextItem for container metadata and timestamps.
   * @type {ContextItem}
   * @private
   */
  #containerItem;

  /**
   * Indicates if this instance is a ContextContainer (for duck typing).
   * @type {boolean}
   * @private
   */
  #isContextContainer;

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
    this.#isContextContainer = true;
    this.#containerItem = new ContextItem(undefined, metadata, { recordAccess, recordAccessForMetadata }); // Item to store metadata and timestamps
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
   * Gets whether this instance is a ContextContainer (for duck typing).
   * @returns {boolean} Always returns true for ContextContainer instances.
   * @example
   * const container = new ContextContainer();
   * console.log(container.isContextContainer); // true
   */
  get isContextContainer() {
    return this.#isContextContainer;
  }

  // Delegation properties for ContextItem functionality
  /**
   * Gets the metadata object for the container.
   * @returns {object} The metadata object.
   * @example
   * const container = new ContextContainer({}, { gameMode: 'easy' });
   * console.log(container.metadata); // { gameMode: 'easy' }
   */
  get metadata() {
    return this.#containerItem.metadata;
  }

  /**
   * Sets the metadata object for the container.
   * @param {object} value - The new metadata object.
   * @example
   * container.metadata = { gameMode: 'hard', difficulty: 8 };
   */
  set metadata(value) {
    this.#containerItem.metadata = value;
  }

  /**
   * Gets the creation timestamp of the container.
   * @returns {Date} The creation timestamp.
   */
  get createdAt() {
    return this.#containerItem.createdAt;
  }

  /**
   * Gets the last modification timestamp of the container.
   * @returns {Date} The last modification timestamp.
   */
  get modifiedAt() {
    return this.#containerItem.modifiedAt;
  }

  /**
   * Gets the last access timestamp of the container.
   * @returns {Date} The last access timestamp.
   */
  get lastAccessedAt() {
    return this.#containerItem.lastAccessedAt;
  }

  /**
   * Gets whether access to the container is being recorded.
   * @returns {boolean} True if access recording is enabled.
   */
  get recordAccess() {
    return this.#containerItem.recordAccess;
  }

  /**
   * Sets whether access to the container should be recorded.
   * @param {boolean} value - Whether to record access.
   */
  set recordAccess(value) {
    this.#containerItem.recordAccess = value;
  }

  /**
   * Gets whether metadata access is being recorded.
   * @returns {boolean} True if metadata access recording is enabled.
   */
  get recordAccessForMetadata() {
    return this.#containerItem.recordAccessForMetadata;
  }

  /**
   * Sets whether metadata access should be recorded.
   * @param {boolean} value - Whether to record metadata access.
   */
  set recordAccessForMetadata(value) {
    this.#containerItem.recordAccessForMetadata = value;
  }

  /**
   * Updates the container's lastAccessedAt timestamp.
   * @protected
   * @param {Date} [date=null] - The date to set as lastAccessedAt. Defaults to current date/time.
   */
  _updateAccessTimestamp(date = null) {
    if (!date) date = new Date();

    this.#containerItem._updateAccessTimestamp(date);
  }

  /**
   * Updates the container's modifiedAt and lastAccessedAt timestamps.
   * @protected
   * @param {Date} [date=null] - The date to set as modifiedAt and lastAccessedAt. Defaults to current date/time.
   */
  _updateModificationTimestamps(date = null) {
    if (!date) date = new Date();
    this.#containerItem._updateModificationTimestamps(date);
  }

  /**
   * For testing purposes only. Sets the internal container item.
   * @param {ContextItem} item - The ContextItem to set.
   * @protected
   */
  _setContainerItem(item) {
    this.#containerItem = item;
  }

  /**
   * Freezes the container, preventing further modifications.
   * @returns {ContextContainer} The instance for chaining.
   * @example
   * container.freeze();
   * // container.setItem('newKey', 'value'); // Would throw an error
   */
  freeze() {
    return this.#containerItem.freeze();
  }

  /**
   * Unfreezes the container, allowing modifications again.
   * @returns {ContextContainer} The instance for chaining.
   */
  unfreeze() {
    return this.#containerItem.unfreeze();
  }

  /**
   * Checks if the container is currently frozen.
   * @returns {boolean} True if the container is frozen.
   */
  isFrozen() {
    return this.#containerItem.isFrozen();
  }

  /**
   * Sets the metadata for the container.
   * @param {object} metadata - The metadata object to set.
   * @returns {ContextContainer} The instance for chaining.
   * @example
   * container.setMetadata({ version: '1.0', author: 'John' });
   */
  setMetadata(metadata) {
    return this.#containerItem.setMetadata(metadata);
  }

  /**
   * Changes the access recording settings for the container.
   * @param {boolean} recordAccess - Whether to record access to the container.
   * @param {boolean} recordAccessForMetadata - Whether to record metadata access.
   * @returns {ContextContainer} The instance for chaining.
   * @example
   * container.changeAccessRecord(false, true);
   */
  changeAccessRecord(recordAccess, recordAccessForMetadata) {
    return this.#containerItem.changeAccessRecord(recordAccess, recordAccessForMetadata);
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
   * Checks if a key is reserved.
   * @protected
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key is reserved, false otherwise.
   */
  _isReservedKey(key) {
    return this.#isReservedKey(key);
  }

  /**
   * Creates or returns a nested container for a given key.
   * @protected
   * @param {string} key - The key for the nested container.
   * @returns {ContextContainer} The nested container.
   * @throws {TypeError} If the item at key is not a container.
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

    // Use duck typing to check if it's a container (has setItem method)
    if (!container || typeof container.setItem !== 'function') {
      throw new TypeError(`Cannot set nested value on non-container item at key "${key}"`);
    }

    return container;
  }

  /**
   * Gets a managed item by key.
   * @protected
   * @param {string} key - The key of the item to get.
   * @returns {ContextItem|ContextContainer|undefined} The managed item or undefined if not found.
   */
  _getManagedItem(key) {
    return this.#managedItems.get(key);
  }

  /**
   * Sets a managed item by key.
   * @protected
   * @param {string} key - The key of the item to set.
   * @param {ContextItem|ContextContainer} item - The item to set.
   */
  _setManagedItem(key, item) {
    this.#managedItems.set(key, item);
  }

  /**
   * Gets the default item options.
   * @protected
   * @returns {object} The default item options.
   */
  _getDefaultItemOptions() {
    return this.#defaultItemOptions;
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
      additionalReservedKeys: RESERVED_KEYS,
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
   * @example
   * container.setItem('player.stats.level', 5);
   * console.log(container.hasItem('player.stats.level')); // true
   * console.log(container.hasItem('player.stats.mana')); // false
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
   * @param {string} key - The key of the item to retrieve. Can use dot notation for nested access.
   * @returns {*} The unwrapped value, or undefined if not found.
   * @example
   * container.setItem('player.name', 'John');
   * console.log(container.getItem('player.name')); // 'John'
   * console.log(container.getItem('nonexistent')); // undefined
   */
  getItem(key) {
    if (typeof key !== 'string') {
      return undefined;
    }

    // Handle dot notation for nested access
    if (key.includes('.')) {
      return this.#handleNestedAccess(key);
    }

    const item = this.#managedItems.get(key);
    if (item && this.recordAccess) this._updateAccessTimestamp();
    return item ? item.value : undefined;
  }

  /**
   * Retrieves the unwrapped value of a managed item.
   * Supports dot-notation path traversal for nested items (e.g., 'player.stats.level').
   * This is an alias for getItem() that updates both container and item access timestamps.
   * @param {string} key - The key of the item to retrieve. Can use dot notation for nested access.
   * @returns {*} The unwrapped value, or undefined if not found.
   * @example
   * container.setItem('score', 100);
   * console.log(container.getValue('score')); // 100 (and updates access timestamp)
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
   * @example
   * const wrappedItem = container.getWrappedItem('player');
   * console.log(wrappedItem.metadata); // Access metadata of the wrapped item
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
   * @example
   * container.setItem('temp', 'value');
   * console.log(container.removeItem('temp')); // true
   * console.log(container.removeItem('temp')); // false (already removed)
   */
  removeItem(key) {
    const deleted = this.#managedItems.delete(key);
    if (deleted) this._updateModificationTimestamps();
    return deleted;
  }

  /**
   * Clears all managed items from the container.
   * Updates container's modification timestamps if items were present.
   * @example
   * container.clearItems();
   * console.log(container.size); // 0
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
   * @returns {IterableIterator<string>} Iterator for the keys.
   * @example
   * for (const key of container.keys()) {
   *   console.log(key);
   * }
   */
  keys() {
    if (this.recordAccess) this._updateAccessTimestamp();
    return this.#managedItems.keys();
  }

  /**
   * Gets an iterator for the managed items (ContextItem/ContextContainer instances).
   * Updates container's access timestamp if its recordAccess is true.
   * @returns {IterableIterator<ContextItem|ContextContainer>} Iterator for the wrapped items.
   * @example
   * for (const item of container.items()) {
   *   console.log(item.value);
   * }
   */
  items() {
    if (this.recordAccess) this._updateAccessTimestamp();
    return this.#managedItems.values();
  }

  /**
   * Gets an iterator for the [key, managedItem] pairs.
   * Updates container's access timestamp if its recordAccess is true.
   * @returns {IterableIterator<[string, ContextItem|ContextContainer]>} Iterator for key-item pairs.
   * @example
   * for (const [key, item] of container.entries()) {
   *   console.log(`${key}: ${item.value}`);
   * }
   */
  entries() {
    if (this.recordAccess) this._updateAccessTimestamp();
    return this.#managedItems.entries();
  }

  /**
   * Gets the number of items in the container.
   * Updates container's access timestamp if its recordAccess is true.
   * @type {number}
   * @example
   * console.log(container.size); // 3
   */
  get size() {
    if (this.recordAccess) this._updateAccessTimestamp();
    return this.#managedItems.size;
  }

  /**
   * Gets a plain object representation of all managed items, with their unwrapped values.
   * Accessing this property updates the container's lastAccessedAt timestamp if its recordAccess is true.
   * @type {object}
   * @example
   * const allValues = container.value;
   * console.log(allValues); // { player: { name: 'John' }, score: 100 }
   */
  get value() {
    if (this.recordAccess) this._updateAccessTimestamp();
    return this._getValueWithCircularCheck(new Set());
  }

  /**
   * Gets the container's value with circular reference detection.
   * @param {Set} visited - Set of visited container instances to detect circular references.
   * @returns {object} The container's current value as a plain object.
   * @private
   */
  _getValueWithCircularCheck(visited) {
    if (visited.has(this)) {
      // Return a placeholder for circular references
      return { __circular: true, __id: this.containerId || 'unknown' };
    }

    visited.add(this);
    const result = {};

    try {
      for (const [key, managedItem] of this.#managedItems) {
        if (managedItem && typeof managedItem === 'object' && managedItem.constructor === ContextContainer) {
          result[key] = managedItem._getValueWithCircularCheck(visited);
        } else {
          result[key] = managedItem.value;
        }
      }
    } finally {
      visited.delete(this);
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
   * @example
   * container.value = { newPlayer: { name: 'Jane' }, newScore: 200 };
   * console.log(container.getItem('newPlayer.name')); // 'Jane'
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
   * Clears all managed items, resets container's metadata and timestamps.
   * Updates default item options and repopulates items if initialItemsOrValue is provided.
   * @param {object|*} [initialItemsOrValue={}] - Same as constructor's initialItemsOrValue.
   * @param {object} [metadata={}] - New metadata for the container itself.
   * @param {object} [options={}] - New options for the container and default options for its items (same structure as constructor options).
   * @example
   * container.reinitialize(
   *   { resetData: 'value' },
   *   { version: '2.0' },
   *   { defaultItemRecordAccess: false }
   * );
   */
  reinitialize(
    initialItemsOrValue = {},
    metadata = {},
    options = {}
  ) {
    const containerRecordAccess = options.recordAccess !== undefined ? options.recordAccess : this.recordAccess;
    const containerRecordAccessForMetadata = options.recordAccessForMetadata !== undefined ? options.recordAccessForMetadata : this.recordAccessForMetadata;
    this.#containerItem.reinitialize(undefined, metadata, { recordAccess: containerRecordAccess, recordAccessForMetadata: containerRecordAccessForMetadata });

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
   * @example
   * container.clear();
   * console.log(container.size); // 0
   * console.log(container.metadata); // {}
   */
  clear() {
    this.clearItems();
    this.#containerItem.clear();
  }
}

export { ContextContainer };