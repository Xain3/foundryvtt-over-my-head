# Quickstart Guide: Alias Configuration Centralization

**Feature**: 003-alias-centralization
**For**: Developers working on the Over My Head module
**Time to read**: 5 minutes

This guide gets you up to speed on using the centralized alias configuration system.

---

## What This Feature Does

The alias centralization system ensures that all configuration files (tsconfig.json, package.json, vite.config.mjs, vitest.config.mjs) stay synchronized with the single source of truth: `alias.config.mjs`.

**Key Benefits**:

- ✅ Add aliases in one place, automatically sync to all configs
- ✅ Catch configuration drift before it reaches production
- ✅ Eliminate manual alias updates in multiple files
- ✅ Preserve file formatting and comments automatically

---

## Quick Start (30 seconds)

### Adding a New Alias

1. **Edit** `alias.config.mjs`:

   ```javascript
   export const aliasEntries = [
     { find: '#', replacement: resolve(cwd, 'src') },
     { find: '#tests', replacement: resolve(cwd, 'tests') },
     // Add your new alias:
     { find: '#utils', replacement: resolve(cwd, 'src/utils') },
   ];
   ```

2. **Sync** configuration files:

   ```bash
   npm run sync-aliases
   ```

3. **Verify** (optional):
   ```bash
   npm test -- --project "project setup"
   ```

Done! All config files now have your new alias.

---

## Common Tasks

### Task 1: Check if Aliases Are Synchronized

**When**: Before committing code

**Command**:

```bash
npm test -- --project "project setup" tests/project-setup-tests/alias-sync.setup.test.mjs
```

**Expected Output** (if synchronized):

```
✓ tests/project-setup-tests/alias-sync.setup.test.mjs (4)
  ✓ Alias synchronization validation
    ✓ tsconfig.json paths match alias.config.mjs
    ✓ package.json imports match alias.config.mjs
```

**If misaligned**, you'll see:

```
✗ tsconfig.json paths match alias.config.mjs
  Expected: { "#/": "./src/", "#tests/": "./tests/", "#mocks/": "./tests/mocks/" }
  Actual:   { "#/": "./src/", "#tests/": "./tests/" }
  Missing:  ["#mocks/"]

  Fix with: npm run sync-aliases
```

---

### Task 2: Synchronize Configuration Files

**When**: After modifying `alias.config.mjs`

**Command**:

```bash
npm run sync-aliases
```

**What it does**:

1. Reads aliases from `alias.config.mjs`
2. Updates `tsconfig.json` paths section (with TypeScript syntax)
3. Updates `package.json` imports section (with Node.js syntax)
4. Preserves comments, indentation, and formatting

**Expected Output**:

```
[OMH] Processing jsonc (tsconfig.json)
  ✓ Updated successfully
[OMH] Processing json (package.json)
  ✓ Already synchronized

[OMH] Summary: 1 updated, 0 errors, 2 total
```

---

### Task 3: Preview Changes (Dry Run)

**When**: Want to see what would change without modifying files

**Command**:

```bash
npm run sync-aliases -- --dry-run
```

**What it does**:

- Reads all config files
- Compares with `alias.config.mjs`
- Shows diffs
- **Does NOT modify any files**

**Expected Output**:

```
[OMH] Processing jsonc (tsconfig.json)
  → Would update (dry-run mode)
    Diff: {
      missing: ["#mocks/"],
      extra: [],
      mismatched: []
    }
[OMH] Processing json (package.json)
  ✓ Already synchronized

[OMH] Summary: 0 updated, 0 errors, 2 total (dry-run mode)
```

---

### Task 4: Sync Aliases from VS Code

**When**: Working in VS Code and want IDE convenience

**Steps**:

1. Open Command Palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: `Tasks: Run Task`
3. Select: `Sync Aliases`
4. Output appears in Terminal panel

**Tip**: Create a keyboard shortcut for faster access (File > Preferences > Keyboard Shortcuts > search "Run Task").

