---
description: 'Task list for Development Mode Parser implementation'
---

# Tasks: Development Mode Parser

**Feature Branch**: `002-dev-mode-parser`
**Input**: Design documents from `/specs/002-dev-mode-parser/`
**Prerequisites**: plan.md (✅), spec.md (✅), contracts/devModeParser.ts (✅)

**Tests**: This feature includes comprehensive unit tests as specified in the plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and file structure setup

- [ ] T001 Create implementation file at src/utils/static/devModeParser.ts with file header and imports
- [ ] T002 Create test file at tests/unit/utils/devModeParser.unit.test.ts with test structure
- [ ] T003 [P] Configure TypeScript for new utility module (verify strict mode enabled)

---

## Phase 2: Foundational (Core Type System)

**Purpose**: Type definitions and utility functions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define ConfigSource, ModeStatus, and ConfigResult types in src/utils/static/devModeParser.ts
- [ ] T005 Implement internal coercion function \_coerceToBoolean(value: ConfigSource): boolean in src/utils/static/devModeParser.ts
- [ ] T006 Implement internal hierarchy evaluation function \_evaluateHierarchy(envVar, moduleFlag, inGameSetting): boolean in src/utils/static/devModeParser.ts
- [ ] T007 [P] Write unit tests for \_coerceToBoolean covering all edge cases in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T008 [P] Write unit tests for \_evaluateHierarchy covering hierarchy precedence in tests/unit/utils/devModeParser.unit.test.ts

**Checkpoint**: Type system and core utilities ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Check Development Mode Status (Priority: P1) 🎯 MVP

**Goal**: Implement pure static function to check if development mode is active by evaluating settings hierarchy

**Independent Test**: Call DevModeParser.isDevMode() with different parameter combinations and verify correct hierarchy-based results

### Implementation for User Story 1

- [ ] T009 [US1] Create DevModeParser class with private constructor in src/utils/static/devModeParser.ts
- [ ] T010 [US1] Implement static method isDevMode(envVar, moduleFlag, inGameSetting): boolean using \_evaluateHierarchy in src/utils/static/devModeParser.ts
- [ ] T011 [US1] Add JSDoc documentation for isDevMode method with examples in src/utils/static/devModeParser.ts
- [ ] T012 [P] [US1] Write unit test: env var set to true should return true regardless of other values in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T013 [P] [US1] Write unit test: module flag true (env false/undefined) should return true in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T014 [P] [US1] Write unit test: in-game setting true (env and module false) should return true in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T015 [P] [US1] Write unit test: all sources false/absent should return false in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T016 [P] [US1] Write unit test: hierarchy precedence (env > module > setting) with conflicting values in tests/unit/utils/devModeParser.unit.test.ts

**Checkpoint**: isDevMode() is fully functional and independently testable with complete coverage

---

## Phase 4: User Story 2 - Check Debug Mode Status (Priority: P1)

**Goal**: Implement pure static function to check if debug mode is active, independent from dev mode

**Independent Test**: Call DevModeParser.isDebugMode() with different parameter combinations and verify correct results independently from dev mode

### Implementation for User Story 2

- [ ] T017 [US2] Implement static method isDebugMode(envVar, moduleFlag, inGameSetting): boolean using \_evaluateHierarchy in src/utils/static/devModeParser.ts
- [ ] T018 [US2] Add JSDoc documentation for isDebugMode method with examples in src/utils/static/devModeParser.ts
- [ ] T019 [P] [US2] Write unit test: env var set to true should return true regardless of other values in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T020 [P] [US2] Write unit test: module flag true (env false/undefined) should return true in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T021 [P] [US2] Write unit test: in-game setting true (env and module false) should return true in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T022 [P] [US2] Write unit test: all sources false/absent should return false in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T023 [P] [US2] Write unit test: debug mode independent from dev mode (dev enabled, debug disabled) in tests/unit/utils/devModeParser.unit.test.ts

**Checkpoint**: isDebugMode() is fully functional and independently testable with complete coverage

