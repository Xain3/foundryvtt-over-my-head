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

The module source code is in the `src/` directory and gets bundled into `dist/main.mjs` using Vite. The bundled file resolves all ES module imports and JSON imports into a single file that works reliably in Foundry VTT environments.

### Configuration System

The module uses a centralized configuration system located in `src/config/`. Key changes in recent versions:

#### Config Centralization (v13.0.1-alpha1+)

- **Unified Access**: All configuration is now accessed through a single `config` instance
- **Global Constants Export**: Constants are exported globally via `config.exportConstants()` instead of the OverMyHead class
- **Enhanced Manifest**: Manifest objects now include backwards-compatible `shortName` property

**Migration Example**:
```javascript
// Old pattern (deprecated)
import OverMyHead from './overMyHead.mjs';
class MyModule extends OverMyHead {
  async init() {
    this.exportConstants(); // Old method
  }
}

// New pattern (recommended)

import config from './config/config.mjs';
class MyModule {
  async init() {
    config.exportConstants(); // New centralized method
  }
}
```

For detailed configuration documentation, see [`src/config/README.md`](src/config/README.md).

### Settings Type Normalization (Foundry v13.347)

The settings pipeline accepts multiple formats for the `config.type` field and normalizes them to Foundry-compatible constructors/classes at runtime:

- Primitives (case-insensitive): `boolean` → `Boolean`, `number`/`int`/`integer`/`float`/`double` → `Number`, `string` → `String`, `object` → `Object`, `array` → `Array`
- Foundry DataFields:
  - Dotted path: `foundry.data.fields.BooleanField`
  - Class name: `BooleanField`, `NumberField`, `StringField`, `ArrayField`, `ObjectField`, `SchemaField`
  - Prefix: `datafield:boolean` or `field:boolean`
- Foundry DataModels:
  - Prefix: `datamodel:` (falls back to `foundry.abstract.DataModel`)
  - With path: `datamodel:Your.Namespace.Model`

Notes:

- Normalization only replaces `config.type` when the resolved value is a function (constructor/DataField/DataModel). Unknown strings are left unchanged.
- This helps keep YAML readable while meeting Foundry v13’s requirement that `type` be a callable/class.

Example (`constants.yaml`):

```yaml
settings:
  settingsList:
    - key: "useModule"
      config:
        name: "..."
        hint: "..."
        scope: "world"
        config: true
        type: boolean        # normalized to Boolean
        default: true

    - key: "advancedFlag"
      config:
        name: "..."
        scope: "world"
        config: true
        type: datafield:boolean  # normalized to foundry.data.fields.BooleanField (if available)
        default: true
```


## Usage

Open the tile configuration. Select the overhead tab and set occlusion mode to Vision. A checkbox will appear to toggle also fade. Example of how to do this is shown bellow

![Roof Occlusion Vision And Fade](README-img/TileConfig.gif)

In the gif below, the roof is a red tile. When occlusion mode is set to vision, the roof tile still covers up the rooms on the map that the token cannot see. When you select the also fade checkbox, the roof tile will disappear showing the room underneath.

![Roof Occlusion Vision And Fade](README-img/VisionFade.gif)