---

### Task 5: Adding Support for a New Config File Type

**When**: Project adopts new build tool (webpack, rollup, etc.) that needs alias config

**Steps**:

1. **Create adapter** in `src/utils/alias-adapters/`:

   ```bash
   touch src/utils/alias-adapters/WebpackAdapter.mjs
   ```

2. **Implement interface** (see [adapter-interface.md](./contracts/adapter-interface.md)):

   ```javascript
   import { BaseConfigAdapter } from './BaseConfigAdapter.mjs';

   export class WebpackAdapter extends BaseConfigAdapter {
     getFormat() {
       return 'webpack';
     }
     getFilePaths() {
       return ['/path/to/webpack.config.js'];
     }
     async read() {
       /* normalize from webpack format */
     }
     async write(aliases) {
       /* convert to webpack format */
     }
   }
   ```

3. **Register adapter** in `.dev/scripts/sync-aliases.mjs`:

   ```javascript
   import { WebpackAdapter } from '#/utils/alias-adapters/WebpackAdapter.mjs';

   adapterRegistry.register(new WebpackAdapter());
   ```

4. **Add tests** in `tests/unit/adapters/`:

   ```bash
   touch tests/unit/adapters/WebpackAdapter.unit.test.mjs
   ```

5. **Run validation**:
   ```bash
   npm test -- --project unit tests/unit/adapters/WebpackAdapter.unit.test.mjs
   ```

**Time estimate**: 30 minutes for experienced developers

**See**: [Adapter Interface Contract](./contracts/adapter-interface.md) for complete details

---

## File Reference

### Source of Truth

- **`alias.config.mjs`** - Canonical alias definitions (edit this file only)

### Synchronized Configuration Files

- **`tsconfig.json`** - TypeScript paths (auto-synced)
- **`package.json`** - Node.js imports (auto-synced)
- **`vite.config.mjs`** - Already imports from alias.config.mjs (no sync needed)
- **`vitest.config.mjs`** - Already imports from alias.config.mjs (no sync needed)

### Tools

- **`.dev/scripts/sync-aliases.mjs`** - Synchronization script
- **`tests/project-setup-tests/alias-sync.setup.test.mjs`** - Validation tests
- **`.husky/pre-commit`** - Git hook (validates before commit)

### Documentation

- **`specs/003-alias-centralization/`** - Complete feature specification
  - `spec.md` - Requirements and user scenarios
  - `plan.md` - Implementation plan
  - `research.md` - Technology decisions
  - `data-model.md` - Entity definitions
  - `contracts/adapter-interface.md` - Adapter contract
  - `quickstart.md` - This document

---

## Troubleshooting

### Problem: Validation test fails but I didn't change anything

**Possible causes**:

1. Another developer added an alias and didn't sync
2. Merge conflict in configuration files
3. Manual edit to tsconfig.json or package.json

**Solution**:

```bash
# Sync to match alias.config.mjs (canonical source)
npm run sync-aliases

# If that doesn't fix it, check git diff
git diff alias.config.mjs tsconfig.json package.json

# Manually resolve conflicts if needed
```

---

### Problem: Sync script fails with "File not found"

**Possible causes**:

1. Configuration file deleted
2. Running script from wrong directory

**Solution**:

```bash
# Ensure you're in project root
cd /workspaces/foundryvtt-over-my-head

# Check if files exist
ls -l tsconfig.json package.json

# If missing, restore from git
git checkout tsconfig.json package.json
```

---

### Problem: Sync script modifies my comments or formatting

**Expected behavior**: Comments and formatting should be preserved.

**If not preserved**:

1. Check which adapter is responsible (output shows file name)
2. File a bug report with:
   - Original file content
   - Expected output
   - Actual output
   - Command run

**Workaround**: Manually fix formatting after sync, then commit both changes together.

---

### Problem: Pre-commit hook blocks my commit

