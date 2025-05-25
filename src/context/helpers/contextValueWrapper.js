/**
 * @file contextValueWrapper.js
 * @description This file contains the ContextValueWrapper class for wrapping values into ContextItem or ContextContainer instances.
 * @path /src/context/helpers/contextValueWrapper.js
 * @date 23 May 2025
 */

import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';

/**
 * @class ContextValueWrapper
 * @classdesc Provides static methods to wrap raw values into ContextItem or ContextContainer instances.
 */
class ContextValueWrapper {
  /**
   * Validates the wrapAs option.
   * @private
   * @param {string} wrapAs - The wrapAs option to validate.
   * @throws {TypeError} If wrapAs is not valid.
   */
  static _validateWrapOptions(wrapAs) {
    if (wrapAs !== "ContextItem" && wrapAs !== "ContextContainer") {
      throw new TypeError(`Invalid value for wrapAs: ${wrapAs}. Must be "ContextItem" or "ContextContainer".`);
    }
  }

  /**
   * Handles values that are already ContextItem or ContextContainer instances.
   * @private
   * @param {*} rawValue - The raw value to check.
   * @returns {ContextItem|ContextContainer|null} The existing instance or null if not applicable.
   */
  static _handleExistingInstance(rawValue) {
    if (rawValue instanceof ContextItem || rawValue instanceof ContextContainer) {
      // If it's already a context instance, return it.
      // Future enhancement: could update its options if new ones are provided and different.
      return rawValue;
    }
    return null;
  }

  /**
   * Handles primitive values when wrapPrimitives is false.
   * @private
   * @param {*} rawValue - The raw value to check.
   * @param {boolean} wrapPrimitives - Whether primitives should be wrapped.
   * @returns {*} The raw value if it should be returned as-is, or undefined if wrapping should continue.
   * @throws {TypeError} If wrapping is disabled and conditions are not met.
   */
  static _handlePrimitiveValue(rawValue, wrapPrimitives) {
    if (!wrapPrimitives) {
      const type = typeof rawValue;
      if (type !== 'object' && type !== 'function' || rawValue === null) {
        return rawValue; // Return primitive as-is
      }
      throw new TypeError('rawValue must be an instance of ContextItem or ContextContainer if wrapPrimitives is false and rawValue is not a primitive.');
    }
    return undefined; // Continue with wrapping
  }

  /**
   * Creates a new ContextItem or ContextContainer instance.
   * @private
   * @param {*} rawValue - The raw value to wrap.
   * @param {string} wrapAs - The type of instance to create.
   * @param {object} metadata - Metadata for the new instance.
   * @param {object} newInstanceOptions - Options for ContextItem creation.
   * @param {object} containerOptions - Options for ContextContainer creation.
   * @returns {ContextItem|ContextContainer} The new instance.
   */
  static _createNewInstance(rawValue, wrapAs, metadata, newInstanceOptions, containerOptions) {
    if (wrapAs === "ContextItem") {
      return new ContextItem(rawValue, metadata, newInstanceOptions);
    } else {
      return new ContextContainer(rawValue, metadata, containerOptions);
    }
  }

  /**
   * Wraps a given value into a single ContextItem or ContextContainer based on the provided options.
   * The wrapped instance will hold the `rawValue`.
   *
   * @param {*} rawValue - The raw value to be wrapped.
   * @param {object} options - Wrapping options.
   * @param {boolean} [options.wrapPrimitives=true] - If false and rawValue is not a ContextItem/Container, an error is thrown.
   * @param {"ContextItem"|"ContextContainer"} [options.wrapAs="ContextItem"] - Specifies whether to wrap the rawValue in a new ContextItem or a new ContextContainer.
   * @param {boolean} [options.recordAccess=true] - `recordAccess` option for the new ContextItem/Container.
   * @param {boolean} [options.recordAccessForMetadata=false] - `recordAccessForMetadata` option for the new ContextItem/Container.
   * @param {object} [options.metadata={}] - Metadata for the new ContextItem/Container.
   * @param {object} [options.containerOptions={}] - If `options.wrapAs` is "ContextContainer", these are options for the new ContextContainer instance itself and its items.
   * @param {boolean} [options.containerOptions.recordAccess=true] - `recordAccess` for the new container itself.
   * @param {boolean} [options.containerOptions.recordAccessForMetadata=false] - `recordAccessForMetadata` for the new container itself.
   * @param {boolean} [options.containerOptions.defaultItemWrapPrimitives=true] - Default `wrapPrimitives` for items within the new container.
   * @param {"ContextItem"|"ContextContainer"} [options.containerOptions.defaultItemWrapAs="ContextItem"] - Default `wrapAs` for items within the new container.
   * @param {boolean} [options.containerOptions.defaultItemRecordAccess=true] - Default `recordAccess` for items within the new container.
   * @param {boolean} [options.containerOptions.defaultItemRecordAccessForMetadata=false] - Default `recordAccessForMetadata` for items within the new container.
   * @returns {ContextItem|ContextContainer} The wrapped value as a single ContextItem or ContextContainer instance.
   * @throws {TypeError} If wrapping is disabled and rawValue is not a ContextItem/Container, or if `options.wrapAs` is invalid.
   */
  static wrap(rawValue, {
    wrapPrimitives = true,
    wrapAs = "ContextItem",
    recordAccess = true,
    recordAccessForMetadata = false,
    metadata = {},
    containerOptions = {
      recordAccess: true,
      recordAccessForMetadata: false,
      defaultItemWrapPrimitives: true,
      defaultItemWrapAs: "ContextItem",
      defaultItemRecordAccess: true,
      defaultItemRecordAccessForMetadata: false,
    }
  } = {}) {
    this._validateWrapOptions(wrapAs);

    const existingInstance = this._handleExistingInstance(rawValue);
    if (existingInstance) return existingInstance;

    const primitiveResult = this._handlePrimitiveValue(rawValue, wrapPrimitives);
    if (primitiveResult !== undefined) return primitiveResult;

    const newInstanceOptions = { recordAccess, recordAccessForMetadata };
    return this._createNewInstance(rawValue, wrapAs, metadata, newInstanceOptions, containerOptions);
  }
}

export { ContextValueWrapper };