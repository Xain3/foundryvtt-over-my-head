# Feature Specification: Development Mode Parser

**Feature Branch**: `002-dev-mode-parser`
**Created**: October 29, 2025
**Status**: Draft
**Input**: User description: "Create a devModeParser file that uses the config to handle devMode and debugMode, considering the settings hierarchy (env > module > config > in-game settings when relevant)"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Check Development Mode Status (Priority: P1)

Developers need a pure static function that checks if development mode is currently active by evaluating the settings hierarchy (environment variables override module flags, which override in-game settings) without maintaining any internal state.

**Why this priority**: This is the core functionality - without the ability to check dev mode status correctly, no other debugging features can work reliably.

**Independent Test**: Can be fully tested by calling a static function that accepts configuration sources as parameters and returns the dev mode status under different scenarios (env var set, module flag set, in-game setting set, none set).

**Acceptance Scenarios**:

1. **Given** an environment variable `OMH_DEV_MODE=true` is passed to the function, **When** checking dev mode status, **Then** the function returns true regardless of other parameter values
2. **Given** no environment variable but module.json `flags.dev=true` is passed, **When** checking dev mode status, **Then** the function returns true regardless of in-game setting values
3. **Given** no env var or module flag but in-game debugMode setting is enabled, **When** checking dev mode status, **Then** the function returns true
4. **Given** all sources indicate false or are absent, **When** checking dev mode status, **Then** the function returns false
5. **Given** the default hierarchy is used, **When** multiple parameter sources have conflicting values, **Then** the higher priority source always wins (env > module > config > in-game)
6. **Given** a custom hierarchy override is supplied, **When** multiple parameter sources have conflicting values, **Then** the evaluation follows the provided order and ignores any sources not listed

---

### User Story 2 - Check Debug Mode Status (Priority: P1)

Developers need a pure static function to check if debug mode (verbose logging) is enabled, following the same hierarchy rules as dev mode but specifically for debugging output control. The function should accept all necessary parameters without relying on any state.

**Why this priority**: Debug mode is independent from dev mode and needs separate checking logic - both are equally important for controlling module behavior.

**Independent Test**: Can be fully tested by calling a static function that accepts configuration sources as parameters and returns debug mode status under different scenarios independently from dev mode checks.

**Acceptance Scenarios**:

1. **Given** environment variable `OMH_DEBUG_MODE=true` is passed to the function, **When** checking debug mode status, **Then** the function returns true regardless of other parameter values
2. **Given** no env var but module.json `flags.debugMode=true` is passed, **When** checking debug mode status, **Then** the function returns true
3. **Given** no env var or module flag but in-game debugMode setting parameter is enabled, **When** checking debug mode status, **Then** the function returns true
4. **Given** all parameter sources are false or absent, **When** checking debug mode status, **Then** the function returns false
5. **Given** dev mode is enabled in parameters but debug mode is not, **When** checking debug mode status, **Then** the function returns false (they are independent)
6. **Given** a custom hierarchy override is supplied, **When** multiple parameter sources have conflicting values, **Then** the evaluation follows the provided order for debug mode

---

### User Story 3 - Access Mode Settings Programmatically (Priority: P2)

Developers need clean static APIs to check both dev mode and debug mode status by passing configuration parameters, without any reliance on internal state or singleton dependencies beyond reading the provided parameters.

**Why this priority**: This improves developer experience by providing a simple, predictable interface with no hidden state dependencies, but the core functionality (P1 stories) must work first.

**Independent Test**: Can be fully tested by calling static functions with various parameter combinations and verifying they return correct boolean values based purely on those parameters.

**Acceptance Scenarios**:

1. **Given** a static parser function exists with clear parameters for each config source, **When** calling with env var set and others unset, **Then** it returns the correct hierarchy-based result
2. **Given** the same parameters passed multiple times, **When** calling the static functions repeatedly, **Then** they consistently return the same result (pure function behavior)
3. **Given** one calling context updates a parameter value, **When** another calling context calls with different parameter values, **Then** each gets results based solely on their own parameters (no shared state)
4. **Given** the parser functions are used in multiple files, **When** each passes their own parameter values, **Then** all receive correct results based on their specific parameters

---

### User Story 4 - Handle Missing Configuration Gracefully (Priority: P3)

The static functions should handle missing or undefined parameters gracefully without throwing errors, defaulting to safe values (false for both modes) when any parameter is unavailable or invalid.

**Why this priority**: This is defensive programming - important for robustness but lower priority than core functionality.

**Independent Test**: Can be fully tested by calling the static functions with missing parameters (undefined, null, absent) and verifying the system continues to work with sensible defaults.

**Acceptance Scenarios**:

1. **Given** a parameter is undefined or null, **When** checking mode status, **Then** the function defaults to false for that parameter level without throwing errors
2. **Given** module flags parameter is missing or empty, **When** checking mode status, **Then** the function treats it as false and continues to the next hierarchy level
3. **Given** in-game settings parameter is not available, **When** checking mode status, **Then** the function safely falls back to previous hierarchy levels
4. **Given** environment variable parameters contain unexpected values (e.g., "yes", "1", "on" instead of "true"), **When** parsing parameter values, **Then** the function normalizes common truthy values to boolean true and logs a warning

