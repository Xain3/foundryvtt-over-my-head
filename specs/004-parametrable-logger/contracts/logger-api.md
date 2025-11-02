# Logger API Contract

**Feature**: 004-parametrable-logger
**Date**: 2025-11-02

## Overview

This document defines the public API contract for the Logger class and related utilities. All signatures are expressed in TypeScript for precision, with JSDoc equivalents for plain JavaScript usage.

---

## Logger Class

### Constructor

**Signature**:

```typescript
constructor(config: LogConfigurationObject)
```

**Parameters**:

| Name     | Type                     | Required | Description                                          |
| -------- | ------------------------ | -------- | ---------------------------------------------------- |
| `config` | `LogConfigurationObject` | Yes      | Pre-parsed configuration object with logger settings |

**Throws**:

- `Error` if `config.moduleName` is missing or not a string

**Example**:

```typescript
import { Logger } from '#/utils/logger.ts';

const logger = new Logger({
  moduleName: 'OMH',
  level: 'info',
  colorize: true,
  timestamp: { enabled: true, format: 'iso' },
});
```

---

### Public Methods

All log methods share the same signature pattern.

#### `error(message, metadata?)`

**Signature**:

```typescript
error(message: string, metadata?: unknown): void
```

**Parameters**:

| Name       | Type      | Required | Description                          |
| ---------- | --------- | -------- | ------------------------------------ |
| `message`  | `string`  | Yes      | Log message content                  |
| `metadata` | `unknown` | No       | Optional metadata object for context |

**Behavior**:

- Outputs message with ERROR level formatting
- Always outputs (level 0, highest priority)
- Colorized in red if `colorize: true`
- Includes timestamp if `timestamp.enabled: true`

**Example**:

```typescript
logger.error('Database connection failed', { host: 'localhost', port: 5432 });
// Output: [OMH] ERROR | 2025-11-02T14:30:45.123Z | Database connection failed
```

---

#### `warn(message, metadata?)`

**Signature**:

```typescript
warn(message: string, metadata?: unknown): void
```

**Parameters**: Same as `error()`

**Behavior**:

- Outputs message with WARN level formatting
- Outputs if threshold is 'warn' or higher
- Colorized in yellow if `colorize: true`

**Example**:

```typescript
logger.warn('API rate limit approaching', { remaining: 10 });
// Output: [OMH] WARN | 2025-11-02T14:30:45.123Z | API rate limit approaching
```

---

#### `info(message, metadata?)`

**Signature**:

```typescript
info(message: string, metadata?: unknown): void
```

**Parameters**: Same as `error()`

**Behavior**:

- Outputs message with INFO level formatting (default level)
- Outputs if threshold is 'info' or higher
- Colorized in blue if `colorize: true`

**Example**:

```typescript
logger.info('User logged in', { userId: 123 });
// Output: [OMH] User logged in
```

---

#### `verbose(message, metadata?)`

**Signature**:

```typescript
verbose(message: string, metadata?: unknown): void
```

**Parameters**: Same as `error()`

**Behavior**:

- Outputs message with VERBOSE level formatting
- Outputs if threshold is 'verbose' or higher, OR if `debugMode: true`
- Colorized in cyan if `colorize: true`

**Example**:

```typescript
logger.verbose('Cache miss, fetching from database');
// Output: [OMH] VERBOSE | Cache miss, fetching from database
```

---

#### `debug(message, metadata?)`

**Signature**:

```typescript
debug(message: string, metadata?: unknown): void
```

**Parameters**: Same as `error()`

**Behavior**:

- Outputs message with DEBUG level formatting
- Outputs ONLY if threshold is 'debug' OR if `debugMode: true`
- Colorized in gray if `colorize: true`
- Typically includes full metadata serialization

**Example**:

```typescript
logger.debug('Request headers', { headers: { 'User-Agent': 'Chrome' } });
// Output: [OMH] DEBUG | 2025-11-02T14:30:45.123Z | Request headers | {"headers":{"User-Agent":"Chrome"}}
```

---

## Module Name Resolver

### Static Function: `resolveModuleName()`

**Signature**:

```typescript
function resolveModuleName(config: ConfigObject): string;
```

**Parameters**:

| Name     | Type           | Required | Description                                                        |
| -------- | -------------- | -------- | ------------------------------------------------------------------ |
| `config` | `ConfigObject` | Yes      | Full config object with `moduleManagement` and `module` properties |

**Returns**: Resolved module name as string

**Behavior**:

- Reads `config.moduleManagement.referToModuleBy` strategy
- Returns corresponding property from `config.module`:
  - `'id'` → `config.module.id`
  - `'title'` → `config.module.title`
  - `'shortName'` → `config.module.shortName` (fallback to `id` if missing)
- Defaults to `'id'` strategy if invalid value provided
- Logs warning if unrecognized strategy encountered

**Example**:

```typescript
import { resolveModuleName } from '#/utils/static/moduleNameResolver.ts';
import { config } from '#/config/config.ts';

const moduleName = resolveModuleName(config);
// Returns: "OMH" if referToModuleBy is 'shortName' and config.module.shortName is "OMH"
```

---

## Configuration Object Contract

### LogConfigurationObject

**Type**:

```typescript
interface LogConfigurationObject {
  moduleName: string;
  level: LogLevel;
  debugMode?: boolean;
  colorize?: boolean;
  timestamp?: TimestampConfig;
  format?: FormatTemplates;
}
```

**Required Fields**:

| Field        | Type       | Description                      |
| ------------ | ---------- | -------------------------------- |
| `moduleName` | `string`   | Resolved module name (non-empty) |
| `level`      | `LogLevel` | Base log level threshold         |

**Optional Fields** (with defaults):

| Field       | Type              | Default                            | Description                       |
| ----------- | ----------------- | ---------------------------------- | --------------------------------- |
| `debugMode` | `boolean`         | `false`                            | Override level to 'debug' if true |
| `colorize`  | `boolean`         | `true`                             | Enable ANSI color output          |
| `timestamp` | `TimestampConfig` | `{ enabled: true, format: 'iso' }` | Timestamp settings                |
| `format`    | `FormatTemplates` | Default templates                  | Custom format strings per level   |

---

### TimestampConfig

**Type**:

```typescript
interface TimestampConfig {
  enabled: boolean;
  format: 'iso' | 'locale';
}
```

**Fields**:

| Field     | Type                | Description                             |
| --------- | ------------------- | --------------------------------------- |
| `enabled` | `boolean`           | Whether to include timestamps in output |
| `format`  | `'iso' \| 'locale'` | Timestamp format style                  |

---

### FormatTemplates

**Type**:

```typescript
interface FormatTemplates {
  error?: string;
  warn?: string;
  info?: string;
  verbose?: string;
  debug?: string;
}
```

**Template Syntax**: `{placeholder}` for variable substitution; `{nested.key}` for nested access.

**Available Placeholders**:

| Placeholder      | Description              |
| ---------------- | ------------------------ |
| `{module}`       | Module name              |
| `{level}`        | Log level (uppercase)    |
| `{timestamp}`    | Formatted timestamp      |
| `{message}`      | User message             |
| `{metadata}`     | Stringified metadata     |
| `{metadata.key}` | Nested metadata property |

---

## Type Exports

### From `logger.ts`

```typescript
export type {
  LogLevel,
  LogConfigurationObject,
  TimestampConfig,
  FormatTemplates,
  LogContext,
};

export { Logger, LOG_LEVELS };
```

### From `moduleNameResolver.ts`

```typescript
export { resolveModuleName };
```

---

## Error Handling

### Constructor Errors

**Error**: `config.moduleName` missing or invalid

```typescript
throw new Error('[Logger] moduleName is required and must be a string');
```

**When**: Logger constructor called with invalid configuration

---

### Runtime Warnings

**Warning**: Invalid log level in config

```typescript
console.warn('[Logger] Invalid log level "xyz", defaulting to "info"');
```

**When**: `config.level` is not a recognized LogLevel value

---

**Warning**: Unrecognized referToModuleBy strategy

```typescript
console.warn('[Logger] Unknown referToModuleBy strategy: xyz, using "id"');
```

**When**: `resolveModuleName()` encounters invalid strategy

---

## Behavioral Guarantees

### Immutability

- Logger configuration is frozen at construction
- Configuration changes require new Logger instance
- No side effects on passed configuration object (shallow copy internally)

### Thread Safety

- Logger is stateless per call; no shared mutable state
- Safe for concurrent use in async contexts

### Output Consistency

- Format placeholders substituted 100% consistently
- Missing placeholders left as-is (no errors thrown)
- Circular references in metadata handled gracefully

### Performance

- Level filtering is O(1) (integer comparison)
- No-op if message below threshold (early exit)
- Timestamp generation lazy (only if enabled)

---

## Usage Examples

### Basic Usage

```typescript
import { Logger } from '#/utils/logger.ts';

const logger = new Logger({
  moduleName: 'OMH',
  level: 'info',
});

logger.info('Application started');
logger.debug('This will not appear (below threshold)');
```

---

### With Debug Mode

```typescript
const logger = new Logger({
  moduleName: 'OMH',
  level: 'info',
  debugMode: true, // Overrides level to 'debug'
});

logger.debug('This WILL appear (debug mode enabled)');
```

---

### With Custom Formats

```typescript
const logger = new Logger({
  moduleName: 'OMH',
  level: 'info',
  format: {
    info: '{module} >> {message}',
    error: '🔴 [{module}] {message}',
  },
});

logger.info('Custom format');
// Output: OMH >> Custom format
```

---

### With Metadata

```typescript
logger.error('Payment failed', {
  userId: 123,
  amount: 99.99,
  reason: 'Insufficient funds',
});
// Output: [OMH] ERROR | 2025-11-02T14:30:45.123Z | Payment failed
// (Metadata available in {metadata} placeholder)
```

---

## Summary

Complete API contract defined for:

- **Logger class**: 5 public methods (error, warn, info, verbose, debug) with consistent signature
- **Module name resolver**: Static utility `resolveModuleName()` for name derivation
- **Configuration interfaces**: Fully typed with validation rules and defaults
- **Error handling**: Clear error messages and warning patterns
- **Behavioral guarantees**: Immutability, thread safety, performance, consistency

All contracts ready for implementation and testing.