**This is intentional!** It means your config files are out of sync.

**Solution**:

```bash
# See what's different
npm test -- --project "project setup"

# Sync the files
npm run sync-aliases

# Stage the updated files
git add tsconfig.json package.json

# Retry commit
git commit
```

**Bypass** (not recommended):

```bash
git commit --no-verify
```

---

### Problem: I want to add a new file type but don't know how

**Resources**:

1. Read [Adapter Interface Contract](./contracts/adapter-interface.md)
2. Look at existing adapters in `src/utils/alias-adapters/`
3. Follow [Task 5: Adding Support for a New Config File Type](#task-5-adding-support-for-a-new-config-file-type)

**Ask for help**:

- Check project documentation: `docs/README.md`
- Review data model: `specs/003-alias-centralization/data-model.md`
- Check constitution: `.specify/memory/constitution.md`

---

## npm Scripts Reference

| Command                                 | Description                                   | Use When                      |
| --------------------------------------- | --------------------------------------------- | ----------------------------- |
| `npm run sync-aliases`                  | Update all config files from alias.config.mjs | After adding/removing aliases |
| `npm run sync-aliases -- --dry-run`     | Preview changes without writing files         | Before committing changes     |
| `npm run sync-aliases -- --verbose`     | Show detailed debug output                    | Troubleshooting sync issues   |
| `npm test -- --project "project setup"` | Validate alias synchronization                | Before committing code        |

---

## Best Practices

### ✅ Do

- Always edit `alias.config.mjs` first (never edit tsconfig.json or package.json directly for aliases)
- Run `npm run sync-aliases` immediately after modifying aliases
- Run validation tests before pushing to remote
- Use `--dry-run` to preview changes when uncertain
- Preserve the existing alias naming pattern (`#` prefix)

### ❌ Don't

- Manually edit `tsconfig.json` paths or `package.json` imports (use sync script instead)
- Bypass the pre-commit hook unless absolutely necessary
- Add aliases that conflict with existing ones
- Use relative paths in `alias.config.mjs` (use `resolve(cwd, 'path')`)
- Modify adapter code without understanding the interface contract

---

## Workflow Integration

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Validate aliases (in case team updated them)
npm test -- --project "project setup"

# 3. If validation fails, sync
npm run sync-aliases

# 4. Work on your feature...

# 5. Before committing
npm test -- --project "project setup"

# 6. Commit (pre-commit hook validates automatically)
git commit -m "feat: add new feature"
```

### Adding Aliases

```bash
# 1. Edit alias.config.mjs
code alias.config.mjs

# 2. Preview changes
npm run sync-aliases -- --dry-run

# 3. Apply changes
npm run sync-aliases

# 4. Verify
npm test -- --project "project setup"

# 5. Commit together
git add alias.config.mjs tsconfig.json package.json
git commit -m "feat: add #utils alias for utility functions"
```

---

## Advanced Usage

### Running Sync from Node.js

```javascript
import { syncAliases } from './.dev/scripts/sync-aliases.mjs';

const result = await syncAliases({
  dryRun: false,
  verbose: true,
});

if (result.success) {
  console.log('Sync completed successfully');
} else {
  console.error('Sync failed:', result.results);
}
```

### Custom Validation in CI/CD

```yaml
# .github/workflows/validate-aliases.yml
name: Validate Alias Sync
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --project "project setup"
```

---

## Next Steps

- **Understand the architecture**: Read [data-model.md](./data-model.md)
- **Learn the adapter pattern**: Read [adapter-interface.md](./contracts/adapter-interface.md)
- **See all requirements**: Read [spec.md](./spec.md)
- **Review implementation**: Read [plan.md](./plan.md)
- **Explore research decisions**: Read [research.md](./research.md)

---

**Quickstart Version**: 1.0.0
**Last Updated**: 2025-10-31
**Feedback**: Open an issue if this guide is unclear or incomplete
