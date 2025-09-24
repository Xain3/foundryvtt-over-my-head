/**
 * @file contextSync.js
 * @description This file contains the ContextSync class for synchronizing Context instances, ContextContainers, and ContextItems based on timestamps.
 * @path src/contexts/helpers/contextSync.js

 */

import { ContextItem } from './contextItem.mjs';
import { ContextContainer } from './contextContainer.mjs';
import ContextComparison from './contextComparison.mjs';
import ContextAutoSync from './contextAutoSync.mjs';
import ContextLegacySync from './contextLegacySync.mjs';
import config from '../../config/config.mjs';


/**
 * @class ContextSync
 * @export
 * @description Facade class that provides synchronization capabilities for Context instances and their components.
 * Delegates to specialized sync classes based on object type.
 * For Context instances, delegates to ContextMerger for sophisticated handling.
 * For legacy ContextContainer and ContextItem operations, delegates to ContextLegacySync.
 *
 * ## Public API
 * - `SYNC_OPERATIONS` - Static enum of synchronization operation types
 * - `COMPARISON_RESULTS` - Static enum of comparison results for timestamps
 * - `compare(source, target, options)` - Compares two context objects and determines their temporal relationship
 * - `sync(source, target, operation, options)` - Synchronizes two context objects based on the specified operation
 * - `syncSafe(source, target, operation, options)` - Safely synchronizes two context objects with error handling
 * - `autoSync(source, target, options)` - Automatically determines the best synchronization operation based on timestamp comparison
 * - `validateCompatibility(source, target)` - Validates that objects are compatible for synchronization
 */
class ContextSync {
  /**
   * @enum {string}
   * @description Synchronization operation types.
   */
  static SYNC_OPERATIONS = ContextLegacySync.SYNC_OPERATIONS;

  /**
   * @enum {string}
   * @description Comparison results for timestamps.
   */
  static COMPARISON_RESULTS = ContextComparison.COMPARISON_RESULTS;

  /**
   * @private
   * Gets the type of a context object.
   * @param {object} obj - The object to classify.
   * @returns {string} The type of the object.
   */
  static #getObjectType(obj) {
    if (obj?.isContextObject === true) return 'Context';
    if (obj instanceof ContextContainer) return 'ContextContainer';
    if (obj instanceof ContextItem) return 'ContextItem';
    console.warn(
      'Unknown object type for synchronization:', obj,
      'Expected Context, ContextContainer, or ContextItem but got:', obj.constructor.name,
      'Returning "Unknown" type.'
    );
    return 'Unknown';
  }

  /**
   * Compares two context objects and determines their temporal relationship.
   * @param {object} source - The source context object.
   * @param {object} target - The target context object.
   * @param {object} [options={}] - Comparison options.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to compare.
   * @returns {object} Comparison result with details.
   */
  static compare(source, target, { compareBy = 'modifiedAt' } = {}) {
    return ContextComparison.compare(source, target, { compareBy });
  }

  /**
   * Synchronizes two context objects based on the specified operation.
   * For Context instances, delegates to ContextMerger for sophisticated handling.
   * For ContextContainer and ContextItem instances, delegates to ContextLegacySync.
   * @param {object} source - The source context object.
   * @param {object} target - The target context object.
   * @param {string} operation - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  static async sync(source, target, operation, options = {}) {
    const {
      deepSync = true,
      compareBy = 'modifiedAt',
      preserveMetadata = true,
      autoSync = false
    } = options;

    // Handle 'auto' operation by delegating to ContextAutoSync
    if (operation === 'auto' || autoSync) {
      return ContextAutoSync.autoSync(source, target, { deepSync, compareBy, preserveMetadata });
    }

    // For Context instances, delegate to ContextMerger
    if (source?.isContextObject === true && target?.isContextObject === true) {
      const { default: ContextMerger } = await import('./contextMerger.mjs');
      return ContextMerger.merge(source, target, operation, {
        compareBy,
        preserveMetadata,
        createMissing: deepSync
      });
    }

    // For ContextContainer and ContextItem instances, delegate to ContextLegacySync
    if (
      (source instanceof ContextContainer || source instanceof ContextItem) &&
      (target instanceof ContextContainer || target instanceof ContextItem)
    ) {
      return ContextLegacySync.performLegacySync(source, target, operation, options);
    }

    throw new Error(config.constants.context.helpers.errorMessages.unsupportedObjectTypes);
  }

  /**
   * Safely synchronizes two context objects with error handling.
   * @param {object} source - The source context object.
   * @param {object} target - The target context object.
   * @param {string} operation - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with error handling.
   */
  static async syncSafe(source, target, operation, options = {}) {
    const warnings = [];

    try {
      // Handle null/undefined inputs
      if (!source && !target) {
        return {
          success: true,
          operation,
          warnings: ['Both source and target are null/undefined'],
          changes: []
        };
      }

      if (!source) {
        warnings.push('Source is null/undefined');
        return {
          success: true,
          operation,
          warnings,
          changes: []
        };
      }

      if (!target) {
        warnings.push('Target is null/undefined');
        return {
          success: true,
          operation,
          warnings,
          changes: []
        };
      }

      // Validate compatibility
      if (!ContextSync.validateCompatibility(source, target)) {
        return {
          success: false,
          operation,
          error: config.constants.context.helpers.errorMessages.incompatibleTypes,
          warnings
        };
      }

      // Validate operation
      if (!Object.values(ContextSync.SYNC_OPERATIONS).includes(operation)) {
        return {
          success: false,
          operation,
          error: `Invalid sync operation: ${operation}`,
          warnings
        };
      }

      const result = await ContextSync.sync(source, target, operation, options);
      if (warnings.length > 0) {
        result.warnings = [...(result.warnings || []), ...warnings];
      }
      return result;

    } catch (error) {
      return {
        success: false,
        operation,
        error: error.message,
        warnings
      };
    }
  }

  /**
   * Automatically determines the best synchronization operation based on timestamp comparison.
   * Delegates to ContextAutoSync for implementation.
   * @param {object} source - The source context object.
   * @param {object} target - The target context object.
   * @param {object} [options={}] - Options for automatic sync determination.
   * @returns {object} Automatic synchronization result.
   */
  static async autoSync(source, target, options = {}) {
    return ContextAutoSync.autoSync(source, target, options);
  }

  /**
   * Validates that objects are compatible for synchronization.
   * @param {object} source - The source object.
   * @param {object} target - The target object.
   * @returns {boolean} True if objects are compatible for sync.
   */
  static validateCompatibility(source, target) {
    if (!source || !target) return false;

    const sourceType = ContextSync.#getObjectType(source);
    const targetType = ContextSync.#getObjectType(target);

    // Context instances can sync with other Context instances
    if (sourceType === 'Context' && targetType === 'Context') return true;

    // ContextContainer and ContextItem instances use legacy sync
    if (
      (sourceType === 'ContextContainer' || sourceType === 'ContextItem') &&
      (targetType === 'ContextContainer' || targetType === 'ContextItem')
    ) {
      return ContextLegacySync.validateCompatibility(source, target);
    }

    return false;
  }
}

export { ContextSync };
export default ContextSync;