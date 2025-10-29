# Data Model: Config System Entities

**Feature**: Centralized Configuration System
**Date**: October 20, 2025
**Status**: Design phase

---

## Overview

This document defines the data structures, entities, and relationships for the centralized configuration system. All data models are assembled at initialization and frozen afterward, ensuring immutability throughout the application lifetime.

---

## Primary Entity: Config (Singleton)

### Purpose

Central access point for all module configuration. Loaded once at initialization and shared across all imports.

### Structure

```typescript
interface Config {
  constants: ConfigConstants;
  settings: SettingDefinition[];
  module: ModuleManifest;
  env: EnvironmentConfig;

  // Methods (for future extensions)
  toString(): string;
}
```

### Lifecycle

1. **Creation**: `new Config()` called on first import
2. **Initialization**: `config.initialize()` loads all sources
3. **Freezing**: `Object.freeze(config)` prevents modifications
4. **Export**: Singleton exported for application-wide use
5. **Usage**: Properties accessed via `config.constants`, `config.settings`, etc.
6. **Immutability**: All modification attempts fail (silently in non-strict mode, throw in strict)

### Cardinality

- **Singleton**: Exactly one instance throughout application lifetime
- **Module Scope**: One per module; shared across all imports via ESM caching

---

## Entity: ConfigConstants

### Purpose

Aggregated constants from all YAML files in `src/config/constants/`

### Structure

```typescript
interface ConfigConstants {
  errors: ErrorsConfig;
  foundry: FoundryConfig;
  hooks: HooksConfig;
  moduleManagement: ModuleManagementConfig;
  occlusion: OcclusionConfig;
  placeables: PlaceablesConfig;
}
```

### Composition

#### errors: ErrorsConfig

**Source**: `src/config/constants/errors.yaml`

```typescript
interface ErrorsConfig {
  separator: string; // " || " - pattern to join multiple errors
  pattern: string; // "{{module}}{{caller}}{{error}}{{stack}}" - format pattern
}
```

#### foundry: FoundryConfig

**Source**: `src/config/constants/foundry.yaml`

```typescript
interface FoundryConfig {
  defaults: {
    i18nLocation: string; // "game.i18n"
    modulesLocation: string; // "game.modules"
  };
}
```

#### hooks: HooksConfig

**Source**: `src/config/constants/hooks.yaml`

```typescript
interface HooksConfig {
  hooks: {
    settingsReady: string; // "SettingsReady"
    contextReady: string; // "ContextReady"
  };
  hookPatterns: {
    setting: string; // ".setting.{settingKey}"
  };
}
```

#### moduleManagement: ModuleManagementConfig

**Source**: `src/config/constants/moduleManagement.yaml`

```typescript
interface ModuleManagementConfig {
  referToModuleBy: 'title' | 'id' | 'name' | 'shortName';
  deriveShortNameFromTitle: boolean;
  excludeWordsFromShortName: string[];
  shortName: string; // "OMH" - used for env var prefix
}
```

#### occlusion: OcclusionConfig

**Source**: `src/config/constants/occlusion.yaml`

```typescript
// Structure TBD - currently in project; will be loaded as-is
interface OcclusionConfig {
  [key: string]: any; // Placeholder pending actual schema
}
```

#### placeables: PlaceablesConfig

**Source**: `src/config/constants/placeables.yaml`

```typescript
// Structure TBD - currently in project; will be loaded as-is
interface PlaceablesConfig {
  [key: string]: any; // Placeholder pending actual schema
}
```

### Access Pattern

```typescript
// Namespace-keyed access
const separator = config.constants.errors.separator;
const i18n = config.constants.foundry.defaults.i18nLocation;
const settingsHook = config.constants.hooks.hooks.settingsReady;
const prefix = config.constants.moduleManagement.shortName;
```

### Validation Rules

- All required keys must exist (fail-fast if missing)
- YAML files must be valid YAML syntax
- Strings must be non-empty (where applicable)
- Arrays must contain valid items (where applicable)

