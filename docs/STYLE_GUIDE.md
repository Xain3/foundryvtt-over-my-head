# Style Guide: Vision with Fade Module

This document outlines coding standards, documentation requirements, and best practices for the **Vision with Fade** FoundryVTT module. All contributors MUST adhere to these guidelines to maintain code quality, consistency, and long-term maintainability.

This style guide is derived from the [Constitution](../.specify/memory/constitution.md) and FoundryVTT best practices.

---

## Table of Contents

1. [File Structure & Headers](#file-structure--headers)
2. [JavaScript/TypeScript Conventions](#javascripttypescript-conventions)
3. [Naming Conventions](#naming-conventions)
4. [Documentation Standards](#documentation-standards)
5. [Code Organization](#code-organization)
6. [Error Handling & Logging](#error-handling--logging)
7. [Testing Standards](#testing-standards)
8. [FoundryVTT Integration](#foundryv-tt-integration)
9. [Commit & PR Guidelines](#commit--pr-guidelines)

---

## File Structure & Headers

Every file that supports comments MUST include a standardized header at the top, followed by relevant imports and code.

### JavaScript/TypeScript Files

```javascript
// Shebang line for executable scripts (omit for non-executable files)
#!/usr/bin/env -S node --loader ts-node/esm
/**
 * @file filename.mjs
 * @description Brief description of what this file does and its primary responsibility
 * @path src/path/to/filename.mjs
 */

// Imports follow here
import { someModule } from './other-module.mjs';

// Code follows
```

**Header Requirements:**

- **@file**: Exact filename with extension (e.g., `config.ts`, `hooks.mjs`)
- **@description**: 1-2 sentences explaining the file's primary purpose and responsibility
- **@path**: Relative path from project root (e.g., `src/config/config.ts`)
- Location: Very first item in the file, before any imports or code
- Format: JSDoc comment (`/** ... */`)

**Example - Runtime Config File:**

```javascript
/**
 * @file config.ts
 * @description Singleton configuration service that aggregates runtime config from YAML files, module.json, and environment variables
 * @path src/config/config.ts
 */

import * as fs from 'fs';
import * as yaml from 'yaml';

class Config {
  /* ... */
}
```

### YAML Files

YAML files should include a similar header as a YAML comment:

```yaml
# @file foundry.yaml
# @description Foundry VTT system integration defaults and module location references
# @path src/config/constants/foundry.yaml

defaults:
  i18nLocation: 'game.i18n'
  modulesLocation: 'game.modules'
```

**Header Requirements:**

- Single `#` comment at the top
- Same @file, @description, @path pattern
- Keep descriptions concise (1-2 lines)

### README Files

Every directory MUST contain a `README.md` explaining its purpose. The README is your folder's documentation contract.

```markdown
# [Folder Name]

**Purpose**: Explain why this folder exists and what it contains

**Contents**:

- `file1.mjs` - Brief description
- `file2.yaml` - Brief description
- `subfolder/` - Brief description

**Key Concepts**:

- Concept 1: Explanation
- Concept 2: Explanation

**Dependencies**: List any external or internal dependencies

**Last Updated**: YYYY-MM-DD
**Version**: Module version this README was last updated for
```

---

## JavaScript/TypeScript Conventions

### Module System

- **Use ES Modules (ESM)** exclusively
  - Filenames: `.mjs` for JavaScript, `.mts` for TypeScript
  - Import/export syntax: `import { x } from 'module'; export { x };`
  - No CommonJS (`require()`, `module.exports`)

### Variable & Constant Naming

- **Constants**: `SCREAMING_SNAKE_CASE` for module-level constants

  ```javascript
  const MODULE_PREFIX = 'VWF';
  const DEFAULT_TIMEOUT = 5000;
  ```

- **Variables**: `camelCase` for local and module-level variables

  ```javascript
  let currentState = null;
  const isInitialized = true;
  ```

- **Private members**: Prefix with `#` (private fields) or `_` prefix (convention)

  ```javascript
  class Config {
    #singleton = null;
    _initialized = false;
  }
  ```

- **Classes**: `PascalCase`

  ```javascript
  class ConfigManager {
    /* ... */
  }
  ```

- **Functions/Methods**: `camelCase`, verbs first for actions
  ```javascript
  loadConfig();
  mergeConstants();
  validateSettings();
  ```

### Code Style

- **Indentation**: 2 spaces
- **Semicolons**: Required at end of statements
- **Quotes**: Double quotes for strings (`"string"`)
- **Trailing commas**: Include in multi-line arrays/objects

  ```javascript
  const config = {
    key1: 'value1',
    key2: 'value2',
  };
  ```

- **Line length**: Max 120 characters (break long lines for readability)
- **Arrow functions**: Prefer for callbacks and simple operations
  ```javascript
  const values = array.map((item) => item * 2);
  const result = array.filter((item) => item > 10);
  ```
  Note: Parentheses around single parameters are optional; use based on readability

---

## Naming Conventions

### Configuration Keys

- Use `camelCase` in code
- Use `SCREAMING_SNAKE_CASE` for environment variables with module prefix

  ```javascript
  // Code
  const debugMode = config.settings.debugMode;

  // Environment variable
  process.env.VWF_DEBUG_MODE;
  ```

### Event/Hook Names

- Use `PascalCase` with descriptive names

  ```javascript
  const HOOKS = {
    SettingsReady: 'SettingsReady',
    ContextReady: 'ContextReady',
  };
  ```

- Pattern-based hooks use dot notation with placeholders
  ```javascript
  // Pattern: `.setting.{settingKey}`
  const settingHook = `.setting.debugMode`;
  ```

### File Organization

- Group related functionality in folders
- Use descriptive folder names in `kebab-case`
  ```
  src/
    config/
    handlers/
    utils/
    baseClasses/
  ```

---

## Documentation Standards

### JSDoc for Functions & Methods

Every function, method, and class MUST have a JSDoc comment:

```javascript
/**
 * Loads and parses a YAML configuration file.
 *
 * @param {string} filePath - Absolute path to the YAML file
 * @param {Object} options - Optional configuration for parsing
 * @param {boolean} [options.strict=true] - Throw error on parse failure
 * @returns {Object} Parsed YAML content
 * @throws {Error} If file not found or YAML parsing fails (when strict=true)
 *
 * @example
 * const config = loadYamlFile('./config.yaml');
 */
function loadYamlFile(filePath, options = {}) {
  // Implementation
}
```

**Required Fields:**

- **@param**: Each parameter with type and description
- **@returns** or **@throws**: What the function returns or throws
- **@example** (when helpful): Usage example for public APIs

### JSDoc for Classes

```javascript
/**
 * Singleton configuration service for the module.
 *
 * Loads and aggregates configuration from multiple sources:
 * - YAML files in src/config/constants
 * - Settings definitions in src/config/settings
 * - Module manifest (module.json)
 * - Environment variables (with VWF_ prefix)
 *
 * The config is frozen after initialization to prevent accidental modifications.
 *
 * @class Config
 * @singleton
 */
class Config {
  /**
   * Gets the singleton instance.
   *
   * @static
   * @returns {Config} The initialized config singleton
   */
  static getInstance() {
    // Implementation
  }
}
```

### Inline Comments

Use inline comments sparingly—only for non-obvious logic:

```javascript
// GOOD: Explains why, not what
// We use namespace-keyed merging to prevent key collisions between config files
const merged = mergeNamespaced(files);

// BAD: States the obvious
// Initialize the config
const config = new Config();
```

### Complex Logic Documentation

For algorithm-heavy or counterintuitive code, explain the approach:

```javascript
/**
 * Merges YAML files using namespace-preserving shallow merge.
 * Each file is stored under its own key to prevent collisions.
 *
 * Example:
 * Input: foundry.yaml, hooks.yaml
 * Output: { foundry: {...}, hooks: {...} }
 *
 * Rationale: Shallow merge preserves config structure and makes it clear
 * which file each value comes from.
 */
function mergeNamespaced(yamlFiles) {
  // Implementation
}
```

---

## Code Organization

### Single Responsibility

Each class and module MUST have a single, well-defined responsibility:

```javascript
// GOOD: Config class handles configuration only
class Config {
  loadYaml() {
    /* ... */
  }
  mergeConstants() {
    /* ... */
  }
}

// BAD: Config class doing too much
class Config {
  loadYaml() {
    /* ... */
  }
  registerHooks() {
    /* ... */
  } // Should be elsewhere
  validateSettings() {
    /* ... */
  } // Should be elsewhere
}
```

### Imports Organization

Organize imports in this order:

```javascript
// 1. Built-in modules
import * as fs from 'fs';
import * as path from 'path';

// 2. External dependencies
import * as yaml from 'yaml';

// 3. Local imports (relative)
import { loadConfig } from './config.ts';
import { validateSettings } from '../validation/validator.mts';
```

### Exported API

Keep the public API minimal and intentional:

```javascript
// GOOD: Clear, minimal API
export { Config };
export const config = Config.getInstance();

// BAD: Exporting internals
export { Config, _mergeFiles, _validateYaml, _cacheKey, ... };
```

---

## Error Handling & Logging

### Error Messages

Always include context and the module prefix:

```javascript
const MODULE_PREFIX = 'VWF';

function loadConfig() {
  try {
    // Load logic
  } catch (error) {
    throw new Error(
      `[${MODULE_PREFIX}] Failed to load config from ${filePath}: ${error.message}`
    );
  }
}
```

**Error Format**:

- `[MODULE_PREFIX] What failed: specific detail`
- Include file paths or identifiers when relevant
- Stack trace should be preserved (throw, don't construct)

### Logging Levels

Console logging is allowed (ESLint rule `no-console: off`). Use appropriate logging levels:

```javascript
// Debug: Detailed internal state (development)
console.debug(`[${MODULE_PREFIX}] Loaded YAML file: ${filePath}`);

// Info: Important state changes
console.info(`[${MODULE_PREFIX}] Config initialized with ${count} settings`);

// Warn: Recoverable issues
console.warn(`[${MODULE_PREFIX}] Missing optional config file, using defaults`);

// Error: Critical failures
console.error(`[${MODULE_PREFIX}] Fatal error during initialization:`, error);
```

**Note**: Console logging is enabled to support debugging and FoundryVTT integration. Use appropriately and consider using log levels for development vs. production.

### Fail-Fast Philosophy

The config system follows fail-fast principles:

```javascript
// GOOD: Throw on errors immediately
if (!fs.existsSync(filePath)) {
  throw new Error(`[${MODULE_PREFIX}] Config file not found: ${filePath}`);
}

// BAD: Silently use defaults
if (!fs.existsSync(filePath)) {
  console.log('File missing, using defaults');
  return DEFAULT_CONFIG;
}
```

---

## Testing Standards

### Test File Naming

Test files MUST follow one of these patterns (as configured in ESLint):

```
*.test.mjs              # Generic test file
*.unit.test.mjs         # Unit test file
*.int.test.mjs          # Integration test file
*.performance.test.mjs  # Performance test file
*.smoke.test.mjs        # Smoke test file
*.setup.test.mjs        # Setup/fixture test file
```

**Examples**:

```
src/config/config.ts
tests/unit/config.unit.test.mjs

src/utils/helpers.mts
tests/unit/helpers.unit.test.mjs

src/handlers/occlusion-handler.mts
tests/integration/occlusion-handler.int.test.mjs
```

### Test Organization

Each test file MUST correspond to a source file:

```javascript
/**
 * @file config.unit.test.mjs
 * @description Unit tests for the Config singleton and configuration loading
 * @path tests/unit/config.unit.test.mjs
 */

describe('Config', () => {
  describe('getInstance()', () => {
    it('returns the same instance on multiple calls', () => {
      const instance1 = Config.getInstance();
      const instance2 = Config.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('loading YAML files', () => {
    it('throws error on malformed YAML', () => {
      expect(() => {
        loadYamlFile('./malformed.yaml');
      }).toThrow();
    });
  });
});
```

### Coverage Requirements

- Aim for **≥80% code coverage** on critical paths
- All public APIs MUST be tested
- Edge cases MUST be tested (malformed input, missing files, etc.)
- Mock external dependencies (FoundryVTT APIs, file system when possible)

---

## FoundryVTT Integration

### Hooks Usage

Use hooks as the ONLY mechanism for FoundryVTT integration:

```javascript
/**
 * @file hooks-setup.mjs
 * @description Module initialization and hook registration
 * @path src/handlers/hooks-setup.mjs
 */

const HOOKS = {
  SettingsReady: 'SettingsReady',
  ContextReady: 'ContextReady',
};

Hooks.on('ready', () => {
  Hooks.call(HOOKS.SettingsReady);
});

Hooks.on('updateSetting', (setting, value) => {
  Hooks.call(`.setting.${setting.key}`, value);
});
```

### No Monkey-Patching

DO NOT patch FoundryVTT core methods:

```javascript
// BAD: Monkey-patching
Token.prototype._setOcclusion = function () {
  // Custom logic
};

// GOOD: Hook-based
Hooks.on('updateToken', (token) => {
  handleOcclusionUpdate(token);
});
```

### Configuration via Settings

Use FoundryVTT's settings system for user-facing config:

```javascript
game.settings.register('vision-with-fade', 'debugMode', {
  name: 'OMH.settings.debugMode.name',
  hint: 'OMH.settings.debugMode.hint',
  scope: 'user',
  config: true,
  type: Boolean,
  default: false,
});
```

---

## Commit & PR Guidelines

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add centralized config system with YAML loading
fix: resolve singleton instantiation in multithreaded context
docs: update style guide with immutability requirements
refactor: extract config merging logic into separate module
test: add edge case tests for malformed YAML
```

**Format**: `<type>: <short description>`

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code reorganization (no behavior change)
- `test`: Test additions/changes
- `style`: Code style (formatting, etc.)
- `chore`: Dependencies, tooling, etc.

### Pull Request Checklist

Before submitting a PR, verify:

- [ ] All files have proper headers (`@file`, `@description`, `@path`)
- [ ] All functions/classes have JSDoc comments
- [ ] Adheres to naming conventions (camelCase, PascalCase, SCREAMING_SNAKE_CASE)
- [ ] Code follows indentation (2 spaces) and style rules
- [ ] Folder READMEs updated if files added/removed
- [ ] Tests added/updated for new code
- [ ] No FoundryVTT monkey-patching
- [ ] Error messages include `[MODULE_PREFIX]` and context
- [ ] Commit messages follow format
- [ ] No regressions in existing functionality

---

## Quick Reference

| Element     | Format                                 | Example                |
| ----------- | -------------------------------------- | ---------------------- |
| File header | JSDoc `@file`, `@description`, `@path` | `@file config.ts`     |
| Class       | PascalCase                             | `ConfigManager`        |
| Function    | camelCase, verb first                  | `loadConfig()`         |
| Variable    | camelCase                              | `isInitialized`        |
| Constant    | SCREAMING_SNAKE_CASE                   | `MODULE_PREFIX`        |
| Env var     | SCREAMING_SNAKE_CASE with prefix       | `VWF_DEBUG_MODE`       |
| Hook name   | PascalCase                             | `SettingsReady`        |
| Test file   | `*.unit.test.mjs` or `*.int.test.mjs`  | `config.unit.test.mjs` |
| Indentation | Spaces                                 | 2 spaces               |
| Quotes      | Double                                 | `"string"`             |
| Semicolons  | Required                               | Yes                    |

---

## Related Documents

- [Constitution](../.specify/memory/constitution.md) - Architectural principles and governance
- [README](../README.md) - Module overview
- [Module Manifest](../module.json) - FoundryVTT configuration
- [Contributing Guide](#) - How to contribute to this project

---

**Last Updated**: October 20, 2025
**Style Guide Version**: 1.0.0
**Module Version**: 12.1.0
