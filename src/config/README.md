# Config System

This directory contains the complete configuration management system for the Foundry VTT module. The system provides centralized configuration management through a unified Config class, YAML-based configuration files, and comprehensive validation for module manifests.

## 📁 Directory Structure

```text
src/config/
├── config.mjs                # Central configuration class - unified access point
├── config.unit.test.mjs       # Tests for the Config class
├── constants.mjs              # Parsed constants from YAML - exports frozen configuration
├── constants.unit.test.mjs    # Tests for the constants module
├── manifest.mjs               # Validated manifest object - exports frozen manifest
├── manifest.unit.test.mjs     # Tests for manifest delegation
├── README.md                 # This documentation file
└── helpers/                  # Helper classes and utilities
    ├── constantsBuilder.mjs   # Core builder for constants management
    ├── constantsGetter.mjs    # File reading utilities for YAML files
    ├── constantsParser.mjs    # YAML parsing with advanced features
    ├── manifestParser.mjs     # Manifest validation and processing
    ├── README.md            # Detailed helper documentation
    └── *.unit.test.mjs       # Comprehensive test suites for each helper
```

## 🎯 System Overview

The config system is built around a centralized architecture that provides unified access to all configuration data:

1. **Configuration Source**: YAML files (primarily `constants.yaml`) and `module.json`
2. **File Management**: Reading and encoding handling (`ConstantsGetter`)
3. **Parsing Engine**: YAML processing with advanced features (`ConstantsParser`)
4. **Core Builder**: Main orchestration and caching (`ConstantsBuilder`)
5. **Validation Layer**: Manifest validation and immutability (`ManifestParser`)
6. **Module APIs**: Specialized exports for different needs (`constants.mjs`, `manifest.mjs`)
7. **Unified Interface**: Central access point for all configuration (`config.mjs`)

## Differences from .dev/config

This `src/config/` directory contains **runtime configurations** for the Foundry VTT Over My Head module itself, while `.dev/config/` contains **development-time configurations** for tooling and maintenance processes.

### src/config/ (Module Runtime)

- **Purpose**: Defines the module's behavior, constants, and manifest at runtime
- **Examples**: Module constants from YAML, validated manifest from module.json
- **Files**: JavaScript modules that parse and provide configuration to the module
- **Usage**: Imported by module code during Foundry VTT execution
- **Scope**: Affects how the Over My Head module functions in Foundry VTT

### .dev/config/ (Development Tooling)

- **Purpose**: Controls development workflows, CI/CD pipelines, and maintenance scripts
- **Examples**: Version bumping rules, build configurations, deployment settings
- **Files**: YAML/JSON configs for tools like bump-version, CI scripts, etc.
- **Usage**: Read by development scripts during build, test, and release processes
- **Scope**: Affects how the project is developed and maintained

**Key Distinction**: `src/config/` configures the actual module functionality, while `.dev/config/` configures the development environment and processes.

## 📚 Core Modules

### config.mjs - **RECOMMENDED ENTRY POINT**

**Purpose**: Central configuration instance providing unified access to all module configuration
**Exports**: Pre-instantiated config object that encapsulates both constants and manifest
**Usage**: `import config from './config/config.mjs'`

```javascript
import config from './config/config.mjs';

// Access constants directly
const moduleRef = config.constants.moduleManagement.referToModuleBy; // "title"
const syncDefaults = config.constants.context.sync.defaults; // { autoSync: true, ... }
const errorPattern = config.constants.errors.pattern; // "{{module}}{{caller}}{{error}}{{stack}}"

// Access manifest directly
const moduleId = config.manifest.id; // Module ID
const moduleTitle = config.manifest.title; // Module title
const moduleVersion = config.manifest.version; // Module version

// Get enhanced manifest with shortName for backwards compatibility
const manifestWithShortName = config.buildManifestWithShortName();
console.log(manifestWithShortName.shortName); // Derived from constants or manifest

// Export constants to global scope for external access
config.exportConstants();
console.log(globalThis.OMHconstants.errors.pattern); // Access constants globally

// Use in module initialization
console.log(
  `Initializing ${config.manifest.title} v${config.manifest.version}`
);
```

**Key Features**:

- **Single Source of Truth**: Provides unified access to all configuration data
- **Encapsulation**: Hides implementation details of constants and manifest loading
- **Singleton Pattern**: Pre-instantiated object ensures consistent state across modules
- **Zero Setup**: No need to instantiate, just import and use
- **Consistent Interface**: Standardized access pattern throughout the module
- **Future-Proof**: Easy to extend with additional configuration sources
- **Dependency Simplification**: Reduces import complexity across the codebase
- **Manifest Enhancement**: Provides `buildManifestWithShortName()` method for backwards compatibility
- **Global Export**: Provides `exportConstants()` method for external module access

#### buildManifestWithShortName() Method

The Config class includes a `buildManifestWithShortName()` method that returns an enhanced version of the manifest with a `shortName` property for backwards compatibility.

```javascript
import config from './config/config.mjs';

// Get manifest with shortName added
const manifestWithShortName = config.buildManifestWithShortName();

console.log(manifestWithShortName.shortName); // From constants.moduleManagement.shortName or derived
console.log(manifestWithShortName.id); // Original manifest properties preserved
console.log(manifestWithShortName.title); // Original manifest properties preserved
```

**Behavior**:

- **From Constants**: Uses `constants.moduleManagement.shortName` if available
- **Derived Fallback**: If not in constants, derives from `manifest.title` (e.g., "Test Module" → "TM")
- **ID Fallback**: If title unavailable, uses first 3 alphanumeric characters from `manifest.id`
- **Immutability**: Returns a frozen object that cannot be modified
- **Original Preservation**: All original manifest properties are preserved

**Use Cases**:

- Module initialization requiring backwards-compatible shortName
- Legacy code that expects shortName property on manifest
- Consistent manifest format across different module versions

#### exportConstants() Method

The Config class includes an `exportConstants()` method that safely exports module constants to the global scope for external access.

```javascript
import config from './config/config.mjs';

// Export constants to global scope
config.exportConstants();

// Access constants from anywhere in the application
console.log(globalThis.OMHconstants.errors.pattern);
console.log(globalThis.OMHconstants.context.sync.defaults);

// Safe multiple calls - prevents duplicate exports
config.exportConstants(); // "OverMyHead: Constants exported to global scope."
config.exportConstants(); // "OverMyHead: Constants already exported to global scope."
```

**Behavior**:

- **Safe Export**: Only exports if not already present in global scope
- **Duplicate Prevention**: Warns if constants are already exported, prevents overwriting
- **Same Reference**: Exports the exact same frozen object as `config.constants`
- **Global Access**: Makes constants available as `globalThis.OMHconstants`
- **Immutability Preserved**: Exported constants remain frozen and unmodifiable

**Use Cases**:

- Making constants accessible to external modules or scripts
- Providing configuration access without requiring Config imports
- Debugging and development console access to configuration
- Integration with third-party modules that need configuration data
- Legacy compatibility for modules expecting global constants

**Migration Note**: This method was moved from the OverMyHead class to centralize configuration management and improve encapsulation.

### constants.mjs

**Purpose**: Parsed and frozen constants object from YAML configuration
**Exports**: Parsed constants object from YAML configuration
**Usage**: `import constants from './config/constants.mjs'` (or via Config class)

````javascript
// Direct access (not recommended for new code)
import constants from './config/constants.mjs';

```javascript
// Recommended access via Config
import config from './config/config.mjs';
const constants = config.constants;

// Access configuration values
const moduleRef = constants.moduleManagement.referToModuleBy;           // "title"
const syncDefaults = constants.context.sync.defaults;  // { autoSync: true, ... }
const errorPattern = constants.errors.pattern;         // "{{module}}{{caller}}{{error}}{{stack}}"
````

**Key Features**:

- Provides access to all YAML-defined configuration
- Caches parsed configuration for performance
- Supports complex nested configuration structures
- Includes context management, error formatting, and helper constants

### manifest.mjs

**Purpose**: Validated and frozen module manifest from module.json
**Exports**: Validated and frozen manifest object from `module.json`
**Usage**: `import manifest from './config/manifest.mjs'` (or via Config class)

```javascript
// Direct access (not recommended for new code)
import manifest from './config/manifest.mjs';

// Recommended access via Config
import Config from './config/config.mjs';
const config = new Config();
const manifest = config.manifest;

// Access validated manifest properties
console.log(manifest.id); // Module ID
console.log(manifest.title); // Module title
console.log(manifest.version); // Module version
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

