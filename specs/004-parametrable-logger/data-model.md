# Data Model: Parametrable Logger Module

**Feature**: 004-parametrable-logger
**Date**: 2025-11-02

## Overview

This document defines the data structures, interfaces, and relationships for the parametrable logger module. All entities are designed for TypeScript with JSDoc for plain JavaScript compatibility.

---

## Core Entities

### 1. LogLevel

**Type**: Enum (string literal union)

**Description**: Enumeration of supported log severity levels with numeric hierarchy.

**Values**:

```typescript
type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
};
```

**Hierarchy**: Lower numeric value = higher priority. Filtering logic: emit message if `LOG_LEVELS[messageLevel] <= LOG_LEVELS[threshold]`.

**Validation**:

- Default to `'info'` if invalid level provided
- Log warning if unrecognized level encountered

---

### 2. LogConfigurationObject

**Type**: Interface

**Description**: Configuration object passed to Logger constructor. Contains all runtime settings for logger behavior.

**Structure**:

```typescript
interface LogConfigurationObject {
  // Required fields
  moduleName: string; // Resolved module name (e.g., "OMH")
  level: LogLevel; // Threshold log level

  // Optional fields with defaults
  debugMode?: boolean; // Enable verbose/debug output (default: false)
  colorize?: boolean; // Enable ANSI color codes (default: true)
  timestamp?: TimestampConfig; // Timestamp settings
  format?: FormatTemplates; // Message format templates per level
}
```

**Field Details**:

| Field        | Type              | Required | Default   | Description                                  |
| ------------ | ----------------- | -------- | --------- | -------------------------------------------- |
| `moduleName` | `string`          | Yes      | N/A       | Resolved module name from moduleNameResolver |
| `level`      | `LogLevel`        | Yes      | N/A       | Base log level threshold                     |
| `debugMode`  | `boolean`         | No       | `false`   | If true, overrides level to 'debug'          |
| `colorize`   | `boolean`         | No       | `true`    | Enable color output                          |
| `timestamp`  | `TimestampConfig` | No       | See below | Timestamp configuration                      |
| `format`     | `FormatTemplates` | No       | See below | Format templates per level                   |

**Defaults** (applied if fields missing):

```typescript
const DEFAULT_CONFIG: Partial<LogConfigurationObject> = {
  debugMode: false,
  colorize: true,
  timestamp: { enabled: true, format: 'iso' },
  format: {
    error: '[{module}] ERROR | {timestamp} | {message}',
    warn: '[{module}] WARN | {timestamp} | {message}',
    info: '[{module}] {message}',
    verbose: '[{module}] VERBOSE | {message}',
    debug: '[{module}] DEBUG | {timestamp} | {message}',
  },
};
```

**Validation Rules**:

- `moduleName`: Non-empty string required
- `level`: Must be valid LogLevel; defaults to 'info' if invalid
- `colorize`: Auto-disabled if stdout is not a TTY

---

### 3. TimestampConfig

**Type**: Interface

**Description**: Configuration for timestamp inclusion and formatting.

**Structure**:

```typescript
interface TimestampConfig {
  enabled: boolean; // Include timestamp in output
  format: 'iso' | 'locale'; // Timestamp format style
}
```

**Field Details**:

| Field     | Type                | Required | Default | Description                   |
| --------- | ------------------- | -------- | ------- | ----------------------------- |
| `enabled` | `boolean`           | Yes      | `true`  | Whether to include timestamps |
| `format`  | `'iso' \| 'locale'` | Yes      | `'iso'` | Format style                  |

**Format Outputs**:

- `'iso'`: ISO 8601 UTC format (e.g., `2025-11-02T14:30:45.123Z`)
- `'locale'`: Localized format via `Date.toLocaleString()` (e.g., `11/2/2025, 2:30:45 PM`)

---

### 4. FormatTemplates

**Type**: Interface

**Description**: Message format template strings per log level. Uses `{placeholder}` syntax for variable substitution.

**Structure**:

```typescript
interface FormatTemplates {
  error?: string;
  warn?: string;
  info?: string;
  verbose?: string;
  debug?: string;
}
```

**Placeholder Syntax**: `{key}` or `{nested.key}` for nested property access.

**Available Placeholders**:

| Placeholder      | Type     | Description                 | Example                        |
| ---------------- | -------- | --------------------------- | ------------------------------ |
| `{module}`       | `string` | Module name from config     | `OMH`                          |
| `{level}`        | `string` | Log level (uppercase)       | `INFO`, `ERROR`                |
| `{timestamp}`    | `string` | Formatted timestamp         | `2025-11-02T14:30:45.123Z`     |
| `{message}`      | `string` | User-provided message       | `User logged in`               |
| `{metadata}`     | `string` | Stringified metadata object | `{"userId":123}`               |
| `{metadata.key}` | `any`    | Nested metadata property    | `123` (from `metadata.userId`) |

**Example Templates**:

```typescript
const customFormats: FormatTemplates = {
  error: '🔴 [{module}] {timestamp} | ERROR: {message}',
  info: '[{module}] {message}',
  debug: '[{module}] 🐛 {message} | {metadata}',
};
```

**Validation**:

- Missing placeholders are left as-is (e.g., `{unknownKey}` → `{unknownKey}`)
- Undefined template for a level falls back to default format

---

### 5. LogContext

**Type**: Interface

**Description**: Runtime context object used for placeholder substitution during message formatting.

**Structure**:

```typescript
interface LogContext {
  module: string; // Module name
  level: string; // Current log level (uppercase)
  timestamp: string; // Formatted timestamp
  message: string; // User message
  metadata?: unknown; // Optional metadata
}
```

**Field Details**:

| Field       | Type      | Required | Description                             |
| ----------- | --------- | -------- | --------------------------------------- |
| `module`    | `string`  | Yes      | Module name from config                 |
| `level`     | `string`  | Yes      | Uppercase log level (e.g., `INFO`)      |
| `timestamp` | `string`  | Yes      | Formatted timestamp (empty if disabled) |
| `message`   | `string`  | Yes      | User-provided message content           |
| `metadata`  | `unknown` | No       | User-provided metadata object           |

**Construction**: Logger builds LogContext object per log call before formatting.

---

### 6. Logger (Class)

**Type**: Class

**Description**: Main logger class responsible for formatting and outputting log messages.

**Constructor**:

```typescript
class Logger {
  constructor(config: LogConfigurationObject);
}
```

**Public Methods**:

```typescript
class Logger {
  error(message: string, metadata?: unknown): void;
  warn(message: string, metadata?: unknown): void;
  info(message: string, metadata?: unknown): void;
  verbose(message: string, metadata?: unknown): void;
  debug(message: string, metadata?: unknown): void;
}
```

**Private Fields**:

```typescript
class Logger {
  private config: LogConfigurationObject; // Merged configuration
  private threshold: number; // Numeric log level threshold
  private colors: Record<LogLevel, Function>; // Chalk color functions per level
}
```

**Private Methods**:

```typescript
class Logger {
  private _shouldLog(level: LogLevel): boolean;
  private _formatMessage(
    level: LogLevel,
    message: string,
    metadata?: unknown
  ): string;
  private _buildContext(
    level: LogLevel,
    message: string,
    metadata?: unknown
  ): LogContext;
  private _applyTemplate(template: string, context: LogContext): string;
  private _colorize(level: LogLevel, text: string): string;
  private _output(level: LogLevel, formattedMessage: string): void;
}
```

**State**: Logger is immutable after construction. Configuration changes require new Logger instance.

---

### 7. UtilsEntryPoint (Interface)

**Type**: Interface

**Description**: Public API surface for utils entry point providing access to utilities.

**Structure**:

```typescript
interface UtilsEntryPoint {
  logger: Logger; // Pre-configured logger instance
  // Future utilities added here
}
```

**Factory Function**:

```typescript
function createUtils(config: LogConfigurationObject): UtilsEntryPoint {
  return {
    logger: new Logger(config),
  };
}
```

**Usage Pattern**:

```typescript
import { createUtils } from '#/utils/utils.ts';
import { config } from '#/config/config.ts';

const utils = createUtils(config.logging);
utils.logger.info('Application started');
```

---

## Relationships

### Configuration Flow

```
config.ts (singleton)
  ↓ provides logging.yaml parsed config
moduleNameResolver.ts
  ↓ resolves moduleName from referToModuleBy
LogConfigurationObject (merged with defaults)
  ↓ passed to constructor
Logger instance
  ↓ accessed via
UtilsEntryPoint
  ↓ used by
Application code
```

