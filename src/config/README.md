<!-- Config Module Documentation -->

# Config Module

**Status**: ✅ Complete
**Path**: `src/config/`
**Entry Point**: `src/config/config.ts`

## Overview

The Config module provides centralized, immutable configuration management for the Vision with Fade module. It aggregates:

- **Constants** from YAML files in `src/config/constants/` (namespace-keyed)
- **Settings** from `src/config/settings/settings.yaml` (user-adjustable)
- **Module Manifest** from `module.json` (metadata)
- **Environment Variables** with the `OMH_*` prefix pattern

The singleton config is:

- **Lazy-loaded** on first import
- **Cached** via ESM module system
- **Immutable** via `Object.freeze()` (deep frozen)
- **Fail-fast** on any parsing errors during initialization

## Architecture

```
src/config/
├── config.ts               # Config singleton class (main entry point)
├── config-types.ts         # Type definitions for Config interface
├── README.md               # This file
├── helpers/
│   ├── configHelpers.ts   # Helper functions for loading/parsing
│   └── README.md           # Helpers documentation
├── constants/
│   ├── errors.yaml
│   ├── foundry.yaml
│   ├── hooks.yaml
│   ├── logging.yaml
│   ├── moduleManagement.yaml
│   ├── occlusion.yaml
│   ├── placeables.yaml
│   └── README.md
└── settings/
    ├── settings.yaml       # User-adjustable settings
    └── README.md
```

## Usage

### Import and Access

```typescript
import { config } from './config/config.ts';

// Access all configuration properties
console.log(config.module.id); // "vision-with-fade"
console.log(config.constants.errors); // { separator: " || ", ... }
console.log(config.settings); // Array of setting definitions
console.log(config.env); // Environment variables with OMH_ prefix
```

### Constants Structure

Each YAML file becomes a namespace under `config.constants`:

```typescript
config.constants.errors; // From errors.yaml
config.constants.foundry; // From foundry.yaml
config.constants.hooks; // From hooks.yaml
config.constants.logging; // From logging.yaml
config.constants.moduleManagement; // From moduleManagement.yaml
config.constants.occlusion; // From occlusion.yaml
config.constants.placeables; // From placeables.yaml
```

**Rationale**: Namespace-keyed merge prevents collisions between files and makes the source of each value obvious.

### Settings Access

Settings are loaded as an array from `settings.yaml`:

```typescript
// Find a specific setting
const debugSetting = config.settings.find((s) => s.key === 'debugMode');

// Iterate all settings
config.settings.forEach((setting) => {
  console.log(setting.key, setting.config.name);
});
```

### Module Manifest

Access module metadata from `module.json`:

```typescript
config.module.id; // "vision-with-fade"
config.module.title; // "Vision Occlusion Mode With Fade"
config.module.version; // "12.1.0"
config.module.compatibility; // { minimum: "12", verified: "12" }
```

### Environment Variables

Environment variables with `OMH_*` prefix are accessible:

```typescript
// All values are strings
const debugMode = config.env.OMH_DEBUG_MODE; // "true" or undefined
const maxTokens = config.env.OMH_MAX_TOKENS; // "100" or undefined

// Type conversion is caller's responsibility
const debugEnabled = debugMode === 'true';
const maxTokensNum = parseInt(maxTokens || '100', 10);
```

## Singleton Pattern

The config is a singleton: only one instance exists throughout the module lifetime.

```typescript
// Both imports reference the SAME instance
import { config as config1 } from './config/config.ts';
import { config as config2 } from './config/config.ts';

config1 === config2; // true
```

## Immutability

The config object is deeply frozen and wrapped in a Proxy to prevent accidental modifications. Mutation attempts are silently ignored and logged as warnings:

```typescript
// All mutation attempts are caught and logged
config.module.id = 'modified'; // Logs warning, value unchanged
config.newProperty = 'value'; // Logs warning, property not added
delete config.module.id; // Logs warning, property not deleted

// Nested objects are also frozen
config.constants.foundry.defaults.i18nLocation = 'modified'; // Logs warning, unchanged
```

