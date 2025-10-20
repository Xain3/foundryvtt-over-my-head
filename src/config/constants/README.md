**Version**: 0.2.0

# Constants

This directory contains constant definitions and configuration files used by the Over My Head module at runtime.
These constants help manage settings, default values, and other fixed parameters that the module relies on
for consistent behavior.

## Constant Files

### errors.yaml

Configuration constants for error message formatting, including:

- `separator`: The separator used to join multiple error messages
- `pattern`: The pattern used to format error messages with template variables

### foundry.yaml

Configuration constants for Foundry VTT system integration, including:

- `defaults.i18nLocation`: Default path to the Foundry VTT i18n (internationalization) system
- `defaults.modulesLocation`: Default path to the Foundry VTT modules location

### hooks.yaml

Configuration constants for Foundry VTT hooks, including:

- `hooks.settingsReady`: Hook called when settings are ready
- `hooks.contextReady`: Hook called when context is ready (not planned for use currently)
- `hookPatterns.setting`: Base hook pattern for setting changes

### moduleManagement.yaml

Configuration constants for module management and identification, including:

- `referToModuleBy`: How to refer to the module in logs (title, id, name, or shortName)
- `deriveShortNameFromTitle`: Whether to automatically derive a short name from the module title
- `shortName`: Short name for the module (fallback value)

### occlusion.yaml

Configuration constants for occlusion handling in Foundry VTT, including:

- `occlusionHandler.triggeringEvents`: Events that trigger visibility refresh (visibilityRefresh, sightRefresh, refreshTile, refreshToken, refreshWall)

### placeables.yaml

Configuration constants for placeable objects in Foundry VTT, including:

- `placeables.token`: Token configuration (type, name, class, allowedCorners)
- `placeables.tile`: Tile configuration (type, name, class, allowedCorners)
- `positionChecker`: Configuration for position checking with check types, position uses, and method keys

## Changelog

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial constants directory documentation

### 0.2.0 (2025-11-05)

- Added comprehensive documentation for all constant files
