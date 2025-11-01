# Implementation Tasks: Alias Configuration Centralization

**Feature**: 003-alias-centralization
**Branch**: `003-alias-centralization`
**Created**: 2025-10-31

## Overview

This document breaks down the implementation into executable tasks organized by user story. Each phase represents a complete, independently testable increment of functionality.

**MVP Scope**: User Story 1 (Automated Alias Validation) - P1 priority

---

## Task Summary

- **Total Tasks**: 59
- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 10 tasks
- **Phase 3 (US1 - Validation)**: 11 tasks
- **Phase 4 (US2 - Sync Script)**: 12 tasks
- **Phase 5 (US5 - Extensibility)**: 6 tasks
- **Phase 6 (US3 & US4 - Integration)**: 7 tasks
- **Phase 7 (Polish)**: 6 tasks

---

## User Story Mapping

| User Story                                          | Priority | Phase | Tasks | Independent Test Criteria                                              |
| --------------------------------------------------- | -------- | ----- | ----- | ---------------------------------------------------------------------- |
| US1: Automated Alias Validation                     | P1       | 3     | 11    | Modify alias in tsconfig.json, validation test fails with clear diff   |
| US2: Automated Alias Synchronization Script         | P2       | 4     | 12    | Add alias to alias.config.mjs, run sync script, all files updated      |
| US5: Extensibility for New Configuration File Types | P2       | 5     | 6     | Follow extension docs, add webpack adapter, validation/sync work       |
| US3: Pre-Commit Hook Integration                    | P3       | 6     | 4     | Modify alias.config.mjs, attempt commit, hook blocks with instructions |
| US4: VS Code Task Integration                       | P3       | 6     | 3     | Run "Sync Aliases" from command palette, output shown in terminal      |

---

## Dependencies & Execution Order

### Story Completion Order

```
Phase 1: Setup (blocking - required for all)
    ↓
Phase 2: Foundational (blocking - required for all user stories)
    ↓
    ├─→ Phase 3: US1 (Validation) ← MVP
    │      ↓
    ├─→ Phase 4: US2 (Sync Script) ← depends on US1 adapters
    │      ↓
    ├─→ Phase 5: US5 (Extensibility) ← depends on US1 adapters (can parallel with US2)
    │      ↓
    └─→ Phase 6: US3 & US4 (Integration) ← depends on US1 validation & US2 sync script
           ↓
       Phase 7: Polish (final touches)
```

### Parallel Opportunities

**After Phase 2 completes:**

- Phase 3 (US1) can be started

**After Phase 3 completes:**

- Phase 4 (US2 - Sync Script) and Phase 5 (US5 - Extensibility) can run in parallel
  - Different files, minimal dependencies

**After Phase 4 & 5 complete:**

- Phase 6 (US3 & US4 - Integration) requires both validation and sync

---

## Implementation Strategy

1. **MVP First**: Complete Phases 1-3 for minimal viable product (validation only)
2. **Incremental Delivery**: Each phase delivers working, testable functionality
3. **Test-Driven**: Write tests alongside implementation (not before or after)
4. **Parallel Execution**: After foundational work, US2 and US5 can be parallelized

---

## Phase 1: Setup

**Goal**: Create project structure, directories, and placeholder files

**Dependencies**: None (can start immediately)

### Tasks

- [ ] T001 Create src/utils/alias-adapters/ directory
- [ ] T002 Create tests/unit/adapters/ directory
- [ ] T003 Create tests/project-setup-tests/ directory (if not exists)
- [ ] T004 Create .dev/scripts/ directory (if not exists)
- [ ] T005 Create src/utils/alias-adapters/README.md with placeholder content
- [ ] T006 Create tests/unit/adapters/README.md with placeholder content
- [ ] T007 Update tests/project-setup-tests/README.md to mention alias validation tests

---

## Phase 2: Foundational Components

**Goal**: Build shared infrastructure required by all user stories

**Dependencies**: Phase 1 complete

**Independent Test**: Import and instantiate base adapter, registry successfully

### Tasks

