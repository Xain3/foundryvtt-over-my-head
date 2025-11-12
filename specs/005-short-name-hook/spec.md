# Feature Specification: Hook Formatter Utility

**Feature Branch**: `005-short-name-hook`  
**Created**: 2025-01-21  
**Status**: Draft  
**Input**: User description: "Create a simple static util that formats a string by either prepending a prefix, appending a suffix, or both. On top of that, build a hookFormatter.ts that uses the string formatter and leverages the moduleName resolver to build hook names from the hooks.yaml template. Users can call it with the hook key to get back the formatted hook name."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - String Formatting with Prefix/Suffix (Priority: P1)

Developers need a simple, reusable utility to format strings with optional prefixes and/or suffixes. This is the foundational building block for all hook formatting.

**Why this priority**: This is the atomic unit of functionality. Without this, nothing else works. It's the simplest piece and delivers immediate value for any string formatting need.

**Independent Test**: Can be fully tested by calling `formatString("world", { prefix: "hello-", suffix: "-!" })` and verifying output is `"hello-world-!"`. No dependencies on config, modules, or Foundry.

**Acceptance Scenarios**:

1. **Given** a string `"world"` and `{ prefix: "hello-" }`, **When** `formatString()` is called, **Then** return `"hello-world"`
2. **Given** a string `"world"` and `{ suffix: "-!" }`, **When** `formatString()` is called, **Then** return `"world-!"`
3. **Given** a string `"world"` and `{ prefix: "hello-", suffix: "-!" }`, **When** `formatString()` is called, **Then** return `"hello-world-!"`
4. **Given** a string `"world"` and no options, **When** `formatString()` is called, **Then** return `"world"` unchanged

---

### User Story 2 - Module-Scoped Hook Name Generation (Priority: P2)

Developers need to generate Foundry hook names that follow the module's naming convention (e.g., `"OMH.SettingsReady"`) based on hook keys defined in `hooks.yaml`.

**Why this priority**: This provides the primary use case for the string formatter. It integrates with existing config infrastructure and enables standardized hook naming across the module.

**Independent Test**: Can be tested by passing a hook key like `"settingsReady"` to `formatHookName()` and verifying it returns `"OMH.SettingsReady"` based on the `hooks.yaml` pattern `"{moduleReference}.{hook}"`.

**Acceptance Scenarios**:

1. **Given** hook key `"settingsReady"` and config with module reference `"OMH"`, **When** `formatHookName("settingsReady")` is called, **Then** return `"OMH.SettingsReady"`
2. **Given** hook key `"contextReady"` and config with module reference `"OMH"`, **When** `formatHookName("contextReady")` is called, **Then** return `"OMH.ContextReady"`
3. **Given** an unknown hook key `"unknownHook"`, **When** `formatHookName("unknownHook")` is called, **Then** throw an error with descriptive message

---

### User Story 3 - Parameterized Hook Name Generation (Priority: P3)

Developers need to generate hook names with dynamic parameters (e.g., `"OMH.setting.debugMode"`) based on pattern templates in `hooks.yaml`.

**Why this priority**: This extends the basic hook formatter to support parameterized patterns. It's less common but critical for setting-specific hooks and other dynamic use cases.

**Independent Test**: Can be tested by calling `formatHookName("setting", { settingKey: "debugMode" })` and verifying it returns `"OMH.setting.debugMode"` based on the pattern `"{moduleReference}.setting.{settingKey}"`.

**Acceptance Scenarios**:

1. **Given** pattern key `"setting"` and params `{ settingKey: "debugMode" }`, **When** `formatHookName("setting", { settingKey: "debugMode" })` is called, **Then** return `"OMH.setting.debugMode"`
2. **Given** pattern key `"setting"` and missing required param `settingKey`, **When** `formatHookName("setting", {})` is called, **Then** throw an error indicating missing parameter
3. **Given** pattern key `"setting"` with extra unused params, **When** `formatHookName("setting", { settingKey: "debugMode", extra: "ignored" })` is called, **Then** return `"OMH.setting.debugMode"` (extra params ignored)

---

### Edge Cases

