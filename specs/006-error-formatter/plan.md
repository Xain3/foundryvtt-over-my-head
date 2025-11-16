# Implementation Plan: Error Formatter Utility

**Branch**: `006-error-formatter` | **Date**: 2025-11-16 | **Spec**: [`specs/006-error-formatter/spec.md`](spec.md)
**Input**: Feature specification from `/specs/006-error-formatter/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a configurable error formatter that centralizes module-aware prefixes, optional caller context, and stack trace patterns while leveraging the frozen config singleton and documented fallback defaults.

## Technical Context

**Language/Version**: TypeScript targeting ES2022 with Node 20+ tooling and Vite builds
**Primary Dependencies**: Core module helpers (`#/config/config.ts`, `#/utils/logger.ts`), plus existing utilities like `confbox`, `lodash`, and Node built-ins for temporary file handling
**Storage**: N/A for runtime formatting (writes temp files under `os.tmpdir()` only when capturing full stack traces)
**Testing**: Vitest (unit, integration, performance suites) with mock globals from `tests/mocks`
**Target Platform**: Foundry VTT v12+ (browser client) packaged via the existing Vite pipeline
**Project Type**: Single modular Foundry VTT module (utility under `src/`)
**Performance Goals**: Keep formatting latency under 1ms while capping stack trace output at 20 lines and storing extras in temp logs
**Constraints**: Hooks-only integration, immutable config singleton, alias imports, strict headers/JSDoc style, no global mutations from the formatter
**Scale/Scope**: Serves the single module instance used across worlds/scenes but must remain performant under frequent concurrent error logging

## Constitution Check

No constitution gates are violated: the formatter is a focused utility (Modular Architecture), leverages the centralized config singleton (Configuration Management), avoids monkey-patching (FoundryVTT Integration), and will carry the required documentation/JSDoc (Documentation Excellence). Continue to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/006-error-formatter/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Layout

```text
src/
├── main.mjs
├── omh.mjs
├── config/
│   ├── config.ts
│   └── helpers/
├── utils/
│   ├── logger.ts
│   └── static.ts
└── baseClasses/

tests/
├── unit/
├── integration/
└── mocks/
```

**Structure Decision**: Continue with the existing single-module layout. The new formatter will live in `src/utils` (reusing `src/config`), and its tests stay in the current `tests/unit` and `tests/integration` directories. No additional project subdivisions are required.

## Complexity Tracking

No constitution violations detected; no extra complexity justification needed.
