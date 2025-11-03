# API Contracts: Config System

**Feature**: Centralized Configuration System
**Date**: October 20, 2025
**Status**: API Design phase

---

## Overview

This document defines the public API contracts for the Config system. All contracts are versioned and designed for long-term stability.

---

## Module Contract

### Entry Point: `src/config/config.ts`

#### Export: Default Export (Config Singleton)

```typescript
/**
 * Centralized configuration management for Vision With Fade module.
 *
 * Loads and merges configuration from multiple sources:
 * - YAML files in src/config/constants/
 * - YAML settings definition from src/config/settings/
 * - Module manifest from module.json
 * - Environment variables matching OMH_* pattern
 *
 * Configuration is loaded on first import and frozen afterward,
 * preventing runtime modifications.
 *
 * @file src/config/config.ts
 * @description Singleton configuration manager with immutable state
 * @path src/config/config.ts
 *
 * @version 1.0.0
 * @since 12.1.0
 *
 * @example
 * import config from './src/config/config.ts';
 * console.log(config.constants.errors.separator);  // " || "
 * console.log(config.module.id);                   // "vision-with-fade"
 */
export default config: Config;
```

#### Contract Guarantees

- ✅ Singleton: Always returns same instance
- ✅ Immutable: All properties read-only after initialization
- ✅ Synchronous: Returns immediately (no async loading)
- ✅ Cached: ESM module cache ensures single instance across imports
- ✅ Stable: API version 1.0.0, no breaking changes planned

---

## Type Exports

### Config Interface

```typescript
/**
 * Root configuration object containing all module settings and metadata.
 *
 * @interface Config
 * @version 1.0.0
 *
 * @property {ConfigConstants} constants - Loaded YAML constants from src/config/constants/
 * @property {SettingDefinition[]} settings - Setting definitions from src/config/settings/settings.yaml
 * @property {ModuleManifest} module - Module metadata from module.json
 * @property {EnvironmentConfig} env - Environment variables matching OMH_* pattern
 *
 * @example
 * const config = {
 *   constants: { errors: {...}, foundry: {...}, ... },
 *   settings: [{key: 'debugMode', config: {...}}, ...],
 *   module: {id: 'vision-with-fade', title: '...', ...},
 *   env: {OMH_DEBUG_MODE: 'true', ...}
 * };
 */
export interface Config {
  constants: ConfigConstants;
  settings: SettingDefinition[];
  module: ModuleManifest;
  env: EnvironmentConfig;
}
```

### ConfigConstants Interface

```typescript
/**
 * Aggregated constants loaded from YAML files in src/config/constants/
 * Uses namespace-keyed merging: each file becomes a top-level property.
 *
 * @interface ConfigConstants
 * @version 1.0.0
 *
 * @property {ErrorsConfig} errors - Error configuration (errors.yaml)
 * @property {FoundryConfig} foundry - Foundry defaults (foundry.yaml)
 * @property {HooksConfig} hooks - Hook definitions (hooks.yaml)
 * @property {ModuleManagementConfig} moduleManagement - Module settings (moduleManagement.yaml)
 * @property {OcclusionConfig} occlusion - Occlusion settings (occlusion.yaml)
 * @property {PlaceablesConfig} placeables - Placeable settings (placeables.yaml)
 *
 * @example
 * config.constants.errors.separator        // " || "
 * config.constants.foundry.defaults        // {i18nLocation: '...', ...}
 * config.constants.hooks.hooks.settingsReady // "SettingsReady"
 * config.configs.moduleManagement.shortName // "OMH"
 */
export interface ConfigConstants {
  errors: ErrorsConfig;
  foundry: FoundryConfig;
  hooks: HooksConfig;
  moduleManagement: ModuleManagementConfig;
  occlusion: OcclusionConfig;
  placeables: PlaceablesConfig;
}
```

### ErrorsConfig Interface

```typescript
/**
 * Error handling configuration.
 *
 * @interface ErrorsConfig
 * @version 1.0.0
 * @source src/config/constants/errors.yaml
 *
 * @property {string} separator - Pattern to join multiple error messages (e.g., " || ")
 * @property {string} pattern - Format pattern for error output (e.g., "{{module}}{{caller}}{{error}}")
 *
 * @example
 * const combined = errors.map(e => e.message).join(config.constants.errors.separator);
 * // Result: "Error 1 || Error 2 || Error 3"
 */
export interface ErrorsConfig {
  separator: string;
  pattern: string;
}
```

