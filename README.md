[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/gundancer)

# Roof Occlusion Vision And Fade
This Foundry Virtual Tabletop module allows for overhead tiles to have occlusion mode of "Vision" and "Fade".

## Installation

Module JSON:
```
https://github.com/Gundancer/foundryvtt-token-color-marker/releases/latest/download/module.json
```

## Development

This module uses Vite for bundling to resolve MIME type errors and improve performance. 

### Build Commands

- `npm run build` - Build the module for production
- `npm run dev` - Build the module in watch mode for development
- `npm test` - Run the test suite

### Build Process

The module source code is in the `src/` directory and gets bundled into `dist/main.js` using Vite. The bundled file resolves all ES module imports and JSON imports into a single file that works reliably in Foundry VTT environments.

### Configuration System

The module uses a centralized configuration system located in `src/config/`. Key changes in recent versions:

#### Config Centralization (v12.0.1-alpha1+)

- **Unified Access**: All configuration is now accessed through a single `config` instance
- **Global Constants Export**: Constants are exported globally via `config.exportConstants()` instead of the OverMyHead class
- **Enhanced Manifest**: Manifest objects now include backwards-compatible `shortName` property

**Migration Example**:
```javascript
// Old pattern (deprecated)
import OverMyHead from './overMyHead.js';
class MyModule extends OverMyHead {
  async init() {
    this.exportConstants(); // Old method
  }
}

// New pattern (recommended)
import config from './config/config.js';
class MyModule {
  async init() {
    config.exportConstants(); // New centralized method
  }
}
```

For detailed configuration documentation, see [`src/config/README.md`](src/config/README.md).

## Usage
Open the tile configuration. Select the overhead tab and set occlusion mode to Vision. A checkbox will appear to toggle also fade. Example of how to do this is shown bellow

![Roof Occlusion Vision And Fade](README-img/TileConfig.gif)

In the gif below, the roof is a red tile. When occlusion mode is set to vision, the roof tile still covers up the rooms on the map that the token cannot see. When you select the also fade checkbox, the roof tile will disappear showing the room underneath.

![Roof Occlusion Vision And Fade](README-img/VisionFade.gif)
