# Tasks: Error Formatter Utility

**Input**: Design documents from `/specs/006-error-formatter/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Each user story includes explicit independent test criteria; unit/integration test tasks are only added where verification is critical to the story’s acceptance.

**Organization**: Tasks are grouped by user story (after shared phases) so each increment can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Task can run in parallel (targets different files / no blocking dependency)
- **[Story]**: User story label (US1, US2, etc.). Setup/foundational/polish phases omit this label.
- Include exact file paths in every description.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare repository-wide scaffolding so later tasks can reference the formatter without path or documentation blockers.

- [ ] T001 Update alias mappings for the formatter in `alias.config.mjs`, `tsconfig.json`, and `vite.config.mjs` to expose `#/utils/errorFormatter` for root-relative imports.
- [ ] T002 [P] Document the upcoming error formatter responsibilities and constraints in `src/utils/README.md` so contributors understand scope and invariants.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST exist before any user story implementation begins.

- [ ] T003 Create `src/utils/errorFormatter-types.ts` defining `ErrorContext`, `FormatOptions`, and `ErrorPattern` interfaces plus exported type guards.
- [ ] T004 [P] Scaffold `src/utils/errorFormatter.mts` with the exported `formatError()` stub, default config resolution, and TODO markers for the upcoming stories.
- [ ] T005 [P] Add shared helpers in `src/utils/helpers/errorFormatterHelpers.mts` for stack truncation, temp log file writing, and brace escaping utilities.
- [ ] T006 Update default constants in `src/config/constants/errors.yaml` and document them in `src/config/README.md` (pattern, separator, fallback module, temp log location expectations).
- [ ] T007 [P] Re-export the formatter entry point through `src/utils/static.ts` and ensure `src/main.mjs` (or equivalent barrel) exposes it for other modules and tests.

**Checkpoint**: Once these tasks are complete, user stories can proceed in parallel.

---

## Phase 3: User Story 1 – Basic Error Formatting with Module Context (Priority: P1) 🎯 MVP

**Goal**: Provide a single `formatError()` helper that coerces strings to `Error`, resolves the module name, and applies the default pattern so every error shows the module prefix.

**Independent Test**: Call `formatError(new Error('Configuration failed'))` and `formatError('text')`; verify the result always starts with the configured module name and throws `TypeError` for invalid inputs.

### Implementation

- [ ] T008 [P] [US1] Create baseline unit tests covering module prefix resolution, string coercion, and invalid input handling in `tests/unit/errorFormatter-basic.unit.test.mjs`.
- [ ] T009 [US1] Implement normalization, module resolution (id/title/shortName), placeholder substitution, and separator joins inside `src/utils/errorFormatter.mts`.
- [ ] T010 [P] [US1] Update developer docs with the basic usage example by editing `docs/logger-reference.md` and `specs/006-error-formatter/quickstart.md`.

**Checkpoint**: Formatting simple errors now works end-to-end and is independently testable.

---

## Phase 4: User Story 2 – Optional Stack Trace Inclusion (Priority: P2)

**Goal**: Allow developers to include stack traces on demand, truncating display output to 20 lines while persisting the full trace to a temp log file.

**Independent Test**: Format an error with `includeStack: true` and confirm the formatted string shows 20 lines max plus `[Full trace: <tmp path>]`, while the referenced file exists with the complete trace.

### Implementation

- [ ] T011 [P] [US2] Add stack-option unit tests in `tests/unit/errorFormatter-stack.unit.test.mjs` validating includeStack toggles, truncation counts, and temp-file references.
- [ ] T012 [US2] Implement stack capture, 20-line truncation, and `[Full trace: path]` annotations using helpers inside `src/utils/errorFormatter.mts`.
- [ ] T013 [P] [US2] Write an integration test in `tests/integration/errorFormatter.int.test.mjs` that asserts temp log files are created under `os.tmpdir()` and cleaned up per spec.

**Checkpoint**: Stack-enabled formatting is independently testable without impacting US1 behaviors.

---

## Phase 5: User Story 3 – Caller Context for Error Origin Tracking (Priority: P3)

**Goal**: Provide optional caller information so developers can see which function raised the error, including automatic escaping of `{{…}}` sequences.

