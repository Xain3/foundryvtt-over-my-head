# Constants System

This directory contains the complete constants management system for the Foundry VTT module. The system provides centralized configuration management, YAML-based configuration files, and comprehensive validation for module manifests.

## 📁 Directory Structure

```
src/constants/
├── constants.js              # Main constants module - exports parsed configuration
├── constants.unit.test.js    # Tests for the main constants module
├── manifest.js               # Validated manifest object - exports frozen manifest
├── manifest.unit.test.js     # Tests for manifest delegation
└── helpers/                  # Helper classes and utilities
    ├── constantsBuilder.js   # Core builder for constants management
    ├── constantsGetter.js    # File reading utilities for YAML files
    ├── constantsParser.js    # YAML parsing with advanced features
    ├── manifestParser.js     # Manifest validation and processing
    ├── README.md            # Detailed helper documentation
    └── *.unit.test.js       # Comprehensive test suites for each helper
```

## 🎯 System Overview

The constants system is built around a layered architecture that separates concerns:

1. **Configuration Source**: YAML files (primarily `constants.yaml`)
2. **File Management**: Reading and encoding handling (`ConstantsGetter`)
3. **Parsing Engine**: YAML processing with advanced features (`ConstantsParser`)
4. **Core Builder**: Main orchestration and caching (`ConstantsBuilder`)
5. **Validation Layer**: Manifest validation and immutability (`ManifestParser`)
6. **Public API**: Simple exports for consumers (`constants.js`, `manifest.js`)

## 📚 Core Modules

### constants.js

**Purpose**: Main entry point for accessing parsed configuration
**Exports**: Parsed constants object from YAML configuration
**Usage**: `import constants from './constants/constants.js'`

```javascript
// Access configuration values
const moduleRef = constants.referToModuleBy;           // "title"
const syncDefaults = constants.context.sync.defaults;  // { autoSync: true, ... }
const errorPattern = constants.errors.pattern;         // "{{module}}{{caller}}{{error}}{{stack}}"
```

**Key Features**:
- Provides access to all YAML-defined configuration
- Caches parsed configuration for performance
- Supports complex nested configuration structures
- Includes context management, error formatting, and helper constants

### manifest.js

**Purpose**: Provides validated, immutable module manifest
**Exports**: Validated and frozen manifest object from `module.json`
**Usage**: `import manifest from './constants/manifest.js'`

```javascript
// Access validated manifest properties
console.log(manifest.id);          // Module ID
console.log(manifest.title);       // Module title
console.log(manifest.version);     // Module version
console.log(manifest.description); // Module description

// Manifest is frozen and immutable
Object.isFrozen(manifest); // true
```

**Key Features**:
- Validates manifest against required attributes from constants
- Enforces immutability by freezing the manifest and nested objects
- Provides detailed error messages for validation failures
- Supports both array and object-based required attribute definitions
- Caches validation results for session-long use

## 🔧 Helper System

The `helpers/` directory contains specialized classes that power the constants system. Each helper has a specific responsibility and can be used independently or together.

### Quick Helper Reference

| Helper | Purpose | Key Methods |
|--------|---------|-------------|
| `ConstantsBuilder` | Main orchestration and caching | `.asString`, `.asObject` |
| `ConstantsGetter` | File reading and encoding | `.getConstantsYaml()` |
| `ConstantsParser` | YAML parsing with advanced features | `.parseConstants()`, `.createRootMapFromYaml()` |
| `ManifestParser` | Manifest validation and immutability | `.getValidatedManifest()` |

For detailed helper documentation, see [`helpers/README.md`](helpers/README.md).

## ⚙️ Configuration Structure

The system reads configuration from `constants.yaml` in the project root. The YAML structure supports:

### Module Configuration
```yaml
referToModuleBy: "title"
defaultFoundryModulesLocation: "game.modules"
```

### Error Management
```yaml
errors:
  separator: " || "
  pattern: "{{module}}{{caller}}{{error}}{{stack}}"
```

### Context System Configuration
```yaml
context:
  sync:
    defaults:
      autoSync: true
      syncStrategy: "mergeNewerWins"

  external:
    defaults:
      rootIdentifier: "module"
      pathFromRoot: "context"
    rootMap:
      window: "globalNamespace.window"
      game: "globalNamespace.game"
      module: "module"

  operationsParams:
    defaults:
      alwaysPullBeforeGetting: false
      alwaysPushAfterSetting: false
```

