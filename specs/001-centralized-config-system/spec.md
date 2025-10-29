# Feature Specification: Centralized Configuration System

**Feature Branch**: `001-centralized-config-system`
**Created**: October 20, 2025
**Status**: Draft
**Input**: User description: "create a config.ts in src/config. The file should have a config class that gathers the config files in constants and settings, as well as the module.json and the environment variables. It should export an instantiated singleton of the initialized configs."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Initialize Module Configuration (Priority: P1)

Developers need a single, centralized place to access all configuration data when the module loads, combining data from multiple YAML files, the module manifest, and environment variables.

**Why this priority**: This is the core foundation of the feature. Without a working initialization system, nothing else can be built.

**Independent Test**: Can be fully tested by instantiating the config singleton and verifying it contains all expected configuration categories (constants, settings, module metadata, and environment variables).

**Acceptance Scenarios**:

1. **Given** a module is initializing, **When** the config module is imported, **Then** a singleton instance is automatically created and exported with all configuration sections populated
2. **Given** the config is initialized, **When** accessing config properties, **Then** all YAML constants files (errors, foundry, hooks, moduleManagement, occlusion, placeables) are merged into a constants property
3. **Given** the config is initialized, **When** accessing config properties, **Then** all settings definitions from settings.yaml are accessible in a settings property
4. **Given** the config is initialized, **When** accessing config properties, **Then** the module manifest (module.json) metadata is accessible in a module property
5. **Given** the config is initialized, **When** accessing config properties, **Then** any environment variables (if available) are accessible in an env property

---

### User Story 2 - Provide Type-Safe Config Access (Priority: P1)

Developers should be able to access configuration properties with full TypeScript type safety and IDE autocomplete support throughout their codebase.

**Why this priority**: Type safety is essential for a developer-facing API to prevent runtime errors and enable IDE intellisense.

**Independent Test**: Can be fully tested by importing the config singleton in a TypeScript file and verifying that IDE autocomplete suggests available properties, and type checking catches mismatches.

**Acceptance Scenarios**:

1. **Given** a developer imports the config singleton, **When** they access a config property, **Then** TypeScript provides autocomplete suggestions
2. **Given** a developer accesses a config property, **When** they provide an incorrect type, **Then** TypeScript compile-time type checking prevents the error

---

### User Story 3 - Prevent Multiple Config Instances (Priority: P1)

The system must enforce singleton pattern to ensure all modules reference the same configuration instance, preventing inconsistent state or multiple initializations.

**Why this priority**: A singleton prevents subtle bugs where different parts of the code might have different config states.

**Independent Test**: Can be fully tested by importing the config singleton in multiple different files and verifying that all references are identical (same object instance).

**Acceptance Scenarios**:

1. **Given** the config is imported in multiple modules, **When** each module accesses the singleton, **Then** they all receive the same instance
2. **Given** the config singleton is accessed multiple times, **When** it is accessed again, **Then** it is not reinitialized

---

### User Story 4 - Support Environment Variable Overrides (Priority: P2)

Developers should be able to override configuration values using environment variables for deployment flexibility across different environments (development, staging, production).

**Why this priority**: Essential for managing different configurations across deployment environments without code changes.

**Independent Test**: Can be fully tested by setting environment variables before module initialization and verifying they override or extend the base configuration.

**Acceptance Scenarios**:

1. **Given** environment variables are set before config initialization, **When** the config is accessed, **Then** matching environment variable values are available in the env property
2. **Given** an environment variable matches a known config key pattern, **When** accessing it, **Then** it overrides or supplements the base configuration value

---

### Edge Cases