The `helpers/` directory contains specialized classes that power the config system. Each helper has a specific responsibility and can be used independently or together.

### Quick Helper Reference

| Helper             | Purpose                              | Key Methods                                     |
| ------------------ | ------------------------------------ | ----------------------------------------------- |
| `ConstantsBuilder` | Main orchestration and caching       | `.asString`, `.asObject`                        |
| `ConstantsGetter`  | File reading and encoding            | `.getConstantsYaml()`                           |
| `ConstantsParser`  | YAML parsing with advanced features  | `.parseConstants()`, `.createRootMapFromYaml()` |
| `ManifestParser`   | Manifest validation and immutability | `.getValidatedManifest()`                       |

For detailed helper documentation, see [`helpers/README.md`](helpers/README.md).

## ⚙️ Configuration Structure

The system reads configuration from `constants.yaml` in the project root. The YAML structure supports:

### Module Configuration

```yaml
moduleManagement:
  referToModuleBy: 'title'
  shortName: 'OMH' # Optional: Custom short name for backwards compatibility
  defaults:
    modulesLocation: 'game.modules'
```

### Error Management

```yaml
errors:
  separator: ' || '
  pattern: '{{module}}{{caller}}{{error}}{{stack}}'
```

### Context System Configuration

```yaml
context:
  sync:
    defaults:
      autoSync: true
      syncStrategy: 'mergeNewerWins'

  external:
    defaults:
      rootIdentifier: 'module'
      pathFromRoot: 'context'
    rootMap:
      window: 'globalNamespace.window'
      game: 'globalNamespace.game'
      module: 'module'

  operationsParams:
    defaults:
      alwaysPullBeforeGetting: false
      alwaysPushAfterSetting: false
```

### Helper Constants

```yaml
contextHelpers:
  mergeStrategies:
    MERGE_NEWER_WINS: 'mergeNewerWins'
    MERGE_SOURCE_WINS: 'mergeSourceWins'

  comparisonResults:
    SOURCE_NEWER: 'sourceNewer'
    TARGET_NEWER: 'targetNewer'
    EQUAL: 'equal'
```

### Settings Type Normalization (Foundry v13)

The settings subsystem normalizes `config.type` from YAML into Foundry-acceptable constructors/classes prior to registration.

- Primitives (case-insensitive):
  - `boolean` → `Boolean`
  - `number`/`int`/`integer`/`float`/`double` → `Number`
  - `string` → `String`
  - `object` → `Object`
  - `array` → `Array`
- Foundry DataFields:
  - Dotted path: `foundry.data.fields.BooleanField`
  - Class name: `BooleanField`, `NumberField`, `StringField`, `ArrayField`, `ObjectField`, `SchemaField`
  - Prefix: `datafield:boolean` or `field:boolean`
- Foundry DataModels:
  - Prefix: `datamodel:` (falls back to `foundry.abstract.DataModel`)
  - Path form: `datamodel:Your.Namespace.Model`

Behavior:

- Only replaces `config.type` if resolution yields a function (constructor/DataField/DataModel). Unknown strings remain unchanged.
- Performed in `SettingsParser` during parsing, before `game.settings.register()`.

Example YAML:

```yaml
settings:
  settingsList:
    - key: 'useModule'
      config:
        name: '...'
        scope: 'world'
        config: true
        type: boolean # normalized to Boolean
        default: true

    - key: 'advancedFlag'
      config:
        name: '...'
        scope: 'world'
        config: true
        type: datafield:boolean # normalized to foundry.data.fields.BooleanField (if available)
        default: true
```

## 🚀 Usage Patterns

### Recommended Pattern: Config Instance (NEW)

```javascript
import config from './config/config.mjs';

// Access both constants and manifest directly from the singleton
const moduleInfo = {
  id: config.manifest.id,
  syncSettings: config.constants.context.sync.defaults,
};

// Get enhanced manifest with shortName for backwards compatibility
const manifestWithShortName = config.buildManifestWithShortName();

// Export constants to global scope for external access
config.exportConstants();

// Access exported constants globally
console.log(globalThis.OMHconstants.errors.pattern);

// Pass config to other modules
const contextManager = new ContextManager({
  moduleId: config.manifest.id,
  rootMap: config.constants.context.external.rootMap,
});

const errorFormatter = new ErrorFormatter({
  pattern: config.constants.errors.pattern,
  moduleTitle: config.manifest.title,
});

// Use enhanced manifest in module initialization
console.log(
  `Initializing ${manifestWithShortName.title} (${manifestWithShortName.shortName})`
);
```

