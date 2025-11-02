# Feature Specification: Parametrable Logger Module

**Feature Branch**: `004-parametrable-logger`
**Created**: November 1, 2025
**Status**: Draft
**Input**: User description: "Create a logger module with a logger class that is fully parametrable and formats log to console according to config passed as arguments. The logger should not import config.ts directly. Configuration should be inspired by logging.yaml, with module name placeholder from moduleManagement.yaml, and debug mode influenced by settings and variables. The logger should be easily parametrable via config instance or single overrides. Located in src/utils with entry point in utils.ts providing flexible scaffolding for future utils."

## Clarifications

### Session 2025-11-02

- Q: How does logger access logging.yaml? → A: Logger receives pre-parsed configuration object; file I/O and YAML parsing handled by caller (config.ts or utils.ts entry point)
- Q: How deep do hierarchical overrides merge? → A: Shallow merge at top level; format section replaces entirely when provided in overrides
- Q: Should file output be implemented in Phase 1? → A: Deferred to Phase 2; architecture designed with pluggable output targets for future extensibility; Phase 1 console-only
- Q: How does logger resolve module name from moduleManagement.yaml patterns? → A: Static utility function resolves module name given `referToModuleBy` setting; logger receives resolved `moduleName` string in configuration object

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Basic Logging with Module Configuration (Priority: P1)

A developer needs to output log messages with consistent formatting that reflects the module's identity and configured log levels. The developer passes the module configuration to the logger at instantiation and then uses simple method calls to log messages at different severity levels.

**Why this priority**: This is the core value proposition of the logger. Without basic, consistently-formatted logging, the feature provides no value. This is the MVP that enables all other features.

**Independent Test**: Can be fully tested by instantiating a logger with a minimal configuration object (containing module name and log level), calling each log method (error, warn, info, verbose, debug), and verifying the console output matches the expected format pattern.

**Acceptance Scenarios**:

1. **Given** a logger is instantiated with module name "OMH" and default log level "info", **When** the developer calls `logger.info("Test message")`, **Then** the console displays a formatted message containing the module name, message text, and appropriate formatting for info level
2. **Given** a logger is instantiated with log level "error", **When** the developer calls `logger.debug("Debug message")`, **Then** no output appears in the console (debug is below error threshold)
3. **Given** a logger is instantiated with timestamp enabled, **When** any log method is called, **Then** the console output includes a timestamp in the configured format
4. **Given** a logger is instantiated with custom format string, **When** logging occurs, **Then** the output follows the specified format template with correct placeholder substitution

---

### User Story 2 - Dynamic Log Level Control via Debug Mode (Priority: P2)

A developer needs the logging verbosity to automatically adjust based on the module's debug mode setting without changing code. When debug mode is enabled (via configuration or environment variables), the logger should output more detailed messages. When disabled, it should only show critical information.

**Why this priority**: This enables developers to troubleshoot production issues by toggling debug mode without code changes or redeployment. It's essential for maintainability but builds upon the basic logging functionality.

**Independent Test**: Can be fully tested by creating two logger instances with different debug mode settings, logging messages at all levels with both instances, and verifying that the debug-enabled logger shows verbose/debug messages while the standard logger does not.

**Acceptance Scenarios**:

1. **Given** a logger with debug mode disabled, **When** the developer logs messages at debug and verbose levels, **Then** those messages do not appear in console output
2. **Given** a logger with debug mode enabled, **When** the developer logs messages at all levels including debug and verbose, **Then** all messages appear in console output with appropriate formatting
3. **Given** debug mode configuration includes custom log level mapping, **When** debug mode is enabled, **Then** the logger uses the debug-specific log level instead of the default

---

### User Story 3 - Parameter Overrides at Instantiation (Priority: P3)

A developer needs to create specialized logger instances with custom settings that differ from the module's global configuration. The developer should be able to pass override parameters at instantiation without modifying the base configuration.

**Why this priority**: This provides flexibility for different logging contexts (e.g., performance logging, security logging, feature-specific logging) without requiring separate configuration files. It's valuable but not essential for basic operation.