---

## Entity: SettingDefinition

### Purpose

Settings definitions from `src/config/settings/settings.yaml` - In-game user-adjustable settings

### Structure

```typescript
interface SettingDefinition {
  key: string; // "debugMode", "useModule", etc.

  showOnlyIfFlag?: FlagCondition; // Conditions to show setting
  dontShowIfFlag?: FlagCondition; // Conditions to hide setting

  config: {
    name: string; // Localization key: "OMH.settings.debugMode.name"
    hint: string; // Localization key: "OMH.settings.debugMode.hint"
    scope: 'world' | 'user' | 'client';
    config: boolean; // Show in settings UI
    type: SettingType; // Boolean, String, Object, etc.
    default: any; // Default value for setting
    requireReload?: boolean; // Reload needed on change
    onChange?: {
      sendHook: boolean;
      hookName: string;
    };
  };
}

type SettingType =
  | BooleanConstructor
  | StringConstructor
  | ObjectConstructor
  | ArrayConstructor
  | NumberConstructor;

interface FlagCondition {
  or?: string[];
  and?: string[];
}
```

### Examples

```typescript
{
  key: 'debugMode',
  config: {
    name: 'OMH.settings.debugMode.name',
    hint: 'OMH.settings.debugMode.hint',
    scope: 'user',
    config: true,
    type: Boolean,
    default: false,
    onChange: { sendHook: true, hookName: 'debugMode' }
  }
}

{
  key: 'behaviorTokens',
  config: {
    name: 'OMH.settings.behaviorTokens.name',
    hint: 'OMH.settings.behaviorTokens.hint',
    scope: 'world',
    config: true,
    type: String,
    choices: {
      default: 'OMH.settings.behaviorTokens.choices.default',
      onlyActive: 'OMH.settings.behaviorTokens.choices.onlyActive'
    },
    default: 'default'
  }
}
```

### Access Pattern

```typescript
// Array of setting definitions
const allSettings = config.settings;

// Find specific setting
const debugModeSetting = config.settings.find((s) => s.key === 'debugMode');

// Iterate over settings
config.settings.forEach((setting) => {
  console.log(`${setting.key}: ${setting.config.name}`);
});
```

### Cardinality

- **Array**: Multiple settings (current: 6-8 settings)
- **Required Keys**: key, config.name, config.hint, config.scope, config.type
- **Optional Keys**: showOnlyIfFlag, dontShowIfFlag, requireReload, onChange

---

## Entity: ModuleManifest

### Purpose

Module metadata from `module.json` - Standard FoundryVTT manifest

### Structure

```typescript
interface ModuleManifest {
  id: string; // "vision-with-fade"
  title: string; // "Vision Occlusion Mode With Fade"
  description: string; // Module description

  authors: AuthorInfo[];
  version: string; // "12.1.0"

  compatibility: {
    minimum: string; // "12" (minimum Foundry version)
    verified: string; // "12" (verified/tested with)
  };

  languages: LanguageInfo[];
  styles: string[]; // ["styles/vision-with-fade.css"]
  esmodules: string[]; // ["/src/main.mjs"]

  manifest?: string; // Manifest URL (external)
  download?: string; // Download URL (external)
  readme?: string; // README URL (external)
  url?: string; // Homepage URL (external)

  // Additional fields as defined in module.json
  [key: string]: any;
}

interface AuthorInfo {
  id: string;
  email: string;
  flags?: Record<string, any>;
}

interface LanguageInfo {
  lang: string; // "en"
  name: string; // "English"
  path: string; // "lang/en.json"
  flags?: Record<string, any>;
}
```

### Source

Direct JSON import from `/module.json` at project root

### Access Pattern

```typescript
const moduleId = config.module.id; // "vision-with-fade"
const moduleTitle = config.module.title; // "Vision Occlusion Mode With Fade"
const version = config.module.version; // "12.1.0"
const minVersion = config.module.compatibility.minimum; // "12"
```

