# Adapter Interface Contract

**Feature**: 003-alias-centralization
**Date**: 2025-10-31
**Version**: 1.0.0

This document defines the contract (interface) that all configuration file adapters must implement to participate in the alias synchronization system.

---

## Overview

The adapter interface provides a standardized way to read, write, and validate alias configurations across different file formats (JSON, JSONC, JavaScript modules, etc.). Each adapter encapsulates format-specific logic while presenting a uniform API to the sync and validation systems.

---

## Base Interface

All adapters must extend the `BaseConfigAdapter` class (or implement equivalent interface) and provide implementations for the following methods:

### Required Methods

#### `getFormat(): string`

Returns a unique identifier for the file format this adapter handles.

**Returns**: String identifier (e.g., "jsonc", "json", "javascript")

**Contract**:

- Must return a non-empty string
- Must be unique across all registered adapters
- Should be lowercase, kebab-case if multi-word (e.g., "vite-config")
- Should be consistent across invocations (pure function)

**Example**:

```javascript
getFormat() {
  return "jsonc";
}
```

---

#### `getFilePaths(): string[]`

Returns an array of absolute file paths this adapter is responsible for.

**Returns**: Array of absolute path strings

**Contract**:

- Must return an array (can be empty if adapter is generic)
- Paths must be absolute (not relative)
- Paths should use forward slashes (even on Windows)
- Each path must be unique within the adapter
- Paths must not overlap with other registered adapters

**Example**:

```javascript
getFilePaths() {
  return ['/workspaces/project/tsconfig.json'];
}
```

---

#### `async read(): Promise<NormalizedAliases>`

Reads alias configuration from the file and returns it in normalized interchange format.

**Returns**: Promise resolving to NormalizedAliases object

**NormalizedAliases Format**:

```javascript
{
  "#/": "./src/",           // alias key -> relative path
  "#tests/": "./tests/",
  "#mocks/": "./tests/mocks/"
}
```

**Contract**:

- Must read file synchronously or asynchronously (use async/await)
- Must parse file contents according to format (JSON, JSONC, JavaScript, etc.)
- Must extract alias-related configuration from file structure
- Must convert format-specific alias syntax to normalized format
- Must throw descriptive error if file doesn't exist or is malformed
- Error messages must include file path and reason for failure

**Normalization Rules**:

- Keys should end with "/" for consistency
- Values should be relative paths starting with "./"
- Absolute paths should be converted to relative (from project root)
- Remove format-specific syntax (wildcards, arrays, etc.)

**Example**:

```javascript
async read() {
  const content = await fs.readFile(this.#filePath, 'utf-8');
  const parsed = parseJsonc(content);

  // TypeScript format: "#/*": ["./src/*"]
  // Normalized format: "#/": "./src/"
  const paths = parsed.compilerOptions?.paths || {};
  const normalized = {};

  for (const [alias, targets] of Object.entries(paths)) {
    const key = alias.replace(/\/\*$/, '/');
    const value = targets[0]?.replace(/\/\*$/, '/');
    if (value) normalized[key] = value;
  }

  return normalized;
}
```

---

#### `async write(aliases: NormalizedAliases): Promise<void>`

Writes normalized aliases to the configuration file in format-specific syntax.

**Parameters**:

- `aliases` - NormalizedAliases object in interchange format

**Returns**: Promise resolving to void

**Contract**:

- Must read current file contents
- Must convert normalized aliases to format-specific syntax
- Must update only the alias-related section of the file
- Must preserve existing formatting (comments, indentation, EOL)
- Must write updated contents back to file
- Must throw descriptive error if write fails
- Must be atomic (don't leave file in partial state on error)

**Preservation Requirements**:

- Comments must be preserved (for JSONC files)
- Indentation style (spaces vs tabs) must be preserved
- Indentation size must be preserved
- EOL style (LF vs CRLF) must be preserved
- Trailing newline presence must be preserved
- Other fields in file must not be modified

**Example**:

```javascript
async write(aliases) {
  const content = await fs.readFile(this.#filePath, 'utf-8');
  const parsed = parseJsonc(content);

  // Convert normalized format to TypeScript format
  const paths = {};
  for (const [alias, target] of Object.entries(aliases)) {
    paths[`${alias}*`] = [`${target}*`];
  }

  // Update only compilerOptions.paths
  if (!parsed.compilerOptions) parsed.compilerOptions = {};
  parsed.compilerOptions.paths = paths;

  // Preserve formatting
  const updated = stringifyJsonc(content, parsed);
  await fs.writeFile(this.#filePath, updated, 'utf-8');
}
```

---

#### `async validate(expected: NormalizedAliases): Promise<ValidationResult>`

Compares current alias configuration to expected configuration and returns validation result.

**Parameters**:

- `expected` - NormalizedAliases object representing expected state

**Returns**: Promise resolving to ValidationResult

**ValidationResult Structure**:

```javascript
{
  valid: boolean,           // true if current matches expected
  diff: {                   // present only if valid is false
    current: {...},         // current aliases from file
    expected: {...},        // expected aliases (parameter)
    missing: [...],         // keys in expected but not current
    extra: [...],           // keys in current but not expected
    mismatched: [...]       // keys with different values
  } | null
}
```

**Contract**:

- Must call `read()` to get current aliases
- Must compare current to expected using deep equality
- Must return `{ valid: true, diff: null }` if they match
- Must return detailed diff if they don't match
- Must handle read errors gracefully (treat as validation failure)

**Default Implementation**:

The base class provides a default implementation that:

1. Calls `this.read()` to get current state
2. Compares with expected using JSON.stringify equality
3. Generates diff showing missing, extra, and mismatched keys

Adapters can override if custom validation logic is needed.

---

#### `canHandle(filePath: string): boolean`

Checks if this adapter can handle the given file path.

**Parameters**:

- `filePath` - Absolute path to check

**Returns**: Boolean indicating if adapter handles this path

**Contract**:

- Must return true if `filePath` is in `getFilePaths()` array
- Must return false otherwise
- Should be a pure function (no side effects)

**Default Implementation**:

```javascript
canHandle(filePath) {
  return this.getFilePaths().includes(filePath);
}
```

Most adapters can use the default implementation.

---

## Type Definitions

### NormalizedAliases

Interchange format for aliases.

**TypeScript Definition**:

```typescript
type NormalizedAliases = {
  [aliasKey: string]: string;
};
```

**Example**:

```javascript
{
  "#/": "./src/",
  "#tests/": "./tests/",
  "#mocks/": "./tests/mocks/"
}
```

**Constraints**:

- Keys should end with "/" for path consistency
- Values should be relative paths starting with "./"
- Keys must be unique within the object

---

### ValidationResult

Result of validation operation.

**TypeScript Definition**:

```typescript
type ValidationResult = {
  valid: boolean;
  diff: ValidationDiff | null;
};

type ValidationDiff = {
  current: NormalizedAliases;
  expected: NormalizedAliases;
  missing: string[];
  extra: string[];
  mismatched: Array<{
    key: string;
    currentValue: string;
    expectedValue: string;
  }>;
};
```

---

## Implementation Example

Here's a complete example of implementing an adapter for a hypothetical webpack configuration:

```javascript
/**
 * @file WebpackAdapter.mjs
 * @description Adapter for webpack.config.js resolve.alias configuration
 * @path src/utils/alias-adapters/WebpackAdapter.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { BaseConfigAdapter } from './BaseConfigAdapter.mjs';

export class WebpackAdapter extends BaseConfigAdapter {
  #filePath;
  #projectRoot;

  constructor(projectRoot = process.cwd()) {
    super();
    this.#projectRoot = projectRoot;
    this.#filePath = path.join(projectRoot, 'webpack.config.js');
  }

  getFormat() {
    return 'webpack';
  }

  getFilePaths() {
    return [this.#filePath];
  }

  async read() {
    // Read webpack config (JavaScript module)
    const content = await fs.readFile(this.#filePath, 'utf-8');

    // Parse JavaScript (simplified - use proper parser in production)
    // Look for resolve.alias object
    const aliasMatch = content.match(
      /resolve:\s*{[\s\S]*?alias:\s*({[\s\S]*?})/
    );
    if (!aliasMatch) {
      return {}; // No aliases defined
    }

    // Extract and evaluate alias object (use proper parser in production)
    const aliasText = aliasMatch[1];
    const aliases = eval(`(${aliasText})`); // DANGER: Use proper parser

    // Normalize: webpack uses "#": "/abs/path/to/src"
    const normalized = {};
    for (const [alias, target] of Object.entries(aliases)) {
      // Convert absolute to relative
      const relative = path.relative(this.#projectRoot, target);
      normalized[`${alias}/`] = `./${relative}/`;
    }

    return normalized;
  }

  async write(aliases) {
    const content = await fs.readFile(this.#filePath, 'utf-8');

    // Convert normalized to webpack format
    const webpackAliases = {};
    for (const [alias, target] of Object.entries(aliases)) {
      const cleanAlias = alias.replace(/\/$/, '');
      const absTarget = path.resolve(this.#projectRoot, target);
      webpackAliases[cleanAlias] = absTarget;
    }

    // Generate alias object code
    const aliasCode = JSON.stringify(webpackAliases, null, 2).replace(
      /"([^"]+)":/g,
      '$1:'
    ); // Remove quotes from keys

    // Replace in content (simplified - use AST manipulation in production)
    const updated = content.replace(
      /alias:\s*{[\s\S]*?}/,
      `alias: ${aliasCode}`
    );

    await fs.writeFile(this.#filePath, updated, 'utf-8');
  }
}
```

---

## Registration

Once an adapter is implemented, register it with the adapter registry:

```javascript
import { adapterRegistry } from './AdapterRegistry.mjs';
import { WebpackAdapter } from './WebpackAdapter.mjs';

// Register adapter
adapterRegistry.register(new WebpackAdapter());

// Verify registration
console.log('Supported formats:', adapterRegistry.getSupportedFormats());
// Output: ['jsonc', 'json', 'webpack']
```

---

## Testing Guidelines

Each adapter should have comprehensive unit tests covering:

### Required Test Cases

1. **Format identifier**: Verify `getFormat()` returns expected string
2. **File paths**: Verify `getFilePaths()` returns expected array
3. **Read normalization**: Test reading various alias configurations and normalizing correctly
4. **Write conversion**: Test writing normalized aliases and verifying format-specific syntax
5. **Format preservation**: Test that comments, indentation, EOL are preserved
6. **Validation**: Test validation with matching and mismatched configurations
7. **Error handling**: Test behavior when file is missing, malformed, or unwritable
8. **Edge cases**: Empty aliases, single alias, many aliases, special characters in paths

### Test Pattern

```javascript
/**
 * @file WebpackAdapter.unit.test.mjs
 * @description Unit tests for WebpackAdapter
 * @path tests/unit/adapters/WebpackAdapter.unit.test.mjs
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebpackAdapter } from '#/utils/alias-adapters/WebpackAdapter.mjs';
import fs from 'fs/promises';
import { vi } from 'vitest';

describe('WebpackAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new WebpackAdapter('/test/project');
    vi.spyOn(fs, 'readFile');
    vi.spyOn(fs, 'writeFile');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getFormat()', () => {
    it('returns "webpack"', () => {
      expect(adapter.getFormat()).toBe('webpack');
    });
  });

  describe('getFilePaths()', () => {
    it('returns array with webpack.config.js path', () => {
      const paths = adapter.getFilePaths();
      expect(paths).toHaveLength(1);
      expect(paths[0]).toMatch(/webpack\.config\.js$/);
    });
  });

  describe('read()', () => {
    it('normalizes webpack alias format', async () => {
      const mockContent = `
        module.exports = {
          resolve: {
            alias: {
              "#": "/test/project/src",
              "#tests": "/test/project/tests"
            }
          }
        };
      `;
      fs.readFile.mockResolvedValue(mockContent);

      const result = await adapter.read();

      expect(result).toEqual({
        '#/': './src/',
        '#tests/': './tests/',
      });
    });

    it('returns empty object if no aliases defined', async () => {
      const mockContent = `module.exports = {};`;
      fs.readFile.mockResolvedValue(mockContent);

      const result = await adapter.read();

      expect(result).toEqual({});
    });

    it('throws error if file cannot be read', async () => {
      fs.readFile.mockRejectedValue(new Error('ENOENT'));

      await expect(adapter.read()).rejects.toThrow();
    });
  });

  describe('write()', () => {
    it('converts normalized format to webpack format', async () => {
      const mockContent = `
        module.exports = {
          resolve: {
            alias: {}
          }
        };
      `;
      fs.readFile.mockResolvedValue(mockContent);

      const aliases = {
        '#/': './src/',
        '#tests/': './tests/',
      };

      await adapter.write(aliases);

      const written = fs.writeFile.mock.calls[0][1];
      expect(written).toContain('"#": "/test/project/src"');
      expect(written).toContain('"#tests": "/test/project/tests"');
    });
  });

  describe('validate()', () => {
    it('returns valid when aliases match', async () => {
      const mockContent = `
        module.exports = {
          resolve: {
            alias: {
              "#": "/test/project/src"
            }
          }
        };
      `;
      fs.readFile.mockResolvedValue(mockContent);

      const expected = { '#/': './src/' };
      const result = await adapter.validate(expected);

      expect(result.valid).toBe(true);
      expect(result.diff).toBeNull();
    });

    it('returns invalid with diff when aliases mismatch', async () => {
      const mockContent = `
        module.exports = {
          resolve: {
            alias: {
              "#": "/test/project/src"
            }
          }
        };
      `;
      fs.readFile.mockResolvedValue(mockContent);

      const expected = { '#/': './src/', '#tests/': './tests/' };
      const result = await adapter.validate(expected);

      expect(result.valid).toBe(false);
      expect(result.diff.missing).toContain('#tests/');
    });
  });
});
```

---

## Error Handling Contract

Adapters must handle errors according to these guidelines:

### File Not Found

```javascript
throw new Error(`[OMH] Configuration file not found: ${this.#filePath}`);
```

### Malformed File

```javascript
throw new Error(
  `[OMH] Failed to parse ${this.#filePath}: ${parseError.message}`
);
```

### Write Failure

```javascript
throw new Error(
  `[OMH] Failed to write ${this.#filePath}: ${writeError.message}`
);
```

### No Aliases Section

```javascript
// Don't throw - return empty object
return {};
```

---

## Performance Contract

Adapters should meet these performance targets:

- **Read operation**: < 50ms for typical config files (< 10KB)
- **Write operation**: < 100ms for typical config files
- **Validation operation**: < 75ms (includes one read)

For larger files (> 100KB), performance may degrade gracefully.

---

## Extension Checklist

When adding a new adapter:

- [ ] Create adapter class extending `BaseConfigAdapter`
- [ ] Implement all required methods: `getFormat()`, `getFilePaths()`, `read()`, `write()`
- [ ] Add format-specific normalization logic in `read()`
- [ ] Add format-specific conversion logic in `write()`
- [ ] Preserve file formatting (comments, indentation, EOL)
- [ ] Add comprehensive unit tests (≥ 80% coverage)
- [ ] Register adapter in sync script: `adapterRegistry.register(new MyAdapter())`
- [ ] Update validation tests to include new file type
- [ ] Document adapter in this contract (if needed)
- [ ] Add adapter to README in `src/utils/alias-adapters/`

---

**Contract Version**: 1.0.0
**Last Updated**: 2025-10-31
**Status**: ✅ Complete
