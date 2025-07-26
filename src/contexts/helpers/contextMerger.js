/**
 * @file contextMerger.js
 * @description This file contains the ContextMerger class for sophisticated merging of Context instances with detailed change tracking and conflict resolution.
 * @path src/contexts/helpers/contextMerger.js

 */

import ContextComparison from './contextComparison.js';
import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';
import { ItemFilter } from './contextItemFilter.js';
import constants from '../../constants/constants.js';
import PathUtils from '../../helpers/pathUtils.js';

/**
 * @class ContextMerger
 * @export
 * @description Provides sophisticated merge capabilities for Context instances with granular control,
 * detailed statistics, and advanced conflict resolution options.
 *
 * Available merge strategies include:
 * - `mergeNewerWins`: Newer items from the target context overwrite source items.
 * - `mergeSourcePriority`: Source items take precedence over target items.
 * - `mergeTargetPriority`: Target items take precedence over source items.
 * - `updateSourceToTarget`: Updates source items with target values.
 * - `updateTargetToSource`: Updates target items with source values.
 * - `replace`: Completely replaces source items with target items.
 * - `noAction`: No changes are made, used for validation or dry runs.
 *
 * ## Public API
 * - `MERGE_STRATEGIES` - Static enum of available merge strategies
 * - `DEFAULT_COMPONENTS` - Static array of default context component keys
 * - `merge(source, target, strategy, options)` - Performs sophisticated merge of two Context instances
 * - `analyze(source, target, strategy, options)` - Creates detailed summary of potential merge operations without executing
 * - `validateCompatibility(source, target)` - Validates that contexts are compatible for merging
 *
 * @example
 * // Basic merge with newer items winning
 * const result = ContextMerger.merge(sourceContext, targetContext);
 *
 * @example
 * // Merge only specific items using simple path filtering
 * const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
 *   allowOnly: ['data.inventory', 'settings.volume', 'flags.experimentalFeatures']
 * });
 *
 * @example
 * // Merge everything except specific items
 * const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
 *   blockOnly: ['data.temporaryCache', 'state.uiState']
 * });
 *
 * @example
 * // Merge single item with detailed options
 * const result = ContextMerger.merge(sourceContext, targetContext, 'mergeSourcePriority', {
 *   singleItem: 'data.playerStats.level',
 *   preserveMetadata: true
 * });
 *
 * @example
 * // Merge items matching a pattern
 * const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
 *   matchPattern: /data\.player/
 * });
 *
 * @example
 * // Merge items based on custom condition
 * const result = ContextMerger.merge(sourceContext, targetContext, 'mergeNewerWins', {
 *   customFilter: (sourceItem, targetItem, itemPath) => sourceItem?.version > targetItem?.version
 * });
 */
class ContextMerger {
  /**
   * @enum {string}
   * @description Available merge strategies.
   */
  static MERGE_STRATEGIES = constants.contextHelpers.mergeStrategies;

  /**
   * @enum {string}
   * @description Default Context component keys that can be merged.
   */
  static DEFAULT_COMPONENTS = constants.contextHelpers.defaultComponents;

  /**
   * @private
   * Validates merge inputs and initializes result structure.
   * @param {Context} source - The source Context instance.
   * @param {Context} target - The target Context instance.
   * @param {string} strategy - The merge strategy.
   * @returns {object} Initialized result object.
   */
  static #initializeMergeResult(source, target, strategy) {
    if (!source || !target) {
      throw new Error(constants.contextHelpers.errorMessages.invalidMergeContext);
    }

