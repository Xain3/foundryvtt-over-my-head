# Implementation Plan: Alias Configuration Centralization

**Branch**: `003-alias-centralization` | **Date**: 2025-10-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-alias-centralization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature centralizes alias configuration management by establishing alias.config.mjs as the single source of truth, with automated validation testing to detect configuration drift across tsconfig.json, package.json, vite.config.mjs, and vitest.config.mjs. A synchronization script automates updates to dependent configuration files when aliases are modified, using a modular adapter-based architecture to support extensibility for future configuration file types. The system includes pre-commit hook integration for validation and VS Code task integration for developer workflow convenience.

## Technical Context

**Language/Version**: JavaScript/Node.js (ES2022, ESM modules with .mjs/.mts extensions)  
**Primary Dependencies**: 
- Vitest 3.2.4 (testing framework)
- Node.js built-in modules (fs, path, process)
- Vite 7.1.1 (build tool already using alias.config.mjs)
- TypeScript compiler (tsconfig.json path mappings)

**Storage**: File system - reading/writing JSON and JavaScript configuration files (tsconfig.json, package.json, alias.config.mjs, vite.config.mjs, vitest.config.mjs)

**Testing**: Vitest with project-based organization (unit, integration, setup tests). Tests follow naming patterns: `*.setup.test.mjs` for project setup/structure validation

**Target Platform**: Node.js development environment (cross-platform: Linux, macOS, Windows in dev containers)

**Project Type**: Single FoundryVTT module project with centralized configuration management

**Performance Goals**: 
- Validation tests complete in <5 seconds
- Sync script updates all files in <3 seconds
- Pre-commit hook validation completes in <2 seconds

**Constraints**: 
- Must preserve existing file formatting and comments when updating configuration files
- Must handle concurrent file modifications gracefully (detect conflicts, warn and skip)
- Must support dry-run mode for safe preview of changes
- Scripts must follow project conventions (file headers, .dev/scripts/ location, error handling with module prefix)