- What happens if a YAML config file is malformed or missing? (System throws detailed error with file path and parsing context; module initialization fails)
- What happens when a new YAML config file is added or removed? (System dynamically includes/excludes files without breaking; new files are loaded, removed files result in errors if referenced)
- What happens if module.json is missing or invalid? (System throws detailed error; config initialization fails)
- What happens if environment variables conflict with YAML config values? (Environment variables take precedence; conflicts are logged)
- What happens if the config class is instantiated multiple times directly? (The singleton pattern prevents duplicate instances; subsequent instantiation attempts return the existing instance)
- What happens if code attempts to modify the config after initialization? (Modification attempt silently fails or throws error (depending on strict mode); the frozen singleton remains unchanged)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST create a config.ts file in src/config directory that exports a singleton Config class
- **FR-002**: Config class MUST load and merge all YAML files from src/config/constants directory using namespace-preserving shallow merge (each YAML file name becomes a top-level key under constants)
- **FR-003**: Config class MUST load settings definitions from src/config/settings/settings.yaml
- **FR-004**: Config class MUST read module manifest metadata from module.json at project root
- **FR-005**: Config class MUST read environment variables and make them accessible via the config instance
- **FR-006**: Config class MUST match environment variables using a custom prefix pattern (e.g., `OMH_*`) where the prefix is derived from moduleManagement.yaml shortName or calculated from module title (as established in the same file and done through a helper function)
- **FR-007**: Config class MUST implement singleton pattern to ensure only one instance exists throughout the application lifetime
- **FR-008**: Config MUST export an instantiated and initialized singleton instance ready for immediate use
- **FR-009**: Config class MUST provide type-safe property access with TypeScript support
- **FR-010**: Config class MUST organize loaded configuration into logical properties: constants (namespace-keyed), settings, module, and env
- **FR-011**: Config class MUST throw detailed errors on any parsing or loading failure, including file path and parsing context; initialization must fail fast rather than degrade gracefully
- **FR-012**: Config singleton MUST be frozen/sealed after initialization to prevent runtime modifications and ensure immutability

### Key Entities

- **Config**: The main configuration class responsible for gathering, loading, and organizing all configuration data from multiple sources
- **Constants**: Aggregated configuration values from all YAML files in src/config/constants
- **Settings**: Configuration settings definitions from settings.yaml
- **Module**: Metadata from module.json (id, title, version, compatibility, etc.)
- **Env**: Environment variables accessible to the module

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Config singleton can be imported and used in any module file with zero initialization overhead
- **SC-002**: All configuration data from YAML files, module.json, and environment variables are successfully loaded and accessible via the config instance
- **SC-003**: TypeScript type checking prevents incorrect config property access attempts
- **SC-004**: Config singleton is guaranteed to be the same instance across all imports (verified by identity check)
- **SC-005**: Module initialization time is not negatively impacted by config loading (load completes in under 100ms)

## Clarifications

### Session October 20, 2025

- Q: How should multiple YAML files from src/config/constants/ be merged? → A: Namespace-preserving shallow merge (each YAML file name becomes a top-level key under constants, e.g., `config.constants.errors`, `config.constants.foundry`, etc.)
- Q: How should the config system handle errors (malformed YAML, missing files, invalid JSON)? → A: Fail-fast with detailed error reporting. Throw detailed errors on any parsing/loading failure with stack trace and file path clearly reported.
- Q: How should environment variables be named and matched against config keys? → A: Custom prefix pattern (e.g., `OMH_DEBUG_MODE`). Prefix is either calculated from module title via helper or pre-established in moduleManagement.yaml (currently set to "OMH")
- Q: Should the config be immutable after initialization, or support runtime updates? → A: Immutable. The singleton config object should be frozen/sealed after initialization to prevent accidental modifications and guarantee consistency throughout the application lifetime.

## Assumptions

- YAML files in src/config/constants are well-formed and will be loaded using a YAML parser
- module.json exists at the project root and contains valid JSON
- Environment variables follow standard Node.js/browser environment naming conventions
- The configuration is read-only after initialization (no runtime modifications)
- The module uses ES modules (ESM) based on .mts file extension and existing .mjs usage