### FoundryConfig Interface

```typescript
/**
 * Foundry VTT platform configuration.
 *
 * @interface FoundryConfig
 * @version 1.0.0
 * @source src/config/constants/foundry.yaml
 *
 * @property {Object} defaults - Default FoundryVTT locations
 * @property {string} defaults.i18nLocation - Access path to i18n system (e.g., "game.i18n")
 * @property {string} defaults.modulesLocation - Access path to modules (e.g., "game.modules")
 *
 * @example
 * const i18n = window[config.constants.foundry.defaults.i18nLocation];
 * const modules = window[config.constants.foundry.defaults.modulesLocation];
 */
export interface FoundryConfig {
  defaults: {
    i18nLocation: string;
    modulesLocation: string;
  };
}
```

### HooksConfig Interface

```typescript
/**
 * Hook names and patterns for module lifecycle events.
 *
 * @interface HooksConfig
 * @version 1.0.0
 * @source src/config/constants/hooks.yaml
 *
 * @property {Object} hooks - Defined hook names
 * @property {string} hooks.settingsReady - Hook fired when settings are ready
 * @property {string} hooks.contextReady - Hook fired when context is ready
 * @property {Object} hookPatterns - Hook name generation patterns
 * @property {string} hookPatterns.setting - Pattern for setting-specific hooks (includes {settingKey})
 *
 * @example
 * Hooks.on(config.constants.hooks.hooks.settingsReady, () => {...});
 * const settingHook = config.constants.hooks.hookPatterns.setting.replace('{settingKey}', 'debugMode');
 * Hooks.on(settingHook, newValue => {...});
 */
export interface HooksConfig {
  hooks: {
    settingsReady: string;
    contextReady: string;
  };
  hookPatterns: {
    setting: string;
  };
}
```

### ModuleManagementConfig Interface

```typescript
/**
 * Module identification and naming configuration.
 *
 * @interface ModuleManagementConfig
 * @version 1.0.0
 * @source src/config/constants/moduleManagement.yaml
 *
 * @property {'title' | 'id' | 'name' | 'shortName'} referToModuleBy - Which property identifies the module
 * @property {boolean} deriveShortNameFromTitle - Auto-derive shortName from title if true
 * @property {string[]} excludeWordsFromShortName - Words to exclude when deriving short name
 * @property {string} shortName - Short identifier for the module (e.g., "OMH")
 *                                Used as prefix for environment variables and logging
 *
 * @example
 * const prefix = config.configs.moduleManagement.shortName;  // "OMH"
 * const envVarKey = `${prefix}_DEBUG_MODE`;  // "OMH_DEBUG_MODE"
 */
export interface ModuleManagementConfig {
  referToModuleBy: 'title' | 'id' | 'name' | 'shortName';
  deriveShortNameFromTitle: boolean;
  excludeWordsFromShortName: string[];
  shortName: string;
}
```

### OcclusionConfig Interface

```typescript
/**
 * Occlusion-specific configuration.
 *
 * @interface OcclusionConfig
 * @version 1.0.0
 * @source src/config/constants/occlusion.yaml
 *
 * Schema to be defined based on occlusion feature requirements.
 * Currently allows any key-value pairs for flexibility.
 *
 * @example
 * const occlusionConfig = config.configs.occlusion;
 * // Access properties based on actual occlusion.yaml structure
 */
export interface OcclusionConfig {
  [key: string]: any;
}
```

### PlaceablesConfig Interface

```typescript
/**
 * Placeable-specific configuration.
 *
 * @interface PlaceablesConfig
 * @version 1.0.0
 * @source src/config/constants/placeables.yaml
 *
 * Schema to be defined based on placeable feature requirements.
 * Currently allows any key-value pairs for flexibility.
 *
 * @example
 * const placeablesConfig = config.configs.placeables;
 * // Access properties based on actual placeables.yaml structure
 */
export interface PlaceablesConfig {
  [key: string]: any;
}
```

### SettingDefinition Interface

