/**
 * @file context.js
 * @description This file defines the Context class, which encapsulates various data sources and settings for the module.
 * @path /src/contexts/context.js
 */

import manifest from '../constants/manifest.js';
import constants from '../constants/constants.js';
import Validator from '../utils/static/validator.js';
import ContextContainer from './helpers/contextContainer.js';
import ContextMerger from './helpers/contextMerger.js';
import ContextSync from './helpers/contextSync.js';
import ContextOperations from './helpers/contextOperations.js';

export const DEFAULT_INITIALIZATION_PARAMS = {
  contextSchema: constants.context.schema,
  namingConvention: constants.context.naming,
  constants: constants,
  manifest: manifest,
  flags: constants.flags,
  data: {},
  settings: {}
};



const DEFAULT_OPERATIONS_PARAMS = constants.context.operationsParams.defaults;

/**
 * @typedef {object} OperationsParams
 * @property {boolean} [alwaysPullBeforeGetting=false]
 * @property {boolean} [alwaysPullBeforeSetting=false]
 * @property {Context[]} [pullFrom=[]]
 * @property {boolean} [alwaysPushAfterSetting=false]
 * @property {Context[]} [pushTo=[]]
 * @property {ErrorHandlingConfig} [errorHandling]
 */

/**
 * @typedef {object} ErrorHandlingConfig
 * @property {'warn'|'throw'|'silent'} [onPullError='warn']
 * @property {'warn'|'throw'|'silent'} [onPushError='warn']
 * @property {'warn'|'throw'|'silent'} [onValidationError='throw']
 */

/**
 * @class Context
 * @description Represents the operational context for the module, holding configuration,
 * manifest data, constants, flags, and other relevant state or data.
 * It extends ContextContainer, meaning the Context itself is a container,
 * and its main properties (manifest, constants, etc.) are items within it.
 * @extends ContextContainer
 * @property {ContextContainer} schema - The schema definition for this context. Access via getter.
 * @property {ContextContainer} constants - Module-wide constants available in this context. Access via getter.
 * @property {ContextContainer} manifest - The module's manifest data. Access via getter.
 * @property {ContextContainer} flags - Flags associated with this context. Access via getter.
 * @property {ContextContainer} state - A mutable state object for this context. Access via getter.
 * @property {ContextContainer} data - General data associated with this context. Access via getter.
 * @property {ContextContainer} settings - Settings associated with this context. Access via getter.
 * @property {object} #namingConvention - The naming convention used within this context. Frozen.
 * Inherits `createdAt`, `modifiedAt`, `lastAccessedAt` from ContextItem via ContextContainer.
 */
