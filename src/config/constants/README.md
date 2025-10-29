# Constants

**Status**: ✅ Complete
**Path**: `src/config/constants/`

## Overview

This directory contains YAML constant files that define fixed parameters and configuration values for the Vision with Fade module. Each YAML file is loaded as a separate namespace under `config.constants`.

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

### logging.yaml

Configuration constants for logging and debugging.

**Accessible via**: `config.constants.logging`

**Properties**: TBD - structure defined in logging.yaml

### moduleManagement.yaml

Configuration constants for module identification and management.

**Accessible via**: `config.constants.moduleManagement`

**Properties**:

- `referToModuleBy`: How to refer to the module in logs ('title', 'id', 'name', or 'shortName')
- `deriveShortNameFromTitle`: Whether to automatically derive short name from module title
- `excludeWordsFromShortName`: List of words to exclude when deriving short name
- `shortName`: Short name for the module (used for prefix, e.g., "OMH")

**Example**:

```typescript
const shortName = config.constants.moduleManagement.shortName; // "OMH"
const referBy = config.constants.moduleManagement.referToModuleBy; // "title"
```

### occlusion.yaml

Configuration constants for occlusion (vision hiding) handling in Foundry VTT.

**Accessible via**: `config.constants.occlusion`

**Properties**: Structure defined in occlusion.yaml (triggers, behavior, etc.)

**Example**:

```typescript
const occlusionConfig = config.constants.occlusion;
// Access specific occlusion settings as defined in the YAML
```

### placeables.yaml

Configuration constants for placeable objects in Foundry VTT (tokens, tiles, walls, etc.).

**Accessible via**: `config.constants.placeables`

**Properties**: Structure defined in placeables.yaml (token config, tile defaults, etc.)

**Example**:

```typescript
const placeablesConfig = config.constants.placeables;
// Access specific placeable settings as defined in the YAML
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
3. **Reference**: Access via `config.constants.newfile`
4. **Reload**: Module reload required to load new file

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

## Related Documentation

- [Config Module](../README.md) - Main config documentation
- [Helpers](../helpers/README.md) - How constants are loaded
- [Data Model](../../001-centralized-config-system/data-model.md) - Config structure

---

**Status**: Complete ✅
**Last Updated**: October 28, 2025

- `placeables.tile`: Tile configuration (type, name, class, allowedCorners)
- `positionChecker`: Configuration for position checking with check types, position uses, and method keys

## Changelog

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial constants directory documentation

### 0.2.0 (2025-11-05)

- Added comprehensive documentation for all constant files
