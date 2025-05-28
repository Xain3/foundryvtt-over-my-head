/**
 * @file contextItem.js
 * @description This file contains the ContextItem class for managing a data item with metadata and timestamps.
 * @path /src/context/helpers/contextItem.js
 * @date 23 May 2025
 */

class ContextItem {
  #value;
  #createdAt;
  #modifiedAt;
  #lastAccessedAt;
  #metadata;

  /**
   * Creates an instance of ContextItem.
   * @param {*} initialValue - The initial value of the item.
   * @param {object} [metadata={}] - Optional metadata for the item.
   * @param {object} [options={}] - Options for access recording.
   * @param {boolean} [options.recordAccess=true] - If true, records access to the item's value.
   * @param {boolean} [options.recordAccessForMetadata=false] - If true, records access to the item's metadata.
   */
  constructor(initialValue, metadata = {}, { recordAccess = true, recordAccessForMetadata = false } = {}) {
    const now = new Date();
    this.#value = initialValue;
    this.#metadata = metadata;
    this.#createdAt = now;
    this.#modifiedAt = now;
    this.#lastAccessedAt = now;
    this.recordAccess = recordAccess;
    this.recordAccessForMetadata = recordAccessForMetadata;
  }

  /**
   * @protected
   * Updates the lastAccessedAt timestamp.
   * Typically called internally when the item's value or metadata is accessed.
   */
  _updateAccessTimestamp() {
    this.#lastAccessedAt = new Date();
  }

  /**
   * @protected
   * Updates the modifiedAt and lastAccessedAt timestamps.
   * Typically called internally when the item's value or metadata is changed.
   */
  _updateModificationTimestamps() {
    const now = new Date();
    this.#modifiedAt = now;
    this.#lastAccessedAt = now;
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
   * Sets or updates metadata for the item.
   * @param {object} newMetadata - The metadata object to set or merge.
   * @param {boolean} [merge=true] - If true, merges with existing metadata; otherwise, replaces it.
   */
  setMetadata(newMetadata, merge = true) {
    if (merge) {
      this.#metadata = { ...this.#metadata, ...newMetadata };
    } else {
      this.#metadata = newMetadata;
    }
    this._updateModificationTimestamps();
  }

  /**
   * Changes the behaviour of the item regarding access recording.
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
   * @param {*} initialValue - The new initial value for the context item.
   * @param {object} [metadata={}] - Optional metadata object to associate with the item.
   * @param {object} [options={}] - Configuration options for access recording.
   * @param {boolean} [options.recordAccess=true] - Whether to record access to this item's value.
   * @param {boolean} [options.recordAccessForMetadata=false] - Whether to record access to this item's metadata.
   */
  reinitialize(initialValue, metadata = {}, { recordAccess = true, recordAccessForMetadata = false } = {}) {
    this.#value = initialValue;
    this.#metadata = metadata;
    this.recordAccess = recordAccess;
    this.recordAccessForMetadata = recordAccessForMetadata;

    const now = new Date();
    this.#createdAt = now;
    this.#modifiedAt = now;
    this.#lastAccessedAt = now;
  }

  clear() {
    this.reinitialize(undefined, {});
  }
}

export { ContextItem };
export default ContextItem;