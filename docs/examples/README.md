# Flag Management Examples

This directory contains practical examples for using the flexible flag management system in different scenarios.

## Files

### [ci-debug-example.yml](ci-debug-example.yml)

GitHub Actions workflow examples showing:

- Production mode testing (debug disabled)
- Debug mode testing with enhanced logging
- Matrix testing with different flag combinations
- Conditional debug based on commit messages
- Environment-specific builds

**Usage:** Copy relevant jobs to your `.github/workflows/` files.

### [local-dev-example.sh](local-dev-example.sh)

Shell script examples for local development showing:

- Running with debug mode enabled
- Testing with different configurations
- Setting session-wide environment variables
- Creating .env files for persistence
- Docker Compose integration
- Shell aliases for convenience

**Usage:** Run `./docs/examples/local-dev-example.sh` to see all examples, or copy commands for your workflow.

## Quick Start

### Enable Debug Mode Locally

```bash
# For a single command
OMH_DEBUG_MODE=true npm run dev

# For entire session
export OMH_DEBUG_MODE=true
npm run dev  # Will use debug mode
npm test     # Will also use debug mode
```

### Enable Debug Mode in CI

```yaml
# In your GitHub Actions workflow
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      OMH_DEBUG_MODE: true
      OMH_DEV: true
    steps:
      - run: npm test
```

### Use Different Configs

```bash
# Development mode
OMH_DEBUG_MODE=true OMH_DEV=true npm run dev

# Production testing
OMH_DEBUG_MODE=false OMH_DEV=false npm run build

# Debug tests only
OMH_DEBUG_MODE=true npm run test:unit
```

## Environment Variable Reference

| Variable                             | Default | Description                                |
| ------------------------------------ | ------- | ------------------------------------------ |
| `OMH_DEBUG_MODE`                     | `false` | Enable debug logging throughout the module |
| `OMH_DEV`                            | `true`  | Enable development-specific features       |
| `FOUNDRYVTT_OVER_MY_HEAD_DEBUG_MODE` | -       | Full module ID pattern (highest priority)  |
| `DEBUG_MODE`                         | -       | Global fallback pattern                    |

## More Information

See the main [Flag Management Documentation](../FLAG_MANAGEMENT.md) for:

- Complete flag resolution priority
- All naming patterns
- Troubleshooting guide
- API reference
