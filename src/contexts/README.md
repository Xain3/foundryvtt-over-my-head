````markdown
# Context System

This directory contains the complete context management system for the Foundry VTT module. The system provides sophisticated data management, synchronization capabilities, and advanced path-based access patterns for managing complex application state in FoundryVTT environments.

## 📁 Directory Structure

```
src/contexts/
├── context.mjs                # Main Context class - orchestration layer with component management
├── context.unit.test.mjs      # Tests for the main Context class
├── contextFactory.mjs         # Factory for creating different context manager types
└── helpers/                  # Specialized helper classes and utilities
    ├── contextHelpers.mjs     # Centralized entry point for all helper functionality
    ├── contextItem.mjs        # Single data item with metadata and timestamps
    ├── contextContainer.mjs   # Collection manager with dot-notation access
    ├── contextValueWrapper.mjs # Utility for wrapping values into context objects
    ├── contextPathUtils.mjs   # Context-aware path resolution utilities
    ├── contextItemSetter.mjs  # Item setting operations with validation
    ├── contextSync.mjs        # Facade for all synchronization operations
    ├── contextItemSync.mjs    # Synchronization for ContextItem instances
    ├── contextContainerSync.mjs # Synchronization for ContextContainer instances
    ├── contextContainerSyncEngine.mjs # Complex recursive sync operations
    ├── contextAutoSync.mjs    # Automatic synchronization (work in progress)
    ├── contextLegacySync.mjs  # Legacy sync operations for backward compatibility
    ├── contextMerger.mjs      # Sophisticated merging with conflict resolution
    ├── contextOperations.mjs  # Bulk operations and multi-source/target workflows
    ├── contextItemFilter.mjs  # Filtering capabilities for selective operations
    ├── contextComparison.mjs  # Comparison utilities with timestamp analysis
    ├── validators/           # Validation utilities
    │   ├── rootMapValidator.mjs # Root map configuration validation
    │   └── *.unit.test.mjs    # Test suites for validators
    ├── README.md            # Detailed helper documentation
    └── *.unit.test.mjs       # Comprehensive test suites for each helper
```

## 🎯 System Overview

The context system is built around a sophisticated modular architecture that emphasizes composition over inheritance:

1. **Core Context Management**: Main orchestration layer with component-based architecture (`Context`)
2. **Data Structures**: Flexible containers for individual items and collections (`ContextItem`, `ContextContainer`)
3. **Path Resolution**: Advanced dot-notation access with mixed structure support (`ContextPathUtils`)
4. **Synchronization Engine**: Multi-strategy synchronization with conflict resolution (`ContextSync`, specialized sync classes)
5. **Merging Operations**: Sophisticated data merging with filtering and bulk operations (`ContextMerger`, `ContextOperations`)
6. **Utility Layer**: Value wrapping, filtering, and comparison utilities
7. **Factory Pattern**: Flexible context creation for different storage backends (`ContextFactory`)

## 📚 Core Components

### context.mjs

**Purpose**: Main orchestration layer providing sophisticated data management framework
**Architecture**: Composition-based with delegation to specialized helper classes
**Extends**: `ContextContainer` for enhanced path navigation capabilities
**Usage**: `import Context from './contexts/context.mjs'`

```javascript
// Create a Context with component-based architecture
const context = new Context({
  initializationParams: {
    data: { player: { name: 'Hero', stats: { level: 5 } } },
    settings: { ui: { theme: 'dark' }, volume: 0.8 },
    flags: { experimental: { features: true } },
    constants: { appVersion: '1.0.0' },
    manifest: { moduleId: 'my-module', title: 'My Module' }
  },
  operationsParams: {
    alwaysPullBeforeGetting: false,
    alwaysPushAfterSetting: true,
    pushTo: [otherContext1, otherContext2]
  }
});

// Component-based access with dot notation
const playerName = context.getItem('data.player.name');        // 'Hero'
const playerLevel = context.getItem('data.player.stats.level'); // 5
const theme = context.getItem('settings.ui.theme');            // 'dark'

// Component getter approach
const playerStats = context.data.getItem('player.stats');
const uiSettings = context.settings.getItem('ui');
const appVersion = context.constants.value.appVersion;

// Advanced operations with automatic sync
context.setItem('data.player.level', 6); // Automatically pushes to configured targets
const inventory = context.pullAndGetItem({
  itemPath: 'data.player.inventory',
  pullFrom: [remoteContext1, remoteContext2]
});
```

