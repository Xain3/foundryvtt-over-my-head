<!-- Config Quickstart Guide -->
# Config Quickstart Guide

**Status**: ✅ Complete  
**Path**: `docs/config-quickstart.md`

This quickstart guide provides practical examples for using the centralized config system. For detailed documentation, see the [Config Module README](../src/config/README.md) and [Specification Quickstart](../specs/001-centralized-config-system/quickstart.md).

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

## Installation

### Step 1: Import the Config

```typescript
// In any module file
import { config } from '../config/config.ts';

// Config is now available throughout your module
console.log(config.module.id); // "vision-with-fade"
```

**That's it!** The config is automatically initialized on first import.

## Basic Usage

### Access All Configuration at Once

```typescript
import { config } from '../config/config.ts';

// Every config property is available
console.log(config.constants); // All YAML config
console.log(config.settings); // Settings definitions
console.log(config.module); // Module metadata
console.log(config.env); // Environment variables
```

### Display Module Information

```typescript
import { config } from '../config/config.ts';

console.log(`Module: ${config.module.title}`);
console.log(`Version: ${config.module.version}`);
console.log(`Author: ${config.module.authors[0].id}`);
// Output:
// Module: Vision Occlusion Mode With Fade
// Version: 12.1.0
// Author: author-name
```

## Accessing Constants

### Error Configuration

```typescript
import { config } from '../config/config.ts';

const { separator } = config.constants.errors;

// Join multiple errors
const errors = ['Error 1', 'Error 2', 'Error 3'];
const combined = errors.join(separator);
console.log(combined);
// Output: Error 1 || Error 2 || Error 3
```

### Foundry Defaults

```typescript
import { config } from '../config/config.ts';

// Get paths to FoundryVTT global objects
const i18nPath = config.constants.foundry.defaults.i18nLocation;
const modulesPath = config.constants.foundry.defaults.modulesLocation;

// Use with window object navigation (in browser context)
// const i18n = eval(`window.${i18nPath}`);
```

### Hook Names

```typescript
import { config } from '../config/config.ts';

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

## Working with Settings

### List All Settings

```typescript
import { config } from '../config/config.ts';

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
import { config } from '../config/config.ts';

// Find the debug mode setting
const debugModeSetting = config.settings.find(
  (setting) => setting.key === 'debugMode'
);

if (debugModeSetting) {
  console.log(`Debug mode default: ${debugModeSetting.config.default}`);
  console.log(`Debug mode scope: ${debugModeSetting.config.scope}`);
}
```

## Module Metadata

### Version Information

```typescript
import { config } from '../config/config.ts';

const version = config.module.version; // "12.1.0"
const minimum = config.module.compatibility.minimum; // "12"
const verified = config.module.compatibility.verified; // "12"

console.log(`Module version: ${version}`);
console.log(`Minimum Foundry: ${minimum}`);
console.log(`Verified with: ${verified}`);
```

### Module URLs

```typescript
import { config } from '../config/config.ts';

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

## Environment Variables

### Check Environment Variables

```typescript
import { config } from '../config/config.ts';

// Environment variables follow OMH_* pattern
const debugMode = config.env.OMH_DEBUG_MODE;
const tokenBehavior = config.env.OMH_BEHAVIOR_TOKENS;

console.log(`Debug mode (env): ${debugMode}`); // undefined or "true"
console.log(`Token behavior (env): ${tokenBehavior}`); // undefined or value
```

### Convert Environment String Values

```typescript
import { config } from '../config/config.ts';

// Env vars are always strings; convert as needed
const isDebugMode = config.env.OMH_DEBUG_MODE === 'true';
const debugLevel = parseInt(config.env.OMH_DEBUG_LEVEL || '0');
const maxTokens = parseInt(config.env.OMH_MAX_TOKENS || '100');

console.log(`Debug enabled: ${isDebugMode}`);
console.log(`Debug level: ${debugLevel}`);
console.log(`Max tokens: ${maxTokens}`);
```

## Common Patterns