**How it works**:

- Config is exported as a Proxy that intercepts mutation attempts
- All mutations are logged with `[OMH] Config is immutable. Ignored {operation}...` messages
- Nested objects use recursive Proxies for nested mutation protection
- No TypeErrors are thrown—mutations simply fail silently with warnings

**Rationale**: Ensures config consistency throughout the module lifetime and provides debugging information. If runtime config changes are needed, create a new object rather than mutating the frozen config.

## Error Handling

Config initialization fails fast on any errors:

- **Missing files** → Throw error with file path
- **Parse errors** → Throw error with YAML/JSON context
- **Invalid structure** → Throw error with details

Errors include the `[OMH]` prefix (customizable via `moduleManagement.yaml` `shortName`).

```typescript
// If any file fails to load/parse, this will throw:
try {
  import { config } from './config/config.ts';
} catch (error) {
  console.error('[OMH] CONFIG INITIALIZATION FAILED:', error.message);
}
```

## Mutation Logging

When immutability violations are attempted, the config logs detailed warnings:

```typescript
// Attempting to modify config.module.id
config.module.id = 'new-value';
// Logs: [OMH] Config is immutable. Ignored set on "module.id" (ignored value: "new-value")

// Attempting to add a new property
config.newProp = 'value';
// Logs: [OMH] Config is immutable. Ignored set on top-level property "newProp"

// Attempting to delete a property
delete config.module.id;
// Logs: [OMH] Config is immutable. Ignored delete on "module.id"
```

These logs help debug accidental mutation attempts during development.

## Helper Functions

Helper functions in `src/config/helpers/configHelpers.ts` are responsible for:

- **loadYamlFiles()** - Load and parse all YAML constant files from `src/config/constants/`
- **mergeConstants()** - Merge YAML files into namespace-keyed structure (no deep merge)
- **extractConfigPrefix()** - Extract `shortName` from module manifest (defaults to "OMH")
- **loadSettings()** - Load and normalize settings from `src/config/settings/settings.yaml`
- **loadModuleManifest()** - Load module manifest from `module.json`
- **loadEnvironmentVariables()** - Load environment variables matching the prefix pattern (e.g., `OMH_*`)

These helpers are exported individually for testing and are called by the Config constructor during initialization.

## Logging

The config module logs with the `[OMH]` prefix:

- `console.debug()` for internal state during initialization
- `console.info()` for major milestones
- `console.error()` for initialization failures

Example output:

```
[OMH] Config initialization started
[OMH] Loading YAML constant files...
[OMH] Loaded YAML constants with 7 namespaces
[OMH] Loading settings definitions...
[OMH] Loaded 8 setting definitions
[OMH] Loading environment variables with prefix "OMH_"...
[OMH] No environment variables set
[OMH] Applying deep freeze to prevent modifications...
[OMH] Config initialized successfully with immutable singleton
```

## Performance

- **First initialization**: <500ms (includes module parsing)
- **Subsequent accesses**: <1ms (ESM module cache)
- **Property access**: <0.1ms (direct object property lookup)
- **Memory**: Negligible (singleton pattern)

## Testing

Config is tested at multiple levels:

- **Unit tests** (`tests/unit/configHelpers.unit.test.mjs`) - Helper functions in isolation
- **Integration tests** (`tests/integration/config.int.test.mjs`) - Real project files
- **Performance tests** (`tests/performance/config.performance.test.mjs`) - Speed and immutability

Run tests:

```bash
npm test  # Run all tests
```

## Type Safety

TypeScript types are exported for type-safe access:

```typescript
import { config } from './config/config.ts';
import type { Config } from './config/config.ts';

// config is fully typed
const id: string = config.module.id as string;
const constants = config.constants as Record<string, Record<string, unknown>>;
const settings = config.settings as unknown[];
const env = config.env as Record<string, string>;
```

**Note**: Values are typed as `unknown` to allow flexibility. Type assertions may be needed for strict type checking.

