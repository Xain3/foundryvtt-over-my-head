/**
 * @file contextItem.mjs
 * @description Represents a data item with value, metadata, and timestamps, supporting immutability patterns.
 * @path src/contexts/helpers/contextItem.mjs

 */

import { Validator } from "@utils/static/validator.mjs";

/**
 * @class ContextItem
 * @description Represents a data item with value, metadata, and timestamps, supporting immutability patterns.
 * @export
 *
 * Public API:
 * - constructor(value, metadata, options) - Creates a new ContextItem with value, metadata, and options
 * - get value() - Gets the current value, optionally recording access
 * - set value(newValue) - Sets a new value and updates timestamps
 * - get createdAt() - Gets the creation timestamp
 * - get modifiedAt() - Gets the last modification timestamp
 * - get lastAccessedAt() - Gets the last access timestamp
 * - get metadata() - Gets the metadata object, optionally recording access
 * - setMetadata(metadata, merge) - Sets or merges metadata and updates timestamps
 * - freeze() - Makes the item immutable
 * - unfreeze() - Makes the item mutable again
 * - isFrozen() - Checks if the item is frozen
 * - changeAccessRecord(options) - Changes access recording settings
 * - reinitialize(value, metadata, options) - Reinitializes the item with new data
 * - clear() - Clears the item and resets to default state
 * - get isContextItem() - Returns true for duck typing identification
 *
 * @property {*} #value - The private value stored in the item
 * @property {Date} #createdAt - The private creation timestamp
 * @property {Date} #modifiedAt - The private last modification timestamp
 * @property {Date} #lastAccessedAt - The private last access timestamp
 * @property {object} #metadata - The private metadata object
 * @property {boolean} #frozen - The private frozen state flag
 * @property {boolean} recordAccess - Whether to record access to the item's value
 * @property {boolean} recordAccessForMetadata - Whether to record access to the item's metadata
 * @property {boolean} #isContextItem - The private flag indicating this is a ContextItem instance
 */
class ContextItem {
  #value;
  #createdAt;
  #modifiedAt;
  #lastAccessedAt;
  #metadata;
  #frozen;
  #isContextItem;

  /**
   * @protected
   * Updates the lastAccessedAt timestamp.
   * Typically called internally when the item's value or metadata is accessed.
   * @param {Date} [date=null] - The date to set as lastAccessedAt. Defaults to current date/time.
   */
  _updateAccessTimestamp(date = null) {
    if (date === null) date = new Date();
    // Validate the date before setting it
    if (!(date instanceof Date) || (date instanceof Date && isNaN(date.getTime()))) {
      // Let the validator throw the appropriate error
      Validator.validateDate(date);
    }
    this.#lastAccessedAt = date;
  }

  /**
   * @protected
   * Updates the modifiedAt and lastAccessedAt timestamps.
   * Typically called internally when the item's value or metadata is changed.
   * @param {Date} [date=null] - The date to set as modifiedAt and lastAccessedAt. Defaults to current date/time.
   */
  _updateModificationTimestamps(date = null) {
    if (date === null) date = new Date();
    // Validate the date before setting it
    if (!(date instanceof Date) || (date instanceof Date && isNaN(date.getTime()))) {
      // Let the validator throw the appropriate error
      Validator.validateDate(date);
    }
    this.#modifiedAt = date;
    this.#lastAccessedAt = date;
  }

  /**
   * Creates an instance of ContextItem.
   * @param {*} initialValue - The initial value of the item.
   * @param {object} [metadata={}] - Optional metadata for the item.
   * @param {object} [options={}] - Options for the item behavior.
   * @param {boolean} [options.frozen=false] - If true, the item starts in a frozen state and cannot be modified.
   * @param {boolean} [options.recordAccess=true] - If true, records access to the item's value.
   * @param {boolean} [options.recordAccessForMetadata=false] - If true, records access to the item's metadata.
   */
  constructor(initialValue, metadata = {}, {frozen = false, recordAccess = true, recordAccessForMetadata = false } = {}) {
    this.#isContextItem = true;
    const now = new Date();
    this.#value = initialValue;
    this.#metadata = metadata;
    this.#createdAt = now;
    this.#modifiedAt = now;
    this.#lastAccessedAt = now;
    this.#frozen = frozen;
    this.recordAccess = recordAccess;
    this.recordAccessForMetadata = recordAccessForMetadata;
  }

  /**
   * Gets the value of the item.
   * Updates the lastAccessedAt timestamp if recordAccess is true.
   * @type {*}
   */
  get value() {
    if (this.recordAccess) this._updateAccessTimestamp();
    return this.#value;
  }

