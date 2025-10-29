# Implementation Tasks: Centralized Configuration System

**Feature**: `001-centralized-config-system`
**Specification**: [spec.md](./spec.md) | [Data Model](./data-model.md) | [API Spec](./config-api.md)
**Branch**: `001-centralized-config-system`
**Date**: October 20, 2025
**Total Effort**: 32 story points (updated with delegated helpers)

---

## Overview

This task list provides all actionable implementation tasks for the Centralized Configuration System feature. Tasks are organized in 6 implementation phases and presented in strict checklist format per speckit workflow.

**Task Format**: `- [ ] [TaskID] [P?] Description with file path`

**Execution Strategy**:

- **Phase 1**: Helper Functions Phase 1 (Tasks T001-T004) - YAML loading, merging, prefix extraction
- **Phase 2**: Helper Functions Phase 2 (Tasks T006-T008) - Settings, manifest, environment variables
- **Config Class**: (Tasks T005, T009) - Config skeleton and constructor calling helpers
- **Phase 3**: Immutability (Tasks T010-T012) - Singleton and freezing
- **Phase 4**: Error Handling (Tasks T013-T014) - Comprehensive error handling and logging
- **Phase 5**: Testing (Tasks T015-T018) - Test fixtures, unit/integration/performance tests
- **Phase 6**: Documentation (Tasks T019-T022) - JSDoc, READMEs, integration

---

## PHASE 1: FOUNDATIONAL (Helper Functions Phase 1)

### User Story 1: Initialize Module Configuration (US1 - P1)

