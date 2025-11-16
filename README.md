````markdown
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/gundancer)

**Version**: 0.1.0

# Roof Occlusion Vision And Fade

This Foundry Virtual Tabletop module allows for overhead tiles to have occlusion mode of "Vision" and "Fade".

## Installation

Module JSON:

```
https://github.com/Gundancer/foundryvtt-token-color-marker/releases/latest/download/module.json
```

## Usage

Open the tile configuration. Select the overhead tab and set occlusion mode to Vision. A checkbox will appear to toggle also fade. Example of how to do this is shown bellow

![Roof Occlusion Vision And Fade](README-img/TileConfig.gif)

In the gif below, the roof is a red tile. When occlusion mode is set to vision, the roof tile still covers up the rooms on the map that the token cannot see. When you select the also fade checkbox, the roof tile will disappear showing the room underneath.

![Roof Occlusion Vision And Fade](README-img/VisionFade.gif)

## Development

### Alias Configuration Centralization

This project uses a centralized alias configuration system to ensure consistency across all build tools and configuration files. All aliases are defined once in `alias.config.mjs` and automatically synchronized to:

- `tsconfig.json` (TypeScript paths)
- `package.json` (Node.js imports)
- `vite.config.mjs` (build tool)
- `vitest.config.mjs` (testing framework)

**Adding or modifying aliases:**

1. Edit `alias.config.mjs` to add/modify aliases
2. Run `npm run sync-aliases` to synchronize all configuration files
3. Validation tests will ensure aliases stay synchronized

**Available commands:**

- `npm run sync-aliases` - Synchronize aliases to all config files
- `npm run sync-aliases -- --dry-run` - Preview changes without modifying files
- `npm run sync-aliases -- --verbose` - Show detailed sync information

**Automated validation:**

- Pre-commit hook automatically validates alias synchronization before commits
- VS Code tasks available via command palette: "Tasks: Run Task" → "Sync Aliases"

**VS Code integration:**
Three tasks are available from the command palette (Ctrl+Shift+P → "Tasks: Run Task"):

- **Sync Aliases** - Synchronize aliases to all config files
- **Sync Aliases (Dry Run)** - Preview changes without modifying files
- **Validate Aliases** - Run validation tests to check synchronization

For more information, see [docs/alias-adapter-interface.md](docs/alias-adapter-interface.md).

## Changelog

### 0.2.0 (2025-11-16)

- Added configurable error formatter utility with module-aware prefixes
- Supports optional caller context and stack trace inclusion
- Configurable via `src/config/constants/errors.yaml` pattern/separator
- Full documentation in `docs/config-quickstart.md` and `docs/logger-reference.md`

### 0.1.0 (2025-10-20)

- Initial version with core module documentation and structure
- Initial release of the Roof Occlusion Vision And Fade module
- Added support for overhead tiles with "Vision" and "Fade" occlusion modes
- Implemented tile configuration interface for occlusion settings
````
