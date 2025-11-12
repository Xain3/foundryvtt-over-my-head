# Research: Hook Formatter Utility

**Feature**: Hook Formatter Utility  
**Branch**: `005-short-name-hook`  
**Date**: 2025-11-12  
**Status**: Complete

## Overview

This document captures research findings and design decisions for the Hook Formatter Utility feature. Since the technical context is well-defined and leverages existing project infrastructure, minimal external research was required.

## Research Tasks

### Task 1: String Formatting Patterns in JavaScript/TypeScript

**Question**: What are the best practices for implementing a string formatter with prefix/suffix support?

**Decision**: Use simple string concatenation with optional parameters

**Rationale**:
- **Performance**: String concatenation in modern JavaScript engines is highly optimized
- **Simplicity**: No regex, no template engines - just pure string operations
- **Type Safety**: TypeScript optional properties (`prefix?`, `suffix?`) provide clear API
- **Testability**: Pure function with no dependencies makes testing trivial

**Alternatives Considered**:
1. **Template literal approach** - Rejected: Overkill for simple prefix/suffix operations
2. **String.prototype extension** - Rejected: Violates modular architecture principle (no global pollution)
3. **Builder pattern with chaining** - Rejected: Unnecessary complexity for 2-parameter operation

**Best Practices Applied**:
- Return original string unchanged when no options provided (identity operation)
- Handle empty strings gracefully (FR-006)
- Use TypeScript `string` type (not `String` object)
- Export pure function (no state, no side effects)

### Task 2: Placeholder Replacement Strategies

**Question**: How should we handle placeholder replacement in hook pattern templates (e.g., `{moduleReference}`, `{separator}`, `{settingKey}`)?

**Decision**: Use simple string replacement with validation

**Rationale**:
- **Explicit validation**: Check for required placeholders before replacement
- **Order independence**: Replace all placeholders in single pass using reduce/replaceAll
- **Error clarity**: Throw descriptive errors for missing placeholders with available keys listed
- **Performance**: String operations are O(n) - well within <1ms target for typical patterns

**Alternatives Considered**:
1. **Template engines (Handlebars, Mustache)** - Rejected: External dependency for P2/P3, violates "zero dependencies for P1" principle
2. **Regex-based replacement** - Rejected: More complex to maintain, harder to provide clear error messages
3. **Function-based templates** - Rejected: Overkill; patterns are static YAML strings, not dynamic logic

**Implementation Strategy**:
```typescript
// Pseudocode
function replacePlaceholders(template: string, values: Record<string, string>): string {
  let result = template;
  
  // Extract required placeholders from template
  const requiredPlaceholders = extractPlaceholders(template); // e.g., ['{moduleReference}', '{separator}']
  
  // Validate all required placeholders are provided
  for (const placeholder of requiredPlaceholders) {
    const key = placeholder.slice(1, -1); // Remove braces
    if (!(key in values)) {
      throw new Error(`[OMH] Missing required placeholder: ${key}`);
    }
  }
  
  // Replace all placeholders
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  
  return result;
}
```

### Task 3: Error Handling and User Feedback

**Question**: What error handling patterns should we use for missing hook keys, patterns, or parameters?

**Decision**: Fail-fast with descriptive errors including context

**Rationale**:
- **Alignment with project philosophy**: Existing config system uses fail-fast (throws on missing files, parse errors)
- **Developer experience**: Clear error messages with available options help debugging
- **Consistency**: All errors prefixed with `[OMH]` per constitutional requirement
- **Testability**: Errors are predictable and testable (FR-014, FR-020, FR-021)

**Error Message Templates**:
```typescript
// Hook key not found
`[OMH] Hook key "${hookKey}" not found in hooks.yaml. Available keys: ${availableKeys.join(', ')}`

// Pattern key not found
`[OMH] Pattern key "${patternKey}" not found in hookPatterns. Available patterns: ${availablePatterns.join(', ')}`

// Missing required parameter
`[OMH] Missing required parameter "${paramName}" for pattern "${patternKey}". Required: ${requiredParams.join(', ')}`

// Config missing or invalid
`[OMH] Invalid config: expected config.constants.hooks to exist with hooks, hookPatterns, and hookPatternSeparator`
```

**Alternatives Considered**:
1. **Silent failures with defaults** - Rejected: Leads to hard-to-debug issues; contradicts fail-fast principle
2. **Warnings instead of errors** - Rejected: Wrong hook names cause runtime failures; better to catch early
3. **Validation at module load time** - Deferred: Future enhancement; current approach validates on use

### Task 4: Integration with Existing Config System

**Question**: How should hookFormatter integrate with the centralized config singleton?

**Decision**: Accept config as parameter, read from `config.constants.hooks`

**Rationale**:
- **Testability**: Allows passing mock config in unit tests without touching global state
- **Explicit dependencies**: Function signature makes config dependency obvious
- **Stateless**: No global imports of config singleton; consumers provide config instance
- **Consistency**: Matches existing pattern used by moduleNameResolver

**Config Structure Expected**:
```typescript
config.constants.hooks = {
  hooks: {
    settingsReady: 'SettingsReady',
    contextReady: 'ContextReady'
  },
  hookPatterns: {
    module: '{moduleReference}{separator}{hook}',
    setting: '{moduleReference}{separator}setting{separator}{settingKey}'
  },
  hookPatternSeparator: '.'
};
```

