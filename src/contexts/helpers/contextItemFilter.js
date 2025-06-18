/**
 * @file contextItemFilter.js
 * @description This file contains the ItemFilter class for filtering capabilities in selective context merging.
 * @path /src/contexts/helpers/contextItemFilter.js
 */


/**
 * @class ItemFilter
 * @description Provides filtering capabilities for selective context merging operations.
 * This class offers static methods to create filter functions that can be used with ContextMerger
 * to control which items are included or excluded during merge operations.
 *
 * Available filtering operations:
 * - allowOnly: Include only items matching specific paths
 * - blockOnly: Exclude items matching specific paths
 * - matchPattern: Include items matching a regular expression pattern
 * - custom: Use a custom condition function for filtering
 * - and: Combine multiple filters with AND logic
 * - or: Combine multiple filters with OR logic
 *
 * @example
 * // Allow only specific item paths
 * const allowFilter = ItemFilter.allowOnly(['data.inventory', 'settings.volume']);
 * const result = ContextMerger.merge(source, target, 'mergeNewerWins', { customFilter: allowFilter });
 *
 * @example
 * // Block specific item paths
 * const blockFilter = ItemFilter.blockOnly(['data.temporaryCache', 'state.uiState']);
 * const result = ContextMerger.merge(source, target, 'mergeNewerWins', { customFilter: blockFilter });
 *
 * @example
 * // Match items using regex pattern
 * const patternFilter = ItemFilter.matchPattern(/^data\.player\./);
 * const result = ContextMerger.merge(source, target, 'mergeNewerWins', { customFilter: patternFilter });
 *
 * @example
 * // Custom filtering logic
 * const customFilter = ItemFilter.custom((sourceItem, targetItem, itemPath) => {
 *   return sourceItem?.version > targetItem?.version;
 * });
 *
 * @example
 * // Combine filters with AND logic (all conditions must be true)
 * const combinedFilter = ItemFilter.and(
 *   ItemFilter.allowOnly(['data.player']),
 *   ItemFilter.custom((source, target) => source.priority > target.priority)
 * );
 *
 * @example
 * // Combine filters with OR logic (any condition can be true)
 * const orFilter = ItemFilter.or(
 *   ItemFilter.allowOnly(['settings.important']),
 *   ItemFilter.matchPattern(/\.critical$/)
 * );
 */
class ItemFilter {
  /**
   * Creates a filter that allows only specific item paths.
   * @param {string[]} allowedPaths - Array of item paths to allow (e.g., ['data.inventory', 'settings.volume'])
   * @returns {Function} Filter function for use with ContextMerger
   */
  static allowOnly(allowedPaths) {
    return (sourceItem, targetItem, itemPath) => {
      const isAllowed = allowedPaths.some(path => itemPath.includes(path));
      return isAllowed ? sourceItem : targetItem;
    };
  }

  /**
   * Creates a filter that blocks specific item paths.
   * @param {string[]} blockedPaths - Array of item paths to block
   * @returns {Function} Filter function for use with ContextMerger
   */
  static blockOnly(blockedPaths) {
    return (sourceItem, targetItem, itemPath) => {
      const isBlocked = blockedPaths.some(path =>
        itemPath === path || itemPath.startsWith(`${path}.`) || itemPath.includes(path)
      );
      return isBlocked ? targetItem : sourceItem;
    };
  }

  /**
   * Creates a filter that allows items matching a pattern.
   * @param {RegExp} pattern - Regular expression to match against item paths
   * @returns {Function} Filter function for use with ContextMerger
   */
  static matchPattern(pattern) {
    return (sourceItem, targetItem, itemPath) => {
      return pattern.test(itemPath) ? sourceItem : targetItem;
    };
  }

  /**
   * Creates a filter based on custom condition function.
   * @param {Function} conditionFn - Function that takes (sourceItem, targetItem, itemPath) and returns boolean
   * @returns {Function} Filter function for use with ContextMerger
   */
  static custom(conditionFn) {
    return (sourceItem, targetItem, itemPath) => {
      return conditionFn(sourceItem, targetItem, itemPath) ? sourceItem : targetItem;
    };
  }

  /**
   * Combines multiple filters with AND logic.
   * @param {...Function} filters - Filter functions to combine
   * @returns {Function} Combined filter function
   */
  static and(...filters) {
    return (sourceItem, targetItem, itemPath) => {
      for (const filter of filters) {
        const result = filter(sourceItem, targetItem, itemPath);
        if (result === targetItem) return targetItem; // Short-circuit on first rejection
      }
      return sourceItem;
    };
  }

  /**
   * Combines multiple filters with OR logic.
   * @param {...Function} filters - Filter functions to combine
   * @returns {Function} Combined filter function
   */
  static or(...filters) {
    return (sourceItem, targetItem, itemPath) => {
      for (const filter of filters) {
        const result = filter(sourceItem, targetItem, itemPath);
        if (result === sourceItem) return sourceItem; // Short-circuit on first acceptance
      }
      return targetItem;
    };
  }
}

export { ItemFilter };
export default ItemFilter;