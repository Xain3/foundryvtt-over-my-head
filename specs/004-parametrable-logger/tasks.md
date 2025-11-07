---
description: 'Task list for parametrable logger implementation'
---

# Tasks: Parametrable Logger

**Input**: Design documents from `/specs/004-parametrable-logger/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/logger-api.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install chalk dependency (v5.x) via npm/yarn for ANSI color support
- [x] T002 Create src/utils/logger.ts with file header per style guide
- [x] T003 Create src/utils/static/moduleNameResolver.ts with file header per style guide
- [x] T004 [P] Create tests/unit/logger.unit.test.mjs with file header
- [x] T005 [P] Create tests/unit/moduleNameResolver.unit.test.mjs with file header
- [x] T006 [P] Create tests/integration/logger.int.test.mjs with file header

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Define LogLevel enum in src/utils/logger.ts (error=0, warn=1, info=2, verbose=3, debug=4)
- [x] T008 Define LogConfigurationObject interface in src/utils/logger.ts per data-model.md
- [x] T009 Define TimestampConfig interface in src/utils/logger.ts per data-model.md
- [x] T010 Define FormatTemplates interface in src/utils/logger.ts per data-model.md
- [x] T011 Define LogContext interface in src/utils/logger.ts per data-model.md
- [x] T012 Implement resolveModuleName() utility in src/utils/static/moduleNameResolver.ts per contracts/logger-api.md
- [x] T013 [P] Write unit tests for resolveModuleName() in tests/unit/moduleNameResolver.unit.test.mjs (edge cases: undefined, string, object with/without name)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Logging (Priority: P1) 🎯 MVP

**Goal**: Developer can create logger instance, call log methods, and see formatted console output

**Independent Test**: Create logger with default config, call logger.info("test"), verify console output with timestamp/level/message

### Tests for User Story 1 (Write these tests FIRST, ensure they FAIL before implementation) ⚠️

- [x] T014 [P] [US1] Unit test: Logger constructor accepts config object in tests/unit/logger.unit.test.mjs
- [x] T015 [P] [US1] Unit test: Logger.error() outputs formatted message in tests/unit/logger.unit.test.mjs
- [x] T016 [P] [US1] Unit test: Logger.warn() outputs formatted message in tests/unit/logger.unit.test.mjs
- [x] T017 [P] [US1] Unit test: Logger.info() outputs formatted message in tests/unit/logger.unit.test.mjs
- [x] T018 [P] [US1] Unit test: Logger.verbose() outputs formatted message in tests/unit/logger.unit.test.mjs
- [x] T019 [P] [US1] Unit test: Logger.debug() outputs formatted message in tests/unit/logger.unit.test.mjs
- [x] T020 [P] [US1] Unit test: Timestamp formatting (ISO 8601) in tests/unit/logger.unit.test.mjs
- [x] T021 [P] [US1] Unit test: Placeholder substitution ({timestamp}, {level}, {message}, {moduleName}) in tests/unit/logger.unit.test.mjs
- [x] T022 [P] [US1] Unit test: Custom context placeholders ({custom.key}) in tests/unit/logger.unit.test.mjs
- [x] T022b [P] [US1] Unit test: Colorization enabled/disabled per log level using chalk in tests/unit/logger.unit.test.mjs
- [x] T022c [P] [US1] Unit test: Handle circular references in logged objects without crashing in tests/unit/logger.unit.test.mjs
- [x] T023 [P] [US1] Integration test: End-to-end logging with real console output in tests/integration/logger.int.test.mjs

### Implementation for User Story 1

- [x] T024 [US1] Implement Logger class constructor in src/utils/logger.ts (accepts config: LogConfigurationObject)
- [x] T025 [US1] Implement private \_formatTimestamp() method in src/utils/logger.ts per TimestampConfig
- [x] T026 [US1] Implement private \_applyPlaceholders() method in src/utils/logger.ts using regex substitution per research.md
- [x] T027 [US1] Implement private \_formatMessage() method in src/utils/logger.ts (orchestrates timestamp, template, placeholders)
- [x] T028 [US1] Implement private \_shouldLog() method in src/utils/logger.ts (checks currentLevel vs LogLevel)
- [x] T029 [US1] Implement Logger.error() method in src/utils/logger.ts per contracts/logger-api.md
- [x] T030 [US1] Implement Logger.warn() method in src/utils/logger.ts per contracts/logger-api.md
- [x] T031 [US1] Implement Logger.info() method in src/utils/logger.ts per contracts/logger-api.md
- [x] T032 [US1] Implement Logger.verbose() method in src/utils/logger.ts per contracts/logger-api.md
- [x] T033 [US1] Implement Logger.debug() method in src/utils/logger.ts per contracts/logger-api.md
- [x] T034 [US1] Add JSDoc comments to Logger class and all public methods per style guide
- [x] T035 [US1] Add inline comments for complex regex logic in \_applyPlaceholders()

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Debug Mode Control (Priority: P2)

**Goal**: Developer can enable/disable debug logs dynamically via config.debugMode boolean

**Independent Test**: Create logger with debugMode=false, call logger.debug("test"), verify no output; set debugMode=true, call logger.debug("test2"), verify output appears

### Tests for User Story 2 (Write these tests FIRST, ensure they FAIL before implementation) ⚠️

- [x] T036 [P] [US2] Unit test: debugMode=false suppresses debug/verbose logs in tests/unit/logger.unit.test.mjs
- [x] T037 [P] [US2] Unit test: debugMode=true allows debug/verbose logs in tests/unit/logger.unit.test.mjs
- [x] T038 [P] [US2] Unit test: debugMode=false does NOT suppress error/warn/info logs in tests/unit/logger.unit.test.mjs
- [x] T039 [P] [US2] Integration test: Toggle debugMode at runtime, verify behavior in tests/integration/logger.int.test.mjs

### Implementation for User Story 2

- [x] T040 [US2] Update \_shouldLog() method in src/utils/logger.ts to check config.debugMode for debug/verbose levels
- [x] T041 [US2] Add JSDoc comments explaining debugMode behavior to Logger constructor and \_shouldLog()
- [x] T042 [US2] Update quickstart.md with debugMode usage examples and troubleshooting tips

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Configuration Overrides (Priority: P3)

**Goal**: Developer can override specific format templates or timestamp settings per log call

**Independent Test**: Create logger with default format, call logger.info("test", { overrides: { format: { info: "CUSTOM: {message}" } } }), verify custom format used

### Tests for User Story 3 (Write these tests FIRST, ensure they FAIL before implementation) ⚠️

- [x] T043 [P] [US3] Unit test: Override format.error template in tests/unit/logger.unit.test.mjs
- [x] T044 [P] [US3] Unit test: Override format.warn template in tests/unit/logger.unit.test.mjs
- [x] T045 [P] [US3] Unit test: Override format.info template in tests/unit/logger.unit.test.mjs
- [x] T046 [P] [US3] Unit test: Override format.verbose template in tests/unit/logger.unit.test.mjs
- [x] T047 [P] [US3] Unit test: Override format.debug template in tests/unit/logger.unit.test.mjs
- [x] T048 [P] [US3] Unit test: Override timestamp.enabled in tests/unit/logger.unit.test.mjs
- [x] T049 [P] [US3] Unit test: Override timestamp.format in tests/unit/logger.unit.test.mjs
- [x] T050 [P] [US3] Unit test: Override multiple settings simultaneously in tests/unit/logger.unit.test.mjs
- [x] T051 [P] [US3] Unit test: Verify overrides do not mutate original config (immutability) in tests/unit/logger.unit.test.mjs
- [x] T052 [P] [US3] Integration test: Shallow merge behavior per research.md in tests/integration/logger.int.test.mjs

### Implementation for User Story 3

- [x] T053 [US3] Implement private \_mergeConfig() method in src/utils/logger.ts using shallow merge per research.md
- [x] T054 [US3] Update Logger.error() to accept optional overrides parameter per contracts/logger-api.md
- [x] T055 [US3] Update Logger.warn() to accept optional overrides parameter per contracts/logger-api.md
- [x] T056 [US3] Update Logger.info() to accept optional overrides parameter per contracts/logger-api.md
- [x] T057 [US3] Update Logger.verbose() to accept optional overrides parameter per contracts/logger-api.md
- [x] T058 [US3] Update Logger.debug() to accept optional overrides parameter per contracts/logger-api.md
- [x] T059 [US3] Update JSDoc comments to document overrides parameter and shallow merge behavior
- [x] T060 [US3] Add inline comments explaining shallow merge vs deep merge tradeoffs

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T061 [P] Update docs/STYLE_GUIDE.md with logger usage patterns (if applicable)
- [x] T062 Code cleanup: Remove console.log debug statements from src/utils/logger.ts
- [x] T063 Code cleanup: Ensure all error messages include [OMH] prefix per style guide
- [x] T064 Performance validation: Verify <1ms per log call per plan.md performance constraints
- [x] T065 Memory validation: Verify <1MB memory footprint per plan.md performance constraints
- [x] T066 [P] Coverage validation: Run npm test -- --coverage and verify ≥80% coverage
- [x] T067 [P] Lint validation: Run npm run lint and fix all warnings
- [x] T068 [P] Type validation: Run tsc --noEmit and fix all TypeScript errors
- [x] T069 Run quickstart.md validation: Follow quickstart steps manually, verify all examples work
- [x] T070 Security: Verify no user input directly interpolated into console.log (prevent injection)
- [x] T071 Documentation: Verify all files have required @file, @description, @path headers per style guide

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1-P1 → US2-P2 → US3-P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Basic Logging**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2) - Debug Mode**: Can start after Foundational (Phase 2) - No dependencies on other stories (but logically builds on US1)
- **User Story 3 (P3) - Overrides**: Depends on US1 implementation (\_formatMessage needs to exist to be augmented with merge logic)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (T014-T023 before T024-T035, etc.)
- Foundational types/interfaces before Logger implementation (T007-T013 before T024+)
- Private utility methods before public API methods (\_formatTimestamp, \_applyPlaceholders, \_formatMessage before error/warn/info/verbose/debug)
- Core implementation before documentation updates
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: T004, T005, T006 (test file creation) can run in parallel
- **Phase 2 Foundational**: T007-T012 (type definitions) can run in parallel with T013 (resolver tests)
- **US1 Tests**: T014-T023 can all run in parallel (different test cases)
- **US1 Implementation**: T029-T033 (log method implementations) can run in parallel after T024-T028 complete
- **US2 Tests**: T036-T039 can all run in parallel
- **US3 Tests**: T043-T052 can all run in parallel
- **US3 Implementation**: T054-T058 (updating log methods with overrides) can run in parallel after T053 complete
- **Polish**: T061, T066, T067, T068, T071 can all run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T013, CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (T014-T035)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Complete Phase 4: User Story 2 (T036-T042)
6. **STOP and VALIDATE**: Test User Stories 1+2 together
7. Deploy/demo basic logging with debug mode control

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP: Basic logging works!**
3. Add User Story 2 → Test independently → **v1.1: Debug mode control!**
4. Add User Story 3 → Test independently → **v1.2: Configuration overrides!**
5. Complete Polish → **v1.3: Production-ready!**

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T013)
2. Once Foundational is done:
   - Developer A: User Story 1 (T014-T035) - Basic logging
   - Developer B: User Story 2 (T036-T042) - Debug mode (can start early but integrates with US1)
3. After US1 complete:
   - Developer A: User Story 3 (T043-T060) - Overrides (depends on US1)
   - Developer B: Polish tasks (T061-T071)
4. Team converges on remaining Polish tasks

---

## Critical Path Analysis

**Longest dependency chain** (determines minimum completion time):

```
T001-T006 (Setup)
  ↓
