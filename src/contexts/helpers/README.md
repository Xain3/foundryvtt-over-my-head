# Context Helpers

This directory contains helper classes and utilities that support the context management system. These helpers provide specialized functionality for synchronization, merging, filtering, validation, and data management operations.

## Overview

The helpers are organized into several functional categories:

- **Core Data Management**: [`ContextItem`](#contextitem), [`ContextContainer`](#contextcontainer), [`ContextValueWrapper`](#contextvaluewrapper)
- **Synchronization**: [`ContextSync`](#contextsync), [`ContextItemSync`](#contextitemsync), [`ContextContainerSync`](#contextcontainersync), [`ContextContainerSyncEngine`](#contextcontainersyncengine), [`ContextAutoSync`](#contextautosync)
- **Merging & Operations**: [`ContextMerger`](#contextmerger), [`ContextOperations`](#contextoperations)
- **Filtering & Utilities**: [`ItemFilter`](#itemfilter), [`ContextItemFilter`](#contextitemfilter), [`ContextItemSetter`](#contextitemsetter), [`ContextComparison`](#contextcomparison)
- **Validation**: [`RootMapValidator`](#rootmapvalidator)

## Core Data Management

### ContextItem

**File**: [`contextItem.js`](contextItem.js)
**Dependencies**: None
**Exports**: `ContextItem` (class)

Represents a single data item with metadata, timestamps, and access tracking capabilities.

#### Public API

````javascript
// Constructor
new ContextItem(initialValue, metadata = {}, options = {})

// Properties (getters/setters)
.value          // The stored value
.metadata       // Associated metadata object
.createdAt      // Creation timestamp (read-only)
.modifiedAt     // Last modification timestamp (read-only)
.lastAccessedAt // Last access timestamp (read-only)
.frozen         // Frozen state (read-only)
.recordAccess   // Whether to record access
.recordAccessForMetadata // Whether to record metadata access

// Methods
.freeze()       // Freeze the item (prevents modifications)
.setMetadata(newMetadata, recordAccess = true) // Update metadata
.clone()        // Create a deep copy
````

#### Example Usage

````javascript
const item = new ContextItem('hello', { type: 'greeting' });
console.log(item.value); // 'hello'
console.log(item.metadata); // { type: 'greeting' }
item.value = 'goodbye';
console.log(item.modifiedAt); // Updated timestamp
````

### ContextContainer

**File**: contextContainer.js
**Dependencies**: `ContextItem`, `ContextValueWrapper`, `ContextItemSetter`, `Validator`, `PathUtils`
**Exports**: `ContextContainer` (class)

Manages collections of named ContextItems or nested ContextContainers with support for dot-notation access.

#### Public API

````javascript
// Constructor
new ContextContainer(initialValue = {}, metadata = {}, options = {})

// Properties (getters/setters)
.value          // Plain object representation of all items
.size           // Number of items in container
.metadata       // Container metadata (delegated to internal ContextItem)
.createdAt      // Creation timestamp (delegated)
.modifiedAt     // Last modification timestamp (delegated)
.lastAccessedAt // Last access timestamp (delegated)
.recordAccess   // Whether to record access (delegated)

// Item Management
.setItem(key, value, options = {}) // Set/update item (supports dot notation)
.getItem(key)                      // Get item (supports dot notation)
.hasItem(key)                      // Check if item exists
.deleteItem(key)                   // Remove item
.clear()                           // Remove all items

// Bulk Operations
.setItems(itemsObject, options = {}) // Set multiple items
.getItems()                          // Get all items as plain object
.getAllItems()                       // Get all managed items (ContextItem/ContextContainer instances)

// Utility
.clone()                // Create deep copy
.freeze()               // Freeze container and all items
.getItemPaths()         // Get array of all item paths
````

#### Example Usage

````javascript
const container = new ContextContainer({
  player: { name: 'John', level: 5 },
  settings: { volume: 0.8 }
});

console.log(container.getItem('player.name')); // 'John'
container.setItem('player.level', 6);
console.log(container.size); // 2
````

### ContextValueWrapper

**File**: contextValueWrapper.js
**Dependencies**: `ContextItem`, `ContextContainer`
**Exports**: `ContextValueWrapper` (class)

Static utility class for wrapping raw values into ContextItem or ContextContainer instances.

#### Public API

````javascript
// Static Methods
ContextValueWrapper.wrap(value, options = {})
// Options: wrapAs, wrapPrimitives, recordAccess, recordAccessForMetadata, frozen, metadata

ContextValueWrapper.wrapAsContextItem(value, options = {})
ContextValueWrapper.wrapAsContextContainer(value, options = {})
ContextValueWrapper.unwrap(wrappedValue) // Extract raw value from wrapped instance
````

#### Example Usage

````javascript
const wrapped = ContextValueWrapper.wrap('hello', {
  wrapAs: 'ContextItem',
  metadata: { type: 'greeting' }
});
console.log(wrapped instanceof ContextItem); // true

const unwrapped = ContextValueWrapper.unwrap(wrapped);
console.log(unwrapped); // 'hello'
````

## Synchronization

### ContextSync

**File**: contextSync.js
**Dependencies**: `ContextItem`, `ContextContainer`, `Context`, `ContextComparison`, `ContextAutoSync`, `ContextItemSync`, `ContextContainerSync`
**Exports**: `ContextSync` (class)

Facade class providing synchronization capabilities for all context types. Delegates to specialized sync classes based on object type.

#### Public API

````javascript
// Static Constants
ContextSync.SYNC_OPERATIONS = {
  UPDATE_SOURCE_TO_TARGET: 'updateSourceToTarget',
  UPDATE_TARGET_TO_SOURCE: 'updateTargetToSource',
  MERGE_NEWER_WINS: 'mergeNewerWins',
  MERGE_SOURCE_PRIORITY: 'mergeSourcePriority',
  MERGE_TARGET_PRIORITY: 'mergeTargetPriority',
  NO_ACTION: 'noAction'
}

// Static Methods
ContextSync.sync(source, target, operation, options = {})
ContextSync.syncSafe(source, target, operation, options = {})
ContextSync.compare(source, target, options = {})
ContextSync.autoSync(source, target, options = {})
````

#### Example Usage

````javascript
const result = ContextSync.sync(
  sourceContext,
  targetContext,
  ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS
);
console.log(result.success); // true/false
console.log(result.changes); // Array of changes made
````

### ContextItemSync

**File**: contextItemSync.js
**Dependencies**: `ContextItem`, `ContextComparison`, `lodash`
**Exports**: `ContextItemSync` (class)

Specialized synchronization for ContextItem instances.

#### Public API

````javascript
// Static Methods
ContextItemSync.updateTargetToMatchSource(source, target, options = {})
ContextItemSync.updateSourceToMatchTarget(source, target, options = {})
ContextItemSync.mergeNewerWins(source, target, options = {})
ContextItemSync.mergeWithPriority(source, target, priority, options = {})
````

### ContextContainerSync

**File**: contextContainerSync.js
**Dependencies**: `ContextComparison`, `ContextContainerSyncEngine`
**Exports**: `ContextContainerSync` (class)

Synchronization capabilities for ContextContainer instances with deep sync support.

#### Public API

````javascript
// Static Methods
ContextContainerSync.updateSourceToMatchTarget(source, target, options = {})
ContextContainerSync.updateTargetToMatchSource(source, target, options = {})
ContextContainerSync.mergeNewerWins(source, target, options = {})
ContextContainerSync.mergeWithPriority(source, target, priority, options = {})
````

### ContextContainerSyncEngine

**File**: contextContainerSyncEngine.js
**Dependencies**: `ContextContainer`, `ContextItemSync`
**Exports**: `ContextContainerSyncEngine` (class)

Handles complex recursive synchronization operations between ContextContainer instances.

#### Public API

````javascript
// Constructor
new ContextContainerSyncEngine(options = {})

// Instance Methods
.sync(container1, container2, direction)
````

### ContextAutoSync

**File**: contextAutoSync.js
**Dependencies**: None
**Exports**: `ContextAutoSync` (class)

**Status**: Work in Progress - Placeholder for future automatic synchronization functionality.

#### Public API

````javascript
// Static Methods (placeholder implementations)
ContextAutoSync.autoSync(source, target, options = {})
ContextAutoSync.determineStrategy(source, target, options = {})
````

## Merging & Operations

### ContextMerger

**File**: contextMerger.js
**Dependencies**: `ContextComparison`, `ContextItem`, `ContextContainer`, `ItemFilter`
**Exports**: `ContextMerger`, `ItemFilter` (classes)

Sophisticated merging capabilities for Context instances with detailed change tracking and conflict resolution.

#### Public API

````javascript
// Static Methods
ContextMerger.merge(source, target, strategy = 'mergeNewerWins', options = {})

// Available Strategies:
// - 'mergeNewerWins': Newer items overwrite older ones
// - 'mergeSourcePriority': Source items take precedence
// - 'mergeTargetPriority': Target items take precedence
// - 'updateSourceToTarget': Update source with target values
// - 'updateTargetToSource': Update target with source values
// - 'replace': Replace source items with target items
// - 'noAction': No changes (validation/dry run)

// Merge Options:
// - allowOnly: Array of paths to include
// - blockOnly: Array of paths to exclude
// - singleItem: Single item path to merge
// - customFilter: Custom ItemFilter function
// - preserveMetadata: Whether to preserve metadata
// - onConflict: Conflict resolution function
````

#### Example Usage

````javascript
// Merge with path filtering
const result = ContextMerger.merge(source, target, 'mergeNewerWins', {
  allowOnly: ['data.inventory', 'settings.volume'],
  preserveMetadata: true
});

// Merge single item
const result = ContextMerger.merge(source, target, 'mergeSourcePriority', {
  singleItem: 'data.playerStats.level'
});
````

### ContextOperations

**File**: `contextOperations.js`
**Dependencies**: `ContextMerger`, `ItemFilter`
**Exports**: `ContextOperations` (class)

Bulk operations and multi-source/target operations for context management.

#### Public API

````javascript
// Static Methods
ContextOperations.pushItems(source, target, itemPaths, strategy, options)
ContextOperations.pullItems(source, target, itemPaths, strategy, options)
ContextOperations.pushFromMultipleSources(sources, target, strategy, options)
ContextOperations.pushToMultipleTargets(source, targets, strategy, options)
ContextOperations.pushItemsBulk(sources, targets, itemPaths, strategy, options)
ContextOperations.synchronizeBidirectional(context1, context2, options)
ContextOperations.consolidateContexts(sources, target, options)
````

#### Example Usage

````javascript
// Push specific items from multiple sources
const results = ContextOperations.pushFromMultipleSources(
  [context1, context2, context3],
  targetContext,
  'mergeSourcePriority'
);

// Bidirectional sync with priorities
const result = ContextOperations.synchronizeBidirectional(context1, context2, {
  context1Priority: ['data.playerStats'],
  context2Priority: ['settings.ui'],
  excludePaths: ['data.cache']
});
````

## Filtering & Utilities

### ItemFilter / ContextItemFilter

**File**: contextItemFilter.js
**Dependencies**: None
**Exports**: `ItemFilter` (class)

Filtering capabilities for selective context merging operations.

#### Public API

````javascript
// Static Methods
ItemFilter.allowOnly(paths)           // Include only specified paths
ItemFilter.blockOnly(paths)           // Exclude specified paths
ItemFilter.matchPattern(regex)        // Include paths matching regex
ItemFilter.custom(conditionFunction)  // Custom filtering logic
ItemFilter.and(...filters)            // Combine filters with AND logic
ItemFilter.or(...filters)             // Combine filters with OR logic
````

#### Example Usage

````javascript
// Allow only specific paths
const filter = ItemFilter.allowOnly(['data.inventory', 'settings.volume']);

// Combine filters
const combinedFilter = ItemFilter.and(
  ItemFilter.allowOnly(['data.player']),
  ItemFilter.custom((source, target) => source.priority > target.priority)
);

// Use with ContextMerger
const result = ContextMerger.merge(source, target, 'mergeNewerWins', {
  customFilter: filter
});
````

### ContextItemSetter

**File**: contextItemSetter.js
**Dependencies**: `ContextValueWrapper`, `PathUtils`
**Exports**: `ContextItemSetter` (class)

Static utility class for managing item setting operations in ContextContainer instances.

#### Public API

````javascript
// Static Methods
ContextItemSetter.setItem(key, rawValue, containerInstance, itemOptionsOverrides)
// Supports dot-notation paths, validation, and wrapping logic
````

### ContextComparison

**File**: contextComparison.js
**Dependencies**: None
**Exports**: `ContextComparison` (class)

Comparison utilities for Context instances, ContextContainers, and ContextItems.

#### Public API

````javascript
// Static Constants
ContextComparison.COMPARISON_RESULTS = {
  SOURCE_NEWER: 'sourceNewer',
  TARGET_NEWER: 'targetNewer',
  EQUAL: 'equal',
  SOURCE_MISSING: 'sourceMissing',
  TARGET_MISSING: 'targetMissing',
  BOTH_MISSING: 'bothMissing'
}

// Static Methods
ContextComparison.compare(source, target, options = {})
// Options: compareBy ('modifiedAt', 'createdAt', etc.)
````

#### Example Usage

````javascript
const comparison = ContextComparison.compare(source, target, {
  compareBy: 'modifiedAt'
});
console.log(comparison.result); // 'sourceNewer', 'targetNewer', etc.
console.log(comparison.timeDifference); // Time difference in milliseconds
````

## Validation

### RootMapValidator

**File**: rootMapValidator.js
**Dependencies**: None
**Exports**: `RootMapValidator` (class)

Validates root map configurations and initialization parameters.

#### Public API

````javascript
// Static Methods (private implementations for internal validation)
// Used internally for validating ContextRootMap initialization
````

## Dependencies Graph

```
ContextOperations
├── ContextMerger
│   ├── ContextComparison
│   ├── ContextItem
│   ├── ContextContainer
│   └── ItemFilter
└── ItemFilter

ContextMerger
├── ContextComparison
├── ContextItem
├── ContextContainer
└── ItemFilter

ContextSync
├── ContextItem
├── ContextContainer
├── Context
├── ContextComparison
├── ContextAutoSync
├── ContextItemSync
└── ContextContainerSync

ContextContainerSync
├── ContextComparison
└── ContextContainerSyncEngine

ContextContainerSyncEngine
├── ContextContainer
└── ContextItemSync

ContextItemSync
├── ContextItem
├── ContextComparison
└── lodash

ContextContainer
├── ContextItem
├── ContextValueWrapper
├── ContextItemSetter
├── Validator (utils)
└── PathUtils (helpers)

ContextValueWrapper
├── ContextItem
└── ContextContainer

ContextItemSetter
├── ContextValueWrapper
└── PathUtils (helpers)
```

## Usage Patterns

### Single Item Operations
Use `ContextItem` directly or `ContextItemSync` for synchronization.

### Container Operations
Use `ContextContainer` for collections, `ContextContainerSync` for synchronization.

### Complex Merging
Use `ContextMerger` with `ItemFilter` for sophisticated merge operations.

### Bulk Operations
Use `ContextOperations` for multi-source/target operations.

### High-Level Sync
Use `ContextSync` as a facade for automatic delegation to appropriate sync classes.

All helpers follow the established coding conventions with ES6 syntax, proper error handling, and comprehensive JSDoc documentation.
