/**
 * @file context.js
 * @description This file contains the Context class that provides a sophisticated data management framework for FoundryVTT modules, built on a modular architecture with delegation to specialized helper classes.
 * @path src/contexts/context.js
 */

import { ContextContainer } from './helpers/contextContainer.js';
import { ContextItem } from './helpers/contextItem.js';
import ContextHelpers from './helpers/contextHelpers.js';
import constants from '../constants/constants.js';

const DEFAULT_INITIALIZATION_PARAMS = {
  contextSchema: {},
  namingConvention: constants.context.naming,
  contextLocation: 'local',
  constants: {},
  manifest: {},
  flags: {},
  data: {},
  settings: {}
};

const DEFAULT_OPERATIONS_PARAMS = {
  alwaysPullBeforeGetting: constants.context.operationsParams.defaults.alwaysPullBeforeGetting,
  alwaysPullBeforeSetting: constants.context.operationsParams.defaults.alwaysPullBeforeSetting,
  pullFrom: constants.context.operationsParams.defaults.pullFrom,
  alwaysPushAfterSetting: constants.context.operationsParams.defaults.alwaysPushAfterSetting,
  pushTo: constants.context.operationsParams.defaults.pushTo,
  errorHandling: constants.context.operationsParams.defaults.errorHandling
};

/**
 * @class Context
 * @extends ContextContainer
 * @export
 * @description Provides a sophisticated data management framework for FoundryVTT modules, built on a modular architecture
 * where the Context class acts as an orchestration layer that delegates specialized operations to dedicated helper classes.
 *
 * ## Architecture
 * - **Composition over Inheritance**: Context composes helper classes rather than implementing everything internally
 * - **Single Responsibility**: Each helper class focuses on one specific concern
 * - **Orchestration Layer**: Context manages inter-context operations and provides a unified interface
 * - **Delegation Pattern**: Complex operations are delegated to specialized helpers
 * - **Simplicity**: Maintains a simple external interface while encapsulating complex logic internally
 * - **Shortcuts for Common Operations**: Provides convenient methods for common tasks while allowing full access to helper functionality
 *
 * ## Core Components
 * The Context manages seven key components as ContextContainer/ContextItem instances:
 * - **schema** - Context schema definition (frozen ContextItem)
 * - **constants** - Module-wide constants (frozen ContextItem)
 * - **manifest** - Module manifest data (frozen ContextItem)
 * - **flags** - Mutable flags (ContextContainer)
 * - **state** - Mutable runtime state (ContextContainer)
 * - **data** - General purpose data (ContextContainer)
 * - **settings** - Module settings (ContextContainer)
 *
 * ## Inheritance and Path Support
 * Context extends ContextContainer, inheriting its sophisticated nested path access capabilities:
 * - **Dot Notation Support**: Direct access to nested items using paths like `'data.player.stats.level'`
 * - **Component Traversal**: Seamless navigation across component boundaries
 * - **Mixed Structure Handling**: Works with both ContextContainer and plain object nesting
 * - **Path Validation**: Automatic validation and error handling for invalid paths
 *
 * ## Public API
 *
 * ### Item Management
 * - `setItem(itemPath, itemValue, options, overrides)` - Sets items with Context-specific pull/push logic
 * - `pullAndGetItem({itemPath, pullFrom, options})` - Context-specific pull operations
 * - `getItem(key)` - Inherited dot notation support for nested paths (e.g., `'data.player.name'`)
 * - `getReservedItem(key)` - Retrieves items using original reserved key names with automatic renaming
 * - `hasItem(key)` - Inherited dot notation support for nested paths (e.g., `'settings.ui.theme'`)
 *
 * ### Component Access (Getters)
 * - `get schema()` - Readonly ContextContainer for schema definition
 * - `get constants()` - Readonly ContextContainer for module-wide constants
 * - `get manifest()` - Readonly ContextContainer for module manifest data
 * - `get flags()` - ContextContainer for mutable flags
 * - `get state()` - ContextContainer for mutable runtime state
 * - `get data()` - ContextContainer for general purpose data
 * - `get settings()` - ContextContainer for module settings
 *
 * ### Comparison Operations
 * - `compare(target, options)` - Delegates to ContextComparison
 *
 * ### Merge Operations
 * - `merge(target, strategy, options)` - Delegates to ContextMerger with nested path support
 * - `mergeItem(target, itemPath, strategy, options)` - Merge specific nested items
 * - `analyzeMerge(target, strategy, options)` - Dry-run analysis of merge operations
 *
 * ### Pull/Push Operations
 * - Inter-context synchronization with cooldowns and performance tracking
 * - Automatic pull/push behavior based on operations parameters
 * - Performance metrics tracking for pull/push operations
 *
 * @example
 * // Basic Context usage
 * const context = new Context({
 *   initializationParams: {
 *     data: { player: { name: 'Hero', stats: { level: 5 } } },
 *     settings: { ui: { theme: 'dark' } }
 *   }
 * });
 *
 * // Nested path access (inherited from ContextContainer)
 * const playerName = context.getItem('data.player.name');          // 'Hero'
 * const playerLevel = context.getItem('data.player.stats.level');  // 5
 * const theme = context.getItem('settings.ui.theme');              // 'dark'
 *
 * // Component getter approach
 * const playerStats = context.data().getItem('player.stats');
 * const uiSettings = context.settings().getItem('ui');
 *
 * // Merge operations
 * const result = context.merge(otherContext, 'mergeNewerWins');
 */