**Key Features**:
- **Component Architecture**: Seven specialized components (schema, constants, manifest, flags, state, data, settings)
- **Automatic Synchronization**: Configurable pull/push behavior with performance tracking
- **Path Navigation**: Inherited dot-notation support with component routing
- **Flexible Operations**: Merge, compare, and bulk operations with sophisticated conflict resolution
- **Metadata Management**: Comprehensive timestamp tracking and access logging
- **Performance Monitoring**: Built-in metrics for pull/push operations with cooldown management

### contextFactory.mjs

**Purpose**: Factory pattern implementation for creating different context manager types
**Exports**: `ContextFactory` (class)
**Usage**: `import ContextFactory from './contexts/contextFactory.mjs'`

```javascript
// Create different types of context managers
const memoryContext = ContextFactory.create('inMemory', {
  data: { user: 'test', session: 'abc123' }
});

const storageContext = ContextFactory.create('localStorage', {
  rootIdentifier: 'localStorage',
  pathFromRoot: 'myApp.context'
});

const moduleContext = ContextFactory.create('module', {
  source: 'module',
  rootIdentifier: 'game.modules',
  pathFromRoot: 'myModule.context'
});

// Batch creation with configuration
const contexts = ContextFactory.createMultiple({
  memory: { data: { temp: true } },
  storage: {
    rootIdentifier: 'localStorage',
    pathFromRoot: 'myApp.persistent'
  },
  module: {
    rootIdentifier: 'game.modules',
    pathFromRoot: 'myModule.state'
  }
});

// Check supported types
const types = ContextFactory.getSupportedTypes();
// ['inMemory', 'external', 'localStorage', 'sessionStorage', 'module', 'user', 'world']
```

**Key Features**:
- **Multiple Backend Support**: In-memory, localStorage, sessionStorage, module, user, and world contexts
- **Unified Interface**: Consistent creation pattern regardless of backend type
- **Batch Operations**: Create multiple contexts from configuration objects
- **Type Validation**: Built-in validation for supported context types
- **Error Handling**: Comprehensive error reporting for failed context creation

## 🔧 Helper System Architecture

The `helpers/` directory contains specialized classes organized into functional categories:

### Entry Point Helper

| Helper | Purpose | Key Methods |
|--------|---------|-------------|
| `ContextHelpers` | Centralized access to all helper functionality | `.sync()`, `.merge()`, `.compare()` |

### Core Data Management

| Helper | Purpose | Key Methods |
|--------|---------|-------------|
| `ContextItem` | Single data item with metadata and timestamps | `.value`, `.metadata`, `.freeze()` |
| `ContextContainer` | Collection manager with dot-notation access | `.setItem()`, `.getItem()`, `.hasItem()` |
| `ContextValueWrapper` | Value wrapping utilities | `.wrap()` |

### Path and Navigation

| Helper | Purpose | Key Methods |
|--------|---------|-------------|
| `ContextPathUtils` | Context-aware path resolution for mixed structures | `.resolveMixedPath()`, `.pathExistsInMixedStructure()` |
| `ContextItemSetter` | Item setting operations with validation | `.setItem()` |

### Synchronization System

| Helper | Purpose | Key Methods |
|--------|---------|-------------|
| `ContextSync` | Facade for all synchronization operations | `.sync()`, `.syncSafe()`, `.autoSync()` |
| `ContextItemSync` | ContextItem synchronization | `.mergeNewerWins()`, `.updateTargetToMatchSource()` |
| `ContextContainerSync` | ContextContainer synchronization | `.mergeNewerWins()`, `.updateTargetToMatchSource()` |
| `ContextContainerSyncEngine` | Complex recursive sync operations | `.sync()` |
| `ContextLegacySync` | Legacy sync operations | `.performLegacySync()` |
| `ContextAutoSync` | Automatic sync detection (WIP) | `.autoSync()`, `.determineStrategy()` |

