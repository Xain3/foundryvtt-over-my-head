# Research: Parametrable Logger Module

**Feature**: 004-parametrable-logger
**Date**: 2025-11-02
**Status**: Complete

## Overview

This document captures research findings for technology choices and implementation patterns for the parametrable logger module.

---

## Research Item 1: ANSI Color Library Selection

**Context**: Logger requires colorization of console output based on log level (FR-015). Need to select appropriate ANSI color library for Node.js environment.

### Decision

**Selected**: `chalk` (v5.x)

**Rationale**:

1. **Industry Standard**: Most widely used terminal styling library in Node.js ecosystem (30M+ weekly downloads)
2. **Zero Dependencies**: Pure ESM package with no external dependencies, minimizing bundle size
3. **ESM Native**: v5.x is fully ESM-native, aligning with project's .mjs/.mts module system
4. **Rich API**: Supports 256 colors, RGB, hex colors, and chainable styling
5. **Performance**: Minimal overhead; optimized for high-frequency logging scenarios
6. **Type Safety**: Ships with TypeScript definitions for better IDE integration
7. **Stability**: Mature library (v5.3.0 latest) with years of production use

**Alternatives Considered**:

| Library           | Why Rejected                                                                     |
| ----------------- | -------------------------------------------------------------------------------- |
| `ansi-colors`     | Smaller API surface but less flexible; older CommonJS-first design               |
| `kleur`           | Faster but limited color palette; lacks RGB/hex support for future extensibility |
| `colors.js`       | Deprecated and unmaintained; security concerns                                   |
| Manual ANSI codes | Reinventing wheel; error-prone; no cross-platform handling                       |

**Implementation Notes**:

- Import: `import chalk from 'chalk';`
- Usage pattern: `chalk.red('[ERROR]')`, `chalk.yellow.bold('[WARN]')`
- Color mapping per log level:
  - `error`: red
  - `warn`: yellow
  - `info`: blue
  - `verbose`: cyan
  - `debug`: gray
- Colorization controllable via configuration flag: `config.colorize: boolean`
- Auto-disable in non-TTY environments (e.g., file redirection, CI)

**Package Addition**:

```json
{
  "dependencies": {
    "chalk": "^5.3.0"
  }
}
```

---

## Research Item 2: Format String Placeholder Substitution Pattern

**Context**: Logger needs template-based message formatting with placeholder substitution (FR-003, FR-005). Need pattern for parsing `{placeholder}` syntax and replacing with runtime values.

### Decision

**Selected**: Simple regex-based substitution with contextual object

**Rationale**:

1. **Simplicity**: Regex `/\{([^}]+)\}/g` is sufficient for `{key}` patterns
2. **Performance**: Single-pass string replacement; no AST parsing overhead
3. **Flexibility**: Supports nested property access via dot notation (e.g., `{metadata.userId}`)
4. **Explicit**: No magic; clear mapping from template to data object
5. **Testable**: Easy to unit test with known input/output pairs

**Implementation Pattern**:

```javascript
function formatMessage(template, context) {
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    // Support nested property access: {metadata.userId}
    const value = key.split('.').reduce((obj, prop) => obj?.[prop], context);
    return value !== undefined ? String(value) : match; // Keep placeholder if missing
  });
}
```

**Context Object Structure**:

```javascript
const logContext = {
  module: 'OMH', // Resolved module name
  level: 'INFO', // Current log level (uppercase)
  timestamp: '2025-11-02...', // Formatted timestamp
  message: 'User logged in', // User-provided message
  metadata: { userId: 123 }, // Optional metadata object
};
```

**Default Format Templates** (from logging.yaml):

```yaml
format:
  error: '[{module}] ERROR | {timestamp} | {message}'
  warn: '[{module}] WARN | {timestamp} | {message}'
  info: '[{module}] {message}'
  verbose: '[{module}] VERBOSE | {message}'
  debug: '[{module}] DEBUG | {timestamp} | {message} | {metadata}'
```

**Alternatives Considered**:

| Approach             | Why Rejected                                          |
| -------------------- | ----------------------------------------------------- |
| Template literals    | Requires `eval()` or `new Function()`, security risk  |
| Handlebars/Mustache  | Overkill; external dependency for simple substitution |
| String concatenation | Less flexible; harder to configure externally         |

---

## Research Item 3: Timestamp Formatting

**Context**: Logger includes timestamp in formatted messages (FR-014). Need consistent, configurable timestamp format.

### Decision

**Selected**: ISO 8601 format via `new Date().toISOString()` with optional custom format via Intl.DateTimeFormat

**Rationale**:

1. **Native API**: No external dependencies; built into JavaScript
2. **Standard**: ISO 8601 is universal, sortable, and unambiguous
3. **Locale Support**: Intl.DateTimeFormat supports localized formats if needed in future
4. **Performance**: Native methods are fast; negligible overhead

**Default Format**: `2025-11-02T14:30:45.123Z` (ISO 8601 UTC)

**Configuration Options**:

```yaml
timestamp:
  enabled: true
  format: 'iso' # Options: "iso", "locale", "custom"
  customFormat: null # Reserved for future Date.format() extension
```

**Implementation**:

```javascript
function getTimestamp(config) {
  if (!config.timestamp?.enabled) return '';

  const now = new Date();
  switch (config.timestamp.format) {
    case 'iso':
      return now.toISOString();
    case 'locale':
      return now.toLocaleString();
    default:
      return now.toISOString();
  }
}
```

**Alternatives Considered**:

| Approach       | Why Rejected                                      |
| -------------- | ------------------------------------------------- |
| `moment.js`    | Deprecated; large bundle size                     |
| `date-fns`     | Additional dependency for simple use case         |
| Unix timestamp | Less human-readable; requires external conversion |

---

## Research Item 4: Shallow Merge Strategy for Configuration Overrides

**Context**: Configuration supports hierarchical overrides with shallow merge semantics (FR-017, Clarification Q2). Need robust, predictable merge implementation.

### Decision

**Selected**: Manual shallow merge via object spread with explicit format section replacement

**Rationale**:

1. **Predictability**: Shallow merge is explicit; no hidden nested merges
2. **Performance**: Object spread (`{ ...base, ...overrides }`) is native and fast
3. **Type Safety**: Easier to type in TypeScript; clear object structure
4. **Testability**: Straightforward to test merge behavior

**Implementation Pattern**:

```javascript
function mergeConfig(base, overrides) {
  // Shallow merge: top-level keys override entirely
  const merged = { ...base, ...overrides };

  // Format section replaces wholesale (no nested merge)
  if (overrides.format !== undefined) {
    merged.format = overrides.format;
  }

  return merged;
}
```

**Merge Precedence**: `defaults < config.ts base < instance overrides`

**Example**:

```javascript
const base = {
  level: 'info',
  colorize: true,
  format: {
    info: '[{module}] {message}',
    error: '[{module}] ERROR: {message}',
  },
};

const overrides = {
  level: 'debug',
  format: {
    info: '{module} >> {message}',
  },
};

const result = mergeConfig(base, overrides);
// Result:
// {
//   level: 'debug',         // Overridden
//   colorize: true,         // Inherited from base
//   format: {               // Replaced entirely
//     info: '{module} >> {message}',
//   },
// }
```

**Alternatives Considered**:

| Approach     | Why Rejected                                    |
| ------------ | ----------------------------------------------- |
| lodash.merge | Deep merge semantics; unnecessary dependency    |
| Deep merge   | Complexity; unexpected nested override behavior |
| Immutable.js | Overkill; entire library for simple merge       |

---

## Research Item 5: Module Name Resolver Implementation

**Context**: Logger needs module name derived from `referToModuleBy` setting (FR-007, Clarification Q4). Need static utility for resolution logic.

### Decision

**Selected**: Static utility function in `src/utils/static/moduleNameResolver.ts` following moduleManagement.yaml patterns

