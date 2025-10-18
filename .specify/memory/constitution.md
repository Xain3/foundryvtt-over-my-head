<!--
Sync Impact Report
Version change: N/A → 1.0.0
Modified principles: Added initial set I–V
Added sections: Operational Constraints, Delivery Workflow
Removed sections: none
Templates requiring updates:
- ✅ .specify/templates/plan-template.md (Constitution Check alignment)
- ✅ .specify/templates/spec-template.md (principle references)
- ✅ .specify/templates/tasks-template.md (story independence reminders)
Follow-up TODOs: none
-->

# Over My Head Module Constitution

## Core Principles

### I. Foundry Lifecycle Discipline

Module initialization MUST respect the Foundry hook order: export constants early, defer heavy work
until `Hooks.once('i18nInit')`, and complete handler registration during `init`. Utilities from
`utils.initializer` MUST coordinate context setup to avoid duplicate hook wiring. Rationale: honoring
the lifecycle prevents race conditions across Foundry updates and keeps startup deterministic.

### II. Config Single Source of Truth

All module settings, manifest data, and constants MUST flow through the `#config` singleton. Call
`config.exportConstants()` exactly once, avoid caching stale manifest copies, and derive module
identifiers via `buildManifestWithShortName()`. Rationale: centralizing configuration maintains
consistency between runtime, build artifacts, and Foundry expectations.

### III. Context-Oriented Handlers

Business logic MUST remain inside context objects and handler subclasses that extend
`src/baseClasses/handler.mjs`. Shared state belongs in `src/contexts/` with dot-path helpers rather
than ad-hoc mutations. Handlers MAY NOT bypass contexts or modify Foundry documents directly without a
synchronization strategy. Rationale: enforcing the context/handler split keeps behavior composable
and testable.

### IV. Test & Build Discipline

Every change MUST preserve or improve the Vitest suite (`npm test`) and respect coverage thresholds
in `vitest.config.mjs`. Implement tests before integrating features, prefer unit coverage for
contexts/handlers, and run `npm run build` to validate bundling. Rationale: proactive testing and
build checks catch regressions before module deployment.

### V. Transparent Flag Governance

Feature, debug, and deployment flags MUST align with the patterns documented in
`docs/FLAG_MANAGEMENT.md`. Environment variables MUST resolve deterministically across CI and dev
containers, and new flags require README or docs updates describing scope and default behavior.
Rationale: explicit flag hygiene prevents configuration drift between tables and pipelines.

## Operational Constraints

- Source code MUST remain ES module-based, rely on configured Vite aliases, and bundle via
  `npm run build` into `dist/main.mjs` for Foundry consumption.
- Settings and manifest data MUST derive from `constants.yaml`; mutate values by adjusting YAML and
  regeneration scripts rather than runtime overrides.
- Docker workflows SHOULD leverage provided compose files; maintaining sync scripts is required when
  testing inside containers.

## Delivery Workflow

- Plans MUST pass a Constitution Check confirming adherence to the lifecycle, config, and testing
  principles before implementation work begins.
- Code reviews MUST verify contexts and handlers follow their separation of concerns and that docs
  reflect any new flags or settings.
- Integration releases MUST execute `npm run build` and document deployment steps for Foundry worlds
  (standalone or mirrored via Docker scripts).

## Governance

This constitution supersedes conflicting project practices. Amendments require:

1. Documenting the proposed change via pull request referencing impacted principles or sections.
2. Updating affected templates in `.specify/templates/` and relevant docs (README, flag guidance).
3. Recording the version bump and amendment date within this file before merge.

Versioning follows semantic rules: increment MAJOR for principle removals or incompatible governance
changes, MINOR for new principles or substantive workflow mandates, and PATCH for clarifications.
Compliance reviews occur during code review and before release tags; non-compliant changes MUST halt
until resolved or formally waived with rationale recorded in the pull request.

**Version**: 1.0.0 | **Ratified**: 2025-10-18 | **Last Amended**: 2025-10-18
