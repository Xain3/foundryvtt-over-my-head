/**
 * @file contextOperations.js
 * @description Enhanced context operations using ContextMerger with support for bulk operations and multiple sources/targets.
 * @path /src/contexts/helpers/contextOperations.js
 */

import ContextMerger, { ItemFilter } from './contextMerger.js';

/**
 * @class ContextOperations
 * @description Provides high-level operations for context management including bulk operations,
 * multi-source/target operations, and sophisticated merge strategies using ContextMerger.
 */
class ContextOperations {

  /**
   * Pushes context data from source to target using ContextMerger.
   * @param {Context} source - Source context to push from.
   * @param {Context} target - Target context to push to.
   * @param {string} [strategy='mergeNewerWins'] - Merge strategy to use.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object} Merge result with statistics and changes.
   *
   * @example
   * const result = ContextOperations.pushContext(sourceContext, targetContext, 'mergeSourcePriority');
   */
  static pushContext(source, target, strategy = 'mergeNewerWins', options = {}) {
    if (!source || !target) {
      throw new Error('Source and target contexts must be provided');
    }

    return ContextMerger.merge(source, target, strategy, options);
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
      throw new Error('Sources must be a non-empty array of contexts');
    }
    if (!target) {
      throw new Error('Target context must be provided');
    }

    return sources.map((source, index) => {
      try {
        return {
          sourceIndex: index,
          success: true,
          result: ContextMerger.merge(source, target, strategy, options)
        };
      } catch (error) {
        return {
          sourceIndex: index,
          success: false,
          error: error.message,
          result: null
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
        return {
          targetIndex: index,
          success: true,
          result: ContextMerger.merge(source, target, strategy, options)
        };
      } catch (error) {
        return {
          targetIndex: index,
          success: false,
          error: error.message,
          result: null
        };
      }
    });
  }

  /**
   * Pushes specific items from source to target using path filtering.
   * @param {Context} source - Source context to push from.
   * @param {Context} target - Target context to push to.
   * @param {string[]} itemPaths - Array of item paths to push.
   * @param {string} [strategy='mergeNewerWins'] - Merge strategy to use.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object} Merge result with statistics and changes.
   *
   * @example
   * const result = ContextOperations.pushItems(
   *   sourceContext,
   *   targetContext,
   *   ['data.playerStats', 'settings.volume']
   * );
   */
  static pushItems(source, target, itemPaths, strategy = 'mergeNewerWins', options = {}) {
    if (!source || !target) {
      throw new Error('Source and target contexts must be provided');
    }
    if (!Array.isArray(itemPaths) || itemPaths.length === 0) {
      throw new Error('Item paths must be a non-empty array');
    }

    return ContextMerger.mergeOnly(source, target, itemPaths, strategy, options);
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
      throw new Error('Sources must be a non-empty array of contexts');
    }
    if (!Array.isArray(targets) || targets.length === 0) {
      throw new Error('Targets must be a non-empty array of contexts');
    }
    if (!Array.isArray(itemPaths) || itemPaths.length === 0) {
      throw new Error('Item paths must be a non-empty array');
    }

    return sources.map((source, sourceIndex) => {
      return targets.map((target, targetIndex) => {
        try {
          return {
            sourceIndex,
            targetIndex,
            success: true,
            result: ContextMerger.mergeOnly(source, target, itemPaths, strategy, options)
          };
        } catch (error) {
          return {
            sourceIndex,
            targetIndex,
            success: false,
            error: error.message,
            result: null
          };
        }
      });
    });
  }

  /**
   * Pulls context data from source to target (reverse push).
   * @param {Context} source - Source context to pull from.
   * @param {Context} target - Target context to pull to.
   * @param {string} [strategy='mergeNewerWins'] - Merge strategy to use.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object} Merge result with statistics and changes.
   *
   * @example
   * const result = ContextOperations.pullContext(sourceContext, targetContext, 'mergeTargetPriority');
   */
  static pullContext(source, target, strategy = 'mergeNewerWins', options = {}) {
    if (!source || !target) {
      throw new Error('Source and target contexts must be provided');
    }

    // Pull is just a push with source and target swapped
    return ContextMerger.merge(target, source, strategy, options);
  }

  /**
   * Pulls specific items from source to target using path filtering.
   * @param {Context} source - Source context to pull from.
   * @param {Context} target - Target context to pull to.
   * @param {string[]} itemPaths - Array of item paths to pull.
   * @param {string} [strategy='mergeNewerWins'] - Merge strategy to use.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object} Merge result with statistics and changes.
   *
   * @example
   * const result = ContextOperations.pullItems(
   *   sourceContext,
   *   targetContext,
   *   ['data.inventory', 'settings.preferences']
   * );
   */
  static pullItems(source, target, itemPaths, strategy = 'mergeNewerWins', options = {}) {
    if (!source || !target) {
      throw new Error('Source and target contexts must be provided');
    }
    if (!Array.isArray(itemPaths) || itemPaths.length === 0) {
      throw new Error('Item paths must be a non-empty array');
    }

    // Pull is just mergeOnly with source and target swapped
    return ContextMerger.mergeOnly(target, source, itemPaths, strategy, options);
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

    // Create filters for each direction
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
      context1ToContext2: result1to2,
      context2ToContext1: result2to1,
      totalItemsProcessed: result1to2.itemsProcessed + result2to1.itemsProcessed,
      totalConflicts: result1to2.conflicts + result2to1.conflicts
    };
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
      throw new Error('Sources must be a non-empty array of contexts');
    }
    if (!target) {
      throw new Error('Target context must be provided');
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
        const filter = excludePaths.length > 0 ? ItemFilter.blockOnly(excludePaths) : undefined;

        const result = ContextMerger.merge(source, target, strategy, {
          ...mergeOptions,
          onConflict: filter
        });

        results.push({
          sourceIndex: index,
          success: true,
          result
        });

        totalItemsProcessed += result.itemsProcessed;
        totalConflicts += result.conflicts;
      } catch (error) {
        results.push({
          sourceIndex: index,
          success: false,
          error: error.message,
          result: null
        });
      }
    }

    return {
      success: results.every(r => r.success),
      results,
      totalItemsProcessed,
      totalConflicts,
      consolidatedSources: sources.length
    };
  }
}

export default ContextOperations;