/**
 * @file contextContainer.js
 * @description This file contains the ContextContainer class for managing a collection of ContextItems/ContextContainers.
 * @path /src/context/helpers/contextContainer.js
 * @date 23 May 2025
 */

import { ContextItem } from './contextItem.js';
import { ContextValueWrapper } from './contextValueWrapper.js';

/**
 * @class ContextContainer
 * @classdesc Represents a container that manages a collection of named ContextItems or nested ContextContainers.
 *            It extends ContextItem, inheriting its own metadata and timestamp features.
 * @extends ContextItem
 * @property {object} value - A plain object representation of all managed items, with their unwrapped values. Setting this clears and repopulates items.
 * @property {number} size - The number of items in the container.
 * @property {object} #defaultItemOptions - Default options for items added to this container.
 * @property {Map<string, ContextItem|ContextContainer>} #managedItems - Internal storage for managed items.
 *
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
    super(undefined, metadata, { recordAccess, recordAccessForMetadata }); // Container's own value is undefined initially

    this.#managedItems = new Map();
    this.#defaultItemOptions = {
      wrapPrimitives: defaultItemWrapPrimitives,
      wrapAs: defaultItemWrapAs,
      recordAccess: defaultItemRecordAccess,
      recordAccessForMetadata: defaultItemRecordAccessForMetadata,
    };

    if (initialItemsOrValue !== undefined) {
      if (this.#isPlainObject(initialItemsOrValue)) {
        for (const [key, value] of Object.entries(initialItemsOrValue)) {
          this.setItem(key, value); // Uses default item options from constructor
        }
      } else {
        // Not a plain object, treat as a single value for a 'default' item
        this.setItem('default', initialItemsOrValue);
      }
    }
  }

  /**
   * @private
   * Checks if a value is a plain object (not an array, ContextItem, ContextContainer, or null).
   * @param {*} value - The value to check.
   * @returns {boolean} True if the value is a plain object, false otherwise.
   */
  #isPlainObject(value) {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      !(value instanceof ContextItem) &&
      !(value instanceof ContextContainer)
    );
  }


  /**
   * @private
   * Checks if a key is reserved (e.g., a property/method of ContextItem or ContextContainer).
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key is reserved, false otherwise.
   */
  #isReservedKey(key) {
    // Check own properties and prototype chain of ContextContainer and ContextItem
    let currentProto = Object.getPrototypeOf(this);
    const reservedKeys = new Set(['value', 'metadata', 'createdAt', 'modifiedAt', 'lastAccessedAt', 'size']); // Add known properties

    // Add methods from ContextItem and ContextContainer prototypes
    Object.getOwnPropertyNames(ContextItem.prototype).forEach(p => reservedKeys.add(p));
    Object.getOwnPropertyNames(ContextContainer.prototype).forEach(p => reservedKeys.add(p));

    if (reservedKeys.has(key)) return true;

    // Check if key exists on instance or its prototypes (less common for string keys but safer)
    // This check might be too broad if we only care about direct method/property name conflicts.
    // For now, focusing on known important names.
    // if (key in this) return true; // This would catch #defaultItemOptions if it wasn't private

    return false;
  }

  /**
   * Sets or updates an item in the container.
   * @param {string} key - The key for the item. Must be a non-empty string.
   * @param {*} rawValue - The raw value of the item.
   * @param {object} [itemOptionsOverrides={}] - Options to override container's default item options for this specific item.
   *                                          Includes `wrapPrimitives`, `wrapAs`, `recordAccess`, `recordAccessForMetadata`, `metadata`.
   * @returns {ContextContainer} The instance of the container for chaining.
   * @throws {TypeError} If the key is invalid, reserved, or if wrapping fails.
   */
  setItem(key, rawValue, itemOptionsOverrides = {}) {
    if (typeof key !== 'string' || key.length === 0) {
      throw new TypeError('Item key must be a non-empty string.');
    }
    if (this.#isReservedKey(key)) {
      throw new TypeError(`Key "${key}" is reserved and cannot be used for an item.`);
    }

    const itemSpecificMetadata = itemOptionsOverrides.metadata || {};
    const itemOptionsForWrapper = {
      ...this.#defaultItemOptions, // Start with container defaults
      ...itemOptionsOverrides, // Override with per-item specifics
      metadata: itemSpecificMetadata, // Ensure metadata is correctly passed
    };
    // Ensure wrapAs is present, defaulting from container if not in overrides
    itemOptionsForWrapper.wrapAs = itemOptionsForWrapper.wrapAs || this.#defaultItemOptions.wrapAs;


    const wrappedValue = ContextValueWrapper.wrap(rawValue, itemOptionsForWrapper);
    this.#managedItems.set(key, wrappedValue);
    this._updateModificationTimestamps(); // Container itself was modified
    return this;
  }

  /**
   * Retrieves a managed item (ContextItem or ContextContainer instance).
   * Accessing an item updates the container's lastAccessedAt timestamp if its recordAccess is true.
   * @param {string} key - The key of the item to retrieve.
   * @returns {ContextItem|ContextContainer|undefined} The managed item, or undefined if not found.
   */
  getItem(key) {
    const item = this.#managedItems.get(key);
    if (item && this.recordAccess) this._updateAccessTimestamp();
    return item;
  }

  /**
   * Retrieves the unwrapped value of a managed item.
   * Accessing an item updates the container's lastAccessedAt timestamp (via getItem).
   * Accessing the item's .value property updates the item's own lastAccessedAt timestamp.
   * @param {string} key - The key of the item.
   * @returns {*} The unwrapped value, or undefined if item not found.
   */
  getValue(key) {
    const item = this.getItem(key);
    return item ? item.value : undefined;
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
   * Checks if an item exists in the container.
   * Updates container's access timestamp if its recordAccess is true.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the item exists, false otherwise.
   */
  hasItem(key) {
    if (this.recordAccess) this._updateAccessTimestamp();
    return this.#managedItems.has(key);
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
      result[key] = managedItem.value; // This access updates the managedItem's timestamp
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
    this.clearItems(); // Clears and updates timestamps if items existed
    for (const [key, val] of Object.entries(newItemsObject)) {
      this.setItem(key, val); // Uses default item options; setItem updates timestamps
    }
    // If newItemsObject was empty, and container was already empty, no timestamp update needed beyond initial state.
    // If items were added/cleared, timestamps are handled by clearItems/setItem.
    // Explicitly ensure modification is marked if the object was different, even if resulting size is same.
    // The calls to clearItems and setItem should cover this.
    // If newItemsObject is empty and container was empty, no modification.
    // If newItemsObject is empty and container was not, clearItems handles it.
    // If newItemsObject has items, setItem handles it.
    // One final update to ensure the "set value" operation itself is marked if there was any change.
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

    this.#managedItems.clear(); // Does not update timestamps itself

    if (initialItemsOrValue !== undefined) {
      if (typeof initialItemsOrValue === 'object' && initialItemsOrValue !== null && !Array.isArray(initialItemsOrValue) && !(initialItemsOrValue instanceof ContextItem) && !(initialItemsOrValue instanceof ContextContainer)) {
        for (const [key, value] of Object.entries(initialItemsOrValue)) {
          this.setItem(key, value); // setItem updates modification timestamps
        }
      } else {
        this.setItem('default', initialItemsOrValue); // setItem updates modification timestamps
      }
    }
    // Timestamps are reset by super.reinitialize. If items are added, setItem updates them again.
    // If no items are added, timestamps reflect the reinitialization time.
  }

  /**
   * Clears the container and resets its metadata and timestamps.
   * @override
   */
  clear() {
    this.clearItems(); // Clears items and updates timestamps
    super.clear(); // Resets metadata and timestamps
  }
}

export { ContextContainer };
export default ContextContainer;