# Implementation Plan: Parametrable Logger Module

**Branch**: `004-parametrable-logger` | **Date**: 2025-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-parametrable-logger/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a parametrable logger module with flexible configuration support located in `src/utils/`. The logger accepts pre-parsed configuration objects (no direct file I/O), supports standard log levels (error, warn, info, verbose, debug), provides template-based message formatting with placeholder substitution, and integrates with debug mode settings. Phase 1 delivers console-only output with architecture supporting pluggable output targets for future file logging. A utils entry point (`utils.ts`) provides centralized access to logger and future utilities, with shallow hierarchical configuration merge supporting instance-level overrides.

## Technical Context

**Language/Version**: JavaScript ES2022 / TypeScript with ESM modules (.mjs/.mts extensions)
**Primary Dependencies**: Node.js runtime, YAML parser (for config.ts to parse logging.yaml), chalk v5.x (ANSI color library)
**Storage**: N/A (logger is stateless; configuration passed as object)
**Testing**: Vitest (existing test framework per project setup)
**Target Platform**: Node.js 18+ (FoundryVTT module context)
**Project Type**: Single project (utility module within FoundryVTT module)
**Performance Goals**: Minimal overhead (<1ms per log call at info level); non-blocking console output; negligible memory footprint (<1MB for logger instance)
**Constraints**: No file I/O in logger class; no direct imports of config.ts or YAML files; must follow project alias import patterns; 80%+ test coverage required
**Scale/Scope**: Single logger class (~200-300 LOC), utils entry point (~50-100 LOC), module name resolver utility (~30-50 LOC); 3-5 configuration object interfaces

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Modular Architecture ✅

- ✅ Single point of entry: Logger configuration via pre-parsed object parameter; utils entry point for access
- ✅ Composition: Logger accepts configuration object (dependency injection); no inheritance chains
- ✅ Explicit responsibility: Logger (formatting/output), Module Name Resolver (name derivation), Utils Entry Point (utility access)
- ✅ Coding standards: Follows project style guide (file headers, JSDoc, 2-space indent, aliasing)
- ✅ Message prefix: Logger configuration includes module name for all output
- ✅ Aliasing: All imports use `#` aliases per alias.config.mjs

### II. FoundryVTT Integration ✅

- ✅ Hooks-only: Logger is a utility, not a FoundryVTT integration point; no hooks required
- ✅ No monkey-patching: Logger is standalone utility with no core modifications
- ✅ No module interference: Logger isolated in utils; configuration-driven behavior
- ✅ User-configurable: Debug mode and log levels configurable via settings

### III. Configuration Management ✅

- ✅ Centralized config flow: Logger receives config from config.ts singleton (pre-parsed)
- ✅ Separate dev configs: Runtime config object separate from dev tooling
- ✅ Immediate reflection: Logger instantiated with current config; new instances reflect updates
- ✅ Inline documentation: JSDoc on all public methods and configuration interfaces
- ✅ In-game UI: Debug mode and log level settings accessible via FoundryVTT settings (managed by config.ts)

### IV. Documentation Excellence ✅

- ✅ File headers: All .mjs/.mts files include @file, @description, @path headers
- ✅ Folder README: src/utils/README.md exists; will be updated with logger details
- ✅ JSDoc coverage: All Logger methods, Module Name Resolver, and Utils entry point require JSDoc
- ✅ Inline comments: Non-obvious logic (e.g., placeholder substitution, shallow merge) requires explanation
- ✅ Main README: Not modified by this feature (utils are internal)

### V. Quality & Maintainability ✅

- ✅ Coding conventions: JavaScript ES2022, ESM modules, follows project style guide
- ✅ Easy enable/disable: Logger is opt-in via utils entry point; no side effects if unused
- ✅ 80%+ coverage: Unit tests for all log methods, format substitution, level filtering, override merge
- ✅ Test organization: tests/unit/logger.unit.test.mjs, tests/unit/utils-entry-point.unit.test.mjs
- ✅ Unit test isolation: Tests use mock configuration objects; no real file I/O
- ✅ Integration tests: tests/integration/logger-with-config.int.test.mjs validates integration with config.ts
- ✅ Performance: Minimal overhead; no blocking operations
- ✅ Dry-run: N/A (logger is runtime utility, not executable script)

**GATE STATUS**: ✅ PASS - No constitutional violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/utils/
├── logger.ts                    # Logger class (NEW)
├── utils.ts                     # Utils entry point (MODIFIED - add logger access)
├── static.ts                    # Existing static utilities
├── README.md                    # (UPDATE - document logger and utils entry point)
└── static/
    └── moduleNameResolver.ts    # Module name resolver utility (NEW)

tests/unit/
├── logger.unit.test.mjs         # Logger unit tests (NEW)
├── utils-entry-point.unit.test.mjs  # Utils entry point tests (NEW)
└── moduleNameResolver.unit.test.mjs # Module name resolver tests (NEW)

tests/integration/
└── logger-with-config.int.test.mjs  # Logger integration with config.ts (NEW)

src/config/
├── constants/
│   └── logging.yaml             # Logging configuration source (EXISTS - reference only)
└── config.ts                    # Config singleton (EXISTS - no changes needed)
```

**Structure Decision**: Single project structure. Logger implemented as new utility class in `src/utils/` following existing module organization. Utils entry point (`utils.ts`) modified to provide logger access. Module name resolver added to `src/utils/static/` alongside other static utilities. All new code follows project aliasing conventions and file header requirements.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Constitution check passed without exceptions.
