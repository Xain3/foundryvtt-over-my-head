# Quickstart: Hook Formatter Utility

**Feature**: Hook Formatter Utility  
**Branch**: `005-short-name-hook`  
**For**: Developers implementing or using this feature

## 🚀 TL;DR

Three utilities in one feature:
1. **`formatString()`** - Pure string formatter (prefix/suffix)
2. **`formatHookName(hookKey, config)`** - Simple module-scoped hooks
3. **`formatHookName(patternKey, params, config)`** - Parameterized hooks

**Install**: No installation needed - utilities are part of module  
**Dependencies**: Zero external, uses existing config system

---

## 📋 Quick Reference

### String Formatter (P1)

```typescript
import { formatString } from '#/utils/stringFormatter.ts';

formatString("world", { prefix: "hello-" });              // → "hello-world"
formatString("world", { suffix: "!" });                   // → "world!"
formatString("world", { prefix: "hello-", suffix: "!" }); // → "hello-world!"
formatString("world");                                     // → "world"
```

### Hook Formatter (P2/P3)

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

// Simple hooks (P2)
formatHookName('settingsReady', config);  // → "OMH.SettingsReady"
formatHookName('contextReady', config);   // → "OMH.ContextReady"

// Parameterized hooks (P3)
formatHookName('setting', { settingKey: 'debugMode' }, config);  // → "OMH.setting.debugMode"
```

---

## 🎯 Common Use Cases

### Use Case 1: Generate Hook Name for Foundry

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

// Generate the hook name
const hookName = formatHookName('settingsReady', config);

// Use with Foundry Hooks API
Hooks.on(hookName, () => {
  console.log('[OMH] Settings are ready!');
});

// Later, call the hook
Hooks.call(hookName);
```

**Why**: Ensures consistent hook naming across the module without hardcoding strings.

---

### Use Case 2: Dynamic Setting Hooks

```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

// Register a listener for a specific setting
function watchSetting(settingKey: string, callback: (value: any) => void) {
  const hookName = formatHookName('setting', { settingKey }, config);
  
  Hooks.on(hookName, callback);
}

// Usage
watchSetting('debugMode', (newValue) => {
  console.log(`Debug mode changed to: ${newValue}`);
});

// Trigger the hook when setting changes
function onSettingChange(settingKey: string, newValue: any) {
  const hookName = formatHookName('setting', { settingKey }, config);
  Hooks.call(hookName, newValue);
}
```

**Why**: Dynamically generate setting-specific hook names without manual string concatenation.

---

### Use Case 3: Prefix/Suffix String Formatting

```typescript
import { formatString } from '#/utils/stringFormatter.ts';

// Generate CSS class names
const className = formatString("modal", { prefix: "omh-", suffix: "--active" });
// → "omh-modal--active"

// Generate log prefixes
const logMessage = formatString("Config loaded", { prefix: "[OMH] " });
// → "[OMH] Config loaded"

// Generate file paths
const filePath = formatString("config", { prefix: "src/", suffix: ".yaml" });
// → "src/config.yaml"
```

**Why**: Reusable utility for any string formatting need, not just hooks.

---

## 🛠️ Implementation Steps

### Step 1: Implement String Formatter (P1)

**File**: `src/utils/stringFormatter-types.ts`
```typescript
/**
 * @file stringFormatter-types.ts
 * @description Type definitions for string formatting utility
 * @path src/utils/stringFormatter-types.ts
 */

export interface FormatOptions {
  prefix?: string;
  suffix?: string;
}
```

**File**: `src/utils/stringFormatter.ts`
```typescript
/**
 * @file stringFormatter.ts
 * @description Pure string formatting utility with prefix/suffix support
 * @path src/utils/stringFormatter.ts
 */

import type { FormatOptions } from './stringFormatter-types.ts';

/**
 * Formats a string by prepending an optional prefix and/or appending an optional suffix.
 *
 * @param {string} base - The base string to format
 * @param {FormatOptions} [options] - Optional formatting configuration
 * @returns {string} The formatted string
 *
 * @example
 * formatString("world", { prefix: "hello-" }); // → "hello-world"
 * formatString("world", { suffix: "!" }); // → "world!"
 * formatString("world", { prefix: "hello-", suffix: "!" }); // → "hello-world!"
 */
export function formatString(base: string, options?: FormatOptions): string {
  const { prefix = '', suffix = '' } = options || {};
  return `${prefix}${base}${suffix}`;
}
```

