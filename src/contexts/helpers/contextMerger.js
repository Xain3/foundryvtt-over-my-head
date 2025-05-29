/**
 * @file contextMerger.js
 * @description This file contains the ContextMerger class for sophisticated merging of Context instances with detailed change tracking and conflict resolution.
 * @path /src/contexts/helpers/contextMerger.js
 * @date 29 May 2025
 */

import ContextSync from './contextSync.js';
import { ContextItem } from './contextItem.js';
import { ContextContainer } from './contextContainer.js';

/**
 * @class ContextMerger
 * @description Provides sophisticated merge capabilities for Context instances with granular control,
 * detailed statistics, and advanced conflict resolution options.
 */
class ContextMerger {
  /**
   * @enum {string}
   * @description Available merge strategies.
   */
  static MERGE_STRATEGIES = {
    MERGE_NEWER_WINS: 'mergeNewerWins',
    MERGE_SOURCE_PRIORITY: 'mergeSourcePriority',
    MERGE_TARGET_PRIORITY: 'mergeTargetPriority',
    UPDATE_SOURCE_TO_TARGET: 'updateSourceToTarget',
    UPDATE_TARGET_TO_SOURCE: 'updateTargetToSource',
    REPLACE: 'replace',
    NO_ACTION: 'noAction'
  };

  /**
   * @enum {string}
   * @description Default Context component keys that can be merged.
   */
  static DEFAULT_COMPONENTS = [
    'schema',
    'constants',
    'manifest',
    'flags',
    'state',
    'data',
    'settings'
  ];

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
      throw new Error('Invalid source or target context for merge operation');
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
        `${componentKey}.${itemKey}`,
        strategy,
        options
      );

      ContextMerger.#aggregateItemResult(result, itemResult);
    } catch (error) {
      result.changes.push({
        path: `${componentKey}.${itemKey}`,
        action: 'error',
        error: error.message
      });
    }
  }

  /**
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
        if (comparison.result === ContextSync.COMPARISON_RESULTS.SOURCE_NEWER) {
          chosenItem = sourceItem;
          actionTaken = 'sourcePreferred';
        } else if (comparison.result === ContextSync.COMPARISON_RESULTS.TARGET_NEWER) {
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
    if (chosenItem && onConflict && comparison.result !== ContextSync.COMPARISON_RESULTS.EQUAL) {
      result.conflicts++;
      const resolverResult = onConflict(chosenItem === targetItem ? targetItem : chosenItem, targetItem, itemPath);
      if (resolverResult) {
        chosenItem = resolverResult;
        actionTaken = resolverResult === chosenItem ? 'sourcePreferred' : 'targetPreferred';
      }
    } else if (chosenItem && comparison.result !== ContextSync.COMPARISON_RESULTS.EQUAL) {
      result.conflicts++;
    }

    // Apply the item
    if (chosenItem && !dryRun && chosenItem !== targetItem && targetComponent?.setItem) {
      ContextMerger.#setItemWithMetadata(chosenItem, targetItem, targetComponent, itemKey, preserveMetadata);

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
    const comparison = ContextSync.compare(sourceItem, targetItem, { compareBy: options.compareBy });
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
   * Performs a sophisticated merge of two Context instances with detailed tracking and options.
   * @param {Context} source - The source Context instance.
   * @param {Context} target - The target Context instance to merge into.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply.
   * @param {object} [options={}] - Merge options for controlling behavior.
   * @returns {object} Detailed merge result with statistics and changes.
   */
  static merge(source, target, strategy = 'mergeNewerWins', options = {}) {
    const result = ContextMerger.#initializeMergeResult(source, target, strategy);

    try {
      const componentsToProcess = ContextMerger.#determineComponentsToProcess(options);
      ContextMerger.#processAllComponents(source, target, componentsToProcess, strategy, options, result);
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
   * @param {object} [options={}] - Analysis options.
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
}

export { ContextMerger };
export default ContextMerger;
