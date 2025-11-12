# API Contract: Hook Formatter

**Module**: `src/utils/hookFormatter.ts`
**Priority**: P2 (Simple hooks), P3 (Parameterized hooks)
**Version**: 1.0.0

## Public API

### formatHookName() - Simple Hooks (P2)

Generates a Foundry VTT hook name for a simple hook key.

**Signature**:

```typescript
function formatHookName(hookKey: string, config: HookFormatterConfig): string;
```

**Parameters**:

- `hookKey` (string, required): Key from `config.constants.hooks.hooks` (e.g., `"settingsReady"`)
- `config` (HookFormatterConfig, required): Configuration object containing hook definitions and patterns

**Returns**: `string` - Formatted hook name (e.g., `"OMH.SettingsReady"`)

**Throws**:

- `Error` if `hookKey` not found in `config.constants.hooks.hooks` (FR-014)
- `Error` if config structure is invalid (FR-025)

---

### formatHookName() - Parameterized Hooks (P3)

Generates a Foundry VTT hook name using a pattern template with parameters.

**Signature**:

```typescript
function formatHookName(
  patternKey: string,
  params: Record<string, string>,
  config: HookFormatterConfig
): string;
```

**Parameters**:

- `patternKey` (string, required): Key from `config.constants.hooks.hookPatterns` (e.g., `"setting"`)
- `params` (Record<string, string>, required): Parameter values for placeholders (e.g., `{ settingKey: "debugMode" }`)
- `config` (HookFormatterConfig, required): Configuration object

**Returns**: `string` - Formatted hook name (e.g., `"OMH.setting.debugMode"`)

**Throws**:

- `Error` if `patternKey` not found in `config.constants.hooks.hookPatterns` (FR-021)
- `Error` if required parameter missing from `params` (FR-020)
- `Error` if config structure is invalid (FR-025)

---

## Type Definitions

```typescript
/**
 * Configuration structure for hook formatting.
 */
export interface HookFormatterConfig {
  constants: {
    hooks: {
      hooks: Record<string, string>;
      hookPatterns: Record<string, string>;
      hookPatternSeparator?: string; // Default: "."
    };
  };
  module?: {
    id?: string;
    title?: string;
    shortName?: string;
  };
  moduleManagement?: {
    referToModuleBy?: 'id' | 'title' | 'shortName';
  };
}
```

---

## Usage Examples

### P2: Simple Hook Names

#### Example 1: Settings Ready Hook

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

const hookName = formatHookName('settingsReady', config);
console.log(hookName);
// Output: "OMH.SettingsReady"

// Use with Foundry Hooks API
Hooks.on(hookName, () => {
  console.log('Settings are ready!');
});
```

**Contract**: FR-007, FR-015 - Generate hook name using `hookPatterns.module` pattern

---

#### Example 2: Context Ready Hook

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

const hookName = formatHookName('contextReady', config);
console.log(hookName);
// Output: "OMH.ContextReady"
```

**Contract**: FR-013 - Replace `{hook}` placeholder with hook value

---

#### Example 3: Error - Unknown Hook Key

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

try {
  formatHookName('unknownHook', config);
} catch (error) {
  console.error(error.message);
  // Output: "[OMH] Hook key "unknownHook" not found in hooks.yaml. Available keys: settingsReady, contextReady"
}
```

**Contract**: FR-014, FR-024 - Throw descriptive error with available options

---

### P3: Parameterized Hook Names

#### Example 4: Setting Change Hook

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

const hookName = formatHookName('setting', { settingKey: 'debugMode' }, config);
console.log(hookName);
// Output: "OMH.setting.debugMode"

// Use with Foundry Hooks API
Hooks.on(hookName, (newValue) => {
  console.log(`Debug mode changed to: ${newValue}`);
});
```

**Contract**: FR-016, FR-018 - Parameterized hook with dynamic placeholder

---

#### Example 5: Error - Missing Required Parameter

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