### Helper Constants
```yaml
contextHelpers:
  mergeStrategies:
    MERGE_NEWER_WINS: "mergeNewerWins"
    MERGE_SOURCE_WINS: "mergeSourceWins"

  comparisonResults:
    SOURCE_NEWER: "sourceNewer"
    TARGET_NEWER: "targetNewer"
    EQUAL: "equal"
```

## 🚀 Usage Patterns

### Basic Constants Access

```javascript
import constants from './constants/constants.js';

// Access simple values
const moduleReference = constants.referToModuleBy;

// Access nested configuration
const contextDefaults = constants.context.sync.defaults;
const errorConfig = constants.errors;

// Use in module initialization
const moduleConfig = {
  reference: constants.referToModuleBy,
  errorSeparator: constants.errors.separator,
  syncSettings: constants.context.sync.defaults
};
```

### Manifest Validation

```javascript
import manifest from './constants/manifest.js';

// Access validated manifest
console.log(`Initializing ${manifest.title} v${manifest.version}`);
console.log(`Module ID: ${manifest.id}`);

// Manifest is guaranteed to be valid and frozen
const moduleInfo = {
  id: manifest.id,
  title: manifest.title,
  version: manifest.version,
  description: manifest.description
};
```

### Advanced Helper Usage

```javascript
import ConstantsBuilder from './constants/helpers/constantsBuilder.js';
import ManifestParser from './constants/helpers/manifestParser.js';

// Custom configuration processing
const builder = new ConstantsBuilder();
const rawYaml = builder.asString;
const config = builder.asObject;

// Custom manifest validation
import customManifest from './custom-manifest.json';
const parser = new ManifestParser(customManifest);
const validatedCustom = parser.getValidatedManifest();
```

### Context Integration

```javascript
import constants from './constants/constants.js';
import manifest from './constants/manifest.js';

// Initialize context system with validated configuration
const contextManager = new ContextManager({
  moduleId: manifest.id,
  syncDefaults: constants.context.sync.defaults,
  operationParams: constants.context.operationsParams.defaults,
  rootMap: constants.context.external.rootMap
});
```

## 🧪 Testing

The constants system includes comprehensive test coverage for all components:

### Running Tests

```bash
# Run all constants tests
npm test constants

# Run specific component tests
npm test constants/constants.unit.test.js
npm test constants/manifest.unit.test.js
npm test constants/helpers

# Run with coverage
npm test -- --coverage constants
```

### Test Coverage Areas

**Core Modules**:
- Constants loading and caching behavior
- Manifest validation and delegation
- Error handling and edge cases

**Helper Classes**:
- File reading with various encodings
- YAML parsing with complex structures
- Manifest validation with different attribute formats
- Caching and performance optimization

**Integration Testing**:
- End-to-end configuration loading
- Manifest validation with real module.json files
- Cross-component interaction and dependency resolution

## 📊 Performance Characteristics

### Caching Strategy

- **Module-Level Caching**: Both `constants.js` and `manifest.js` cache results at module load
- **Helper Caching**: `ConstantsBuilder` caches both string and object representations
- **Session Persistence**: All caches persist for the lifetime of the JavaScript session
- **Memory Efficiency**: Frozen objects prevent accidental mutations and memory leaks

### Loading Performance

- **Lazy Evaluation**: Constants are only parsed when first accessed
- **File I/O Optimization**: YAML files are read once during module initialization
- **Parse Optimization**: Complex parsing operations are cached after first execution
- **Validation Efficiency**: Manifest validation occurs once per session

## 🔒 Security and Validation

### Input Validation

- **Type Safety**: All inputs are validated for correct types
- **Structure Validation**: YAML structure is validated against expected schema
- **Manifest Integrity**: Required attributes are enforced and validated
- **Path Resolution**: Safe path resolution prevents injection attacks

### Immutability Guarantees

- **Frozen Objects**: All exported objects are deeply frozen
- **Nested Protection**: Nested objects and arrays are recursively frozen
- **Runtime Safety**: Mutations are prevented at runtime
- **Configuration Integrity**: Original configuration cannot be modified

