/**
 * @file contextOperations.js
 * @description Bulk and multi-context operations using ContextMerger for operations involving multiple sources/targets.
 * @path src/contexts/helpers/contextOperations.js

 */

import ContextMerger, { ItemFilter } from './contextMerger.js';
import { ContextContainer } from './contextContainer.js';
import { ContextItem } from './contextItem.js';
import Context from '../context.js';
import ContextContainerSync from './contextContainerSync.js';
import ContextItemSync from './contextItemSync.js';
import constants from '../../constants/constants.js';

/**
 * @class ContextOperations
 * @export
 * @description Provides bulk operations and multi-source/target operations for context management.
 * Supports Context, ContextContainer, and ContextItem instances.
 * For single-context operations, use ContextMerger or Context.merge() directly.
 * 
 * ## Public API
 * - `pushItems(source, target, itemPaths, strategy, options)` - Pushes specific items from source to target using path filtering
 * - `pullItems(source, target, itemPaths, strategy, options)` - Pulls specific items from source to target using path filtering  
 * - `pushFromMultipleSources(sources, target, strategy, options)` - Pushes context data from multiple sources to a single target
 * - `pushToMultipleTargets(source, targets, strategy, options)` - Pushes context data from a single source to multiple targets
 * - `pushItemsBulk(sources, targets, itemPaths, strategy, options)` - Pushes multiple specific items from multiple sources to multiple targets
 * - `synchronizeBidirectional(context1, context2, options)` - Synchronizes contexts bidirectionally using conditional merging
 * - `consolidateContexts(sources, target, options)` - Creates a consolidated context from multiple source contexts
 */
class ContextOperations {

  /**
   * @private
   * Determines the appropriate sync method based on object types.
   * @param {Context|ContextContainer|ContextItem} source - The source object.
   * @param {Context|ContextContainer|ContextItem} target - The target object.
   * @param {string} strategy - The strategy to use.
   * @param {object} options - The options to pass.
   * @returns {object} The sync result.
   */
  static #performSync(source, target, strategy, options = {}) {
    // Handle Context instances
    if (source instanceof Context && target instanceof Context) {
      return ContextMerger.merge(source, target, strategy, options);
    }

    // Handle ContextContainer instances
    if (source instanceof ContextContainer && target instanceof ContextContainer) {
      const syncOptions = { ...options };
      let result;

      if (strategy === 'mergeSourcePriority') {
        result = ContextContainerSync.mergeWithPriority(source, target, 'source', syncOptions);
        result.operation = strategy; // Override to match expected strategy name
      } else if (strategy === 'mergeTargetPriority') {
        result = ContextContainerSync.mergeWithPriority(source, target, 'target', syncOptions);
        result.operation = strategy; // Override to match expected strategy name
      } else if (strategy === 'mergeNewerWins') {
        result = ContextContainerSync.mergeNewerWins(source, target, syncOptions);
        result.operation = strategy; // Override to match expected strategy name
      } else {
        // Default to source priority
        result = ContextContainerSync.mergeWithPriority(source, target, 'source', syncOptions);
        result.operation = strategy; // Override to match expected strategy name
      }

      // Ensure consistent format with itemsProcessed
      if (!result.itemsProcessed) {
        const allowOnly = options.allowOnly;
        result.itemsProcessed = allowOnly || (result.changes ? result.changes.map(c => c.path || c.key) : []);
      }

      return result;
    }

    // Handle ContextItem instances
    if (source instanceof ContextItem && target instanceof ContextItem) {
      let result;

      if (strategy === 'mergeSourcePriority') {
        result = ContextItemSync.updateTargetToSource(source, target, options);
        result.operation = strategy; // Override to match expected strategy name
      } else if (strategy === 'mergeNewerWins') {
        result = ContextItemSync.mergeNewerWins(source, target, options);
        result.operation = strategy; // Override to match expected strategy name
      } else {
        result = ContextItemSync.updateTargetToSource(source, target, options);
        result.operation = strategy; // Override to match expected strategy name
      }

      // Ensure consistent format with itemsProcessed
      if (!result.itemsProcessed) {
        result.itemsProcessed = [1]; // Single item as array
      }

      return result;
    }