### Merging and Operations

| Helper | Purpose | Key Methods |
|--------|---------|-------------|
| `ContextMerger` | Sophisticated merging with conflict resolution | `.merge()`, `.analyze()` |
| `ContextOperations` | Bulk operations and multi-source/target workflows | `.pushFromMultipleSources()`, `.synchronizeBidirectional()` |

### Utilities and Validation

| Helper | Purpose | Key Methods |
|--------|---------|-------------|
| `ContextItemFilter` | Filtering for selective operations | `.allowOnly()`, `.blockOnly()`, `.custom()` |
| `ContextComparison` | Comparison utilities with timestamp analysis | `.compare()` |
| `RootMapValidator` | Root map configuration validation | Internal validation methods |

For comprehensive helper documentation, see [`helpers/README.md`](helpers/README.md).

## ⚙️ Configuration Integration

The context system integrates seamlessly with the constants system for configuration management:

### Constants Integration

```javascript
import constants from '../constants/constants.mjs';
import Context from './context.mjs';

// Context uses constants for default configuration
const context = new Context({
  operationsParams: {
    alwaysPullBeforeGetting: constants.context.operationsParams.defaults.alwaysPullBeforeGetting,
    alwaysPushAfterSetting: constants.context.operationsParams.defaults.alwaysPushAfterSetting,
    pullFrom: constants.context.operationsParams.defaults.pullFrom,
    pushTo: constants.context.operationsParams.defaults.pushTo
  }
});

// Access centralized context configuration
const syncDefaults = constants.context.sync.defaults;
const mergeStrategies = constants.contextHelpers.mergeStrategies;
const comparisonResults = constants.contextHelpers.comparisonResults;
```

### Dynamic Configuration

```javascript
// Context can be reconfigured at runtime
context.reinitialize({
  operationsParams: {
    alwaysPullBeforeGetting: true,
    pullFrom: [newSourceContext]
  },
  initializationParams: {
    data: { newData: 'updated' }
  }
});
```

## 🚀 Usage Patterns

### Basic Context Operations

```javascript
import Context from './contexts/context.mjs';

// Initialize with structured data
const context = new Context({
  initializationParams: {
    data: {
      player: {
        name: 'Hero',
        stats: { level: 5, health: 100, mana: 50 },
        inventory: { weapons: ['sword'], items: ['potion'] }
      }
    },
    settings: {
      ui: { theme: 'dark', volume: 0.8 },
      gameplay: { difficulty: 'normal' }
    }
  }
});

// Nested path access
const playerName = context.getItem('data.player.name');
const playerLevel = context.getItem('data.player.stats.level');
const uiTheme = context.getItem('settings.ui.theme');

// Component-specific access
const playerData = context.data.getItem('player');
const uiSettings = context.settings.getItem('ui');

// Modify with automatic sync
context.setItem('data.player.stats.level', 6);
context.setItem('settings.ui.volume', 0.9);
```

### Advanced Synchronization

```javascript
import ContextHelpers from './contexts/helpers/contextHelpers.mjs';

// Multi-strategy synchronization
const result = await ContextHelpers.sync(
  sourceContext,
  targetContext,
  ContextHelpers.SYNC_OPERATIONS.MERGE_NEWER_WINS,
  {
    deepSync: true,
    preserveMetadata: true,
    compareBy: 'modifiedAt'
  }
);

// Safe synchronization with error handling
const safeResult = await ContextHelpers.syncSafe(
  sourceContext,
  targetContext,
  'mergeNewerWins',
  { onError: 'warn' }
);

// Automatic sync detection
const autoResult = await ContextHelpers.autoSync(sourceContext, targetContext);
```

### Sophisticated Merging

```javascript
import ContextHelpers from './contexts/helpers/contextHelpers.mjs';

// Filtered merging
const mergeResult = ContextHelpers.merge(source, target, 'mergeNewerWins', {
  allowOnly: ['data.player.stats', 'settings.ui.theme'],
  blockOnly: ['data.cache', 'data.temporary'],
  preserveMetadata: true
});

// Single item merging
const itemResult = context.mergeItem(
  otherContext,
  'data.player.inventory.weapons',
  'mergeSourcePriority'
);

// Merge analysis (dry run)
const analysis = context.analyzeMerge(otherContext, 'mergeNewerWins');
console.log(analysis.conflicts); // Potential conflicts
console.log(analysis.changes);   // Planned changes
```