**Independent Test**: Can be fully tested by creating a logger with a base configuration, then creating a second logger with the same base configuration plus override parameters, and verifying that the second logger behaves according to the overrides while the first maintains default behavior.

**Acceptance Scenarios**:

1. **Given** a base configuration with log level "info", **When** a logger is instantiated with override parameter `{ defaultLevel: "debug" }`, **Then** that logger instance outputs debug-level messages while other loggers continue using info level
2. **Given** a base configuration with a format string, **When** a logger is instantiated with override parameter `{ format: { info: "{module} >> {message}" } }`, **Then** that logger's info messages use the custom format while other levels use the base format
3. **Given** multiple override parameters are provided, **When** a logger is instantiated, **Then** all overrides are applied and the logger behaves according to the combined override set

---

### User Story 4 - Utility Access Point with Flexible Scaffolding (Priority: P4)

A developer needs to access the logger and other utilities through a centralized entry point that receives the configuration once and distributes it to all utility instances. Additionally, developers should be able to add new utilities to this entry point without modifying existing code significantly.

**Why this priority**: This provides architectural consistency and future-proofs the codebase for new utilities. It's important for maintainability but the logger can function independently if needed.

**Independent Test**: Can be fully tested by importing the utils entry point, passing a configuration object, accessing the logger through the entry point, verifying it works as expected, then adding a mock utility to the scaffolding and confirming it receives configuration correctly.

**Acceptance Scenarios**:

1. **Given** the utils entry point is imported and initialized with a configuration object, **When** the developer accesses `utils.logger`, **Then** a fully-configured logger instance is returned that uses the provided configuration
2. **Given** the utils scaffolding structure exists, **When** a developer adds a new utility class following the established pattern, **Then** the new utility is accessible through the utils entry point and receives configuration correctly
3. **Given** multiple utilities are registered in the utils entry point, **When** configuration is updated via the entry point, **Then** all utility instances reflect the updated configuration (or new instances are created with updated config)

---

### Edge Cases

- What happens when no configuration is provided to the logger? (Should use sensible defaults: console output only, info level, basic format)
- What happens when an invalid log level is specified in configuration? (Should default to info level and log warning with [OMH] prefix about the invalid value)
- What happens when a format string contains placeholders that are not available in the log context? (Should replace with empty string and continue formatting)
- What happens when the logger is called with non-string message types (objects, arrays, errors)? (Should handle gracefully with appropriate serialization per FR-013)
- What happens when circular references exist in logged objects? (Should detect via try/catch on JSON.stringify; fallback to "[Circular]" placeholder and log warning)
- What happens when a new utility is added to the utils entry point that conflicts with an existing utility name? (Should handle gracefully, potentially with namespacing or error reporting)
- What happens when configuration contains both console and file output settings? (Should support both simultaneously based on configuration)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Logger MUST accept a pre-parsed configuration object as a constructor parameter and MUST NOT import configuration modules or YAML files directly; configuration object contains all runtime settings including module name, log levels, format strings, and debug mode
- **FR-002**: Logger MUST support standard log levels: error, warn, info, verbose, and debug
- **FR-003**: Logger MUST format output messages according to configuration-specified format strings with placeholder substitution
- **FR-004**: Logger MUST respect log level thresholds so messages below the configured level are not output
- **FR-005**: Logger MUST substitute placeholders in format strings including: module name, timestamp, log level, message content, and metadata
- **FR-006**: Logger MUST support parameter overrides at instantiation that take precedence over base configuration
- **FR-007**: Logger MUST derive module name from configuration settings (following moduleManagement.yaml patterns for placeholder resolution)
- **FR-008**: Logger MUST adjust log level behavior based on debug mode settings from configuration
- **FR-009**: Logger MUST provide methods for each log level (error, warn, info, verbose, debug) that accept message strings and optional metadata
- **FR-010**: Utils entry point MUST accept configuration and instantiate utilities with that configuration
- **FR-011**: Utils entry point MUST provide access to logger instance through a clear, documented interface
- **FR-012**: Utils entry point MUST support addition of new utilities without requiring changes to existing utility code
- **FR-013**: Logger MUST handle non-string message types gracefully (objects, errors, arrays) by serializing them appropriately: objects/arrays serialized via JSON.stringify with circular reference detection; Error objects formatted as "${error.name}: ${error.message}\n${error.stack}"; primitives converted via String(value)
- **FR-014**: Logger MUST include timestamp formatting based on configuration settings (format string, enabled/disabled)
- **FR-015**: Logger MUST support colorization of output based on log level when enabled in configuration
- **FR-016**: Logger MUST be architected with pluggable output targets to enable future support for file and other output types; Phase 1 implementation MUST support console output only (Note: OutputTarget interface design deferred to Phase 2 specification; Phase 1 uses hard-coded console.log/warn/error calls)
- **FR-017**: Configuration MUST support hierarchical override patterns via shallow merge: defaults < base configuration < instance overrides; when instance overrides provide a format section, it replaces the format section from base configuration entirely (no nested merge)

