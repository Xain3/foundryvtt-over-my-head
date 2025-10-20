**Version**: 0.1.0

# Constants Helpers

This directory contains helper classes and utilities that support the constants management system.
These helpers provide specialized functionality for retrieving, parsing, and building constants from YAML and
other configuration files.

## Overview

The constants helpers are organized into:

- **Placeholder for future sections**

## Placeholder section details...

### Helper 1

**File**: helper1.ts
**Dependencies**: `DependencyHelper`, `DependOnHelper`
**Exports**: `HelperOne` (class)

The main entry point for constants management. Provides both raw YAML string and parsed object representations of the
constants, with efficient caching for repeated access.

#### HelperOne API

```typescript
class HelperOne {
  // Constructor
  constructor();

  // Properties (getters)
  get propertyOne(): string; // Example property

  // Methods
  methodOne(): void; // Example method
}
```

#### HelperOne Usage

```javascript
import HelperOne from './helpers/helper1.ts';

const constants = new HelperOne();

// Access properties
const propertyOne = constants.propertyOne;
console.log(propertyOne); // Example property value

// Call methods
constants.methodOne();
```

#### Internal Behavior

- Description of how the helper works internally

## File Management

### ConstantsGetter

**File**: constantsGetter.mjs
**Dependencies**: `fs`, `path`
**Exports**: `ConstantsGetter` (class)

Static utility class for reading constants from YAML files with configurable file names, encoding, and error handling.

#### ConstantsGetter API

```javascript
// Static Methods
ConstantsGetter.getConstantsYaml(constantsFileName, encoding);
// Parameters:
// - constantsFileName: string (optional) - The YAML file name (default: 'constants.yaml')
// - encoding: string (optional) - File encoding (default: 'utf8')
// Returns: string - The content of the YAML file
// Throws: Error if file cannot be read
```

#### ConstantsGetter Usage

```javascript
import ConstantsGetter from './helpers/constantsGetter.mjs';

// Read default constants.yaml file with default encoding
const defaultConstants = ConstantsGetter.getConstantsYaml();

// Read custom YAML file
const customConstants = ConstantsGetter.getConstantsYaml('custom-config.yaml');

// Read with custom encoding
const asciiConstants = ConstantsGetter.getConstantsYaml(
  'constants.yaml',
  'ascii'
);

// Read custom file with custom encoding
const customFile = ConstantsGetter.getConstantsYaml('config.yaml', 'utf16le');
```

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

````

## Changelog

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial constants helpers documentation

```

## Changelog

### [0.1.0] - 2025-10-20
- Initial release of constants helpers system
- Added helper classes for YAML parsing, file reading, and constants management
- Implemented comprehensive testing and error handling patterns
```
````
