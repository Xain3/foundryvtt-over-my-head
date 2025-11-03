# Config Helpers

**Status**: ✅ Complete
**Path**: `src/config/helpers/`
**Main File**: `configHelpers.ts`

## Overview

Helper functions for loading, parsing, and merging configuration data from various sources. These pure functions (with I/O) handle file loading and parsing, which are called by the Config singleton during initialization.

## Architecture

```
src/config/helpers/
├── configHelpers.ts      # All helper functions (main entry)
├── README.md              # This file
└── *.unit.test.mjs        # Unit tests for helpers
```

## Helper Functions

All helpers are exported from `configHelpers.ts` and can be imported individually for testing.

### loadYamlFiles()

**Purpose**: Load and parse all YAML constant files from `src/config/constants/`

**Signature**:

```typescript
function loadYamlFiles(files?: string[]): Record<string, unknown>;
```

**Behavior**:

- Discovers and loads constant YAML files: errors, foundry, hooks
- Each file is parsed and stored under its name as a key (without .yaml extension)
- Empty YAML files return empty objects `{}`
- Fails fast on any parse error with file path and context

**Returns**: Object with namespace-keyed YAML data

```typescript
{
  errors: { separator: " || ", ... },
  foundry: { defaults: { ... } },
  hooks: { ... },
}
```

**Throws**: Error with file path if YAML parsing fails

**Example**:

```typescript
import { loadYamlFiles } from './configHelpers.ts';

const constantsData = loadYamlFiles();
console.log(constantsData.errors.separator); // " || "
```

### loadConfigFiles()

**Purpose**: Load and parse all YAML config files from `src/config/configs/`

**Signature**:

```typescript
function loadConfigFiles(files?: string[]): Record<string, unknown>;
```

**Behavior**:

- Discovers and loads config YAML files: logging, moduleManagement, occlusion, placeables
- Each file is parsed and stored under its name as a key (without .yaml extension)
- Empty YAML files return empty objects `{}`
- Fails fast on any parse error with file path and context

**Returns**: Object with namespace-keyed YAML data

```typescript
{
  logging: { console: { ... }, file: { ... } },
  moduleManagement: { shortName: "OMH", ... },
  occlusion: { ... },
  placeables: { ... },
}
```

**Throws**: Error with file path if YAML parsing fails

**Example**:

```typescript
import { loadConfigFiles } from './configHelpers.ts';

const configsData = loadConfigFiles();
console.log(configsData.logging.console.defaultLevel); // "info"
```

### mergeConstants()

**Purpose**: Merge namespace-keyed YAML files into config constants structure

**Signature**:

```typescript
function mergeConstants(
  yamlFiles: Record<string, unknown>
): Record<string, unknown>;
```

**Behavior**:

- Takes YAML data with namespace keys (from loadYamlFiles)
- Validates each namespace is an object or null
- Returns merged structure (namespace-keyed, no deep merge)
- Converts null values to empty objects `{}`

**Returns**: Merged constants object (same as input, but validated)

**Throws**: Error if any namespace is not an object

**Example**:

```typescript
import { loadYamlFiles, mergeConstants } from './configHelpers.ts';

const yamlData = loadYamlFiles();
const merged = mergeConstants(yamlData);
// Returns same structure, validated
```

### extractConfigPrefix()

**Purpose**: Extract configuration prefix from module manifest

**Signature**:

```typescript
function extractConfigPrefix(manifest: unknown): string;
```

**Behavior**:

- Reads `shortName` field from manifest (typically from module.json)
- Converts to uppercase
- Falls back to `"OMH"` if not found, with warning message
- Used for logging prefix and environment variable prefix

**Returns**: Prefix string in SCREAMING_SNAKE_CASE (e.g., "OMH")

**Throws**: Error if manifest is not an object

**Example**:

```typescript
import { extractConfigPrefix } from './configHelpers.ts';

const manifest = { shortName: "OMH", ... };
const prefix = extractConfigPrefix(manifest);
console.log(prefix); // "OMH"
```

### loadSettings()

**Purpose**: Load and parse settings definitions from `src/config/settings/settings.yaml`

**Signature**:

```typescript
function loadSettings(): unknown;
```

**Behavior**:

- Reads settings.yaml from `src/config/settings/`
- Parses YAML (typically returns array of setting definitions)
- Empty file returns empty array `[]`
- Fails fast on any parse error

**Returns**: Parsed settings data (typically an array, but type is flexible)

**Throws**: Error with file path if file cannot be read or YAML parsing fails

**Example**:

```typescript
import { loadSettings } from './configHelpers.ts';

const settings = loadSettings();
console.log(Array.isArray(settings) ? settings.length : 0); // Number of settings
```

### loadModuleManifest()

**Purpose**: Load and parse module manifest from `module.json`

**Signature**:

```typescript
function loadModuleManifest(): Record<string, unknown>;
```

**Behavior**:

- Reads module.json from project root
- Parses JSON (must be valid object)
- Fails fast if JSON is invalid or file missing

**Returns**: Parsed module manifest object

