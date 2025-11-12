# Quickstart Guide: Config System

**Feature**: Centralized Configuration System
**Date**: October 20, 2025
**Status**: Usage examples

---

## Quick Navigation

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Accessing Constants](#accessing-constants)
- [Working with Settings](#working-with-settings)
- [Module Metadata](#module-metadata)
- [Environment Variables](#environment-variables)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)
- [FAQs](#faqs)

---

## Installation

### Step 1: Import the Config

```typescript
// In any module file
import config from './src/config/config.ts';

// Config is now available throughout your module
console.log(config.module.id); // "vision-with-fade"
```

**That's it!** The config is automatically initialized on first import.

---

## Basic Usage

### Access All Configuration at Once

```typescript
import config from './src/config/config.ts';

// Every config property is available
console.log(config.constants); // All YAML config
console.log(config.settings); // Settings definitions
console.log(config.module); // Module metadata
console.log(config.env); // Environment variables
```

### Display Module Information

```typescript
import config from './src/config/config.ts';

console.log(`Module: ${config.module.title}`);
console.log(`Version: ${config.module.version}`);
console.log(`Author: ${config.module.authors[0].id}`);
// Output:
// Module: Vision Occlusion Mode With Fade
// Version: 12.1.0
// Author: author-name
```

---

## Accessing Constants

### Error Configuration

```typescript
import config from './src/config/config.ts';

const { separator } = config.constants.errors;

// Join multiple errors
const errors = ['Error 1', 'Error 2', 'Error 3'];
const combined = errors.join(separator);
console.log(combined);
// Output: Error 1 || Error 2 || Error 3
```

### Foundry Defaults

```typescript
import config from './src/config/config.ts';

// Get paths to FoundryVTT global objects
const i18nPath = config.constants.foundry.defaults.i18nLocation;
const modulesPath = config.constants.foundry.defaults.modulesLocation;

// Use with window object navigation (in browser context)
// const i18n = eval(`window.${i18nPath}`);
```

### Hook Names

```typescript
import config from './src/config/config.ts';

// Get official hook names
const settingsReadyHook = config.constants.hooks.hooks.settingsReady;
const contextReadyHook = config.constants.hooks.hooks.contextReady;

// Register hook listeners
Hooks.on(settingsReadyHook, () => {
  console.log('Settings are ready!');
});

Hooks.on(contextReadyHook, () => {
  console.log('Context is ready!');
});
```

### Module Management

```typescript
import config from './src/config/config.ts';

// Get module identifier
const moduleId = config.module.id; // "vision-with-fade"
const shortName = config.configs.moduleManagement.shortName; // "OMH"

// Use for logging prefix
console.log(`[${shortName}] Module loaded: ${moduleId}`);
// Output: [OMH] Module loaded: vision-with-fade
```

### Environment Prefix

```typescript
import config from './src/config/config.ts';

// Get the environment variable prefix
const prefix = config.configs.moduleManagement.shortName; // "OMH"

// Environment variables follow this pattern:
// OMH_DEBUG_MODE
// OMH_BEHAVIOR_TOKENS
// OMH_BEHAVIOR_GM
// etc.
```

---

## Working with Settings

### List All Settings

```typescript
import config from './src/config/config.ts';

// Iterate all settings
config.settings.forEach((setting) => {
  console.log(`Setting: ${setting.key}`);
  console.log(`Name: ${setting.config.name}`);
  console.log(`Type: ${setting.config.type.name}`);
  console.log(`Scope: ${setting.config.scope}`);
  console.log('---');
});
```

### Find a Specific Setting

```typescript
import config from './src/config/config.ts';

// Find the debug mode setting
const debugModeSetting = config.settings.find(
  (setting) => setting.key === 'debugMode'
);

if (debugModeSetting) {
  console.log(`Debug mode default: ${debugModeSetting.config.default}`);
  console.log(`Debug mode scope: ${debugModeSetting.config.scope}`);
}
```

### Check Setting Configuration

```typescript
import config from './src/config/config.ts';

const tokenBehaviorSetting = config.settings.find(
  (s) => s.key === 'behaviorTokens'
);

if (tokenBehaviorSetting) {
  // Check if it's a world-scope setting
  if (tokenBehaviorSetting.config.scope === 'world') {
    console.log('This setting applies to the entire world');
  }

  // Check if reload is required
  if (tokenBehaviorSetting.config.requireReload) {
    console.log('Players must reload after changing this');
  }

  // Check if a hook is fired on change
  if (tokenBehaviorSetting.config.onChange?.sendHook) {
    console.log(`Hook fired: ${tokenBehaviorSetting.config.onChange.hookName}`);
  }
}
```

### Settings Metadata for FoundryVTT Registration

```typescript
import config from './src/config/config.ts';

// Register all settings in FoundryVTT
config.settings.forEach((settingDef) => {
  if (settingDef.config) {
    // Only if meant to be shown in UI
    game.settings.register(config.module.id, settingDef.key, settingDef.config);
  }
});
```

---

## Module Metadata

### Version Information

```typescript
import config from './src/config/config.ts';

const version = config.module.version; // "12.1.0"
const minimum = config.module.compatibility.minimum; // "12"
const verified = config.module.compatibility.verified; // "12"

console.log(`Module version: ${version}`);
console.log(`Minimum Foundry: ${minimum}`);
console.log(`Verified with: ${verified}`);
```

### Module URLs

```typescript
import config from './src/config/config.ts';

if (config.module.url) {
  console.log(`Homepage: ${config.module.url}`);
}

if (config.module.manifest) {
  console.log(`Update manifest: ${config.module.manifest}`);
}

if (config.module.readme) {
  console.log(`Documentation: ${config.module.readme}`);
}
```

### Languages and Authors

```typescript
import config from './src/config/config.ts';

// Supported languages
config.module.languages.forEach((lang) => {
  console.log(`Language: ${lang.name} (${lang.lang})`);
});

// Authors and contributors
config.module.authors.forEach((author) => {
  console.log(`Author: ${author.id} <${author.email}>`);
});
```

---

## Environment Variables

### Check Environment Variables

```typescript
import config from './src/config/config.ts';

// Environment variables follow OMH_* pattern
const debugMode = config.env.OMH_DEBUG_MODE;
const tokenBehavior = config.env.OMH_BEHAVIOR_TOKENS;

console.log(`Debug mode (env): ${debugMode}`); // undefined or "true"
console.log(`Token behavior (env): ${tokenBehavior}`); // undefined or value
```

### Convert Environment String Values

```typescript
import config from './src/config/config.ts';

// Env vars are always strings; convert as needed
const isDebugMode = config.env.OMH_DEBUG_MODE === 'true';
const debugLevel = parseInt(config.env.OMH_DEBUG_LEVEL || '0');
const maxTokens = parseInt(config.env.OMH_MAX_TOKENS || '100');

console.log(`Debug enabled: ${isDebugMode}`);
console.log(`Debug level: ${debugLevel}`);
console.log(`Max tokens: ${maxTokens}`);
```

### Override Settings with Environment

```typescript
import config from './src/config/config.ts';

// Environment variables override YAML/settings defaults
// If OMH_DEBUG_MODE is set, use it; otherwise use setting default
const debugSetting = config.settings.find((s) => s.key === 'debugMode');
const debugModeDefault = debugSetting?.config.default || false;

const debugModeActive =
  config.env.OMH_DEBUG_MODE !== undefined
    ? config.env.OMH_DEBUG_MODE === 'true'
    : debugModeDefault;

console.log(`Debug mode (with env override): ${debugModeActive}`);
```

### Common Environment Variables

```typescript
// These variables follow the pattern: OMH_{SETTING_NAME}
// Convert camelCase setting names to SCREAMING_SNAKE_CASE

OMH_DEBUG_MODE; // debugMode setting
OMH_BEHAVIOR_TOKENS; // behaviorTokens setting
OMH_BEHAVIOR_GM; // behaviorGm setting
OMH_ENABLE_FEATURE_X; // enableFeatureX setting
OMH_MAX_OCCLUDED_OBJECTS; // maxOccludedObjects setting
```

### Set Environment Variables (Local Development)

```bash
# For Node.js/testing environment
export OMH_DEBUG_MODE=true
export OMH_BEHAVIOR_TOKENS=onlyActive

# For npm scripts in package.json
OMH_DEBUG_MODE=true npm run dev

# Or in .env file (if using dotenv)
OMH_DEBUG_MODE=true
OMH_BEHAVIOR_TOKENS=onlyActive
```

---

## Common Patterns

### Pattern 1: Initialization Hook

```typescript
import config from './src/config/config.ts';

// Fire a hook after config is loaded
Hooks.callAll(config.constants.hooks.hooks.settingsReady, config);

// Other modules can listen for this
Hooks.on(config.constants.hooks.hooks.settingsReady, (loadedConfig) => {
  console.log('Config is ready to use!', loadedConfig);
});
```

### Pattern 2: Logging with Module Prefix

```typescript
import config from './src/config/config.ts';

function logWithPrefix(message: string) {
  const prefix = config.configs.moduleManagement.shortName;
  console.log(`[${prefix}] ${message}`);
}

// Usage
logWithPrefix('Module initialized'); // [OMH] Module initialized
logWithPrefix('Feature X activated'); // [OMH] Feature X activated
```

### Pattern 3: Error Messages with Separator

```typescript
import config from './src/config/config.ts';

function reportErrors(errors: string[]) {
  const separator = config.constants.errors.separator;
  return errors.join(separator);
}

const validationErrors = [
  'Missing required field: name',
  'Invalid value for field: age',
  'Duplicate entry detected',
];

console.error(reportErrors(validationErrors));
// Missing required field: name || Invalid value for field: age || Duplicate entry detected
```

### Pattern 4: Type-Safe Setting Lookup

```typescript
import config from './src/config/config.ts';

function getSetting(key: string): any {
  const setting = config.settings.find((s) => s.key === key);
  if (!setting) {
    throw new Error(`Setting not found: ${key}`);
  }
  return setting.config.default;
}

try {
  const debugDefault = getSetting('debugMode');
  console.log(`Debug mode default: ${debugDefault}`);
} catch (error) {
  console.error(error.message);
}
```

### Pattern 5: Conditional Feature Based on Environment

```typescript
import config from './src/config/config.ts';

const FEATURE_DEBUG_MODE = config.env.OMH_DEBUG_MODE === 'true';

if (FEATURE_DEBUG_MODE) {
  console.log('Debug mode is enabled via environment');
  // Run debug-only code
} else {
  console.log('Debug mode is disabled');
  // Run production code
}

// This allows enabling features without code changes:
// OMH_DEBUG_MODE=true npm run dev
```

### Pattern 6: Configuration Validation

```typescript
import config from './src/config/config.ts';

function validateConfig(): void {
  // Verify all required settings are defined
  const requiredSettings = ['debugMode', 'behaviorTokens', 'behaviorGm'];

  for (const settingKey of requiredSettings) {
    const setting = config.settings.find((s) => s.key === settingKey);
    if (!setting) {
      throw new Error(`Required setting missing: ${settingKey}`);
    }
  }

  // Verify module ID matches expectation
  if (config.module.id !== 'vision-with-fade') {
    throw new Error(`Unexpected module ID: ${config.module.id}`);
  }

  console.log('✓ Configuration is valid');
}

// Call during initialization
validateConfig();
```

---

## Error Handling

### Handling Missing Settings

```typescript
import config from './src/config/config.ts';

function getSettingOrNull(key: string) {
  return config.settings.find((s) => s.key === key) || null;
}

const mySettings = getSettingOrNull('debugMode');
if (!mySettings) {
  console.warn(`Setting not found: debugMode. Using default.`);
  // Handle gracefully
} else {
  console.log(`Found setting: ${mySettings.config.name}`);
}
```

### Accessing Optional Properties Safely

```typescript
import config from './src/config/config.ts';

// Optional manifest URLs
const manifestUrl = config.module.manifest || 'Not configured';
const readmeUrl = config.module.readme || 'Not configured';

console.log(`Manifest: ${manifestUrl}`);
console.log(`README: ${readmeUrl}`);
```

### Type Guards

```typescript
import config from './src/config/config.ts';

// Verify setting type before use
const setting = config.settings.find((s) => s.key === 'debugMode');

if (setting && setting.config.type === Boolean) {
  console.log('This is a boolean setting');
}

if (setting && setting.config.type === String) {
  console.log('This is a string setting');
}
```

### Immutability Errors (What NOT to Do)

```typescript
import config from './src/config/config.ts';

// ❌ These will throw or fail silently:
config.module.version = '13.0.0'; // ✗ Rejected
config.constants.errors.separator = '::'; // ✗ Rejected
delete config.env.OMH_DEBUG_MODE; // ✗ Rejected
config.newProperty = 'value'; // ✗ Rejected

// ✅ Correct approach (read-only):
const version = config.module.version; // ✓ Read
const separator = config.constants.errors.separator; // ✓ Read
```

---

## FAQs

### Q: How do I import config in a different file?

```typescript
// File A: src/handlers/myHandler.mts
import config from '../config/config.ts';

// File B: src/utils/myUtil.mts
import config from '../config/config.ts';

// ✅ Both receive the SAME singleton instance
// (ESM module caching ensures this)
```

### Q: Can I modify the config after loading?

```typescript
// ❌ No - the config is immutable
config.module.version = 'modified'; // Throws or fails

// ✅ Instead, create your own object if you need modification
const myConfig = {
  ...config,
  customProperty: 'value',
};
```

### Q: How do I add a new setting?

```typescript
// 1. Add to src/config/settings/settings.yaml:
// - key: newSetting
//   config:
//     name: i18n.key
//     type: Boolean
//     default: false
//     ...

// 2. Reload the module

// 3. Access via config.settings
const newSetting = config.settings.find((s) => s.key === 'newSetting');
```

### Q: How do I add a new constant file?

```typescript
// 1. Create: src/config/constants/newconstants.yaml
// 2. Add content to the file
// 3. Reload the module
// 4. Access via config.constants.newconstants

// The new file is automatically loaded and namespaced
```

### Q: What if I'm not in FoundryVTT context?

```typescript
// Config works in any JavaScript/Node.js environment
// It doesn't require FoundryVTT to be loaded

import config from './config.ts';

// All properties work, but:
// - Hooks won't fire (no FoundryVTT system)
// - game object won't exist (check before use)
// - File paths are relative to module root

// Safe to use in tests, build scripts, etc.
```

### Q: How do I get all environment variables set?

```typescript
import config from './src/config/config.ts';

// List all environment variables currently set
const setVars = Object.entries(config.env)
  .filter(([_key, value]) => value !== undefined)
  .map(([key, value]) => `${key}=${value}`);

console.log('Environment variables set:');
console.log(setVars.join('\n'));
```

### Q: What's the difference between settings and environment variables?

```typescript
import config from './src/config/config.ts';

// Settings: Defined in settings.yaml
// - Configurable in FoundryVTT UI
// - Scoped to world/user/client
// - Have defaults defined in YAML
config.settings;

// Environment: From process.env
// - Set in shell/process environment
// - Override YAML defaults
// - Pattern: OMH_*
config.env;

// Usage:
const settingDefault = config.settings.find((s) => s.key === 'debugMode')
  ?.config.default;
const envOverride = config.env.OMH_DEBUG_MODE;
const finalValue =
  envOverride !== undefined ? envOverride === 'true' : settingDefault;
```

### Q: How do I check if config loaded successfully?

```typescript
import config from './src/config/config.ts';

// If you reach this line, config loaded successfully
// (Otherwise, the import would throw an error)

if (config && config.module && config.constants) {
  console.log('✓ Config loaded successfully');
} else {
  console.error('✗ Config is incomplete');
}
```

### Q: Can I use config in TypeScript?

```typescript
// Yes! Full TypeScript support:
import config from './src/config/config.ts';
import type { Config, SettingDefinition } from './src/config/config.ts';

// Type-safe access
const debugSetting: SettingDefinition | undefined = config.settings.find(
  (s) => s.key === 'debugMode'
);

// IDE autocomplete works
config.constants.errors.separator; // ✓ Autocomplete shows separator
config.constants.unknown; // ✗ TypeScript error

// No 'any' types needed
```

---

## Next Steps

### Use Config in Your Code

1. **Import** config in your module
2. **Access** the properties you need
3. **Use** in your business logic
4. **Test** with different environment variables

### Learn More

- See **data-model.md** for detailed entity structure
- See **config-api.md** for complete API reference
- See **plan.md** for implementation overview

### Examples in the Codebase

Look for `import config from` in:

- `src/main.mjs` - Main entry point
- `src/handlers/*` - Event handlers
- `src/utils/*` - Utility functions

---

**Quickstart Guide Completed**: October 20, 2025
**Status**: ✅ Ready for Phase 1 implementation
