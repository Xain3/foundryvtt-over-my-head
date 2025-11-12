# Configs

**Status**: ✅ Complete
**Path**: `src/config/configs/`

## Overview

This directory contains YAML configuration files that define behavioral settings and dynamic parameters for the Vision with Fade module. Each YAML file is loaded as a separate namespace under `config.configs`.

Unlike the `constants/` directory which contains fixed values, the `configs/` directory contains settings that define how the module behaves and operates.

## Config Files

### logging.yaml

Configuration for logging and debugging output.

**Accessible via**: `config.configs.logging`

**Properties**:

- `logfiles.directory`: Directory for log files (e.g., `./.log`)
- `loggingLevels`: Numeric levels for each log level (error: 0, warn: 1, info: 2, verbose: 3, debug: 4)
- `console`: Console logging configuration
  - `defaultLevel`: Default logging level for console output
  - `format`: Format templates for each log level
  - `toConsole`: Whether to output to console
  - `timestamp`: Whether to include timestamps
  - `timestampFormat`: Format for timestamps
  - `colorize`: Which levels to colorize
- `file`: File logging configuration
- `json`: JSON logging configuration

**Example**:

```typescript
const logLevel = config.configs.logging.console.defaultLevel; // "info"
const logDir = config.configs.logging.logfiles.directory; // "./.log"
```

### moduleManagement.yaml

Configuration for module identification and management.

**Accessible via**: `config.configs.moduleManagement`

**Properties**:

- `referToModuleBy`: How to refer to the module in logs ('title', 'id', 'name', or 'shortName')
- `deriveShortNameFromTitle`: Whether to automatically derive short name from module title
- `excludeWordsFromShortName`: List of words to exclude when deriving short name
- `shortName`: Short name for the module (used for prefix, e.g., "OMH")

**Example**:

```typescript
const shortName = config.configs.moduleManagement.shortName; // "OMH"
const referBy = config.configs.moduleManagement.referToModuleBy; // "title"
```

### occlusion.yaml

Configuration for occlusion (vision hiding) handling in Foundry VTT.

**Accessible via**: `config.configs.occlusion`

**Properties**:

- `occlusionHandler.triggeringEvents`: Events that trigger visibility refresh
  - `visibilityRefresh`: Whether to trigger on visibility refresh
  - `sightRefresh`: Whether to trigger on sight refresh
  - `refreshTile`: Whether to trigger on tile refresh
  - `refreshToken`: Whether to trigger on token refresh
  - `refreshWall`: Whether to trigger on wall refresh

**Example**:

```typescript
const triggers = config.configs.occlusion.occlusionHandler.triggeringEvents;
if (triggers.visibilityRefresh) {
  // Handle visibility refresh event
}
```

### placeables.yaml

Configuration for placeable objects in Foundry VTT (tokens, tiles, walls, etc.).

**Accessible via**: `config.configs.placeables`

**Properties**:

- `placeables.token`: Token configuration
  - `type`: Type identifier ('token')
  - `name`: Display name ('Token')
  - `class`: Class name ('TokenDocument')
  - `allowedCorners`: Array of allowed corner positions
- `placeables.tile`: Tile configuration (similar structure)
- `positionChecker`: Configuration for position checking
  - `checkTypes`: Types of position checks (UNDER, OVER)
  - `positionUses`: Position usage types (CENTER, RECTANGLE)
  - `methodKeys`: Method key combinations

**Example**:

```typescript
const tokenConfig = config.configs.placeables.placeables.token;
console.log(tokenConfig.class); // "TokenDocument"
console.log(tokenConfig.allowedCorners); // ["top-left", "top-right", ...]
```

## How Configs Are Loaded

1. **Discovery**: `loadConfigFiles()` helper discovers all `.yaml` files in this directory
2. **Parsing**: Each file is parsed using the YAML parser
3. **Namespacing**: Each file stored under its name (without .yaml extension) as a top-level key
4. **Merging**: All namespaces combined into `config.configs` object
5. **Immutability**: The entire structure is frozen after loading

**Example**:

```typescript
// logging.yaml → config.configs.logging
// moduleManagement.yaml → config.configs.moduleManagement
// occlusion.yaml → config.configs.occlusion
// placeables.yaml → config.configs.placeables
```

## Adding New Configs

To add new configuration files:

1. **Create YAML file**: Add `src/config/configs/newconfig.yaml`
2. **Define structure**: Define your configuration in YAML format
3. **Update helper**: Add the filename to `REQUIRED_CONFIG_FILES` in `configHelpers.ts`
4. **Reference**: Access via `config.configs.newconfig`
5. **Reload**: Module reload required to load new file

**Example**:

```yaml
# src/config/configs/myfeature.yaml
# @file myfeature.yaml
# @description Configuration for my new feature
# @path src/config/configs/myfeature.yaml

myFeature:
  enabled: true
  timeout: 5000
  retries: 3
```

Access it:

```typescript
const featureConfig = config.configs.myfeature;
if (featureConfig.myFeature.enabled) {
  // Feature is enabled
}
```

## YAML Format

All configuration files use YAML format:

```yaml
# Comments are allowed
key1: value1
nested:
  key2: value2
  key3:
    - list
    - items
```

## Requirements

- **File format**: YAML (.yaml extension)
- **Valid YAML syntax**: Must parse without errors (fail-fast if invalid)
- **Encoding**: UTF-8
- **Structure**: Must be an object (or empty)
- **Header comment**: Each file should include `@file`, `@description`, and `@path` in comments

## Difference Between Constants and Configs

**Constants** (`src/config/constants/`):
- Fixed values that never change
- Core identifiers, patterns, and defaults
- Examples: error separators, hook names, Foundry paths

**Configs** (`src/config/configs/`):
- Behavioral settings that define how the module operates
- Dynamic parameters that could vary per environment
- Examples: logging levels, occlusion triggers, placeable settings

Both are immutable at runtime, but the distinction helps organize the codebase.

## Related Documentation

- [Config Module](../README.md) - Main config documentation
- [Constants](../constants/README.md) - Fixed value constants
- [Helpers](../helpers/README.md) - How configs are loaded
- [Data Model](../../specs/001-centralized-config-system/data-model.md) - Config structure

---

**Status**: Complete ✅
**Last Updated**: November 3, 2025
**Maintainer**: Vision with Fade Team

## Changelog

### 0.1.0 (2025-11-03)

- Initial configs directory created
- Separated behavioral configurations from fixed constants
- Added documentation for all config files
- Maintains backward compatibility through merged loading