- [ ] T008 [P] Implement BaseConfigAdapter class in src/utils/alias-adapters/base-adapter.mjs
- [ ] T009 [P] Implement AdapterRegistry class in src/utils/alias-adapters/adapter-registry.mjs
- [ ] T010 [P] Create JSONC helper functions in src/utils/alias-adapters/jsonc-helpers.mjs
- [ ] T011 [P] Create normalization helper functions in src/utils/alias-adapters/normalization-helpers.mjs
- [ ] T012 [P] Write unit tests for BaseConfigAdapter in tests/unit/adapters/base-adapter.unit.test.mjs
- [ ] T013 [P] Write unit tests for AdapterRegistry in tests/unit/adapters/adapter-registry.unit.test.mjs
- [ ] T014 [P] Write unit tests for JSONC helpers in tests/unit/adapters/jsonc-helpers.unit.test.mjs
- [ ] T015 [P] Write unit tests for normalization helpers in tests/unit/adapters/normalization-helpers.unit.test.mjs
- [ ] T016 Run foundational tests to verify base classes work
- [ ] T017 Update src/utils/alias-adapters/README.md with architecture documentation

---

## Phase 3: User Story 1 - Automated Alias Validation (P1)

**Goal**: Implement validation tests that detect alias configuration drift

**Story**: As a developer, when I run the test suite, the system validates that all alias configurations are synchronized with alias.config.mjs

**Dependencies**: Phase 2 complete

**Independent Test**: Modify alias in tsconfig.json, run validation test, see clear diff with fix command

### Tasks

- [ ] T018 [P] [US1] Implement TsConfigAdapter in src/utils/alias-adapters/tsconfig-adapter.mjs
- [ ] T019 [P] [US1] Implement PackageJsonAdapter in src/utils/alias-adapters/package-json-adapter.mjs
- [ ] T020 [P] [US1] Write unit tests for TsConfigAdapter in tests/unit/adapters/tsconfig-adapter.unit.test.mjs
- [ ] T021 [P] [US1] Write unit tests for PackageJsonAdapter in tests/unit/adapters/package-json-adapter.unit.test.mjs
- [ ] T022 [US1] Implement alias validation test in tests/project-setup-tests/alias-sync.setup.test.mjs
- [ ] T023 [US1] Test validation with synchronized aliases (should pass)
- [ ] T024 [US1] Test validation with misaligned tsconfig.json (should fail with diff)
- [ ] T025 [US1] Test validation with missing alias in package.json (should fail with clear message)
- [ ] T026 [US1] Test validation with extra alias in config file (should fail with clear message)
- [ ] T027 [US1] Verify error messages include file paths and sync command
- [ ] T028 [US1] Run full validation test suite to verify US1 acceptance criteria

**Acceptance Criteria**:

- ✅ All alias configurations synchronized → tests pass
- ✅ tsconfig.json misaligned → test fails with diff and fix command
- ✅ package.json missing alias → test fails indicating missing alias
- ✅ New alias added to alias.config.mjs → test fails indicating not propagated

---

## Phase 4: User Story 2 - Automated Alias Synchronization Script (P2)

**Goal**: Implement sync script that updates configuration files from alias.config.mjs

**Story**: As a developer, when I modify alias.config.mjs, I can run a script that automatically updates all dependent configuration files

**Dependencies**: Phase 3 complete (needs adapters)

**Independent Test**: Add new alias to alias.config.mjs, run sync script, verify all files updated with correct syntax

### Tasks

