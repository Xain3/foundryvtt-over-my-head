# Helpers

This directory contains core utility classes for path resolution, module management, error formatting, and configuration parsing. These helpers provide foundational functionality used throughout the module for navigating object structures, retrieving Foundry VTT modules, and resolving configuration maps.

## Overview

The helpers are organized into functional categories:

- **Entry Point**: [`Helpers`](#helpers-class)
- **Path Utilities**: [`PathUtils`](#pathutils)
- **Module Management**: [`moduleGetter`](#modulegetter)
- **Configuration Parsing**: [`RootMapParser`](#rootmapparser)
- **Error Handling**: [`errorFormatter`](#errorformatter)

## Entry Point

### Helpers Class

**File**: helpers.js
**Dependencies**: All helper modules
**Exports**: `Helpers` (class)

Centralized entry point for all helper utilities. This class provides access to all helper functionality through a single import, reducing the need for multiple imports when using helpers from outside the helpers folder.

#### Public API

```javascript
// Direct access to all helper classes
Helpers.PathUtils           // Complete PathUtils class
Helpers.RootMapParser       // Complete RootMapParser class

// Convenience methods for common operations
Helpers.resolvePath(namespace, path, useGetterFallback?)
Helpers.extractKeyComponents(key, options?)
Helpers.resolveMixedPath(rootObject, path, navigationStrategy?)
Helpers.pathExists(rootObject, path)
Helpers.getValueFromMixedPath(rootObject, path)
Helpers.getModule(moduleName, globalNamespace?)
Helpers.parseRootMap(options)
Helpers.formatError(error, options?)

// Workflow methods for complex operations
Helpers.resolveModuleConfiguration({ rootMap, moduleId, namespace? })
Helpers.validateFoundryEnvironment(namespace?, requiredPaths?)
Helpers.batchResolvePaths(namespace, paths, options?)
```

#### Example Usage

```javascript
// Instead of multiple imports:
// import PathUtils from './helpers/pathUtils.js';
// import { getModule } from './helpers/moduleGetter.js';
// import RootMapParser from './helpers/rootMapParser.js';

// Use single import:
import Helpers from './helpers/helpers.js';

// Access classes directly
const settings = Helpers.PathUtils.resolvePath(globalThis, 'game.settings');
const module = Helpers.getModule('my-module-id');

// Use convenience methods
const userSettings = Helpers.resolvePath(globalThis, 'game.user.settings');
const pathExists = Helpers.pathExists(container, 'player.inventory');

// Use workflow methods
const result = Helpers.resolveModuleConfiguration({
  rootMap: { 
    game: "game", 
    user: "game.user", 
    module: "module" 
  },
  moduleId: 'my-foundry-module'
});

// Validate Foundry environment
const validation = Helpers.validateFoundryEnvironment(globalThis, [
  'game', 'game.user', 'game.modules', 'ui', 'canvas'
]);
```

**Note**: For usage within the helpers folder, continue to use direct imports for better dependency management and to avoid circular dependencies.

## Core Utilities

### PathUtils

**File**: [`pathUtils.js`](pathUtils.js)
**Dependencies**: `Validator` (from utils/static)
**Exports**: `PathUtils` (class)

Static utility class providing methods for path resolution, object navigation, and key extraction. Handles dot-notation paths, optional chaining, and getter fallback for Map-like collections.

#### Public API

```javascript
// Core path resolution
PathUtils.resolvePath(namespace, path, useGetterFallback?)
// Resolves "game.settings" → actual settings object

// Object navigation with arrays
PathUtils.getNestedObjectValue(obj, pathParts, options?)
// Navigate using ['user', 'profile', 'name']

// Key extraction and parsing
PathUtils.extractKeyComponents(key, options?)
// Parse "user.profile.name" → { firstKey: "user", remainingPath: "profile.name" }

// Advanced mixed-structure navigation
PathUtils.resolveMixedPath(rootObject, path, navigationStrategy?)
PathUtils.pathExistsInMixedStructure(rootObject, path)
PathUtils.getValueFromMixedPath(rootObject, path)
```

#### Key Features

- **Dot-notation Resolution**: Handles paths like `"game.settings.volume"`
- **Getter Fallback**: Supports Map-like collections with `.get()` methods
- **Optional Chaining**: Safe navigation through potentially undefined properties
- **Mixed Navigation**: Works with both plain objects and specialized containers
- **Validation**: Type checking and error handling for all inputs
- **Flexible Strategies**: Configurable navigation patterns for different object types

#### Example Usage

```javascript
// Basic path resolution
const settings = PathUtils.resolvePath(globalThis, "game.settings");
const userLevel = PathUtils.resolvePath(window, "game.user.character.level");

// Handle missing paths gracefully
const missing = PathUtils.resolvePath(globalThis, "does.not.exist"); // undefined

// Disable getter fallback for plain objects only
const value = PathUtils.resolvePath(namespace, "path.to.property", false);

// Navigate mixed structures (ContextContainers + plain objects)
const result = PathUtils.resolveMixedPath(container, "player.stats.level");
if (result.exists) {
  console.log(result.value); // Resolved value
  console.log(result.finalContainer); // Container holding the final key
  console.log(result.finalKey); // The final key that was resolved
}

// Check existence before access
if (PathUtils.pathExistsInMixedStructure(container, "player.inventory")) {
  const inventory = PathUtils.getValueFromMixedPath(container, "player.inventory");
}

// Extract components for dynamic processing
const { firstKey, remainingPath } = PathUtils.extractKeyComponents("user.profile.settings.theme");
// firstKey: "user", remainingPath: "profile.settings.theme"
```

### moduleGetter

**File**: [`moduleGetter.js`](moduleGetter.js)
**Dependencies**: `constants`, `PathUtils`
**Exports**: `getModule` (function)

Retrieves Foundry VTT modules from the global modules collection with robust error handling and configurable module location.

#### Public API

```javascript
getModule(moduleName, globalNamespace?)
// Retrieves module by ID from game.modules collection
```

#### Key Features

- **Foundry Integration**: Works with Foundry VTT's module system
- **Configurable Location**: Uses `constants.defaultFoundryModulesLocation` for flexibility
- **PathUtils Integration**: Leverages PathUtils for reliable module collection access
- **Error Handling**: Graceful handling of missing modules or invalid collections
- **Type Validation**: Validates input parameters

#### Example Usage

```javascript
// Basic module retrieval
const module = getModule('my-module-id');
if (module) {
  console.log(module.title); // Module title
  console.log(module.active); // Whether module is active
}

// Custom namespace (for testing or different environments)
const module = getModule('test-module', customNamespace);

// Handle missing modules
const module = getModule('non-existent-module'); // returns null

// Access module data
const module = getModule('my-module');
if (module?.active) {
  console.log(`Module ${module.title} is active`);
  console.log(`Version: ${module.data.version}`);
}
```

### RootMapParser

**File**: [`rootMapParser.js`](rootMapParser.js)
**Dependencies**: `manifest`, `Validator`, `PathUtils`, `moduleGetter`
**Exports**: `RootMapParser` (class)

Parses root map configurations into resolved object references. Handles special cases like module resolution and supports recursive parsing of nested configurations.

#### Public API

```javascript
// Parse entire root map
RootMapParser.parse({ rootMap, key?, namespace?, module? })

// Parse specific key from root map
RootMapParser.parse({ rootMap, key: 'specificKey', namespace?, module? })
```

#### Key Features

- **Configuration Resolution**: Converts string paths to actual object references
- **Module Handling**: Special handling for `"module"` values using getModule
- **Recursive Parsing**: Supports nested configuration objects
- **Context Awareness**: Uses provided namespace and module context
- **Error Handling**: Meaningful error messages for resolution failures
- **Validation**: Input parameter validation

#### Example Usage

```javascript
// Basic root map parsing
const rootMap = {
  window: "window",
  game: "game",
  user: "game.user",
  ui: "ui.notifications",
  module: "module", // Special case - resolves to actual module
  settings: "game.settings"
};

const resolved = RootMapParser.parse({
  rootMap,
  namespace: globalThis,
  module: 'my-foundry-module'
});

console.log(resolved.game); // globalThis.game
console.log(resolved.user); // globalThis.game.user
console.log(resolved.module); // Actual module object
console.log(resolved.ui); // globalThis.ui.notifications

// Parse specific key only
const gameObject = RootMapParser.parse({
  rootMap,
  key: 'game',
  namespace: globalThis,
  module: 'my-module'
});

// Nested root map parsing
const nestedConfig = {
  external: {
    window: "window",
    game: "game"
  },
  internal: {
    module: "module",
    settings: "game.settings"
  }
};

const nestedResolved = RootMapParser.parse({
  rootMap: nestedConfig,
  namespace: globalThis,
  module: 'my-module'
});
// Results in nested structure with resolved references
```

### errorFormatter

**File**: [`errorFormatter.js`](errorFormatter.js)
**Dependencies**: `constants`
**Exports**: `formatError` (function)

Formats errors with consistent structure and configurable detail levels for logging and user display.

#### Public API

```javascript
formatError(error, options?)
// Options: includeStack, moduleContext, timestamp, format
```

#### Key Features

- **Consistent Formatting**: Standardized error message structure
- **Stack Trace Control**: Optional stack trace inclusion
- **Module Context**: Adds module information to error messages
- **Multiple Formats**: Support for different output formats
- **Type Handling**: Works with Error objects, strings, and other types

#### Example Usage

```javascript
try {
  // Some operation that might fail
  throw new Error("Something went wrong");
} catch (error) {
  // Basic formatting
  const formatted = formatError(error);
  console.error(formatted);

  // Detailed formatting with stack trace
  const detailed = formatError(error, {
    includeStack: true,
    moduleContext: true,
    timestamp: true
  });
  console.error(detailed);

  // Custom format
  const custom = formatError(error, {
    format: 'json'
  });
}
```

## Integration and Workflows

### Module-Aware Configuration Resolution

The helpers work together to provide comprehensive configuration resolution:

```javascript
// Complete workflow using Helpers entry point
const result = Helpers.resolveModuleConfiguration({
  rootMap: {
    // External references
    window: "window",
    game: "game",
    user: "game.user",
    canvas: "canvas",
    ui: "ui.notifications",
    
    // Module reference
    module: "module",
    
    // Nested configuration
    contexts: {
      player: "game.user",
      world: "game.world"
    }
  },
  moduleId: 'my-foundry-module',
  namespace: globalThis
});

if (result.success) {
  console.log('Module:', result.module);
  console.log('Resolved Config:', result.resolvedConfig);
} else {
  console.error('Configuration failed:', result.error);
}
```

### Environment Validation

```javascript
// Validate Foundry environment setup
const validation = Helpers.validateFoundryEnvironment(globalThis, [
  'game',
  'game.user',
  'game.modules',
  'game.settings',
  'ui',
  'ui.notifications',
  'canvas'
]);

if (validation.isValid) {
  console.log('Environment ready:', validation.summary);
  // Proceed with module initialization
} else {
  console.error('Missing required objects:', validation.missingPaths);
  // Handle incomplete environment
}
```

### Batch Path Resolution

```javascript
// Resolve multiple paths at once
const paths = {
  currentUser: 'game.user',
  gameSettings: 'game.settings',
  notifications: 'ui.notifications',
  modules: 'game.modules',
  activeScene: 'game.scenes.active'
};

const resolution = Helpers.batchResolvePaths(globalThis, paths, {
  continueOnError: true
});

if (resolution.success) {
  console.log('All paths resolved:', resolution.resolved);
} else {
  console.log('Resolved:', resolution.resolved);
  console.error('Failed:', resolution.failed);
  console.error('Errors:', resolution.errors);
}
```

## Dependencies and Architecture

### Dependency Graph

```
Helpers (Entry Point)
├── PathUtils
│   └── Validator (utils/static)
├── moduleGetter
│   ├── constants
│   └── PathUtils
├── RootMapParser
│   ├── manifest
│   ├── Validator (utils/static)
│   ├── PathUtils
│   └── moduleGetter
└── errorFormatter
    └── constants
```

### Interaction Flow

```
1. PathUtils (Foundation)
   ↓ provides path resolution
2. moduleGetter (Specialized)
   ↓ uses PathUtils for module collection access
3. RootMapParser (Integration)
   ↓ orchestrates PathUtils + moduleGetter
4. Helpers (Entry Point)
   └ provides unified access to all utilities
```

### Real-World Usage Pattern

The helpers follow a **hierarchical dependency pattern** where each layer builds upon the previous:

1. **PathUtils**: Core path resolution capabilities
2. **moduleGetter**: Foundry-specific module access using PathUtils
3. **RootMapParser**: Configuration parsing using both PathUtils and moduleGetter
4. **Helpers**: Unified interface providing convenience methods and workflows

## Error Handling

All helpers implement robust error handling:

- **Input Validation**: Type checking and parameter validation
- **Graceful Degradation**: Return `null`/`undefined` instead of throwing for missing data
- **Meaningful Messages**: Clear error messages with context
- **Error Formatting**: Consistent error structure via errorFormatter

## Testing

The helpers include comprehensive test coverage:

- **Unit Tests**: Individual helper testing (`*.unit.test.js`)
- **Integration Tests**: Cross-helper interaction testing
- **Real-world Scenarios**: Foundry VTT environment simulation

### Running Tests

```bash
# Run all helper tests
npm test -- src/helpers

# Run specific helper tests
npm test -- src/helpers/pathUtils.unit.test.js
npm test -- src/helpers/moduleGetter.unit.test.js

# Run integration tests
npm test -- tests/integration/pathUtils-moduleGetter-rootMapParser.int.test.js
```

## Usage Recommendations

### External Usage (Recommended)

Use `Helpers` as the single entry point when importing from outside the helpers folder:

```javascript
import Helpers from './helpers/helpers.js';

// Use convenience methods
const config = Helpers.parseRootMap({ /* config */ });
const module = Helpers.getModule('module-id');

// Or access classes directly
const resolved = Helpers.PathUtils.resolvePath(namespace, path);
```

### Internal Usage (Within Helpers)

Use direct imports within the helpers folder to avoid circular dependencies:

```javascript
import PathUtils from './pathUtils.js';
import { getModule } from './moduleGetter.js';
```

### Performance Considerations

- **PathUtils**: Efficient path traversal with minimal object creation
- **Caching**: Consider caching resolved paths for frequently accessed configurations
- **Batch Operations**: Use `batchResolvePaths` for multiple path resolution
- **Lazy Loading**: Helpers class uses static methods to avoid instantiation overhead

### Best Practices

1. **Use the Helpers entry point** for external imports
2. **Validate environments** before accessing Foundry objects
3. **Handle missing modules gracefully** using null checks
4. **Batch resolve paths** when resolving multiple configurations
5. **Use meaningful error messages** via formatError for debugging
6. **Test with mock environments** to ensure robustness

## Constants Integration

The helpers integrate with the module's constants system:

- **moduleGetter**: Uses `constants.defaultFoundryModulesLocation` for module collection path
- **errorFormatter**: Uses constants for formatting configuration
- **Configuration**: All constants are centrally managed via `constants.yaml`

This ensures consistent behavior and easy configuration management across the entire module.