  /**
   * Sets the value of the item.
   * Updates the modifiedAt and lastAccessedAt timestamps.
   * @param {*} newValue - The new value to set.
   */
  set value(newValue) {
    if (this.#frozen) {
      throw new Error("Cannot modify a frozen ContextItem.");
    }
    this.#value = newValue;
    this._updateModificationTimestamps();
  }

  /**
   * Gets the creation timestamp of the item.
   * @type {Date}
   */
  get createdAt() {
    return this.#createdAt;
  }

  /**
   * Gets the last modified timestamp of the item.
   * @type {Date}
   */
  get modifiedAt() {
    return this.#modifiedAt;
  }

  /**
   * Gets the last accessed timestamp of the item.
   * @type {Date}
   */
  get lastAccessedAt() {
    return this.#lastAccessedAt;
  }

  /**
   * Gets the metadata associated with the item.
   * Updates the lastAccessedAt timestamp if recordAccessForMetadata is true.
   * @type {object}
   */
  get metadata() {
    if (this.recordAccessForMetadata) this._updateAccessTimestamp();
    return this.#metadata;
  }

  /**
   * Gets whether this instance is a ContextItem (for duck typing).
   * @returns {boolean} Always returns true for ContextItem instances.
   * @example
   * const item = new ContextItem('value');
   * console.log(item.isContextItem); // true
   */
  get isContextItem() {
    return this.#isContextItem;
  }

  /**
   * Sets or updates metadata for the item.
   * Updates the modifiedAt and lastAccessedAt timestamps.
   * @param {object} newMetadata - The metadata object to set or merge.
   * @param {boolean} [merge=true] - If true, merges with existing metadata; otherwise, replaces it.
   * @throws {Error} If the item is frozen and cannot be modified.
   */
  setMetadata(newMetadata, merge = true) {
    if (this.#frozen) {
      throw new Error("Cannot modify metadata of a frozen ContextItem.");
    }
    if (merge) {
      this.#metadata = { ...this.#metadata, ...newMetadata };
    } else {
      this.#metadata = newMetadata;
    }
    this._updateModificationTimestamps();
  }

  /**
   * Freezes the item, preventing any further modifications to its value or metadata.
   * Once frozen, the item cannot be unfrozen unless explicitly calling unfreeze().
   */
  freeze() {
    this.#frozen = true;
  }

  /**
   * Unfreezes the item, allowing modifications to its value and metadata.
   */
  unfreeze() {
    this.#frozen = false;
  }

  /**
   * Checks if the item is currently frozen.
   * @returns {boolean} True if the item is frozen, false otherwise.
   */
  isFrozen() {
    return this.#frozen;
  }

  /**
   * Changes the behavior of the item regarding access recording.
   * @param {object} [options={}] - Options for access recording.
   * @param {boolean} [options.recordAccess=true] - If true, records access to the item's value.
   * @param {boolean} [options.recordAccessForMetadata=false] - If true, records access to the item's metadata.
   */
  changeAccessRecord({ recordAccess = true, recordAccessForMetadata = false } = {}) {
    this.recordAccess = recordAccess;
    this.recordAccessForMetadata = recordAccessForMetadata;
  }

  /**
   * Reinitializes the context item with new values and resets all timestamps and metadata.
   * Resets the frozen state and access recording options.
   * @param {*} initialValue - The new initial value for the context item.
   * @param {object} [metadata={}] - Optional metadata object to associate with the item.
   * @param {object} [options={}] - Configuration options for the reinitialized item.
   * @param {boolean} [options.frozen=false] - Whether the reinitialized item should start in a frozen state.
   * @param {boolean} [options.recordAccess=true] - Whether to record access to this item's value.
   * @param {boolean} [options.recordAccessForMetadata=false] - Whether to record access to this item's metadata.
   */
  reinitialize(initialValue, metadata = {}, { frozen = false, recordAccess = true, recordAccessForMetadata = false } = {}) {
    this.#value = initialValue;
    this.#metadata = metadata;
    this.#frozen = frozen;
    this.recordAccess = recordAccess;
    this.recordAccessForMetadata = recordAccessForMetadata;

    const now = new Date();
    this.#createdAt = now;
    this.#modifiedAt = now;
    this.#lastAccessedAt = now;
  }

  /**
   * Clears the item by reinitializing it with undefined value and empty metadata.
   * Resets all timestamps and unfreezes the item.
   */
  clear() {
    this.reinitialize(undefined, {});
  }
}

export { ContextItem };
export default ContextItem;