### Bulk Operations

```javascript
import ContextHelpers from './contexts/helpers/contextHelpers.mjs';

// Multi-source consolidation
const consolidationResult = ContextHelpers.Operations.consolidateContexts(
  [context1, context2, context3],
  targetContext,
  {
    strategy: 'mergeNewerWins',
    conflictResolution: 'prioritizeFirst'
  }
);

// Bidirectional synchronization
const bidirectionalResult = ContextHelpers.Operations.synchronizeBidirectional(
  context1,
  context2,
  {
    strategy: 'mergeSourcePriority',
    context1Priority: ['data.playerStats'],
    context2Priority: ['settings.ui'],
    excludePaths: ['data.cache', 'data.temporary']
  }
);

// Push to multiple targets
const pushResults = ContextHelpers.Operations.pushToMultipleTargets(
  sourceContext,
  [target1, target2, target3],
  'mergeNewerWins'
);
```

### Advanced Filtering

```javascript
import ContextHelpers from './contexts/helpers/contextHelpers.mjs';

// Path-based filtering
const pathFilter = ContextHelpers.Filter.allowOnly([
  'data.player.stats',
  'settings.ui.theme'
]);

// Pattern-based filtering
const patternFilter = ContextHelpers.Filter.matchPattern(/^data\.player\./);

// Custom logic filtering
const customFilter = ContextHelpers.Filter.custom((source, target, path) => {
  return source.metadata.priority > target.metadata.priority;
});

// Combined filtering
const combinedFilter = ContextHelpers.Filter.and(
  ContextHelpers.Filter.allowOnly(['data.player']),
  ContextHelpers.Filter.custom((source, target, path) => {
    return source.modifiedAt > target.modifiedAt;
  })
);

// Use with operations
const result = ContextHelpers.merge(source, target, 'mergeNewerWins', {
  customFilter: combinedFilter
});
```

### Factory-Based Context Creation

```javascript
import ContextFactory from './contexts/contextFactory.mjs';

// Create context ecosystem
const contextSystem = ContextFactory.createMultiple({
  memory: {
    data: { session: 'active', temp: {} }
  },
  localStorage: {
    rootIdentifier: 'localStorage',
    pathFromRoot: 'myModule.persistent'
  },
  module: {
    rootIdentifier: 'game.modules',
    pathFromRoot: 'myModule.context'
  }
});

// Set up synchronization relationships
const mainContext = new Context({
  operationsParams: {
    pullFrom: [contextSystem.module, contextSystem.localStorage],
    pushTo: [contextSystem.localStorage],
    alwaysPullBeforeGetting: true,
    alwaysPushAfterSetting: true
  }
});

// Operations automatically sync across ecosystem
mainContext.setItem('data.player.level', 10); // Pushes to localStorage
const playerName = mainContext.getItem('data.player.name'); // Pulls from module and localStorage
```

## 🧪 Testing Strategy

The context system includes comprehensive testing at multiple levels:

### Test Categories

**Unit Tests**:
- Individual class functionality
- Method behavior and edge cases
- Error handling and validation
- Isolated component testing

**Integration Tests**:
- Cross-component interaction
- End-to-end workflows
- Real-world usage scenarios
- Performance characteristics

**Smoke Tests**:
- Basic functionality verification
- Essential workflow validation
- Quick development feedback

### Running Tests

```bash
# Run all context tests
npm test contexts

# Run specific component tests
npm test contexts/context.unit.test.mjs
npm test contexts/contextFactory.unit.test.mjs
npm test contexts/helpers

# Run integration tests
npm test contexts.int

# Run smoke tests
npm test contexts.smoke

# Run with coverage
npm test -- --coverage contexts
```

### Test Coverage Areas

**Core Classes**:
- Context initialization and component management
- Factory pattern implementation and error handling
- Helper class functionality and edge cases

