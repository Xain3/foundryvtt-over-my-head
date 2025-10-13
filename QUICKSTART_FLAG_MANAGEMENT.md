# Quick Start: Flag Management

## What Changed?

You can now control debug and development flags using **environment variables** for maximum flexibility in CI/CD and development workflows!

## Quick Examples

### 1. Enable Debug Mode Locally

```bash
# Single command
FOMH_DEBUG_MODE=true npm run dev

# For entire terminal session
export FOMH_DEBUG_MODE=true
npm run dev
npm test
```

### 2. Enable Debug Mode in CI

```yaml
# .github/workflows/your-workflow.yml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      FOMH_DEBUG_MODE: true  # Enable debug logging
      FOMH_DEV: false         # Disable dev features
    steps:
      - run: npm test
```

### 3. Test Different Configurations

```bash
# Production mode
FOMH_DEBUG_MODE=false FOMH_DEV=false npm test

# Development mode
FOMH_DEBUG_MODE=true FOMH_DEV=true npm run dev

# Debug tests only
FOMH_DEBUG_MODE=true npm run test:unit
```

## Environment Variable Names

You can use any of these patterns (checked in order):

1. **Full module ID**: `FOUNDRYVTT_OVER_MY_HEAD_DEBUG_MODE=true`
2. **Short name**: `FOMH_DEBUG_MODE=true` ⭐ Recommended
3. **Simple**: `DEBUG_MODE=true`

## How It Works

Flags are resolved in this priority order:

1. **Environment Variables** ← YOU CAN SET THESE NOW! 🎉
2. Game Settings (in Foundry)
3. Module Flags (module.json)
4. Constants (constants.yaml)

## Available Flags

| Flag | Default | Description |
|------|---------|-------------|
| `debugMode` | `false` | Enable debug logging |
| `dev` | `true` | Enable development features |

## More Information

- **Full Documentation**: [`docs/FLAG_MANAGEMENT.md`](docs/FLAG_MANAGEMENT.md)
- **CI Examples**: [`docs/examples/ci-debug-example.yml`](docs/examples/ci-debug-example.yml)
- **Local Dev Examples**: [`docs/examples/local-dev-example.sh`](docs/examples/local-dev-example.sh)

## Need Help?

1. Check the full documentation: `docs/FLAG_MANAGEMENT.md`
2. See working examples: `docs/examples/`
3. Run the test to verify: `npm run test:unit -- src/config/helpers/envFlagResolver.unit.test.mjs`

## Pro Tips

### Quick Aliases

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
alias omh-dev='FOMH_DEBUG_MODE=true FOMH_DEV=true npm run dev'
alias omh-test='FOMH_DEBUG_MODE=true npm test'
alias omh-prod='FOMH_DEBUG_MODE=false FOMH_DEV=false npm run build'
```

### Docker Compose

```yaml
services:
  foundry:
    environment:
      - FOMH_DEBUG_MODE=true
      - FOMH_DEV=true
```

### Debug Failing CI Tests

Just add this to your workflow:

```yaml
env:
  FOMH_DEBUG_MODE: true
```

That's it! 🚀
