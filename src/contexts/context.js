/**
 * @file context.js
 * @description This file defines the Context class, which encapsulates various data sources and settings for the module.
 * @path /src/context/context.js
 */
import manifest from '@manifest';
import constants from '@/constants/constants';
import Validator from '@/utils/static/validator';
import {ContextContainer} from '../contexts/helpers/contextContainer.js';
import ContextMerger from '../contexts/helpers/contextMerger.js';
import ContextSync from '../contexts/helpers/contextSync.js';

export const DEFAULT_INITIALIZATION_PARAMS = {
  contextSchema: constants.context.schema,
  namingConvention: constants.context.naming,
  constants: constants,
  manifest: manifest,
  flags: constants.flags,
  data: {},
  settings: {}
};

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
   */
  constructor({ initializationParams = DEFAULT_INITIALIZATION_PARAMS } = {}) {
    // Initialize ContextContainer part.
    super({}, {}, { recordAccess: false, recordAccessForMetadata: false, defaultItemWrapAs: 'ContextContainer' });

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
    this.setItem('schema', Object.freeze(contextSchema));
    this.setItem('constants', Object.freeze(consts));
    this.setItem('manifest', Object.freeze(manifestData));
    this.setItem('flags', flags);
    this.setItem('state', {}); // State is initialized as an empty container
    this.setItem('data', data);
    this.setItem('settings', settings);

    // #namingConvention remains a private property, not an item in the container.
    this.#namingConvention = new ContextContainer(Object.freeze(namingConvention), {}, { recordAccess: false });
  }

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

    const { contextSchema, namingConvention, constants, manifest, flags, data, settings } = constructorArgs; // timestamp removed

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
    // timestamp validation removed
    }

  // Add getters for main properties to maintain direct access style
  // and ensure ContextGetter compatibility.
  /** @type {ContextContainer} */
  get schema() { return this.getItem('schema'); }
  /** @type {ContextContainer} */
  get constants() { return this.getItem('constants'); }
  /** @type {ContextContainer} */
  get manifest() { return this.getItem('manifest'); }
  /** @type {ContextContainer} */
  get flags() { return this.getItem('flags'); }
  /** @type {ContextContainer} */
  get state() { return this.getItem('state'); }
  /** @type {ContextContainer} */
  get data() { return this.getItem('data'); }
  /** @type {ContextContainer} */
  get settings() { return this.getItem('settings'); }

  /**
   * Gets the naming convention for the context.
   * @type {ContextContainer}
   * @readonly
   */
  get namingConvention() {
    return this.#namingConvention;
  }

  /**
   * Compares this context with another context object.
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
   * Performs a deep merge of this context with a target context using ContextMerger.
   * This method provides granular synchronization at the ContextItem level with comprehensive
   * options for conflict resolution and change tracking.
   *
   * @param {Context|ContextContainer|ContextItem} target - The target context to merge with.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply. Options include:
   *   - 'mergeNewerWins': Choose the item with the newer timestamp
   *   - 'mergeSourcePriority': Always prefer source context items
   *   - 'mergeTargetPriority': Always prefer target context items
   *   - 'updateSourceToTarget': Update source items to match target
   *   - 'updateTargetToSource': Update target items to match source
   *   - 'replace': Replace entire containers rather than merging items
   *   - 'noAction': Compare but don't modify anything
   * @param {object} [options={}] - Merge options to control behavior.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to use for comparisons ('createdAt', 'modifiedAt', 'lastAccessedAt').
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during merge operations.
   * @param {boolean} [options.createMissing=true] - Whether to create missing items in the target context.
   * @param {string[]} [options.excludeComponents=[]] - Array of component keys to exclude from merging.
   * @param {string[]} [options.includeComponents] - Array of component keys to include (if specified, only these will be merged).
   * @param {boolean} [options.dryRun=false] - If true, performs comparison without making changes.
   * @param {Function} [options.onConflict] - Custom callback function called for each conflict: (sourceItem, targetItem, path) => chosenItem
   * @returns {object} Detailed merge result with statistics and applied changes.
   *
   * @example
   * ```javascript
   * const result = context.merge(targetContext, 'mergeNewerWins', {
   *   excludeComponents: ['schema'],
   *   preserveMetadata: true,
   *   onConflict: (sourceItem, targetItem, path) => {
   *     return path.includes('critical') ? sourceItem : null;
   *   }
   * });
   *
   * console.log(`Merged ${result.itemsProcessed} items with ${result.conflicts} conflicts`);
   * ```
   */
  merge(target, strategy = 'mergeNewerWins', options = {}) {
    return ContextMerger.merge(this, target, strategy, options);
  }

  /**
   * Merges only specific items between this context and target using path-based filtering.
   * @param {Context} target - The target Context instance to merge into.
   * @param {string[]} allowedPaths - Array of item paths to merge (e.g., ['data.inventory', 'settings.volume'])
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object} Detailed merge result with statistics and changes.
   * 
   * @example
   * // Merge only player stats and UI settings
   * const result = context.mergeOnly(targetContext, [
   *   'data.playerStats',
   *   'settings.ui.theme',
   *   'settings.ui.language'
   * ]);
   */
  mergeOnly(target, allowedPaths, strategy = 'mergeNewerWins', options = {}) {
    return ContextMerger.merge(this, target, strategy, {
      ...options,
      allowOnly: allowedPaths
    });
  }

  /**
   * Merges all items except specific ones using path-based filtering.
   * @param {Context} target - The target Context instance to merge into.
   * @param {string[]} blockedPaths - Array of item paths to exclude from merge
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object} Detailed merge result with statistics and changes.
   * 
   * @example
   * // Merge everything except temporary data
   * const result = context.mergeExcept(targetContext, [
   *   'data.temporaryCache',
   *   'state.pendingRequests'
   * ]);
   */
  mergeExcept(target, blockedPaths, strategy = 'mergeNewerWins', options = {}) {
    return ContextMerger.merge(this, target, strategy, {
      ...options,
      blockOnly: blockedPaths
    });
  }

  /**
   * Merges a single specific item between this context and target.
   * @param {Context} target - The target Context instance to merge into.
   * @param {string} itemPath - The specific item path to merge (e.g., 'data.playerStats.level')
   * @param {object} [options={}] - Merge options.
   * @param {string} [options.strategy='mergeNewerWins'] - The merge strategy to apply.
   * @param {boolean} [options.createMissing=true] - Whether to create the item if it doesn't exist in target.
   * @param {boolean} [options.preserveMetadata=false] - Whether to preserve existing metadata.
   * @param {boolean} [options.dryRun=false] - If true, performs analysis without making changes.
   * @returns {object} Detailed merge result for the single item.
   * 
   * @example
   * // Merge only the player level with source priority
   * const result = context.mergeSingleItem(
   *   targetContext, 
   *   'data.playerStats.level',
   *   { strategy: 'mergeSourcePriority', preserveMetadata: true }
   * );
   */
  mergeSingleItem(target, itemPath, options = {}) {
    const { strategy = 'mergeNewerWins', ...mergeOptions } = options;
    return ContextMerger.merge(this, target, strategy, {
      ...mergeOptions,
      singleItem: itemPath
    });
  }

  /**
   * Merges items matching a regular expression pattern.
   * @param {Context} target - The target Context instance to merge into.
   * @param {RegExp} pattern - Regular expression to match against item paths
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object} Detailed merge result with statistics and changes.
   * 
   * @example
   * // Merge all player-related data
   * const result = context.mergePattern(
   *   targetContext, 
   *   /data\.player/
   * );
   * 
   * @example
   * // Merge all settings that end with 'volume'
   * const result = context.mergePattern(
   *   targetContext, 
   *   /settings\..*volume$/
   * );
   */
  mergePattern(target, pattern, strategy = 'mergeNewerWins', options = {}) {
    return ContextMerger.merge(this, target, strategy, {
      ...options,
      matchPattern: pattern
    });
  }

  /**
   * Merges items based on a custom condition function.
   * @param {Context} target - The target Context instance to merge into.
   * @param {Function} conditionFn - Function that receives (sourceItem, targetItem, itemPath) and returns boolean
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to apply.
   * @param {object} [options={}] - Additional merge options.
   * @returns {object} Detailed merge result with statistics and changes.
   * 
   * @example
   * // Merge items where source has higher version
   * const result = context.mergeWhere(
   *   targetContext,
   *   (sourceItem, targetItem, itemPath) => {
   *     return sourceItem?.version > targetItem?.version;
   *   }
   * );
   * 
   * @example
   * // Merge only items that have been modified recently
   * const result = context.mergeWhere(
   *   targetContext,
   *   (sourceItem, targetItem, itemPath) => {
   *     const hourAgo = Date.now() - (60 * 60 * 1000);
   *     return sourceItem?.timestamp > hourAgo;
   *   }
   * );
   */
  mergeWhere(target, conditionFn, strategy = 'mergeNewerWins', options = {}) {
    return ContextMerger.merge(this, target, strategy, {
      ...options,
      customFilter: conditionFn
    });
  }

  /**
   * Creates a detailed preview of potential merge operations without executing them.
   * @param {Context} target - The target context.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy to analyze.
   * @param {object} [options={}] - Analysis options. Same as merge() options.
   * @returns {object} Detailed analysis of what would happen during merge.
   * 
   * @example
   * // Preview what would be merged for specific components
   * const preview = context.analyzeMerge(targetContext, 'mergeNewerWins', {
   *   includeComponents: ['data']
   * });
   * 
   * console.log(`Would process ${preview.itemsProcessed} items with ${preview.conflicts} conflicts`);
   * preview.changes.forEach(change => console.log(`${change.action}: ${change.path}`));
   */
  analyzeMerge(target, strategy = 'mergeNewerWins', options = {}) {
    return ContextMerger.analyze(this, target, strategy, options);
  }
}

export default Context