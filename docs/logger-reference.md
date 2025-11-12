/\*\*

- @file logger-reference.md
- @description Comprehensive explanation of how the logger.ts file works, including tables and diagrams
- @path docs/logger-reference.md
  \*/

# Logger.ts Reference Guide

## Logger.ts Overview

The `Logger` class is a **configurable, stateless logging utility** for the Over My Head module. It formats and emits console output with context awareness, placeholder substitution, colorization, and metadata handling—all controlled by configuration objects rather than global state.

---

## Core Concepts

### Log Levels & Thresholds

| Level     | Threshold | Priority | Description                            |
| --------- | --------- | -------- | -------------------------------------- |
| `error`   | 0         | Highest  | Critical failures (always emitted)     |
| `warn`    | 1         | High     | Recoverable issues                     |
| `info`    | 2         | Medium   | Important events (default)             |
| `verbose` | 3         | Low      | Detailed trace info (debug mode only)  |
| `debug`   | 4         | Lowest   | Internal diagnostics (debug mode only) |

**Threshold Logic**: Messages are emitted only if their level threshold ≤ configured threshold. Higher thresholds emit more messages.

### Configuration Object Structure

```typescript
LogConfigurationObject {
  moduleName: string;           // Name appearing in logs
  level: LogLevel;              // Base threshold level
  debugMode?: boolean;          // Emit debug/verbose regardless of level
  colorize?: boolean;           // Apply ANSI color codes (default: true)
  timestamp?: {                 // Timestamp behavior
    enabled: boolean;
    format: 'iso' | 'locale';
  };
  format?: {                    // Template strings per level
    error?: string;
    warn?: string;
    info?: string;
    verbose?: string;
    debug?: string;
  };
}
```

---

## Public API Methods

| Method      | Parameters            | Threshold   | Description                      |
| ----------- | --------------------- | ----------- | -------------------------------- |
| `error()`   | `(message, options?)` | Always      | Critical failure                 |
| `warn()`    | `(message, options?)` | ≥ warn      | Warning issue                    |
| `info()`    | `(message, options?)` | ≥ info      | Important event                  |
| `log()`     | `(message, options?)` | ≥ info      | Generic alias for `info()` level |
| `verbose()` | `(message, options?)` | ≥ verbose\* | Detailed trace                   |
| `debug()`   | `(message, options?)` | ≥ debug\*   | Internal diagnostic              |

`options` is an object with the shape `{ metadata?: unknown, overrides?: LogOverrides }`. Provide `metadata` to surface structured context inside placeholder templates, and `overrides` for per-call configuration. Both keys are optional.

_\*verbose and debug only emit if `debugMode: true` in effective config._
_\*\*log() remains a public alias that routes to the `info` level._

---

## Logging Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  logger.info("User signed in", { metadata: { userId: 123 }, overrides })    │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
                  ┌──────────────────────────────┐
                  │ Public method (info/error/   │
                  │ warn/verbose/debug/log)      │
                  │ Destructures options object  │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ _log(level, message,         │
                  │      metadata?, overrides?)  │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ mergeConfig(overrides)       │
                  │ Shallow merge with base      │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ resolveThreshold(config)     │
                  │ Calculate numeric threshold  │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ shouldLog(level, config,     │
                  │           threshold)         │
                  │ Check emission criteria      │
                  └───────┬──────────────┬───────┘
                          │              │
                 (emit)   │              │  (skip)
                          ▼              ▼
              ┌────────────────┐   ┌──────────────┐
              │ formatMessage  │   │ Return early │
              └────────┬───────┘   └──────────────┘
                       │
                       ▼
      ┌─────────────────────────────────────┐
      │ Build PlaceholderContext:           │
      │  - module: "OMH"                    │
      │  - level: "INFO"                    │
      │  - timestamp: "2025-11-07..."       │
      │  - message: "User signed in"        │
      │  - metadata: { userId: 123 }        │
      └─────────────┬───────────────────────┘
                    │
                    ▼
      ┌─────────────────────────────────────┐
      │ serializeMetadata(metadata)         │
      │ JSON.stringify with circular check  │
      └─────────────┬───────────────────────┘
                    │
                    ▼
      ┌─────────────────────────────────────┐
      │ applyPlaceholders(template,         │
      │   context, serializedMetadata)      │
      │ Substitute {module}, {message},     │
      │ {timestamp}, {metadata.*}           │
      └─────────────┬───────────────────────┘
                    │
                    ▼
      ┌─────────────────────────────────────┐
      │ applyColor(level, message)          │
      │ Add ANSI color codes if enabled     │
      └─────────────┬───────────────────────┘
                    │
                    ▼
      ┌─────────────────────────────────────┐
      │ emit(level, formatted)              │
      │ Call console.error/warn/info/log... │
      └─────────────────────────────────────┘
