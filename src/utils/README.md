**Version**: 0.1.0

# Utils

This directory contains utility classes and functions that provide core functionality for module initialization, logging, hook formatting, and general utility operations. The utils are organized into specialized utilities for module lifecycle management and static utilities for data operations.

## Overview (Updated for Multi-Function Proxy Mapping)

The utils are organized into functional categories:

- **Module Lifecycle**: [`Initializer`](#initializer), [`Logger`](#logger)
- **Hook Management**: [`HookFormatter`](#hookformatter)
- **String Formatting**: [`StringFormatter`](#stringformatter)
- **Static Utilities**: [`StaticUtils`](#staticutils) (via `static.ts` entrypoint)

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

### 0.2.0 (2025-11-12)

- Added `hookFormatter` utility for module-scoped and parameterized hook name generation
- Added `stringFormatter` utility (re-exported from `static/`) for simple string formatting
- Updated documentation to reflect new hook and string formatting utilities

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial utils directory documentation
