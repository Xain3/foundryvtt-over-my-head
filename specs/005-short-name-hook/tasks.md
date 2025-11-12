# Tasks: Hook Formatter Utility

**Feature**: Hook Formatter Utility
**Branch**: `005-short-name-hook`
**Specification**: [spec.md](./spec.md)
**Planning**: [plan.md](./plan.md)
**Design**: [data-model.md](./data-model.md)

---

## Overview

Implementation roadmap for creating a two-layer utility system for string formatting and hook name generation. Tasks are organized by phase with clear dependencies and execution order.

**Total Tasks**: 41
**Total Testable Phases**: 5 (Setup + Foundational + P1 + P2 + P3 + Polish)
**Estimated Timeline**: 8-12 development hours across three priority levels
**Parallel Opportunities**: Identified within each user story phase (see Parallel Execution section)

---

## Quick Links

- **Phase 1**: [Setup & Prerequisites](#phase-1-setup--prerequisites) (2 tasks)
- **Phase 2**: [Foundational Infrastructure](#phase-2-foundational-infrastructure) (4 tasks)
- **Phase 3**: [User Story 1 - String Formatter (P1)](#phase-3-user-story-1---string-formatter-p1) (10 tasks)
- **Phase 4**: [User Story 2 - Module-Scoped Hook Names (P2)](#phase-4-user-story-2---module-scoped-hook-names-p2) (12 tasks)
- **Phase 5**: [User Story 3 - Parameterized Hooks (P3)](#phase-5-user-story-3---parameterized-hooks-p3) (10 tasks)
- **Phase 6**: [Polish & Cross-Cutting Concerns](#phase-6-polish--cross-cutting-concerns) (3 tasks)

---

## Implementation Strategy

### MVP Scope (Recommended Starting Point)

**Minimum Viable Product**: Complete Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1 P1 only)

This provides:

- ✅ Pure string formatter utility fully tested
- ✅ Project structure established with proper typing and documentation
- ✅ Zero-dependency building block ready for integration
- ✅ Foundation for subsequent hook formatting features

**MVP Task Count**: 16 tasks (setup + foundational + P1)
**MVP Timeline**: 2-3 hours
**MVP Testing**: 100% of P1 functionality (8 unit tests)

### Incremental Expansion

After MVP:

1. **Phase 4 (P2)**: Add module-scoped hook formatting (3-4 additional hours)
2. **Phase 5 (P3)**: Add parameterized hook patterns (3-4 additional hours)
3. **Phase 6**: Polish, documentation, and integration (1-2 hours)

---

## Dependency Graph

```
Phase 1: Setup
    ↓
Phase 2: Foundational
    ↓
    ├─→ Phase 3: User Story 1 (P1) ─┐
    │                                 ├─→ Phase 4: User Story 2 (P2)
    ├─→ Phase 4: User Story 2 (P2) ─┤
    │                                 └─→ Phase 6: Polish
    └─→ Phase 5: User Story 3 (P3)
            ↓
         Phase 6: Polish
```

**Critical Path**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 6

**Independent Tracks**:

- P2 can start after Phase 2 (uses existing config)
- P3 can start after Phase 2 (uses existing config)
- P1 is prerequisite for P2 (P2 depends on formatString)

---

## Phase 1: Setup & Prerequisites

**Goal**: Establish project structure and verify existing infrastructure.
**Dependencies**: None
**Duration**: 30 minutes
**Independent Test Criteria**:

- ✅ Project structure matches planned layout
- ✅ All import aliases resolve correctly
- ✅ Existing config and moduleNameResolver are accessible
- ✅ Test framework (Vitest) is properly configured

### Tasks

- [X] T001 Create `src/utils/static/stringFormatter-types.ts` file header with JSDoc and empty FormatOptions interface definition in `src/utils/static/stringFormatter-types.ts`
- [X] T002 Create `src/utils/hookFormatter-types.ts` file header with JSDoc and empty HookFormatterConfig interface definition in `src/utils/hookFormatter-types.ts`

---

## Phase 2: Foundational Infrastructure

**Goal**: Establish shared infrastructure, utilities, and test setup required by all user stories.
**Dependencies**: Phase 1
**Duration**: 45 minutes
**Independent Test Criteria**:

- ✅ Module exports are correctly wired
- ✅ Test harness initializes without errors
- ✅ Existing config and resolver are accessible in tests
- ✅ File structure validated (all src/ files created, test files ready)

### Tasks

- [X] T003 Create `src/utils/static/stringFormatter.ts` stub with file header and empty `formatString()` function in `src/utils/static/stringFormatter.ts`
- [X] T004 Create `src/utils/hookFormatter.ts` stub with file header and empty `formatHookName()` function overloads in `src/utils/hookFormatter.ts`
- [X] T005 [P] Update `src/utils/static/README.md` to document stringFormatter placement and purpose
- [X] T006 Update `src/utils/README.md` to document hookFormatter and update imports section with new utilities

---

## Phase 3: User Story 1 - String Formatter (P1)

**Goal**: Implement pure string formatter utility with zero dependencies.
**Story**: [User Story 1 - String Formatting with Prefix/Suffix](./spec.md#user-story-1---string-formatting-with-prefixsuffix-priority-p1)
**Dependencies**: Phase 2
**Duration**: 2-2.5 hours
**Independent Test Criteria**:

- ✅ `formatString("world", { prefix: "hello-" })` returns `"hello-world"`
- ✅ `formatString("world", { suffix: "!" })` returns `"world!"`
- ✅ `formatString("world", { prefix: "hello-", suffix: "-!" })` returns `"hello-world-!"`
- ✅ `formatString("world")` returns `"world"`
- ✅ `formatString("", { prefix: "p", suffix: "s" })` returns `"ps"`
- ✅ All tests pass independently with zero external dependencies

### Tasks

**Implementation (Core)**

- [ ] T007 [P] [US1] Define FormatOptions interface with `prefix?` and `suffix?` optional string properties in `src/utils/static/stringFormatter-types.ts`
- [ ] T008 [P] [US1] Implement `formatString()` function with parameter validation and prefix/suffix logic in `src/utils/static/stringFormatter.ts`
- [ ] T009 [P] [US1] Add comprehensive JSDoc to `formatString()` with examples of all four use cases in `src/utils/static/stringFormatter.ts`
- [ ] T010 [P] [US1] Export FormatOptions and formatString from `src/utils/static/stringFormatter-types.ts` and `src/utils/static/stringFormatter.ts`

**Testing (Core)**

- [ ] T011 [P] [US1] Create test file `tests/unit/stringFormatter.unit.test.mjs` with describe block and setup in `tests/unit/stringFormatter.unit.test.mjs`
- [ ] T012 [P] [US1] Implement test for prefix-only formatting: `formatString("world", { prefix: "hello-" })` in `tests/unit/stringFormatter.unit.test.mjs`
- [ ] T013 [P] [US1] Implement test for suffix-only formatting: `formatString("world", { suffix: "!" })` in `tests/unit/stringFormatter.unit.test.mjs`
- [ ] T014 [P] [US1] Implement test for both prefix and suffix: `formatString("world", { prefix: "hello-", suffix: "-!" })` in `tests/unit/stringFormatter.unit.test.mjs`
- [ ] T015 [P] [US1] Implement test for no options (identity operation): `formatString("world")` in `tests/unit/stringFormatter.unit.test.mjs`
- [ ] T016 [P] [US1] Implement test for empty string with options: `formatString("", { prefix: "p", suffix: "s" })` in `tests/unit/stringFormatter.unit.test.mjs`

**Documentation & Integration**

- [ ] T017 [US1] Update `src/utils/static/README.md` with stringFormatter documentation, usage examples, and test references
- [ ] T018 [US1] Add stringFormatter exports to `src/utils/static.ts` or create it if missing with proper re-exports in `src/utils/static.ts`
- [ ] T019 [US1] Verify all 6 P1 unit tests pass and coverage meets ≥80% requirement
- [ ] T020 [US1] Run full test suite to verify zero regressions in existing code (all 463+ tests should still pass)

---

## Phase 4: User Story 2 - Module-Scoped Hook Names (P2)

**Goal**: Implement hook name formatter leveraging config and existing moduleNameResolver.
**Story**: [User Story 2 - Module-Scoped Hook Name Generation](./spec.md#user-story-2---module-scoped-hook-name-generation-priority-p2)
**Dependencies**: Phase 2 (foundational), Phase 3 (P1 complete)
**Duration**: 3-3.5 hours
**Independent Test Criteria**:

- ✅ `formatHookName("settingsReady")` with config returns `"OMH.SettingsReady"`
- ✅ `formatHookName("contextReady")` with config returns `"OMH.ContextReady"`
- ✅ `formatHookName("unknownHook")` throws error with available keys listed
- ✅ Error messages include `[OMH]` prefix
- ✅ Integration with real config system works correctly

### Tasks

**Implementation (Types)**

- [ ] T021 [P] [US2] Define HookFormatterConfig interface with hooks, hookPatterns, hookPatternSeparator structure in `src/utils/hookFormatter-types.ts`
- [ ] T022 [P] [US2] Define PlaceholderValues internal type for placeholder replacement in `src/utils/hookFormatter-types.ts`
- [ ] T023 [P] [US2] Add validation assertion function `assertValidConfig()` to validate config structure in `src/utils/hookFormatter-types.ts`
- [ ] T024 [P] [US2] Export HookFormatterConfig and assertion function from `src/utils/hookFormatter-types.ts`

**Implementation (Simple Hook Formatter - P2)**

- [ ] T025 [P] [US2] Create helper function to extract placeholders from pattern template string in `src/utils/hookFormatter.ts`
- [ ] T026 [P] [US2] Create helper function to resolve placeholder values (moduleReference, separator, hook) in `src/utils/hookFormatter.ts`
- [ ] T027 [P] [US2] Implement simple `formatHookName(hookKey, config)` function for P2 use cases in `src/utils/hookFormatter.ts`
- [ ] T028 [US2] Add comprehensive JSDoc to simple formatHookName with examples in `src/utils/hookFormatter.ts`

**Testing (P2)**

- [ ] T029 [P] [US2] Create test file `tests/unit/hookFormatter.unit.test.mjs` with describe block and mock config setup in `tests/unit/hookFormatter.unit.test.mjs`
- [ ] T030 [P] [US2] Implement test for `formatHookName("settingsReady")` returning `"OMH.SettingsReady"` in `tests/unit/hookFormatter.unit.test.mjs`
- [ ] T031 [P] [US2] Implement test for `formatHookName("contextReady")` returning `"OMH.ContextReady"` in `tests/unit/hookFormatter.unit.test.mjs`
- [ ] T032 [US2] Implement test for error case when hook key is not found in `tests/unit/hookFormatter.unit.test.mjs`
- [ ] T033 [US2] Create integration test file `tests/integration/hookFormatter.int.test.mjs` with real config in `tests/integration/hookFormatter.int.test.mjs`
- [ ] T034 [US2] Implement integration test with actual `config.constants.hooks` values in `tests/integration/hookFormatter.int.test.mjs`

**Documentation & Verification**

- [ ] T035 [US2] Update `src/utils/README.md` with hookFormatter documentation and P2 usage examples
- [ ] T036 [US2] Add hookFormatter exports to `src/utils/hookFormatter.ts` and verify they're accessible via import aliases
- [ ] T037 [US2] Verify all 5 P2 unit tests pass and 1 integration test passes
- [ ] T038 [US2] Run full test suite and verify ≥90% cumulative coverage (P1 + P2)

---

## Phase 5: User Story 3 - Parameterized Hooks (P3)

**Goal**: Extend hook formatter to support dynamic parameters in pattern templates.
**Story**: [User Story 3 - Parameterized Hook Name Generation](./spec.md#user-story-3---parameterized-hook-name-generation-priority-p3)
**Dependencies**: Phase 4 (P2 complete)
**Duration**: 3-3.5 hours
**Independent Test Criteria**:

- ✅ `formatHookName("setting", { settingKey: "debugMode" })` returns `"OMH.setting.debugMode"`
- ✅ Missing required params throw descriptive error
- ✅ Extra unused params are ignored
- ✅ Unknown pattern key throws error with available patterns listed
- ✅ All tests achieve ≥90% coverage on P3 code paths

### Tasks

**Implementation (Parameterized Hook Formatter - P3)**

- [ ] T039 [P] [US3] Create helper function to extract parameter placeholders from pattern template in `src/utils/hookFormatter.ts`
- [ ] T040 [P] [US3] Create helper function to validate all required parameters are provided in `src/utils/hookFormatter.ts`
- [ ] T041 [P] [US3] Implement parameterized `formatHookName(patternKey, params, config)` function overload in `src/utils/hookFormatter.ts`
- [ ] T042 [US3] Add comprehensive JSDoc to parameterized formatHookName with 3+ usage examples in `src/utils/hookFormatter.ts`

**Testing (P3)**

- [ ] T043 [P] [US3] Implement test for `formatHookName("setting", { settingKey: "debugMode" })` in `tests/unit/hookFormatter.unit.test.mjs`
- [ ] T044 [P] [US3] Implement test for missing required parameter error case in `tests/unit/hookFormatter.unit.test.mjs`
- [ ] T045 [P] [US3] Implement test for extra unused parameters being ignored in `tests/unit/hookFormatter.unit.test.mjs`
- [ ] T046 [US3] Implement test for unknown pattern key error in `tests/unit/hookFormatter.unit.test.mjs`
- [ ] T047 [US3] Add integration test for P3 with real config patterns in `tests/integration/hookFormatter.int.test.mjs`
- [ ] T048 [US3] Verify all 5 P3 unit tests and 1 P3 integration test pass

**Documentation & Verification**

- [ ] T049 [US3] Update `src/utils/README.md` with P3 parameterized hook examples and best practices
- [ ] T050 [US3] Verify cumulative test coverage ≥90% across P1, P2, and P3 (all 463+ existing tests still passing)
- [ ] T051 [US3] Run full test suite and confirm zero regressions

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Finalize documentation, validate consistency, and prepare for production.
**Dependencies**: Phases 3-5 (all user stories complete)
**Duration**: 1-1.5 hours
**Independent Test Criteria**:

- ✅ All file headers present and properly formatted (`@file`, `@description`, `@path`)
- ✅ JSDoc complete on all functions and exported types
- ✅ All folder READMEs updated with new utilities
- ✅ All 41 tasks completed with zero regressions
- ✅ Performance target <1ms verified for all operations

### Tasks

- [ ] T052 Verify all stringFormatter and hookFormatter files have proper `@file`, `@description`, `@path` headers in `src/utils/static/stringFormatter-types.ts`, `src/utils/static/stringFormatter.ts`, `src/utils/hookFormatter-types.ts`, `src/utils/hookFormatter.ts`
- [ ] T053 Review and validate all JSDoc comments follow project style guide (param types, return values, examples) across all implementation files
- [ ] T054 Final validation: Run `npm test` (all tests), `npm run lint`, and `npm run build` to verify zero errors and warnings before committing

---

## Parallel Execution Opportunities

### Within Phase 3 (P1 - String Formatter)

**Can execute in parallel** (all use same file, so serialize):

- T007, T008, T009, T010 (Implementation) — serialize (same file, sequential)
- T011-T016 (Unit tests) — parallelize (independent test cases)

**Recommended order**: T007 → T008 → T009 → T010 → (T011-T016 in parallel)

**Time savings**: ~30 minutes (if parallelized)

### Within Phase 4 (P2 - Module-Scoped Hooks)

**Can execute in parallel**:

- T021-T024 (Types) — serialize (same file, sequential)
- T025-T028 (Implementation) — serialize (same file, sequential)
- T029-T034 (Unit + integration tests) — parallelize (T029-T032 in parallel, then T033-T034)

**Recommended order**: (T021-T024) → (T025-T028) → (T029-T032 in parallel) → (T033-T034) → (T035-T038)

**Time savings**: ~45 minutes (if parallelized)

### Within Phase 5 (P3 - Parameterized Hooks)

**Can execute in parallel**:

- T039-T042 (Implementation) — serialize (same file, sequential)
- T043-T048 (Tests) — parallelize (T043-T046 in parallel, then T047-T048)

**Recommended order**: (T039-T042) → (T043-T046 in parallel) → (T047-T048) → (T049-T051)

**Time savings**: ~40 minutes (if parallelized)

### Overall Recommendation

**Total parallel savings**: ~2 hours (from 8-12 hours down to 6-10 hours if fully parallelized)

**Key dependencies to respect**:

- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phases 3, 4, or 5
- P1 (Phase 3) should complete before P2 (Phase 4) for logical flow
- P2 should complete before P3 (Phase 5) for code clarity
- All phases should complete before Phase 6 (Polish)

---

## Testing Strategy

### Unit Testing (Vitest)

**Files**:

- `tests/unit/stringFormatter.unit.test.mjs` (6 tests, ~20 LOC)
- `tests/unit/hookFormatter.unit.test.mjs` (10 tests, ~40 LOC)

**Approach**:

- Pure unit tests with no external dependencies
- Mock config object for P2/P3 tests
- Each test case maps to a specific FR (functional requirement)

**Coverage Target**: ≥90% lines and branches

### Integration Testing (Vitest)

**Files**:

- `tests/integration/hookFormatter.int.test.mjs` (2 tests, ~15 LOC)

**Approach**:

- Use real `config` singleton from `src/config/config.ts`
- Verify hook patterns work with actual `hooks.yaml` constants
- Validate integration with `resolveModuleName()`

**Coverage Target**: ≥80% integration scenarios

### Performance Testing (Optional)

**Approach** (if implemented):

- Benchmark formatString() with various string lengths
- Benchmark formatHookName() with typical patterns
- Verify all operations complete in <1ms (SC-007)

---

## Success Criteria Validation

| Criterion                                       | Tasks Validating                | Status                            |
| ----------------------------------------------- | ------------------------------- | --------------------------------- |
| SC-001: All user stories independently testable | T012-T016, T030-T032, T043-T046 | Covered by unit/integration tests |
| SC-002: String formatter ≥80% coverage          | T019                            | Validation task T019              |
| SC-003: Hook names correct from hooks.yaml      | T034, T037                      | Integration test T034             |
| SC-004: Parameterized patterns work correctly   | T047, T050                      | Integration test T047             |
| SC-005: Descriptive `[OMH]` error messages      | T032, T046                      | Error test cases                  |
| SC-006: Integration with Hooks.on/call works    | T034                            | Integration test T034             |
| SC-007: <1ms performance                        | T054                            | Final validation T054             |
| SC-008: Documentation with examples             | T017, T035, T049                | Doc tasks with examples           |
| SC-009: Zero regressions                        | T020, T038, T051                | Full test suite validation        |
| SC-010: Style guide compliance                  | T052-T053                       | Header and JSDoc validation       |

---

## Task Checklist Summary

**Total**: 54 tasks across 6 phases

| Phase                        | Count  | Parallelizable             | Est. Hours    |
| ---------------------------- | ------ | -------------------------- | ------------- |
| Phase 1: Setup               | 2      | Yes (1 hr if parallel)     | 0.5           |
| Phase 2: Foundational        | 4      | Yes (2 tasks can parallel) | 0.75          |
| Phase 3: P1 String Formatter | 14     | Yes (6 tests can parallel) | 2.5           |
| Phase 4: P2 Hook Names       | 18     | Yes (4 tests can parallel) | 3.5           |
| Phase 5: P3 Parameterized    | 12     | Yes (4 tests can parallel) | 3.0           |
| Phase 6: Polish              | 3      | No (sequential validation) | 1.0           |
| **Total**                    | **54** | **75% parallelizable**     | **11.25 hrs** |

**Optimized Timeline** (with parallelization): **6-8 hours**

---

## Troubleshooting & Common Issues

### Test Failures

**Issue**: Unit tests fail with "config is undefined"
**Solution**: Ensure T005-T006 are complete and `src/utils/static/README.md` and `src/utils/README.md` are updated with correct imports.

**Issue**: Integration tests fail with "hooks.yaml not found"
**Solution**: Verify `src/config/constants/hooks.yaml` exists and `config.constants.hooks` is accessible. Re-check Phase 2 foundational infrastructure.

**Issue**: Import alias failures (e.g., `#/utils/` not resolving)
**Solution**: Verify `alias.config.mjs` is present at repo root and check that import path matches configured alias (should be `#/utils/` not `#utils/` or `#/utils`).

### Coverage Shortfalls

**Issue**: Test coverage below 80% after Phase 3
**Solution**: Add edge case tests for empty strings, null/undefined options, and boundary conditions. Check tests/unit/stringFormatter.unit.test.mjs line coverage.

**Issue**: Integration test coverage not meeting 80% threshold
**Solution**: Ensure hooks.yaml test fixtures are properly configured and at least one real hook pattern from the actual config is tested.

### Build or Lint Errors

**Issue**: `npm run lint` fails on file headers or JSDoc
**Solution**: Ensure all files have proper JSDoc comment blocks. Verify `@file`, `@description`, and `@path` are present. Re-check T052-T053 (Polish phase tasks).

**Issue**: TypeScript compilation fails with type errors
**Solution**: Verify all `-types.ts` files export their interfaces properly and implementations import from the correct type files (e.g., `import type { FormatOptions } from './stringFormatter-types.ts'`).

---

## Phase Completion Checklist

### Phase 1 Complete When

- [ ] T001, T002 completed and files created
- [ ] `src/utils/static/` directory exists with files in place
- [ ] `src/utils/hookFormatter-types.ts` file created

### Phase 2 Complete When

- [ ] T003, T004 completed (stub implementations)
- [ ] T005, T006 completed (README updates)
- [ ] All imports resolve correctly in test harness
- [ ] No TypeScript or ESLint errors on new files

### Phase 3 Complete When

- [ ] T007-T010 completed (implementation)
- [ ] T011-T016 completed (unit tests, all passing)
- [ ] T017-T020 completed (documentation, verification)
- [ ] `npm test` shows P1 tests passing with ≥80% coverage
- [ ] Full test suite shows zero regressions (463+ tests passing)

### Phase 4 Complete When

- [ ] T021-T028 completed (types + implementation)
- [ ] T029-T034 completed (unit + integration tests)
- [ ] T035-T038 completed (documentation, verification)
- [ ] Integration test passes with real config
- [ ] Error messages include `[OMH]` prefix and available keys

### Phase 5 Complete When

- [ ] T039-T042 completed (parameterized implementation)
- [ ] T043-T048 completed (all P3 tests passing)
- [ ] T049-T051 completed (documentation, final verification)
- [ ] Cumulative coverage ≥90% across all three priorities
- [ ] Full test suite passing with zero regressions

### Phase 6 Complete When

- [ ] T052-T054 completed (header validation, JSDoc review, build verification)
- [ ] `npm test`, `npm run lint`, `npm run build` all pass without errors
- [ ] All 54 tasks marked completed
- [ ] Ready for PR creation and code review

---

## Next Steps

1. **Start Phase 1**: Create stringFormatter-types.ts and hookFormatter-types.ts stubs (T001, T002)
2. **Progress to Phase 2**: Establish infrastructure and verify imports (T003-T006)
3. **Tackle Phase 3 (MVP)**: Implement pure string formatter with full test coverage (T007-T020)
4. **Expand with Phase 4**: Add module-scoped hook formatting (T021-T038)
5. **Complete Phase 5**: Implement parameterized patterns (T039-T051)
6. **Polish**: Final validation and documentation (T052-T054)

**Recommended MVP Completion**: After Phase 3 (16 tasks, 2-3 hours)
**Full Feature Completion**: After Phase 5 (51 tasks, 8-10 hours with parallelization)

---

**Document Version**: 1.0.0
**Created**: 2025-11-12
**Last Updated**: 2025-11-12