---

## Phase 5: User Story 3 - Access Mode Settings Programmatically (Priority: P2)

**Goal**: Implement convenience wrapper to integrate with config singleton while maintaining pure function principles

**Independent Test**: Call DevModeParser.fromConfig() with mock config objects and verify correct extraction and evaluation

### Implementation for User Story 3

- [ ] T024 [US3] Define ConfigSingleton minimal interface in src/utils/static/devModeParser.ts
- [ ] T025 [US3] Implement static method fromConfig(config, prefixOverride?): ConfigResult in src/utils/static/devModeParser.ts
- [ ] T026 [US3] Implement prefix extraction logic (use config.prefix or prefixOverride) in fromConfig method in src/utils/static/devModeParser.ts
- [ ] T027 [US3] Call isDevMode and isDebugMode from fromConfig with extracted values in src/utils/static/devModeParser.ts
- [ ] T028 [US3] Add JSDoc documentation for fromConfig method with examples in src/utils/static/devModeParser.ts
- [ ] T029 [P] [US3] Write unit test: fromConfig with mock config returns correct devMode and debugMode in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T030 [P] [US3] Write unit test: fromConfig with prefixOverride uses override instead of config.prefix in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T031 [P] [US3] Write unit test: calling fromConfig multiple times with same config returns consistent results (pure function) in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T032 [P] [US3] Write unit test: multiple callers with different configs each get correct results (no shared state) in tests/unit/utils/devModeParser.unit.test.ts

**Checkpoint**: fromConfig() is fully functional and all three user stories can be used independently

---

## Phase 6: User Story 4 - Handle Missing Configuration Gracefully (Priority: P3)

**Goal**: Ensure all static functions handle missing, undefined, or invalid parameters without throwing errors

**Independent Test**: Call all static functions with undefined, null, and invalid parameters and verify graceful defaults

### Implementation for User Story 4

- [ ] T033 [US4] Add null/undefined handling to \_coerceToBoolean function (default to false) in src/utils/static/devModeParser.ts
- [ ] T034 [US4] Add type coercion for common truthy strings ("true", "1", "yes", "on") to \_coerceToBoolean in src/utils/static/devModeParser.ts
- [ ] T035 [US4] Add warning logging for unexpected parameter types in \_coerceToBoolean in src/utils/static/devModeParser.ts
- [ ] T036 [US4] Add graceful error handling in fromConfig for missing config methods in src/utils/static/devModeParser.ts
- [ ] T037 [P] [US4] Write unit test: undefined parameters should return false without errors in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T038 [P] [US4] Write unit test: null parameters should return false without errors in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T039 [P] [US4] Write unit test: common truthy strings ("yes", "1", "on") should return true in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T040 [P] [US4] Write unit test: unexpected parameter types should log warning and return false in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T041 [P] [US4] Write unit test: fromConfig with missing config.get method should handle gracefully in tests/unit/utils/devModeParser.unit.test.ts

**Checkpoint**: All edge cases handled gracefully, system is production-ready

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks and performance validation

- [ ] T042 Add file-level JSDoc header documentation to src/utils/static/devModeParser.ts
- [ ] T043 Add default export for DevModeParser class in src/utils/static/devModeParser.ts
- [ ] T044 [P] Run ESLint on src/utils/static/devModeParser.ts and fix any issues
- [ ] T045 [P] Run TypeScript compiler in strict mode and verify no errors
- [ ] T046 [P] Write performance test: verify isDevMode completes in <1ms in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T047 [P] Write performance test: verify isDebugMode completes in <1ms in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T048 [P] Write performance test: verify fromConfig completes in <1ms in tests/unit/utils/devModeParser.unit.test.ts
- [ ] T049 Run full test suite and verify 100% code coverage for src/utils/static/devModeParser.ts
- [ ] T050 Verify Constitution compliance (modular, pure functions, documented, tested)
- [ ] T051 Create or update README in src/utils/static/ if needed to document new utility

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Foundational - Independent from US1
  - User Story 3 (Phase 5): Can start after US1 and US2 complete (needs core methods to exist)
  - User Story 4 (Phase 6): Can start after US1, US2, US3 (adds edge case handling to existing functions)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent from US1 (can run in parallel)
