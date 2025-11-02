# Quickstart: Parametrable Logger Module

**Feature**: 004-parametrable-logger
**For**: Developers implementing or using the logger
**Time to read**: 5 minutes

---

## Overview

The parametrable logger module provides a flexible, configuration-driven logging system with support for multiple log levels, custom formatting, and debug mode integration. This quickstart gets you from zero to logging in under 5 minutes.

---

## Quick Setup (3 Steps)

### 1. Install Dependencies

```bash
npm install chalk@^5.3.0
```

### 2. Create Logger Instance

```javascript
import { Logger } from '#/utils/logger.ts';

const logger = new Logger({
  moduleName: 'OMH',
  level: 'info',
});
```

### 3. Start Logging

```javascript
logger.info('Application started');
logger.warn('Low disk space', { available: '500MB' });
logger.error('Connection failed', { host: 'localhost' });
```

**Done!** You're now logging with consistent formatting.

---

## Common Patterns

### Pattern 1: Using with Config Singleton

**Recommended for production code**

```javascript
import { Logger } from '#/utils/logger.ts';
import { resolveModuleName } from '#/utils/static/moduleNameResolver.ts';
import { config } from '#/config/config.ts';

// Resolve module name once
const moduleName = resolveModuleName(config);

// Create logger with config
const logger = new Logger({
  ...config.logging,
  moduleName,
});

// Use logger throughout application
logger.info('User logged in', { userId: 123 });
logger.debug('Session token refreshed');
```

**Why**: Centralized configuration; single source of truth; easy to update settings.

---

### Pattern 2: Debug Mode Toggle

**For troubleshooting without code changes**

```javascript
const logger = new Logger({
  moduleName: 'OMH',
  level: 'info',
  debugMode: config.settings.debugMode, // Reads from FoundryVTT settings
});

// When debugMode = false:
logger.debug('This will NOT appear');

// When debugMode = true:
logger.debug('This WILL appear');

// Verbose messages are gated the same way
logger.verbose('Only visible when debugMode is true');
```

**Why**: Enable verbose logging in production by toggling setting; no redeployment needed.

> ⚠️ Debug and verbose entries are always suppressed while `debugMode` is `false`, even if `level` is set to `'debug'`. Toggle `debugMode` to `true` whenever temporary deep diagnostics are required.

---

### Pattern 3: Custom Format Templates

**For specialized logging contexts**

```javascript
const performanceLogger = new Logger({
  moduleName: 'OMH',
  level: 'info',
  format: {
    info: '[⚡ PERF] {message} ({metadata.duration}ms)',
    debug: '[⚡ PERF] {timestamp} | {message}',
  },
});

performanceLogger.info('Render complete', { duration: 42 });
// Output: [⚡ PERF] Render complete (42ms)
```

**Why**: Domain-specific formatting; easier to filter logs by context.

---

### Pattern 4: Instance Overrides

**For feature-specific loggers**

```javascript
// Base configuration from config.ts
const baseConfig = {
  moduleName: 'OMH',
  level: 'info',
  colorize: true,
};

// Override for security logging
const securityLogger = new Logger({
  ...baseConfig,
  level: 'warn', // Only warn and error for security events
  format: {
    warn: '🔒 [{module}] SECURITY WARNING: {message}',
    error: '🔒 [{module}] SECURITY ALERT: {message}',
  },
});

securityLogger.warn('Failed login attempt', {
  username: 'admin',
  ip: '192.168.1.1',
});
// Output: 🔒 [OMH] SECURITY WARNING: Failed login attempt
```

**Why**: Specialized loggers without duplicating base configuration.

---

## Configuration Reference

### Minimal Configuration

```javascript
{
  moduleName: 'OMH',  // Required
  level: 'info',      // Required
}
```

### Full Configuration (with defaults shown)

```javascript
{
  moduleName: 'OMH',                // Required: Module name
  level: 'info',                    // Required: error|warn|info|verbose|debug
  debugMode: false,                 // Override level to 'debug'
  colorize: true,                   // Enable ANSI colors
  timestamp: {
    enabled: true,                  // Include timestamps
    format: 'iso',                  // 'iso' or 'locale'
  },
  format: {
    error: '[{module}] ERROR | {timestamp} | {message}',
    warn: '[{module}] WARN | {timestamp} | {message}',
    info: '[{module}] {message}',
    verbose: '[{module}] VERBOSE | {message}',
    debug: '[{module}] DEBUG | {timestamp} | {message}',
  },
}
```

---

## Log Levels Hierarchy

| Level     | Priority    | When to Use                                     |
| --------- | ----------- | ----------------------------------------------- |
| `error`   | 0 (highest) | Critical failures requiring immediate attention |
| `warn`    | 1           | Potential issues that don't block operation     |
| `info`    | 2           | Normal application events (default level)       |
| `verbose` | 3           | Detailed operational information                |
| `debug`   | 4 (lowest)  | Development/troubleshooting details             |

**Filtering Rule**: Message appears if `messageLevel <= threshold`.

**Example**:

```javascript
// level: 'warn' → Only error and warn appear
logger.error('❌ Appears');
logger.warn('⚠️ Appears');
logger.info('🚫 Hidden');
logger.debug('🚫 Hidden');
```

---

## Placeholder Reference

### Available in All Templates