    // Fallback for mixed types
    throw new Error(`Incompatible object types: ${source.constructor.name} and ${target.constructor.name}`);
  }


  /**
   * Pushes specific items from source to target using path filtering.
   * Convenience method for ContextMerger.merge with allowOnly filter.
   */
  static pushItems(source, target, itemPaths, strategy = 'mergeNewerWins', options = {}) {
    if (!source || !target) {
      throw new Error(constants.contextHelpers.errorMessages.invalidSourceTarget);
    }
    if (!Array.isArray(itemPaths) || itemPaths.length === 0) {
      throw new Error(constants.contextHelpers.errorMessages.emptyItemPaths);
    }

    const result = ContextOperations.#performSync(source, target, strategy, {
      ...options,
      allowOnly: itemPaths
    });

    // Ensure consistent return format
    return {
      success: result.success || false,
      strategy: strategy,
      operation: 'pushItems',
      itemsProcessed: result.itemsProcessed || itemPaths,
      ...result
    };
  }

  /**
   * Pulls specific items from source to target using path filtering.
   * Convenience method for ContextMerger.merge with swapped parameters and allowOnly filter.
   */
  static pullItems(source, target, itemPaths, strategy = 'mergeNewerWins', options = {}) {
    if (!source || !target) {
      throw new Error(constants.contextHelpers.errorMessages.invalidSourceTarget);
    }
    if (!Array.isArray(itemPaths) || itemPaths.length === 0) {
      throw new Error(constants.contextHelpers.errorMessages.emptyItemPaths);
    }

    const result = ContextOperations.#performSync(target, source, strategy, {
      ...options,
      allowOnly: itemPaths
    });

    // Ensure consistent return format
    return {
      success: result.success || false,
      strategy: strategy,
      operation: 'pullItems',
      itemsProcessed: Array.isArray(result.itemsProcessed) 
        ? result.itemsProcessed 
        : itemPaths,
      ...result
    };
  }

  /**
   * Pushes context data from multiple sources to a single target.
   * @param {Context[]} sources - Array of source contexts to push from.
   * @param {Context} target - Target context to push to.
   * @param {string} [strategy='mergeNewerWins'] - Merge strategy to use.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object[]} Array of merge results for each source.
   *
   * @example
   * const results = ContextOperations.pushFromMultipleSources(
   *   [context1, context2, context3],
   *   targetContext,
   *   'mergeSourcePriority'
   * );
   */
  static pushFromMultipleSources(sources, target, strategy = 'mergeNewerWins', options = {}) {
    if (!Array.isArray(sources) || sources.length === 0) {
      throw new Error(constants.contextHelpers.errorMessages.emptySources);
    }
    if (!target) {
      throw new Error(constants.contextHelpers.errorMessages.emptyTarget);
    }

    return sources.map((source, index) => {
      try {
        const result = ContextOperations.#performSync(source, target, strategy, options);
        return {
          sourceIndex: index,
          success: result.success || true,
          strategy: strategy,
          operation: 'pushFromMultipleSources',
          ...result
        };
      } catch (error) {
        return {
          sourceIndex: index,
          success: false,
          strategy: strategy,
          operation: 'pushFromMultipleSources',
          error: error.message
        };
      }
    });
  }

  /**
   * Pushes context data from a single source to multiple targets.
   * @param {Context} source - Source context to push from.
   * @param {Context[]} targets - Array of target contexts to push to.
   * @param {string} [strategy='mergeNewerWins'] - Merge strategy to use.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object[]} Array of merge results for each target.
   *
   * @example
   * const results = ContextOperations.pushToMultipleTargets(
   *   sourceContext,
   *   [target1, target2, target3],
   *   'mergeSourcePriority'
   * );
   */
  static pushToMultipleTargets(source, targets, strategy = 'mergeNewerWins', options = {}) {
    if (!source) {
      throw new Error('Source context must be provided');
    }
    if (!Array.isArray(targets) || targets.length === 0) {
      throw new Error('Targets must be a non-empty array of contexts');
    }

    return targets.map((target, index) => {
      try {
        const result = ContextOperations.#performSync(source, target, strategy, options);
        return {
          targetIndex: index,
          success: result.success || true,
          strategy: strategy,
          operation: 'pushToMultipleTargets',
          ...result
        };
      } catch (error) {
        return {
          targetIndex: index,
          success: false,
          strategy: strategy,
          operation: 'pushToMultipleTargets',
          error: error.message
        };
      }
    });
  }

  /**
   * Pushes multiple specific items from multiple sources to multiple targets.
   * @param {Context[]} sources - Array of source contexts.
   * @param {Context[]} targets - Array of target contexts.
   * @param {string[]} itemPaths - Array of item paths to push.
   * @param {string} [strategy='mergeNewerWins'] - Merge strategy to use.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object[][]} 2D array of merge results [sourceIndex][targetIndex].
   *
   * @example
   * const results = ContextOperations.pushItemsBulk(
   *   [source1, source2],
   *   [target1, target2],
   *   ['data.playerStats', 'settings.volume']
   * );
   */
  static pushItemsBulk(sources, targets, itemPaths, strategy = 'mergeNewerWins', options = {}) {
    if (!Array.isArray(sources) || sources.length === 0) {
      throw new Error(constants.contextHelpers.errorMessages.emptySources);
    }
    if (!Array.isArray(targets) || targets.length === 0) {
      throw new Error(constants.contextHelpers.errorMessages.emptyTargets);
    }
    if (!Array.isArray(itemPaths) || itemPaths.length === 0) {
      throw new Error(constants.contextHelpers.errorMessages.emptyItemPaths);
    }

    return sources.map((source, sourceIndex) => {
      return targets.map((target, targetIndex) => {
        try {
          const result = ContextOperations.#performSync(source, target, strategy, {
            ...options,
            allowOnly: itemPaths
          });
          return {
            sourceIndex,
            targetIndex,
            success: result.success || true,
            strategy: strategy,
            operation: 'pushItemsBulk',
            itemsProcessed: Array.isArray(result.itemsProcessed) 
              ? result.itemsProcessed 
              : itemPaths,
            ...result
          };
        } catch (error) {
          return {
            sourceIndex,
            targetIndex,
            success: false,
            strategy: strategy,
            operation: 'pushItemsBulk',
            error: error.message
          };
        }
      });
    });
  }

  /**
   * Synchronizes contexts bidirectionally using conditional merging.
   * @param {Context} context1 - First context.
   * @param {Context} context2 - Second context.
   * @param {object} [options={}] - Sync options.
   * @param {string} [options.strategy='mergeNewerWins'] - Default merge strategy.
   * @param {string[]} [options.context1Priority=[]] - Paths where context1 takes priority.
   * @param {string[]} [options.context2Priority=[]] - Paths where context2 takes priority.
   * @param {string[]} [options.excludePaths=[]] - Paths to exclude from sync.
   * @returns {object} Sync result with statistics for both directions.
   *
   * @example
   * const result = ContextOperations.synchronizeBidirectional(context1, context2, {
   *   context1Priority: ['data.playerStats'],
   *   context2Priority: ['settings.ui'],
   *   excludePaths: ['data.cache']
   * });
   */
  static synchronizeBidirectional(context1, context2, options = {}) {
    const {
      strategy = 'mergeNewerWins',
      context1Priority = [],
      context2Priority = [],
      excludePaths = [],
      ...mergeOptions
    } = options;

    try {
      // For non-Context instances, use simpler bidirectional sync
      if (!(context1 instanceof Context) || !(context2 instanceof Context)) {
        const result1to2 = ContextOperations.#performSync(context1, context2, strategy, mergeOptions);
        const result2to1 = ContextOperations.#performSync(context2, context1, strategy, mergeOptions);

        return {
          success: (result1to2.success !== false) && (result2to1.success !== false),
          operation: 'synchronizeBidirectional',
          strategy: strategy,
          direction1to2: result1to2,
          direction2to1: result2to1
        };
      }

      // Create filters for each direction (Context instances only)
      const context1ToContext2Filter = ItemFilter.and(
        ItemFilter.blockOnly(excludePaths),
        ItemFilter.or(
          ItemFilter.allowOnly(context1Priority),
          ItemFilter.blockOnly(context2Priority)
        )
      );

      const context2ToContext1Filter = ItemFilter.and(
        ItemFilter.blockOnly(excludePaths),
        ItemFilter.or(
          ItemFilter.allowOnly(context2Priority),
          ItemFilter.blockOnly(context1Priority)
        )
      );

      const result1to2 = ContextMerger.merge(context1, context2, strategy, {
        ...mergeOptions,
        onConflict: context1ToContext2Filter
      });

      const result2to1 = ContextMerger.merge(context2, context1, strategy, {
        ...mergeOptions,
        onConflict: context2ToContext1Filter
      });

      return {
        success: result1to2.success && result2to1.success,
        operation: 'synchronizeBidirectional',
        strategy: strategy,
        direction1to2: result1to2,
        direction2to1: result2to1,
        totalItemsProcessed: result1to2.itemsProcessed + result2to1.itemsProcessed,
        totalConflicts: result1to2.conflicts + result2to1.conflicts
      };
    } catch (error) {
      return {
        success: false,
        operation: 'synchronizeBidirectional',
        strategy: strategy,
        error: error.message
      };
    }
  }

  /**
   * Creates a consolidated context from multiple source contexts.
   * @param {Context[]} sources - Array of source contexts to consolidate.
   * @param {Context} target - Target context to consolidate into.
   * @param {object} [options={}] - Consolidation options.
   * @param {string} [options.strategy='mergeNewerWins'] - Merge strategy to use.
   * @param {object} [options.priorities={}] - Priority mapping { sourceIndex: priority }.
   * @param {string[]} [options.excludePaths=[]] - Paths to exclude from consolidation.
   * @returns {object} Consolidation result with detailed statistics.
   *
   * @example
   * const result = ContextOperations.consolidateContexts(
   *   [context1, context2, context3],
   *   targetContext,
   *   {
   *     priorities: { 0: 'high', 1: 'medium', 2: 'low' },
   *     excludePaths: ['data.temp']
   *   }
   * );
   */
  static consolidateContexts(sources, target, options = {}) {
    const {
      strategy = 'mergeNewerWins',
      priorities = {},
      excludePaths = [],
      ...mergeOptions
    } = options;

    if (!Array.isArray(sources) || sources.length === 0) {
      throw new Error(constants.contextHelpers.errorMessages.emptySources);
    }
    if (!target) {
      throw new Error(constants.contextHelpers.errorMessages.emptyTarget);
    }

    // Sort sources by priority if specified
    const sortedSources = sources
      .map((source, index) => ({ source, index, priority: priorities[index] || 'normal' }))
      .sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'normal': 1, 'low': 0 };
        return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
      });

    const results = [];
    let totalItemsProcessed = 0;
    let totalConflicts = 0;

    for (const { source, index } of sortedSources) {
      try {
        // For Context instances, use filter; for others, use simpler approach
        let syncOptions = { ...mergeOptions };
        if (source instanceof Context && target instanceof Context && excludePaths.length > 0) {
          syncOptions.onConflict = ItemFilter.blockOnly(excludePaths);
        }

        const result = ContextOperations.#performSync(source, target, strategy, syncOptions);

        results.push({
          sourceIndex: index,
          success: result.success !== false,
          strategy: strategy,
          operation: 'consolidateContexts',
          ...result
        });

        totalItemsProcessed += result.itemsProcessed || 0;
        totalConflicts += result.conflicts || 0;
      } catch (error) {
        results.push({
          sourceIndex: index,
          success: false,
          strategy: strategy,
          operation: 'consolidateContexts',
          error: error.message
        });
      }
    }

    return {
      success: results.every(r => r.success),
      operation: 'consolidateContexts',
      strategy: strategy,
      results,
      totalItemsProcessed,
      totalConflicts,
      consolidatedSources: sources.length
    };
  }
}

export default ContextOperations;