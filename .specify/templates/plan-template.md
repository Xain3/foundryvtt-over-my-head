# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: JavaScript (ESM) targeting Node.js 20.x and Foundry VTT v13 runtime
**Primary Dependencies**: Foundry VTT API, Vite 5, Vitest, Babel (via build tooling)
**Storage**: N/A — Foundry manages persisted world data; module stores config in `constants.yaml`
**Testing**: Vitest (`npm test`) with Babel transform and coverage thresholds from `vitest.config.mjs`
**Target Platform**: Foundry Virtual Tabletop v13+ across desktop hosts
**Project Type**: Single Foundry module bundled as ES module (`dist/main.mjs`)
**Performance Goals**: Avoid blocking Foundry hook execution; heavy work must stay under 16 ms per hook
**Constraints**: Respect Foundry hook order (`i18nInit` → `init`), use configured Vite aliases, prohibit CommonJS
**Scale/Scope**: Single module with contexts, handlers, and supporting utilities for roof occlusion features

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [ ] Lifecycle: All planned work defers heavy logic until `Hooks.once('i18nInit')` and registers handlers during `init`.
- [ ] Config: Interactions with settings/manifest route through `#config`; no duplicate constant exports.
- [ ] Contexts & Handlers: State changes flow via contexts; handlers extend `src/baseClasses/handler.mjs` without bypassing contexts.
- [ ] Tests & Build: Plan includes Vitest coverage and validates `npm run build` passes before release.
- [ ] Flags & Docs: New flags follow `docs/FLAG_MANAGEMENT.md` patterns with documentation updates captured in tasks.

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
src/
├── baseClasses/
├── config/
├── contexts/
├── handlers/
├── utils/
├── main.mjs
└── overMyHead.mjs

tests/
├── integration/
├── mocks/
├── performance/
└── setup/

dist/               # Vite build output (ignored locally, committed for releases)
docs/               # Module documentation and flag guidance
.dev/scripts/       # Build + deployment helpers for dev containers
```

**Structure Decision**: Single-module repository bundled via Vite; features integrate through
contexts and handler subclasses while configuration flows through `#config`.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