### Legacy Pattern: Direct Imports (DEPRECATED)

```javascript
// Old pattern - still works but not recommended for new code
import constants from './config/constants.mjs';
import manifest from './config/manifest.mjs';

// Use in module initialization
const moduleConfig = {
  reference: constants.referToModuleBy,
  errorSeparator: constants.errors.separator,
  moduleId: manifest.id,
  moduleTitle: manifest.title,
};
```

### Advanced Helper Usage

```javascript
import ConstantsBuilder from './config/helpers/constantsBuilder.mjs';
import ManifestParser from './config/helpers/manifestParser.mjs';

// Custom configuration processing
const builder = new ConstantsBuilder();
const rawYaml = builder.asString;
const config = builder.asObject;

// Custom manifest validation
import customManifest from './custom-manifest.json';
const parser = new ManifestParser(customManifest);
const validatedCustom = parser.getValidatedManifest();
```

### Module Initialization Pattern

```javascript
import config from './config/config.mjs';

// Use configuration directly in module lifecycle
Hooks.once('init', () => {
  console.log(
    `Initializing ${config.manifest.title} v${config.manifest.version}`
  );

  // Export constants for external access
  config.exportConstants();

  // Initialize context with config data
  const contextManager = new ContextManager({
    moduleId: config.manifest.id,
    defaults: config.constants.context.sync.defaults,
  });

  // Setup error handling with config data
  const errorHandler = new ErrorHandler({
    pattern: config.constants.errors.pattern,
    moduleTitle: config.manifest.title,
  });
});
```

## 🧪 Testing

The config system includes comprehensive test coverage for all components:

### Running Tests

```bash
# Run all config tests
npm test config

# Run specific component tests
npm test config/config.unit.test.mjs
npm test config/constants.unit.test.mjs
npm test config/manifest.unit.test.mjs
npm test config/helpers

# Run integration tests
npm test tests/integration/constants.int.test.mjs

# Run with coverage
npm test -- --coverage config
```

### Test Coverage Areas

**Core Modules**:

- Config class integration and access patterns
- Constants loading and caching behavior
- Manifest validation and delegation
- Error handling and edge cases

**Helper Classes**:

- File reading with various encodings
- YAML parsing with complex structures
- Manifest validation with different attribute formats
- Caching and performance optimization

**Integration Testing**:

- End-to-end configuration loading through Config class
- Cross-component interaction and dependency resolution
- Real-world usage patterns and workflows

## 📊 Performance Characteristics

### Caching Strategy

- **Module-Level Caching**: Config class instances share cached constants and manifest
- **Helper Caching**: `ConstantsBuilder` caches both string and object representations
- **Session Persistence**: All caches persist for the lifetime of the JavaScript session
- **Memory Efficiency**: Frozen objects prevent accidental mutations and memory leaks

### Loading Performance

- **Lazy Evaluation**: Configuration is only parsed when first accessed
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

### Unified Access Pattern (RECOMMENDED)

````javascript
### Unified Access Pattern (RECOMMENDED)

```javascript
// Single import for all configuration needs
import config from './config/config.mjs';

// All module systems can use the same config instance
const moduleInstance = {
  config: config,
  constants: config.constants
};
````

### Context System Integration

```javascript
// Context managers use config for complete setup
const contextConfig = {
  moduleId: config.manifest.id,
  defaults: config.constants.context.sync.defaults,
  external: config.constants.context.external,
  helpers: config.constants.contextHelpers,
};
```

### Error System Integration

```javascript
// Error formatters use config for module-aware formatting
const errorFormatter = new ErrorFormatter({
  pattern: config.constants.errors.pattern,
  separator: config.constants.errors.separator,
  moduleTitle: config.manifest.title,
});
```

## 🚀 Migration Guide

### Migrating from Direct Imports to Config Instance

**Old Pattern**:

```javascript
import constants from './config/constants.mjs';
import manifest from './config/manifest.mjs';

const moduleSetup = {
  id: manifest.id,
  errorPattern: constants.errors.pattern,
};
```

**New Pattern**:

```javascript
import config from './config/config.mjs';

