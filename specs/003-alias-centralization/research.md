# Research: Alias Configuration Centralization

**Feature**: 003-alias-centralization
**Date**: 2025-10-31
**Status**: Complete

This document captures research findings and technology decisions for implementing centralized alias configuration management.

---

## Research Areas

### 1. Adapter Pattern for Configuration File Handling

**Decision**: Use class-based adapter pattern with abstract base class and concrete implementations per file type.

**Rationale**:

- **Separation of concerns**: Each adapter handles one file format (TypeScript, package.json, etc.) with format-specific read/write logic
- **Extensibility**: New file types can be added by creating new adapter classes without modifying core logic
- **Testability**: Each adapter can be unit tested in isolation with mocked file system operations
- **Single responsibility**: Adapters know only their own file format, not the entire ecosystem

**Alternatives considered**:

- **Function-based adapters**: Simpler but less structured; harder to enforce interface consistency
- **Monolithic handler**: Single module with conditional logic for each format; violates open/closed principle and harder to extend
- **Plugin system**: Overly complex for our needs; class-based approach provides sufficient flexibility

**Implementation approach**:

```javascript
// Base adapter provides common interface
class BaseConfigAdapter {
  async read() {
    /* normalize to common format */
  }
  async write(aliases) {
    /* convert from common format */
  }
  async validate(expected) {
    /* compare current vs expected */
  }
}

// Concrete adapters implement format-specific logic
class TsConfigAdapter extends BaseConfigAdapter {
  /* TypeScript paths */
}
class PackageJsonAdapter extends BaseConfigAdapter {
  /* Node.js imports */
}
```

---

### 2. JSONC (JSON with Comments) Handling

**Decision**: Use Microsoft's `jsonc-parser` library for reading/writing tsconfig.json (which supports comments and trailing commas).

**Rationale**:

- **Industry standard**: Used by VS Code internally; well-tested and maintained
- **Comment preservation**: `jsonc-parser` provides edit APIs that preserve comments and formatting when modifying JSON
- **Error handling**: Robust error reporting for malformed JSONC
- **Node.js native**: No C bindings, works across all platforms in dev containers

**Alternatives considered**:

- **strip-json-comments**: Only removes comments (doesn't preserve them); insufficient for our needs
- **comment-json**: Maintains AST with comment nodes but more complex API and slower performance
- **Manual regex replacement**: Fragile and error-prone; hard to maintain

**Package dependency**:

```json
{
  "devDependencies": {
    "jsonc-parser": "^3.3.1" // Already installed in project
  }
}
```

**Usage pattern**:

```javascript
import * as jsonc from 'jsonc-parser';

// Read with comments
const parsed = jsonc.parse(content, errors, { allowTrailingComma: true });

// Write with formatting preservation
const edits = jsonc.modify(
  content,
  ['compilerOptions', 'paths'],
  newPaths,
  formatting
);
const updated = jsonc.applyEdits(content, edits);
```

---

### 3. Formatting Preservation Strategy

**Decision**: Use multi-strategy approach - `jsonc-parser` for JSONC files, custom indentation detection for JSON files.

**Rationale**:

- **JSONC files (tsconfig.json)**: Use `jsonc-parser`'s edit API which preserves comments, indentation, and EOL characters automatically
- **JSON files (package.json)**: Detect indentation with regex, use `JSON.stringify()` with detected indent, preserve trailing newline
- **Minimal changes**: Only modify the specific sections that contain aliases; leave all other content untouched
- **Format detection**: Auto-detect spaces vs tabs, EOL style (LF vs CRLF), and indentation size from existing files

**Code pattern**:

```javascript
// Detect formatting from existing content
function detectJsonFormat(content) {
  const indentMatch = content.match(/^(\s+)"/m);
  const indent = indentMatch ? indentMatch[1] : '  ';
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const eofNewline = content.endsWith('\n');

  return { indent, eol, eofNewline };
}

// Apply updates preserving format
const format = detectJsonFormat(originalContent);
const updated = JSON.stringify(transformed, null, format.indent);
const final = format.eofNewline ? updated + format.eol : updated;
```

**Alternatives considered**:

- **Prettier integration**: Consistent but overrides user preferences; too opinionated for config files that may have custom formatting
- **AST-based editing**: Complex and slower; overkill for targeted alias section updates
- **Line-by-line replacement**: Fragile with nested objects; risks breaking JSON structure

---

### 4. Adapter Registry Pattern

**Decision**: Use singleton registry with dynamic adapter registration and file path indexing.

**Rationale**:

- **Centralized management**: Single place to register and discover all adapters
- **Type safety**: Validates adapters implement required interface at registration time
- **Lookup efficiency**: Indexed by both format type and file path for fast retrieval
- **Conflict detection**: Prevents multiple adapters from claiming same format or file path

**Implementation**:

```javascript
class AdapterRegistry {
  #adapters = new Map();        // format -> adapter
  #filePathIndex = new Map();   // filePath -> adapter

  register(adapter) {
    // Validate interface
    if (typeof adapter.read !== 'function') throw new Error(...);

    // Register by format
    const format = adapter.getFormat();
    if (this.#adapters.has(format)) throw new Error(`Duplicate format: ${format}`);
    this.#adapters.set(format, adapter);

    // Index by file paths
    for (const filePath of adapter.getFilePaths()) {
      this.#filePathIndex.set(filePath, adapter);
    }
  }

  getByFormat(format) { return this.#adapters.get(format); }
  getByFilePath(path) { return this.#filePathIndex.get(path); }
  getAll() { return Array.from(this.#adapters.values()); }
}

export const adapterRegistry = new AdapterRegistry();
```

**Alternatives considered**:

- **Manual array of adapters**: No conflict detection, requires linear search
- **Auto-discovery by directory scan**: Overly complex for initially known set of adapters; adds startup overhead
- **Service locator with string keys**: Less type-safe, no file path indexing

---

### 5. Alias Normalization Format

**Decision**: Use flat object format `{ "aliasKey": "targetPath" }` as the interchange format between alias.config.mjs and adapters.

**Rationale**:

- **Simplicity**: Plain object is easy to serialize, compare, and diff
- **Format-agnostic**: Each adapter converts to/from its own format (TypeScript uses wildcards, package.json uses trailing slashes)
- **Diff-friendly**: Easy to compute missing/extra/changed keys for validation reporting
- **JSON-compatible**: Can be serialized for logging and testing without custom serialization

**Normalization example**:

```javascript
// Source: alias.config.mjs
[
  { find: '#', replacement: '/abs/path/to/src' },
  { find: '#tests', replacement: '/abs/path/to/tests' }
]

// Normalized interchange format
{
  "#": "/abs/path/to/src",
  "#tests": "/abs/path/to/tests"
}

// TypeScript adapter converts to:
{
  "#/*": ["./src/*"],
  "#tests/*": ["./tests/*"]
}

// package.json adapter converts to:
{
  "#/": "./src/",
  "#tests/": "./tests/"
}
```

**Alternatives considered**:

- **Keep original array-of-objects format**: Harder to diff and compare; requires more complex equality checks
- **Use TypeScript format as standard**: Unnecessarily complex with wildcards; harder to validate
- **Use adapter-specific formats throughout**: No common ground for validation logic; lots of duplication

---

### 6. Validation Strategy

**Decision**: Compare normalized representations and generate detailed diffs showing missing, extra, and mismatched aliases.

**Rationale**:

- **Early detection**: Catch drift as soon as tests run, before code is committed
- **Actionable errors**: Diff shows exactly what's wrong and how to fix it
- **Format-agnostic**: Comparison happens on normalized format, not format-specific syntax
- **Test-driven**: Validation implemented as vitest tests in `tests/project-setup-tests/`

**Diff output format**:

```javascript
{
  valid: false,
  diff: {
    current: { "#": "./src/", "#tests": "./tests/" },
    expected: { "#": "./src/", "#tests": "./tests/", "#mocks": "./tests/mocks/" },
    missing: ["#mocks"],      // In expected but not current
    extra: [],                // In current but not expected
    mismatched: []            // Keys exist but values differ
  }
}
```

**Alternatives considered**:

- **Simple boolean validation**: Not helpful; doesn't tell developer what's wrong
- **String comparison of file contents**: Fragile with formatting changes; false positives
- **Deep object equality**: Works but doesn't provide useful diff for debugging

---

### 7. Dry-Run Mode Implementation

**Decision**: Add `--dry-run` flag that reads files, computes diffs, logs what would change, but skips all write operations.

**Rationale**:

- **Constitution requirement**: Executable scripts must support dry-run per constitution v2.1.0
- **Safety**: Developers can preview changes before committing to file modifications
- **Testing**: CI/CD pipelines can validate sync would succeed without modifying files
- **Debugging**: Helps diagnose issues without risking data corruption

**Implementation approach**:

```javascript
async function syncAliases(options = {}) {
  const { dryRun = false } = options;

  for (const adapter of adapterRegistry.getAll()) {
    const validation = await adapter.validate(sourceAliases);

    if (!validation.valid) {
      if (dryRun) {
        console.log(`  → Would update ${adapter.getFilePaths()[0]}`);
        console.log(`    Diff:`, validation.diff);
      } else {
        await adapter.write(sourceAliases);
        console.log(`  ✓ Updated ${adapter.getFilePaths()[0]}`);
      }
    }
  }
}
```

---

### 8. Error Handling Strategy

**Decision**: Use try-catch per adapter with detailed error messages including file paths, operation type, and recovery instructions.

**Rationale**:

- **Isolation**: One adapter failure shouldn't block processing of other adapters
- **Debuggability**: Errors include full context (which file, what operation, why it failed)
- **Module prefix**: All errors prefixed with `[OMH]` for easy filtering in logs
- **Exit codes**: Non-zero exit code if any adapter fails (important for CI/CD)

**Error message pattern**:

```javascript
try {
  await adapter.write(aliases);
} catch (error) {
  const filePath = adapter.getFilePaths()[0];
  console.error(`[OMH] Failed to update ${filePath}: ${error.message}`);
  console.error(`[OMH] Recovery: Check file permissions and syntax`);
  results.push({
    format: adapter.getFormat(),
    status: 'error',
    error: error.message,
  });
}
```

---

### 9. Pre-Commit Hook Strategy

**Decision**: Hook runs validation tests only (not auto-sync), blocks commit with instructions if validation fails.

**Rationale**:

- **Explicit control**: Developers make conscious decision to run sync script; no surprises
- **Clear workflow**: Hook failure message includes exact command to run for fixing the issue
- **Fast feedback**: Validation is faster than sync; keeps pre-commit hook fast (<2s)
- **User clarification**: Spec explicitly chose validate-only approach to avoid auto-modifying files during commit

**Hook implementation**:

```bash
#!/bin/sh
# .husky/pre-commit

# Run alias validation tests
npm test -- --project "project setup" tests/project-setup-tests/alias-sync.setup.test.mjs

if [ $? -ne 0 ]; then
  echo "[OMH] Alias synchronization validation failed"
  echo "[OMH] Run: npm run sync-aliases"
  echo "[OMH] Then stage and commit the updated files"
  exit 1
fi
```

**Alternatives considered**:

- **Auto-sync on commit**: Surprising to developers; files change without explicit action
- **No pre-commit hook**: Relies on developers remembering to validate; drift could slip through
- **Husky-only approach**: Works but less flexible than leveraging existing test infrastructure

---

### 10. VS Code Task Integration

**Decision**: Add task definition to `.vscode/tasks.json` that runs sync script with output in integrated terminal.

**Rationale**:

- **IDE convenience**: Developers can run sync from Command Palette without leaving editor
- **Consistent with project patterns**: Project already uses VS Code tasks for other development workflows
- **Terminal output**: Shows full output including diffs and success/failure messages
- **Manual execution**: Task is opt-in, not automatic on save or file watch

**Task configuration**:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Sync Aliases",
      "type": "shell",
      "command": "node .dev/scripts/sync-aliases.mjs",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "dedicated"
      },
      "problemMatcher": []
    }
  ]
}
```

---

## Dependencies Summary

### Required npm packages

```json
{
  "devDependencies": {
    "jsonc-parser": "^3.3.1" // ✓ Already installed
  }
}
```

### Node.js built-in modules

- `fs/promises` - File system operations
- `path` - Path manipulation
- `process` - Environment and CLI args
- `url` - File URL conversion for dynamic imports

---

## Testing Strategy

### Unit Tests

- **Adapter tests**: Mock file system, test normalization logic for each adapter
- **Registry tests**: Test registration, lookup, conflict detection
- **Helper tests**: Test format detection, diff generation, JSONC handling

### Integration Tests

- **Validation tests**: Use real test fixtures (tsconfig.json, package.json) with known aliases
- **Sync script tests**: Run script against test fixtures, verify files updated correctly
- **Format preservation tests**: Verify comments, indentation, and EOL characters preserved

### Project Setup Tests

- **alias-sync.setup.test.mjs**: Validates real project files are synchronized with alias.config.mjs
- Runs as part of "project setup" test project in vitest.config.mjs

---

## Performance Considerations

- **Caching**: Not needed for this feature (infrequent operation, small files)
- **Parallelization**: Adapters process sequentially for clear logging; parallel not necessary (<3s goal)
- **Lazy loading**: Adapters instantiated once at script start, registry populated immediately
- **File I/O**: Modern async/await with fs/promises for non-blocking operations

---

## Extension Guidelines (High-Level)

For adding support for new configuration file types:

1. **Create adapter class** extending `BaseConfigAdapter`
2. **Implement required methods**: `read()`, `write()`, `getFormat()`, `getFilePaths()`
3. **Register adapter** in sync script startup: `adapterRegistry.register(new MyAdapter())`
4. **Add unit tests** for the new adapter in `tests/unit/adapters/`
5. **Update validation test** to include the new file type

Detailed extension guide will be in `contracts/adapter-interface.md` (Phase 1).

---

## Technology Stack Summary

| Component        | Technology                   | Rationale                                |
| ---------------- | ---------------------------- | ---------------------------------------- |
| Adapter pattern  | ES6 classes with inheritance | Clear interface, extensible, testable    |
| JSONC parsing    | jsonc-parser v3.3.1          | Industry standard, comment preservation  |
| File I/O         | Node.js fs/promises          | Native, async, cross-platform            |
| Testing          | Vitest 3.2.4                 | Already in project, fast, ESM-native     |
| CLI args         | process.argv parsing         | Simple, no extra dependencies            |
| Registry         | Singleton with Map indexing  | Fast lookup, conflict detection          |
| Format detection | Regex patterns               | Lightweight, sufficient for JSON formats |

---

**Research Status**: ✅ Complete
**Ready for Phase 1**: Yes
**All NEEDS CLARIFICATION resolved**: Yes