## 🔧 Error Handling

The system provides comprehensive error handling with clear, actionable messages:

### Common Error Scenarios

```javascript
// Missing YAML file
// Error: "ENOENT: no such file or directory, open 'constants.yaml'"

// Invalid YAML syntax
// Error: "Failed to parse constants"

// Missing required manifest attributes
// Error: "Manifest is missing required attribute: title"

// Invalid manifest structure
// Error: "Manifest data is not an object"

// Invalid required attributes configuration
// Error: "Required manifest attributes are not defined in constants"
```

### Error Recovery

- **Graceful Degradation**: System fails fast with clear error messages
- **Detailed Logging**: All errors are logged with context information
- **Development Support**: Error messages include debugging information
- **Production Safety**: Errors prevent invalid configurations from being used

## 🔄 Integration Points

### Module System Integration

```javascript
// In main module initialization
import constants from './constants/constants.js';
import manifest from './constants/manifest.js';

const moduleInstance = {
  manifest: manifest,
  config: constants,
  id: manifest.id,
  title: manifest.title
};
```

### Context System Integration

```javascript
// Context managers can access validated configuration
const contextConfig = {
  defaults: constants.context.sync.defaults,
  external: constants.context.external,
  helpers: constants.contextHelpers
};
```

### Error System Integration

```javascript
// Error formatters can use error configuration
const errorFormatter = new ErrorFormatter({
  pattern: constants.errors.pattern,
  separator: constants.errors.separator
});
```

## 🚀 Future Enhancements

### Planned Improvements

- **Schema Validation**: JSON Schema validation for YAML structure
- **Environment Overrides**: Environment-specific configuration merging
- **Hot Reloading**: Dynamic configuration updates during development
- **Configuration Validation**: Enhanced validation rules for complex configurations
- **Performance Monitoring**: Metrics collection for parsing and access times

### Extension Points

- **Custom Parsers**: Support for additional configuration formats
- **Validation Rules**: Pluggable validation for different manifest types
- **Cache Strategies**: Alternative caching strategies for different use cases
- **Encoding Support**: Additional character encoding support

## 📖 API Reference

### Quick Reference

```javascript
// Main exports
import constants from './constants/constants.js';    // Parsed YAML configuration
import manifest from './constants/manifest.js';      // Validated manifest object

// Helper classes (advanced usage)
import ConstantsBuilder from './constants/helpers/constantsBuilder.js';
import ConstantsGetter from './constants/helpers/constantsGetter.js';
import ConstantsParser from './constants/helpers/constantsParser.js';
import ManifestParser from './constants/helpers/manifestParser.js';
```

### Type Information

```typescript
// TypeScript-style interfaces for reference
interface Constants {
  referToModuleBy: string;
  defaultFoundryModulesLocation: string;
  errors: {
    separator: string;
    pattern: string;
  };
  context: {
    sync: { defaults: object };
    external: { defaults: object; rootMap: object };
    operationsParams: { defaults: object };
  };
  contextHelpers: {
    mergeStrategies: object;
    comparisonResults: object;
    errorMessages: object;
  };
}

interface Manifest {
  id: string;
  title: string;
  description: string;
  version: string;
  [key: string]: any; // Additional manifest properties
}
```

## 📋 Best Practices

### Configuration Management

1. **Use Centralized Access**: Always import from the main modules, not helpers directly
2. **Validate Early**: Let the system validate configuration at startup
3. **Immutable Usage**: Treat all exported objects as read-only
4. **Error Handling**: Wrap imports in try-catch for startup error handling

### Performance Optimization

1. **Import Once**: Import constants and manifest at module level, not in functions
2. **Cache Results**: Store frequently accessed values in local variables
3. **Avoid Deep Access**: Destructure nested values for repeated use
4. **Monitor Memory**: Be aware that frozen objects persist in memory

### Development Workflow

1. **Test Configuration**: Validate YAML changes with tests before deployment
2. **Version Control**: Track changes to `constants.yaml` carefully
3. **Documentation**: Update documentation when adding new configuration sections
4. **Validation**: Use the helper classes for custom validation needs

---

For detailed information about the helper classes and their APIs, see the [Helper Documentation](helpers/README.md).