### Pattern 1: Module Initialization with Config

```typescript
import { config } from './config/config.ts';

// Module initialization
function initializeModule() {
  console.info(
    `[${config.configs.moduleManagement.shortName}] Initializing...`
  );

  // Use config throughout module
  const version = config.module.version;
  const debugMode = config.env.OMH_DEBUG_MODE === 'true';

  console.info(
    `[${config.configs.moduleManagement.shortName}] Version ${version} initialized`
  );

  if (debugMode) {
    console.debug('[OMH] Debug mode enabled');
  }
}

initializeModule();
```

### Pattern 2: Logging with Module Prefix

```typescript
import { config } from './config/config.ts';

function logWithPrefix(message: string, level: 'info' | 'debug' | 'warn' | 'error' = 'info') {
  const prefix = config.configs.moduleManagement.shortName;
  console[level](`[${prefix}] ${message}`);
}

// Usage
logWithPrefix('Module initialized', 'info');
logWithPrefix('Feature X activated', 'debug');
logWithPrefix('Warning: Missing data', 'warn');
logWithPrefix('Critical error occurred', 'error');
```

### Pattern 3: Type-Safe Setting Lookup

```typescript
import { config } from './config/config.ts';

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

### Pattern 4: Configuration Validation

```typescript
import { config } from './config/config.ts';

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

## Error Handling

### Handling Initialization Errors

```typescript
import { config } from './config/config.ts';

// If config fails to initialize, this will throw
try {
  // Config is already loaded if this line executes
  console.log(config.module.id);
} catch (error) {
  console.error('[OMH] CONFIG INITIALIZATION FAILED:', error.message);
  // Handle gracefully
}
```

### Accessing Optional Properties Safely

```typescript
import { config } from './config/config.ts';

// Optional manifest URLs
const manifestUrl = config.module.manifest || 'Not configured';
const readmeUrl = config.module.readme || 'Not configured';

console.log(`Manifest: ${manifestUrl}`);
console.log(`README: ${readmeUrl}`);
```

### Type Guards

```typescript
import { config } from './config/config.ts';

// Verify setting type before use
const setting = config.settings.find((s) => s.key === 'debugMode');

if (setting && setting.config.type === Boolean) {
  console.log('This is a boolean setting');
}

if (setting && setting.config.type === String) {
  console.log('This is a string setting');
}
```

## FAQs

### Q: How do I import config in a different file?

```typescript
// File A: src/handlers/myHandler.mts
import { config } from '../config/config.ts';

// File B: src/utils/myUtil.mts
import { config } from '../config/config.ts';

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

### Q: What if I'm not in FoundryVTT context?

```typescript
// Config works in any JavaScript/Node.js environment
// It doesn't require FoundryVTT to be loaded

import { config } from './config.ts';

// All properties work, but:
// - Hooks won't fire (no FoundryVTT system)
// - game object won't exist (check before use)
// - File paths are relative to module root

// Safe to use in tests, build scripts, etc.
```

### Q: What's the difference between settings and environment variables?

```typescript
import { config } from './config/config.ts';

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
import { config } from './config/config.ts';

// If you reach this line, config loaded successfully
// (Otherwise, the import would throw an error)

if (config && config.module && config.constants) {
  console.log('✓ Config loaded successfully');
} else {
  console.error('✗ Config is incomplete');
}
```

## Next Steps

1. **Import config** in your module with `import { config } from './config/config.ts';`
2. **Access properties** as needed (`config.module.id`, `config.constants.*`, etc.)
3. **Use in your code** for configuration-driven logic
4. **Test** with different environment variables

## Related Documentation

- [Config Module](../src/config/README.md) - Complete module documentation
- [Data Model](../specs/001-centralized-config-system/data-model.md) - Entity structure
- [API Specification](../specs/001-centralized-config-system/config-api.md) - Full API reference
- [Helper Functions](../src/config/helpers/README.md) - Implementation details

---

**Status**: Complete ✅  
**Last Updated**: October 28, 2025
