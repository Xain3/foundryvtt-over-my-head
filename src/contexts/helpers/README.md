# Context Helpers

This directory contains helper classes and utilities that support the context management system. These helpers provide specialized functionality for synchronization, merging, filtering, validation, and data management operations.

## Overview

The helpers are organized into several functional categories:

- **Entry Point**: [`ContextHelpers`](#contexthelpers)
- **Core Data Management**: [`ContextItem`](#contextitem), [`ContextContainer`](#contextcontainer), [`ContextValueWrapper`](#contextvaluewrapper)
- **Path Utilities**: [`ContextPathUtils`](#contextpathutils)
- **Synchronization**: [`ContextSync`](#contextsync), [`ContextItemSync`](#contextitemsync), [`ContextContainerSync`](#contextcontainersync), [`ContextContainerSyncEngine`](#contextcontainersyncengine), [`ContextAutoSync`](#contextautosync), [`ContextLegacySync`](#contextlegacysync)
- **Merging & Operations**: [`ContextMerger`](#contextmerger), [`ContextOperations`](#contextoperations)
- **Filtering & Utilities**: [`ItemFilter`](#itemfilter), [`ContextItemFilter`](#contextitemfilter), [`ContextItemSetter`](#contextitemsetter), [`ContextComparison`](#contextcomparison)
- **Validation**: [`RootMapValidator`](#rootmapvalidator)

## Entry Point

### ContextHelpers

**File**: contextHelpers.js
**Dependencies**: All helper classes
**Exports**: `ContextHelpers` (class)

Centralized entry point for all context helper classes and methods. This class provides access to all helper functionality through a single import, reducing the need for multiple imports when using helpers from outside the helpers folder.

#### Public API

````javascript
// All helper classes exposed as static properties
ContextHelpers.Item
ContextHelpers.Container
ContextHelpers.ValueWrapper
ContextHelpers.PathUtils
ContextHelpers.ItemSetter
ContextHelpers.Sync
ContextHelpers.ItemSync
ContextHelpers.ContainerSync
ContextHelpers.ContainerSyncEngine
ContextHelpers.AutoSync
ContextHelpers.LegacySync
ContextHelpers.Merger
ContextHelpers.Operations
ContextHelpers.Filter
ContextHelpers.Comparison
ContextHelpers.Validator

// Convenience methods for common operations
ContextHelpers.sync(source, target, operation, options)         // async
ContextHelpers.syncSafe(source, target, operation, options)     // async
ContextHelpers.autoSync(source, target, options)               // async
ContextHelpers.merge(source, target, strategy, options)
ContextHelpers.compare(source, target, options)
ContextHelpers.wrap(value, options)
ContextHelpers.resolveMixedPath(rootObject, path)
ContextHelpers.pathExists(rootObject, path)
ContextHelpers.getValueFromMixedPath(rootObject, path)

// Constants and enums
ContextHelpers.SYNC_OPERATIONS
ContextHelpers.COMPARISON_RESULTS
ContextHelpers.MERGE_STRATEGIES

````

#### Example Usage

````javascript
// Instead of multiple imports:
// import { ContextItem } from './helpers/contextItem.js';
// import ContextSync from './helpers/contextSync.js';
// import ContextMerger from './helpers/contextMerger.js';

// Use single import:
import ContextHelpers from './helpers/contextHelpers.js';

// Access classes
const item = new ContextHelpers.Item('value');
const result = await ContextHelpers.sync(source, target, 'mergeNewerWins');
const merged = ContextHelpers.merge(source, target);

// Use path utilities
const pathValue = ContextHelpers.getValueFromMixedPath(container, 'player.stats.level');
const pathExists = ContextHelpers.pathExists(container, 'player.name');

// Use constants
const operation = ContextHelpers.SYNC_OPERATIONS.MERGE_NEWER_WINS;
````

**Note**: For usage within the helpers folder, continue to use direct imports for better dependency management and to avoid circular dependencies.

### ContextHelpers File Structure

The new file structure now includes:

```
contextHelpers.js
contextHelpers.unit.test.js
```

### Real-world Usage Example

Before ContextHelpers, context.js had multiple imports:

```javascript
import { ContextContainer } from './helpers/contextContainer.js';
import ContextMerger from './helpers/contextMerger.js';
import ContextSync from './helpers/contextSync.js';
import ContextOperations from './helpers/contextOperations.js';
```

With ContextHelpers, this simplifies to:

```javascript
import ContextHelpers from './helpers/contextHelpers.js';

// Then use: ContextHelpers.Container, ContextHelpers.Merger, etc.
```

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
// Options: wrapAs, wrapPrimitives, recordAccess, recordAccessForMetadata, frozen, metadata, containerOptions
````

#### Example Usage

````javascript
const wrapped = ContextValueWrapper.wrap('hello', {
  wrapAs: 'ContextItem',
  metadata: { type: 'greeting' }
});
console.log(wrapped instanceof ContextItem); // true
````

## Path Utilities

### ContextPathUtils

**File**: contextPathUtils.js
**Dependencies**: `PathUtils` (from `../../helpers/pathUtils.js`)
**Exports**: `ContextPathUtils` (class)

Context-aware path utilities that handle mixed ContextContainer/plain object structures. Provides specialized path resolution for contexts that may contain both ContextContainer instances and plain JavaScript objects in their hierarchy.

#### Public API

````javascript
// Static Methods
ContextPathUtils.resolveMixedPath(rootObject, path)
ContextPathUtils.pathExistsInMixedStructure(rootObject, path)
ContextPathUtils.getValueFromMixedPath(rootObject, path)
````

#### Example Usage

````javascript
// Navigate through mixed ContextContainer and plain object structures
const container = new ContextContainer();
container.setItem('player', { name: 'John', stats: { level: 5 } });

// Resolve path through ContextContainer -> plain object -> plain object
const result = ContextPathUtils.resolveMixedPath(container, 'player.stats.level');
console.log(result.exists); // true
console.log(result.value);  // 5

// Check if path exists
const exists = ContextPathUtils.pathExistsInMixedStructure(container, 'player.name');
console.log(exists); // true

// Get value directly
const playerName = ContextPathUtils.getValueFromMixedPath(container, 'player.name');
console.log(playerName); // 'John'
````

**Key Features**:
- **Mixed Navigation**: Handles both ContextContainer (using `hasItem`/`getItem`) and plain objects (using property access)
- **Strategy Pattern**: Uses the generic PathUtils with a context-aware navigation strategy
- **SRP Compliance**: Separates context-specific logic from generic path utilities
- **Full Path Information**: Returns complete resolution details including final container and key

## Synchronization

### ContextSync

**File**: contextSync.js
**Dependencies**: `ContextItem`, `ContextContainer`, `ContextComparison`, `ContextAutoSync`, `ContextLegacySync`, `constants`
**Exports**: `ContextSync` (class)

Facade class providing synchronization capabilities for all context types. Uses delegation pattern to route synchronization operations to specialized classes:
- **Context instances**: Delegates to ContextMerger (dynamically imported) for sophisticated handling
- **ContextContainer/ContextItem instances**: Delegates to ContextLegacySync for backward compatibility
- **Type detection**: Uses `isContextObject` property for Context instances, `instanceof` for others

#### Public API

````javascript
// Static Constants (delegated from specialized classes)
ContextSync.SYNC_OPERATIONS = ContextLegacySync.SYNC_OPERATIONS
ContextSync.COMPARISON_RESULTS = ContextComparison.COMPARISON_RESULTS

// Static Methods
ContextSync.compare(source, target, options = {})
ContextSync.sync(source, target, operation, options = {})           // async
ContextSync.syncSafe(source, target, operation, options = {})       // async
ContextSync.autoSync(source, target, options = {})                  // async
ContextSync.validateCompatibility(source, target)

// Sync Options:
// - deepSync: boolean = true - Deep synchronization for nested structures
// - compareBy: string = 'modifiedAt' - Timestamp field for comparison
// - preserveMetadata: boolean = true - Whether to preserve metadata
// - autoSync: boolean = false - Use automatic sync operation detection
````

#### Key Features

- **Smart Delegation**: Automatically routes to appropriate sync implementation based on object type
- **Async Operations**: Uses dynamic imports for ContextMerger to avoid circular dependencies
- **Robust Error Handling**: `syncSafe` method provides comprehensive error handling with warnings
- **Type Compatibility**: Validates object compatibility before synchronization
- **Context Detection**: Uses `obj?.isContextObject === true` for Context instance detection

#### Example Usage

````javascript
// Basic synchronization
const result = await ContextSync.sync(
  sourceContext,
  targetContext,
  ContextSync.SYNC_OPERATIONS.MERGE_NEWER_WINS
);
console.log(result.success); // true/false
console.log(result.changes); // Array of changes made

// Safe synchronization with error handling
const safeResult = await ContextSync.syncSafe(
  sourceContext,
  targetContext,
  'mergeNewerWins',
  { deepSync: true, preserveMetadata: false }
);
console.log(safeResult.success); // true/false
console.log(safeResult.warnings); // Array of warnings
console.log(safeResult.error); // Error message if failed

// Automatic sync detection
const autoResult = await ContextSync.autoSync(sourceContext, targetContext, {
  compareBy: 'modifiedAt'
});

// Compatibility validation
const isCompatible = ContextSync.validateCompatibility(source, target);
if (isCompatible) {
  // Proceed with synchronization
}
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

### ContextLegacySync

**File**: contextLegacySync.js
**Dependencies**: `ContextItem`, `ContextContainer`, `ContextComparison`, `ContextItemSync`, `ContextContainerSync`
**Exports**: `ContextLegacySync` (class)

Handles legacy synchronization operations for ContextContainer and ContextItem instances. This class contains deprecated sync methods that will be replaced by newer implementations.

#### Public API

````javascript
// Static Constants (sourced from centralized constants.yaml)
ContextLegacySync.SYNC_OPERATIONS = {
  UPDATE_SOURCE_TO_TARGET: 'updateSourceToTarget',
  UPDATE_TARGET_TO_SOURCE: 'updateTargetToSource',
  MERGE_NEWER_WINS: 'mergeNewerWins',
  MERGE_SOURCE_PRIORITY: 'mergeSourcePriority',
  MERGE_TARGET_PRIORITY: 'mergeTargetPriority',
  NO_ACTION: 'noAction'
}

// Static Methods
ContextLegacySync.performLegacySync(source, target, operation, options = {})
ContextLegacySync.validateCompatibility(source, target)
````

#### Example Usage

````javascript
const result = ContextLegacySync.performLegacySync(
  sourceContainer,
  targetContainer,
  ContextLegacySync.SYNC_OPERATIONS.MERGE_NEWER_WINS
);
console.log(result.success); // true/false
console.log(result.changes); // Array of changes made
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
**Dependencies**: `ContextComparison`, `ContextItem`, `ContextContainer`, `ItemFilter`, `ContextPathUtils`
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
**Dependencies**: `ContextPathUtils`
**Exports**: `ItemFilter` (class)

Filtering capabilities for selective context merging operations. Provides both simple path-based filtering and advanced custom logic filtering.

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
  ItemFilter.custom((source, target, path) => source.priority > target.priority)
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
// Static Constants (sourced from centralized constants.yaml)
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

## Testing

The helpers include comprehensive unit tests and integration tests:

- **Unit Tests**: Each helper class has individual unit tests (`*.unit.test.js`) that test isolated functionality
- **Integration Tests**: Located in `tests/integration/contextHelpers.int.test.js` and `tests/integration/contextHelpers.smoke.int.test.js`

### Integration Test Coverage

The comprehensive integration tests (`contextHelpers.int.test.js`) verify:

- **ContextSync Facade**: Testing ContextSync as a unified interface for all synchronization operations
- **ContextOperations → ContextMerger Workflow**: Complex merging operations with filtering and bulk operations
- **Container Operations**: Deep nested synchronization and bidirectional sync
- **Single Item Operations**: Item-level synchronization with metadata preservation
- **Path Resolution**: ContextPathUtils integration for mixed ContextContainer/plain object navigation
- **Advanced Filtering**: ItemFilter usage with allowOnly, blockOnly, excludePaths, and pattern matching
- **Nested Container Integration**: Mixed type handling with ContextContainer and ContextItem nesting
- **Real-world Scenarios**: Player data sync, settings management, module configuration
- **Bulk Operations**: Multi-source/target operations and consolidation
- **Error Handling**: Graceful handling of failures, type mismatches, and edge cases

The simplified smoke tests (`contextHelpers.smoke.int.test.js`) provide:

- **Basic Integration**: Core functionality verification
- **Essential Workflows**: Primary use cases and common patterns
- **Quick Validation**: Fast-running tests for development cycles

### Running Tests

````bash
# Run all helper tests
npm test helpers

# Run only unit tests
npm test helpers.unit

# Run comprehensive integration tests
npm test contextHelpers.int

# Run smoke integration tests
npm test contextHelpers.smoke
````

## Dependencies Graph

```
ContextHelpers (Entry Point)
├── All helper classes (for external usage)

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
├── ContextComparison
├── ContextAutoSync
├── ContextLegacySync
└── constants

ContextLegacySync
├── ContextItem
├── ContextContainer
├── ContextComparison
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

ContextItem
└── Validator (utils)
```

## Usage Patterns

### External Usage (Recommended)
Use `ContextHelpers` as a single entry point when importing from outside the helpers folder.

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