try {
  formatHookName('setting', {}, config);
} catch (error) {
  console.error(error.message);
  // Output: "[OMH] Missing required parameter "settingKey" for pattern "setting". Required: moduleReference, separator, settingKey"
}
```

**Contract**: FR-020, FR-024 - Throw error for missing parameter with required list

---

#### Example 6: Extra Parameters Ignored

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

const hookName = formatHookName(
  'setting',
  {
    settingKey: 'debugMode',
    extra: 'ignored',
    unused: 'also-ignored',
  },
  config
);
console.log(hookName);
// Output: "OMH.setting.debugMode"
```

**Contract**: FR-022 - Ignore extra parameters not used in template

---

#### Example 7: Error - Unknown Pattern Key

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

try {
  formatHookName('unknownPattern', { key: 'value' }, config);
} catch (error) {
  console.error(error.message);
  // Output: "[OMH] Pattern key "unknownPattern" not found in hookPatterns. Available patterns: module, setting"
}
```

**Contract**: FR-021, FR-024 - Throw error for missing pattern with available list

---

## Functional Requirements Coverage

### P2: Simple Hooks

| Requirement                               | Status | Test Case                         |
| ----------------------------------------- | ------ | --------------------------------- |
| FR-007: Provide formatHookName function   | ✅     | API exists with correct signature |
| FR-008: Read hook definitions from config | ✅     | Example 1, 2                      |
| FR-009: Read hook patterns from config    | ✅     | Example 1, 2                      |
| FR-010: Read separator with default       | ✅     | Uses "." if undefined             |
| FR-011: Resolve module reference          | ✅     | Calls resolveModuleName(config)   |
| FR-012: Replace {separator} placeholder   | ✅     | Example 1, 2                      |
| FR-013: Replace {hook} placeholder        | ✅     | Example 1, 2                      |
| FR-014: Throw error for unknown hook key  | ✅     | Example 3                         |
| FR-015: Use hookPatterns.module pattern   | ✅     | Example 1, 2                      |

### P3: Parameterized Hooks

| Requirement                             | Status | Test Case                              |
| --------------------------------------- | ------ | -------------------------------------- |
| FR-016: Provide parameterized overload  | ✅     | API exists with params parameter       |
| FR-017: Read pattern from hookPatterns  | ✅     | Example 4                              |
| FR-018: Replace all placeholders        | ✅     | Example 4                              |
| FR-019: Resolve special placeholders    | ✅     | Example 4 (moduleReference, separator) |
| FR-020: Throw error for missing param   | ✅     | Example 5                              |
| FR-021: Throw error for unknown pattern | ✅     | Example 7                              |
| FR-022: Ignore extra parameters         | ✅     | Example 6                              |

### Error Handling

| Requirement                                 | Status | Test Case          |
| ------------------------------------------- | ------ | ------------------ |
| FR-023: Prefix errors with [OMH]            | ✅     | All error examples |
| FR-024: Include available options in errors | ✅     | Examples 3, 5, 7   |
| FR-025: Validate config structure           | ✅     | Config validation  |

---

## Config Structure Requirements

### Valid Config Example

```typescript
const config = {
  constants: {
    hooks: {
      hooks: {
        settingsReady: 'SettingsReady',
        contextReady: 'ContextReady',
      },
      hookPatterns: {
        module: '{moduleReference}{separator}{hook}',
        setting: '{moduleReference}{separator}setting{separator}{settingKey}',
      },
      hookPatternSeparator: '.', // Optional, defaults to "."
    },
  },
  module: {
    id: 'foundryvtt-over-my-head',
    title: 'Over My Head',
    shortName: 'OMH',
  },
  moduleManagement: {
    referToModuleBy: 'shortName', // Uses module.shortName for {moduleReference}
  },
};
```

### Config Validation

```typescript
// Invalid: missing constants.hooks
const badConfig1 = {};
formatHookName('settingsReady', badConfig1);
// Error: "[OMH] Invalid config: missing constants.hooks"