**Integration Points**:
1. **moduleNameResolver**: Called to resolve `{moduleReference}` placeholder
2. **Config validation**: Check structure before attempting formatting (FR-025)
3. **Separator default**: Use `'.'` if `hookPatternSeparator` undefined (FR-010)

### Task 5: Testing Strategy

**Question**: How should we structure tests to achieve ≥80% coverage while maintaining independence?

**Decision**: Three-tier testing approach aligned with priority levels

**Rationale**:
- **P1 isolation**: Pure function tests with zero mocks (formatString)
- **P2/P3 mocking**: Mock config for unit tests, real config for integration tests
- **Coverage alignment**: Each functional requirement has corresponding test case
- **Performance validation**: Benchmark tests to verify <1ms target (SC-007)

**Test Organization**:

**Unit Tests** (`tests/unit/stringFormatter.unit.test.mjs`):
- Test all FR-001 through FR-006 (P1)
- No dependencies, no mocks
- Edge cases: empty strings, undefined options, null values
- Expected coverage: 100% (pure function, all paths testable)

**Unit Tests** (`tests/unit/hookFormatter.unit.test.mjs`):
- Test FR-007 through FR-022 (P2/P3) with mock config
- Mock config structure: minimal valid hooks.yaml representation
- Test error cases: missing keys, invalid config, missing parameters
- Expected coverage: 90-95% (most paths)

**Integration Tests** (`tests/integration/hookFormatter.int.test.mjs`):
- Use real config loaded from actual `hooks.yaml`
- Verify all defined hooks generate correct names (SC-003)
- Verify all defined patterns work with real placeholders (SC-004)
- Test with real moduleNameResolver (not mocked)
- Expected coverage: Validates real-world integration

**Performance Tests** (optional, can add to existing performance suite):
- Benchmark 1000 formatString operations → verify <1ms average
- Benchmark 1000 formatHookName operations → verify <1ms average

## Technology Decisions

### TypeScript vs JavaScript

**Decision**: Use TypeScript (`.ts` files compiled to `.mjs`)

**Rationale**:
- Project standard (existing utils use TypeScript)
- Type safety for FormatOptions, HookFormatterConfig
- Better IDE support for API discovery
- Compile-time validation of placeholder types

### Module System

**Decision**: ESM modules with `.mts` extension (compiles to `.mjs`)

**Rationale**:
- Project standard per constitution
- FoundryVTT v12+ supports ESM
- Better tree-shaking and optimization
- Aligns with existing codebase

### Export Strategy

**Decision**: Named exports for all functions and types

**Rationale**:
```typescript
// stringFormatter.ts
export { formatString } from './stringFormatter.ts';
export type { FormatOptions } from './stringFormatter-types.ts';

// hookFormatter.ts
export { formatHookName } from './hookFormatter.ts';
export type { HookFormatterConfig } from './hookFormatter-types.ts';
```

- Explicit imports improve readability
- No default export confusion
- Easier to extend with additional utilities later

## Dependencies Analysis

### P1: String Formatter
- **External**: None
- **Internal**: None
- **Justification**: Pure utility function, zero dependencies

### P2/P3: Hook Formatter
- **External**: None
- **Internal**: 
  - `resolveModuleName` from `src/utils/static/moduleNameResolver.ts`
  - Config singleton (passed as parameter, not imported)
- **Justification**: Leverages existing infrastructure, no new dependencies

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Config structure change | Low | Medium | Validate config structure at runtime (FR-025) |
| Performance regression | Very Low | Low | Benchmark tests, string ops are fast |
| Hook name collision | Low | Medium | Document naming conventions in quickstart.md |
| Missing hooks.yaml entries | Medium | Medium | Clear error messages with available keys |

## Open Questions

None. All technical decisions have been made and documented above.

## Appendix: Foundry VTT Hooks API

For reference, this is how generated hook names will be used:

```javascript
import { formatHookName } from '#/utils/hookFormatter.ts';
import { config } from '#config';

// P2: Simple hook
const hookName = formatHookName('settingsReady', config);
// Returns: "OMH.SettingsReady"

Hooks.on(hookName, () => {
  console.log('Settings are ready!');
});

// P3: Parameterized hook
const settingHook = formatHookName('setting', { settingKey: 'debugMode' }, config);
// Returns: "OMH.setting.debugMode"

Hooks.on(settingHook, (value) => {
  console.log(`Debug mode changed to: ${value}`);
});
```

**Foundry Hooks Documentation**: https://foundryvtt.com/api/classes/foundry.helpers.Hooks.html

## Conclusion

Research is complete. All technical unknowns have been resolved:
- ✅ String formatting approach selected (simple concatenation)
- ✅ Placeholder replacement strategy defined (validate then replace)
- ✅ Error handling patterns established (fail-fast with context)
- ✅ Config integration approach decided (parameter passing)
- ✅ Testing strategy defined (three-tier: unit P1, unit P2/P3 with mocks, integration with real config)

**Ready to proceed to Phase 1: Data Model & Contracts**