- [x] T001 Create helper functions in `src/config/helpers/configHelpers.ts`: `loadYamlFiles()`, `mergeConstants()`, `extractConfigPrefix()` with fail-fast error handling
- [x] T002 [P] Implement `loadYamlFiles()` helper to discover and parse all 6 YAML files from `src/config/constants/` (errors.yaml, foundry.yaml, hooks.yaml, moduleManagement.yaml, occlusion.yaml, placeables.yaml); each file maintains separate namespace key (no cross-file merging); fail-fast on any parse error with context (MEDIUM FIX #4a)
- [x] T003 [P] Implement `mergeConstants()` helper to namespace-key merge YAML files into config structure; empty YAML files → empty objects {}; each YAML file has separate namespace key to prevent cross-file collisions (MEDIUM FIX #3a + #4a)
- [x] T004 Implement `extractConfigPrefix()` helper to extract shortName from moduleManagement config with fallback to `[OMH]` and clear warning if fallback used
- [x] T005 Create Config class skeleton in `src/config/config.ts` with private `#yamlConstants`, `#settings`, `#module`, `#env` fields and public properties; import helpers from `configHelpers.ts`

### Dependency Management

- T002, T003, T004 can run in parallel (all helpers independent)
- T005 requires T001-T004 (all helpers must exist before config class uses them)

---

## PHASE 2: DATA INTEGRATION (Helper Functions Phase 2)

### User Story 1: Initialize Module Configuration (US1 - P1)

- [x] T006 [P] Implement `loadSettings()` helper in `src/config/helpers/configHelpers.ts` to load and parse `src/config/settings/settings.yaml` with fail-fast error handling
- [x] T007 [P] Implement `loadModuleManifest()` helper in `src/config/helpers/configHelpers.ts` to load and parse `module.json` with error handling
- [x] T008 [P] Implement `loadEnvironmentVariables()` helper in `src/config/helpers/configHelpers.ts` with: (1) case-insensitive prefix matching, (2) prefix stripping from keys, (3) return all values as strings, (4) document that caller is responsible for type coercion (HIGH FIX #2)
- [x] T009 Create Config constructor in `src/config/config.ts` that calls imported helpers; add initialization logging with extracted prefix

### Dependency Management

- T006, T007, T008 can run in parallel (all helpers independent)
- T009 requires T005 (config skeleton exists), T006, T007, T008 (all helpers available)

---

## PHASE 3: IMMUTABILITY & SINGLETON

### User Story 3: Prevent Multiple Config Instances (US3 - P1)

- [x] T010 Implement singleton pattern with static `Config.getInstance()` method that creates and caches single instance on first call in `src/config/config.ts`
- [x] T011 Implement deep freeze via recursive `Object.freeze()` on config object and ALL nested objects after initialization to prevent runtime modifications at any depth (CRITICAL FIX #3)
- [x] T012 Export instantiated singleton: `export const config = Config.getInstance();` from `src/config/config.ts`

### Dependency Management

- T010 requires T009 (config constructor with helpers)
- T011 requires T010 (after freezing implemented)
- T012 requires T010 and T011 (frozen singleton must exist)

---

## PHASE 4: ERROR HANDLING & LOGGING

### Cross-Cutting Concerns

- [x] T013 Implement comprehensive error handling in all helpers: throw detailed errors with file path, line number, and YAML context snippet in format `[PREFIX] Failed to load {type} from {path}: Line {line}, Column {col}: {yaml-snippet}. ${error.message}` (where PREFIX is extracted via extractConfigPrefix) (HIGH FIX #1)
- [x] T014 Add debug logging throughout helpers and constructor: `console.debug('[PREFIX] ...')` for internal state and `console.info('[PREFIX] ...')` for major milestones (uses extracted prefix)

### Dependency Management

- T013 integrates with T001-T008 (all helper implementations)
- T014 integrates with T009 (constructor implementation)

---

## PHASE 5: TESTING & VALIDATION

### Quality Assurance

- [x] T015 [P] Create test fixtures in `tests/unit/fixtures/` with valid/invalid YAML files, module.json, malformed test data, and environment variable mocks
- [x] T016 [P] Create unit test suite `tests/unit/config.unit.test.mjs` and `tests/unit/configHelpers.unit.test.mjs` covering: helpers (YAML loading/merge, settings/manifest, env vars), singleton behavior, immutability, error handling (≥85% coverage)
- [x] T017 Create integration test suite `tests/integration/config.int.test.mjs` with real files (not mocked) verifying actual YAML structure and correctness; include explicit edge case tests: (1) malformed YAML syntax, (2) missing manifest field, (3) empty YAML files, (4) env var prefix not found, (5) settings.yaml validation failures (MEDIUM FIX #2)
- [x] T018 Create performance test `tests/performance/config.performance.test.mjs` verifying first initialization <100ms and cached calls <1ms

### Dependency Management

- T015 is independent (test infrastructure)
- T016 requires T015
- T017 requires implementation complete (T001-T014)
- T018 requires T016 passing

---

## PHASE 6: DOCUMENTATION & INTEGRATION

### User Story 2: Provide Type-Safe Config Access (US2 - P1)

- [x] T019 Add comprehensive JSDoc comments to ALL functions, methods (public AND private), private properties, and exported symbols per Constitution Principle IV. Include @param, @returns, @throws, @example tags and file headers with @file, @description, @path for `src/config/helpers/configHelpers.ts` and `src/config/config.ts` (CRITICAL FIX #3)
- [x] T020 Create `src/config/README.md` documenting purpose, helper functions, namespace-keyed merge strategy, singleton pattern, immutability, and usage examples
- [x] T021 [P] Update `src/config/helpers/README.md` documenting helper functions and responsibilities; update `src/config/constants/README.md` listing YAML files; update `src/config/settings/README.md` documenting settings.yaml
- [x] T022 Update `src/main.mjs` to import config singleton (`import { config } from './config/config.ts';`) ensuring initialization on module load
- [x] T023 Create quickstart guide in `docs/config-quickstart.md` documenting: (1) basic config access patterns, (2) loading configuration on module load, (3) accessing values from each namespace (constants, settings, manifest, environment), (4) error handling patterns, (5) example use cases; include code samples and common pitfalls

### Dependency Management

- T019 requires implementation complete (aesthetic, can run anytime after T012)
- T020 requires implementation complete
- T021 is mostly independent (documentation updates)
- T022 requires T012 (singleton export available)
- T023 requires T012 and T019-T022 (depends on all other documentation being complete)

---

## Task Execution Dependency Graph

```
Helpers (Parallel Phase 1):
  T001 → T002 (parallel with T003, T004)
       → T003 (parallel with T002, T004)
       → T004 (parallel with T002, T003)
         ↓
Helpers (Parallel Phase 2):
  T006 (parallel with T007, T008)
  T007 (parallel with T006, T008)
  T008 (parallel with T006, T007)
         ↓
Config Class (Sequential):
  T005 (requires all helpers from T001-T004)
  T009 (requires T005 + all Phase 2 helpers T006-T008)
         ↓
Immutability (Sequential):
  T010 (requires T009)
  T011 (requires T010)
  T012 (requires T010, T011)
         ↓
Error Handling (Integrated):
  T013 (throughout T001-T008)
  T014 (throughout T009, T012)
         ↓
Testing (Parallel after impl):
  T015 (test fixtures - independent)
  T016 (depends on T015 + implementation)
  T017 (depends on all impl + T016)
  T018 (depends on T016 passing)
         ↓
Documentation (Parallel):
  T019 (depends on impl done)
  T020 (parallel with T021)
  T021 (parallel with T020)
  T022 (depends on T012)
  T023 (depends on T012 + T019-T022)
```

---

## Critical Path

**Minimum viable config** (sequential, no parallelization):

1. T001 → T002 → T003 → T004 (Helpers Phase 1) = **6 points**
2. T005 → T006 → T007 → T008 (Helpers Phase 2) = **4 points**
3. T009 → T010 → T011 → T012 (Config Class + Immutability) = **3 points**
4. T013 → T014 (Error Handling) = **2 points**
5. T015 → T016 → T017 → T018 (Testing) = **11 points**
6. T019-T023 (Documentation/Integration) = **7 points**

**Total: 33 points (~33 developer-days sequential)**

**With Parallelization** (realistic 2-3 developer scenario):

- Developer A: T001-T004, T009-T012, T022 (helpers phase 1 + config class + singleton)
- Developer B: T005-T008, T013-T014 (helpers phase 2 + error handling)
- Developer C: T015-T018, T019-T023 (testing + documentation)
- **Timeline**: ~11-15 calendar days (with blocked dependencies resolved per dev availability)

---

## Effort Breakdown

| Phase           | Task IDs     | Points | Complexity | Notes                                                     |
| --------------- | ------------ | ------ | ---------- | --------------------------------------------------------- |
| Helpers Phase 1 | T001-T004    | 6      | High       | Core loading functions; highest parallelization potential |
| Helpers Phase 2 | T005-T008    | 4      | Medium     | Environment variable parsing; type coercion subtasks      |
| Config Class    | T009, T012   | 3      | Medium     | Orchestration layer; depends on helpers completion        |
| Immutability    | T010-T011    | 2      | Low        | Deep freeze implementation; recursive freezing            |
| Error Handling  | T013-T014    | 2      | Low        | Error formatting; consistent error messages               |
| Testing         | T015-T018    | 11     | High       | Unit, integration, performance; T016 depends on T015      |
| Documentation   | T019-T023    | 5      | Low        | JSDoc, README, quickstart guide, changelog, integration   |
| **TOTAL**       | **23 tasks** | **33** | —          | With recommended parallelization: 11-15 calendar days     |

---

## Success Criteria (Definition of Done)

✅ **Implementation**:

- [ ] All 23 tasks completed and marked done
- [ ] Code passes ESLint with zero errors in all helper functions and config class
- [ ] TypeScript compiles with strict mode (zero errors)

✅ **Quality**:

- [ ] Unit test coverage ≥85% (T016 verification covering helpers + config)
- [ ] Config loads in <100ms (T018 verification)
- [ ] Singleton identity verified (T016: `config === config`)

✅ **Reliability**:

- [ ] All error cases throw detailed errors with context including line/column numbers (T013)
- [ ] Deep freeze via recursive Object.freeze() prevents modifications at any depth (T011)
- [ ] Fail-fast on any parsing error (initialization fails if files invalid)
- [ ] All helpers are pure functions with respect to global state: no mutations of module-level variables, config state, or global objects (file I/O permitted; logging permitted) (HIGH FIX #3)

✅ **Documentation**:

- [ ] Full JSDoc on all helpers and Config class (T019)
- [ ] File headers with @file, @description, @path (T019)
- [ ] Helper function READMEs explaining each responsibility (T021)
- [ ] Config module README with examples (T020)
- [ ] Quickstart guide with access patterns and examples (T023)

✅ **Integration**:

- [ ] Config initialized on module load (T022)
- [ ] No regressions in existing module functionality
- [ ] All spec requirements met (FR-001 through FR-012)

---

## Implementation Notes

### Key Decisions

1. **Separated Concerns**: Helper functions in `src/config/helpers/configHelpers.ts`, Config class in `src/config/config.ts`
2. **Helper Functions**: Pure functions (except for I/O) that load, parse, and merge data; called by Config constructor
3. **Immutable**: Object.freeze() after initialization (no runtime config updates)
4. **Fail-Fast**: Errors throw immediately with context (no graceful degradation)
5. **Namespaced**: Each YAML file → top-level key under constants (prevents collisions)
6. **Prefix-Based**: Environment variables matched using `OMH_` prefix from moduleManagement.yaml
7. **Testability**: Helpers exported individually for unit testing in isolation; Config class tested with imported mocks

### Error Handling Pattern

All file loading operations (in helpers) follow this pattern:

```typescript
// In helper function
export function loadYamlFiles(): Record<string, unknown> {
  try {
    // Load and parse files
    return data;
  } catch (error) {
    throw new Error(`[OMH] Failed to load YAML from {path}: ${error.message}`);
  }
}

// In Config constructor
try {
  this.#yamlConstants = loadYamlFiles();
} catch (error) {
  console.error(error);
  throw error; // Re-throw for fail-fast
}
```

### Logging Pattern

Key operations log with `[OMH]` prefix:

```typescript
// In helpers - debug level for internal state
console.debug('[OMH] Loading YAML constants from 6 files...');
console.debug('[OMH] Parsed settings.yaml with {count} entries');

// In Config constructor - info level for milestones
console.info('[OMH] Config initialized with {count} settings');
console.info('[OMH] Loaded module manifest: {name} v{version}');
```

---

## Testing Strategy

**Helper Unit Tests (T016)**: Test each helper function in isolation with mocked file system

- `loadYamlFiles()`: Verify parsing and namespace merging
- `mergeConstants()`: Verify shallow merge without collisions
- `extractModulePrefix()`: Verify prefix extraction and conversion
- `loadSettings()`, `loadModuleManifest()`: Verify file loading and validation
- `loadEnvironmentVariables()`: Verify env var filtering by prefix

**Config Unit Tests (T016)**: Test Config class with mocked helpers

- Singleton behavior: `Config.getInstance() === Config.getInstance()`
- Immutability: `Object.freeze()` prevents modifications
- Error propagation: Failed helper calls throw and stop initialization

**Integration Tests (T017)**: Test with actual project files (no mocks)

- Real YAML files load correctly
- Actual module.json parses and validates
- Environment variable overrides work as expected

**Performance Tests (T018)**: Measure and verify <100ms initialization

---

## Checklist Format Explanation

Each task follows strict format: `- [ ] [TaskID] [P?] Description`

- **Checkbox**: `- [ ]` (markdown checkbox, checked when complete)
- **Task ID**: T001, T002, ..., T022 (sequential)
- **[P] marker**: Optional, indicates task can run in parallel
- **Description**: Clear action with exact file path

---

## Next Steps

1. **Review**: Confirm all 22 tasks align with team capacity and timeline
2. **Assign**: Distribute tasks among developers (recommend 2-3 people for 12-16 day delivery)
3. **Execute**: Start with T001-T004 helpers in parallel; follow critical path dependency order
4. **Track**: Update checkboxes as tasks complete
5. **Verify**: Run acceptance criteria tests for each task before marking done

---

**Ready for Implementation** ✅

Use `- [ ]` to mark tasks not started.
Update to `- [x]` as tasks complete.
Estimated timeline: 32 developer-days (sequential) or 12-16 calendar days (parallelized with 2-3 developers).
