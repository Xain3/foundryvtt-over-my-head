# Settings

**Status**: ✅ Complete  
**Path**: `src/config/settings/`

## Overview

This directory contains settings definitions for the Vision with Fade module. Settings are user-adjustable configuration options that can be changed in the FoundryVTT in-game settings UI.

## Files

### settings.yaml

Contains all setting definitions for the module in YAML format.

**Loaded as**: Array of setting definition objects in `config.settings`

**Format**:
```yaml
- key: settingKey
  config:
    name: 'i18n.key.for.name'
    hint: 'i18n.key.for.hint'
    scope: 'world' | 'user' | 'client'
    config: true | false    # Show in settings UI
    type: Boolean | String | Number | Object
    default: value
    choices: { key: 'i18n.key', ... }  # For dropdown/select
    requireReload: true | false        # Reload needed on change
    onChange: { sendHook: true, hookName: 'settingName' }
```

## Setting Properties

Each setting definition contains:

### Required Properties
- `key`: Unique identifier for the setting (used in code)
- `config.name`: Localization key for display name
- `config.hint`: Localization key for help text
- `config.scope`: 'world', 'user', or 'client' (FoundryVTT scope)
- `config.type`: Data type (Boolean, String, Number, Object, Array)
- `config.default`: Default value for the setting

### Optional Properties
- `config.config`: Whether to show in settings UI (default: true)
- `config.choices`: Dropdown options for String settings
- `config.requireReload`: Whether module reload needed on change
- `config.onChange`: Hook to fire on setting change
- `showOnlyIfFlag`: Conditions to show setting
- `dontShowIfFlag`: Conditions to hide setting

## Usage

### Accessing Settings

```typescript
import { config } from '../config/config.ts';

// Get all settings
const allSettings = config.settings;

// Find specific setting
const debugSetting = config.settings.find(s => s.key === 'debugMode');

// Iterate settings
config.settings.forEach(setting => {
  console.log(setting.key, setting.config.name);
});
```

### Registering Settings with FoundryVTT

```typescript
import { config } from '../config/config.ts';

// Register all user-visible settings
config.settings.forEach(setting => {
  if (setting.config) {  // Only if meant to be shown
    game.settings.register(config.module.id, setting.key, setting.config);
  }
});
```

### Reading Setting Values at Runtime

```typescript
// Get current value from FoundryVTT
const debugMode = game.settings.get(config.module.id, 'debugMode');

// With environment override
const debugEnv = config.env.OMH_DEBUG_MODE;
const debugModeActive = debugEnv !== undefined 
  ? debugEnv === 'true' 
  : debugMode;
```

## Adding New Settings

To add a new setting:

1. **Edit settings.yaml**: Add new entry with all required properties
2. **Update i18n**: Add localization keys in `lang/en.json`
3. **Register in code**: Use `game.settings.register()` with setting config
4. **Access in code**: Use `game.settings.get()` to read values

### Example: Add a "Feature X Enabled" Setting

1. Add to `src/config/settings/settings.yaml`:
```yaml
- key: enableFeatureX
  config:
    name: 'OMH.settings.enableFeatureX.name'
    hint: 'OMH.settings.enableFeatureX.hint'
    scope: 'world'
    config: true
    type: Boolean
    default: true
```

2. Add to `lang/en.json`:
```json
{
  "OMH.settings.enableFeatureX.name": "Enable Feature X",
  "OMH.settings.enableFeatureX.hint": "Enable advanced feature X functionality"
}
```

3. Register in code:
```typescript
import { config } from './config/config.ts';

const featureSetting = config.settings.find(s => s.key === 'enableFeatureX');
if (featureSetting && featureSetting.config) {
  game.settings.register(config.module.id, 'enableFeatureX', featureSetting.config);
}
```

4. Access at runtime:
```typescript
const enableFeatureX = game.settings.get(config.module.id, 'enableFeatureX');
```

## Setting Scopes

- **world**: Setting applies to entire world (shared by all players)
- **user**: Setting per user (each player has their own value)
- **client**: Setting per client browser (local to this browser)

## Change Hooks

Settings can trigger hooks when changed:

```yaml
onChange:
  sendHook: true
  hookName: 'mySettingChanged'
```

Listen for changes:
```typescript
Hooks.on('mySettingChanged', (newValue, oldValue) => {
  console.log(`Setting changed from ${oldValue} to ${newValue}`);
});
```

## Localization Keys

All setting names and hints use localization keys:

```
OMH.settings.{settingKey}.name
OMH.settings.{settingKey}.hint
```

Localization strings are defined in `lang/en.json` (and other language files).

## Environment Variable Overrides

Settings can be overridden via environment variables:

```bash
export OMH_DEBUG_MODE=true
export OMH_BEHAVIOR_TOKENS=onlyActive
```

Access via:
```typescript
const envOverride = config.env.OMH_DEBUG_MODE;
```

**Note**: Environment variables are strings; caller must convert types.

## Validation

Settings are validated when:
1. **Loaded**: YAML syntax checked
2. **Registered**: FoundryVTT validates against setting config
3. **Set**: FoundryVTT validates value matches type

## Best Practices

1. **Keep keys simple**: Use camelCase (e.g., `enableFeatureX`)
2. **Use i18n keys**: Never hardcode display strings
3. **Set sensible defaults**: Most users shouldn't need to change settings
4. **Group related settings**: Use naming to group (e.g., behavior_*, debug_*)
5. **Document complex settings**: Use hint text to explain options
6. **Test with different scopes**: Understand interaction between world/user/client scopes

## Related Documentation

- [Config Module](../README.md) - Main config documentation
- [Helpers](../helpers/README.md) - How settings are loaded
- [Data Model](../../001-centralized-config-system/data-model.md) - Setting structure
- [Localization](../../lang/README.md) - Language strings

---

**Status**: Complete ✅  
**Last Updated**: October 28, 2025