- **User Story 3 (P2)**: Depends on US1 and US2 being complete (calls isDevMode and isDebugMode)
- **User Story 4 (P3)**: Depends on US1, US2, US3 being complete (adds robustness to all methods)

### Within Each User Story

- Implementation tasks first (create methods)
- Documentation alongside implementation
- Unit tests can be written in parallel with implementation (TDD approach) or after
- All tests marked [P] within a story can run in parallel

### Parallel Opportunities

- **Phase 1**: All Setup tasks marked [P] can run in parallel (only T003)
- **Phase 2**: T007 and T008 (tests) can run in parallel after T005 and T006 complete
- **Phase 3 (US1)**: Tests T012-T016 can all run in parallel after T010 completes
- **Phase 4 (US2)**: Tests T019-T023 can all run in parallel after T017 completes
- **Phase 5 (US3)**: Tests T029-T032 can all run in parallel after T027 completes
- **Phase 6 (US4)**: Tests T037-T041 can all run in parallel after T036 completes
- **Phase 7**: Tests T046-T048 can run in parallel, T044-T045 can run in parallel
- **Between Stories**: US1 (Phase 3) and US2 (Phase 4) can be worked on in parallel after Foundational completes

---

## Parallel Example: User Story 1

```bash
# After T010 (isDevMode implementation) completes, launch all tests together:
Task: "Write unit test: env var set to true should return true"
Task: "Write unit test: module flag true should return true"
Task: "Write unit test: in-game setting true should return true"
Task: "Write unit test: all sources false should return false"
Task: "Write unit test: hierarchy precedence with conflicting values"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

Both US1 and US2 are marked as P1 (highest priority) and are the core functionality:

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - provides type system and utilities)
3. Complete Phase 3: User Story 1 (isDevMode)
4. Complete Phase 4: User Story 2 (isDebugMode)
5. **STOP and VALIDATE**: Test both core methods independently
6. This provides the complete MVP - pure functions for checking dev and debug mode

### Incremental Delivery

1. **Foundation Ready**: Complete Setup + Foundational
2. **MVP Release**: Add US1 + US2 → Test independently → Deploy (Core functionality!)
3. **Convenience Layer**: Add US3 → Test independently → Deploy (Config integration)
4. **Production Ready**: Add US4 → Test independently → Deploy (Edge case handling)
5. **Polish**: Add Phase 7 → Final validation → Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (isDevMode)
   - Developer B: User Story 2 (isDebugMode)
3. After US1 and US2 complete:
   - Developer A or B: User Story 3 (fromConfig)
4. After US3 completes:
   - Any developer: User Story 4 (edge cases)
5. Final: Team completes Polish together

---

## Notes

- [P] tasks = different files or independent test cases, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All methods must be pure functions with no internal state
- Type safety is critical - TypeScript strict mode required
- 100% test coverage target for production readiness
- Performance requirement: <1ms per function call
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution compliance must be verified at Phase 7

---

## Success Criteria Verification

After completing all phases, verify these measurable outcomes:

- ✅ **SC-001**: All static functions accept configuration parameters and evaluate hierarchy correctly with zero state dependencies
- ✅ **SC-002**: Identical parameters passed to static functions produce identical results every time (verified by tests T031)
- ✅ **SC-003**: Multiple callers can pass different parameter values and each receives correct results (verified by tests T032)
- ✅ **SC-004**: Functions continue to work correctly even when parameters are missing or invalid (verified by Phase 6 tests)
- ✅ **SC-005**: 100% of mode status evaluations return correct boolean values based on hierarchy (verified by full test coverage)
- ✅ **SC-006**: Static functions complete execution in under 1ms (verified by tests T046-T048)