### Cardinality

- **Singleton**: Exactly one module manifest
- **Static**: Read once at initialization; never changes during runtime

### Validation Rules

- `id` must be valid string (no spaces, kebab-case)
- `version` must follow semantic versioning (MAJOR.MINOR.PATCH)
- `compatibility.minimum` must be valid Foundry version number
- `esmodules` must contain valid paths (main entry point verified)

---

## Entity: EnvironmentConfig

### Purpose

Environment variables matching the module prefix pattern

### Structure

```typescript
interface EnvironmentConfig {
  [key: string]: string | undefined; // e.g., DEBUG_MODE: "true", BEHAVIOR_TOKENS: "onlyActive"
}
```

### Key Derivation

**Pattern**: `PREFIX_SETTING_NAME`

**Prefix Source**: `config.constants.moduleManagement.shortName`

- Current: `OMH`
- Converts to SCREAMING*SNAKE_CASE: `OMH*`

**Setting Name Conversion**:

- camelCase setting key → SCREAMING_SNAKE_CASE
- Example: `debugMode` → `DEBUG_MODE` → Full: `OMH_DEBUG_MODE`
- Example: `behaviorTokens` → `BEHAVIOR_TOKENS` → Full: `OMH_BEHAVIOR_TOKENS`

### Examples

```typescript
process.env.OMH_DEBUG_MODE = 'true';
process.env.OMH_BEHAVIOR_TOKENS = 'onlyActive';
process.env.OMH_BEHAVIOR_GM = 'inactive';

config.env = {
  OMH_DEBUG_MODE: 'true',
  OMH_BEHAVIOR_TOKENS: 'onlyActive',
  OMH_BEHAVIOR_GM: 'inactive',
};
```

### Access Pattern

```typescript
// All env vars
const allEnvVars = config.env;

// Specific env var
const debugModeEnv = config.env.OMH_DEBUG_MODE; // "true" or undefined

// With type conversion
const isDebugMode = config.env.OMH_DEBUG_MODE === 'true';
```

### Precedence

Environment variables **override** YAML-based settings:

1. YAML defaults (errors.yaml, foundry.yaml, etc.)
2. Settings definitions (settings.yaml)
3. Environment variables (if set, takes precedence)

### Cardinality

- **Optional**: Environment variables are optional
- **Sparse**: Only variables matching `PREFIX_*` pattern are included
- **Read-only**: Cannot be modified at runtime (frozen with rest of config)

### Validation Rules

- Environment variables are strings (process.env values)
- Parsing to boolean/number done by consuming code
- Missing env vars are undefined (not included in object)
- No validation of correctness (consuming code responsible)

---

## Data Flow

### Initialization Sequence

```
1. Import config module
   ↓
2. Config.getInstance() called
   ↓
3. new Config() created
   ↓
4. Load errors.yaml → constants.errors
5. Load foundry.yaml → constants.foundry
6. Load hooks.yaml → constants.hooks
7. Load moduleManagement.yaml → constants.moduleManagement
8. Load occlusion.yaml → constants.occlusion
9. Load placeables.yaml → constants.placeables
   (Namespace-keyed merge into constants object)
   ↓
10. Load settings.yaml → settings array
    ↓
11. Load module.json → module object
    ↓
12. Load process.env → env object (filter PREFIX_* variables)
    ↓
13. Object.freeze(config) - All properties immutable
    ↓
14. Return singleton instance
    ↓
15. Export for application-wide use
```

### Error Handling Flow

```
For each file load:
  Try: Parse YAML/JSON
  Success: Add to config
  Failure:
    → Throw Error with details
    → Include file path, line/column, context
    → Module initialization fails (no fallback)
```

---

## Relationships

### Entity Relationships Diagram