**Throws**: Error with file path if file cannot be read or JSON parsing fails

**Example**:

```typescript
import { loadModuleManifest } from './configHelpers.ts';

const manifest = loadModuleManifest();
console.log(manifest.id); // "vision-with-fade"
console.log(manifest.version); // "12.1.0"
```

### loadEnvironmentVariables()

**Purpose**: Load environment variables matching module prefix pattern

**Signature**:

```typescript
function loadEnvironmentVariables(prefix: string): Record<string, string>;
```

**Behavior**:

- Reads `process.env` (Node.js environment variables)
- Filters for variables matching `PREFIX_*` pattern
- Case-insensitive prefix matching (OMH*, Omh*, omh\* all match)
- Returns variables with original keys (including prefix)
- All values are strings (native process.env behavior)

**Parameters**:

- `prefix`: Module prefix in SCREAMING_SNAKE_CASE (e.g., "OMH")

**Returns**: Object with matching environment variables as strings

```typescript
{
  OMH_DEBUG_MODE: "true",
  OMH_BEHAVIOR_TOKENS: "onlyActive"
}
```

**Throws**: Error if prefix is not a valid string

**Example**:

```typescript
import { loadEnvironmentVariables } from './configHelpers.ts';

// With process.env.OMH_DEBUG_MODE = "true"
const env = loadEnvironmentVariables('OMH');
console.log(env.OMH_DEBUG_MODE); // "true"
```

## Design Principles

### 1. Pure Functions (with I/O)

- Each helper is stateless and deterministic
- Helpers don't mutate global state (except logging)
- I/O operations (file reading, env var access) are isolated

### 2. Fail-Fast Error Handling

- Errors throw immediately with full context
- No graceful degradation or defaults
- Error messages include file paths and line numbers

### 3. Namespace Preservation

- YAML files loaded with separate namespaces
- No cross-file collisions or deep merging
- Each file maintains its own namespace key

### 4. String Values from Environment

- Environment variables always returned as strings
- No implicit type coercion
- Caller responsible for type conversion

### 5. Immutability

- Helpers return new objects (no mutations)
- Config object frozen after helper calls
- Prevents accidental modifications

## Error Handling Pattern

All helpers follow consistent error handling:

```typescript
try {
  // Load and parse file
  const content = readFileSync(filePath, 'utf-8');
  const parsed = parseYaml(content);
  return parsed;
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  throw new Error(
    `Failed to load [resource] from ${filePath}: ${errorMessage}`
  );
}
```

## Testing

Helpers are tested with:

- **Unit tests** in `tests/unit/configHelpers.unit.test.mjs`
- **Integration tests** in `tests/integration/config.int.test.mjs` (with real files)
- **Fixtures** in `tests/unit/fixtures/` (valid/invalid test data)

Run tests:

```bash
npm test  # Run all tests
```

## Usage in Config Class

The Config singleton calls these helpers during initialization:

```typescript
class Config {
  constructor() {
    // 1. Load module manifest (need prefix early)
    this.#module = loadModuleManifest();
    this.#prefix = extractConfigPrefix(this.#module);

    // 2. Load YAML constants
    const yamlFiles = loadYamlFiles();
    this.#yamlConstants = mergeConstants(yamlFiles);

    // 3. Load settings
    this.#settings = loadSettings();

    // 4. Load environment variables
    this.#env = loadEnvironmentVariables(this.#prefix);

    // 5. Deep freeze to prevent modifications
    this._deepFreeze(this);
  }
}
```

## Performance

- **First call**: Performs actual file I/O (~50-200ms total)
- **Subsequent calls**: Only called once during Config initialization
- **Cached**: Results stored in Config singleton for instant access

## Related Documentation

- [Config Module](../README.md) - Main config documentation
- [Data Model](../../001-centralized-config-system/data-model.md) - Entity structure
- [Constants](../constants/README.md) - YAML files documentation
- [Settings](../settings/README.md) - Settings definitions

---

**Status**: Complete ✅
**Last Updated**: October 28, 2025

#### Features

- **Default File**: Reads `constants.yaml` from project root by default
- **Custom Files**: Accepts custom file names for alternative configurations
- **Custom Encoding**: Supports configurable file encoding (default: UTF-8)
- **Path Resolution**: Uses `process.cwd()` as base directory
- **Error Handling**: Logs errors and re-throws them for upstream handling

#### Error Handling

```javascript
try {
  const constants = ConstantsGetter.getConstantsYaml('missing-file.yaml');
} catch (error) {
  console.error('Failed to read constants:', error.message);
  // Handle error appropriately
}
```

## Parsing & Processing

### ConstantsParser

**File**: constantsParser.mjs
**Dependencies**: `js-yaml`, `lodash`, `PathUtils`
**Exports**: `ConstantsParser` (class)

Advanced YAML parsing with support for context root map creation and dynamic path resolution.

#### ConstantsParser API