**Synchronization System**:
- Multi-strategy synchronization workflows
- Conflict resolution and error handling
- Performance tracking and cooldown management

**Path Resolution**:
- Mixed structure navigation
- Enhanced nested path checking
- Reserved key handling and fallback strategies

**Advanced Operations**:
- Bulk operations with multiple sources/targets
- Sophisticated filtering and merging
- Bidirectional synchronization with exclusions

## 📊 Performance Characteristics

### Architecture Benefits

- **Composition Pattern**: Flexible component assembly without inheritance complexity
- **Lazy Evaluation**: Components and operations are initialized only when needed
- **Efficient Caching**: Intelligent caching strategies for path resolution and synchronization
- **Minimal Memory Footprint**: Frozen objects and shared references where appropriate

### Synchronization Performance

- **Operation Tracking**: Built-in performance metrics for pull/push operations
- **Cooldown Management**: Prevents excessive synchronization with configurable cooldowns
- **Batch Operations**: Efficient multi-source/target operations with reduced overhead
- **Strategy Optimization**: Different sync strategies optimized for specific use cases

### Path Resolution Optimization

- **Mixed Navigation Strategy**: Efficient traversal of ContextContainer and plain object hierarchies
- **Enhanced Path Checking**: Optional deep path checking with minimal performance impact
- **Reserved Key Handling**: Intelligent fallback strategies for reserved key conflicts
- **Caching Strategy**: Path resolution results cached for repeated access

## 🔒 Security and Validation

### Input Validation

- **Type Safety**: Comprehensive type checking for all inputs and operations
- **Path Validation**: Safe path resolution preventing injection attacks
- **Structure Validation**: Schema validation for complex data structures
- **Operation Validation**: Compatibility checking before synchronization operations

### Immutability and Protection

- **Component Isolation**: Read-only components (schema, constants, manifest) are immutable
- **Frozen Objects**: Strategic freezing of critical data structures
- **Metadata Protection**: Secure metadata handling with access control
- **Reserved Key Protection**: Automatic handling of reserved JavaScript properties

### Error Handling and Recovery

- **Graceful Degradation**: System continues operation despite individual component failures
- **Comprehensive Logging**: Detailed error messages with context information
- **Safe Operations**: `syncSafe` and similar methods provide error isolation
- **Recovery Strategies**: Built-in recovery mechanisms for common failure scenarios

## 🔄 Integration Patterns

### Module System Integration

```javascript
// In main module
import Context from './contexts/context.mjs';
import constants from './constants/constants.mjs';
import manifest from './constants/manifest.mjs';

const moduleContext = new Context({
  initializationParams: {
    constants: constants,
    manifest: manifest,
    data: { moduleId: manifest.id }
  }
});

// Export for other module components
export default moduleContext;
```

### FoundryVTT Integration

```javascript
// FoundryVTT-specific context setup
const foundryContext = ContextFactory.create('module', {
  rootIdentifier: 'game.modules',
  pathFromRoot: `${manifest.id}.context`
});

// Sync with game state
const gameSync = await ContextHelpers.sync(
  foundryContext,
  localContext,
  'mergeNewerWins',
  {
    deepSync: true,
    compareBy: 'modifiedAt'
  }
);
```

### Cross-Component Communication

```javascript
// Context-based pub/sub pattern
const eventContext = new Context({
  initializationParams: {
    state: { events: {}, subscribers: {} }
  }
});

// Publish event
eventContext.setItem('state.events.playerLevelUp', {
  playerId: 'player1',
  newLevel: 5,
  timestamp: Date.now()
});

// Subscribe to changes
const levelUpEvent = eventContext.getItem('state.events.playerLevelUp');
```

## 🚀 Future Enhancements

### Planned Improvements

- **Real-time Synchronization**: WebSocket-based real-time context synchronization
- **Persistence Strategies**: Advanced persistence with compression and encryption
- **Schema Validation**: JSON Schema validation for context structures
- **Event System**: Built-in event emission for context changes
- **Performance Monitoring**: Advanced metrics and profiling capabilities

### Extension Points