```typescript
/**
 * Definition of a single in-game setting.
 * Configures how a setting appears in FoundryVTT settings interface.
 *
 * @interface SettingDefinition
 * @version 1.0.0
 * @source src/config/settings/settings.yaml
 *
 * @property {string} key - Unique identifier for the setting (e.g., "debugMode")
 * @property {FlagCondition} [showOnlyIfFlag] - Conditions when setting is visible
 * @property {FlagCondition} [dontShowIfFlag] - Conditions when setting is hidden
 * @property {Object} config - FoundryVTT setting configuration
 * @property {string} config.name - Localization key for setting name
 * @property {string} config.hint - Localization key for setting description
 * @property {'world' | 'user' | 'client'} config.scope - Setting scope in Foundry
 * @property {boolean} config.config - Show in settings UI
 * @property {Function} config.type - Constructor for setting type (Boolean, String, etc.)
 * @property {any} config.default - Default value for the setting
 * @property {boolean} [config.requireReload] - Reload world on change
 * @property {Object} [config.onChange] - Callback configuration on change
 * @property {boolean} [config.onChange.sendHook] - Fire hook on value change
 * @property {string} [config.onChange.hookName] - Name of hook to fire
 *
 * @example
 * const debugModeSetting = config.settings.find(s => s.key === 'debugMode');
 * console.log(debugModeSetting.config.name);   // "OMH.settings.debugMode.name"
 * console.log(debugModeSetting.config.default); // false
 */
export interface SettingDefinition {
  key: string;
  showOnlyIfFlag?: FlagCondition;
  dontShowIfFlag?: FlagCondition;
  config: {
    name: string;
    hint: string;
    scope: 'world' | 'user' | 'client';
    config: boolean;
    type:
      | BooleanConstructor
      | StringConstructor
      | ObjectConstructor
      | ArrayConstructor
      | NumberConstructor;
    default: any;
    requireReload?: boolean;
    onChange?: {
      sendHook: boolean;
      hookName: string;
    };
  };
}

/**
 * Conditional flag expressions for showing/hiding settings.
 *
 * @interface FlagCondition
 *
 * @property {string[]} [or] - Show if ANY condition is true
 * @property {string[]} [and] - Show only if ALL conditions are true
 *
 * @example
 * showOnlyIfFlag: {or: ["isBeta", "isDev"]}     // Show if either flag is set
 * dontShowIfFlag: {and: ["isProduction", "isLocked"]}  // Hide if both flags are set
 */
export interface FlagCondition {
  or?: string[];
  and?: string[];
}
```

### ModuleManifest Interface

```typescript
/**
 * FoundryVTT module manifest metadata.
 * Loaded from module.json at project root.
 *
 * @interface ModuleManifest
 * @version 1.0.0
 * @source module.json
 *
 * @property {string} id - Module ID (kebab-case identifier)
 * @property {string} title - Display title for the module
 * @property {string} description - Short description of the module
 * @property {AuthorInfo[]} authors - List of authors and contributors
 * @property {string} version - Semantic version (e.g., "12.1.0")
 * @property {Object} compatibility - Version compatibility information
 * @property {string} compatibility.minimum - Minimum supported FoundryVTT version
 * @property {string} compatibility.verified - Latest tested/verified version
 * @property {LanguageInfo[]} languages - Localization files
 * @property {string[]} styles - CSS stylesheet paths
 * @property {string[]} esmodules - ES module entry points
 * @property {string} [manifest] - External manifest URL for updates
 * @property {string} [download] - External download URL
 * @property {string} [readme] - External README URL
 * @property {string} [url] - Project homepage URL
 * @property {Record<string, any>} - Additional fields as needed
 *
 * @example
 * console.log(config.module.id);                    // "vision-with-fade"
 * console.log(config.module.title);                 // "Vision Occlusion Mode With Fade"
 * console.log(config.module.version);               // "12.1.0"
 * console.log(config.module.compatibility.minimum); // "12"
 */
export interface ModuleManifest {
  id: string;
  title: string;
  description: string;
  authors: AuthorInfo[];
  version: string;
  compatibility: {
    minimum: string;
    verified: string;
  };
  languages: LanguageInfo[];
  styles: string[];
  esmodules: string[];
  manifest?: string;
  download?: string;
  readme?: string;
  url?: string;
  [key: string]: any;
}

/**
 * Author information in module manifest.
 *
 * @interface AuthorInfo
 *
 * @property {string} id - Author identifier
 * @property {string} email - Author email address
 * @property {Record<string, any>} [flags] - Additional metadata
 *
 * @example
 * {id: 'author-name', email: 'author@example.com'}
 */
export interface AuthorInfo {
  id: string;
  email: string;
  flags?: Record<string, any>;
}

/**
 * Language file definition.
 *
 * @interface LanguageInfo
 *
 * @property {string} lang - Language code (e.g., "en")
 * @property {string} name - Human-readable language name (e.g., "English")
 * @property {string} path - Relative path to language file (e.g., "lang/en.json")
 * @property {Record<string, any>} [flags] - Additional metadata
 *
 * @example
 * {lang: 'en', name: 'English', path: 'lang/en.json'}
 */
export interface LanguageInfo {
  lang: string;
  name: string;
  path: string;
  flags?: Record<string, any>;
}
```

