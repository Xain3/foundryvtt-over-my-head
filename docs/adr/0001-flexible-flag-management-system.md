# ADR-0001: Flexible Flag Management System with Environment Variables

## Status

✅ **Accepted** (Implemented)

## Context

The module previously required manual editing of `module.json` or other configuration files to toggle debug and development mode flags. This was problematic for:

- **CI/CD pipelines**: Couldn't easily enable debug logging for failing tests without modifying source files
- **Development workflows**: Required file edits and commits to test different configurations
- **Production deployments**: Risk of accidentally deploying with debug mode enabled
- **Flexibility**: No clean way to override flags at runtime based on environment

The team needed a flexible system that allowed flags to be controlled at multiple levels without requiring code changes.

## Decision

We implemented a **hierarchical environment variable-based flag management system** that allows debug and development flags to be controlled dynamically with the following priority order:

1. **Environment Variables** (Highest Priority) - NEW
2. Game Settings (Foundry UI settings)
3. Module Flags (module.json)
4. Constants (constants.yaml - Fallback)

### Key Design Decisions

#### 1. Multiple Naming Patterns

Support three environment variable naming patterns (checked in order):

- **Full Module ID**: `FOUNDRYVTT_OVER_MY_HEAD_DEBUG_MODE=true` (most explicit)
- **Short Name**: `OMH_DEBUG_MODE=true` (recommended, derives from module initials)
- **Simple**: `DEBUG_MODE=true` (global fallback)

**Rationale**: Provides flexibility for different scenarios - full ID for shared CI environments, short name for convenience, simple for quick testing.

#### 2. Automatic Type Parsing

Environment variable values are automatically parsed to the correct JavaScript type:

- `"true"` / `"false"` → Boolean
- `"123"` → Number
- `'{"key":"value"}'` → Object (JSON)
- `'["a","b"]'` → Array (JSON)
- Other values → String

**Rationale**: Makes environment variables user-friendly without requiring quoted strings or type annotations.

#### 3. Resolution Order

Check environment variables before game settings, which take precedence over module flags.

**Rationale**: Environment variables are immutable during runtime and set externally, making them the most reliable override point for CI/CD and deployment scenarios.

## Implementation

### Files Created

| File                                               | Purpose                                                      |
| -------------------------------------------------- | ------------------------------------------------------------ |
| `src/config/helpers/envFlagResolver.mjs`           | Core utility for environment variable resolution (265 lines) |
| `src/config/helpers/envFlagResolver.unit.test.mjs` | 41 comprehensive unit tests with 100% coverage               |
| `docs/FLAG_MANAGEMENT.md`                          | Complete user guide with examples and troubleshooting        |
| `docs/examples/ci-debug-example.yml`               | GitHub Actions workflow examples                             |
| `docs/examples/local-dev-example.sh`               | Local development examples                                   |
| `docs/examples/README.md`                          | Examples overview                                            |

### Files Modified

| File                                              | Changes                                                  |
| ------------------------------------------------- | -------------------------------------------------------- |
| `src/config/helpers/manifestParser.mjs`           | Added `#applyEnvFlagOverrides()` method (+34 lines)      |
| `src/config/helpers/manifestParser.unit.test.mjs` | Added 4 tests for env override functionality (+59 lines) |
| `src/utils/logger.mjs`                            | Added env override checking for debug mode (+66 lines)   |
| `README.md`                                       | Added "Flag Management" section (+9 lines)               |

### Statistics

- **Lines Added**: ~1,491
- **Lines Modified**: ~168
- **New Tests**: 45
- **Test Pass Rate**: 100% (2294/2294 tests passing)
- **Code Coverage**: 100% for new code

## Consequences

### Positive ✅

1. **Flexibility**: Flags can be controlled externally without code changes
2. **CI/CD Integration**: Enables debug logging in pipelines easily via environment setup
3. **Developer Experience**: Quick iteration with `OMH_DEBUG_MODE=true npm run dev`
4. **Production Safety**: Clear separation of concerns; environment controls override defaults
5. **Backward Compatible**: No breaking changes; existing flag resolution still works
6. **Performance**: Negligible overhead (O(1) lookups, resolved once at init)
7. **Type Safety**: Automatic parsing prevents string-to-type conversion bugs
8. **Well Tested**: 100% code coverage with comprehensive test suite

### Tradeoffs ⚖️

1. **Complexity**: Added three new naming patterns to remember (mitigated by documentation)
2. **Type Parsing**: Implicit JSON parsing from strings could surprise users (mitigated by clear docs)
3. **Environment Coupling**: Behavior depends on environment setup (standard practice, not a problem)

### Alternatives Considered

1. **`.env` file support**: Requires additional dependency (dotenv); not implemented in favor of env vars
2. **Config file support** (e.g., `.omhrc`): Would require file system access in browser context; not viable
3. **CLI arguments**: Only applicable in Node.js; not useful for Foundry module runtime
4. **Single naming pattern**: Would reduce flexibility; multiple patterns better serve different use cases

## Testing

### Unit Tests

- **EnvFlagResolver**: 41 tests covering all naming patterns, priorities, type parsing, edge cases
- **ManifestParser Integration**: 11 tests including 4 new for environment override functionality
- **Coverage**: 100% for all new code

### Test Categories

- ✅ Flag resolution with different naming patterns
- ✅ Priority resolution order
- ✅ Type parsing (boolean, numeric, JSON)
- ✅ Multiple flag resolution
- ✅ Environment override detection
- ✅ Edge cases (empty values, null, undefined)

### Validation

1. **Unit Tests**: All 2294 tests pass ✓
2. **Build**: Successful build with no errors ✓
3. **Linting**: No new linting errors ✓
4. **Manual Testing**: Environment variable resolution verified ✓

## Examples

### Local Development

```bash
# Enable debug mode for single command
OMH_DEBUG_MODE=true npm run dev

# For entire session
export OMH_DEBUG_MODE=true
npm run dev
npm test
```

### CI/CD Pipeline

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      OMH_DEBUG_MODE: true
      OMH_DEV: false
    steps:
      - run: npm test
```

### Docker Compose

```yaml
services:
  foundry:
    environment:
      - OMH_DEBUG_MODE=true
      - OMH_DEV=true
```

## Future Considerations

Potential enhancements (not implemented):

- `.env` file support via dotenv package
- Config file support (`.omhrc`, `.omh.json`)
- Per-feature debug granularity
- Runtime flag toggling in Foundry UI
- Flag state persistence across sessions

## Related Documentation

- [Flag Management User Guide](../FLAG_MANAGEMENT.md) - Complete usage guide
- [CI/CD Examples](../examples/ci-debug-example.yml) - GitHub Actions examples
- [Local Development Examples](../examples/local-dev-example.sh) - Shell examples

## API Reference

```javascript
import EnvFlagResolver from './config/helpers/envFlagResolver.mjs';

// Resolve single flag
const debugMode = EnvFlagResolver.resolveFlag(
  'debugMode',
  'foundryvtt-over-my-head',
  false // default
);

// Resolve multiple flags
const flags = EnvFlagResolver.resolveFlags(
  ['debugMode', 'dev'],
  'foundryvtt-over-my-head',
  { debugMode: false, dev: true }
);

// Check for environment override
const hasOverride = EnvFlagResolver.hasEnvOverride(
  'debugMode',
  'foundryvtt-over-my-head'
);
```

## Decision Log

- **Decided**: October 2025
- **Implemented**: October 2025
- **Status**: In Production
