# Feature Specification: Error Formatter Utility

**Feature Branch**: `006-error-formatter`
**Created**: 2025-11-12
**Status**: Draft
**Input**: User description: "Add error formatting utility with module context, stack trace, and caller support"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Basic Error Formatting with Module Context (Priority: P1)

A developer needs to format error messages consistently across the module with the module name automatically prepended to every error message, making it easy to identify which module generated the error in FoundryVTT's console.

**Why this priority**: This is the core functionality that provides immediate value. Without consistent error prefixing, debugging becomes significantly harder in FoundryVTT environments where multiple modules log simultaneously.

**Independent Test**: Can be fully tested by calling the formatter with a simple error and verifying the output contains the module name prefix. Delivers immediate value by making all module errors identifiable.

**Acceptance Scenarios**:

1. **Given** a developer has an Error object with message "Configuration failed", **When** they format it using the error formatter, **Then** the output contains the module name prefix followed by the error message (e.g., "Over My Head: Configuration failed")
2. **Given** a developer provides a string error message instead of an Error object, **When** they format it, **Then** the formatter coerces it to an Error and formats it correctly
3. **Given** the module name is configured via different strategies (id, title, shortName), **When** formatting errors, **Then** the correct module identifier is used based on configuration

---

### User Story 2 - Optional Stack Trace Inclusion (Priority: P2)

A developer debugging a complex issue needs to see the full stack trace in formatted error messages to trace the execution path that led to the error.

**Why this priority**: Stack traces are essential for debugging but not always needed. This provides flexibility for developers to include them when needed without cluttering logs during normal operation.

**Independent Test**: Can be tested by formatting an error with `includeStack: true` option and verifying the stack trace appears in the formatted output. Works independently of other features.

**Acceptance Scenarios**:

1. **Given** a developer has an Error object, **When** they format it with `includeStack: false` (default), **Then** the output does not contain stack trace information
2. **Given** a developer has an Error object, **When** they format it with `includeStack: true`, **Then** the output includes a formatted stack trace section
3. **Given** an error has a multi-line stack trace, **When** formatted with stack enabled, **Then** the stack trace is properly formatted with line breaks and indentation

---

### User Story 3 - Caller Context for Error Origin Tracking (Priority: P3)

A developer working on a large module needs to identify which function or method generated an error when multiple places might throw similar errors, so they can quickly navigate to the problem source.

**Why this priority**: While useful for large codebases, this is less critical than basic formatting and stack traces. It's a convenience feature that improves developer experience but isn't essential for basic error handling.

**Independent Test**: Can be tested by formatting an error with `includeCaller: true` and a caller name, verifying the caller appears in the output. Independent of stack trace functionality.

**Acceptance Scenarios**:

1. **Given** a developer formats an error without specifying a caller, **When** the error is formatted, **Then** no caller information appears in the output
2. **Given** a developer formats an error with `includeCaller: true` and `caller: "loadConfig"`, **When** the error is formatted, **Then** the output includes the caller name (e.g., "loadConfig: Configuration failed")
3. **Given** a developer includes both caller and stack trace, **When** the error is formatted, **Then** both appear in the correct order according to the configured pattern

---

### User Story 4 - Configurable Error Message Patterns (Priority: P4)

Module maintainers need to customize the error message format (order of module, caller, error, stack) to match their preferred logging style or integrate with external logging systems.

**Why this priority**: This is an advanced feature for customization. Most users will be satisfied with the default pattern, but this provides flexibility for specific use cases or integration requirements.

**Independent Test**: Can be tested by modifying the error pattern in configuration and verifying formatted errors follow the new pattern. Works independently once basic formatting is implemented.

**Acceptance Scenarios**:

1. **Given** the error pattern is configured as `"{{module}}{{caller}}{{error}}{{stack}}"`, **When** an error is formatted with all options, **Then** components appear in that order
2. **Given** the error pattern omits `{{stack}}`, **When** an error is formatted with `includeStack: true`, **Then** the stack trace is not displayed (pattern overrides option)
3. **Given** custom separators are defined in configuration, **When** formatting errors with multiple components, **Then** the correct separator appears between components

---

### Edge Cases

- What happens when an error message is empty or undefined?
- How does the formatter handle errors that lack a stack property?
- What happens when module name cannot be resolved from configuration?
- How does the formatter handle very long error messages or stack traces (e.g., 10,000+ characters)?
- What happens when caller name contains special characters or placeholders like `{{module}}`?
- How does the formatter behave when configuration is missing or malformed?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST accept either Error objects or string messages as input
- **FR-002**: System MUST automatically resolve and prepend the module name to all formatted errors
- **FR-003**: System MUST support configurable error message patterns with placeholders for module, caller, error, and stack
- **FR-004**: System MUST provide an option to include stack traces in formatted output
- **FR-005**: System MUST provide an option to include caller context in formatted output
- **FR-006**: System MUST coerce string inputs to Error objects before formatting
- **FR-007**: System MUST validate input arguments and throw TypeError for invalid inputs
- **FR-008**: System MUST use configured separators when joining multiple error components
- **FR-009**: System MUST handle missing or undefined error components gracefully (empty string substitution)
- **FR-010**: System MUST integrate with existing module name resolution strategy (id/title/shortName)
- **FR-011**: System MUST use configuration from the centralized config singleton
- **FR-012**: System MUST not modify global state or have side effects when formatting errors
- **FR-013**: System MUST be usable through multiple import patterns for flexibility

### Key Entities _(include if feature involves data)_

- **Error Context**: Represents all components available for formatting (module name, error message, stack trace, caller name)
- **Format Options**: Configuration object controlling which optional components to include (includeStack, includeCaller, caller)
- **Error Pattern**: Template string with placeholders (`{{module}}`, `{{caller}}`, `{{error}}`, `{{stack}}`) defining output format
- **Module Identifier**: Resolved module name based on configuration strategy (from config.module and config.moduleManagement)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developers can format any error with minimal effort (simple function call)
- **SC-002**: All module errors are consistently identifiable in console logs with module name prefix
- **SC-003**: Error formatting completes instantly without perceptible delay (under 1ms)
- **SC-004**: 100% of formatted errors include the correct module identifier based on current configuration
- **SC-005**: Error formatter is reliable with comprehensive test coverage for all scenarios
- **SC-006**: Zero runtime errors when formatting valid Error objects or strings
- **SC-007**: Documentation clearly explains common usage patterns and examples
- **SC-008**: Error formatter works seamlessly with existing utilities (e.g., logger) when used together