### EnvironmentConfig Interface

```typescript
/**
 * Environment variables matching the module's prefix pattern (OMH_*).
 *
 * All values are strings (native process.env behavior).
 * Consuming code responsible for type conversion if needed.
 *
 * @interface EnvironmentConfig
 * @version 1.0.0
 *
 * @property {Record<string, string | undefined>} - Key-value pairs of env variables
 *           Keys follow pattern: {PREFIX}_{SETTING_NAME} in SCREAMING_SNAKE_CASE
 *           Example: OMH_DEBUG_MODE, OMH_BEHAVIOR_TOKENS, etc.
 *
 * @example
 * config.env.OMH_DEBUG_MODE        // "true" or undefined
 * config.env.OMH_BEHAVIOR_TOKENS   // "onlyActive" or undefined
 * config.env.OMH_BEHAVIOR_GM       // "inactive" or undefined
 *
 * // Type conversion
 * const isDebugMode = config.env.OMH_DEBUG_MODE === "true";
 * const tokenCount = parseInt(config.env.OMH_COUNT || "0");
 */
export interface EnvironmentConfig {
  [key: string]: string | undefined;
}
```

---

## Usage Contracts

### Standard Access Pattern

```typescript
/**
 * Access configuration properties using the standard dot notation.
 * All properties are read-only after initialization.
 *
 * @example
 * // Constants (namespace-keyed)
 * config.constants.errors.separator;
 * config.constants.foundry.defaults.i18nLocation;
 * config.constants.hooks.hooks.settingsReady;
 * config.configs.moduleManagement.shortName;
 *
 * // Settings array
 * config.settings.find(s => s.key === 'debugMode');
 * config.settings.forEach(s => console.log(s.config.name));
 *
 * // Module metadata
 * config.module.id;
 * config.module.version;
 *
 * // Environment variables
 * config.env.OMH_DEBUG_MODE;
 * config.env.OMH_BEHAVIOR_TOKENS;
 */
```

### Immutability Contract

```typescript
/**
 * All configuration is immutable after initialization.
 * Modifications are rejected:
 * - Strict mode: Throws TypeError
 * - Non-strict mode: Silently fails
 *
 * @example
 * config.constants.errors.separator = "::";  // Error/fail
 * config.module.version = "13.0.0";          // Error/fail
 * config.settings[0].key = "newKey";         // Error/fail
 * delete config.env.OMH_DEBUG_MODE;          // Error/fail
 *
 * // Attempting to add new properties also fails
 * config.newProperty = "value";              // Error/fail
 */
```

### Type Safety Contract

```typescript
/**
 * Configuration uses strict TypeScript types.
 * IDE autocompletion and type checking available.
 *
 * ✅ Supported (type-safe):
 * - Accessing known properties: config.constants.errors.separator
 * - Iterating typed arrays: config.settings.forEach(...)
 * - Using type-specific constructors: config.settings[0].config.type
 *
 * ❌ Unsupported (type errors):
 * - config.unknownProperty              // TypeScript error
 * - config.settings.forEach(s => s.unknownKey)  // TypeScript error
 * - config.constants.nonExistentConfig  // TypeScript error
 */
```

### Performance Contract

```typescript
/**
 * Configuration access is O(1) - constant time.
 * All data is already loaded; no lazy loading or async operations.
 *
 * @example
 * config.constants.errors.separator;     // Instant (property lookup)
 * config.settings.find(s => s.key === 'x'); // O(n) array search, n = number of settings (~8)
 * config.module.version;                 // Instant (property lookup)
 * config.env.OMH_DEBUG_MODE;             // Instant (object lookup)
 *
 * Performance: <1ms for any access (negligible overhead)
 */
```

---

## Version Information

### API Versioning

```typescript
/**
 * Configuration System API: Version 1.0.0
 *
 * Follows Semantic Versioning:
 * - MAJOR: Breaking changes to public API
 * - MINOR: New features, backward-compatible
 * - PATCH: Bug fixes, no API changes
 *
 * Current: 1.0.0
 * - ✅ Stable for production use
 * - ✅ Long-term support for this major version
 * - ✅ No breaking changes planned during 1.x
 *
 * Compatibility:
 * - Minimum FoundryVTT: 12.0
 * - TypeScript: 4.8+
 * - Node.js: 18+
 */
```