// Invalid: hooks is not an object
const badConfig2 = {
  constants: {
    hooks: {
      hooks: null, // Should be object
      hookPatterns: {},
    },
  },
};
formatHookName('settingsReady', badConfig2);
// Error: "[OMH] Invalid config: constants.hooks.hooks must be an object"
```

**Contract**: FR-025 - Validate config structure before formatting

---

## Placeholder Resolution

### Special Placeholders (Auto-Resolved)

These placeholders are resolved automatically by the formatter:

| Placeholder         | Source                                                 | Example Value     |
| ------------------- | ------------------------------------------------------ | ----------------- |
| `{moduleReference}` | `resolveModuleName(config)`                            | `"OMH"`           |
| `{separator}`       | `config.constants.hooks.hookPatternSeparator` or `"."` | `"."`             |
| `{hook}`            | `config.constants.hooks.hooks[hookKey]` (P2 only)      | `"SettingsReady"` |

### User-Provided Placeholders (P3)

These must be provided in the `params` object:

| Placeholder    | Param Key    | Example Value |
| -------------- | ------------ | ------------- |
| `{settingKey}` | `settingKey` | `"debugMode"` |
| `{tokenId}`    | `tokenId`    | `"actor123"`  |
| `{sceneId}`    | `sceneId`    | `"scene456"`  |

**Custom patterns** in `hooks.yaml` can define any placeholders. The formatter will:

1. Extract placeholder names from the template (e.g., `{customParam}`)
2. Require them in `params` or throw error
3. Replace them with provided values

---

## Edge Cases

### Empty Hook Value

```typescript
// hooks.yaml contains:
// hooks:
//   emptyHook: ""

const result = formatHookName('emptyHook', config);
// Output: "OMH." (module reference + separator + empty hook value)
```

**Behavior**: Empty hook values are valid; separator is still included

---

### Custom Separator

```typescript
const config = {
  constants: {
    hooks: {
      hooks: { test: 'Test' },
      hookPatterns: { module: '{moduleReference}{separator}{hook}' },
      hookPatternSeparator: '::', // Custom separator
    },
  },
  // ... rest of config
};

const result = formatHookName('test', config);
// Output: "OMH::Test"
```

**Contract**: FR-010 - Separator is configurable via `hookPatternSeparator`

---

### Undefined Separator (Uses Default)

```typescript
const config = {
  constants: {
    hooks: {
      hooks: { test: 'Test' },
      hookPatterns: { module: '{moduleReference}{separator}{hook}' },
      // hookPatternSeparator not defined
    },
  },
  // ... rest of config
};

const result = formatHookName('test', config);
// Output: "OMH.Test" (uses default ".")
```

**Contract**: FR-010 - Default separator is `"."`

---

### Module Reference Resolution Failure

```typescript
const config = {
  constants: {
    hooks: {
      hooks: { test: 'Test' },
      hookPatterns: { module: '{moduleReference}{separator}{hook}' },
    },
  },
  module: {}, // All module fields undefined
  // moduleManagement not defined
};

const result = formatHookName('test', config);
// Output: "Unknown Module.Test"
// (resolveModuleName returns "Unknown Module" as fallback)
```

**Behavior**: Relies on `resolveModuleName` fallback behavior

---

## Performance Contract

**Target**: <1ms per operation (SC-007)

**Benchmark**:

```typescript
const iterations = 1000;
const start = performance.now();

for (let i = 0; i < iterations; i++) {
  formatHookName('settingsReady', config);
}

const duration = performance.now() - start;
const avgTime = duration / iterations;
console.log(`Average time per operation: ${avgTime.toFixed(4)}ms`);
// Expected: <0.01ms (10 microseconds)
```

**Complexity**:

- Time: O(m + k) where m = template length, k = number of placeholders
- Space: O(m) for result string

---

## Integration with Foundry Hooks

### Calling Hooks

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

const hookName = formatHookName('settingsReady', config);

// Call the hook (trigger event)
Hooks.call(hookName, additionalData);
```