class Context extends ContextContainer {
  /**
   * Operations parameters for automatic pull/push behavior.
   * @type {object}
   * @private
   */
  #operationsParams;

  /**
   * Naming convention configuration (frozen).
   * @type {ContextItem}
   * @private
   */
  #namingConvention;

  /**
   * Location of the context (e.g., module name, local context, world name, directory path).
   * @type {string}
   * @private
   */
  #contextLocation;

  /**
   * Core components as ContextContainer/ContextItem instances.
   * @type {object}
   * @private
   */
  #components;

  /**
   * Performance metrics for pull/push operations.
   * @type {object}
   * @private
   */
  #performanceMetrics;

  /**
   * Cooldown tracking for pull operations.
   * @type {object}
   * @private
   */
  #pullCooldown;

  /**
   * Duck typing identifier.
   * @type {boolean}
   * @private
   */
  #isContextObject;

  /**
   * Creates an instance of Context.
   * @param {object} [params={}] - Configuration parameters.
   * @param {object} [params.initializationParams=DEFAULT_INITIALIZATION_PARAMS] - Initialization parameters.
   * @param {object} [params.initializationParams.contextSchema] - Schema definition for the context.
   * @param {object} [params.initializationParams.namingConvention] - Naming convention configuration.
   * @param {string} [params.initializationParams.contextLocation] - Location of the context.
   * @param {object} [params.initializationParams.constants] - Module-wide constants object.
   * @param {object} [params.initializationParams.manifest] - Module manifest data.
   * @param {object} [params.initializationParams.flags] - Initial flags object.
   * @param {object} [params.initializationParams.data={}] - Initial data object.
   * @param {object} [params.initializationParams.settings={}] - Initial settings object.
   * @param {object} [params.operationsParams=DEFAULT_OPERATIONS_PARAMS] - Operations parameters.
   * @param {boolean} [params.operationsParams.alwaysPullBeforeGetting=false] - Auto-pull before get operations.
   * @param {boolean} [params.operationsParams.alwaysPullBeforeSetting=false] - Auto-pull before set operations.
   * @param {Context[]} [params.operationsParams.pullFrom=[]] - Array of source contexts for pulling.
   * @param {boolean} [params.operationsParams.alwaysPushAfterSetting=false] - Auto-push after set operations.
   * @param {Context[]} [params.operationsParams.pushTo=[]] - Array of target contexts for pushing.
   * @param {object} [params.operationsParams.errorHandling] - Error handling configuration object.
   * @param {boolean} [params.enhancedNestedPathChecking=false] - If true, enables checking nested paths in plain object values for hasItem().
   */
  constructor({
    initializationParams = DEFAULT_INITIALIZATION_PARAMS,
    operationsParams = DEFAULT_OPERATIONS_PARAMS,
    enhancedNestedPathChecking = false
  } = {}) {
    // Initialize the parent ContextContainer with empty data first
    super({}, {}, {
      recordAccess: true,
      recordAccessForMetadata: false,
      enhancedNestedPathChecking
    });

    // Set duck typing identifier
    this.#isContextObject = true;

    // Initialize operations parameters
    this.#operationsParams = { ...DEFAULT_OPERATIONS_PARAMS, ...operationsParams };

    // Initialize naming convention (frozen)
    this.#namingConvention = new ContextItem(
      { ...constants.context.naming, ...initializationParams.namingConvention },
      { type: 'namingConvention' },
      { frozen: true, recordAccess: false }
    );

    // Set context location
    this.#contextLocation = initializationParams.contextLocation || 'local';

