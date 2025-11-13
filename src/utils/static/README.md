**Version**: 0.4.0

# Static Utilities

This folder contains static utility classes that provide common functionality for data validation, object manipulation, configuration parsing, and other utility operations. All utilities are designed to be stateless and can be used throughout the application without instantiation (except where noted).

## Files

- `devModeParser.ts` - Development/debug mode status evaluation
- `devModeParser-types.ts` - Type definitions for DevModeParser (separate from implementation)
- `moduleNameResolver.ts` - Module display name resolution based on configuration strategies
- `moduleNameResolver-types.ts` - Type definitions for ModuleNameResolver (separate from implementation)
- `stringFormatter.ts` - Pure string formatting utility with prefix/suffix support
- `stringFormatter-types.ts` - Type definitions for stringFormatter (separate from implementation)
- `hookFormatter.ts` - FoundryVTT hook name formatter (module-scoped and parameterized)
- `hookFormatter-types.ts` - Type definitions for hookFormatter (separate from implementation)
- `foundryDataDirFinder.ts` - FoundryVTT data directory finder for cross-platform development
- `foundryDataDirFinder-types.ts` - Type definitions for foundryDataDirFinder (separate from implementation)

## Public API

**Import the StaticUtils class** from the centralized entrypoint (`src/utils/static.ts`):

```ts
// ✅ PREFERRED: Import StaticUtils class
import StaticUtils from '#/utils/static.ts';

// Use the aggregated utilities
const result = StaticUtils.DevModeParser.fromConfig(config);
const isDev = StaticUtils.DevModeParser.isDevMode(env, module, setting);
const hook = StaticUtils.formatHookName.format(
  'settingsReady',
  config.constants.hooks
);
const formatted = StaticUtils.formatString.format('world', {
  prefix: 'hello-',
});
```

The `StaticUtils` class provides a stable, documented public API that shields consumers from internal folder structure changes.

## Available Utilities

### StringFormatter

`formatString` provides simple string formatting with optional prefix and suffix support. Zero dependencies, pure utility function.

```ts
import StaticUtils from '#/utils/static.ts';

const result = StaticUtils.formatString.format('world', {
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

### HookFormatter

`formatHookName` generates FoundryVTT hook names using module metadata and parameterized patterns from `hooks.yaml`.

```ts
import StaticUtils from '#/utils/static.ts';
import { config } from '#/config/config.ts';

// Module-scoped hook (P2)
const readyHook = StaticUtils.formatHookName.format(
  'settingsReady',
  config.constants.hooks
); // 'OMH.SettingsReady'

// Parameterized hook (P3)
const settingHook = StaticUtils.formatHookName.format(
  'setting',
  { settingKey: 'debugMode' },
  config.constants.hooks
); // 'OMH.setting.debugMode'
```

Use cases:

- Emit namespaced Foundry hooks without repeating string literals
- Generate setting-specific hook channels (e.g., `OMH.setting.maxTokens`)
- Surface friendly error messages when configuration is incomplete

### FoundryDataDirFinder

`findFoundryDataDir` locates the FoundryVTT data directory across different platforms (Linux, macOS, Windows). This utility is designed for Node.js/development contexts such as build scripts and deployment tools.

```ts
import StaticUtils from '#/utils/static.ts';

// Simple usage - find with defaults
const result = StaticUtils.findFoundryDataDir.find();
if (result.found) {
  console.log(`Found Foundry at: ${result.path}`);
  console.log(`Checked paths:`, result.checkedPaths);
}

// Just get the path string
const path = StaticUtils.findFoundryDataDir.findPath();
if (path) {
  console.log(`Found at: ${path}`);
}

// Custom platform/user with verbose logging
const customResult = StaticUtils.findFoundryDataDir.find({
  platform: 'linux',
  user: 'developer',
  verbose: true,
});

// Get potential paths without checking
const paths = StaticUtils.findFoundryDataDir.getPaths({
  platform: 'win32',
  user: 'testuser',
});
```

**Important**: This utility is for development/deployment scripts only. In-browser FoundryVTT code should use `game.data.path` or `CONFIG.path` APIs instead.

Use cases:

- Build and deployment scripts that need to copy module files to Foundry
- Development tools that need to locate Foundry's data directory
- Testing utilities that need to verify Foundry installation paths
- Cross-platform module development workflows

## Changelog

### [0.5.0] - 2025-11-13

- Added `foundryDataDirFinder` utility for locating FoundryVTT data directory
- Supports Linux, macOS, and Windows platforms
- Provides three convenience methods: `find()`, `findPath()`, and `getPaths()`
- Designed for Node.js/development contexts (build scripts, deployment tools)
- Includes verbose logging option for debugging path resolution

### [0.4.0] - 2025-11-12

- Moved hook formatter implementation and types into the static utilities directory
- Updated `StaticUtils` aggregator to expose `formatHookName` and `formatString` consistently
- Documented hook formatter usage alongside existing static utilities

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