class Context extends ContextContainer {
  #namingConvention;
  #operationsParams;
  #lastPullTimestamp = new Map();
  #pullCooldown = 1000; // ms
  #performanceMetrics = {
    pullOperations: 0,
    pushOperations: 0,
    averagePullTime: 0,
    averagePushTime: 0
  };
  #isContextObject = true;

  /**
   * @constructor
   * @param {object} [options={}] - The options object.
   * @param {object} [options.initializationParams=DEFAULT_INITIALIZATION_PARAMS] - The parameters for initializing the context.
   * @param {object} [options.initializationParams.contextSchema=constants.context.schema] - The schema definition for the context.
   * @param {object} [options.initializationParams.namingConvention=constants.context.naming] - The naming convention to be used.
   * @param {object} [options.initializationParams.constants=constants] - Module-wide constants.
   * @param {object} [options.initializationParams.manifest=manifest] - The module's manifest data.
   * @param {object} [options.initializationParams.flags=constants.flags] - Initial flags for the context.
   * @param {object} [options.initializationParams.data={}] - Initial data for the context.
   * @param {object} [options.initializationParams.settings={}] - Initial settings for the context.
   * @param {object} [options.operationsParams] - Parameters controlling pulling/pushing behavior.
   * @param {boolean} [options.operationsParams.alwaysPullBeforeGetting=false] - Whether to always pull from sources before getting items.
   * @param {boolean} [options.operationsParams.alwaysPullBeforeSetting=false] - Whether to always pull from sources before setting items.
   * @param {Context[]} [options.operationsParams.pullFrom=[]] - Array of source contexts to pull from.
   * @param {boolean} [options.operationsParams.alwaysPushAfterSetting=false] - Whether to always push to targets after setting items.
   * @param {Context[]} [options.operationsParams.pushTo=[]] - Array of target contexts to push to.
   * @param {object} [options.operationsParams.errorHandling] - Error handling configuration.
   * @param {string} [options.operationsParams.errorHandling.onPullError='warn'] - Action on pull error ('warn', 'throw', 'silent').
   * @param {string} [options.operationsParams.errorHandling.onPushError='warn'] - Action on push error ('warn', 'throw', 'silent').
   * @param {string} [options.operationsParams.errorHandling.onValidationError='throw'] - Action on validation error ('warn', 'throw', 'silent').
   */
  constructor({
    initializationParams = DEFAULT_INITIALIZATION_PARAMS,
    operationsParams = DEFAULT_OPERATIONS_PARAMS,
  } = {}) {
    // Initialize ContextContainer part.
    super({}, {}, { recordAccess: false, recordAccessForMetadata: false, defaultItemWrapAs: 'ContextContainer' });

    // Set operations params FIRST before any setItem calls
    this.#operationsParams = operationsParams;

    // Extract parameters with defaults
    const {
      contextSchema = constants.context.schema,
      namingConvention = constants.context.naming,
      constants: consts = constants,
      manifest: manifestData = manifest,
      flags = constants.flags,
      data = {},
      settings = {}
    } = initializationParams;

    const constructorArgs = {
      contextSchema,
      namingConvention,
      constants: consts,
      manifest: manifestData,
      flags,
      data,
      settings
    };

    this.#validateConstructorArgs(constructorArgs);

    // Initialize properties as items within this ContextContainer
    this.#initializeContextItems(contextSchema, consts, manifestData, flags, data, settings);

    // #namingConvention remains a private property, not an item in the container.
    this.#namingConvention = new ContextContainer(namingConvention, {}, { 
      recordAccess: false,
      defaultItemRecordAccess: false 
    });
    
    // Freeze the naming convention container and its items
    this.#namingConvention.freeze();
    for (const [key, item] of this.#namingConvention.entries()) {
      item.freeze();
    }
  }

  #initializeContextItems(contextSchema, consts, manifestData, flags, data, settings) {
    // Use ContextItem for simple data objects that should be frozen
    this.setItem('schema', contextSchema, { 
      wrapAs: 'ContextItem', 
      frozen: true 
    });
    
    this.setItem('constants', consts, { 
      wrapAs: 'ContextItem', 
      frozen: true 
    });
    
    this.setItem('manifest', manifestData, { 
      wrapAs: 'ContextItem', 
      frozen: true 
    });

    // Use ContextContainer for mutable container-like objects
    this.setItem('flags', flags);  // Uses default ContextContainer
    this.setItem('state', {}); // State is initialized as an empty container
    this.setItem('data', data);  // Uses default ContextContainer
    this.setItem('settings', settings);  // Uses default ContextContainer
  }

  // Private helper methods (placed at top for better organization)

  /**
   * @private
   * @method #validateConstructorArgs
   * @description Validates the arguments passed to the Context constructor.
   * @param {object} constructorArgs - The arguments object to validate.
   * @param {object} constructorArgs.contextSchema - The context schema.
   * @param {object} constructorArgs.namingConvention - The naming convention.
   * @param {object} constructorArgs.constants - The constants object.
   * @param {object} constructorArgs.manifest - The manifest object.
   * @param {object} constructorArgs.flags - The flags object.
   * @param {object} constructorArgs.data - The data object.
   * @param {object} constructorArgs.settings - The settings object.
   * @throws {Error} If any validation fails.
   */
  #validateConstructorArgs(constructorArgs) {
    // Validate constructor arguments
    Validator.validateArgsObjectStructure(constructorArgs, 'Context constructor parameters');

    const { contextSchema, namingConvention, constants, manifest, flags, data, settings } = constructorArgs;

    Validator.validateSchemaDefinition(contextSchema, 'Context schema');

    Validator.validateObject(namingConvention, 'Naming convention');
    // Validate naming convention;
    Object.entries(namingConvention).forEach(([property, name]) => {
      Validator.validateStringAgainstPattern(
        name,
        `Naming convention.${property}`,
        /^[a-zA-Z0-9_]+$/,
        'alphanumeric characters and underscores',
        { allowEmpty: false }
      );
    });

    Validator.validateObject(constants, 'Constants', { allowEmpty: false });
    Validator.validateObject(manifest, 'Manifest', { allowEmpty: false });

    Validator.validateObject(flags, 'Flags', { allowEmpty: true, checkKeys: true });
    Validator.validateObject(data, 'Data', { allowEmpty: true, checkKeys: true });
    Validator.validateObject(settings, 'Settings', { allowEmpty: true, checkKeys: true });
  }

  /**
   * @private
   * @method #validateOperationsParams
   * @description Validates the operations parameters for pull/push functionality.
   * @param {OperationsParams} operationsParams - The operations parameters to validate.
   * @throws {Error} If validation fails.
   */
  #validateOperationsParams(operationsParams) {
    if (!operationsParams) return;

    const { pullFrom, pushTo } = operationsParams;

    if (pullFrom && !Array.isArray(pullFrom)) {
      throw new Error('operationsParams.pullFrom must be an array');
    }

    if (pushTo && !Array.isArray(pushTo)) {
      throw new Error('operationsParams.pushTo must be an array');
    }

    // Validate that all contexts in arrays are actually Context instances
    [...(pullFrom || []), ...(pushTo || [])].forEach((ctx, index) => {
      if (!(ctx instanceof Context)) {
        throw new Error(`Context at index ${index} is not a valid Context instance`);
      }
    });
  }

  /**
   * @private
   * @method #handleError
   * @description Handles errors based on the configured error handling strategy.
   * @param {Error} error - The error to handle.
   * @param {string} operation - The operation that caused the error (e.g., 'Pull', 'Push').
   * @param {object} [options={}] - Additional context for error handling.
   */
  #handleError(error, operation, options = {}) {
    const errorHandling = this.#operationsParams.errorHandling || {};
    const action = errorHandling[`on${operation}Error`] || 'warn';

    switch (action) {
      case 'throw':
        throw error;
      case 'silent':
        break;
      case 'warn':
      default:
        console.warn(`${operation} failed:`, error);
    }
  }

  /**
   * @private
   * @method #prepareFinalOptions
   * @description Prepares final options by merging defaults with provided options.
   * @param {object} options - The options to merge with defaults.
   * @returns {object} The merged options object.
   */
  #prepareFinalOptions(options) {
    const defaultOptions = {
      pull: this.#operationsParams?.alwaysPullBeforeSetting || false,
      pullFrom: this.#operationsParams?.pullFrom || [],
      push: this.#operationsParams?.alwaysPushAfterSetting || false,
      pushTo: this.#operationsParams?.pushTo || [],
    };
    return { ...defaultOptions, ...options };
  }

  /**
   * @private
   * @method #performPull
   * @description Performs a pull operation from source contexts.
   * @param {object} finalOptions - The final options for the pull operation.
   * @param {string} itemPath - The path of the item to pull.
   * @param {*} initialValue - The initial value to use if pull fails.
   * @returns {*} The final value after pull operation.
   */
  #performPull(finalOptions, itemPath, initialValue) {
    let finalValue = initialValue;
    try {
      for (const sourceContext of finalOptions.pullFrom) {
        const pullResult = ContextOperations.pullItems(
          sourceContext,
          this,
          [itemPath],
          'mergeNewerWins',
          { dryRun: true }
        );

        if (pullResult.success && pullResult.changes.length > 0) {
          const pulledValue = sourceContext.getItem(itemPath);
          if (pulledValue !== undefined) {
            finalValue = pulledValue;
            break; // Use the first successful pull
          }
        }
      }
    } catch (error) {
      this.#handleError(error, 'Pull', { itemPath, sourceContexts: finalOptions.pullFrom });
    }
    return finalValue;
  }

  /**
   * @private
   * @method #performPush
   * @description Performs a push operation to target contexts.
   * @param {object} finalOptions - The final options for the push operation.
   * @param {string} itemPath - The path of the item to push.
   */
  #performPush(finalOptions, itemPath) {
    try {
      for (const targetContext of finalOptions.pushTo) {
        ContextOperations.pushItems(
          this,
          targetContext,
          [itemPath],
          'mergeSourcePriority'
        );
      }
    } catch (error) {
      this.#handleError(error, 'Push', { itemPath, targetContexts: finalOptions.pushTo });
    }
  }

  /**
   * @private
   * @method #shouldPull
   * @description Determines if a property should be pulled based on cooldown and configuration.
   * @param {string} propertyName - The name of the property to check.
   * @returns {boolean} True if the property should be pulled.
   */
  #shouldPull(propertyName) {
    if (!this.#operationsParams.alwaysPullBeforeGetting) return false;

    const lastPull = this.#lastPullTimestamp.get(propertyName) || 0;
    const now = Date.now();

    return (now - lastPull) > this.#pullCooldown;
  }

  /**
   * @private
   * @method #pullPropertyIfNeeded
   * @description Pulls a property if needed based on configuration and cooldown.
   * @param {string} propertyName - The name of the property to potentially pull.
   */
  #pullPropertyIfNeeded(propertyName) {
    if (!this.#shouldPull(propertyName)) return;

    if (this.#operationsParams.alwaysPullBeforeGetting &&
        Array.isArray(this.#operationsParams.pullFrom) &&
        this.#operationsParams.pullFrom.length > 0) {
      this.#performPullOperation(propertyName);
    }
  }

  /**
   * @private
   * @method #performPullOperation
   * @description Performs the actual pull operation for a specific property.
   * @param {string} propertyName - The name of the property to pull.
   */
  #performPullOperation(propertyName) {
    try {
      for (const sourceContext of this.#operationsParams.pullFrom) {
        const pullResult = ContextOperations.pullItems(
          sourceContext,
          this,
          [propertyName],
          'mergeNewerWins',
          { dryRun: true }
        );

        if (pullResult.success && pullResult.changes.length > 0) {
          const pulledValue = sourceContext.getItem(propertyName);
          if (pulledValue !== undefined) {
            super.setItem(propertyName, pulledValue);
            break;
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to pull ${propertyName}:`, error);
    }
  }

  /**
   * @private
   * @method #executePullAndGetItem
   * @description Executes the actual pull operation and returns the item if available.
   * @param {Context} sourceContext - The source context to pull from.
   * @param {string} itemPath - The path of the item to pull.
   * @param {object} options - Options for the pull operation.
   * @returns {*|null} The pulled item or null if not found.
   */
  #executePullAndGetItem(sourceContext, itemPath, options) {
    const pulledValue = sourceContext.getItem(itemPath);
    if (pulledValue !== undefined) {
      ContextOperations.pullItems(sourceContext, this, [itemPath], 'mergeNewerWins', options);
      return this.getItem(itemPath);
    }
    return null;
  }

  /**
   * @private
   * @method #tryPullFromSource
   * @description Attempts to pull an item from a single source context.
   * @param {Context} sourceContext - The source context to pull from.
   * @param {string} itemPath - The path of the item to pull.
   * @param {object} options - Options for the pull operation.
   * @returns {*|null} The pulled value or null if not found/failed.
   */
  #tryPullFromSource(sourceContext, itemPath, options) {
    const pullResult = ContextOperations.pullItems(
      sourceContext,
      this,
      [itemPath],
      'mergeNewerWins',
      { ...options, dryRun: true }
    );

    if (pullResult.success && pullResult.changes.length > 0) {
      return this.#executePullAndGetItem(sourceContext, itemPath, options);
    }

    return null;
  }

  /**
   * @private
   * @method #iterateSourcesForPull
   * @description Iterates through source contexts attempting to pull the specified item.
   * @param {Context[]} pullFrom - Array of source contexts to pull from.
   * @param {string} itemPath - The path of the item to pull.
   * @param {object} options - Options for the pull operation.
   * @returns {*|undefined} The pulled item or undefined if not found.
   */
  #iterateSourcesForPull(pullFrom, itemPath, options) {
    for (const sourceContext of pullFrom) {
      const result = this.#tryPullFromSource(sourceContext, itemPath, options);
      if (result !== null) {
        return result;
      }
    }
    return undefined;
  }

    /**
   * @private
   * @method #determineSingleItemResolution
   * @description Determines how a single item conflict was resolved based on merge results.
   * @param {object} mergeResult - The result from the merge operation.
   * @param {string} itemPath - The path of the item that was merged.
   * @returns {string|null} The resolution type or null if no conflict.
   */
  #determineSingleItemResolution(mergeResult, itemPath) {
    if (mergeResult.conflicts === 0) return null;

    const change = mergeResult.changes.find(change => change.path === itemPath);
    if (!change) return 'skipped';

    switch (change.action) {
      case 'sourcePreferred':
        return 'source';
      case 'targetPreferred':
        return 'target';
      case 'customResolution':
        return 'custom';
      default:
        return 'skipped';
    }
  }

  /**
   * @private
   * @method #getSingleItemFinalValue
   * @description Gets the final value for a single item after merge operation.
   * @param {object} mergeResult - The result from the merge operation.
   * @param {string} itemPath - The path of the item that was merged.
   * @param {boolean} isDryRun - Whether this was a dry run operation.
   * @returns {*} The final value or undefined if not available.
   */
  #getSingleItemFinalValue(mergeResult, itemPath, isDryRun) {
    if (isDryRun) {
      const change = mergeResult.changes.find(change => change.path === itemPath);
      return change ? change.newValue : undefined;
    }

    // For non-dry runs, get the actual current value
    return this.getItem(itemPath);
  }

  // Public methods

  /**
   * @method setItem
   * @description Sets an item in the context with optional pull/push operations.
   * @param {string} itemPath - The path of the item to set.
   * @param {*} itemValue - The value to set.
   * @param {object} [options] - Options for the set operation.
   * @param {boolean} [options.pull] - Whether to pull from sources before setting.
   * @param {Context[]} [options.pullFrom] - Array of contexts to pull from.
   * @param {boolean} [options.push] - Whether to push to targets after setting.
   * @param {Context[]} [options.pushTo] - Array of contexts to push to.
   * @param {boolean} [options.ignoreFrozen=false] - If true, allows overwriting frozen items without error.
   * @param {object} [overrides={}] - Override options for the underlying setItem call.
   */
  setItem(itemPath, itemValue, options = {}, overrides = {}) {
    const finalOptions = this.#prepareFinalOptions(options);
    let finalValue = itemValue;

    if (finalOptions.pull) {
      finalValue = this.#performPull(finalOptions, itemPath, finalValue);
    }

    // Merge options and overrides, with overrides taking precedence
    const mergedOptions = { ...finalOptions, ...overrides };
    
    super.setItem(itemPath, finalValue, mergedOptions);

    if (finalOptions.push) {
      this.#performPush(finalOptions, itemPath);
    }
  }

  /**
   * @method pullAndGetItem
   * @description Pulls the specified item from the defined sources and returns it.
   * If the item is not found, it returns undefined.
   * @param {object} params - Parameters for pulling and getting the item.
   * @param {string} params.itemPath - The path of the item to pull and get.
   * @param {Context[]} [params.pullFrom=this.#operationsParams.pullFrom] - Sources to pull from.
   * @param {object} [params.options={}] - Additional options for pulling.
   * @returns {ContextItem|undefined} The pulled item or undefined if not found.
   */
  pullAndGetItem({itemPath, pullFrom = this.#operationsParams.pullFrom, options = {}}) {
    if (!Array.isArray(pullFrom) || pullFrom.length === 0) {
      return undefined;
    }

    try {
      return this.#iterateSourcesForPull(pullFrom, itemPath, options);
    } catch (error) {
      console.warn(`Failed to pull and get item ${itemPath}:`, error);
      return undefined;
    }
  }

  /**
   * @method compare
   * @description Compares this context with another context object.
   * @param {Context|ContextContainer|ContextItem} target - The target context object to compare with.
   * @param {object} [options={}] - Comparison options.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to compare ('createdAt', 'modifiedAt', 'lastAccessedAt').
   * @param {Context|ContextContainer|ContextItem} [options.sourceContext=this] - The source context to use for comparison.
   * @returns {object} Comparison result with details.
   */
  compare(target, options = {}) {
    const { sourceContext = this, ...otherOptions } = options;
    return ContextSync.compare(sourceContext, target, otherOptions);
  }

  /**
   * Performs a sophisticated merge of this context with a target context using ContextMerger.
   * This is the primary entry point for all merge operations, providing granular synchronization
   * at the ContextItem level with comprehensive options for conflict resolution and change tracking.
   *
   * The method supports multiple approaches for controlling which items are merged:
   * 1. Component-level filtering (includeComponents/excludeComponents)
   * 2. Path-based filtering (allowOnly/blockOnly/singleItem)
   * 3. Pattern-based filtering (matchPattern)
   * 4. Custom logic filtering (customFilter/onConflict)
   *
   * @param {Context|ContextContainer|ContextItem} target - The target context to merge with.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply. Available strategies:
   *   - 'mergeNewerWins': Choose the item with the newer timestamp (default)
   *   - 'mergeSourcePriority': Always prefer source context items over target
   *   - 'mergeTargetPriority': Always prefer target context items over source
   *   - 'updateSourceToTarget': Update source items to match target values
   *   - 'updateTargetToSource': Update target items to match source values
   *   - 'replace': Replace entire containers rather than merging individual items
   *   - 'noAction': Compare but don't modify anything (analysis mode)
   *
   * @param {object} [options={}] - Comprehensive merge options to control behavior.
   *
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp field to use for item comparisons.
   *   Options: 'createdAt', 'modifiedAt', 'lastAccessedAt'. Used when strategy involves timestamp comparison.
   *
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve existing metadata (timestamps, etc.)
   *   when updating items. If false, metadata will be reset during merge operations.
   *
   * @param {boolean} [options.createMissing=true] - Whether to create items that exist in source but not in target.
   *   If false, only existing items will be updated.
   *
   * @param {boolean} [options.dryRun=false] - If true, performs analysis without making actual changes.
   *   Useful for previewing merge operations before executing them.
   *
   * // === COMPONENT-LEVEL FILTERING ===
   * @param {string[]} [options.includeComponents] - Array of component keys to include in merge.
   *   If specified, only these components will be processed. Available components:
   *   ['schema', 'constants', 'manifest', 'flags', 'state', 'data', 'settings']
   *   Example: ['data', 'settings'] - only merge data and settings components
   *
   * @param {string[]} [options.excludeComponents=[]] - Array of component keys to exclude from merging.
   *   These components will be skipped entirely during the merge operation.
   *   Example: ['schema', 'constants'] - merge everything except schema and constants
   *
   * // === PATH-BASED FILTERING (Convenience Parameters) ===
   * // These parameters provide simplified filtering and are converted to onConflict filters internally.
   * // Use these for common filtering scenarios instead of writing custom onConflict functions.
   *
   * @param {string[]} [options.allowOnly] - Array of specific item paths to allow in the merge.
   *   Only items with paths matching these patterns will be merged. All others are skipped.
   *   Paths use dot notation: 'component.item' or 'component.nested.item'
   *   Example: ['data.inventory', 'settings.volume', 'flags.experimentalFeatures']
   *   Note: Cannot be used with blockOnly, singleItem, matchPattern, or customFilter
   *
   * @param {string[]} [options.blockOnly] - Array of specific item paths to exclude from the merge.
   *   Items with paths matching these patterns will be skipped. All others are merged.
   *   Example: ['data.temporaryCache', 'state.uiState', 'settings.debug']
   *   Note: Cannot be used with allowOnly, singleItem, matchPattern, or customFilter
   *
   * @param {string} [options.singleItem] - Single item path to merge exclusively.
   *   Only this specific item will be processed, all others are skipped.
   *   Example: 'data.playerStats.level' - merge only the player level
   *   Note: Cannot be used with allowOnly, blockOnly, matchPattern, or customFilter
   *
   * @param {RegExp} [options.matchPattern] - Regular expression pattern to match against item paths.
   *   Only items whose paths match this pattern will be merged.
   *   Example: /data\.player/ - merge all items under data.player
   *   Example: /settings\..*volume$/ - merge all settings ending with 'volume'
   *   Note: Cannot be used with allowOnly, blockOnly, singleItem, or customFilter
   *
   * @param {Function} [options.customFilter] - Custom filter function for advanced path-based filtering.
   *   Function signature: (sourceItem, targetItem, itemPath) => boolean
   *   Return true to include the item in merge, false to skip it.
   *   Example: (src, tgt, path) => src?.version > tgt?.version
   *   Note: Cannot be used with allowOnly, blockOnly, singleItem, or matchPattern
   *
   * // === ADVANCED CONFLICT RESOLUTION ===
   * @param {Function} [options.onConflict] - Advanced custom conflict resolver function.
   *   This provides full control over merge decisions for each conflicting item.
   *   Function signature: (sourceItem, targetItem, itemPath) => ContextItem|null
   *   - Return sourceItem to choose source
   *   - Return targetItem to choose target
   *   - Return null to skip this item
   *   - Return a new ContextItem for custom resolution
   *   Example: (src, tgt, path) => path.includes('critical') ? src : tgt
   *   Note: If specified, convenience parameters (allowOnly, blockOnly, etc.) are ignored
   *
   * @returns {object} Detailed merge result with comprehensive statistics and change tracking.
   * @returns {boolean} returns.success - Whether the merge operation completed successfully.
   * @returns {string} returns.strategy - The merge strategy that was used.
   * @returns {number} returns.itemsProcessed - Total number of items that were evaluated.
   * @returns {number} returns.conflicts - Number of conflicts that were resolved.
   * @returns {Array} returns.changes - Array of change objects describing what was modified.
   * @returns {object} returns.statistics - Detailed statistics about the merge operation.
   * @returns {number} returns.statistics.sourcePreferred - Items where source was chosen.
   * @returns {number} returns.statistics.targetPreferred - Items where target was chosen.
   * @returns {number} returns.statistics.created - New items created in target.
   * @returns {number} returns.statistics.updated - Existing items that were updated.
   * @returns {number} returns.statistics.skipped - Items that were skipped.
   * @returns {Array} returns.errors - Array of error objects if any occurred.
   *
   * @example
   * // Basic merge with newer items winning
   * const result = context.merge(targetContext);
   *
   * @example
   * // Merge only specific data with source priority
   * const result = context.merge(targetContext, 'mergeSourcePriority', {
   *   allowOnly: ['data.inventory', 'settings.volume', 'flags.experimentalFeatures']
   * });
   *
   * @example
   * // Merge everything except temporary data
   * const result = context.merge(targetContext, 'mergeNewerWins', {
   *   blockOnly: ['data.temporaryCache', 'state.pendingRequests']
   * });
   *
   * @example
   * // Merge single item with metadata preservation
   * const result = context.merge(targetContext, 'mergeSourcePriority', {
   *   singleItem: 'data.playerStats.level',
   *   preserveMetadata: true
   * });
   *
   * @example
   * // Merge items matching a pattern
   * const result = context.merge(targetContext, 'mergeNewerWins', {
   *   matchPattern: /data\.player/
   * });
   *
   * @example
   * // Merge with custom filtering logic
   * const result = context.merge(targetContext, 'mergeNewerWins', {
   *   customFilter: (sourceItem, targetItem, itemPath) => {
   *     return sourceItem?.version > targetItem?.version;
   *   }
   * });
   *
   * @example
   * // Advanced merge with custom conflict resolution
   * const result = context.merge(targetContext, 'mergeNewerWins', {
   *   excludeComponents: ['schema'],
   *   preserveMetadata: true,
   *   onConflict: (sourceItem, targetItem, path) => {
   *     if (path.includes('critical')) return sourceItem;
   *     if (path.includes('cache')) return null; // skip
   *     return targetItem; // default to target
   *   }
   * });
   *
   * @example
   * // Preview merge without making changes
   * const preview = context.merge(targetContext, 'mergeNewerWins', {
   *   dryRun: true,
   *   includeComponents: ['data', 'settings']
   * });
   * console.log(`Would process ${preview.itemsProcessed} items with ${preview.conflicts} conflicts`);
   * preview.changes.forEach(change => console.log(`${change.action}: ${change.path}`));
   */
  merge(target, strategy = 'mergeNewerWins', options = {}) {
    return ContextMerger.merge(this, target, strategy, options);
  }

  /**
   * @method mergeItem
   * @description Merges a single item between this context and a target context.
   * This is a convenience method that simplifies merging individual items
   * without needing to configure component-level or path-based filtering.
   *
   * @param {Context|ContextContainer|ContextItem} target - The target context to merge with.
   * @param {string} itemPath - The path of the specific item to merge (e.g., 'data.playerStats', 'settings.volume').
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply. Available strategies:
   *   - 'mergeNewerWins': Choose the item with the newer timestamp (default)
   *   - 'mergeSourcePriority': Always prefer source context item over target
   *   - 'mergeTargetPriority': Always prefer target context item over source
   *   - 'updateSourceToTarget': Update source item to match target value
   *   - 'updateTargetToSource': Update target item to match source value
   *   - 'replace': Replace the item entirely rather than merging
   *   - 'noAction': Compare but don't modify anything (analysis mode)
   * @param {object} [options={}] - Additional merge options.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp field to use for comparison.
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve existing metadata.
   * @param {boolean} [options.dryRun=false] - If true, performs analysis without making changes.
   * @param {Function} [options.onConflict] - Custom conflict resolver for this specific item.
   * @returns {object} Detailed merge result for the single item.
   * @returns {boolean} returns.success - Whether the merge operation completed successfully.
   * @returns {string} returns.itemPath - The path of the item that was merged.
   * @returns {boolean} returns.wasConflict - Whether there was a conflict between source and target.
   * @returns {string|null} returns.resolution - How the conflict was resolved ('source', 'target', 'skipped', 'custom').
   * @returns {Array} returns.changes - Array of change objects (0 or 1 items).
   * @returns {*} returns.finalValue - The final value that was set (if not a dry run).
   * @returns {Array} returns.errors - Array of error objects if any occurred.
   *
   * @example
   * // Merge a single data item with newer wins strategy
   * const result = context.mergeItem(targetContext, 'data.playerStats.level');
   *
   * @example
   * // Force source priority for a specific setting
   * const result = context.mergeItem(targetContext, 'settings.volume', 'mergeSourcePriority');
   *
   * @example
   * // Preview what would happen to a specific item
   * const preview = context.mergeItem(targetContext, 'data.inventory.items', 'mergeNewerWins', {
   *   dryRun: true
   * });
   *
   * @example
   * // Merge with custom conflict resolution for this item
   * const result = context.mergeItem(targetContext, 'flags.experimentalFeatures', 'mergeNewerWins', {
   *   onConflict: (sourceItem, targetItem, path) => {
   *     // Custom logic for this specific item
   *     return sourceItem.value.enabled ? sourceItem : targetItem;
   *   }
   * });
   */
  mergeItem(target, itemPath, strategy = 'mergeNewerWins', options = {}) {
    // Validate inputs
    if (!itemPath || typeof itemPath !== 'string') {
      throw new Error('itemPath must be a non-empty string');
    }

    // Use the existing merge method with singleItem option
    const mergeResult = this.merge(target, strategy, {
      ...options,
      singleItem: itemPath
    });

    // Transform the result to be more specific to single-item operations
    const singleItemResult = {
      success: mergeResult.success,
      itemPath: itemPath,
      wasConflict: mergeResult.conflicts > 0,
      resolution: this.#determineSingleItemResolution(mergeResult, itemPath),
      changes: mergeResult.changes,
      finalValue: this.#getSingleItemFinalValue(mergeResult, itemPath, options.dryRun),
      errors: mergeResult.errors
    };

    return singleItemResult;
  }

  /**
   * @method analyzeMerge
   * @description Creates a detailed preview of potential merge operations without executing them.
   * This method provides analysis of what would happen during a merge operation,
   * allowing you to preview changes before committing to them.
   *
   * @param {Context|ContextContainer|ContextItem} target - The target context to analyze against.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to analyze.
   * @param {object} [options={}] - Analysis options. Same as merge() method options.
   * @returns {object} Detailed analysis of what would happen during merge.
   * @returns {boolean} returns.success - Whether the analysis completed successfully.
   * @returns {number} returns.itemsProcessed - Total number of items that would be evaluated.
   * @returns {number} returns.conflicts - Number of conflicts that would be encountered.
   * @returns {Array} returns.changes - Array of potential change objects.
   * @returns {object} returns.statistics - Detailed statistics about the potential merge.
   *
   * @example
   * // Preview what would be merged for specific components
   * const preview = context.analyzeMerge(targetContext, 'mergeNewerWins', {
   *   includeComponents: ['data'],
   *   allowOnly: ['data.playerStats', 'data.inventory']
   * });
   *
   * console.log(`Would process ${preview.itemsProcessed} items with ${preview.conflicts} conflicts`);
   * preview.changes.forEach(change => console.log(`${change.action}: ${change.path}`));
   */
  analyzeMerge(target, strategy = 'mergeNewerWins', options = {}) {
    return ContextMerger.analyze(this, target, strategy, options);
  }

  /**
   * @method getPerformanceMetrics
   * @description Returns a copy of the current performance metrics.
   * @returns {object} Performance metrics including pull/push operations and timing data.
   */
  getPerformanceMetrics() {
    return { ...this.#performanceMetrics };
  }

  // Property getters (maintain direct access style)

  /**
   * @type {boolean}
   * @readonly
   * @description Duck typing identifier for Context objects. Used by other classes to identify
   * Context instances without requiring direct imports and avoiding circular dependencies.
   */
  get isContextObject() {
    return this.#isContextObject;
  }

  /**
   * @type {ContextContainer}
   * @readonly
   */
  get schema() {
    this.#pullPropertyIfNeeded('schema');
    return this.getWrappedItem('schema');
  }

  /**
   * @type {ContextContainer}
   * @readonly
   */
  get constants() {
    this.#pullPropertyIfNeeded('constants');
    return this.getWrappedItem('constants');
  }

  /**
   * @type {ContextContainer}
   * @readonly
   */
  get manifest() {
    this.#pullPropertyIfNeeded('manifest');
    return this.getWrappedItem('manifest');
  }

  /**
   * @type {ContextContainer}
   * @readonly
   */
  get flags() {
    this.#pullPropertyIfNeeded('flags');
    return this.getWrappedItem('flags');
  }

  /**
   * @type {ContextContainer}
   * @readonly
   */
  get state() {
    this.#pullPropertyIfNeeded('state');
    return this.getWrappedItem('state');
  }

  /**
   * @type {ContextContainer}
   * @readonly
   */
  get data() {
    this.#pullPropertyIfNeeded('data');
    return this.getWrappedItem('data');
  }

  /**
   * @type {ContextContainer}
   * @readonly
   */
  get settings() {
    this.#pullPropertyIfNeeded('settings');
    return this.getWrappedItem('settings');
  }

  /**
   * Gets the naming convention for the context.
   * @type {ContextContainer}
   * @readonly
   */
  get namingConvention() {
    return this.#namingConvention;
  }
}

export default Context;