**Test**: `tests/unit/stringFormatter.unit.test.mjs`
```javascript
/**
 * @file stringFormatter.unit.test.mjs
 * @description Unit tests for string formatter utility
 * @path tests/unit/stringFormatter.unit.test.mjs
 */

import { describe, it, expect } from 'vitest';
import { formatString } from '#/utils/stringFormatter.ts';

describe('formatString', () => {
  it('should prepend prefix', () => {
    expect(formatString("world", { prefix: "hello-" })).toBe("hello-world");
  });

  it('should append suffix', () => {
    expect(formatString("world", { suffix: "!" })).toBe("world!");
  });

  it('should handle both prefix and suffix', () => {
    expect(formatString("world", { prefix: "hello-", suffix: "!" })).toBe("hello-world!");
  });

  it('should return unchanged when no options', () => {
    expect(formatString("world")).toBe("world");
  });

  it('should handle empty string', () => {
    expect(formatString("", { prefix: "a", suffix: "b" })).toBe("ab");
  });
});
```

**Run tests**: `npm test -- stringFormatter`

---

### Step 2: Implement Hook Formatter (P2/P3)

**File**: `src/utils/hookFormatter-types.ts`
```typescript
/**
 * @file hookFormatter-types.ts
 * @description Type definitions for hook formatter utility
 * @path src/utils/hookFormatter-types.ts
 */

export interface HookFormatterConfig {
  constants: {
    hooks: {
      hooks: Record<string, string>;
      hookPatterns: Record<string, string>;
      hookPatternSeparator?: string;
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

**File**: `src/utils/hookFormatter.ts`
```typescript
/**
 * @file hookFormatter.ts
 * @description Hook name formatter using config and patterns
 * @path src/utils/hookFormatter.ts
 */

import type { HookFormatterConfig } from './hookFormatter-types.ts';
import { resolveModuleName } from './static/moduleNameResolver.ts';

// P2: Simple hook overload
export function formatHookName(hookKey: string, config: HookFormatterConfig): string;

// P3: Parameterized hook overload
export function formatHookName(
  patternKey: string,
  params: Record<string, string>,
  config: HookFormatterConfig
): string;

// Implementation
export function formatHookName(
  keyOrPattern: string,
  configOrParams: HookFormatterConfig | Record<string, string>,
  maybeConfig?: HookFormatterConfig
): string {
  // Determine which overload was called
  const isParameterized = maybeConfig !== undefined;
  
  if (isParameterized) {
    // P3: Parameterized hook
    const patternKey = keyOrPattern;
    const params = configOrParams as Record<string, string>;
    const config = maybeConfig!;
    
    return formatParameterizedHook(patternKey, params, config);
  } else {
    // P2: Simple hook
    const hookKey = keyOrPattern;
    const config = configOrParams as HookFormatterConfig;
    
    return formatSimpleHook(hookKey, config);
  }
}

function formatSimpleHook(hookKey: string, config: HookFormatterConfig): string {
  validateConfig(config);
  
  const { hooks, hookPatterns, hookPatternSeparator = '.' } = config.constants.hooks;
  
  // Look up hook value
  const hookValue = hooks[hookKey];
  if (hookValue === undefined) {
    const available = Object.keys(hooks).join(', ');
    throw new Error(`[OMH] Hook key "${hookKey}" not found in hooks.yaml. Available keys: ${available}`);
  }
  
  // Get pattern template
  const template = hookPatterns.module;
  if (!template) {
    throw new Error('[OMH] Missing required pattern: hookPatterns.module');
  }
  
  // Resolve placeholders
  const moduleRef = resolveModuleName(config);
  const placeholders = {
    moduleReference: moduleRef,
    separator: hookPatternSeparator,
    hook: hookValue
  };
  
  return replacePlaceholders(template, placeholders);
}

function formatParameterizedHook(
  patternKey: string,
  params: Record<string, string>,
  config: HookFormatterConfig
): string {
  validateConfig(config);
  
  const { hookPatterns, hookPatternSeparator = '.' } = config.constants.hooks;
  
  // Look up pattern template
  const template = hookPatterns[patternKey];
  if (template === undefined) {
    const available = Object.keys(hookPatterns).join(', ');
    throw new Error(`[OMH] Pattern key "${patternKey}" not found in hookPatterns. Available patterns: ${available}`);
  }
  
  // Extract required placeholders
  const required = extractPlaceholders(template);
  
  // Resolve special placeholders
  const moduleRef = resolveModuleName(config);
  const allValues = {
    moduleReference: moduleRef,
    separator: hookPatternSeparator,
    ...params
  };
  
  // Validate all required placeholders provided
  for (const placeholder of required) {
    if (allValues[placeholder] === undefined) {
      throw new Error(
        `[OMH] Missing required parameter "${placeholder}" for pattern "${patternKey}". Required: ${required.join(', ')}`
      );
    }
  }
  
  return replacePlaceholders(template, allValues);
}

function validateConfig(config: HookFormatterConfig): void {
  if (!config?.constants?.hooks) {
    throw new Error('[OMH] Invalid config: missing constants.hooks');
  }
  
  if (typeof config.constants.hooks.hooks !== 'object') {
    throw new Error('[OMH] Invalid config: constants.hooks.hooks must be an object');
  }
  
  if (typeof config.constants.hooks.hookPatterns !== 'object') {
    throw new Error('[OMH] Invalid config: constants.hooks.hookPatterns must be an object');
  }
}