### Override Hierarchy

```
DEFAULT_CONFIG (hardcoded defaults)
  ↓ shallow merge
config.logging (from config.ts / logging.yaml)
  ↓ shallow merge
instance overrides (passed to Logger constructor)
  ↓ results in
Final LogConfigurationObject (used by Logger)
```

**Merge Semantics**: Shallow merge at top level; `format` object replaces entirely if provided in overrides (no nested merge).

---

## Data Validation

### LogConfigurationObject Validation

**On Construction**:

```typescript
function validateConfig(config: LogConfigurationObject): void {
  // Required fields
  if (!config.moduleName || typeof config.moduleName !== 'string') {
    throw new Error('[Logger] moduleName is required and must be a string');
  }

  // Log level validation
  if (!LOG_LEVELS.hasOwnProperty(config.level)) {
    console.warn(
      `[Logger] Invalid log level "${config.level}", defaulting to "info"`
    );
    config.level = 'info';
  }

  // Type coercion for booleans
  if (config.debugMode !== undefined && typeof config.debugMode !== 'boolean') {
    config.debugMode = Boolean(config.debugMode);
  }

  if (config.colorize !== undefined && typeof config.colorize !== 'boolean') {
    config.colorize = Boolean(config.colorize);
  }
}
```

### Metadata Serialization

**Handling Non-String Messages**:

```typescript
function serializeMessage(message: unknown): string {
  if (typeof message === 'string') return message;
  if (message instanceof Error)
    return `${message.name}: ${message.message}\n${message.stack}`;
  if (typeof message === 'object') {
    try {
      return JSON.stringify(message, null, 2);
    } catch (err) {
      return '[Circular or non-serializable object]';
    }
  }
  return String(message);
}
```

---

## Performance Considerations

### Memory

- **Logger Instance**: ~1KB per instance (negligible)
- **Configuration Object**: <1KB (plain object with strings/booleans)
- **No Leaks**: No event listeners or timers; stateless after construction

### CPU

- **Log Call Overhead**: <1ms per call (placeholder substitution + string formatting)
- **Level Filtering**: O(1) integer comparison (no-op if below threshold)
- **Colorization**: Negligible (chalk is optimized)

### Optimization Strategies

1. **Early Exit**: Level filtering short-circuits before formatting
2. **Lazy Formatting**: Timestamp/context built only if message will be logged
3. **Cached Colors**: Chalk color functions pre-assigned per level

---

## Edge Cases

### Circular References in Metadata

**Problem**: `JSON.stringify()` throws on circular references.

**Solution**: Wrap in try-catch; fallback to `[Circular or non-serializable object]`.

### Missing Placeholders

**Problem**: Template contains `{unknownKey}` but context lacks the key.

**Solution**: Leave placeholder as-is (don't throw; graceful degradation).

### Non-TTY Output

**Problem**: ANSI codes clutter output when redirected to file.

**Solution**: Auto-disable colorization if `process.stdout.isTTY === false`.

### Invalid Log Level in Config

**Problem**: Config contains typo like `level: 'infoo'`.

**Solution**: Default to `'info'` and log warning (non-blocking).

---

## Type Exports

**Public API** (exported from `logger.ts`):

```typescript
export type {
  LogLevel,
  LogConfigurationObject,
  TimestampConfig,
  FormatTemplates,
};
export { Logger, LOG_LEVELS };
```

**Utils Entry Point** (exported from `utils.ts`):

```typescript
export type { UtilsEntryPoint };
export { createUtils };
```

**Module Name Resolver** (exported from `moduleNameResolver.ts`):

```typescript
export { resolveModuleName };
```

---

## Summary

All data entities defined with clear types, validation rules, and relationships. Key design decisions:

- **Immutable Logger**: Configuration frozen at instantiation; new instance required for changes
- **Shallow Merge**: Predictable override behavior; format section replaces entirely
- **Numeric Level Hierarchy**: O(1) filtering; clear precedence
- **Graceful Degradation**: Missing placeholders, circular refs, invalid levels handled without crashes
- **Type Safety**: Full TypeScript definitions with JSDoc fallback for plain JS

Ready for contract generation (Phase 1 continuation).
