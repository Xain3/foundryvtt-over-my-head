**Version**: 0.1.0

# Static Utilities

This folder contains static utility classes that provide common functionality for data validation, object manipulation, configuration parsing, and other utility operations. All utilities are designed to be stateless and can be used throughout the application without instantiation (except where noted).

## Available Utilities

### DevModeParser

`DevModeParser` evaluates development and debug mode status using the default configuration hierarchy (`env > module > setting`).

```ts
import DevModeParser from './devModeParser.ts';

const { devMode, debugMode } = DevModeParser.fromConfig(config);
```

Use the static helpers directly when explicit values are available:

```ts
const devEnabled = DevModeParser.isDevMode(envValue, moduleFlag, settingValue);
const debugEnabled = DevModeParser.isDebugMode(
  envValue,
  moduleFlag,
  settingValue
);

// Override the hierarchy (e.g., ignore environment variables in specific contexts)
const strictInGameDev = DevModeParser.isDevMode(
  envValue,
  moduleFlag,
  settingValue,
  {
    hierarchy: ['setting', 'module'],
  }
);

const result = DevModeParser.fromConfig(config, undefined, {
  hierarchy: ['module', 'env', 'setting'],
});
```

The parser only evaluates the sources included in the hierarchy array. When an array is omitted or empty, the default order (`env → module → setting`) is applied automatically.

## Changelog

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