**Rationale**:

1. **Separation of Concerns**: Keeps logger decoupled from module management logic
2. **Reusability**: Other utilities can use same resolver
3. **Testability**: Pure function; easy to unit test with mock config
4. **Consistency**: Follows existing static utility pattern in project

**Implementation Pattern**:

```javascript
/**
 * @file moduleNameResolver.ts
 * @description Resolves module name from configuration's referToModuleBy setting
 * @path src/utils/static/moduleNameResolver.ts
 */

/**
 * Resolves the module name to use for display based on referToModuleBy setting.
 *
 * @param {Object} config - Configuration object containing moduleManagement settings
 * @param {string} config.moduleManagement.referToModuleBy - Strategy: 'id', 'title', 'shortName'
 * @param {Object} config.module - Module manifest data (from module.json)
 * @returns {string} Resolved module name
 *
 * @example
 * const name = resolveModuleName(config);
 * // Returns: "OMH" if referToModuleBy is 'shortName'
 */
export function resolveModuleName(config) {
  const strategy = config.moduleManagement?.referToModuleBy || 'id';
  const module = config.module;

  switch (strategy) {
    case 'id':
      return module.id;
    case 'title':
      return module.title;
    case 'shortName':
      return module.shortName || module.id;
    default:
      console.warn(
        `[OMH] Unknown referToModuleBy strategy: ${strategy}, using 'id'`
      );
      return module.id;
  }
}
```

**Integration with Logger**:

```javascript
import { resolveModuleName } from '#/utils/static/moduleNameResolver.ts';
import { config } from '#/config/config.ts';

// In utils.ts or logger instantiation site
const moduleName = resolveModuleName(config);
const logger = new Logger({ ...config.logging, moduleName });
```

**Alternatives Considered**:

| Approach               | Why Rejected                                                                  |
| ---------------------- | ----------------------------------------------------------------------------- |
| Logger internal method | Violates single responsibility; logger shouldn't know about module management |
| Direct property access | Hardcodes logic; less flexible for future strategies                          |
| Config.ts method       | Config should be passive data provider, not business logic                    |

---

## Research Item 6: Log Level Filtering Implementation

**Context**: Logger must respect log level thresholds (FR-004). Need efficient, clear filtering mechanism.

### Decision

**Selected**: Numeric level comparison with configurable threshold

**Rationale**:

1. **Performance**: Integer comparison is O(1) and fast
2. **Clarity**: Explicit numeric hierarchy is self-documenting
3. **Flexibility**: Easy to add custom levels in future

**Level Hierarchy** (lowest to highest):

```javascript
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
};
```

**Filtering Logic**:

```javascript
class Logger {
  constructor(config) {
    this.threshold = LOG_LEVELS[config.level] ?? LOG_LEVELS.info;
  }

  _shouldLog(level) {
    return LOG_LEVELS[level] <= this.threshold;
  }

  info(message, metadata) {
    if (!this._shouldLog('info')) return;
    // ... format and output
  }
}
```

**Debug Mode Override**:

```javascript
// If debug mode enabled, force threshold to 'debug' level
if (config.debugMode) {
  this.threshold = LOG_LEVELS.debug;
}
```

**Alternatives Considered**:

| Approach          | Why Rejected                                   |
| ----------------- | ---------------------------------------------- |
| String comparison | Slower; requires dictionary lookup             |
| Enum-based        | Overkill for simple hierarchy                  |
| Per-method config | Duplicates threshold logic; harder to maintain |

---

## Summary

All research items resolved. Key technology choices:

- **Color Library**: chalk v5.x (ESM-native, zero deps, industry standard)
- **Placeholder Substitution**: Regex-based with nested property support
- **Timestamp Format**: ISO 8601 via native Date API
- **Config Merge**: Shallow merge with explicit format replacement
- **Module Name Resolution**: Static utility function following project patterns
- **Level Filtering**: Numeric comparison with debug mode override

No blocking issues identified. Ready to proceed to Phase 1 (Design & Contracts).