- [ ] T029 [P] [US2] Implement sync script core logic in .dev/scripts/sync-aliases.mjs
- [ ] T030 [P] [US2] Add CLI argument parsing (--dry-run, --verbose) in sync-aliases.mjs
- [ ] T031 [P] [US2] Implement adapter registration and iteration in sync-aliases.mjs
- [ ] T032 [P] [US2] Implement dry-run mode (preview without writing) in sync-aliases.mjs
- [ ] T033 [P] [US2] Implement verbose logging mode in sync-aliases.mjs
- [ ] T034 [P] [US2] Implement error handling and summary reporting in sync-aliases.mjs
- [ ] T035 [US2] Add shebang line and make sync-aliases.mjs executable
- [ ] T036 [US2] Write unit tests for sync script logic in tests/unit/sync-aliases.unit.test.mjs
- [ ] T037 [US2] Test sync with new alias added (should update all files)
- [ ] T038 [US2] Test sync with alias removed (should remove from all files)
- [ ] T039 [US2] Test sync with dry-run flag (should preview without modifying)
- [ ] T040 [US2] Run sync script and validate with US1 tests to verify US2 acceptance criteria

**Acceptance Criteria**:

- ✅ New alias added → sync updates all files with correct syntax
- ✅ Alias removed → sync removes from all files
- ✅ Alias path modified → sync updates all files
- ✅ All files synchronized → sync reports "already synchronized"
- ✅ Dry-run flag → displays changes without modifying files
- ✅ Sync completes → validation tests pass

---

## Phase 5: User Story 5 - Extensibility for New Configuration File Types (P2)

**Goal**: Document and demonstrate extension pattern for adding new adapters

**Story**: As a developer, when the project adopts a new build tool, I can easily add support following clear extension guidelines

**Dependencies**: Phase 3 complete (needs existing adapters as examples)

**Independent Test**: Follow extension docs, implement hypothetical webpack adapter, verify it works

### Tasks

- [ ] T041 [P] [US5] Copy adapter-interface.md to docs/alias-adapter-interface.md
- [ ] T042 [P] [US5] Create example WebpackAdapter in src/utils/alias-adapters/webpack-adapter.mjs (commented as example)
- [ ] T043 [P] [US5] Write unit tests for WebpackAdapter in tests/unit/adapters/webpack-adapter.unit.test.mjs
- [ ] T044 [US5] Update src/utils/alias-adapters/README.md with "Adding New Adapters" section
- [ ] T045 [US5] Test example adapter following extension documentation
- [ ] T046 [US5] Verify extension process takes <30 minutes by timing documentation follow-through

**Acceptance Criteria**:

- ✅ Extension documentation exists and is clear
- ✅ New adapter can be added in <30 minutes
- ✅ New adapter included in validation automatically
- ✅ New adapter updated by sync script automatically
- ✅ No changes to core validation or sync logic required

---

## Phase 6: User Story 3 & 4 - Pre-Commit Hook & VS Code Integration (P3)

**Goal**: Integrate validation and sync into developer workflows

**Story (US3)**: As a developer, when I commit changes, a pre-commit hook validates alias synchronization
**Story (US4)**: As a developer using VS Code, I can run sync from command palette

**Dependencies**: Phase 3 (validation) and Phase 4 (sync) complete

**Independent Test (US3)**: Modify alias.config.mjs, attempt commit without sync, hook blocks
**Independent Test (US4)**: Run "Sync Aliases" task from VS Code, see output in terminal

### Tasks

#### US3: Pre-Commit Hook

- [ ] T047 [P] [US3] Create or update .husky/pre-commit hook to run alias validation
- [ ] T048 [US3] Configure hook to show clear error message with sync command on failure
- [ ] T049 [US3] Test hook blocks commit when aliases misaligned
- [ ] T050 [US3] Test hook allows commit when aliases synchronized

#### US4: VS Code Task

- [ ] T051 [P] [US4] Create or update .vscode/tasks.json with "Sync Aliases" task
- [ ] T052 [US4] Test task runs from command palette
- [ ] T053 [US4] Verify task output appears in terminal panel

**Acceptance Criteria (US3)**:

- ✅ alias.config.mjs modified → pre-commit hook validates
- ✅ Validation fails → commit blocked with clear instructions
- ✅ All aliases synchronized → commit proceeds

**Acceptance Criteria (US4)**:

- ✅ Task runs from command palette
- ✅ Sync script output displayed in terminal
- ✅ Success message shown when complete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Documentation, npm scripts, final integration

**Dependencies**: All user story phases complete