```

---

## Message Formatting & Placeholders

### Default Format Templates

| Level   | Template                                                     |
| ------- | ------------------------------------------------------------ |
| error   | `[{module}] ERROR \| {timestamp} \| {message}`               |
| warn    | `[{module}] WARN \| {timestamp} \| {message}`                |
| info    | `[{module}] {message}`                                       |
| verbose | `[{module}] VERBOSE \| {message}`                            |
| debug   | `[{module}] DEBUG \| {timestamp} \| {message} \| {metadata}` |

### Placeholder Reference

| Placeholder            | Resolves To                     | Example                  |
| ---------------------- | ------------------------------- | ------------------------ |
| `{module}`             | `moduleName` from config        | `"OMH"`                  |
| `{level}`              | Log level (uppercase)           | `"INFO"`                 |
| `{timestamp}`          | Formatted current time          | `"2025-11-03T10:45:23Z"` |
| `{message}`            | Serialized message string       | `"User signed in"`       |
| `{metadata}`           | Full serialized metadata object | `{"userId":123}`         |
| `{metadata.userId}`    | Nested path in metadata         | `123`                    |
| `{metadata.user.name}` | Deep nested path                | `"Alice"`                |

### Example Output

```javascript
const logger = new Logger({
  moduleName: 'OMH',
  level: 'info',
  debugMode: false,
  colorize: false,
  timestamp: { enabled: true, format: 'iso' },
});

logger.info('Login successful', {
  metadata: { userId: 42, username: 'alice' },
});
// Output: [OMH] Login successful

logger.debug('Checking permissions', {
  metadata: { userId: 42 },
});
// Output: (nothing - debug mode off)

logger.debug('Checking permissions', {
  metadata: { userId: 42 },
  overrides: { debugMode: true },
});
// Output: [OMH] DEBUG | 2025-11-03T10:45:23Z | Checking permissions | {"userId":42}
```

---

## Configuration Merging Strategy

The logger supports **per-call overrides** that merge shallowly with base config:

```javascript
const baseConfig = {
  moduleName: 'OMH',
  level: 'info', // Default threshold
  debugMode: false, // Debug off by default
  colorize: true, // Colors on by default
  timestamp: { enabled: true, format: 'iso' },
  format: {
    /* defaults */
  },
};

// Per-call override: temporarily enable debug + disable color
logger.info(
  'Important message',
  { userId: 123 },
  {
    debugMode: true,
    colorize: false,
  }
);
// Only this call uses the override; next call reverts to base config
```

### Merge Behavior

| Config Property | Merge Strategy    | Override Precedence           |
| --------------- | ----------------- | ----------------------------- |
| `level`         | Replace           | Override > base               |
| `debugMode`     | Replace           | Override > base               |
| `colorize`      | Replace           | Override > base               |
| `timestamp`     | Shallow merge     | Override fields > base fields |
| `format`        | Replace wholesale | Override > base (all levels)  |

---

## Special Features

### 1. **Circular Reference Detection**

Metadata containing circular references is safely serialized with `[Circular]` tokens:

```javascript
const obj = { name: 'Alice' };
obj.self = obj; // Circular reference

logger.info('User object', { metadata: obj });
// Serializes as: {"name":"Alice","self":"[Circular]"}
```

### 2. **Debug Mode Override**

When `debugMode: true`, **verbose** and **debug** messages bypass threshold checks:

```javascript
const logger = new Logger({ level: 'info', debugMode: false });

logger.debug('Not emitted'); // ✗ Skipped
logger.verbose('Not emitted'); // ✗ Skipped

// But with override:
logger.debug('Emitted!', { overrides: { debugMode: true } }); // ✓ Logged
```

### 3. **Metadata Serialization**

Different input types are handled specially:

| Input Type       | Behavior                                |
| ---------------- | --------------------------------------- |
| `string`         | Passed as-is                            |
| `Error`          | Includes stack trace                    |
| `object`         | JSON-serialized with circular detection |
| `null/undefined` | Empty string                            |

### 4. **Smart Separator Handling**

The logger supports context-aware separators via the `{separator}` placeholder in custom format templates. This is useful for dynamically including separators only when needed.

#### How `{separator}` Works

- **Direct Adjacency**: `{separator}` only processes when **immediately between two placeholders** (e.g., `{module}{separator}{level}`)
- **Smart Removal**: If literal text appears between a placeholder and separator, the separator is removed (e.g., in `[{module}]{separator}`, the `]` breaks adjacency)
- **Configuration**: Use `SeparatorConfig` to control behavior:
  ```typescript
  {
    separator: string;              // The separator string (e.g., ' | ' or ' - ')
    keepSeparatorIfFieldEmpty?: boolean;  // Default: false
  }
  ```

#### Separator Behavior

| Config                                       | Both Fields Non-Empty | One Field Empty     | Both Fields Empty  |
| -------------------------------------------- | --------------------- | ------------------- | ------------------ |
| `keepSeparatorIfFieldEmpty: false` (default) | ✓ Include separator   | ✗ Remove separator  | ✗ Remove separator |
| `keepSeparatorIfFieldEmpty: true`            | ✓ Include separator   | ✓ Include separator | ✗ Remove separator |

#### Example: Custom Format with `{separator}`

```javascript
const logger = new Logger({
  moduleName: 'OMH',
  separator: { separator: ' | ', keepSeparatorIfFieldEmpty: false },
  format: {
    error: '[{module}] {level}{separator}{timestamp}{separator}{message}',
  },
});