```javascript
// Static Methods
ConstantsParser.parseConstants(
  constants,
  globalNamespace,
  parseContextRootMap,
  module
);
ConstantsParser.createRootMapFromYaml(config, globalNamespace, module);

// Parameters:
// - constants: string - YAML string to parse
// - globalNamespace: Object - Global namespace for path resolution (default: globalThis)
// - parseContextRootMap: boolean - Whether to process context.rootMap (default: true)
// - module: Object - Module object for root map creation (default: null)
```

#### ConstantsParser Usage

```javascript
import ConstantsParser from './helpers/constantsParser.mjs';

// Basic parsing
const yamlString = 'testConstant: testValue\ncontext:\n  schema: test';
const parsed = ConstantsParser.parseConstants(yamlString);
console.log(parsed.testConstant); // 'testValue'

// Advanced parsing with root map processing
const parsedWithRootMap = ConstantsParser.parseConstants(
  yamlString,
  globalThis,
  true,
  moduleInstance
);

// Manual root map creation
const rootMapConfig = {
  rootMap: {
    game: 'game',
    module: 'module',
    window: 'globalNamespace.window',
  },
};
const rootMapFn = ConstantsParser.createRootMapFromYaml(rootMapConfig);
const rootMap = rootMapFn(globalThis, moduleInstance);
```

#### Root Map Processing

The parser can automatically process `context.remote.rootMap` configurations to create dynamic root map functions:

**YAML Configuration:**

```yaml
context:
  remote:
    rootMap:
      rootMap:
        game: 'globalNamespace.game'
        module: 'module'
        storage: 'globalNamespace.localStorage'
        invalid: null
```

**Generated Function:**

```javascript
// The parser creates a function that returns:
{
  game: globalThis.game,           // Resolved from path
  module: moduleInstance,          // Direct module reference
  storage: globalThis.localStorage, // Resolved from path
  invalid: null                    // Null value preserved
}
```

#### Path Resolution

The parser uses `PathUtils.resolvePath()` to dynamically resolve object paths:

- **Regular Paths**: `"globalNamespace.game.user"` → `globalThis.game.user`
- **Module Keyword**: `"module"` → Direct module reference
- **Null Values**: `null` → Preserved as null
- **Invalid Paths**: Missing objects return `undefined`

#### ConstantsParser Error Handling

```javascript
try {
  const parsed = ConstantsParser.parseConstants(invalidYaml);
} catch (error) {
  console.error('Parsing failed:', error.message);
  // Error logged and re-thrown as generic "Failed to parse constants"
}
```

#### Input Validation

- **Type Checking**: Validates that `constants` is a string
- **Boolean Validation**: Ensures `parseContextRootMap` is boolean
- **Error Messages**: Provides clear TypeError messages for invalid inputs

## Constants Structure

The helpers work with a YAML structure defined in `constants.yaml` at the project root. Key sections include:

### Section 1: This is an example section

```yaml
exampleSection:
  exampleproperty: 'exampleValue'
```

## Testing

Each helper class includes comprehensive unit tests with the following patterns:

### Test Structure

- **File Naming**: `*.unit.test.mjs` for unit tests
- **Mocking**: External dependencies are mocked using Vitest's `vi.mock()`
- **Coverage**: Tests cover success cases, error cases, and edge cases

### Running Tests

```bash
# Run all constants helper tests
npm test constants/helpers

# Run specific test file
npm test -- --testPathPattern="specificTest.unit.test.mjs"
```

## Dependencies Graph

```text
ExampleBuilder
├── ExampleGetter
│   ├── fs (Node.js)
│   └── path (Node.js)
└── ExampleParser
  ├── js-yaml (external)
  ├── lodash (external)
  └── PathUtils (../../helpers)

ExampleParser
└── constants.mjs (../constants.mts)
```

## Usage Patterns

### Basic Constants Access

### Custom Configuration Files

### Advanced Root Map Usage

## Performance Considerations

- **Caching**: `ConstantsBuilder` caches both string and object representations
- **Lazy Loading**: Constants are only loaded when `ConstantsBuilder` is instantiated
- **Memory Efficiency**: Deep cloning is handled by the YAML parser
- **File I/O**: File reading occurs once during construction, not on each access
- **Encoding Flexibility**: Support for different file encodings without performance penalty

## Error Handling Strategy

All helpers follow a consistent error handling approach:

1. **Validation**: Input parameters are validated with descriptive error messages
2. **Logging**: Errors are logged to console for debugging
3. **Re-throwing**: Original errors are preserved and re-thrown for upstream handling
4. **Type Safety**: TypeError is thrown for invalid input types
5. **File System**: Clear error messages for file reading failures

## Future Enhancements

- **Configuration Validation**: Schema validation for YAML structure
- **Hot Reloading**: Dynamic configuration updates during development
- **Environment Overrides**: Environment-specific configuration merging
- **Caching Strategies**: More sophisticated caching with invalidation
- **Performance Monitoring**: Metrics for parsing and access times
- **Encoding Detection**: Automatic encoding detection for files

All helpers follow the established coding conventions with ES6 syntax, proper error handling, and comprehensive JSDoc documentation.

## Changelog

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial constants helpers documentation