---

### Edge Cases

- What happens when environment variable parameters contain unexpected values (e.g., "yes", "1", "on" instead of "true")? (Function normalizes common truthy values like "true", "1", "yes", "on" to boolean true; everything else is false with a warning logged)
- What happens when parameters are passed as different types (string vs boolean)? (Function handles type coercion gracefully, treating any truthy value from parameters as true following the hierarchy, logging a warning for unexpected types)
- What happens if both dev and debugMode parameters have conflicting values? (Each mode independently follows its hierarchy based on its own parameters; one mode being true doesn't affect the other)
- What happens when all parameters are undefined/null/false? (Function returns false (disabled) for that mode without throwing errors)
- What happens if the same function is called multiple times with identical parameters? (Function produces identical results each time - pure function behavior with no state dependency)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a `DevModeParser` class exported as default export with static methods to check development and debug mode status
- **FR-002**: System MUST implement `DevModeParser.isDevMode(envVar, moduleFlag, inGameSetting)` static method that returns boolean based on hierarchy evaluation
- **FR-003**: System MUST implement `DevModeParser.isDebugMode(envVar, moduleFlag, inGameSetting)` static method that returns boolean based on hierarchy evaluation
- **FR-004**: System MUST implement settings hierarchy when evaluating parameters with a default precedence of environment variables over module manifest flags over in-game settings (env > module > settings) and support overriding that order when requested
- **FR-005**: System MUST accept environment variable string values as function parameters (representing `OMH_DEV_MODE`, `OMH_DEBUG_MODE`)
- **FR-006**: System MUST accept dev mode and debug mode flags from module manifest as function parameters (representing `flags.dev`, `flags.debugMode`)
- **FR-007**: System MUST accept in-game setting values as function parameters (representing registered settings)
- **FR-008**: All static methods MUST be pure functions - producing identical results from identical parameters with no internal state or side effects
- **FR-009**: System MUST handle missing or undefined parameters gracefully without throwing errors
- **FR-010**: System MUST default to false (disabled) for both modes when all parameters are absent or indicate false
- **FR-011**: System MUST treat dev mode and debug mode as independent - one can be enabled without the other based on their respective parameters
- **FR-012**: System MUST normalize parameter values to booleans (supporting "true", "1", "yes", "on" as true; everything else as false)
- **FR-013**: System MUST log warnings when parameter values contain unexpected types or formats during parsing
- **FR-014**: System MUST provide a convenience method `DevModeParser.fromConfig(config, prefixOverride?)` that extracts values from config singleton and calls core methods
- **FR-015**: System MUST extract module prefix from `config.prefix` dynamically in convenience methods, with optional override parameter for flexibility
- **FR-016**: System MUST be implemented in TypeScript (.ts) for type safety and consistency with config.ts
- **FR-017**: System MUST be implemented as a new file at `src/utils/static/devModeParser.ts`
- **FR-018**: System MUST allow callers to override the hierarchy order for any evaluation entry point, defaulting to the standard precedence when no override is given

### Key Entities

- **DevModeParser**: Utility that evaluates the settings hierarchy to determine current dev mode and debug mode status
- **Settings Hierarchy**: Ordered precedence of configuration sources (env > module manifest > in-game settings) where higher levels override lower levels
- **Dev Mode**: Boolean flag indicating whether development features and behaviors should be enabled
- **Debug Mode**: Boolean flag indicating whether verbose debug logging should be enabled

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Static functions accept configuration parameters and evaluate hierarchy correctly with zero state dependencies
- **SC-002**: Identical parameters passed to static functions produce identical results every time (pure function behavior verified)
- **SC-003**: Multiple callers can pass different parameter values and each receives correct results based on their own parameters (no cross-caller state interference)
- **SC-004**: Functions continue to work correctly even when parameters are missing or invalid (graceful degradation)
- **SC-005**: 100% of mode status evaluations return correct boolean values based on the documented hierarchy and passed parameters
- **SC-006**: Static functions complete execution in under 1ms (zero performance overhead)

## Clarifications

### Session October 29, 2025

- Q: Should devModeParser be implemented as JavaScript (.mjs) or TypeScript (.ts)? → A: TypeScript (.ts) for consistency with config.ts and full type safety
- Q: Should the API provide one function or two separate functions for dev and debug modes? → A: Class with static methods (separate isDevMode and isDebugMode methods)
- Q: How should the parser integrate with the config singleton? → A: Core functions accept explicit parameters only (for purity), with optional convenience wrapper that accepts config and extracts values
- Q: Should the module prefix be hardcoded, extracted from config, or passed as parameter? → A: Extracted from config.prefix dynamically, with possible override as an optional parameter
- Q: How should the module be exported for callers? → A: Export DevModeParser class as default export with static methods
