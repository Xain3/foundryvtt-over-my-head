**Version**: 0.2.0

# Utils

This directory contains utility classes and functions that provide core functionality for module initialization, logging, hook formatting, and general utility operations. The utils are organized into specialized utilities for module lifecycle management and static utilities for data operations.

## Overview

The utils are organized into functional categories:

- **Module Lifecycle**: [`Logger`](#logger)
- **Hook Management**: [`HookFormatter`](#hookformatter) (P2/P3)
- **String Formatting**: [`StringFormatter`](#stringformatter) (P1)
- **Static Utilities**: [`StaticUtils`](#staticutils) (via `static.ts` entrypoint)

---

## StringFormatter

Pure utility function for formatting strings with optional prefix/suffix. Zero dependencies, stateless, reusable across any context.

### Usage (P1)

```javascript
import { formatString } from '#/utils/static/stringFormatter.ts';

// Prefix only
formatString('world', { prefix: 'hello-' }); // 'hello-world'

// Suffix only
formatString('world', { suffix: '!' }); // 'world!'

// Both prefix and suffix
formatString('world', { prefix: 'hello-', suffix: '!' }); // 'hello-world!'

// No options (identity)
formatString('world'); // 'world'
```

### Type Definition

```typescript
interface FormatOptions {
  prefix?: string; // Optional prefix to prepend
  suffix?: string; // Optional suffix to append
}

function formatString(base: string, options?: FormatOptions): string;
```

### Tests

See [`tests/unit/stringFormatter.unit.test.mjs`](../../tests/unit/stringFormatter.unit.test.mjs) for comprehensive unit tests covering all use cases (6 tests, 100% coverage).

---

## HookFormatter

Generates Foundry hook names following the module's naming convention using hook definitions and patterns from `hooks.yaml`.

### Usage (P2 - Module-Scoped Hooks)

```javascript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#/config/config.ts';

// Format module-scoped hooks (from hooks.yaml)
formatHookName('settingsReady', config.constants.hooks); // 'OMH.SettingsReady'
formatHookName('contextReady', config.constants.hooks); // 'OMH.ContextReady'
```

### Tests

- **Unit Tests**: [`tests/unit/hookFormatter.unit.test.mjs`](../../tests/unit/hookFormatter.unit.test.mjs)
  - P2 simple hooks: 3 tests (settingsReady, contextReady, error case)
  - Error handling: 4 tests (missing config properties, custom separator)
  - Total: 7 tests, 100% P2 coverage

- **Integration Tests**: [`tests/integration/hookFormatter.int.test.mjs`](../../tests/integration/hookFormatter.int.test.mjs)
  - Real config integration: 4 tests
  - Verifies all hooks in config work correctly

## 📁 Folder Structure

### StaticUtils

The `StaticUtils` class provides centralized access to all static utility functionality through a single entrypoint at `src/utils/static.ts`.

```ts
import StaticUtils from '#/utils/static.ts';

// Access DevModeParser functionality
const result = StaticUtils.DevModeParser.fromConfig(config);
const isDev = StaticUtils.DevModeParser.isDevMode(env, module, setting);
```

This design provides:

- Single stable import path for all static utilities
- Clear public API boundaries
- Easy addition of new static utilities
- Protection from internal refactoring

### Files

- `static.ts` - Centralized entrypoint for all static utilities
- `static-types.ts` - Type definitions for static utilities (re-exported from submodules)
- `static/devModeParser.ts` - Development/debug mode status evaluation
- `static/devModeParser-types.ts` - Type definitions for DevModeParser
- `static/stringFormatter.ts` - Pure string formatting utility with prefix/suffix support
- `static/stringFormatter-types.ts` - Type definitions for stringFormatter
- `hookFormatter.ts` - Hook name formatter for module-scoped and parameterized hooks
- `hookFormatter-types.ts` - Type definitions for hookFormatter (separate from implementation)
- `logger.ts` - Configurable logger implementation
- `logger-types.ts` - Type definitions for Logger (separate from implementation)

## Changelog

### 0.2.0 (2025-11-12) - HookFormatter P2 Implementation

- Added `hookFormatter` utility for module-scoped hook name generation (P2)
  - Simple hook names: `formatHookName('settingsReady', config)` → `'OMH.SettingsReady'`
  - Config validation: Comprehensive error messages with available options
  - Integration: Works with real `config.constants.hooks` from hooks.yaml

- Added comprehensive unit tests for P2 (7 tests)
  - Simple hook formatting: settingsReady, contextReady
  - Error handling: missing config properties, custom separators
  - 100% code coverage for P2 implementation

- Added integration tests (4 tests) validating with real config
  - Verifies all hooks in hooks.yaml work correctly
  - Tests complete hook iteration and error conditions

- Updated documentation with P2 usage examples and test references
- Total tests passing: 480 (was 469, +11 P2 tests)

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial utils directory documentation