- **Custom Sync Strategies**: Pluggable synchronization strategies
- **Storage Backends**: Additional storage backend implementations
- **Middleware System**: Interception and transformation of operations
- **Query System**: Advanced querying capabilities for complex data

### Migration Path

- **Version Compatibility**: Backward compatibility with legacy context implementations
- **Migration Tools**: Automated migration utilities for data structure changes
- **Deprecation Handling**: Graceful deprecation of old patterns with warnings

## 📖 API Reference

### Quick Reference

```javascript
// Main exports
import Context from './contexts/context.mjs';           // Main Context class
import ContextFactory from './contexts/contextFactory.mjs'; // Factory for context creation

// Helper entry point
import ContextHelpers from './contexts/helpers/contextHelpers.mjs'; // All helper functionality

// Specialized helpers (advanced usage)
import { ContextItem } from './contexts/helpers/contextItem.mjs';
import { ContextContainer } from './contexts/helpers/contextContainer.mjs';
import ContextSync from './contexts/helpers/contextSync.mjs';
import ContextMerger from './contexts/helpers/contextMerger.mjs';
```

### Type Information

```typescript
// TypeScript-style interfaces for reference
interface Context extends ContextContainer {
  // Component getters
  get schema(): ContextItem;
  get constants(): ContextItem;
  get manifest(): ContextItem;
  get flags(): ContextContainer;
  get state(): ContextContainer;
  get data(): ContextContainer;
  get settings(): ContextContainer;

  // Context-specific methods
  setItem(itemPath: string, itemValue: any, options?: object, overrides?: object): Context;
  pullAndGetItem(params: { itemPath: string, pullFrom?: Context[], options?: object }): any;
  getReservedItem(key: string): any;

  // Operations
  compare(target: Context, options?: object): object;
  merge(target: Context, strategy?: string, options?: object): object;
  mergeItem(target: Context, itemPath: string, strategy?: string, options?: object): object;
  analyzeMerge(target: Context, strategy?: string, options?: object): object;

  // Management
  reinitialize(params?: object): void;
  clear(): void;
}

interface ContextFactory {
  static create(type: string, options?: object): BaseContextManager | null;
  static createMultiple(config: object): object;
  static getSupportedTypes(): string[];
  static isTypeSupported(type: string): boolean;
}

interface ContextHelpers {
  // Helper classes
  static Item: typeof ContextItem;
  static Container: typeof ContextContainer;
  static Sync: typeof ContextSync;
  static Merger: typeof ContextMerger;
  // ... other helper classes

  // Convenience methods
  static sync(source: any, target: any, operation: string, options?: object): Promise<object>;
  static merge(source: any, target: any, strategy?: string, options?: object): object;
  static compare(source: any, target: any, options?: object): object;
  // ... other convenience methods
}
```

## 📋 Best Practices

### Context Design

1. **Component Separation**: Use appropriate components (data, settings, flags, state) for different data types
2. **Path Organization**: Structure data with clear hierarchical paths for easy navigation
3. **Metadata Usage**: Leverage metadata for tracking data provenance and validation
4. **Immutable Configuration**: Use schema, constants, and manifest components for read-only configuration

### Performance Optimization

1. **Batch Operations**: Use bulk operations for multiple changes to reduce overhead
2. **Strategic Caching**: Leverage built-in caching for frequently accessed paths
3. **Cooldown Management**: Configure appropriate cooldowns for automatic synchronization
4. **Memory Management**: Clear unused contexts and avoid deep nesting where possible

### Synchronization Strategy

1. **Appropriate Strategies**: Choose sync strategies based on use case (newer wins, source priority, etc.)
2. **Conflict Resolution**: Implement custom conflict resolution for complex scenarios
3. **Error Handling**: Use safe sync methods in production environments
4. **Performance Monitoring**: Track sync performance metrics for optimization

### Development Workflow

1. **Test Coverage**: Ensure comprehensive testing for context operations and edge cases
2. **Integration Testing**: Test cross-component interactions and real-world scenarios
3. **Documentation**: Document complex context structures and sync relationships
4. **Factory Usage**: Use factory pattern for consistent context creation across the application

---

For detailed information about the helper classes and their APIs, see the [Helper Documentation](helpers/README.md).
````