### Key Entities

- **Logger Instance**: Represents a configured logging facility with specific format, level, and output settings. Accepts pre-parsed configuration object at instantiation. Contains methods for each log level, maintains reference to configuration, and handles message formatting and console output.
- **Log Configuration Object**: A plain object passed to logger containing logging behavior parameters: log levels, format strings, colorization preferences, timestamp settings, module name (resolved string), and debug mode. Supports shallow hierarchical overrides where format section replaces entirely on override.
- **Module Name Resolver**: Static utility function that derives module name from configuration's `referToModuleBy` setting and module management data; returns resolved string for use in logger configuration object.
- **Utils Entry Point**: Represents the centralized access point for all utility instances. Accepts configuration object, instantiates utilities with that configuration, and provides methods to access specific utilities (e.g., `utils.logger`).
- **Log Message**: Represents a single log event with severity level, message content, optional metadata, timestamp, and module context.
- **Output Target Interface** (Future): Abstraction for pluggable output implementations (console, file, etc.); Phase 1 has hard-coded console target; Phase 2+ will support registration of custom targets.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developers can instantiate and use a logger with consistent formatting in 3 lines of code or fewer (import, instantiate with config, call log method)
- **SC-002**: Logger produces correctly formatted output 100% of the time when provided valid configuration
- **SC-003**: Debug mode can be toggled via configuration or environment variables without any code changes in modules using the logger
- **SC-004**: A new utility can be added to the utils entry point scaffolding in under 10 minutes including configuration wiring and access method
- **SC-005**: Log level filtering works correctly 100% of the time, with no messages appearing above their configured threshold
- **SC-006**: All log format placeholders are substituted correctly in 100% of output messages when placeholder data is available
- **SC-007**: Developer documentation for the logger and utils entry point can be read and understood in under 5 minutes

### Assumptions

- Configuration object structure follows patterns established in logging.yaml (hierarchical, with separate sections for console, file, and format settings)
- Module name resolution follows patterns from moduleManagement.yaml (referToModuleBy setting, shortName derivation) and is performed by a static utility before logger instantiation
- Debug mode setting is available in configuration as a boolean or string value that can be evaluated
- The logger is primarily used in Node.js/module development context, not browser context (though browser console output is acceptable)
- Format strings use a templating syntax similar to `{placeholder}` for variable substitution
- Console output is the primary and Phase 1 requirement; file output deferred to Phase 2 and beyond with architecture designed for future extensibility
- Colorization is handled via ANSI escape codes or similar standard console coloring mechanism
- All utilities added to the utils entry point follow a similar instantiation pattern (constructor accepts configuration)
- Configuration object passed to logger is pre-parsed and ready for use; logger does not perform file I/O or YAML parsing
- Module name resolution via `referToModuleBy` setting is performed by a static utility before logger instantiation; logger receives resolved module name string directly in configuration
- Hierarchical configuration merge is shallow at top level; format object replaces entirely when provided in overrides (no nested merge of format properties)
