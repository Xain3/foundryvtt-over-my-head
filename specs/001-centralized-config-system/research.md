# Research & Clarifications: Centralized Configuration System

**Date**: October 20, 2025
**Feature**: Centralized Configuration System
**Status**: ✅ COMPLETE - All critical decisions resolved in clarification session

---

## Overview

This research document consolidates all critical decisions and technical findings for the config system implementation. All clarifications were resolved during the `/speckit.clarify` phase, so this document serves as a reference record.

---

## Decision Record

### 1. YAML Constants Merging Strategy

**Question**: How should multiple YAML files from `src/config/constants/` be merged?

**Decision**: Namespace-preserving shallow merge

**Rationale**:

- Each YAML file name becomes a top-level key under `constants` object
- Prevents key collisions between different config categories
- Makes it clear which file each value originates from
- Simple to implement and debug
- Aligns with developer expectations for modular config

**Chosen Over**:

- **Deep merge**: Would flatten namespace, risking collisions and confusion
- **Array of objects**: Less intuitive API; harder to reference values

**Implementation Details**:

```typescript
// YAML files: errors.yaml, foundry.yaml, hooks.yaml, etc.
config.constants.errors.separator
config.constants.foundry.defaults.i18nLocation
config.constants.hooks.hooks.SettingsReady
config.configs.moduleManagement.shortName
config.configs.occlusion.// ...
config.configs.placeables.// ...
```

**Affected Requirements**: FR-002, FR-010

---

### 2. Error Handling Strategy

**Question**: How should the config system handle errors (malformed YAML, missing files, invalid JSON)?

**Decision**: Fail-fast with detailed error reporting

**Rationale**:

- Configuration errors are fatal bugs, not recoverable issues
- Early detection prevents subtle propagating bugs
- Stack traces and file paths enable quick debugging
- Aligns with principle: "let it break loudly, not silently"
- Proper for infrastructure-level component (all-or-nothing)

**Chosen Over**:

- **Graceful degradation**: Would hide bugs; could cause downstream errors
- **Strict per-file, lenient overall**: Inconsistent behavior is confusing
- **Validation + reporting**: Doesn't stop initialization; errors could be missed

**Error Format**:

```
[OMH] Failed to load YAML from src/config/constants/foundry.yaml:
Invalid YAML syntax at line 5, column 3.
<original error message with stack trace>
```

**Behavior**:

- Throw Error immediately on parse failure
- Include file path and parsing context
- Preserve full stack trace
- Module initialization fails; no fallback config

**Affected Requirements**: FR-011, Edge cases 1, 3

---

### 3. Environment Variable Naming Convention

**Question**: How should environment variables be named and matched against config keys?

**Decision**: Custom prefix pattern derived from `moduleManagement.yaml`

**Rationale**:

- Module identity centralized in `moduleManagement.yaml`
- No magic strings or hardcoded prefixes in code
- Prevents namespace collisions with other modules
- Matches industry standard: `PREFIX_KEY_NAME`
- Easy to customize across environments

**Implementation**:

1. Read `shortName` from `src/config/constants/moduleManagement.yaml`
2. Current value: `shortName: 'OMH'`
3. Environment variables in format: `OMH_DEBUG_MODE`, `OMH_BEHAVIOR_TOKENS`
4. Converted to lowercase camelCase for config keys: `debugMode`, `behaviorTokens`
5. Environment variables override YAML-based config values

**Example Mapping**:

```
Environment Variable  →  Config Key (Override)
OMH_DEBUG_MODE       →  settings.debugMode
OMH_BEHAVIOR_TOKENS  →  settings.behaviorTokens
```

**Fallback**: Helper function reads from `moduleManagement.yaml`; if unavailable, uses hardcoded default

**Affected Requirements**: FR-005, FR-006

---

### 4. Config Immutability Strategy

**Question**: Should the config be immutable after initialization, or support runtime updates?

**Decision**: Immutable via `Object.freeze()` after initialization

**Rationale**:

- Prevents accidental modifications causing subtle bugs
- Guarantees consistency across entire application lifetime
- Detects programming errors during development
- Simple, no external dependencies
- Aligns with functional programming best practices

**Implementation**:

```typescript
// After loading all config sources
Object.freeze(configObject);
Object.freeze(configObject.constants);
Object.freeze(configObject.settings);
Object.freeze(configObject.module);
Object.freeze(configObject.env);
```

**Behavior**:

- Attempting to modify properties throws error in strict mode
- Silently fails in non-strict mode
- Prevents runtime config changes (by design)
- If config needs to change, requires full module reload

**Trade-off Accepted**:

- No hot-reloading of config at runtime
- Configuration is set once at initialization
- Simpler mental model, fewer potential bugs

**Affected Requirements**: FR-012, Edge case 6

---

## Technology Choices

### YAML Parser

**Decision**: Use `yaml` npm package

**Rationale**:

- Industry standard for Node.js YAML parsing
- Well-maintained, security-conscious
- Supports YAML 1.2 spec
- Good error messages with line/column info
- Minimal dependencies

**Alternative Considered**:

- `js-yaml`: Similar capability; yaml package is more actively maintained

---

### Type Safety

**Decision**: Full TypeScript with strict mode

**Rationale**:

- Project already uses TypeScript (.mts extension)
- Config object structure known at compile time
- IDE autocomplete critical for developer experience
- Aligns with project standards

**Type Definition Strategy**:

```typescript
interface ConfigConstants {
  errors: typeof ErrorsYAML;
  foundry: typeof FoundryYAML;
  hooks: typeof HooksYAML;
  // ... etc
}

interface Config {
  constants: ConfigConstants;
  settings: SettingsDefinition[];
  module: ModuleManifest;
  env: Record<string, string | undefined>;
}
```

---

### Singleton Implementation

**Decision**: Class static instance + module-level singleton export + `Object.freeze()`

**Rationale**:

- Idiomatic TypeScript pattern
- Clear, readable code
- Compatible with ESM module system
- Each import gets same instance (module caching)
- Type-safe singleton access

**Pattern**:

```typescript
class Config {
  private static instance: Config | null = null;

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
      Config.instance.initialize();
      Object.freeze(Config.instance);
    }
    return Config.instance;
  }
}

export const config = Config.getInstance();
```

---

## Testing Strategy

### Test Categories

1. **Unit Tests** (75% of coverage)
   - YAML parsing from each file
   - Namespace-keyed merging behavior
   - Environment variable detection and override
   - Singleton instance identity
   - Immutability enforcement
   - Error handling (malformed files, missing files)

2. **Integration Tests** (10% of coverage)
   - Full config load from actual YAML files
   - Settings definitions accessible via config
   - Module.json metadata accessible
   - Multi-import singleton verification

3. **Edge Case Tests** (5% of coverage)
   - Modification attempts on frozen config
   - Missing optional env vars
   - Empty YAML files
   - Concurrent import scenarios

### Mock Strategy

- **File System**: Mock `fs` module to provide test YAML/JSON content
- **Environment Variables**: Mock `process.env` object
- **Module Manifest**: Mock module.json content

### Coverage Goals

- **Minimum**: 80% code coverage
- **Target**: 90% code coverage
- **Critical path**: 100% (singleton, freeze, error handling)

---

## Performance Considerations

### Target: <100ms config initialization

**Optimization Strategies**:

1. **Lazy YAML Parsing**: Parse only used YAML files
   - Files loaded: errors.yaml, foundry.yaml, hooks.yaml, moduleManagement.yaml, occlusion.yaml, placeables.yaml
   - All relatively small (<5KB each)
   - Total load time should be <50ms

2. **Single Module Export**: Initialization happens once per process
   - Subsequent imports return cached singleton
   - Zero overhead after first import

3. **Minimal Merging**: Shallow merge only (no recursive structure)
   - Fast object key assignment
   - No deep cloning overhead

### Benchmarking

- Measure initialization time in development
- Log load times if exceeds 100ms
- Consider lazy loading if needed (likely not necessary)

---

## Integration Points

### FoundryVTT Globals

**Used**:

- `game` (optional): May access `game.i18n` reference from foundry.yaml
- Not required for config initialization itself

**Not Used**:

- No Hooks during initialization
- No canvas modifications
- No CONFIG patches

### Existing Module Structure

**Dependencies**:

- `src/config/constants/` - Existing YAML files
- `src/config/settings/settings.yaml` - Existing settings
- `module.json` - Existing manifest
- `process.env` - Node.js/development environment

**Used By**:

- `src/main.mjs` - Will import config singleton
- All modules needing configuration - Will use exported config singleton

---

## Implementation Timeline

### Phase 1: Core Implementation (Est. 2-3 days)

1. Create `src/config/config.ts` with Config class
2. Implement YAML file loading
3. Implement namespace-keyed merging
4. Implement module.json loading
5. Implement environment variable override
6. Implement singleton pattern
7. Implement Object.freeze()

### Phase 2: Testing (Est. 1-2 days)

1. Unit tests for each loading mechanism
2. Integration tests with real files
3. Edge case tests
4. Performance benchmarking
5. Coverage analysis and gaps

### Phase 3: Documentation & Polish (Est. 1 day)

1. JSDoc for all public methods
2. File-level headers per style guide
3. README.md for config folder
4. Update main module to use config
5. PR preparation

---

## Open Questions (None - All Resolved ✅)

All critical ambiguities were resolved during clarification session.

---

## Assumptions Validated

✅ **YAML files well-formed**: Existing files in project are valid YAML
✅ **module.json exists**: Verified in project root
✅ **ES modules (ESM)**: Project already uses .mts and .mjs
✅ **Node.js environment**: Dev environment confirmed
✅ **Immutability acceptable**: No runtime config changes needed

---

## Risk Mitigation Summary

| Risk                   | Likelihood | Impact | Mitigation                                               |
| ---------------------- | ---------- | ------ | -------------------------------------------------------- |
| YAML parsing errors    | Low        | High   | Fail-fast; detailed errors; existing files valid         |
| Singleton collisions   | Very Low   | High   | ESM module caching; test identity                        |
| Type safety gaps       | Very Low   | Medium | TypeScript strict mode; interface definitions            |
| Performance issues     | Very Low   | Medium | Benchmark early; config files small; lazy load if needed |
| Browser env var access | Low        | Low    | Check for existence gracefully; dev-only feature         |

---

## Next Steps

1. ✅ Phase 0 Research complete
2. → Phase 1: Generate data-model.md, contracts/, quickstart.md
3. → Phase 2: Generate task breakdown via `/speckit.tasks`
4. → Implementation and testing

---

**Research Completed**: October 20, 2025
**Status**: ✅ Ready for Phase 1 Design