### Tasks

- [ ] T054 [P] Add npm script "sync-aliases" to package.json
- [ ] T055 [P] Update main README.md with alias centralization system overview
- [ ] T056 [P] Update docs/README.md with link to alias adapter interface
- [ ] T057 Run full test suite (all phases) to verify complete system
- [ ] T058 Verify performance targets met (validation <5s, sync <3s, pre-commit <2s)
- [ ] T059 Final review of all file headers, JSDoc completeness, and README updates

---

## Parallel Execution Examples

### Example 1: After Foundational Phase (Phase 2)

**Can work in parallel**:

- T018-T021: Adapter implementations (different files)
- T020-T021: Adapter tests (different files)

**Example workflow**:

```bash
# Developer A: TypeScript adapter
git checkout -b us1-tsconfig-adapter
# Work on T018, T020

# Developer B: Package.json adapter
git checkout -b us1-package-json-adapter
# Work on T019, T021
```

### Example 2: After US1 Complete (Phase 3)

**Can work in parallel**:

- Phase 4 (US2 - Sync Script): T029-T040
- Phase 5 (US5 - Extensibility): T041-T046

**Example workflow**:

```bash
# Developer A: Sync script
git checkout -b us2-sync-script
# Work on T029-T040

# Developer B: Extension documentation
git checkout -b us5-extensibility-docs
# Work on T041-T046

# Merge both when complete, no conflicts
```

### Example 3: Within Single Phase

**Phase 4 parallelizable tasks**:

- T029: Core sync logic
- T030: CLI arg parsing
- T031: Adapter registration
- T032: Dry-run mode
- T033: Verbose mode
- T034: Error handling

All work on same file but different functions - coordinate to avoid conflicts

---

## Testing Strategy

Tests are created **alongside** implementation (not before, not after):

1. **Unit Tests**: Written as each module is implemented
   - Adapters: Mock file system, test normalization logic
   - Registry: Test registration, lookup, conflicts
   - Helpers: Test JSONC parsing, format detection

2. **Integration Tests**: Written after adapters exist
   - Validation tests: Use real test fixtures
   - Sync script tests: Run against test fixtures

3. **Manual Tests**: Performed to verify acceptance criteria
   - Run commands, observe output
   - Check files updated correctly
   - Verify performance targets

---

## Task Checklist Format

All tasks follow this format for clarity:

```
- [ ] [TaskID] [P] [Story] Description with file path
```

- **TaskID**: Sequential number (T001, T002, ...)
- **[P]**: Present if task is parallelizable (different files, no dependencies)
- **[Story]**: User story label ([US1], [US2], [US3], [US4], [US5]) for phases 3-6 only
- **Description**: Clear action with file path

---

## MVP Delivery

**Minimum Viable Product**: Phases 1-3

This delivers:

- ✅ Base architecture (adapters, registry)
- ✅ TypeScript and package.json adapters
- ✅ Validation tests that catch drift
- ✅ Clear error messages with fix instructions

**Value**: Prevents configuration drift immediately, even without sync automation

**Estimated Effort**: ~2-3 days for experienced developer

---

## Full Feature Delivery

**Complete Implementation**: Phases 1-7

This delivers:

- ✅ All MVP features
- ✅ Automated sync script with dry-run mode
- ✅ Extension documentation and examples
- ✅ Pre-commit hook integration
- ✅ VS Code task integration
- ✅ Complete documentation

**Estimated Effort**: ~5-7 days for experienced developer

---

## Notes

- All file headers must include `@file`, `@description`, `@path` per style guide
- All functions must have JSDoc comments
- Error messages must include `[OMH]` prefix
- Tests use Vitest framework with `*.setup.test.mjs` naming for project setup tests
- Adapters must preserve file formatting (comments, indentation, EOL)
- Sync script must support `--dry-run` and `--verbose` flags
- Pre-commit hook validates only (does not auto-sync)

---

**Tasks Status**: Ready for implementation
**Last Updated**: 2025-10-31
**Next Command**: Begin Phase 1 tasks
