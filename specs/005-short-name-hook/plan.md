# Implementation Plan: Hook Formatter Utility

**Branch**: `005-short-name-hook` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-short-name-hook/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a two-layer utility system for string formatting and Foundry VTT hook name generation:

1. **Base Layer (P1)**: Pure string formatter with prefix/suffix support - zero dependencies, pure utility function
2. **Integration Layer (P2)**: Hook name generator using hooks.yaml patterns and moduleNameResolver for standardized module-scoped hook names
3. **Extension Layer (P3)**: Parameterized hook patterns supporting dynamic placeholders for setting-specific and other contextual hooks

**Technical Approach**: Build incrementally starting with the pure string formatter, then layer on configuration-aware hook formatting. Use TypeScript for type safety, separate types from implementation, and ensure each priority level is independently testable and deployable.

## Technical Context

**Language/Version**: TypeScript 5.x / JavaScript ES2022 with ESM modules (.mts/.mjs extensions)
**Primary Dependencies**:

- Existing: `resolveModuleName` from `src/utils/static/moduleNameResolver.ts`
- Existing: Centralized config system (`src/config/config.ts`)
- Existing: `hooks.yaml` constants (`src/config/constants/hooks.yaml`)
- New: None (pure utility functions)
  **Storage**: N/A (stateless utilities)
  **Testing**: Vitest (existing project test framework)
- Unit tests: `tests/unit/stringFormatter.unit.test.mjs` and `tests/unit/hookFormatter.unit.test.mjs`
- Integration tests: `tests/integration/hookFormatter.int.test.mjs`
  **Target Platform**: FoundryVTT v12+ module (Node.js-like environment in browser)
  **Project Type**: Single project (FoundryVTT module with utilities in `src/utils/`)
  **Performance Goals**: <1ms per formatting operation (string operations only, no I/O)
  **Constraints**:
- Zero dependencies for P1 (pure function)
- P2/P3 depend only on existing config infrastructure
- Must follow module style guide (file headers, JSDoc, type separation)
- Error messages prefixed with `[OMH]`
- Must use import aliasing (`#/utils/`, `#config`)
  **Scale/Scope**: Small utility feature (~3 files, ~200 LOC, 15-20 tests)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: Modular Architecture ✅

- **Single point of entry**: Uses existing config singleton, no new entry points
- **Composition over inheritance**: Pure functions, no inheritance
- **Explicit responsibilities**:
  - `formatString`: Pure string manipulation (P1)
  - `formatHookName`: Config-aware hook generation (P2/P3)
- **Type separation**: `stringFormatter-types.ts` and `hookFormatter-types.ts` separate from implementation
- **Coding standards**: Will follow FoundryVTT best practices and style guide
- **Message prefixes**: Error messages will use `[OMH]` prefix
- **Import aliasing**: Will use `#/utils/` and `#config` aliases

**Status**: ✅ PASS - No violations. Pure utilities align perfectly with modular architecture principles.

### Principle II: FoundryVTT Integration ✅

- **Hooks-only integration**: This feature generates hook names but doesn't register hooks (consumers do that)
- **No monkey-patching**: Zero modifications to FoundryVTT core
- **No interference**: Utilities are module-internal, no global pollution
- **User-configurable**: Hook patterns defined in user-editable `hooks.yaml`

**Status**: ✅ PASS - Feature is a utility that supports hooks-based integration, doesn't directly integrate with Foundry.

### Principle III: Configuration Management ✅

- **Centralized config**: Uses existing config singleton via `config.constants.hooks`
- **Separate dev/runtime configs**: N/A (no dev config needed)
- **Immediate reflection**: Stateless functions always use current config
- **Inline documentation**: JSDoc on all functions
- **In-game UI**: N/A (utility functions, not user-facing settings)

**Status**: ✅ PASS - Consumes existing configuration, no new config management needed.

### Principle IV: Documentation Excellence ✅

- **JSDoc comments**: Required for all functions, including private helpers
- **Folder README**: Will update `src/utils/README.md` with new utilities
- **Main README**: Will document hook formatter usage in module README if needed
- **Inline comments**: Complex placeholder replacement logic will be explained
- **File headers**: All files will have `@file`, `@description`, `@path` headers
- **Executable scripts**: N/A (no scripts in this feature)

**Status**: ✅ PASS - Documentation requirements are clear and will be met.

### Principle V: Quality & Maintainability ✅

- **Best practices**: TypeScript, ESM modules, style guide compliance
- **Easy enable/disable**: N/A (utility functions, not toggleable feature)
- **80% test coverage**: Target met (SC-002 in spec)
- **Organized tests**: `tests/unit/` and `tests/integration/` as per project structure
- **Unit test isolation**: P1 has zero dependencies, P2/P3 use mock config
- **Feature tests**: Required per spec (FR-001 through FR-025 all testable)
- **Performance**: Target <1ms per operation (SC-007 in spec)
- **Dry-run mode**: N/A (no executable scripts)

**Status**: ✅ PASS - All quality requirements will be met.

### Summary

**Overall Gate Status**: ✅ **PASS** - All five constitutional principles satisfied with zero violations.

**Justification**: This is a pure utility feature that enhances existing infrastructure without introducing architectural complexity. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/005-short-name-hook/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   ├── stringFormatter-api.md
│   └── hookFormatter-api.md
├── checklists/          # Quality validation (existing)
│   └── requirements.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── utils/
│   ├── static/
│   │   ├── stringFormatter-types.ts     # NEW - P1 types (FormatOptions)
│   │   ├── stringFormatter.ts           # NEW - P1 implementation (pure utility)
│   │   ├── moduleNameResolver.ts        # EXISTING - Used by hookFormatter
│   │   └── README.md                    # UPDATE - Document new utilities
│   ├── hookFormatter-types.ts           # NEW - P2/P3 types (HookFormatterConfig, etc.)
│   ├── hookFormatter.ts                 # NEW - P2/P3 implementation
│   ├── static.ts                        # UPDATE - Export new static utilities
│   └── README.md                        # UPDATE - Document new utilities
├── config/
│   ├── config.ts                        # EXISTING - Config singleton
│   └── constants/
│       └── hooks.yaml                   # EXISTING - Hook patterns and definitions

tests/
├── unit/
│   ├── stringFormatter.unit.test.mjs    # NEW - P1 unit tests
│   └── hookFormatter.unit.test.mjs      # NEW - P2/P3 unit tests
└── integration/
    └── hookFormatter.int.test.mjs       # NEW - Integration with real config
```

**Structure Decision**: Single project structure (FoundryVTT module). All new utilities go in `src/utils/` following existing pattern. **String formatter** placed in `src/utils/static/` (pure stateless utility) per project conventions. **Hook formatter** in `src/utils/` (stateless but config-aware). Type definitions separated per constitutional requirement. Tests organized by type (unit vs integration) per existing project conventions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**N/A** - No constitutional violations. All principles satisfied (see Constitution Check section above).