**Scale/Scope**: 
- Currently 4 configuration files to validate/sync (tsconfig.json, package.json, vite.config.mjs, vitest.config.mjs)
- 4 existing aliases defined in alias.config.mjs (#, #src, #tests, #mocks)
- Extensible architecture must support adding new configuration file types with minimal effort (<30 minutes per adapter)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Modular Architecture ✅

- **Single configuration entry point**: alias.config.mjs serves as single source of truth for runtime aliases
- **Composition over inheritance**: Adapter pattern for configuration file handlers enables composition
- **Clear responsibilities**: 
  - Validation tests: Detect drift
  - Sync script: Update configuration files
  - Adapters: Handle file-type-specific syntax
- **Error messages**: Will use configurable module prefix `[OMH]` for logging and errors

**Status**: PASS - Design follows modular principles with clear separation of concerns

### II. FoundryVTT Integration ✅

- This feature is development tooling only (not runtime FoundryVTT integration)
- No hooks, no patching, no module interaction required
- Improves developer experience but doesn't affect FoundryVTT runtime behavior

**Status**: PASS - N/A for build-time tooling

### III. Configuration Management ✅

- **Single API**: alias.config.mjs is the single source for alias definitions
- **Separation of concerns**: Development tooling separate from runtime configuration
- **Documentation**: Inline JSDoc in alias.config.mjs, extension documentation for adapters
- **No in-game UI needed**: This is developer tooling

**Status**: PASS - Centralizes alias configuration as specified

### IV. Documentation Excellence ✅

- **JSDoc required**: All functions, classes, methods (including private) must have JSDoc
- **Folder READMEs**: Must update tests/project-setup-tests/README.md and .dev/scripts/README.md
- **File headers**: All scripts and tests must include @file, @description, @path headers
- **Extension documentation**: Must document adapter pattern for adding new file types
- **Executable scripts**: Sync script must have shebang and usage comments

**Status**: PASS - Will follow all documentation requirements

### V. Quality & Maintainability ✅

- **Testing**: Validation tests in tests/project-setup-tests/ with *.setup.test.mjs naming
- **Coverage**: Will cover adapter logic and sync script with unit tests
- **Easy enable/disable**: Tests can be skipped; sync script is opt-in manual execution
- **Performance**: Meets goals (<5s validation, <3s sync)
- **Dry-run mode**: Sync script must support --dry-run flag per constitution requirement

**Status**: PASS - Meets all quality standards including dry-run requirement

### Overall Gate Status: ✅ PASS

All constitution principles are satisfied. No violations to justify. Ready to proceed with Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/003-alias-centralization/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── adapter-interface.md  # Interface definition for configuration file adapters
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Existing configuration source of truth
alias.config.mjs         # Single source of truth for alias definitions

# Development scripts (new)
.dev/
└── scripts/
    ├── README.md        # Updated with sync-aliases.mjs documentation
    └── sync-aliases.mjs # Synchronization script with dry-run support

# Tests (new)
tests/
├── project-setup-tests/
│   ├── README.md        # Updated with alias validation test documentation
│   └── alias-sync.setup.test.mjs  # Validation tests for alias synchronization
└── unit/
    ├── adapters/        # Unit tests for each adapter
    │   ├── tsconfig-adapter.unit.test.mjs
    │   ├── package-json-adapter.unit.test.mjs
    │   └── README.md
    └── sync-aliases.unit.test.mjs  # Unit tests for sync script logic

# Source (new) - if we create reusable adapter modules
src/
└── utils/
    └── alias-adapters/  # Adapter modules for different config file types
        ├── README.md
        ├── base-adapter.mjs       # Base adapter interface/class
        ├── tsconfig-adapter.mjs   # TypeScript paths adapter
        ├── package-json-adapter.mjs  # Node.js imports adapter
        └── adapter-registry.mjs   # Registry for discovering adapters

# Git hooks configuration
.husky/
└── pre-commit          # Updated to run alias validation
```

**Structure Decision**: Single project structure with development tooling. The sync script lives in `.dev/scripts/` following project conventions. Validation tests are in `tests/project-setup-tests/` using the `*.setup.test.mjs` pattern. Adapter modules are in `src/utils/alias-adapters/` as reusable utilities that can be imported by both tests and the sync script. This keeps the adapters DRY and testable while maintaining clear separation between validation (tests) and synchronization (script).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution principles are satisfied.

---

## Post-Design Constitution Re-evaluation

After completing Phase 0 (research) and Phase 1 (design), the constitution compliance remains:

### Architecture Review ✅

**Modular Design Confirmed**:
- Adapter pattern provides clear separation of concerns
- Each adapter handles one file format independently
- Registry manages adapters without coupling
- Extensibility proven through example adapters (webpack, etc.)

**No violations introduced during design**.

### Integration Review ✅

**Development Tooling Only**:
- No FoundryVTT runtime integration needed
- Build-time validation and synchronization
- No hooks, no patching, no module conflicts possible

**N/A for FoundryVTT integration - remains passing**.

### Configuration Review ✅

**Single Source of Truth Maintained**:
- alias.config.mjs remains canonical
- All adapters normalize to interchange format
- Sync script propagates changes unidirectionally (source → targets)
- Documentation complete and comprehensive

**No violations introduced during design**.

### Documentation Review ✅

**Comprehensive Documentation Delivered**:
- research.md: All technology decisions documented
- data-model.md: All entities and relationships defined
- adapter-interface.md: Complete contract with examples
- quickstart.md: Developer guide with common tasks
- All files follow header requirements
- Extension guidelines included

**Exceeds documentation requirements**.

### Quality Review ✅

**Testing Strategy Defined**:
- Unit tests for adapters (isolated, mocked file system)
- Integration tests for real file validation
- Project setup tests for live validation
- Dry-run mode implemented per constitution v2.1.0
- Performance targets specified (<5s validation, <3s sync)

**Meets all quality standards including new dry-run requirement**.

### Final Gate Status: ✅ PASS

All five constitution principles remain satisfied after design. No new violations introduced. Ready to proceed with implementation (Phase 2 - tasks.md generation via `/speckit.tasks` command).

**Design Approval**: ✅ Approved for implementation  
**Date**: 2025-10-31