logger.error('Database connection failed');
// If timestamp is enabled: "[OMH] ERROR | 2025-11-03T10:45:23Z | Database connection failed"
// If timestamp is disabled: "[OMH] ERROR | Database connection failed"
```

#### When to Use `{separator}`

- **Use `{separator}`** when you want conditional separators based on field presence
- **Use hardcoded separators** for fixed formats (e.g., `'[{module}] {level} | {message}'`)
- The **default format templates** use hardcoded separators for predictable output

#### SeparatorConfig Type

```typescript
interface SeparatorConfig {
  separator: string; // String to use as separator (e.g., ' | ')
  keepSeparatorIfFieldEmpty?: boolean; // Include if one field is empty? (default: false)
}
```

---

## 4. **Colorization**

ANSI color codes are applied based on level when `colorize: true`:

| Level   | Color  |
| ------- | ------ |
| error   | Red    |
| warn    | Yellow |
| info    | Blue   |
| verbose | Cyan   |
| debug   | Gray   |

Colorization is **disabled in tests** via config to prevent brittle assertions.

---

## Key Internal Methods

| Method                             | Purpose                                                              |
| ---------------------------------- | -------------------------------------------------------------------- |
| `_log()`                           | Central router; evaluates overrides, threshold, and decides to emit  |
| `shouldLog()`                      | Determines if level passes threshold (respects debugMode)            |
| `mergeConfig()`                    | Shallow merges per-call overrides with base config                   |
| `formatMessage()`                  | Constructs formatted string with placeholders and color              |
| `applyPlaceholders()`              | Substitutes `{placeholder}` tokens in template                       |
| `emit()`                           | Routes to appropriate console method (error, warn, info, log, debug) |
| `serializeWithCircularDetection()` | Safely JSON-stringifies objects with cycle tracking                  |

---

## Immutability & Safety

The logger enforces **immutability** at several levels:

```javascript
// Constructor
Object.freeze(normalizedConfig); // Base config is frozen

// Per-call merges
Object.freeze(mergedConfig); // Merged config also frozen

// Mutation attempts fail silently (no errors thrown)
logger.baseConfig.level = 'debug'; // ✗ Fails silently
```

This prevents accidental mutation and keeps config predictable across calls.

---

## Usage Example: Complete Flow

```javascript
// 1. Create logger with base config
const logger = new Logger({
  moduleName: 'OMH',
  level: 'info',
  debugMode: false,
  colorize: true,
  timestamp: { enabled: true, format: 'iso' },
  format: {
    error: '[{module}] ❌ {message}',
    info: '[{module}] ℹ️  {message}',
  },
});

// 2. Standard logging
logger.info('Module initialized');
// Output: [OMH] ℹ️  Module initialized

// 2b. Using generic log() method (same as info())
logger.log('Module initialized');
// Output: [OMH] ℹ️  Module initialized

// 3. With metadata
logger.info('User action', {
  metadata: { action: 'login', userId: 42 },
});
// Output: [OMH] ℹ️  User action

// 4. With per-call override (enable debug temporarily)
logger.debug('Internal state check', {
  metadata: { cache: 'hit' },
  overrides: { debugMode: true },
});
// Output: [OMH] DEBUG | 2025-11-03T... | Internal state check | {"cache":"hit"}

// 5. Error handling
try {
  riskyOperation();
} catch (error) {
  logger.error('Operation failed', { metadata: error });
  // Output: [OMH] ❌ Error: operation failed
  //         (with full stack trace)
}

// 6. Using smart separators for conditional formatting
const loggerWithSeparators = new Logger({
  moduleName: 'OMH',
  level: 'info',
  separator: { separator: ' | ', keepSeparatorIfFieldEmpty: false },
  timestamp: { enabled: true, format: 'iso' },
  format: {
    // Separators only appear between non-empty adjacent fields
    error: '[{module}] {level}{separator}{timestamp}{separator}{message}',
    warn: '[{module}] {level}{separator}{timestamp}{separator}{message}',
    info: '[{module}]{separator}{message}', // No {level}, so first separator removed
  },
});

loggerWithSeparators.error('Critical error');
// Output: [OMH] ERROR | 2025-11-03T... | Critical error

loggerWithSeparators.info('User logged in');
// Output: [OMH] User logged in (separator removed since no {level})
```

---

This architecture makes the logger **flexible, testable, and safe** while maintaining strict control over output formatting and behavior.
