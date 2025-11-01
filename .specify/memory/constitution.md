<!--
  SYNC IMPACT REPORT (v2.2.0)

  Version change: 2.1.0 → 2.2.0 (Aliasing Import Requirement Addition)

  Principles modified:
  - I. Modular Architecture (EXPANDED - added import aliasing requirement)

  Sections added:
  - None

  Sections modified:
  - None

  Templates requiring updates:
  - None (small addition, no impact on templates)

  Follow-up TODOs:
  - None
-->

# Hybrid Occlusion Module for FoundryVTT Constitution

## Core Principles

### I. Modular Architecture

The module MUST maintain clear separation of concerns with a view toward reuse across other FoundryVTT modules.

**Non-Negotiable Rules:**

- Single point of entry for runtime constants and configuration and environment management; separate entry point for dev
  configs
- Composition over inheritance preferred where technically feasible
- Each module component MUST have explicitly defined responsibility and dependencies
- Code MUST follow established FoundryVTT coding standards and best practices
- Error and log messages MUST be prepended by a configurable prefix for easy filtering and identification
- Imports MUST use aliasing where available to ensure portability and clarity

**Rationale**: Modular code is maintainable, testable, and reusable. Clear responsibility boundaries prevent hidden dependencies and technical debt. Configurable message prefixes enable better debugging and integration with logging systems. Aliasing improves code readability and maintainability by providing consistent, root-relative paths that work across different environments.

### II. FoundryVTT Integration

The module integrates with FoundryVTT's occlusion system through the built-in hooks system only.

**Non-Negotiable Rules:**

- Hooks system MUST be the sole mechanism for runtime integration with FoundryVTT
- Module MUST not patch core FoundryVTT methods or properties
- Module MUST not interfere with other occlusion-related modules
- The hybrid occlusion mode (Vision + Fade) MUST be optional and user-configurable per world, scene and tile

**Rationale**: Hook-based integration ensures modularity and prevents conflicts with other modules. Avoiding monkey-patching maintains compatibility and makes updates safer. Optional configuration respects user choice and existing workflows.

### III. Configuration Management

The module MUST expose a single, clearly-documented API for runtime configuration.

**Non-Negotiable Rules:**

- All runtime configuration MUST flow through a dedicated configuration service
- All development-time configuration MUST have a separate, non-conflicting entry point
- Configuration changes MUST be immediately reflected without requiring module reload (where possible)
- Configuration documentation MUST be inline and discoverable
- In-game configuration UI MUST be provided for all user-adjustable settings

**Rationale**: Centralized configuration reduces cognitive load, prevents silent misconfigurations, and makes testing simpler. Separation of runtime and dev configs avoids accidental production misconfiguration.

### IV. Documentation Excellence

Every code artifact and file structure MUST be documented such that new developers can understand purpose, usage, and integration points without external consultation.

**Non-Negotiable Rules:**

- Every function, method, class (including private ones), and exported symbol MUST have a JSDoc comment explaining purpose, parameters, and return values
- Every folder MUST contain a versioned README.md describing its purpose, contents, structure, and dependencies; README MUST be updated whenever files are added or removed
- The main README.md MUST provide module overview, installation instructions, usage guidelines, and troubleshooting tips
- For files that support comments, complex logic and architectural decisions MUST be explained inline
- Every file that supports comments MUST start with a file-level header (as defined in `docs/STYLE_GUIDE.md`) explaining file purpose, name, and path
- Executable scripts must have shebang lines and usage comments at the top

**Rationale**: Comprehensive documentation eliminates guesswork, reduces onboarding time, and captures design decisions for future maintainers. Inline documentation ensures context is preserved and constraints are visible.

### V. Quality & Maintainability

The module MUST maintain high code quality through discipline in testing, standards compliance, and ongoing care.

**Non-Negotiable Rules:**

- Code MUST follow FoundryVTT module best practices and established JavaScript/TypeScript conventions
- The module MUST be easy to enable/disable without manual file editing
- Automated tests MUST cover at least 80% of the codebase
- Other tests MUST be organized in a dedicated `tests/` folder with clear structure
- Unit tests MUST cover all core logic paths and edge cases, and they should run in isolation.
- New features MUST be accompanied by appropriate unit or integration tests
- Performance MUST not degrade as the module evolves
- All executable scripts MUST support a dry-run mode for testing and validation purposes

**Rationale**: Quality practices prevent bugs, reduce refactoring burden, and ensure the module remains compatible with FoundryVTT updates. Easy enable/disable improves user experience and simplifies troubleshooting. Dry-run modes on executable scripts provide developers and CI/CD pipelines a safe way to preview changes before committing to destructive operations.

## Module Lifecycle

The module MUST support simple enable/disable operations without requiring users to edit files directly.

**Requirements:**

- Enable/disable functionality MUST be exposed through FoundryVTT's module management UI
- Disabling the module MUST cleanly remove all hooks and state, leaving the system in a stable state
- Module MUST not persist user data that would cause conflicts if another occlusion module is later enabled

## Development Standards

All contributions MUST adhere to the coding standards defined for this project.

**Requirements:**

- Each file (where supported) MUST begin with a standard file-level header including purpose, name, and path (as specified in the coding standards document)
- The module's public API surface MUST be clear, concise, and stable across minor version updates
- Code MUST be well-commented where non-obvious logic exists
- Executable scripts MUST support a dry-run mode (typically `--dry-run` flag) that previews changes without applying them
- Pull requests MUST verify:
  - No regressions in existing occlusion behavior
  - No interference with other modules
  - All new code has appropriate comments and documentation updates

## Governance

**Constitution Authority**: This constitution supersedes all other informal guidelines or practices. It is the source of truth for this module's development and architectural decisions.

**Amendment Process**:

- Amendments MUST be documented in a rationale explaining why the change is necessary
- Significant amendments (MAJOR version changes) MUST be approved by project maintainers
- All amendments MUST update this document and propagate to dependent governance files (`plan.md`, `spec.md`, `tasks.md`)
- After each significant change, a Sync Impact Report MUST be generated to track which templates/docs require updates

**Compliance Review**: Before opening a PR, contributors MUST verify:

- Adherence to all five Core Principles
- Alignment with Module Lifecycle requirements
- Completion of Development Standards checklist
- Documentation is complete and current

**Version Policy**:

- MAJOR.MINOR.PATCH semantic versioning
- MAJOR: Backward-incompatible principle changes or removals
- MINOR: New principle or materially expanded guidance
- PATCH: Clarifications, wording, typo fixes
- ALPHA/BETA releases are not governed by this constitution and may experiment with breaking changes

**Version**: 2.2.0 | **Ratified**: 2025-10-21 | **Last Amended**: 2025-11-01
