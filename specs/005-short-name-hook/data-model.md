# Data Model: Hook Formatter Utility

**Feature**: Hook Formatter Utility
**Branch**: `005-short-name-hook`
**Date**: 2025-11-12

## Overview

This document defines the data structures and type definitions for the Hook Formatter Utility. Since this is a pure utility feature with no persistent state, the "data model" consists primarily of TypeScript interfaces and type definitions.

## Type Definitions

### P1: String Formatter Types

#### FormatOptions

Configuration object for string formatting operations.

```typescript
/**
 * Options for formatting a string with prefix and/or suffix.
 */
export interface FormatOptions {
  /**
   * String to prepend to the base string.
   * @optional
   */
  prefix?: string;

  /**
   * String to append to the base string.
   * @optional
   */
  suffix?: string;
}
```

**Validation Rules**:

- Both `prefix` and `suffix` are optional
- If both omitted, function returns base string unchanged (identity operation)
- Empty strings are valid values (FR-006)
- No maximum length constraints (performance target <1ms handles typical cases)

**Usage Examples**:

```typescript
// Prefix only
{ prefix: "hello-" }

// Suffix only
{ suffix: "-!" }

// Both
{ prefix: "hello-", suffix: "-!" }

// Empty (identity)
{}
```

---

### P2/P3: Hook Formatter Types

#### HookFormatterConfig

Subset of the main config object required for hook formatting.

```typescript
/**
 * Configuration structure expected by hook formatter.
 * Subset of main Config type focused on hooks.
 */
export interface HookFormatterConfig {
  constants: {
    hooks: {
      /**
       * Map of hook keys to their display values.
       * Example: { settingsReady: "SettingsReady" }
       */
      hooks: Record<string, string>;

      /**
       * Map of pattern keys to template strings with placeholders.
       * Example: { module: "{moduleReference}{separator}{hook}" }
       */
      hookPatterns: Record<string, string>;

      /**
       * Separator character used between hook name components.
       * Default: "."
       */
      hookPatternSeparator?: string;
    };
  };

  /**
   * Module metadata used for resolving {moduleReference} placeholder.
   */
  module?: {
    id?: string;
    title?: string;
    shortName?: string;
  };

  /**
   * Module management configuration for name resolution strategy.
   */
  moduleManagement?: {
    referToModuleBy?: 'id' | 'title' | 'shortName';
  };
}
```

**Validation Rules**:

- `config.constants.hooks` MUST exist (FR-025)
- `config.constants.hooks.hooks` MUST be an object (FR-008)
- `config.constants.hooks.hookPatterns` MUST be an object (FR-009)
- `hookPatternSeparator` defaults to `"."` if undefined (FR-010)
- `module` and `moduleManagement` are optional (defaults provided by moduleNameResolver)

**Structure Validation**:

```typescript
function validateConfig(
  config: unknown
): asserts config is HookFormatterConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('[OMH] Invalid config: expected object');
  }

  const c = config as any;
  if (!c.constants?.hooks) {
    throw new Error('[OMH] Invalid config: missing constants.hooks');
  }

  if (typeof c.constants.hooks.hooks !== 'object') {
    throw new Error(
      '[OMH] Invalid config: constants.hooks.hooks must be an object'
    );
  }

  if (typeof c.constants.hooks.hookPatterns !== 'object') {
    throw new Error(
      '[OMH] Invalid config: constants.hooks.hookPatterns must be an object'
    );
  }
}
```

---

#### PlaceholderValues

Internal type for placeholder replacement.

```typescript
/**
 * Map of placeholder names to their replacement values.
 * Placeholder names do NOT include braces.
 * Example: { moduleReference: "OMH", separator: ".", hook: "SettingsReady" }
 */
export type PlaceholderValues = Record<string, string>;
```

**Usage Context**:

- Internal to hookFormatter implementation
- Not exported in public API
- Used during pattern template replacement

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                      HookFormatterConfig                     │
│  (Main config object passed to formatHookName)              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ contains
                        │
        ┌───────────────┴──────────────┐
        │                               │
        ▼                               ▼
┌────────────────────┐      ┌──────────────────────┐
│  hooks (object)    │      │ hookPatterns (object)│
│  Key: hookKey      │      │ Key: patternKey      │
│  Value: hookValue  │      │ Value: template      │
└────────────────────┘      └──────────────────────┘
        │                               │
        │ used by P2                    │ used by P3
        │                               │
        ▼                               ▼
┌────────────────────┐      ┌──────────────────────┐
│ formatHookName     │      │ formatHookName       │
│ (simple)           │      │ (parameterized)      │
│                    │      │                      │
│ Input: hookKey     │      │ Input: patternKey    │
│ Output: formatted  │      │        params        │
│         hook name  │      │ Output: formatted    │
│                    │      │         hook name    │
└────────────────────┘      └──────────────────────┘
```

**Dependencies Flow**:

1. Consumer calls `formatHookName` with config
2. Function validates config structure (FR-025)
3. For P2: Looks up `hookKey` in `config.constants.hooks.hooks`
4. For P3: Looks up `patternKey` in `config.constants.hooks.hookPatterns`
5. Resolves placeholders using `resolveModuleName` and config values
6. Returns formatted hook name string

---

## Data Flow

### P1: String Formatter

**Input**: `base: string`, `options?: FormatOptions`
**Processing**: Simple string concatenation
**Output**: `string`

```
Input: "world", { prefix: "hello-", suffix: "!" }
  ↓