T007-T013 (Foundational types/interfaces)
  ↓
T014-T023 (US1 tests written, must FAIL)
  ↓
T024-T028 (US1 private methods)
  ↓
T029-T035 (US1 public methods + docs)
  ↓
T043-T052 (US3 tests written, must FAIL)
  ↓
T053 (US3 merge logic)
  ↓
T054-T060 (US3 override parameters + docs)
  ↓
T061-T071 (Polish)
```

**Estimated duration** (if single developer):

- Setup: 1-2 hours
- Foundational: 2-3 hours
- US1: 6-8 hours (tests + implementation)
- US2: 2-3 hours (straightforward flag check)
- US3: 4-5 hours (merge logic + parameter updates)
- Polish: 2-3 hours (validation + cleanup)

**Total**: ~18-24 hours for complete implementation

---

## Notes

- [P] tasks = different files, no dependencies - can run simultaneously
- [Story] label maps task to specific user story for traceability (US1, US2, US3)
- Each user story should be independently completable and testable (except US3 which depends on US1)
- Verify tests FAIL before implementing (TDD approach)
- Commit after each task or logical group (e.g., all US1 tests, then all US1 implementation)
- Stop at any checkpoint to validate story independently before continuing
- Avoid: vague tasks, same file conflicts (use [P] only for truly independent files)
- File headers REQUIRED: Every new file must start with @file, @description, @path per style guide
- JSDoc comments REQUIRED: All public methods, classes, functions per style guide
- Import aliasing REQUIRED: Use #/utils/logger.ts etc. per constitution principle I
