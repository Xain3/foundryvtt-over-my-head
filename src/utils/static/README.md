**Version**: 0.2.0

# Static Utilities

This folder contains static utility classes that provide common functionality for data validation, object manipulation, configuration parsing, and other utility operations. All utilities are designed to be stateless and can be used throughout the application without instantiation (except where noted).

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