| Placeholder   | Example Output             | Description                   |
| ------------- | -------------------------- | ----------------------------- |
| `{module}`    | `OMH`                      | Module name from config       |
| `{level}`     | `INFO`                     | Current log level (uppercase) |
| `{timestamp}` | `2025-11-02T14:30:45.123Z` | Formatted timestamp           |
| `{message}`   | `User logged in`           | User-provided message         |
| `{metadata}`  | `{"userId":123}`           | Stringified metadata object   |

### Nested Access

```javascript
logger.info('User action', { user: { id: 123, name: 'Alice' } });

// Template: '{message} by {metadata.user.name}'
// Output: 'User action by Alice'
```

---

## Troubleshooting

### Issue: Debug messages not appearing

**Solution**: Check log level or enable debug mode:

```javascript
// Option 1: Set level to 'debug'
const logger = new Logger({ moduleName: 'OMH', level: 'debug' });

// Option 2: Enable debug mode (overrides level)
const logger = new Logger({
  moduleName: 'OMH',
  level: 'info',
  debugMode: true,
});
```

---

### Issue: Colors not showing in output

**Solution**: Colors auto-disable in non-TTY contexts (e.g., file redirection). Force enable:

```javascript
const logger = new Logger({
  moduleName: 'OMH',
  level: 'info',
  colorize: true, // Explicitly enable (but won't work in non-TTY)
});
```

Or check if output is redirected:

```bash
# Colors appear here:
node app.js

# Colors hidden here:
node app.js > output.log
```

---

### Issue: Placeholder not substituting

**Reason**: Placeholder key missing from context or typo in template.

**Solution**: Check spelling and ensure metadata contains the key:

```javascript
// Template: '{message} ({metadata.userId})'
logger.info('Action', { userId: 123 }); // ✅ Works
logger.info('Action', { id: 123 }); // ❌ {metadata.userId} stays literal
```

---

### Issue: Error "moduleName is required"

**Solution**: Ensure `moduleName` is provided and non-empty:

```javascript
// ❌ Missing moduleName
const logger = new Logger({ level: 'info' });

// ✅ Correct
const logger = new Logger({ moduleName: 'OMH', level: 'info' });
```

---

## Testing Patterns

### Unit Test Example

```javascript
import { describe, it, expect, vi } from 'vitest';
import { Logger } from '#/utils/logger.ts';

describe('Logger', () => {
  it('should filter messages below threshold', () => {
    const consoleSpy = vi.spyOn(console, 'log');

    const logger = new Logger({ moduleName: 'TEST', level: 'warn' });
    logger.info('This should not appear');
    logger.warn('This should appear');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('WARN'));
  });
});
```

### Integration Test Example

```javascript
import { describe, it, expect } from 'vitest';
import { Logger } from '#/utils/logger.ts';
import { config } from '#/config/config.ts';

describe('Logger Integration', () => {
  it('should work with config settings', () => {
    const logger = new Logger({
      ...config.logging,
      moduleName: config.module.shortName,
    });

    expect(logger).toBeInstanceOf(Logger);
    expect(logger.config.moduleName).toBe(config.module.shortName);
  });
});
```

---

## Performance Tips

### Tip 1: Use Appropriate Log Levels

**Avoid**: Debug logging in hot paths with low threshold:

```javascript
// ❌ Bad: Debug message created even if filtered
for (let i = 0; i < 10000; i++) {
  logger.debug(`Processing item ${i}`); // String constructed even if not logged
}
```

**Prefer**: Guard expensive logging:

```javascript
// ✅ Better: Check if debug enabled before expensive operation
if (logger.threshold >= LOG_LEVELS.debug) {
  for (let i = 0; i < 10000; i++) {
    logger.debug(`Processing item ${i}`);
  }
}
```

---

### Tip 2: Avoid Complex Metadata Serialization

**Avoid**: Large object graphs in metadata:

```javascript
// ❌ Expensive: Entire object serialized
logger.debug('State', { hugeObject: veryLargeDataStructure });
```

**Prefer**: Log only relevant fields:

```javascript
// ✅ Efficient: Extract key fields
logger.debug('State', {
  itemCount: veryLargeDataStructure.items.length,
  status: veryLargeDataStructure.status,
});
```

---

## Next Steps

1. **Read full spec**: See [spec.md](./spec.md) for detailed requirements
2. **Review data model**: See [data-model.md](./data-model.md) for type definitions
3. **Check API contract**: See [contracts/logger-api.md](./contracts/logger-api.md) for complete API
4. **Run tests**: `npm test -- logger` after implementation

---

## Summary

**Core Concepts**:

- Logger accepts configuration object (no file I/O)
- 5 log levels with numeric hierarchy
- Template-based formatting with `{placeholder}` syntax
- Debug mode overrides level to enable verbose output
- Direct instantiation with Logger class for flexible usage

**Common Gotchas**:

- Module name is required field
- Debug messages need `level: 'debug'` OR `debugMode: true`
- Colors auto-disable in non-TTY output
- Missing placeholders stay literal (no errors thrown)

**Performance**:

- <1ms per log call
- Early exit if below threshold (no formatting)
- No memory leaks (stateless)

Ready to implement! See [tasks.md](./tasks.md) for implementation checklist (generated by `/speckit.tasks`).
