# Implementation Plan: Development Mode Parser

**Branch**: `002-dev-mode-parser` | **Date**: October 29, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-dev-mode-parser/spec.md`

## Summary

Create a pure utility module (`DevModeParser`) that evaluates development and debug mode status by implementing a settings hierarchy (environment variables > module manifest > in-game settings). The utility provides static methods for checking mode status based on explicit parameters (pure functions), with a convenience wrapper for extracting values from the config singleton. Implementation in TypeScript with comprehensive unit tests.

## Technical Context

**Language/Version**: TypeScript (matching existing config.ts, ES2020+ target)
**Primary Dependencies**:

- `config` singleton (from `src/config/config.ts`) - optional, for convenience methods
- `lodash` (already available, for utility functions if needed)

**Storage**: N/A (pure utility, no persistence)
**Testing**: vitest (existing test framework in workspace)
**Target Platform**: FoundryVTT module (Node.js for dev, browser at runtime)
**Project Type**: Utility module within monorepo
**Performance Goals**: <1ms per function call (SC-006)
**Constraints**:

- Pure static functions with no internal state
- All required values must be passable as explicit parameters
- Graceful handling of missing/undefined parameters
- Type-safe with full TypeScript support

**Scale/Scope**:

- 1 class with 3 static methods (isDevMode, isDebugMode, fromConfig)
- Approximately 150-200 lines of implementation
- ~200-300 lines of unit tests (comprehensive coverage)
- **File Location**: `src/utils/static/devModeParser.ts` (as specified in FR-017)

## Constitution Check

_GATE: Must pass before implementation. Re-check after code complete._

| Principle                     | Status  | Justification                                                                                                                    |
| ----------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| I. Modular Architecture       | ✅ PASS | Single responsibility (mode checking), pure functions with no hidden dependencies, clear API contract                            |
| II. FoundryVTT Integration    | ✅ PASS | Pure utility with no hooks needed; only used internally by other modules. No FoundryVTT system patching                          |
| III. Configuration Management | ✅ PASS | Integrates with existing config singleton via optional convenience method; follows established patterns                          |
| IV. Documentation Excellence  | ✅ PASS | Full JSDoc coverage required for all methods and types; file-level header; comprehensive unit tests serve as usage documentation |
| V. Quality & Maintainability  | ✅ PASS | Pure functions enable comprehensive unit testing; 100% code path coverage targeted; no state to maintain                         |

**Gate Status**: ✅ **PASS** - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-dev-mode-parser/
├── spec.md              # Feature specification (frozen)
├── plan.md              # This file
├── research.md          # Phase 0: Research (minimal - all decisions finalized)
├── data-model.md        # Phase 1: Data model and API contracts
├── quickstart.md        # Phase 1: Developer guide and usage examples
├── checklists/
│   └── requirements.md  # Quality validation checklist
└── contracts/           # Phase 1: TypeScript interface definitions
    └── devModeParser.ts
```

### Source Code

```text
src/utils/static/
└── devModeParser.ts          # Implementation (new file)

tests/unit/utils/
└── devModeParser.unit.test.ts # Unit tests (new file)

# Integration points (existing, not modified):
src/config/config.ts           # Already provides config singleton
```

**Structure Decision**: Single utility module in existing `src/utils/static/` directory, following the original request location. Tests in standard `tests/unit/` structure mirroring source paths.

## Implementation Approach

### Phase 0: Research (Minimal)

All critical decisions are finalized via clarification session:

- ✅ Language: TypeScript (.ts)
- ✅ Architecture: Class with static methods
- ✅ API: Two core methods + one convenience method
- ✅ Config integration: Dynamic prefix extraction with override
- ✅ Export: Default export of class

**Outcome**: No additional research needed. Proceed directly to Phase 1.

### Phase 1: Design & Contracts

#### 1.1 Data Model (`data-model.md`)

**Entities**:

- `DevModeParser`: Static utility class
- `ModeCheckResult`: Implicit (always returns boolean)
- `ConfigExtraction`: Internal structure for fromConfig method

**Type System**:

```typescript
type ConfigSource = string | boolean | undefined | null;
type ModeStatus = boolean;
```

**Coercion Rules**:

- Strings: "true", "1", "yes", "on" → true (case-insensitive)
- Everything else → false
- Undefined/null → false (safe default)

**Hierarchy Rules**:

1. Check env var first (highest priority)
2. If env var is false/undefined, check module flag
3. If module flag is false/undefined, check in-game setting
4. If all false/undefined, return false

#### 1.2 API Contracts (`contracts/devModeParser.ts`)

**Core Methods**:

```typescript
/**
 * Check if development mode is enabled
 * @param envVar Environment variable value (string or boolean)
 * @param moduleFlag Module manifest flag
 * @param inGameSetting In-game setting value
 * @returns true if any higher-priority source indicates true
 */
static isDevMode(
  envVar: ConfigSource,
  moduleFlag: ConfigSource,
  inGameSetting: ConfigSource
): boolean;

/**
 * Check if debug mode is enabled (independent from dev mode)
 * @param envVar Environment variable value
 * @param moduleFlag Module manifest flag
 * @param inGameSetting In-game setting value
 * @returns true if any higher-priority source indicates true
 */
static isDebugMode(
  envVar: ConfigSource,
  moduleFlag: ConfigSource,
  inGameSetting: ConfigSource
): boolean;

/**
 * Convenience method: extract mode values from config and check
 * @param config Config singleton instance
 * @param prefixOverride Optional override for module prefix (defaults to config.prefix)
 * @returns { devMode: boolean, debugMode: boolean }
 */
static fromConfig(
  config: Config,
  prefixOverride?: string
): { devMode: boolean; debugMode: boolean };
```

#### 1.3 Quickstart (`quickstart.md`)

Demonstrate usage patterns:

- Basic pure function calls
- Type coercion examples
- Convenience wrapper usage
- Integration with config singleton
- Error handling (graceful degradation)

### Phase 2: Task Breakdown

**Will be generated by `/speckit.tasks` command** with these task groups:

**Group A: Core Implementation** (3-4 tasks)

- Implement isDevMode static method
- Implement isDebugMode static method
- Implement fromConfig convenience method

**Group B: Type Safety & Documentation** (2 tasks)

- Complete TypeScript types and JSDoc
- Add file-level header and module documentation

**Group C: Testing** (3-4 tasks)

- Unit tests for isDevMode (all scenarios + edge cases)
- Unit tests for isDebugMode (all scenarios + edge cases)
- Unit tests for fromConfig and config integration
- Performance tests (<1ms requirement)

**Group D: Integration & Validation** (2 tasks)

- Verify integration with config singleton
- Final code review and Constitution compliance check

## Dependencies & Sequencing

**Hard Dependencies**:

- ✅ config.ts must be complete (DONE - already in place)
- ✅ Test fixtures must be available (DONE - vitest configured)

**Execution Order**:

1. Create data model (Phase 1)
2. Define API contracts (Phase 1)
3. Implement core methods (Phase 2, Group A)
4. Add documentation (Phase 2, Group B)
5. Write comprehensive tests (Phase 2, Group C)
6. Integration validation (Phase 2, Group D)

**Parallelization**: Groups A and B can overlap (implementation + docs). Group C can start once A is testable. Group D requires C complete.

## Quality Gates

✅ **Code Quality**:

- TypeScript strict mode enabled
- ESLint passes with project configuration
- No `any` types without justification

✅ **Test Coverage**:

- 100% line coverage for core methods
- All scenarios from spec covered
- Edge cases from specification included
- Performance benchmarks verify <1ms requirement

✅ **Documentation**:

- JSDoc comments on all public methods
- File-level header with purpose and path
- README updated if adding to existing directory
- Quickstart guide with usage examples

✅ **Constitutional Compliance**:

- Pure functions (no state)
- Clear responsibility boundaries
- No FoundryVTT integration required
- Comprehensive error handling

## Risk Mitigation

| Risk                                      | Likelihood | Impact | Mitigation                                                                                |
| ----------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------------- |
| Config singleton not available at runtime | Low        | Medium | Convenience method fails gracefully; core methods work with explicit parameters           |
| Type coercion edge cases                  | Medium     | Low    | Comprehensive test cases cover all inputs; explicit logging of unexpected types           |
| Performance degradation                   | Low        | High   | Performance tests included to verify <1ms requirement; pure functions enable optimization |
| Integration issues with in-game settings  | Low        | Low    | Tests include scenarios with missing settings; graceful defaults to false                 |

## Success Criteria

✅ **Technical**:

- All 16 functional requirements implemented and testable
- 100% of 6 success criteria measurable and verified
- <1ms performance requirement met and benchmarked
- All edge cases handled gracefully

✅ **Quality**:

- Constitution compliance verified
- 100% test coverage (all code paths)
- TypeScript strict mode passes
- ESLint passes

✅ **Documentation**:

- API documented with JSDoc
- Quickstart guide complete
- Data model documented
- Integration patterns clear

## Next Steps

1. **Phase 0 Complete**: Research phase skipped (all decisions finalized)
2. **Phase 1 Start**: Generate data-model.md, contracts/devModeParser.ts, quickstart.md
3. **Phase 1 Complete**: Run `.specify/scripts/bash/update-agent-context.sh copilot`
4. **Phase 2 Start**: Generate tasks.md via `/speckit.tasks` command
5. **Implementation**: Execute tasks in order (A → B → C → D)

---

**Plan Status**: ✅ **READY FOR PHASE 1 DESIGN**

Generate Phase 1 artifacts with `/speckit.tasks` or proceed manually to Phase 2 task creation.