```
Config (Singleton)
├── constants (ConfigConstants)
│   ├── errors (ErrorsConfig)
│   ├── foundry (FoundryConfig)
│   ├── hooks (HooksConfig)
│   ├── moduleManagement (ModuleManagementConfig)
│   ├── occlusion (OcclusionConfig)
│   └── placeables (PlaceablesConfig)
├── settings (SettingDefinition[])
│   └── [0..N] settings, each with key, config, flags
├── module (ModuleManifest)
│   ├── authors (AuthorInfo[])
│   └── languages (LanguageInfo[])
└── env (EnvironmentConfig)
    └── [key: string]: string | undefined
```

### Cross-References

- `module.id` and `constants.moduleManagement.shortName` identify the same module
- `settings[].config.scope` aligns with FoundryVTT's setting registration
- `constants.hooks.hookPatterns.setting` references setting keys from `settings[].key`
- `env` keys derived from `constants.moduleManagement.shortName` prefix

---

## State Transitions

### Config State Machine

```
┌─ Not Initialized
│  ├─ Initialize()
│  │  ├─ Load all sources
│  │  ├─ Merge constants
│  │  └─ Validate all data
│  │
│  └─ → Ready
│
┌─ Ready
│  ├─ Object.freeze()
│  │  └─ → Immutable
│  │
│  └─ → Immutable (no reverse)
│
┌─ Immutable
│  ├─ Read operations: Allowed ✓
│  ├─ Write operations: Rejected (throw or silent fail)
│  └─ No transitions (terminal state)
```

---

## Constraints & Validation

### Required Constraints

| Entity            | Field       | Constraint          | Enforcement                        |
| ----------------- | ----------- | ------------------- | ---------------------------------- |
| Config            | All         | Singleton           | Static getInstance()               |
| Config            | All         | Immutable           | Object.freeze()                    |
| ErrorsConfig      | separator   | Non-empty string    | YAML schema validation             |
| FoundryConfig     | defaults.\* | Non-empty string    | YAML schema validation             |
| HooksConfig       | hooks.\*    | Valid hook name     | Runtime use determines correctness |
| ModuleManifest    | id          | Valid module ID     | YAML schema + pattern match        |
| ModuleManifest    | version     | Semantic version    | YAML schema + regex                |
| SettingDefinition | key         | Unique per array    | Enforced by consumer               |
| SettingDefinition | config.name | Localization key    | String format                      |
| EnvironmentConfig | Values      | String or undefined | process.env nature                 |

### Optional Constraints

- Some YAML files may not exist (will throw error in fail-fast mode)
- Environment variables are optional (undefined if not set)
- Optional YAML fields (showOnlyIfFlag, etc.) may be omitted

---

## Serialization Notes

### What Can Be Serialized?

All Config data can be serialized to JSON for logging/debugging:

- `JSON.stringify(config.constants)` ✓
- `JSON.stringify(config.settings)` ✓
- `JSON.stringify(config.module)` ✓
- `JSON.stringify(config.env)` ✓

### What Cannot Be Serialized?

The frozen state cannot be serialized; it's a runtime property:

```typescript
JSON.stringify(config); // Loses frozen status (ok - just data structure)
Object.isFrozen(config); // Returns true after deserialization? No (frozen status lost)
```

---

## Type Safety

### TypeScript Interfaces

All entities have strict TypeScript interfaces for:

- ✅ IDE autocomplete support
- ✅ Compile-time type checking
- ✅ Runtime safety
- ✅ Documentation via JSDoc

### Generic Fallbacks

For unknown/future config sections:

```typescript
// Fallback for occlusion.yaml and placeables.yaml (schema TBD)
interface UnknownConfig {
  [key: string]: any;
}
```

---

## Next Steps

1. ✅ Data model documented
2. → Generate API contracts (config-api.md)
3. → Generate quickstart.md with examples
4. → Generate tasks.md for implementation
5. → Implementation begins

---

**Data Model Completed**: October 20, 2025
**Status**: ✅ Ready for API contract definition