    return {
      success: false,
      strategy,
      itemsProcessed: 0,
      conflicts: 0,
      changes: [],
      statistics: {
        sourcePreferred: 0,
        targetPreferred: 0,
        created: 0,
        updated: 0,
        skipped: 0
      },
      errors: []
    };
  }

  /**
   * @private
   * Determines which components to process based on include/exclude options.
   * @param {object} options - Merge options.
   * @returns {string[]} Array of component keys to process.
   */
  static #determineComponentsToProcess(options) {
    const { excludeComponents = [], includeComponents } = options;
    let componentsToProcess = includeComponents || ContextMerger.DEFAULT_COMPONENTS;

    if (excludeComponents.length > 0) {
      componentsToProcess = componentsToProcess.filter(comp => !excludeComponents.includes(comp));
    }

    return componentsToProcess;
  }

  /**
   * @private
   * Processes all components for the merge operation.
   * @param {Context} source - Source context.
   * @param {Context} target - Target context.
   * @param {string[]} components - Components to process.
   * @param {string} strategy - Merge strategy.
   * @param {object} options - Merge options.
   * @param {object} result - Result object to update.
   */
  static #processAllComponents(source, target, components, strategy, options, result) {
    for (const componentKey of components) {
      const sourceComponent = source[componentKey];
      const targetComponent = target[componentKey];

      if (!sourceComponent && !targetComponent) {
        result.statistics.skipped++;
        continue;
      }

      try {
        const componentResult = ContextMerger.#mergeComponent(
          sourceComponent,
          targetComponent,
          componentKey,
          strategy,
          options
        );

        ContextMerger.#aggregateComponentResult(result, componentResult);
      } catch (error) {
        result.errors.push(`Component ${componentKey}: ${error.message}`);
      }
    }
  }

  /**
   * @private
   * Processes ContextContainer objects directly (no components).
   * @param {ContextContainer} source - Source container.
   * @param {ContextContainer} target - Target container.
   * @param {string} strategy - Merge strategy.
   * @param {object} options - Merge options.
   * @param {object} result - Result object to update.
   */
  static #processContainerItems(source, target, strategy, options, result) {
    // Get all item keys from both containers
    const allKeys = ContextMerger.#getAllItemKeys(source, target);

    for (const itemKey of allKeys) {
      ContextMerger.#processItem(
        source,  // source container
        target,  // target container
        itemKey,
        '',     // no component path for containers
        strategy,
        options,
        result
      );
    }
  }

  /**
   * @private
   * Aggregates component merge results into the main result.
   * @param {object} mainResult - Main result object.
   * @param {object} componentResult - Component result to aggregate.
   */
  static #aggregateComponentResult(mainResult, componentResult) {
    mainResult.itemsProcessed += componentResult.itemsProcessed;
    mainResult.conflicts += componentResult.conflicts;
    mainResult.changes.push(...componentResult.changes);
    mainResult.statistics.sourcePreferred += componentResult.statistics.sourcePreferred;
    mainResult.statistics.targetPreferred += componentResult.statistics.targetPreferred;
    mainResult.statistics.created += componentResult.statistics.created;
    mainResult.statistics.updated += componentResult.statistics.updated;
    mainResult.statistics.skipped += componentResult.statistics.skipped;
  }

  /**
   * @private
   * Gets all unique item keys from both components.
   * @param {ContextContainer} sourceComponent - Source component.
   * @param {ContextContainer} targetComponent - Target component.
   * @returns {Set} Set of unique item keys.
   */
  static #getAllItemKeys(sourceComponent, targetComponent) {
    const sourceKeys = sourceComponent?.keys ? sourceComponent.keys() : [];
    const targetKeys = targetComponent?.keys ? targetComponent.keys() : [];
    return new Set([...sourceKeys, ...targetKeys]);
  }

  /**
   * @private
   * Processes a single item for merging.
   * @param {ContextContainer} sourceComponent - Source component.
   * @param {ContextContainer} targetComponent - Target component.
   * @param {string} itemKey - Item key to process.
   * @param {string} componentKey - Component key for path tracking.
   * @param {string} strategy - Merge strategy.
   * @param {object} options - Merge options.
   * @param {object} result - Result object to update.
   */
  static #processItem(sourceComponent, targetComponent, itemKey, componentKey, strategy, options, result) {
    const itemPath = componentKey ? `${componentKey}.${itemKey}` : itemKey;

    // Apply path filtering before processing
    if (!ContextMerger.#shouldProcessItem(itemPath, options, sourceComponent, targetComponent)) {
      result.statistics.skipped++;
      return;
    }

    const sourceItem = sourceComponent?.getItem ? sourceComponent.getItem(itemKey) : null;
    const targetItem = targetComponent?.getItem ? targetComponent.getItem(itemKey) : null;
    const hasTargetItem = targetComponent?.hasItem ? targetComponent.hasItem(itemKey) : !!targetItem;

    result.itemsProcessed++;

    try {
      const itemResult = ContextMerger.#mergeItem(
        sourceItem,
        targetItem,
        hasTargetItem,
        targetComponent,
        itemKey,
        itemPath,
        strategy,
        options
      );

      ContextMerger.#aggregateItemResult(result, itemResult);
    } catch (error) {
      result.changes.push({
        path: itemPath,
        action: 'error',
        error: error.message
      });
    }
  }  /**
   * @private
   * Determines if an item should be processed based on filtering options.
   * Now supports structure-aware filtering for mixed object types.
   * @param {string} itemPath - The full path of the item.
   * @param {object} options - Merge options containing filtering parameters.
   * @param {ContextContainer} sourceComponent - Source component for structure-aware filtering.
   * @param {ContextContainer} targetComponent - Target component for structure-aware filtering.
   * @returns {boolean} True if the item should be processed, false if it should be skipped.
   */
  static #shouldProcessItem(itemPath, options, sourceComponent = null, targetComponent = null) {
    const { allowOnly, blockOnly, excludePaths, customFilter } = options;

    // If customFilter is specified, use it with enhanced parameters
    if (customFilter && typeof customFilter === 'function') {
      const sourceItem = sourceComponent?.getItem ? sourceComponent.getItem(itemPath.split('.').pop()) : null;
      const targetItem = targetComponent?.getItem ? targetComponent.getItem(itemPath.split('.').pop()) : null;
      
      try {
        const filterResult = customFilter(sourceItem, targetItem, itemPath, sourceComponent, targetComponent);
        // If filter returns sourceItem, process the item; if targetItem, skip it
        return filterResult === sourceItem;
      } catch (error) {
        console.warn(`Custom filter error for path ${itemPath}:`, error);
        return true; // Default to processing on error
      }
    }

    // If allowOnly is specified, only allow items that match using structure-aware logic
    if (allowOnly && allowOnly.length > 0) {
      const isAllowed = allowOnly.some(allowedPath => {
        // Exact match
        if (itemPath === allowedPath) return true;
        
        // Direct parent-child relationships
        if (itemPath.startsWith(`${allowedPath}.`) || allowedPath.startsWith(`${itemPath}.`)) return true;
        
        // Structure-aware checking for complex nested paths
        if (sourceComponent && PathUtils.pathExistsInMixedStructure(sourceComponent, allowedPath)) {
          // Check if itemPath is under the allowed path structure
          if (itemPath.startsWith(allowedPath)) return true;
          
          // Check relative paths within the allowed structure
          const resolvedPath = PathUtils.resolveMixedPath(sourceComponent, allowedPath);
          if (resolvedPath.exists && resolvedPath.value) {
            const relativePath = itemPath.replace(`${allowedPath}.`, '');
            if (relativePath !== itemPath) {
              return PathUtils.pathExistsInMixedStructure(resolvedPath.value, relativePath);
            }
          }
        }
        
        return false;
      });
      
      if (!isAllowed) {
        return false;
      }
    }

    // If blockOnly is specified, block items that match using structure-aware logic
    if (blockOnly && blockOnly.length > 0) {
      const isBlocked = blockOnly.some(blockedPath => {
        // Exact match
        if (itemPath === blockedPath) return true;
        
        // Block children of blocked paths
        if (itemPath.startsWith(`${blockedPath}.`)) return true;
        
        // Structure-aware checking for complex nested paths
        if (sourceComponent && PathUtils.pathExistsInMixedStructure(sourceComponent, blockedPath)) {
          // Check if itemPath is under the blocked path structure
          if (itemPath.startsWith(blockedPath)) return true;
          
          // Check relative paths within the blocked structure
          const resolvedPath = PathUtils.resolveMixedPath(sourceComponent, blockedPath);
          if (resolvedPath.exists && resolvedPath.value) {
            const relativePath = itemPath.replace(`${blockedPath}.`, '');
            if (relativePath !== itemPath) {
              return PathUtils.pathExistsInMixedStructure(resolvedPath.value, relativePath);
            }
          }
        }
        
        return false;
      });
      
      if (isBlocked) {
        return false;
      }
    }

    // If excludePaths is specified, exclude items that match using structure-aware logic
    if (excludePaths && excludePaths.length > 0) {
      const isExcluded = excludePaths.some(excludedPath => {
        // Exact match
        if (itemPath === excludedPath) return true;
        
        // Exclude children of excluded paths
        if (itemPath.startsWith(`${excludedPath}.`)) return true;
        
        // Structure-aware checking for complex nested paths
        if (sourceComponent && PathUtils.pathExistsInMixedStructure(sourceComponent, excludedPath)) {
          // Check if itemPath is under the excluded path structure
          if (itemPath.startsWith(excludedPath)) return true;
          
          // Check relative paths within the excluded structure
          const resolvedPath = PathUtils.resolveMixedPath(sourceComponent, excludedPath);
          if (resolvedPath.exists && resolvedPath.value) {
            const relativePath = itemPath.replace(`${excludedPath}.`, '');
            if (relativePath !== itemPath) {
              return PathUtils.pathExistsInMixedStructure(resolvedPath.value, relativePath);
            }
          }
        }
        
        return false;
      });
      
      if (isExcluded) {
        return false;
      }
    }

    return true;
  }  /**
   * @private
   * Aggregates item merge results.
   * @param {object} result - Main result object.
   * @param {object} itemResult - Item result to aggregate.
   */
  static #aggregateItemResult(result, itemResult) {
    result.conflicts += itemResult.conflicts;
    result.changes.push(...itemResult.changes);
    result.statistics.sourcePreferred += itemResult.statistics.sourcePreferred;
    result.statistics.targetPreferred += itemResult.statistics.targetPreferred;
    result.statistics.created += itemResult.statistics.created;
    result.statistics.updated += itemResult.statistics.updated;
    result.statistics.skipped += itemResult.statistics.skipped;
  }

  /**
   * @private
   * Determines which item to choose based on strategy.
   * @param {ContextItem} sourceItem - Source item.
   * @param {ContextItem} targetItem - Target item.
   * @param {string} strategy - Merge strategy.
   * @param {object} comparison - Timestamp comparison result.
   * @returns {object} Choice result with item and action.
   */
  static #determineItemChoice(sourceItem, targetItem, strategy, comparison) {
    let chosenItem = null;
    let actionTaken = 'skipped';

    switch (strategy) {
      case ContextMerger.MERGE_STRATEGIES.MERGE_NEWER_WINS:
        if (comparison.result === ContextComparison.COMPARISON_RESULTS.SOURCE_NEWER) {
          chosenItem = sourceItem;
          actionTaken = 'sourcePreferred';
        } else if (comparison.result === ContextComparison.COMPARISON_RESULTS.TARGET_NEWER) {
          chosenItem = targetItem;
          actionTaken = 'targetPreferred';
        }
        break;

      case ContextMerger.MERGE_STRATEGIES.MERGE_SOURCE_PRIORITY:
      case ContextMerger.MERGE_STRATEGIES.UPDATE_TARGET_TO_SOURCE:
      case ContextMerger.MERGE_STRATEGIES.REPLACE:
        chosenItem = sourceItem;
        actionTaken = 'sourcePreferred';
        break;

      case ContextMerger.MERGE_STRATEGIES.MERGE_TARGET_PRIORITY:
      case ContextMerger.MERGE_STRATEGIES.UPDATE_SOURCE_TO_TARGET:
        chosenItem = targetItem;
        actionTaken = 'targetPreferred';
        break;
    }

    return { chosenItem, actionTaken };
  }

  /**
   * @private
   * Applies the chosen item with conflict resolution.
   * @param {ContextItem} chosenItem - Item to apply.
   * @param {ContextItem} targetItem - Current target item.
   * @param {ContextContainer} targetComponent - Target component.
   * @param {string} itemKey - Item key.
   * @param {string} itemPath - Full item path.
   * @param {object} options - Merge options.
   * @param {object} comparison - Comparison result.
   * @param {object} result - Result object to update.
   * @returns {string} Action taken.
   */
  static #applyChosenItem(chosenItem, targetItem, targetComponent, itemKey, itemPath, options, comparison, result) {
    const { dryRun, onConflict, preserveMetadata } = options;
    let actionTaken = chosenItem === targetItem ? 'targetPreferred' : 'sourcePreferred';

    // Handle conflicts
    if (chosenItem && onConflict && comparison.result !== ContextComparison.COMPARISON_RESULTS.EQUAL) {
      result.conflicts++;
      const resolverResult = onConflict(chosenItem === targetItem ? targetItem : chosenItem, targetItem, itemPath);
      if (resolverResult) {
        chosenItem = resolverResult;
        actionTaken = resolverResult === chosenItem ? 'sourcePreferred' : 'targetPreferred';
      }
    } else if (chosenItem && comparison.result !== ContextComparison.COMPARISON_RESULTS.EQUAL) {
      result.conflicts++;
    }

    // Apply the item
    if (
      chosenItem &&
      !dryRun &&
      chosenItem !== targetItem &&
      targetComponent?.setItem
    ) {
      ContextMerger.#setItemWithMetadata(chosenItem, targetItem, targetComponent, itemKey, preserveMetadata);

      result.statistics[actionTaken]++;
      result.statistics.updated++;
      result.changes.push({
        path: itemPath,
        action: 'updated',
        from: targetItem?.value || targetItem,
        to: chosenItem?.value || chosenItem
      });
    } else {
      result.statistics[actionTaken]++;
      if (actionTaken === 'skipped') {
        result.changes.push({
          path: itemPath,
          action: 'skipped',
          reason: 'no change needed'
        });
      }
    }

    return actionTaken;
  }

  /**
   * @private
   * Sets item with optional metadata preservation.
   * @param {ContextItem} chosenItem - Item to set.
   * @param {ContextItem} targetItem - Existing target item.
   * @param {ContextContainer} targetComponent - Target component.
   * @param {string} itemKey - Item key.
   * @param {boolean} preserveMetadata - Whether to preserve metadata.
   */
  static #setItemWithMetadata(chosenItem, targetItem, targetComponent, itemKey, preserveMetadata) {
    if (preserveMetadata && targetItem?.setMetadata && chosenItem?.metadata) {
      const newItem = { ...chosenItem };
      if (newItem.setMetadata) {
        newItem.setMetadata({ ...targetItem.metadata, ...chosenItem.metadata });
      }
      targetComponent.setItem(itemKey, newItem);
    } else {
      targetComponent.setItem(itemKey, chosenItem);
    }
  }

  /**
   * @private
   * Merges a single component between source and target contexts.
   * @param {ContextContainer} sourceComponent - Source component.
   * @param {ContextContainer} targetComponent - Target component.
   * @param {string} componentKey - Component key.
   * @param {string} strategy - Merge strategy.
   * @param {object} options - Merge options.
   * @returns {object} Component merge result.
   */
  static #mergeComponent(sourceComponent, targetComponent, componentKey, strategy, options) {
    const result = {
      itemsProcessed: 0,
      conflicts: 0,
      changes: [],
      statistics: {
        sourcePreferred: 0,
        targetPreferred: 0,
        created: 0,
        updated: 0,
        skipped: 0
      }
    };

    if (!sourceComponent && !targetComponent) {
      result.statistics.skipped++;
      return result;
    }

    if (!sourceComponent || !targetComponent) {
      result.statistics.skipped++;
      return result;
    }

    const allKeys = ContextMerger.#getAllItemKeys(sourceComponent, targetComponent);

    for (const itemKey of allKeys) {
      ContextMerger.#processItem(
        sourceComponent,
        targetComponent,
        itemKey,
        componentKey,
        strategy,
        options,
        result
      );
    }

    return result;
  }

  /**
   * @private
   * Merges a single item between source and target.
   * @param {ContextItem} sourceItem - Source item.
   * @param {ContextItem} targetItem - Target item.
   * @param {boolean} hasTargetItem - Whether target has this item.
   * @param {ContextContainer} targetComponent - Target component.
   * @param {string} itemKey - Item key.
   * @param {string} itemPath - Full item path.
   * @param {string} strategy - Merge strategy.
   * @param {object} options - Merge options.
   * @returns {object} Item merge result.
   */
  static #mergeItem(sourceItem, targetItem, hasTargetItem, targetComponent, itemKey, itemPath, strategy, options) {
    const { compareBy, createMissing, dryRun } = options;

    const result = {
      conflicts: 0,
      changes: [],
      statistics: {
        sourcePreferred: 0,
        targetPreferred: 0,
        created: 0,
        updated: 0,
        skipped: 0
      }
    };

    // Handle missing items
    if (!sourceItem && !targetItem) {
      result.statistics.skipped++;
      return result;
    }

    if (!sourceItem) {
      result.statistics.skipped++;
      return result;
    }

    if (!targetItem || !hasTargetItem) {
      return ContextMerger.#handleMissingTargetItem(
        sourceItem,
        targetComponent,
        itemKey,
        itemPath,
        createMissing,
        dryRun,
        result
      );
    }

    return ContextMerger.#handleExistingItems(
      sourceItem,
      targetItem,
      targetComponent,
      itemKey,
      itemPath,
      strategy,
      options,
      result
    );
  }

  /**
   * @private
   * Handles case where target item is missing.
   * @param {ContextItem} sourceItem - Source item.
   * @param {ContextContainer} targetComponent - Target component.
   * @param {string} itemKey - Item key.
   * @param {string} itemPath - Full item path.
   * @param {boolean} createMissing - Whether to create missing items.
   * @param {boolean} dryRun - Whether this is a dry run.
   * @param {object} result - Result object to update.
   * @returns {object} Updated result.
   */
  static #handleMissingTargetItem(sourceItem, targetComponent, itemKey, itemPath, createMissing, dryRun, result) {
    if (createMissing && !dryRun && targetComponent?.setItem) {
      targetComponent.setItem(itemKey, sourceItem);
      result.statistics.created++;
      result.changes.push({
        path: itemPath,
        action: 'created',
        value: sourceItem?.value || sourceItem
      });
    } else {
      result.statistics.skipped++;
    }
    return result;
  }

  /**
   * @private
   * Handles case where both items exist.
   * @param {ContextItem} sourceItem - Source item.
   * @param {ContextItem} targetItem - Target item.
   * @param {ContextContainer} targetComponent - Target component.
   * @param {string} itemKey - Item key.
   * @param {string} itemPath - Full item path.
   * @param {string} strategy - Merge strategy.
   * @param {object} options - Merge options.
   * @param {object} result - Result object to update.
   * @returns {object} Updated result.
   */
  static #handleExistingItems(sourceItem, targetItem, targetComponent, itemKey, itemPath, strategy, options, result) {
    // For ContextContainer objects with simple values, handle directly
    if (targetComponent.constructor.name === 'ContextContainer') {
      // Check if we need to do deep merging for nested objects
      if (typeof sourceItem === 'object' && sourceItem !== null && 
          typeof targetItem === 'object' && targetItem !== null &&
          !Array.isArray(sourceItem) && !Array.isArray(targetItem)) {
        
        // Deep merge with path filtering
        const mergedItem = ContextMerger.#deepMergeWithFiltering(
          sourceItem, 
          targetItem, 
          itemPath, 
          strategy, 
          options
        );
        
        if (mergedItem !== targetItem) {
          if (!options.dryRun) {
            targetComponent.setItem(itemKey, mergedItem);
          }
          result.statistics.updated++;
          result.changes.push({
            path: itemPath,
            action: 'deep-merged',
            strategy: strategy
          });
        } else {
          result.statistics.skipped++;
          result.changes.push({
            path: itemPath,
            action: 'skipped',
            reason: 'no changes after filtering'
          });
        }
        
        return result;
      }      // For simple values, apply strategy without comparison
      let chosenItem;
      let actionTaken;

      if (strategy === 'mergeSourcePriority' || strategy === 'updateTargetToSource') {
        chosenItem = sourceItem;
        actionTaken = 'sourcePreferred';
      } else if (strategy === 'mergeTargetPriority') {
        chosenItem = targetItem;
        actionTaken = 'targetPreferred';
      } else {
        // Default behavior for other strategies: prefer source
        chosenItem = sourceItem;
        actionTaken = 'sourcePreferred';
      }

      if (chosenItem !== targetItem) {
        if (!options.dryRun) {
          targetComponent.setItem(itemKey, chosenItem);
        }
        result.statistics.updated++;
        result.changes.push({
          path: itemPath,
          action: 'updated',
          oldValue: targetItem,
          newValue: chosenItem,
          strategy: strategy
        });
      } else {
        result.statistics.skipped++;
        result.changes.push({
          path: itemPath,
          action: 'skipped',
          reason: 'no change needed'
        });
      }

      return result;
    }

    // Original logic for ContextItem objects
    const comparison = ContextComparison.compare(sourceItem, targetItem, { compareBy: options.compareBy });
    const { chosenItem, actionTaken } = ContextMerger.#determineItemChoice(sourceItem, targetItem, strategy, comparison);

    if (chosenItem) {
      ContextMerger.#applyChosenItem(
        chosenItem,
        targetItem,
        targetComponent,
        itemKey,
        itemPath,
        options,
        comparison,
        result
      );
    } else {
      result.statistics[actionTaken]++;
      result.changes.push({
        path: itemPath,
        action: 'skipped',
        reason: strategy === ContextMerger.MERGE_STRATEGIES.NO_ACTION ? 'noAction strategy' : 'no change needed'
      });
    }

    return result;
  }

  /**
   * Merges all items except specific ones using path-based filtering.
   * @param {Context} source - The source Context instance.
   * @param {Context} target - The target Context instance to merge into.
   * @param {string[]} blockedPaths - Array of item paths to exclude from merge
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object} Detailed merge result with statistics and changes.
   *
   * @example
   * // Merge everything except temporary data
  /**
   * Performs a sophisticated merge of two Context instances with detailed tracking and options.
   * @param {Context} source - The source Context instance.
   * @param {Context} target - The target Context instance to merge into.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply.
   * @param {object} [options={}] - Merge options for controlling behavior.
   * @param {string[]} [options.includeComponents] - Array of component keys to include in merge.
   * @param {string[]} [options.excludeComponents=[]] - Array of component keys to exclude from merge.
   * @param {string} [options.compareBy='timestamp'] - Field to use for item comparison.
   * @param {boolean} [options.createMissing=true] - Whether to create items that exist in source but not target.
   * @param {boolean} [options.dryRun=false] - If true, performs analysis without making changes.
   * @param {boolean} [options.preserveMetadata=false] - Whether to preserve existing metadata when updating items.
   * @param {Function} [options.onConflict] - Custom conflict resolver function.
   * @param {string[]} [options.allowOnly] - Array of item paths to allow (alternative to onConflict).
   * @param {string[]} [options.blockOnly] - Array of item paths to block (alternative to onConflict).
   * @param {string[]} [options.excludePaths] - Array of item paths to exclude (alternative to onConflict).
   * @param {string} [options.singleItem] - Single item path to merge (alternative to onConflict).
   * @param {RegExp} [options.matchPattern] - Pattern to match item paths (alternative to onConflict).
   * @param {Function} [options.customFilter] - Custom filter function (alternative to onConflict).
   * @returns {object} Detailed merge result with statistics and changes.
   */
  static merge(source, target, strategy = 'mergeNewerWins', options = {}) {
    // Set default options
    const defaultOptions = {
      createMissing: true,
      preserveMetadata: false,
      dryRun: false
    };
    
    // Process convenience parameters and convert them to onConflict filter
    const processedOptions = { ...defaultOptions, ...options };

    // No need to convert allowOnly, blockOnly, excludePaths to onConflict anymore
    // They are handled directly in #shouldProcessItem

    const result = ContextMerger.#initializeMergeResult(source, target, strategy);

    try {
      // Check if we're dealing with ContextContainer objects directly
      if (source.constructor.name === 'ContextContainer' && target.constructor.name === 'ContextContainer') {
        ContextMerger.#processContainerItems(source, target, strategy, processedOptions, result);
      } else {
        // Process Context objects with components
        const componentsToProcess = ContextMerger.#determineComponentsToProcess(processedOptions);
        ContextMerger.#processAllComponents(source, target, componentsToProcess, strategy, processedOptions, result);
      }
      result.success = result.errors.length === 0;
    } catch (error) {
      result.success = false;
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Creates a detailed summary of potential merge operations without executing them.
   * @param {Context} source - The source context.
   * @param {Context} target - The target context.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to analyze.
   * @param {object} [options={}] - Analysis options. Same as merge() options.
   * @returns {object} Detailed analysis of what would happen during merge.
   */
  static analyze(source, target, strategy = 'mergeNewerWins', options = {}) {
    return ContextMerger.merge(source, target, strategy, { ...options, dryRun: true });
  }

  /**
   * Validates that contexts are compatible for merging.
   * @param {Context} source - The source context.
   * @param {Context} target - The target context.
   * @returns {boolean} True if contexts are compatible.
   */
  static validateCompatibility(source, target) {
    if (!source || !target) return false;

    const requiredMethods = ['schema', 'constants', 'manifest', 'flags', 'state', 'data', 'settings'];

    return requiredMethods.every(method =>
      source.hasOwnProperty(method) && target.hasOwnProperty(method)
    );
  }

  /**
   * @private
   * Performs deep merging of objects with path-based filtering.
   * @param {object} sourceObj - Source object.
   * @param {object} targetObj - Target object.
   * @param {string} basePath - Base path for this object.
   * @param {string} strategy - Merge strategy.
   * @param {object} options - Merge options with filtering.
   * @returns {object} Merged object.
   */
  static #deepMergeWithFiltering(sourceObj, targetObj, basePath, strategy, options) {
    const result = { ...targetObj }; // Start with target object
    let hasChanges = false;

    // Process all keys from source object
    for (const [key, sourceValue] of Object.entries(sourceObj)) {
      const currentPath = basePath ? `${basePath}.${key}` : key;

      // Check if this path should be processed
      if (!ContextMerger.#shouldProcessItem(currentPath, options)) {
        continue; // Skip this path
      }

      const targetValue = targetObj[key];

      if (typeof sourceValue === 'object' && sourceValue !== null &&
          typeof targetValue === 'object' && targetValue !== null &&
          !Array.isArray(sourceValue) && !Array.isArray(targetValue)) {

        // Recursively merge nested objects
        const nestedResult = ContextMerger.#deepMergeWithFiltering(
          sourceValue,
          targetValue,
          currentPath,
          strategy,
          options
        );

        if (nestedResult !== targetValue) {
          result[key] = nestedResult;
          hasChanges = true;
        }
      } else {
        // Handle primitive values or arrays
        let chosenValue;

        if (strategy === 'mergeSourcePriority' || strategy === 'updateTargetToSource') {
          chosenValue = sourceValue;
        } else if (strategy === 'mergeTargetPriority') {
          chosenValue = targetValue;
        } else {
          chosenValue = sourceValue; // Default to source
        }

        if (chosenValue !== targetValue) {
          result[key] = chosenValue;
          hasChanges = true;
        }
      }
    }

    return hasChanges ? result : targetObj;
  }
}

export { ContextMerger, ItemFilter };
export default ContextMerger;
