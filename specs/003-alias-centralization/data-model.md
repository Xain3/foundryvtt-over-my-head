# Data Model: Alias Configuration Centralization

**Feature**: 003-alias-centralization
**Date**: 2025-10-31
**Status**: Complete

This document defines the core entities, their relationships, validation rules, and state transitions for the alias configuration centralization feature.

---

## Core Entities

### 1. AliasConfiguration

Represents the canonical alias definition from alias.config.mjs.

**Fields**:

| Field         | Type   | Required | Description                            | Validation Rules                                     |
| ------------- | ------ | -------- | -------------------------------------- | ---------------------------------------------------- |
| `find`        | string | Yes      | Alias identifier (e.g., "#", "#tests") | Must start with "#", no spaces, unique within config |
| `replacement` | string | Yes      | Absolute file system path              | Must be absolute path, must exist on file system     |

**Example**:

```javascript
{
  find: "#tests",
  replacement: "/workspaces/foundryvtt-over-my-head/tests"
}
```

**Normalization**:
For interchange between adapters, aliases are normalized to flat object format:

```javascript
{
  "#/": "./src/",
  "#tests/": "./tests/",
  "#mocks/": "./tests/mocks/"
}
```

**Validation Rules**:

- `find` must be unique across all aliases in alias.config.mjs
- `replacement` must resolve to an existing directory
- Neither field can be empty string
- `find` should not end with "/" (trailing slash added by adapters as needed)

---

### 2. ConfigurationFileAdapter

Abstract base class representing the logic for reading/writing aliases in a specific configuration file format.

**Fields**:

| Field       | Type     | Required | Description                                  |
| ----------- | -------- | -------- | -------------------------------------------- |
| `format`    | string   | Yes      | Format identifier (e.g., "jsonc", "json")    |
| `filePaths` | string[] | Yes      | Array of absolute paths this adapter handles |

**Methods**:

| Method                | Parameters          | Returns                      | Description                                                        |
| --------------------- | ------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `read()`              | None                | `Promise<NormalizedAliases>` | Reads aliases from config file, normalizes to interchange format   |
| `write(aliases)`      | `NormalizedAliases` | `Promise<void>`              | Writes normalized aliases to config file in format-specific syntax |
| `validate(expected)`  | `NormalizedAliases` | `Promise<ValidationResult>`  | Compares current aliases to expected, returns validation result    |
| `getFormat()`         | None                | `string`                     | Returns format identifier                                          |
| `getFilePaths()`      | None                | `string[]`                   | Returns file paths this adapter handles                            |
| `canHandle(filePath)` | `string`            | `boolean`                    | Checks if adapter can handle given file path                       |

**Concrete Implementations**:

#### TsConfigAdapter

Handles TypeScript `tsconfig.json` files with JSONC format and `compilerOptions.paths` field.

**Format-specific transformations**:

- **Read**: Converts `"#/*": ["./src/*"]` → `{"#/": "./src/"}`
- **Write**: Converts `{"#/": "./src/"}` → `"#/*": ["./src/*"]`
- **Preserves**: Comments, trailing commas, indentation, EOL style

**File path**: `tsconfig.json` (root of project)

#### PackageJsonAdapter

Handles Node.js `package.json` files with JSON format and `imports` field.

**Format-specific transformations**:

- **Read**: Returns `imports` field directly (already in correct format)
- **Write**: Updates `imports` field with normalized aliases
- **Preserves**: Indentation (auto-detected), EOL style, trailing newline

**File path**: `package.json` (root of project)

---

### 3. ValidationResult

Represents the outcome of comparing current alias configuration against expected configuration.

**Fields**:

| Field   | Type                   | Required    | Description                              |
| ------- | ---------------------- | ----------- | ---------------------------------------- |
| `valid` | boolean                | Yes         | True if current matches expected exactly |
| `diff`  | ValidationDiff \| null | Conditional | Present only if `valid` is false         |

**ValidationDiff Structure**:

| Field        | Type                                      | Description                                    |
| ------------ | ----------------------------------------- | ---------------------------------------------- |
| `current`    | NormalizedAliases                         | Current aliases read from file                 |
| `expected`   | NormalizedAliases                         | Expected aliases from alias.config.mjs         |
| `missing`    | string[]                                  | Alias keys in expected but not in current      |
| `extra`      | string[]                                  | Alias keys in current but not in expected      |
| `mismatched` | Array<{key, currentValue, expectedValue}> | Keys present in both but with different values |

**Example**:

```javascript
{
  valid: false,
  diff: {
    current: { "#/": "./src/", "#tests/": "./tests/" },
    expected: { "#/": "./src/", "#tests/": "./tests/", "#mocks/": "./tests/mocks/" },
    missing: ["#mocks/"],
    extra: [],
    mismatched: []
  }
}
```

---

### 4. AdapterRegistry

Singleton that manages registration and lookup of configuration file adapters.

**Fields**:

| Field            | Type                                  | Description                       |
| ---------------- | ------------------------------------- | --------------------------------- |
| `#adapters`      | Map<string, ConfigurationFileAdapter> | Private map of format → adapter   |
| `#filePathIndex` | Map<string, ConfigurationFileAdapter> | Private map of filePath → adapter |

**Methods**:

| Method                    | Parameters                 | Returns                                 | Description                                                  |
| ------------------------- | -------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| `register(adapter)`       | `ConfigurationFileAdapter` | `void`                                  | Registers adapter, validates interface, checks for conflicts |
| `getByFormat(format)`     | `string`                   | `ConfigurationFileAdapter \| undefined` | Retrieves adapter by format identifier                       |
| `getByFilePath(filePath)` | `string`                   | `ConfigurationFileAdapter \| undefined` | Retrieves adapter by file path                               |
| `getAll()`                | None                       | `ConfigurationFileAdapter[]`            | Returns array of all registered adapters                     |
| `getSupportedFormats()`   | None                       | `string[]`                              | Returns array of all supported format identifiers            |
| `supports(format)`        | `string`                   | `boolean`                               | Checks if format is supported                                |
| `clear()`                 | None                       | `void`                                  | Removes all registered adapters (for testing)                |

**Validation at Registration**:

- Adapter must implement `read()`, `write()`, `getFormat()`, `getFilePaths()`
- Format identifier must be unique (no duplicate formats)
- File paths must be unique (no two adapters claim same file)

---

### 5. SyncOperation

Represents a single execution of the sync script, processing all registered adapters.

**Fields**:

| Field           | Type              | Description                          |
| --------------- | ----------------- | ------------------------------------ |
| `sourceAliases` | NormalizedAliases | Aliases read from alias.config.mjs   |
| `options`       | SyncOptions       | Configuration for sync execution     |
| `results`       | SyncResult[]      | Results from processing each adapter |

**SyncOptions Structure**:

| Field     | Type    | Default | Description                                    |
| --------- | ------- | ------- | ---------------------------------------------- |
| `dryRun`  | boolean | false   | If true, preview changes without writing files |
| `verbose` | boolean | false   | If true, output detailed debug information     |

**SyncResult Structure**:

| Field     | Type                | Description                                      |
| --------- | ------------------- | ------------------------------------------------ |
| `format`  | string              | Format identifier of the adapter                 |
| `status`  | enum                | One of: "ok", "updated", "would-update", "error" |
| `changed` | boolean             | True if file was modified (false in dry-run)     |
| `error`   | string \| undefined | Error message if status is "error"               |

**Example**:

```javascript
{
  sourceAliases: { "#/": "./src/", "#tests/": "./tests/" },
  options: { dryRun: false, verbose: true },
  results: [
    { format: "jsonc", status: "updated", changed: true },
    { format: "json", status: "ok", changed: false }
  ]
}
```

---

### 6. NormalizedAliases (Type)

Interchange format for aliases used between adapters and sync/validation logic.

**Structure**: Plain JavaScript object mapping alias keys to target paths.

**Type Definition**:

```typescript
type NormalizedAliases = {
  [aliasKey: string]: string; // e.g., { "#/": "./src/" }
};
```

**Constraints**:

- Keys should be alias identifiers (e.g., "#/", "#tests/")
- Values should be relative paths from project root
- Keys should end with "/" for consistency in path resolution
- Values should start with "./" for relative paths or "/" for absolute

**Normalization from alias.config.mjs**:

```javascript
// Input: alias.config.mjs
[
  { find: "#", replacement: "/abs/path/to/src" },
  { find: "#tests", replacement: "/abs/path/to/tests" }
]

// Output: NormalizedAliases
{
  "#/": "./src/",
  "#tests/": "./tests/"
}
```

---

## Entity Relationships

```
┌─────────────────────────────────┐
│   AliasConfiguration            │
│   (alias.config.mjs)            │
│   - Source of truth             │
└──────────────┬──────────────────┘
               │ normalized to
               ▼
        NormalizedAliases
        (interchange format)
               │
               │ processed by
               ▼
┌──────────────────────────────────┐
│      SyncOperation               │
│  - Reads source aliases          │
│  - Processes adapters            │
│  - Generates results             │
└─────────┬────────────────────────┘
          │ uses
          ▼
┌──────────────────────────────────┐
│      AdapterRegistry             │
│  - Manages adapters              │
│  - Provides lookup               │
└─────────┬────────────────────────┘
          │ contains
          ▼
┌──────────────────────────────────┐
│  ConfigurationFileAdapter (base) │
│  - Abstract interface            │
│  - read/write/validate methods   │
└─────────┬────────────────────────┘
          │ implemented by
          ├──────────────────┬──────────────────┐
          ▼                  ▼                  ▼
┌─────────────────┐  ┌────────────────┐  ┌─────────────────┐
│ TsConfigAdapter │  │ PackageJson    │  │ Future adapters │
│ (tsconfig.json) │  │ Adapter        │  │ (vite, etc.)    │
│                 │  │ (package.json) │  │                 │
└─────────┬───────┘  └────────┬───────┘  └─────────┬───────┘
          │                   │                     │
          │ produces          │                     │
          ▼                   ▼                     ▼
    ┌───────────────────────────────────────────────┐
    │          ValidationResult                     │
    │  - Indicates if config matches                │
    │  - Provides diff if mismatched                │
    └───────────────────────────────────────────────┘
```