function extractPlaceholders(template: string): string[] {
  const matches = template.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map(m => m.slice(1, -1)); // Remove braces
}

function replacePlaceholders(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}
```

**Test**: `tests/unit/hookFormatter.unit.test.mjs` and `tests/integration/hookFormatter.int.test.mjs`

**Run tests**: `npm test -- hookFormatter`

---

### Step 3: Update Documentation

**Update**: `src/utils/README.md`
```markdown
# Utilities

## String Formatter

Pure string formatting utility with prefix/suffix support.

**Usage**:
```typescript
import { formatString } from '#/utils/stringFormatter.ts';
formatString("base", { prefix: "pre-", suffix: "-post" });
```

See: [API Contract](../../specs/005-short-name-hook/contracts/stringFormatter-api.md)

## Hook Formatter

Generates Foundry VTT hook names from config patterns.

**Usage**:
```typescript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

formatHookName('settingsReady', config);
formatHookName('setting', { settingKey: 'debugMode' }, config);
```

See: [API Contract](../../specs/005-short-name-hook/contracts/hookFormatter-api.md)
```

---

## ✅ Acceptance Criteria

Before considering implementation complete, verify:

- [ ] P1: `formatString()` implemented with all acceptance scenarios passing
- [ ] P1: Unit tests achieve 100% coverage (pure function, no error paths)
- [ ] P2: `formatHookName(hookKey, config)` implemented for simple hooks
- [ ] P2: Error handling for missing hook keys with available keys listed
- [ ] P3: `formatHookName(patternKey, params, config)` overload for parameterized hooks
- [ ] P3: Error handling for missing parameters and patterns
- [ ] Integration tests use real config from `hooks.yaml`
- [ ] All errors prefixed with `[OMH]`
- [ ] Performance benchmarks confirm <1ms operations
- [ ] `src/utils/README.md` updated with new utilities
- [ ] File headers present on all new files (`@file`, `@description`, `@path`)
- [ ] JSDoc comments on all public functions
- [ ] Type definitions in separate `-types.ts` files
- [ ] Import aliasing used (`#/utils/`, `#config`)

---

## 🧪 Testing Strategy

### Unit Tests (Isolated)

```bash
# Test P1 only
npm test -- stringFormatter.unit.test

# Test P2/P3 only
npm test -- hookFormatter.unit.test

# Run all unit tests
npm test -- --project unit
```

### Integration Tests (Real Config)

```bash
# Test with real hooks.yaml
npm test -- hookFormatter.int.test

# Run all integration tests
npm test -- --project integration
```

### Coverage Check

```bash
# Generate coverage report
npm test -- --coverage

# View coverage in browser
open coverage/index.html
```

**Target**: ≥80% overall, 100% for P1, 90-95% for P2/P3

---

## 🚨 Common Pitfalls

### Pitfall 1: Forgetting to Import Config

```typescript
// ❌ Wrong: No config provided
formatHookName('settingsReady'); // Error: Cannot read property 'constants' of undefined

// ✅ Correct: Pass config
import { config } from '#config';
formatHookName('settingsReady', config);
```

### Pitfall 2: Using Wrong Overload for Parameterized Hooks

```typescript
// ❌ Wrong: Trying to pass params to simple overload
formatHookName('setting', config); // Error: "setting" not found in hooks

// ✅ Correct: Use parameterized overload
formatHookName('setting', { settingKey: 'debugMode' }, config);
```

### Pitfall 3: Hardcoding Module Reference

```typescript
// ❌ Wrong: Hardcoded module name
const hookName = `OMH.${hookValue}`;

// ✅ Correct: Use formatter (respects config)
const hookName = formatHookName('settingsReady', config);
```

---

## 📚 Further Reading

- [Feature Specification](./spec.md) - Complete requirements and user stories
- [Data Model](./data-model.md) - Type definitions and data flow
- [String Formatter API](./contracts/stringFormatter-api.md) - P1 contract
- [Hook Formatter API](./contracts/hookFormatter-api.md) - P2/P3 contract
- [Research Findings](./research.md) - Design decisions and alternatives
- [Foundry Hooks API](https://foundryvtt.com/api/classes/foundry.helpers.Hooks.html) - Official documentation

---

## 🆘 Troubleshooting

### Problem: Tests fail with "Cannot find module"

**Solution**: Check import aliases in `alias.config.mjs` and `vitest.config.mjs`

### Problem: Config validation fails

**Solution**: Verify `hooks.yaml` structure matches `HookFormatterConfig` interface

### Problem: Performance tests show >1ms

**Solution**: Check for accidental I/O or heavy computation in placeholder replacement

### Problem: Integration tests fail but unit tests pass

**Solution**: Verify real `hooks.yaml` has all expected keys and patterns

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-11-12  
**Status**: Ready for implementation