### Stability Guarantees

```typescript
/**
 * 1. Core Property Stability
 *    config.constants - Stable (YAML-driven, changes to constants require code review)
 *    config.settings - Stable (SettingDefinition interface frozen)
 *    config.module - Stable (module.json structure is FoundryVTT standard)
 *    config.env - Stable (process.env interface is global standard)
 *
 * 2. Interface Stability
 *    All exported interfaces are considered stable API contracts.
 *    Changes will increment MAJOR version.
 *
 * 3. Immutability Guarantee
 *    Object.freeze() is permanent; no future changes to mutability.
 *
 * 4. Singleton Guarantee
 *    Always returns same instance; ESM module caching is permanent.
 *
 * 5. Initialization Guarantee
 *    Synchronous, immediate initialization; no future async changes without major version bump.
 */
```

---

## Error Contracts

### Initialization Errors

```typescript
/**
 * If configuration loading fails, an Error is thrown with details.
 * Configuration is NOT partially available; all-or-nothing.
 *
 * @throws {Error} If any required file is missing or invalid
 * @throws {Error} If YAML parsing fails
 * @throws {Error} If JSON parsing fails (module.json)
 *
 * Error messages include:
 * - File path and location
 * - Line/column number if applicable
 * - Expected vs actual format
 * - Consuming code's responsibility to handle
 *
 * @example
 * try {
 *   import config from './src/config/config.ts';
 * } catch (error) {
 *   console.error('Config initialization failed:', error.message);
 *   process.exit(1);  // Module cannot work without config
 * }
 */
```

### Runtime Guarantees

```typescript
/**
 * After successful initialization:
 * - ✅ No errors thrown from config access
 * - ✅ All properties available and valid
 * - ✅ No null/undefined core properties
 * - ✅ No side effects from reading config
 * - ✅ No state changes from config access
 */
```

---

## Deprecation Policy

```typescript
/**
 * Future Breaking Changes (if ever needed, would be major version):
 *
 * 1. Deprecation Notice Period
 *    - Announced in CHANGELOG with version number
 *    - Supported for at least 2 minor versions after notice
 *    - Clear migration path provided
 *
 * 2. Current Status
 *    - No deprecations planned
 *    - Current API is considered permanent for 1.x
 *
 * 3. Examples of What Would NOT Break
 *    - Adding new YAML config files (backward-compatible)
 *    - Adding new optional setting definitions (backward-compatible)
 *    - Adding new environment variables (backward-compatible)
 *    - Adding new optional properties to existing interfaces (not in practice)
 *
 * 4. Examples of What WOULD Break (require major version)
 *    - Changing core property names (config.constants → config.consts)
 *    - Removing required properties
 *    - Changing SettingDefinition required structure
 *    - Making config async (would require async import)
 */
```

---

## Testing Contracts

### Unit Test Expectations

```typescript
/**
 * Config module tests must verify:
 *
 * ✅ Initialization
 *    - Config loads successfully
 *    - All properties populated
 *    - No errors thrown
 *
 * ✅ Immutability
 *    - Modifications throw or fail
 *    - Object.isFrozen(config) === true
 *
 * ✅ Singleton
 *    - Multiple imports return same instance
 *    - === comparison returns true
 *
 * ✅ Type Safety
 *    - TypeScript compilation succeeds
 *    - No 'any' types needed in consuming code
 *
 * ✅ Data Integrity
 *    - Constants match YAML files
 *    - Settings array populated correctly
 *    - Module metadata matches module.json
 *    - Environment variables filtered correctly
 */
```

---

## Summary

| Aspect             | Guarantee                                   |
| ------------------ | ------------------------------------------- |
| **API Version**    | 1.0.0                                       |
| **Stability**      | Stable (no breaking changes planned)        |
| **Accessibility**  | Default export + Type exports               |
| **Performance**    | O(1) property access, <1ms overhead         |
| **Type Safety**    | Full TypeScript support                     |
| **Mutability**     | Immutable (Object.freeze)                   |
| **Concurrency**    | Thread-safe (ESM cached singleton)          |
| **Error Handling** | Fail-fast initialization; no runtime errors |
| **Versioning**     | Semantic versioning (SemVer)                |
| **Deprecation**    | 2+ minor versions notice period             |

---

**API Contract Document Completed**: October 20, 2025
**Status**: ✅ Ready for quickstart guide
