# Flag Management System

## Overview

The FoundryVTT Over My Head module provides a flexible flag management system that allows debug and development flags to be controlled at multiple levels, with environment variables taking precedence for maximum flexibility in CI/CD and development workflows.

## Flag Resolution Priority

Flags are resolved in the following priority order (highest to lowest):

1. **Environment Variables** (Highest Priority)
   - Allows override in CI/CD pipelines and development environments
   - Multiple naming patterns supported for flexibility

2. **Game Settings**
   - User-configurable settings within FoundryVTT
   - Persisted across sessions

3. **Module Flags**
   - Flags defined in `module.json`
   - Can be overridden by environment variables

4. **Constants Default** (Lowest Priority)
   - Default values from `constants.yaml`
   - Final fallback if no other source is available

## Environment Variable Naming Patterns

For maximum flexibility, the system checks multiple environment variable naming patterns in order:

### Pattern Priority

1. **Full Module ID Pattern**: `{MODULE_ID}_{FLAG_NAME}`
   - Example: `FOUNDRYVTT_OVER_MY_HEAD_DEBUG_MODE=true`
   - Most specific, highest priority among environment variables

2. **Short Name Pattern**: `{SHORT_NAME}_{FLAG_NAME}`
   - Example: `FOMH_DEBUG_MODE=true`
   - Convenient shorthand based on module initials

3. **Simple Flag Name**: `{FLAG_NAME}`
   - Example: `DEBUG_MODE=true`
   - Global fallback for quick testing

### Naming Conventions

- Module IDs and flag names are converted to `UPPER_SNAKE_CASE`
- Hyphens and camelCase are automatically converted
- Short names are derived from module ID initials (e.g., "foundryvtt-over-my-head" → "FOMH")

## Supported Flags

### debugMode

Controls debug logging throughout the module.

**Environment Variables:**
```bash
FOUNDRYVTT_OVER_MY_HEAD_DEBUG_MODE=true
FOMH_DEBUG_MODE=true
DEBUG_MODE=true
```

**Default Value:** `false` (from module.json)

**Usage:**
- Set to `true` to enable debug logging
- Set to `false` to disable debug logging
- Affects all `logger.debug()` calls in the module

### dev

Controls development-specific features and behaviors.

**Environment Variables:**
```bash
FOUNDRYVTT_OVER_MY_HEAD_DEV=true
FOMH_DEV=true
DEV=true
```

**Default Value:** `true` (from module.json)

**Usage:**
- Enables development-specific features when `true`
- Disables dev features in production when `false`

## Value Parsing

Environment variable values are automatically parsed to the appropriate JavaScript type:

| Environment Value | Parsed Result | Type |
|-------------------|---------------|------|
| `true` (any case) | `true` | Boolean |
| `false` (any case) | `false` | Boolean |
| `"123"` | `123` | Number (integer) |
| `"3.14"` | `3.14` | Number (float) |
| `'{"key":"value"}'` | `{key: "value"}` | Object (JSON) |
| `'["a","b"]'` | `["a", "b"]` | Array (JSON) |
| `"text"` | `"text"` | String |

## Usage Examples

### CI/CD Pipeline

Set flags in your CI workflow:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      FOMH_DEBUG_MODE: true
      FOMH_DEV: false
    steps:
      - name: Run tests
        run: npm test
```

### Local Development

Set flags in your shell:

```bash
# Enable debug mode for development
export FOMH_DEBUG_MODE=true

# Or set for a single command
FOMH_DEBUG_MODE=true npm run dev
```

### Docker Compose

Set flags in your docker-compose configuration:

```yaml
# docker-compose.yml
services:
  foundry:
    environment:
      - FOMH_DEBUG_MODE=true
      - FOMH_DEV=true
```

### Production Environment

Ensure debug mode is disabled:

```bash
# Explicitly disable debug mode
export FOMH_DEBUG_MODE=false
export FOMH_DEV=false

# Or simply don't set the variables (will use defaults)
```

### Testing Different Configurations

```bash
# Test with debug mode enabled
FOMH_DEBUG_MODE=true npm test

# Test with debug mode disabled
FOMH_DEBUG_MODE=false npm test

# Test with production-like settings
FOMH_DEBUG_MODE=false FOMH_DEV=false npm test
```

## Programmatic Usage

### Check Debug Mode Status

```javascript
import { Logger } from './utils/logger.mjs';

const logger = new Logger(constants, manifest, formatError);

if (logger.isDebugEnabled()) {
  console.log('Debug mode is enabled');
  logger.debug('This will be logged');
}
```

### Resolve Custom Flags

```javascript
import EnvFlagResolver from './config/helpers/envFlagResolver.mjs';

// Resolve a single flag
const myFlag = EnvFlagResolver.resolveFlag(
  'myCustomFlag',
  'foundryvtt-over-my-head',
  false  // default value
);

// Resolve multiple flags
const flags = EnvFlagResolver.resolveFlags(
  ['debugMode', 'dev', 'customFlag'],
  'foundryvtt-over-my-head',
  { debugMode: false, dev: true, customFlag: null }
);

// Check if environment override exists
if (EnvFlagResolver.hasEnvOverride('debugMode', 'foundryvtt-over-my-head')) {
  console.log('Debug mode is overridden by environment variable');
}
```

## Best Practices

### Development

1. **Use environment variables** for temporary debug mode changes
2. **Don't commit** debug mode enabled in module.json
3. **Document** any custom flags you add
4. **Use the short name pattern** (e.g., `FOMH_DEBUG_MODE`) for convenience

### CI/CD

1. **Enable debug mode** for failing test diagnostics
2. **Disable dev mode** for production-like testing
3. **Use full module ID pattern** for clarity in shared CI environments
4. **Document** required environment variables in CI configuration

### Production

1. **Never enable debug mode** in production deployments
2. **Verify flags** are properly set before deployment
3. **Use monitoring** to detect unexpected flag states
4. **Keep module.json flags** set to production values

## Troubleshooting

### Debug Mode Not Working

1. Check environment variable spelling and casing
2. Verify the module ID matches (use full pattern to be sure)
3. Check if game settings override environment variables
4. Look for console messages about constants export

### Environment Variables Not Taking Effect

1. Ensure variables are set before module loads
2. Check if running in Node.js environment (not browser)
3. Verify no typos in variable names
4. Try using the full module ID pattern first

### Unexpected Flag Values

1. Check all possible sources in priority order
2. Use `EnvFlagResolver.hasEnvOverride()` to debug
3. Check for game settings that might override
4. Verify environment variable value parsing

## API Reference

See the following files for detailed API documentation:

- `src/config/helpers/envFlagResolver.mjs` - Environment variable resolution
- `src/config/helpers/manifestParser.mjs` - Manifest flag processing
- `src/utils/logger.mjs` - Debug mode checking

## Examples Repository

For complete working examples, see:
- `.github/workflows/` - CI configuration examples
- `docker/` - Docker environment examples (if available)
- `tests/` - Test examples using environment variables
