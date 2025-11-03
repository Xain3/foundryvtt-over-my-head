# Constants

**Status**: ✅ Complete
**Path**: `src/config/constants/`

## Overview

This directory contains YAML constant files that define fixed, immutable values for the Vision with Fade module. Each YAML file is loaded as a separate namespace under `config.constants`.

Unlike the `configs/` directory which contains behavioral settings, the `constants/` directory contains values that are truly fixed and never change - such as separators, patterns, hook names, and default paths.

## Constant Files

### errors.yaml

Configuration constants for error message formatting.

**Accessible via**: `config.constants.errors`

**Properties**:

- `separator`: String separator used to join multiple error messages (e.g., " || ")
- `pattern`: Format pattern for error messages with template variables (e.g., "{{module}}{{error}}")

**Example**:

```typescript
const errors = ['Error 1', 'Error 2', 'Error 3'];
const separator = config.constants.errors.separator;
const combined = errors.join(separator); // "Error 1 || Error 2 || Error 3"
```

### foundry.yaml

Configuration constants for Foundry VTT system integration.

**Accessible via**: `config.constants.foundry`

**Properties**:

- `defaults.i18nLocation`: Default path to the Foundry VTT i18n (internationalization) system
- `defaults.modulesLocation`: Default path to the Foundry VTT modules location

**Example**:

```typescript
const i18nPath = config.constants.foundry.defaults.i18nLocation; // "game.i18n"
const modulesPath = config.constants.foundry.defaults.modulesLocation; // "game.modules"
```

### hooks.yaml

Configuration constants for Foundry VTT hooks.

**Accessible via**: `config.constants.hooks`

**Properties**:

- `hooks.settingsReady`: Hook called when settings are ready for use
- `hooks.contextReady`: Hook called when context is ready
- `hookPatterns.setting`: Base hook pattern for setting changes

**Example**:

```typescript
const settingsHook = config.constants.hooks.hooks.settingsReady; // "SettingsReady"
Hooks.on(settingsHook, () => {
  console.log('Settings are now ready');
});
```



## How Constants Are Loaded

1. **Discovery**: `loadYamlFiles()` helper discovers all `.yaml` files in this directory
2. **Parsing**: Each file is parsed using the YAML parser
3. **Namespacing**: Each file stored under its name (without .yaml extension) as a top-level key
4. **Merging**: All namespaces combined into `config.constants` object
5. **Immutability**: The entire structure is frozen after loading

**Example**:

```typescript
// errors.yaml → config.constants.errors
// foundry.yaml → config.constants.foundry
// hooks.yaml → config.constants.hooks
// ... etc
```

## Adding New Constants

To add new constants:

1. **Create YAML file**: Add `src/config/constants/newfile.yaml`
2. **Define structure**: Define your constants in YAML format
3. **Update helper**: Add the filename to `REQUIRED_CONSTANT_FILES` in `configHelpers.ts`
4. **Reference**: Access via `config.constants.newfile`
5. **Reload**: Module reload required to load new file

**Example**:

```yaml
# src/config/constants/myconfig.yaml
feature:
  enabled: true
  timeout: 5000
```

Access it:

```typescript
const timeout = config.constants.myconfig.feature.timeout; // 5000
```

## YAML Format

All constant files use YAML format:

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
- [Configs](../configs/README.md) - Behavioral configuration files
- [Helpers](../helpers/README.md) - How constants are loaded
- [Data Model](../../specs/001-centralized-config-system/data-model.md) - Config structure

---

**Status**: Complete ✅
**Last Updated**: November 3, 2025
**Maintainer**: Vision with Fade Team

## Changelog

### 0.3.0 (2025-11-03)

- Separated constants from configs for better organization
- Removed behavioral configuration files (moved to `configs/`)
- Now contains only fixed values: errors, foundry, hooks
- Added distinction documentation between constants and configs
- Updated related documentation

### 0.2.0 (2025-11-05)

- Added comprehensive documentation for all constant files

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial constants directory documentation