**Independent Test**: Format an error with `{ includeCaller: true, caller: 'loadConfig' }` and confirm the output inserts the caller label ahead of the message with braces escaped; disabling `includeCaller` omits the label entirely.

### Implementation

- [ ] T014 [P] [US3] Write caller-context unit tests in `tests/unit/errorFormatter-caller.unit.test.mjs` covering includeCaller gating and brace escaping behavior.
- [ ] T015 [US3] Implement caller injection and brace escaping within `src/utils/errorFormatter.mts`, ensuring ordering respects the active pattern and default separator.

**Checkpoint**: Caller metadata can now be toggled independently of stack traces.

---

## Phase 6: User Story 4 – Configurable Error Message Patterns (Priority: P4)

**Goal**: Enable custom ordering/separators via configuration so maintainers can align formatter output with external logging expectations.

**Independent Test**: Change the pattern in `src/config/constants/errors.yaml` (or via settings) to reorder placeholders and verify formatted output follows the new order and separator rules, including omission of `{{stack}}` when removed from the template.

### Implementation

- [ ] T016 [P] [US4] Author pattern customisation unit tests in `tests/unit/errorFormatter-pattern.unit.test.mjs` verifying order/separator overrides and omission behavior.
- [ ] T017 [US4] Implement full pattern parsing, placeholder resolution, and config override handling inside `src/utils/errorFormatter.mts`, including fallback defaults when settings are unavailable.
- [ ] T018 [P] [US4] Document the configuration workflow for custom patterns in `docs/config-quickstart.md` and update `docs/README.md` with references to the new formatter.

**Checkpoint**: All user stories (US1–US4) operate independently and respect custom configuration.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, validation, and cross-story cleanup.

- [ ] T019 [P] Refresh `README.md` and `docs/logger-reference.md` with release notes, known limitations, and links to the formatter’s advanced options.
- [ ] T020 Execute repository-wide validation from `/workspaces/foundryvtt-over-my-head/` (`npm run lint` and `npm test -- --project unit`) and record pass/fail notes in `specs/006-error-formatter/tasks.md`.

---

## Dependencies & Execution Order

1. **Setup → Foundational → User Stories → Polish** (strict order).
2. **User Story Dependency Graph**: `US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4)`; each story builds on completed functionality but remains independently testable once its prerequisites finish.
3. **Blocking Rules**:
   - Phase 2 must finish before any user story work.
   - US4 depends on pattern hooks introduced across US1–US3; do not start before previous stories stabilize.

---

## Parallel Opportunities

- **Setup**: T001 and T002 touch different files; T002 is explicitly marked `[P]`.
- **Foundational**: T004, T005, and T007 are parallel-safe once T003 is underway because they modify separate files.
- **US1**: T008 and T010 can run alongside T009 after the scaffolds exist.
- **US2**: T011 and T013 can proceed in parallel while T012 focuses on implementation.
- **US3**: T014 can run while T015 is in progress (tests-first workflow).
- **US4**: T016 and T018 are parallel-friendly alongside T017’s implementation work.
- **Polish**: T019 and T020 can run concurrently once all stories close.

---

## Parallel Examples per User Story

- **US1**: Run T008 (tests) and T010 (docs) concurrently while T009 implements the formatter core.
- **US2**: Run T011 (unit tests) and T013 (integration test) in parallel, both targeting separate files, while T012 evolves the implementation.
- **US3**: Execute T014 (tests) alongside T015 (implementation) since the files differ and tests guide the behavior.
- **US4**: Work on T016 (tests) and T018 (docs) concurrently; T017 integrates the parser logic once tests define expectations.

---

## Implementation Strategy

1. **MVP First**: Complete Phases 1–3 (Setup, Foundational, US1). Ship the formatter with module prefixes as the initial deliverable.
2. **Incremental Enhancements**: Layer US2 (stack traces), US3 (caller context), and US4 (pattern customisation) sequentially, validating each story independently before proceeding.
3. **Parallel Execution**: After Foundational tasks finish, allocate different developers to US1–US4 as capacity allows, respecting the dependency chain noted above.
4. **Final Validation**: Use Phase 7 tasks to ensure documentation, linting, and targeted tests are complete before tagging the release.