### Listening to Hooks

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

const hookName = formatHookName('settingsReady', config);

// Listen for the hook
Hooks.on(hookName, (data) => {
  console.log('Hook triggered:', data);
});
```

### One-Time Hook Listeners

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

const hookName = formatHookName('settingsReady', config);

// Listen once
Hooks.once(hookName, (data) => {
  console.log('Hook triggered once:', data);
});
```

**Contract**: SC-006 - Integration tests must demonstrate Foundry Hooks API compatibility

---

## Testing Requirements

**Unit Tests** (`tests/unit/hookFormatter.unit.test.mjs`):

Required test cases for P2:

1. ✅ Simple hook: `formatHookName('settingsReady', mockConfig)` → `"OMH.SettingsReady"`
2. ✅ Another hook: `formatHookName('contextReady', mockConfig)` → `"OMH.ContextReady"`
3. ✅ Unknown hook key error with available keys
4. ✅ Custom separator: `hookPatternSeparator: "::"` → `"OMH::SettingsReady"`
5. ✅ Undefined separator uses default `"."`
6. ✅ Invalid config structure errors

Required test cases for P3:

1. ✅ Parameterized hook: `formatHookName('setting', { settingKey: 'debugMode' }, mockConfig)` → `"OMH.setting.debugMode"`
2. ✅ Missing parameter error with required list
3. ✅ Extra parameters ignored
4. ✅ Unknown pattern key error with available patterns
5. ✅ Multiple parameters: Custom pattern with 3+ placeholders

**Integration Tests** (`tests/integration/hookFormatter.int.test.mjs`):

1. ✅ Use real config loaded from `hooks.yaml`
2. ✅ Verify all defined hooks generate correct names
3. ✅ Verify all defined patterns work with real placeholders
4. ✅ Test with real `resolveModuleName` (not mocked)

**Coverage Target**: ≥80% (likely 90-95% given comprehensive error handling)

---

## Dependencies

**External**: None
**Internal**:

- `resolveModuleName` from `src/utils/static/moduleNameResolver.ts` (FR-011)
- Config singleton (passed as parameter, not directly imported)

---

## Migration & Compatibility

**Breaking Changes**: N/A (new feature)

**Backward Compatibility**: N/A (new feature)

**Future Extensions**:

- Pattern validation at module load time (catch errors early)
- Pattern template caching for performance
- Support for nested placeholders (e.g., `{module.shortName}`)
- Pattern inheritance (base patterns + overrides)

All extensions would be backward-compatible.

---

## Success Criteria Alignment

| Criterion                               | Status | Evidence                                      |
| --------------------------------------- | ------ | --------------------------------------------- |
| SC-001: Independently testable          | ✅     | P2/P3 testable separately                     |
| SC-002: ≥80% test coverage              | ✅     | Target 90-95%                                 |
| SC-003: All hooks.yaml entries work     | ✅     | Integration tests verify                      |
| SC-004: All patterns work correctly     | ✅     | Integration tests verify                      |
| SC-005: Descriptive errors with [OMH]   | ✅     | All errors prefixed and contextual            |
| SC-006: Foundry Hooks API compatibility | ✅     | Integration tests with Hooks.on/call          |
| SC-007: <1ms performance                | ✅     | String ops only, O(m+k) complexity            |
| SC-010: Style guide compliance          | ✅     | Will have file header, JSDoc, type separation |

---

## File Locations

**Implementation**: `src/utils/hookFormatter.ts`
**Types**: `src/utils/hookFormatter-types.ts`
**Tests**:

- `tests/unit/hookFormatter.unit.test.mjs`
- `tests/integration/hookFormatter.int.test.mjs`

---

**Contract Version**: 1.0.0
**Last Updated**: 2025-11-12
**Status**: Ready for implementation