- What happens when an empty string is passed to `formatString()`? Should return the prefix + suffix concatenated (or empty if no options).
- What happens when a hook key doesn't exist in `hooks.yaml`? Should throw an error with available keys listed.
- What happens when a required placeholder in a pattern template is missing? Should throw an error with missing placeholder name.
- What happens when module reference cannot be resolved? Should throw an error indicating config issue.
- What happens when separator is undefined in `hooks.yaml`? Should use a sensible default (e.g., `"."`).
- What happens when `formatHookName()` is called without config? Should throw an error indicating missing config.

## Requirements *(mandatory)*

### Functional Requirements

#### String Formatter (P1)
- **FR-001**: System MUST provide a `formatString(base: string, options?: FormatOptions)` function that accepts a base string and optional formatting options
- **FR-002**: System MUST support `prefix` option that prepends a string to the base
- **FR-003**: System MUST support `suffix` option that appends a string to the base
- **FR-004**: System MUST support both `prefix` and `suffix` simultaneously, applying prefix first then suffix
- **FR-005**: System MUST return the base string unchanged when no options are provided
- **FR-006**: System MUST handle empty strings gracefully (return prefix + suffix concatenation)

#### Hook Formatter (P2)
- **FR-007**: System MUST provide a `formatHookName(hookKey: string, config: Config)` function that generates Foundry hook names
- **FR-008**: System MUST read hook definitions from `config.constants.hooks.hooks` object
- **FR-009**: System MUST read hook patterns from `config.constants.hooks.hookPatterns` object
- **FR-010**: System MUST read separator from `config.constants.hooks.hookPatternSeparator` (default: `"."`)
- **FR-011**: System MUST resolve module reference using `resolveModuleName(config)` for `{moduleReference}` placeholder
- **FR-012**: System MUST replace `{separator}` placeholder with the configured separator
- **FR-013**: System MUST replace `{hook}` placeholder with the hook value from `hooks` object
- **FR-014**: System MUST throw error when hook key is not found in `hooks.yaml`
- **FR-015**: System MUST use the `hookPatterns.module` pattern for simple hook name generation

#### Parameterized Hook Formatter (P3)
- **FR-016**: System MUST provide a `formatHookName(patternKey: string, params: Record<string, string>, config: Config)` overload for parameterized hooks
- **FR-017**: System MUST read pattern template from `config.constants.hooks.hookPatterns[patternKey]`
- **FR-018**: System MUST replace all placeholders in the pattern with provided parameters
- **FR-019**: System MUST resolve `{moduleReference}` and `{separator}` using config
- **FR-020**: System MUST throw error when required parameter is missing from `params`
- **FR-021**: System MUST throw error when pattern key is not found in `hookPatterns`
- **FR-022**: System MUST ignore extra parameters not used in the pattern template

#### Error Handling
- **FR-023**: System MUST throw descriptive errors prefixed with `[OMH]`
- **FR-024**: System MUST include available options in error messages when keys are not found
- **FR-025**: System MUST validate config structure before attempting to format

### Key Entities

- **FormatOptions**: Configuration object for string formatting with optional `prefix` and `suffix` string properties
- **HookDefinition**: Entry in `hooks.yaml` `hooks` object mapping hook keys to their display values (e.g., `settingsReady: "SettingsReady"`)
- **HookPattern**: Template string from `hookPatterns` containing placeholders like `{moduleReference}`, `{separator}`, `{hook}`, `{settingKey}`, etc.
- **Config**: Centralized configuration object containing `constants.hooks` with `hooks`, `hookPatterns`, and `hookPatternSeparator`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All three user stories (P1, P2, P3) can be independently tested and pass their acceptance scenarios
- **SC-002**: String formatter operates with zero dependencies and can be used in any context (≥80% test coverage)
- **SC-003**: Hook formatter correctly generates all hook names defined in `hooks.yaml` without errors
- **SC-004**: Parameterized hook formatter handles all defined patterns in `hookPatterns` with correct placeholder replacement
- **SC-005**: Error messages are descriptive, prefixed with `[OMH]`, and include actionable information (available keys, missing params, etc.)
- **SC-006**: Integration tests demonstrate hook names work correctly with Foundry's `Hooks.on()` and `Hooks.call()` APIs
- **SC-007**: Performance: Formatting operations complete in <1ms on average for typical use cases
- **SC-008**: Documentation includes working examples for all three priority levels with code snippets
- **SC-009**: Zero regressions in existing module functionality after integration
- **SC-010**: Code follows project style guide with proper JSDoc, file headers, and type definitions in separate `-types.ts` files
