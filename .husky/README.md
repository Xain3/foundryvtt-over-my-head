# Git Hooks

This directory contains Git hooks managed by [Husky](https://typicode.github.io/husky/).

## Pre-Commit Hook

**File**: `pre-commit`

**Purpose**: Validates that `alias.config.mjs` is synchronized with all configuration files before allowing a commit.

**What it does**:

1. Runs alias validation tests
2. If validation fails, blocks the commit and displays instructions
3. If validation passes, allows the commit to proceed

**If validation fails**:

```bash
❌ [OMH] Alias validation FAILED!

Configuration files are out of sync with alias.config.mjs.
To fix this, run:

  npm run sync-aliases

Then stage the updated files and retry your commit.
```

**How to fix**:

1. Run `npm run sync-aliases` to synchronize aliases
2. Stage the updated configuration files: `git add tsconfig.json package.json vite.config.mjs vitest.config.mjs`
3. Retry your commit

**Disabling the hook** (not recommended):

- Use `git commit --no-verify` to skip the hook
- Only do this if you're certain the aliases are synchronized

## Setup

Hooks are automatically installed when you run `npm install` via the `prepare` script in `package.json`.

**Last Updated**: 2025-10-31
**Husky Version**: 9.1.7
