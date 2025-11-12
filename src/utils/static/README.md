**Version**: 0.2.0

# Static Utilities

This folder contains static utility classes that provide common functionality for data validation, object manipulation, configuration parsing, and other utility operations. All utilities are designed to be stateless and can be used throughout the application without instantiation (except where noted).

## Files

- `devModeParser.ts` - Development/debug mode status evaluation
- `devModeParser-types.ts` - Type definitions for DevModeParser (separate from implementation)
- `moduleNameResolver.ts` - Module display name resolution based on configuration strategies
- `moduleNameResolver-types.ts` - Type definitions for ModuleNameResolver (separate from implementation)
- `stringFormatter.ts` - Pure string formatting utility with prefix/suffix support
- `stringFormatter-types.ts` - Type definitions for stringFormatter (separate from implementation)

## Public API

**Import the StaticUtils class** from the centralized entrypoint (`src/utils/static.ts`):

```ts
// ✅ PREFERRED: Import StaticUtils class
import StaticUtils from '#/utils/static.ts';

// Use the aggregated utilities
const result = StaticUtils.DevModeParser.fromConfig(config);
const isDev = StaticUtils.DevModeParser.isDevMode(env, module, setting);
```

The `StaticUtils` class provides a stable, documented public API that shields consumers from internal folder structure changes.

## Available Utilities

### StringFormatter

`StringFormatter` provides simple string formatting with optional prefix and suffix support. Zero dependencies, pure utility function.

```ts
import StaticUtils from '#/utils/static.ts';

const result = StaticUtils.StringFormatter.formatString('world', {
  prefix: 'hello-',
  suffix: '!',
}); // 'hello-world!'
```

Use cases:

- CSS class name generation: `formatString('modal', { prefix: 'omh-', suffix: '--active' })` → `'omh-modal--active'`
- Log message prefixing: `formatString('Config loaded', { prefix: '[OMH] ' })` → `'[OMH] Config loaded'`
- File path construction: `formatString('config', { prefix: 'src/', suffix: '.yaml' })` → `'src/config.yaml'`

### DevModeParser

`DevModeParser` evaluates development and debug mode status using the default configuration hierarchy (`env > module > setting`).

```ts
import StaticUtils from '#/utils/static.ts';

const { devMode, debugMode } = StaticUtils.DevModeParser.fromConfig(config);
```

Use the static helpers directly when explicit values are available:

```ts
import StaticUtils from '#/utils/static.ts';

const devEnabled = StaticUtils.DevModeParser.isDevMode(
  envValue,
  moduleFlag,
  settingValue
);
const debugEnabled = StaticUtils.DevModeParser.isDebugMode(
  envValue,
  moduleFlag,
  settingValue
);

// Override the hierarchy (e.g., ignore environment variables in specific contexts)
const strictInGameDev = StaticUtils.DevModeParser.isDevMode(
  envValue,
  moduleFlag,
  settingValue,
  {
    hierarchy: ['setting', 'module'],
  }
);

const result = StaticUtils.DevModeParser.fromConfig(config, undefined, {
  hierarchy: ['module', 'env', 'setting'],
});
```

The parser only evaluates the sources included in the hierarchy array. When an array is omitted or empty, the default order (`env → module → setting`) is applied automatically.

## Changelog

### [0.3.0] - 2025-11-12

- Added `stringFormatter` utility for simple string formatting with prefix/suffix support
- Pure utility function with zero external dependencies
- Perfect for CSS class generation, log prefixing, and file path construction

### [0.2.0] - 2025-10-30

- Added centralized `StaticUtils` class in `src/utils/static.ts` as the main entrypoint
- `StaticUtils.DevModeParser` provides access to DevModeParser functionality
- Updated documentation to recommend importing from StaticUtils class
- Internal files should not be imported directly by external code

### [0.1.2] - 2025-10-30

- Added support for configurable evaluation hierarchy across all parser entry points
- Documented hierarchy override usage examples

### [0.1.1] - 2025-10-30

- Added `DevModeParser` static utility for mode detection
- Documented configuration hierarchy usage patterns

### [0.1.0] - 2025-10-20

- Initial release of static utilities
- Added utility classes for data validation and object manipulation
- Implemented stateless utility functions for common operations
