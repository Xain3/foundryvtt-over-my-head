/**
 * @file context.js
 * @description This file defines the Context class, which encapsulates various data sources and settings for the module.
 * @path /src/context/context.js
 */
import manifest from '@manifest';
import constants from '@/constants/constants';
import Validator from '@/utils/static/validator';
import {ContextContainer} from '../contexts/helpers/contextContainer.js';
import ContextSync from './helpers/contextSync.js';
import ContextMerger from '../contexts/helpers/contextMerger.js';

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
   * Synchronizes this context with another context object.
   * @deprecated Use the merge() method instead for more sophisticated merging capabilities.
   * @param {Context|ContextContainer|ContextItem} target - The target context object to sync with.
   * @param {string} operation - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @param {boolean} [options.deepSync=true] - Whether to recursively sync nested containers.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to use for comparisons.
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during sync.
   * @param {Context|ContextContainer|ContextItem} [options.sourceContext=this] - The source context to use for sync.
   * @returns {object} Synchronization result with details.
   */
  sync(target, operation, options = {}) {
    const { sourceContext = this, ...otherOptions } = options;
    return ContextSync.sync(sourceContext, target, operation, otherOptions);
  }

  /**
   * Automatically synchronizes this context with another context object.
   * @deprecated Use the merge() method with 'mergeNewerWins' strategy instead for more sophisticated merging capabilities.
   * @param {Context|ContextContainer|ContextItem} target - The target context object to sync with.
   * @param {object} [options={}] - Options for automatic sync determination.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to use for comparisons.
   * @param {boolean} [options.deepSync=true] - Whether to recursively sync nested containers.
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during sync.
   * @param {Context|ContextContainer|ContextItem} [options.sourceContext=this] - The source context to use for sync.
   * @returns {object} Automatic synchronization result.
   */
  autoSync(target, options = {}) {
    const { sourceContext = this, ...otherOptions } = options;
    return ContextSync.autoSync(sourceContext, target, otherOptions);
  }

  /**
   * Updates this context to match the target context.
   * @deprecated Use the merge() method with 'updateSourceToTarget' strategy instead.
   * @param {Context|ContextContainer|ContextItem} target - The target context to match.
   * @param {object} [options={}] - Update options.
   * @param {boolean} [options.deepSync=true] - Whether to recursively sync nested containers.
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during sync.
   * @param {Context|ContextContainer|ContextItem} [options.sourceContext=this] - The source context to use for sync.
   * @returns {object} Update result with details.
   */
  updateToMatch(target, options = {}) {
    const { sourceContext = this, ...otherOptions } = options;
    return ContextSync.sync(sourceContext, target, ContextSync.SYNC_OPERATIONS.UPDATE_SOURCE_TO_TARGET, otherOptions);
  }

  /**
   * Updates the target context to match this context.
   * @deprecated Use the merge() method with 'updateTargetToSource' strategy instead.
   * @param {Context|ContextContainer|ContextItem} target - The target context to update.
   * @param {object} [options={}] - Update options.
   * @param {boolean} [options.deepSync=true] - Whether to recursively sync nested containers.
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during sync.
   * @param {Context|ContextContainer|ContextItem} [options.sourceContext=this] - The source context to use for sync.
   * @returns {object} Update result with details.
   */
  updateTarget(target, options = {}) {
    const { sourceContext = this, ...otherOptions } = options;
    return ContextSync.sync(sourceContext, target, ContextSync.SYNC_OPERATIONS.UPDATE_TARGET_TO_SOURCE, otherOptions);
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
   * Merges this context with the target, with newer timestamps winning.
   * @deprecated Use merge(target, 'mergeNewerWins', options) instead. This method will be removed in a future version.
   * @param {Context|ContextContainer|ContextItem} target - The target context to merge with.
   * @param {object} [options={}] - Merge options.
   * @param {boolean} [options.deepSync=true] - Whether to recursively sync nested containers.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to use for comparisons.
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during sync.
   * @param {Context|ContextContainer|ContextItem} [options.sourceContext=this] - The source context to use for sync.
   * @returns {object} Merge result with details.
   */
  mergeNewerWins(target, options = {}) {
    console.warn('Context.mergeNewerWins() is deprecated. Use Context.merge(target, "mergeNewerWins", options) instead.');
    const { sourceContext = this, ...otherOptions } = options;
    return ContextSync.sync(sourceContext, target, ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS, otherOptions);
  }

  /**
   * Merges this context with the target, with this context having priority.
   * @deprecated Use merge(target, 'mergeSourcePriority', options) instead. This method will be removed in a future version.
   * @param {Context|ContextContainer|ContextItem} target - The target context to merge with.
   * @param {object} [options={}] - Merge options.
   * @param {boolean} [options.deepSync=true] - Whether to recursively sync nested containers.
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during sync.
   * @param {Context|ContextContainer|ContextItem} [options.sourceContext=this] - The source context to use for sync.
   * @returns {object} Merge result with details.
   */
  mergeWithPriority(target, options = {}) {
    console.warn('Context.mergeWithPriority() is deprecated. Use Context.merge(target, "mergeSourcePriority", options) instead.');
    const { sourceContext = this, ...otherOptions } = options;
    return ContextSync.sync(sourceContext, target, ContextSync.SYNC_OPERATIONS.MERGE_SOURCE_PRIORITY, otherOptions);
  }

  /**
   * Merges this context with the target, with the target having priority.
   * @deprecated Use merge(target, 'mergeTargetPriority', options) instead. This method will be removed in a future version.
   * @param {Context|ContextContainer|ContextItem} target - The target context to merge with.
   * @param {object} [options={}] - Merge options.
   * @param {boolean} [options.deepSync=true] - Whether to recursively sync nested containers.
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during sync.
   * @param {Context|ContextContainer|ContextItem} [options.sourceContext=this] - The source context to use for sync.
   * @returns {object} Merge result with details.
   */
  mergeWithTargetPriority(target, options = {}) {
    console.warn('Context.mergeWithTargetPriority() is deprecated. Use Context.merge(target, "mergeTargetPriority", options) instead.');
    const { sourceContext = this, ...otherOptions } = options;
    return ContextSync.sync(sourceContext, target, ContextSync.SYNC_OPERATIONS.MERGE_TARGET_PRIORITY, otherOptions);
  }

  /**
   * Validates that this context is compatible with another context for synchronization.
   * @param {Context|ContextContainer|ContextItem} target - The target context to validate compatibility with.
   * @param {object} [options={}] - Validation options.
   * @param {Context|ContextContainer|ContextItem} [options.sourceContext=this] - The source context to use for validation.
   * @returns {boolean} True if contexts are compatible for sync.
   */
  isCompatibleWith(target, options = {}) {
    const { sourceContext = this } = options;
    return ContextSync.validateCompatibility(sourceContext, target);
  }

  /**
   * Synchronizes a specific component (ContextContainer or ContextItem) with the same component in a target context.
   * @param {string} componentKey - The key of the component to sync ('schema', 'constants', 'manifest', 'flags', 'state', 'data', 'settings').
   * @param {Context} target - The target context to sync the component with.
   * @param {string} operation - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @param {boolean} [options.deepSync=true] - Whether to recursively sync nested containers.
   * @param {string} [options.compareBy='modifiedAt'] - Which timestamp to use for comparisons.
   * @param {boolean} [options.preserveMetadata=true] - Whether to preserve metadata during sync.
   * @returns {object} Synchronization result with details.
   * @throws {Error} If the component key is invalid or contexts are incompatible.
   *
   * @example
   * ```javascript
   * const context1 = new Context();
   * const context2 = new Context();
   *
   * // Sync only the 'data' component between contexts
   * const result = context1.syncComponent('data', context2, 'merge');
   * ```
   */
  syncComponent(componentKey, target, operation, options = {}) {
    const validComponents = ['schema', 'constants', 'manifest', 'flags', 'state', 'data', 'settings'];

    if (!validComponents.includes(componentKey)) {
      throw new Error(`Invalid component key: ${componentKey}. Valid keys are: ${validComponents.join(', ')}`);
    }

    if (!(target instanceof Context)) {
      throw new Error('Target must be a Context instance');
    }

    const sourceComponent = this[componentKey];
    const targetComponent = target[componentKey];

    if (!sourceComponent || !targetComponent) {
      throw new Error(`Component '${componentKey}' not found in source or target context`);
    }

    return ContextSync.sync(sourceComponent, targetComponent, operation, options);
  }

  /**
   * Automatically synchronizes a specific component with the same component in a target context.
   * @param {string} componentKey - The key of the component to sync.
   * @param {Context} target - The target context to sync the component with.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   *
   * @example
   * ```javascript
   * const result = context1.autoSyncComponent('state', context2);
   * ```
   */
  autoSyncComponent(componentKey, target, options = {}) {
    return this.syncComponent(componentKey, target, 'auto', { ...options, autoSync: true });
  }

  /**
   * Synchronizes the schema component with another context.
   * @param {Context} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncSchema(target, operation = 'auto', options = {}) {
    if (operation === 'auto') {
      return this.autoSyncComponent('schema', target, options);
    }
    return this.syncComponent('schema', target, operation, options);
  }

  /**
   * Synchronizes the constants component with another context.
   * @param {Context} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncConstants(target, operation = 'auto', options = {}) {
    if (operation === 'auto') {
      return this.autoSyncComponent('constants', target, options);
    }
    return this.syncComponent('constants', target, operation, options);
  }

  /**
   * Synchronizes the manifest component with another context.
   * @param {Context} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncManifest(target, operation = 'auto', options = {}) {
    if (operation === 'auto') {
      return this.autoSyncComponent('manifest', target, options);
    }
    return this.syncComponent('manifest', target, operation, options);
  }

  /**
   * Synchronizes the flags component with another context.
   * @param {Context} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncFlags(target, operation = 'auto', options = {}) {
    if (operation === 'auto') {
      return this.autoSyncComponent('flags', target, options);
    }
    return this.syncComponent('flags', target, operation, options);
  }

  /**
   * Synchronizes the state component with another context.
   * @param {Context} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncState(target, operation = 'auto', options = {}) {
    if (operation === 'auto') {
      return this.autoSyncComponent('state', target, options);
    }
    return this.syncComponent('state', target, operation, options);
  }

  /**
   * Synchronizes the data component with another context.
   * @param {Context} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncData(target, operation = 'auto', options = {}) {
    if (operation === 'auto') {
      return this.autoSyncComponent('data', target, options);
    }
    return this.syncComponent('data', target, operation, options);
  }

  /**
   * Synchronizes the settings component with another context.
   * @param {Context} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Synchronization result with details.
   */
  syncSettings(target, operation = 'auto', options = {}) {
    if (operation === 'auto') {
      return this.autoSyncComponent('settings', target, options);
    }
    return this.syncComponent('settings', target, operation, options);
  }

  /**
   * Synchronizes multiple components at once with another context.
   * @param {string[]} componentKeys - Array of component keys to sync.
   * @param {Context} target - The target context to sync with.
   * @param {string} [operation='auto'] - The synchronization operation to perform.
   * @param {object} [options={}] - Synchronization options.
   * @returns {object} Object containing results for each component sync operation.
   *
   * @example
   * ```javascript
   * const results = context1.syncComponents(['data', 'state', 'flags'], context2);
   * console.log(results.data); // Result of data sync
   * console.log(results.state); // Result of state sync
   * ```
   */
  syncComponents(componentKeys, target, operation = 'auto', options = {}) {
    const results = {};
    const errors = {};

    for (const key of componentKeys) {
      try {
        if (operation === 'auto') {
          results[key] = this.autoSyncComponent(key, target, options);
        } else {
          results[key] = this.syncComponent(key, target, operation, options);
        }
      } catch (error) {
        errors[key] = error.message;
      }
    }

    return {
      success: Object.keys(errors).length === 0,
      results,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      syncedComponents: Object.keys(results),
      failedComponents: Object.keys(errors)
    };
  }
}

export default Context