## Configuration Customization

To customize the config:

1. **Add YAML constant file**: Create `src/config/constants/myfile.yaml` → loads as `config.constants.myfile` namespace
2. **Add setting**: Edit `src/config/settings/settings.yaml` (add to `settingsList` array) → loads in `config.settings` array
3. **Set environment variable**: Export `OMH_SETTING_NAME=value` in your environment → loads in `config.env.OMH_SETTING_NAME`
4. **Change prefix**: Edit `src/config/constants/moduleManagement.yaml` and set the `shortName` field → used for logging and environment variable prefix

**Important**: Config is loaded once on first import. Changes to files require module reload.

## Troubleshooting

### Config not initializing

- **Syntax errors in YAML**: Check for invalid YAML syntax in `src/config/constants/*.yaml`
- **Invalid JSON**: Ensure `module.json` is valid JSON and has required properties
- **Missing files**: Ensure all 7 constant YAML files exist and `settings.yaml` exists
- **Settings array issue**: If `settings.yaml` has nested structure, ensure `settingsList` key exists

### Mutations not being prevented

- Config is wrapped in a Proxy that silently ignores mutations
- Check console warnings for `[OMH] Config is immutable` messages
- TypeErrors are NOT thrown—mutations just fail silently

### Changes not taking effect

- Config is loaded once on first module import
- Reload the entire module to reinitialize (not typically done in production)
- Changes require a full application restart

### Environment variables not showing up

- Variables must have the prefix followed by underscore (e.g., `OMH_DEBUG_MODE`)
- Prefix matching is case-insensitive (both `OMH_` and `omh_` work)
- Variables are stored as strings; convert types as needed
- Check that `process.env` is available in your runtime environment

## Related Documentation

- [Data Model](../specs/001-centralized-config-system/data-model.md) - Entity definitions and structure
- [API Specification](../specs/001-centralized-config-system/config-api.md) - Full Config API and methods
- [Quickstart Guide](../specs/001-centralized-config-system/quickstart.md) - Quick setup and usage examples
- [Helper Functions](./helpers/README.md) - Detailed helper function documentation
- [Style Guide](../STYLE_GUIDE.md) - Code style and naming conventions

---

**Status**: Complete ✅
**Last Updated**: October 29, 2025
**Maintainer**: Vision with Fade Team

## Changelog

### 0.2.0 (2025-10-29)

**Major Changes**:

- Implemented Proxy-based immutability instead of simple Object.freeze for better mutation handling
- Added mutation logging with detailed warnings (`[OMH] Config is immutable...`)
- Mutations now fail silently without throwing TypeErrors in strict mode
- Improved nested object protection with recursive Proxy wrapping

**Features**:

- New `_createMutationSafeProxy()` method for defensive proxy creation
- New `_prepareSettings()` method to normalize settings arrays from YAML
- Enhanced `_logIgnoredMutation()` with safe JSON stringification
- Proxy wraps config instance to intercept top-level mutations
- Proper `this` binding for proxy getters accessing private fields

**Fixes**:

- Fixed settings loading to extract from `settingsList` key in YAML
- Fixed settings array initialization and deep-freeze
- Fixed module proxy to support property access and mutation blocking
- Fixed environment variables and constants deep-freezing

**Testing**:

- All 29 integration tests passing
- All 12 unit tests passing
- Added mutation logging validation tests
- Added immutability verification tests

**Documentation**:

- Updated README with Proxy-based immutability explanation
- Added Mutation Logging section with examples
- Clarified troubleshooting for TypeError prevention
- Fixed environment variable prefix matching documentation
- Updated type safety examples

### 0.1.0 (2025-10-20)

**Initial Release**:

- Config singleton with YAML constants loading
- Settings definitions from YAML
- Module manifest loading from module.json
- Environment variable support with prefix pattern
- Deep-freeze immutability
- Comprehensive error handling with fail-fast approach
- Full test coverage (unit, integration, performance)
- Complete documentation
