**Version**: 0.4.0

# Utils

This directory contains utility classes and functions that provide core functionality for module initialization, logging, hook formatting, and general utility operations. The utils are organized into specialized utilities for module lifecycle management and static utilities for data operations.

## Overview

The utils are organized into functional categories:

- **Module Lifecycle**: [`Logger`](#logger)
- **Hook Management**: [`HookFormatter`](#hookformatter) (P2/P3)
- **Error Handling**: [`ErrorFormatter`](#errorformatter) (P1–P4 in progress)
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
import { formatHookName } from '#/utils/static/hookFormatter.ts';
import { config } from '#/config/config.ts';

// Format module-scoped hooks (from hooks.yaml)
formatHookName('settingsReady', config.constants.hooks); // 'OMH.SettingsReady'
formatHookName('contextReady', config.constants.hooks); // 'OMH.ContextReady'
```

### Usage (P3 - Parameterized Hooks)

```javascript
import { formatHookName } from '#/utils/static/hookFormatter.ts';
import { config } from '#/config/config.ts';

// Format parameterized hooks with dynamic parameters
formatHookName('setting', { settingKey: 'debugMode' }, config.constants.hooks);
// 'OMH.setting.debugMode'

// Works with multiple parameters in patterns
formatHookName('setting', { settingKey: 'maxTokens' }, config.constants.hooks);
// 'OMH.setting.maxTokens'
```

### Tests

- **Unit Tests**: [`tests/unit/hookFormatter.unit.test.mjs`](../../tests/unit/hookFormatter.unit.test.mjs)
  - P2 simple hooks: 3 tests (settingsReady, contextReady, error case)
  - P3 parameterized hooks: 8 tests (setting pattern, missing params, extra params, unknown pattern)
  - Error handling: 4 tests (missing config properties, custom separator)
  - Total: 15 tests, 100% P2+P3 coverage

- **Integration Tests**: [`tests/integration/hookFormatter.int.test.mjs`](../../tests/integration/hookFormatter.int.test.mjs)
  - P2 real config integration: 4 tests
  - P3 real config patterns: 3 tests
  - Verifies all hooks and patterns work correctly with actual config
  - Total: 7 tests

## ErrorFormatter

Centralizes all module-aware error formatting rules, guaranteeing consistent prefixes, optional caller context, and stack trace handling across the module. The formatter is implemented in `src/utils/errorFormatter.ts` with helper utilities under `src/utils/helpers/errorFormatterHelpers.mts` and types in `src/utils/errorFormatter-types.ts`.

### Planned Responsibilities (P1–P4)

- Normalize any `Error | string` input and resolve the module name from the config singleton with documented fallbacks.
- Apply configurable templates (`{{module}}`, `{{caller}}`, `{{error}}`, `{{stack}}`) and separators sourced from `src/config/constants/errors.yaml`.
- Optionally insert caller labels with escaped braces and include stacks capped at 20 lines, persisting the full trace to a temp log file.
- Guarantee zero global side effects: no mutation of console methods, config objects, or shared singletons.
- Expose performance-safe behavior (<1 ms baseline) validated via dedicated unit, integration, and performance tests.

### Upcoming Documentation & Tests

- API samples will live in `docs/logger-reference.md` and `specs/006-error-formatter/quickstart.md` once implementation begins.
- Unit coverage by story-specific suites (basic, stack, caller, pattern), plus integration and performance harnesses to meet the ≥80% requirement.

## 📁 Folder Structure

### StaticUtils

The `StaticUtils` class provides centralized access to all static utility functionality through a single entrypoint at `src/utils/static.ts`.

```ts
import StaticUtils from '#/utils/static.ts';

// Access DevModeParser functionality
const result = StaticUtils.DevModeParser.fromConfig(config);
const isDev = StaticUtils.DevModeParser.isDevMode(env, module, setting);

// Access formatter utilities via StaticUtils aggregations
const prefixed = StaticUtils.formatString.format('world', { prefix: 'hello-' });
const hook = StaticUtils.formatHookName.format(
  'settingsReady',
  config.constants.hooks
);
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
- `static/hookFormatter.ts` - Hook name formatter for module-scoped and parameterized hooks
- `static/hookFormatter-types.ts` - Type definitions for hookFormatter (separate from implementation)
- `logger.ts` - Configurable logger implementation
- `logger-types.ts` - Type definitions for Logger (separate from implementation)

## Changelog

### 0.4.0 (2025-11-12) - HookFormatter relocated to Static utilities

- Moved hook formatter implementation and type definitions into `src/utils/static/`
- Updated `StaticUtils` aggregator documentation to highlight formatter accessors
- Refreshed usage examples to reference the new import paths

### 0.3.0 (2025-11-12) - HookFormatter P3 Implementation Complete

- Added parameterized hook name generation (P3)
  - Support for dynamic parameters: `formatHookName('setting', { settingKey: 'debugMode' }, config)` → `'OMH.setting.debugMode'`
  - Parameter validation: All required parameters must be provided
  - Extra parameters ignored: Unused parameters don't cause errors
  - Comprehensive error messages with available patterns listed

- Added 8 P3 unit tests
  - Parameterized hook formatting with single and multiple parameters
  - Missing required parameter error handling
  - Extra unused parameter handling
  - Unknown pattern key error handling
  - Multiple parameter placeholders in complex patterns
  - 100% P3 code coverage

- Added 3 P3 integration tests with real config
  - Parameterized setting hook with real config patterns
  - Multiple different setting keys
  - Pattern verification in config

- All 3 user stories (P1, P2, P3) now fully implemented and tested
- Total tests passing: 491 (was 480, +11 P3 tests)
- Cumulative coverage: P1 + P2 + P3 = 100% of all implemented functionality

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