Processing:
  1. result = ""
  2. if (options.prefix) result += options.prefix  → "hello-"
  3. result += base                                → "hello-world"
  4. if (options.suffix) result += options.suffix  → "hello-world!"
  ↓
Output: "hello-world!"
```

**State**: None (stateless pure function)
**Side Effects**: None

---

### P2: Simple Hook Name Generation

**Input**: `hookKey: string`, `config: HookFormatterConfig`
**Processing**: Config lookup + placeholder replacement
**Output**: `string`

```
Input: "settingsReady", config

  ↓
Step 1: Validate config structure
  ✓ config.constants.hooks exists
  ✓ config.constants.hooks.hooks exists
  ↓
Step 2: Look up hook value
  hooks["settingsReady"] → "SettingsReady"
  ↓
Step 3: Get pattern template
  hookPatterns["module"] → "{moduleReference}{separator}{hook}"
  ↓
Step 4: Resolve placeholders
  {moduleReference} → resolveModuleName(config) → "OMH"
  {separator}       → config.constants.hooks.hookPatternSeparator || "." → "."
  {hook}            → "SettingsReady"
  ↓
Step 5: Replace placeholders
  "{moduleReference}{separator}{hook}"
  → "OMH.SettingsReady"
  ↓
Output: "OMH.SettingsReady"
```

**State**: None (stateless function)
**Side Effects**: None (reads config, doesn't modify)

---

### P3: Parameterized Hook Name Generation

**Input**: `patternKey: string`, `params: Record<string, string>`, `config: HookFormatterConfig`
**Processing**: Pattern lookup + multi-placeholder replacement
**Output**: `string`

```
Input: "setting", { settingKey: "debugMode" }, config

  ↓
Step 1: Validate config structure
  ✓ config.constants.hooks exists
  ✓ config.constants.hooks.hookPatterns exists
  ↓
Step 2: Look up pattern template
  hookPatterns["setting"] → "{moduleReference}{separator}setting{separator}{settingKey}"
  ↓
Step 3: Extract required placeholders from template
  Required: ["moduleReference", "separator", "settingKey"]
  ↓
Step 4: Resolve all placeholders
  {moduleReference} → resolveModuleName(config) → "OMH"
  {separator}       → config.constants.hooks.hookPatternSeparator || "." → "."
  {settingKey}      → params["settingKey"] → "debugMode"
  ↓
Step 5: Validate all required placeholders provided
  ✓ "moduleReference" → from config
  ✓ "separator"       → from config
  ✓ "settingKey"      → from params
  ↓
Step 6: Replace all placeholders
  "{moduleReference}{separator}setting{separator}{settingKey}"
  → "OMH.setting.debugMode"
  ↓
Output: "OMH.setting.debugMode"
```

**State**: None (stateless function)
**Side Effects**: None

---

## Error Cases

### Missing Hook Key (P2)

```
Input: "unknownHook", config

  ↓
Step 2: Look up hook value
  hooks["unknownHook"] → undefined
  ↓
Error: "[OMH] Hook key "unknownHook" not found in hooks.yaml. Available keys: settingsReady, contextReady"
```

---

### Missing Pattern Key (P3)

```
Input: "unknownPattern", params, config

  ↓
Step 2: Look up pattern template
  hookPatterns["unknownPattern"] → undefined
  ↓
Error: "[OMH] Pattern key "unknownPattern" not found in hookPatterns. Available patterns: module, setting"
```

---

### Missing Required Parameter (P3)

```
Input: "setting", {}, config

  ↓
Step 5: Validate all required placeholders provided
  ✗ "settingKey" → params["settingKey"] → undefined
  ↓
Error: "[OMH] Missing required parameter "settingKey" for pattern "setting". Required: moduleReference, separator, settingKey"
```

---

### Invalid Config Structure

```
Input: hookKey, null

  ↓
Step 1: Validate config structure
  ✗ config is null
  ↓
Error: "[OMH] Invalid config: expected object"
```

---

## Performance Characteristics

| Operation              | Time Complexity | Space Complexity | Notes                              |
| ---------------------- | --------------- | ---------------- | ---------------------------------- |
| formatString           | O(n)            | O(n)             | n = total string length            |
| formatHookName (P2)    | O(m)            | O(m)             | m = template length (~20-50 chars) |
| formatHookName (P3)    | O(m + k)        | O(m)             | k = number of parameters (~2-5)    |
| Config validation      | O(1)            | O(1)             | Fixed structure checks             |
| Placeholder extraction | O(m)            | O(p)             | p = number of placeholders (~3-5)  |

**Expected Performance**:

- All operations <1ms for typical inputs (SC-007)
- No I/O, no network, no file system access
- Pure string manipulation only

---

## Immutability Constraints

All functions are **pure** and **stateless**:

- ✅ No global state
- ✅ No mutation of input parameters
- ✅ No side effects
- ✅ Same inputs always produce same outputs
- ✅ Config is read-only (already frozen by config system)

**Testing Implication**: All functions are trivially testable with no mocking required for P1, minimal mocking for P2/P3 (just config structure).

---

## Summary

This data model defines:

1. ✅ **FormatOptions**: Simple interface for P1 string formatting
2. ✅ **HookFormatterConfig**: Type-safe config structure for P2/P3
3. ✅ **PlaceholderValues**: Internal type for replacement logic
4. ✅ **Validation rules**: Runtime checks for config structure
5. ✅ **Data flow**: Step-by-step processing for all three priorities
6. ✅ **Error cases**: Complete error handling documentation
7. ✅ **Performance**: Complexity analysis confirming <1ms target

**Next Phase**: API Contracts (define public APIs and usage examples)