    // Initialize performance metrics
    this.#performanceMetrics = {
      pullOperations: 0,
      pushOperations: 0,
      totalPullTime: 0,
      totalPushTime: 0,
      lastPullTime: null,
      lastPushTime: null
    };

    // Initialize pull cooldown tracking
    this.#pullCooldown = {
      lastPull: null,
      cooldownMs: 1000
    };

    // Initialize core components
    this.#components = {};

    // Create frozen components (schema, constants, manifest)
    this.#components.schema = new ContextItem(
      initializationParams.contextSchema || {},
      { type: 'schema' },
      { frozen: true, recordAccess: false }
    );

    this.#components.constants = new ContextItem(
      initializationParams.constants || {},
      { type: 'constants' },
      { frozen: true, recordAccess: false }
    );

    this.#components.manifest = new ContextItem(
      initializationParams.manifest || {},
      { type: 'manifest' },
      { frozen: true, recordAccess: false }
    );

    // Create mutable components (flags, state, data, settings)
    this.#components.flags = new ContextContainer(
      initializationParams.flags || {},
      { type: 'flags' },
      { recordAccess: true, recordAccessForMetadata: false, enhancedNestedPathChecking }
    );

    this.#components.state = new ContextContainer(
      {},
      { type: 'state' },
      { recordAccess: true, recordAccessForMetadata: false, enhancedNestedPathChecking }
    );

    this.#components.data = new ContextContainer(
      initializationParams.data || {},
      { type: 'data' },
      { recordAccess: true, recordAccessForMetadata: false, enhancedNestedPathChecking }
    );

    this.#components.settings = new ContextContainer(
      initializationParams.settings || {},
      { type: 'settings' },
      { recordAccess: true, recordAccessForMetadata: false, enhancedNestedPathChecking }
    );

    // Set up the main container to hold component references
    // Note: We don't add components directly to the parent container to avoid reserved key conflicts
    // Components are accessed through dedicated getters instead
  }

  /**
   * Gets whether this instance is a Context object (for duck typing).
   * @returns {boolean} Always returns true for Context instances.
   */
  get isContextObject() {
    return this.#isContextObject;
  }

  /**
   * Gets the context location.
   * @returns {string} The context location.
   */
  get contextLocation() {
    return this.#contextLocation;
  }

  /**
   * Gets the naming convention (frozen).
   * @returns {ContextItem} The naming convention container.
   */
  get namingConvention() {
    return this.#namingConvention;
  }

  /**
   * Gets the operations parameters.
   * @returns {object} The operations parameters.
   */
  get operationsParams() {
    return { ...this.#operationsParams };
  }

  /**
   * Gets the performance metrics.
   * @returns {object} The performance metrics.
   */
  get performanceMetrics() {
    return { ...this.#performanceMetrics };
  }

  // Component getters

  /**
   * Gets the schema component (readonly ContextItem).
   * @returns {ContextItem} The schema component.
   * @example
   * const validationRules = context.schema.value.validation.rules;
   */
  get schema() {
    return this.#components.schema;
  }

  /**
   * Gets the constants component (readonly ContextItem).
   * @returns {ContextItem} The constants component.
   * @example
   * const appVersion = context.constants.value.app.version;
   */
  get constants() {
    return this.#components.constants;
  }

  /**
   * Gets the manifest component (readonly ContextItem).
   * @returns {ContextItem} The manifest component.
   * @example
   * const dependencies = context.manifest.value.module.dependencies;
   */
  get manifest() {
    return this.#components.manifest;
  }

  /**
   * Gets the flags component (mutable ContextContainer).
   * @returns {ContextContainer} The flags component.
   * @example
   * const experimentalFeatures = context.flags.getItem('experimental.features');
   */
  get flags() {
    return this.#components.flags;
  }

  /**
   * Gets the state component (mutable ContextContainer).
   * @returns {ContextContainer} The state component.
   * @example
   * const currentUser = context.state.getItem('session.currentUser');
   */
  get state() {
    return this.#components.state;
  }

  /**
   * Gets the data component (mutable ContextContainer).
   * @returns {ContextContainer} The data component.
   * @example
   * const playerInventory = context.data.getItem('player.inventory');
   */
  get data() {
    return this.#components.data;
  }

  /**
   * Gets the settings component (mutable ContextContainer).
   * @returns {ContextContainer} The settings component.
   * @example
   * const uiPreferences = context.settings.getItem('ui.preferences');
   */
  get settings() {
    return this.#components.settings;
  }

  /**
   * Performs a pull operation from source contexts.
   * @private
   * @param {object} options - Pull options.
   * @param {Context[]} [pullFrom] - Contexts to pull from.
   * @param {string} [itemPath] - Specific item path to pull.
   * @returns {object} Pull result.
   */
  #performPull(options = {}, pullFrom = null, itemPath = null) {
    const now = Date.now();

    // Check cooldown
    if (this.#pullCooldown.lastPull &&
        (now - this.#pullCooldown.lastPull) < this.#pullCooldown.cooldownMs) {
      return { success: false, reason: 'cooldown' };
    }

    const startTime = performance.now();
    const sources = pullFrom || this.#operationsParams.pullFrom;

    if (!sources || sources.length === 0) {
      return { success: false, reason: 'no sources' };
    }

    try {
      // Use ContextHelpers for synchronization
      const results = sources.map(source => {
        if (itemPath) {
          // Pull specific item
          return ContextHelpers.Sync.syncItem(source, this, itemPath, 'updateTargetToSource', options);
        } else {
          // Pull entire context
          return ContextHelpers.Sync.sync(source, this, 'updateTargetToSource', options);
        }
      });

      const endTime = performance.now();
      this.#performanceMetrics.pullOperations++;
      this.#performanceMetrics.totalPullTime += (endTime - startTime);
      this.#performanceMetrics.lastPullTime = new Date();
      this.#pullCooldown.lastPull = now;

      return { success: true, results };
    } catch (error) {
      if (this.#operationsParams.errorHandling.onPullError === 'throw') {
        throw error;
      } else if (this.#operationsParams.errorHandling.onPullError === 'warn') {
        console.warn('Pull operation failed:', error);
      }
      return { success: false, error };
    }
  }

  /**
   * Performs a push operation to target contexts.
   * @private
   * @param {object} options - Push options.
   * @param {string} [itemPath] - Specific item path to push.
   * @returns {object} Push result.
   */
  #performPush(options = {}, itemPath = null) {
    const startTime = performance.now();
    const targets = this.#operationsParams.pushTo;

    if (!targets || targets.length === 0) {
      return { success: false, reason: 'no targets' };
    }

    try {
      // Use ContextHelpers for synchronization
      const results = targets.map(target => {
        if (itemPath) {
          // Push specific item
          return ContextHelpers.Sync.syncItem(this, target, itemPath, 'updateTargetToSource', options);
        } else {
          // Push entire context
          return ContextHelpers.Sync.sync(this, target, 'updateTargetToSource', options);
        }
      });

      const endTime = performance.now();
      this.#performanceMetrics.pushOperations++;
      this.#performanceMetrics.totalPushTime += (endTime - startTime);
      this.#performanceMetrics.lastPushTime = new Date();

      return { success: true, results };
    } catch (error) {
      if (this.#operationsParams.errorHandling.onPushError === 'throw') {
        throw error;
      } else if (this.#operationsParams.errorHandling.onPushError === 'warn') {
        console.warn('Push operation failed:', error);
      }
      return { success: false, error };
    }
  }

  /**
   * Sets a value at a nested path in a plain object.
   * @private
   * @param {object} obj - The object to modify.
   * @param {string} path - The dot-notation path.
   * @param {*} value - The value to set.
   */
  #setValueAtPath(obj, path, value) {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * Sets or updates an item in the context with Context-specific pull/push logic.
   * Supports dot-notation path traversal for nested items (e.g., 'data.player.stats.level').
   * @param {string} itemPath - The path for the item. Can use dot notation for nested access.
   * @param {*} itemValue - The value to set.
   * @param {object} [options={}] - Options for the operation.
   * @param {object} [overrides={}] - Options to override for this specific operation.
   * @returns {Context} The instance for chaining.
   * @example
   * context.setItem('data.player.name', 'Hero');
   * context.setItem('settings.ui.theme.color', 'blue');
   */
  setItem(itemPath, itemValue, options = {}, overrides = {}) {
    // Context-specific pre-processing
    if (this.#operationsParams.alwaysPullBeforeSetting && !overrides.skipPull) {
      this.#performPull(options, null, itemPath);
    }

    // Handle component-prefixed paths
    if (typeof itemPath === 'string' && itemPath.includes('.')) {
      const [componentName, ...pathParts] = itemPath.split('.');
      const remainingPath = pathParts.join('.');

      // Route to appropriate component
      switch (componentName) {
        case 'schema':
          if (this.#components.schema.isFrozen() && !options.ignoreFrozen) {
            throw new Error(`Cannot modify frozen schema component. Item path: ${itemPath}`);
          }
          // For ContextItem, we need to update the entire value
          if (remainingPath) {
            const currentValue = { ...this.#components.schema.value };
            this.#setValueAtPath(currentValue, remainingPath, itemValue);
            this.#components.schema.value = currentValue;
          } else {
            this.#components.schema.value = itemValue;
          }
          break;
        case 'constants':
          if (this.#components.constants.isFrozen() && !options.ignoreFrozen) {
            throw new Error(`Cannot modify frozen constants component. Item path: ${itemPath}`);
          }
          // For ContextItem, we need to update the entire value
          if (remainingPath) {
            const currentValue = { ...this.#components.constants.value };
            this.#setValueAtPath(currentValue, remainingPath, itemValue);
            this.#components.constants.value = currentValue;
          } else {
            this.#components.constants.value = itemValue;
          }
          break;
        case 'manifest':
          if (this.#components.manifest.isFrozen() && !options.ignoreFrozen) {
            throw new Error(`Cannot modify frozen manifest component. Item path: ${itemPath}`);
          }
          // For ContextItem, we need to update the entire value
          if (remainingPath) {
            const currentValue = { ...this.#components.manifest.value };
            this.#setValueAtPath(currentValue, remainingPath, itemValue);
            this.#components.manifest.value = currentValue;
          } else {
            this.#components.manifest.value = itemValue;
          }
          break;
        case 'flags':
          if (remainingPath) {
            this.#components.flags.setItem(remainingPath, itemValue, options);
          } else {
            this.#components.flags.value = itemValue;
          }
          break;
        case 'state':
          if (remainingPath) {
            this.#components.state.setItem(remainingPath, itemValue, options);
          } else {
            this.#components.state.value = itemValue;
          }
          break;
        case 'data':
          if (remainingPath) {
            this.#components.data.setItem(remainingPath, itemValue, options);
          } else {
            this.#components.data.value = itemValue;
          }
          break;
        case 'settings':
          if (remainingPath) {
            this.#components.settings.setItem(remainingPath, itemValue, options);
          } else {
            this.#components.settings.value = itemValue;
          }
          break;
        default:
          // Fall back to parent implementation for non-component paths
          super.setItem(itemPath, itemValue, options);
          break;
      }
    } else {
      // Delegate to parent for simple keys
      super.setItem(itemPath, itemValue, options);
    }

    // Context-specific post-processing
    if (this.#operationsParams.alwaysPushAfterSetting && !overrides.skipPush) {
      this.#performPush(options, itemPath);
    }

    return this;
  }

  /**
   * Retrieves an item after performing a pull operation.
   * @param {object} params - Parameters for the operation.
   * @param {string} params.itemPath - The path of the item to retrieve.
   * @param {Context[]} [params.pullFrom] - Contexts to pull from.
   * @param {object} [params.options={}] - Options for the operation.
   * @returns {*} The retrieved value.
   * @example
   * const remotePlayerData = context.pullAndGetItem({
   *   itemPath: 'data.player.inventory.weapons',
   *   pullFrom: [remoteContext1, remoteContext2]
   * });
   */
  pullAndGetItem({ itemPath, pullFrom, options = {} }) {
    this.#performPull(options, pullFrom, itemPath);
    return this.getItem(itemPath);
  }

  /**
   * Gets a value at a nested path in a plain object.
   * @private
   * @param {object} obj - The object to get from.
   * @param {string} path - The dot-notation path.
   * @returns {*} The value at the path, or undefined if not found.
   */
  #getValueAtPath(obj, path) {
    if (!obj || typeof obj !== 'object') return undefined;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Enhanced path resolution with multiple fallback strategies.
   * Handles ContextContainer internal properties only - does not handle reserved key renaming.
   * @private
   * @param {object|ContextContainer} rootObj - The root object or ContextContainer to search in.
   * @param {string} path - The dot-notation path to resolve.
   * @param {ContextContainer} [contextContainer] - The ContextContainer instance for internal property access.
   * @returns {*} The resolved value, or undefined if not found.
   */
  #resolvePathWithFallbacks(rootObj, path, contextContainer = null) {
    // Strategy 1: Try normal path resolution first
    if (contextContainer && typeof contextContainer.getItem === 'function') {
      // Use ContextContainer's getItem for proper path traversal
      const directResult = contextContainer.getItem(path);
      if (directResult !== undefined) {
        return directResult;
      }
    } else {
      // Use simple object path traversal for plain objects
      const directResult = this.#getValueAtPath(rootObj, path);
      if (directResult !== undefined) {
        return directResult;
      }
    }

    // Strategy 2: Try ContextContainer internal property access
    if (contextContainer && path.includes('.')) {
      const pathParts = path.split('.');
      const [firstKey, ...remainingParts] = pathParts;
      const remainingPath = remainingParts.join('.');

      // Check if first key leads to a ContextContainer
      const firstLevelItem = contextContainer.getWrappedItem ? contextContainer.getWrappedItem(firstKey) : undefined;

      if (firstLevelItem && typeof firstLevelItem === 'object') {
        // Check if we're trying to access ContextContainer internal properties
        const containerProperties = ['value', 'metadata', 'size', 'createdAt', 'modifiedAt', 'lastAccessedAt'];

        if (remainingParts.length === 1 && containerProperties.includes(remainingParts[0])) {
          // Direct access to ContextContainer property
          // Only allow this for non-user-data properties (not 'value' or 'metadata' which could be confused with user data)
          if (!['value', 'metadata'].includes(remainingParts[0]) && typeof firstLevelItem[remainingParts[0]] !== 'undefined') {
            console.debug(`[Context.#resolvePathWithFallbacks] ContextContainer internal property access: ${path} → ${firstKey}.${remainingParts[0]}`);
            return firstLevelItem[remainingParts[0]];
          }
        } else if (remainingParts.length > 1 && containerProperties.includes(remainingParts[0])) {
          // Nested access through ContextContainer property
          const containerProp = firstLevelItem[remainingParts[0]];
          if (containerProp && typeof containerProp === 'object') {
            console.debug(`[Context.#resolvePathWithFallbacks] ContextContainer nested property access: ${path} → ${firstKey}.${remainingParts[0]}.${remainingParts.slice(1).join('.')}`);
            return this.#getValueAtPath(containerProp, remainingParts.slice(1).join('.'));
          }
        }
      }
    }

    // If all strategies fail, return undefined
    return undefined;
  }

  /**
   * Enhanced path resolution with reserved key fallback strategies.
   * This method includes all fallback strategies including reserved key renaming.
   * @private
   * @param {object|ContextContainer} rootObj - The root object or ContextContainer to search in.
   * @param {string} path - The dot-notation path to resolve.
   * @param {ContextContainer} [contextContainer] - The ContextContainer instance for internal property access.
   * @returns {*} The resolved value, or undefined if not found.
   */
  #resolvePathWithReservedKeyFallbacks(rootObj, path, contextContainer = null) {
    // First try the standard enhanced resolution
    const standardResult = this.#resolvePathWithFallbacks(rootObj, path, contextContainer);
    if (standardResult !== undefined) {
      return standardResult;
    }

    // Strategy 3: Try reserved key renaming (getReservedItem logic)
    if (typeof path === 'string' && path.includes('.')) {
      const pathParts = path.split('.');
      const alternativePaths = this.#generateReservedKeyAlternatives(pathParts);

      for (const alternativePath of alternativePaths) {
        // Use simple object path traversal for alternatives to avoid ContextContainer complications
        const result = this.#getValueAtPath(rootObj, alternativePath);
        if (result !== undefined) {
          return result;
        }
      }
    } else if (typeof path === 'string') {
      // Simple key case - try renamed version
      const renamedKey = `_${path}`;
      const result = this.#getValueAtPath(rootObj, renamedKey);
      if (result !== undefined) {
        return result;
      }
    }

    // If all strategies fail, return undefined
    return undefined;
  }

  /**
   * Generates alternative paths by replacing reserved keys with their renamed versions.
   * @private
   * @param {string[]} pathParts - Array of path segments.
   * @returns {string[]} Array of alternative paths to try.
   */
  #generateReservedKeyAlternatives(pathParts) {
    const reservedKeys = ['value', 'metadata', 'size', 'createdAt', 'modifiedAt', 'lastAccessedAt'];
    const alternatives = [];

    // Generate all possible combinations of renamed reserved keys
    const generateCombinations = (parts, index = 0) => {
      if (index >= parts.length) {
        alternatives.push(parts.join('.'));
        return;
      }

      const currentPart = parts[index];

      // Try original part
      generateCombinations([...parts], index + 1);

      // Try renamed version if it's a reserved key
      if (reservedKeys.includes(currentPart)) {
        const renamedParts = [...parts];
        renamedParts[index] = `_${currentPart}`;
        generateCombinations(renamedParts, index + 1);
      }
    };

    generateCombinations(pathParts);

    // Remove duplicates and original path (it was already tried)
    const originalPath = pathParts.join('.');
    return [...new Set(alternatives)].filter(alt => alt !== originalPath);
  }

  /**
   * Overrides getItem to add Context-specific pull logic and component routing.
   * Supports component-prefixed paths like 'data.player.name' and 'settings.ui.theme'.
   * Now includes enhanced path resolution for ContextContainer internal properties and reserved key fallback.
   * @param {string} key - The key of the item to retrieve.
   * @returns {*} The retrieved value.
   */
  getItem(key) {
    // Context-specific pre-processing
    if (this.#operationsParams.alwaysPullBeforeGetting) {
      this.#performPull({}, null, key);
    }

    // Check if the user is manually accessing a renamed reserved key
    if (typeof key === 'string') {
      const reservedKeys = ['value', 'metadata', 'size', 'createdAt', 'modifiedAt', 'lastAccessedAt'];

      // Check for direct renamed key access (e.g., "_value")
      if (key.startsWith('_') && reservedKeys.includes(key.substring(1))) {
        console.debug(`[Context.getItem] Direct renamed reserved key access: ${key} (original: ${key.substring(1)})`);
      }

      // Check for nested renamed key access (e.g., "data.player._value")
      if (key.includes('.')) {
        const pathParts = key.split('.');
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          if (part.startsWith('_') && reservedKeys.includes(part.substring(1))) {
            console.debug(`[Context.getItem] Nested renamed reserved key access: ${key} (renamed part: ${part} → ${part.substring(1)})`);
            break;
          }
        }
      }
    }

    // Handle component-prefixed paths
    if (typeof key === 'string' && key.includes('.')) {
      const [componentName, ...pathParts] = key.split('.');
      const remainingPath = pathParts.join('.');

      // Route to appropriate component with enhanced path resolution
      switch (componentName) {
        case 'schema':
          return remainingPath ? this.#resolvePathWithFallbacks(this.#components.schema.value, remainingPath, this.#components.schema) : this.#components.schema.value;
        case 'constants':
          return remainingPath ? this.#resolvePathWithFallbacks(this.#components.constants.value, remainingPath, this.#components.constants) : this.#components.constants.value;
        case 'manifest':
          return remainingPath ? this.#resolvePathWithFallbacks(this.#components.manifest.value, remainingPath, this.#components.manifest) : this.#components.manifest.value;
        case 'flags':
          return remainingPath ? this.#resolvePathWithFallbacks(this.#components.flags, remainingPath, this.#components.flags) : this.#components.flags.value;
        case 'state':
          return remainingPath ? this.#resolvePathWithFallbacks(this.#components.state, remainingPath, this.#components.state) : this.#components.state.value;
        case 'data':
          return remainingPath ? this.#resolvePathWithFallbacks(this.#components.data, remainingPath, this.#components.data) : this.#components.data.value;
        case 'settings':
          return remainingPath ? this.#resolvePathWithFallbacks(this.#components.settings, remainingPath, this.#components.settings) : this.#components.settings.value;
        default:
          // Fall back to parent implementation for non-component paths
          return super.getItem(key);
      }
    }

    return super.getItem(key);
  }

  /**
   * Retrieves an item value using the original reserved key name, automatically handling reserved key renaming.
   * This method allows you to use the original reserved key names (like 'value') in your code,
   * and it will automatically check for the renamed version (like '_value') if the original doesn't exist.
   *
   * @param {string} key - The key of the item to retrieve, using original reserved key names.
   * @returns {*} The retrieved value, or undefined if not found.
   *
   * @example
   * // Set a reserved key (gets renamed to '_value' internally)
   * context.setItem('data.player.value', 'Hero');
   *
   * // Use getReservedItem to access it with the original name
   * const playerValue = context.getReservedItem('data.player.value'); // Returns 'Hero'
   *
   * // This is equivalent to manually using the renamed key:
   * const playerValue2 = context.getItem('data.player._value'); // Returns 'Hero'
   */
  getReservedItem(key) {
    // First try to get the item with the original key
    if (this.hasItem(key)) {
      console.debug(`[Context.getReservedItem] Found original key: ${key}`);
      return this.getItem(key);
    }

    // If not found, try with reserved key alternatives
    if (typeof key === 'string' && key.includes('.')) {
      const pathParts = key.split('.');
      const alternativePaths = this.#generateReservedKeyAlternatives(pathParts);

      for (const alternativePath of alternativePaths) {
        if (this.hasItem(alternativePath)) {
          console.debug(`[Context.getReservedItem] Reserved key access: ${key} → ${alternativePath}`);
          return this.getItem(alternativePath);
        }
      }
    } else if (typeof key === 'string') {
      // For simple keys, just try the renamed version
      const reservedKeys = ['value', 'metadata', 'size', 'createdAt', 'modifiedAt', 'lastAccessedAt'];
      if (reservedKeys.includes(key)) {
        const renamedKey = `_${key}`;
        if (this.hasItem(renamedKey)) {
          console.debug(`[Context.getReservedItem] Reserved key access: ${key} → ${renamedKey}`);
          return this.getItem(renamedKey);
        }
      }
    }

    // If nothing found, return undefined
    console.debug(`[Context.getReservedItem] No alternative found for key: ${key}`);
    return undefined;
  }

  /**
   * Overrides hasItem to add component routing.
   * Supports component-prefixed paths like 'data.player.name' and 'settings.ui.theme'.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the item exists.
   */
  hasItem(key) {
    // Handle component-prefixed paths
    if (typeof key === 'string' && key.includes('.')) {
      const [componentName, ...pathParts] = key.split('.');
      const remainingPath = pathParts.join('.');

      // Route to appropriate component
      switch (componentName) {
        case 'schema':
          return remainingPath ? this.#hasValueAtPath(this.#components.schema.value, remainingPath) : true;
        case 'constants':
          return remainingPath ? this.#hasValueAtPath(this.#components.constants.value, remainingPath) : true;
        case 'manifest':
          return remainingPath ? this.#hasValueAtPath(this.#components.manifest.value, remainingPath) : true;
        case 'flags':
          return remainingPath ? this.#components.flags.hasItem(remainingPath) : true;
        case 'state':
          return remainingPath ? this.#components.state.hasItem(remainingPath) : true;
        case 'data':
          return remainingPath ? this.#components.data.hasItem(remainingPath) : true;
        case 'settings':
          return remainingPath ? this.#components.settings.hasItem(remainingPath) : true;
        default:
          // Fall back to parent implementation for non-component paths
          return super.hasItem(key);
      }
    }

    return super.hasItem(key);
  }

  /**
   * Checks if a value exists at a nested path in a plain object.
   * @private
   * @param {object} obj - The object to check.
   * @param {string} path - The dot-notation path.
   * @returns {boolean} True if the path exists.
   */
  #hasValueAtPath(obj, path) {
    if (!obj || typeof obj !== 'object') return false;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return false;
      }
    }

    return true;
  }  /**
   * Compares this context with another context.
   * Delegates to ContextComparison helper.
   * @param {Context} target - The target context to compare with.
   * @param {object} [options={}] - Comparison options.
   * @returns {object} The comparison result.
   * @example
   * const comparison = context.compare(otherContext, { compareBy: 'modifiedAt' });
   */
  compare(target, options = {}) {
    return ContextHelpers.Comparison.compare(this, target, options);
  }

  /**
   * Merges this context with another context.
   * Delegates to ContextMerger with nested path support.
   * @param {Context} target - The target context to merge with.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy.
   * @param {object} [options={}] - Merge options.
   * @returns {object} The merge result.
   * @example
   * const result = context.merge(sourceContext, 'mergeNewerWins', {
   *   allowOnly: ['data.player.stats', 'settings.ui.theme']
   * });
   */
  merge(target, strategy = 'mergeNewerWins', options = {}) {
    // Context-specific pre-processing
    if (this.#operationsParams.alwaysPullBeforeSetting) {
      this.#performPull(options);
    }

    // Delegate to specialized helper
    const result = ContextHelpers.Merger.merge(this, target, strategy, options);

    // Context-specific post-processing
    if (this.#operationsParams.alwaysPushAfterSetting) {
      this.#performPush(options);
    }

    return result;
  }

  /**
   * Merges a specific item from another context.
   * @param {Context} target - The target context to merge from.
   * @param {string} itemPath - The path of the item to merge.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy.
   * @param {object} [options={}] - Merge options.
   * @returns {object} The merge result.
   * @example
   * const result = context.mergeItem(target, 'data.player.inventory.weapons');
   */
  mergeItem(target, itemPath, strategy = 'mergeNewerWins', options = {}) {
    return ContextHelpers.Merger.merge(this, target, strategy, {
      ...options,
      singleItem: itemPath
    });
  }

  /**
   * Analyzes a potential merge without executing it.
   * @param {Context} target - The target context to analyze merge with.
   * @param {string} [strategy='mergeNewerWins'] - The merge strategy.
   * @param {object} [options={}] - Analysis options.
   * @returns {object} The analysis result.
   * @example
   * const analysis = context.analyzeMerge(target, 'mergeNewerWins');
   */
  analyzeMerge(target, strategy = 'mergeNewerWins', options = {}) {
    return ContextHelpers.Merger.analyze(this, target, strategy, options);
  }

  /**
   * Reinitializes the Context with new parameters.
   * @param {object} [params={}] - New configuration parameters.
   * @param {object} [params.initializationParams] - New initialization parameters.
   * @param {object} [params.operationsParams] - New operations parameters.
   */
  reinitialize({
    initializationParams = {},
    operationsParams = {}
  } = {}) {
    // Update operations parameters
    this.#operationsParams = { ...this.#operationsParams, ...operationsParams };

    // Update naming convention if provided
    if (initializationParams.namingConvention) {
      this.#namingConvention = new ContextItem(
        { ...this.#namingConvention.value, ...initializationParams.namingConvention },
        { type: 'namingConvention' },
        { frozen: true, recordAccess: false }
      );
    }

    // Update context location if provided
    if (initializationParams.contextLocation) {
      this.#contextLocation = initializationParams.contextLocation;
    }

    // Reinitialize components if provided
    if (initializationParams.contextSchema !== undefined) {
      this.#components.schema.value = initializationParams.contextSchema;
    }
    if (initializationParams.constants !== undefined) {
      this.#components.constants.value = initializationParams.constants;
    }
    if (initializationParams.manifest !== undefined) {
      this.#components.manifest.value = initializationParams.manifest;
    }
    if (initializationParams.flags !== undefined) {
      this.#components.flags.value = initializationParams.flags;
    }
    if (initializationParams.data !== undefined) {
      this.#components.data.value = initializationParams.data;
    }
    if (initializationParams.settings !== undefined) {
      this.#components.settings.value = initializationParams.settings;
    }

    // Reset performance metrics
    this.#performanceMetrics = {
      pullOperations: 0,
      pushOperations: 0,
      totalPullTime: 0,
      totalPushTime: 0,
      lastPullTime: null,
      lastPushTime: null
    };

    // Reset pull cooldown
    this.#pullCooldown.lastPull = null;
  }

  /**
   * Clears the context and resets all components.
   */
  clear() {
    super.clear();

    // Clear all components
    Object.values(this.#components).forEach(component => {
      if (component && typeof component.clear === 'function') {
        component.clear();
      }
    });

    // Reset performance metrics
    this.#performanceMetrics = {
      pullOperations: 0,
      pushOperations: 0,
      totalPullTime: 0,
      totalPushTime: 0,
      lastPullTime: null,
      lastPushTime: null
    };

    // Reset pull cooldown
    this.#pullCooldown.lastPull = null;
  }
}

export default Context;
export { Context };