---

## State Transitions

### Adapter Registration Lifecycle

```
┌─────────────┐
│ Unregistered│
└──────┬──────┘
       │ adapter created
       ▼
┌─────────────┐
│ Instantiated│
└──────┬──────┘
       │ registry.register(adapter)
       ▼
┌─────────────┐     validate interface
│  Validating ├──────────────┐
└──────┬──────┘              │
       │ validation passes   │ validation fails
       ▼                     ▼
┌─────────────┐       ┌──────────┐
│  Registered │       │  Error   │ → throws exception
└──────┬──────┘       └──────────┘
       │
       │ registry.clear()
       ▼
┌─────────────┐
│ Unregistered│
└─────────────┘
```

### Sync Operation State Flow

```
┌──────────────┐
│    Start     │
└──────┬───────┘
       │ load source aliases
       ▼
┌──────────────┐
│ Reading      │
└──────┬───────┘
       │ success
       ▼
┌──────────────┐
│ Processing   │ ──for each adapter──┐
└──────┬───────┘                     │
       │                             │
       │ all adapters processed      │
       ▼                             ▼
┌──────────────┐            ┌─────────────────┐
│ Summarizing  │            │  Adapter Cycle  │
└──────┬───────┘            │  - validate     │
       │ generate summary   │  - update/skip  │
       ▼                    │  - record result│
┌──────────────┐            └────────┬────────┘
│   Complete   │                     │
└──────────────┘         ┌───────────┴─────────────┐
                         │                         │
                    ┌────▼─────┐            ┌──────▼─────┐
                    │  Success │            │   Error    │
                    │  (ok or  │            │ (adapter   │
                    │  updated)│            │  failed)   │
                    └──────────┘            └────────────┘
                                                   │
                                                   │ continues with
                                                   │ next adapter
                                                   └──────────────┐
                                                                  │
                                           (error recorded but    │
                                            doesn't halt sync)    │
                                                                  │
                                            ◄─────────────────────┘
```

### Validation State Transitions

```
┌──────────────┐
│   Pending    │
└──────┬───────┘
       │ adapter.validate(expected)
       ▼
┌──────────────┐
│  Validating  │
└──────┬───────┘
       │
       ├────────────────┬────────────────┐
       │                │                │
       ▼                ▼                ▼
┌──────────┐     ┌──────────┐    ┌──────────┐
│  Valid   │     │ Invalid  │    │  Error   │
│ (matches)│     │(mismatch)│    │(read fail)│
└──────────┘     └────┬─────┘    └────┬─────┘
                      │               │
                      │ generate diff │ throw exception
                      ▼               ▼
              ┌────────────────┐  ┌──────────┐
              │ ValidationResult│  │ Failure  │
              │ with diff       │  └──────────┘
              └────────────────┘
```

---

## Validation Rules Summary

### AliasConfiguration Validation

- ✅ `find` must be non-empty string starting with "#"
- ✅ `replacement` must be non-empty absolute path
- ✅ `find` must be unique within alias.config.mjs
- ✅ `replacement` should exist as directory (warning if not)

### Adapter Interface Validation

- ✅ Must implement `read()` method returning Promise
- ✅ Must implement `write(aliases)` method returning Promise
- ✅ Must implement `getFormat()` method returning string
- ✅ Must implement `getFilePaths()` method returning string[]
- ✅ Format identifier must be unique in registry
- ✅ File paths must be unique in registry (no overlap)

### Synchronization Validation

- ✅ Source aliases must be successfully normalized
- ✅ Each adapter must complete read operation
- ✅ Write operations only occur if validation fails (change detected)
- ✅ Errors in one adapter don't halt processing of others
- ✅ Final exit code non-zero if any adapter encountered error

### File Format Preservation Validation

- ✅ Comments in JSONC files must be preserved
- ✅ Indentation style (spaces vs tabs) must be preserved
- ✅ Indentation size must match original
- ✅ EOL style (LF vs CRLF) must be preserved
- ✅ Trailing newline presence must match original
- ✅ Only alias-related sections should be modified

---

## Extension Points

The data model supports extensibility through:

1. **New Adapter Types**: Create class extending `ConfigurationFileAdapter`, implement interface methods
2. **Custom Normalization**: Override `read()` to handle format-specific syntax
3. **Custom Validation**: Override `validate()` for format-specific validation rules
4. **Registry Hooks**: Future: Add pre/post-registration hooks for logging or validation

**Adding a new adapter requires**:

- Implementing all interface methods from `ConfigurationFileAdapter`
- Registering with `adapterRegistry.register(new MyAdapter())`
- Adding unit tests for the adapter
- Updating validation tests to include the new file type

---

**Data Model Status**: ✅ Complete
**Ready for contracts generation**: Yes