const moduleSetup = {
  id: config.manifest.id,
  errorPattern: config.constants.errors.pattern,
};
```

### Migrating exportConstants from OverMyHead to Config

**Old Pattern**:

```javascript
import OverMyHead from './overMyHead.mjs';

class MyModule extends OverMyHead {
  async init() {
    // exportConstants was called on the OverMyHead instance
    this.exportConstants();
  }
}
```

**New Pattern**:

```javascript
import config from './config/config.mjs';

class MyModule {
  async init() {
    // exportConstants is now called on the config instance
    config.exportConstants();
  }
}
```

### Benefits of Migration

1. **Reduced Imports**: Single import instead of multiple
2. **Consistent Interface**: Same access pattern across all modules
3. **Better Encapsulation**: Configuration management centralized in Config class
4. **Simplified Dependencies**: No need to extend OverMyHead for configuration access
5. **Global Export Centralization**: exportConstants method now logically belongs with configuration
6. **Future-Proof**: Easy to extend without changing imports
7. **Better Encapsulation**: Implementation details are hidden
8. **Simplified Testing**: Mock a single Config class instead of multiple modules

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
// RECOMMENDED: Unified access
import config from './config/config.mjs'; // Central configuration instance

// LEGACY: Direct access (still supported)
import constants from './config/constants.mjs'; // Parsed YAML configuration
import manifest from './config/manifest.mjs'; // Validated manifest object

// Helper classes (advanced usage)
import ConstantsBuilder from './config/helpers/constantsBuilder.mjs';
import ConstantsGetter from './config/helpers/constantsGetter.mjs';
import ConstantsParser from './config/helpers/constantsParser.mjs';
import ManifestParser from './config/helpers/manifestParser.mjs';
```

### Config Instance API

```javascript
const config = {
  constants: Object, // Parsed and frozen constants from YAML
  manifest: Object, // Validated and frozen manifest from module.json
  buildManifestWithShortName: Function, // Returns manifest with shortName added
  exportConstants: Function, // Exports constants to globalThis.OMHconstants
};

// Method usage
const enhancedManifest = config.buildManifestWithShortName();
// Returns: { ...manifest, shortName: string } (frozen object)

config.exportConstants();
// Exports constants to globalThis.OMHconstants for external access
```

### Type Information

```typescript
// TypeScript-style interfaces for reference
interface Config {
  constants: Constants;
  manifest: Manifest;
  buildManifestWithShortName(): ManifestWithShortName;
  exportConstants(): void;
}

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

interface ManifestWithShortName extends Manifest {
  shortName: string; // Derived from constants or manifest properties
}
```

## 📋 Best Practices

### Configuration Access

1. **Use Config Instance**: Always use the config instance for new code - `import config from './config/config.mjs'`
2. **Single Import Pattern**: Use one import for all configuration needs throughout your modules
3. **Consistent Access Pattern**: Use `config.constants.x` and `config.manifest.y` throughout
4. **Avoid Direct Imports**: Avoid importing constants.mjs and manifest.mjs directly in new code
5. **Global Export**: Use `config.exportConstants()` early in module initialization for external access

### Global Constants Export

1. **Early Export**: Call `config.exportConstants()` during module initialization (Hooks.once('init'))
2. **Single Call**: Only call exportConstants once per session - method handles duplicate calls safely
3. **External Access**: Use for making constants available to external modules or debugging
4. **Safe Usage**: Method prevents overwriting existing global constants

### Performance Optimization

1. **Singleton Pattern**: The config instance is created once and reused across the entire module
2. **Cache Frequently Used Values**: Store frequently accessed values in local variables
3. **Avoid Deep Access**: Destructure nested values for repeated use
4. **Monitor Memory**: Be aware that frozen objects persist in memory

### Development Workflow

1. **Test Configuration**: Validate YAML changes with tests before deployment
2. **Version Control**: Track changes to `constants.yaml` carefully
3. **Documentation**: Update documentation when adding new configuration sections
4. **Migration**: Use config instance for all new code, migrate existing code gradually

### Error Handling

1. **Early Initialization**: Import config early to catch configuration errors
2. **Graceful Degradation**: Handle configuration errors appropriately for your use case
3. **Meaningful Messages**: Use the built-in error messages for debugging
4. **Testing**: Test error scenarios with invalid configurations

---

For detailed information about the helper classes and their APIs, see the [Helper Documentation](helpers/README.md).
