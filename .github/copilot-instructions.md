# GitHub Copilot Instructions for Over My Head Module

This file guides AI coding agents in contributing to the **Over My Head** FoundryVTT module. Read this before working on features, fixes, or enhancements.

## Quick Context

**Project**: Over My Head - Vision with Fade occlusion mode for FoundryVTT v12+
**Language**: JavaScript/TypeScript (ESM modules, `.mjs`/`.mts` extensions)
**Architecture**: Modular with centralized config singleton; hooks-only FoundryVTT integration
**Key File**: `src/config/config.ts` (singleton aggregating YAML constants, settings, manifest, env vars)
**Style**: 2-space indentation, strict ESLint rules, comprehensive JSDoc, 80%+ test coverage required

## Critical Architecture: The Config Singleton

The module's core is a **frozen, immutable config singleton** at `src/config/config.ts`. Understand this before writing code:

```javascript
// ENTRY POINT - used everywhere
import { config } from '#/config/config.ts';

// Structure
config.module          // From module.json: id, version, title, etc.
config.constants.*     // Namespace-keyed YAML from src/config/constants/
config.settings        // Array of setting definitions from settings.yaml
config.env             // Environment variables with OMH_ prefix
```

**Immutability**: Config is deeply frozen via Proxy. Mutation attempts are logged but fail silently (no errors thrown). If you need runtime changes, create a new object; don't modify config.

**Fail-Fast**: Config throws immediately on parse errors (bad YAML, missing files). This is intentional—catch errors at startup, not runtime.

## File Structure & Headers (Mandatory)

Every `.mjs`, `.mts`, `.yaml` file **must** start with a header comment:

```javascript
/**
 * @file configHelpers.ts
 * @description Helper functions for loading and parsing YAML config files
 * @path src/config/helpers/configHelpers.ts
 */

import { someModule } from './module.ts';
// ... rest of code
```

Further information may be appended to the header as needed.
Shebangs must appear **before** the header comment if present.

**Format**: JSDoc comment with `@file` (exact filename+ext), `@description` (1-2 sentences), `@path` (relative from root).

**Why**: Quickly identifies file purpose when navigating the codebase. Required for all PRs.

## Naming Conventions (Enforce via ESLint)

| Element                  | Format                                 | Example                              |
| ------------------------ | -------------------------------------- | ------------------------------------ |
| Classes                  | PascalCase                             | `ConfigManager`, `OcclusionHandler`  |
| Functions/Methods        | camelCase, verb-first                  | `loadYamlFile()`, `mergeConstants()` |
| Constants (module-level) | SCREAMING_SNAKE_CASE                   | `MODULE_PREFIX = 'OMH'`              |
| Variables                | camelCase                              | `isInitialized`, `debugMode`         |
| Private fields           | `#field` or `_field`                   | `#singleton`, `_cache`               |
| Hook/event names         | PascalCase                             | `SettingsReady`, `ConfigUpdated`     |
| Environment vars         | `OMH_*` prefix in SCREAMING_SNAKE_CASE | `OMH_DEBUG_MODE`, `OMH_MAX_TOKENS`   |

**Module Lifecycle**:

- Entry: `src/main.mjs` (called on module load)
- Initialization: `src/omh.mjs` (creates OMH class instance, loads config, manages lifecycle)

## Testing Structure

Tests are organized by type in `tests/` with this naming pattern:

- **Unit tests**: `*.unit.test.mjs` → Test functions in isolation, mock external deps
- **Integration tests**: `*.int.test.mjs` → Test real project files (YAML, manifest)
- **Performance tests**: `*.performance.test.mjs` → Benchmark critical paths
- **Setup tests**: `*.setup.test.mjs` → Verify project structure, dependencies
- **Smoke tests**: `*.smoke.test.mjs` → Quick sanity checks

**Coverage requirement**: ≥80% of lines and branches. Run:

```bash
npm test -- --coverage
```

**Mock system**: Use `tests/mocks/mockGlobals.mjs` to simulate FoundryVTT globals (game, Hooks, CONFIG, etc.) without a live Foundry instance.

## JSDoc Requirements

Every function, method, and class **must** have JSDoc:

```javascript
/**
 * Loads and parses a YAML configuration file with error handling.
 *
 * @param {string} filePath - Absolute path to the YAML file
 * @param {Object} options - Optional parsing configuration
 * @param {boolean} [options.strict=true] - Throw on parse errors
 * @returns {Object} Parsed YAML content
 * @throws {Error} If file not found or YAML parsing fails
 *
 * @example
 * const constants = loadYamlFile('./config/constants/errors.yaml');
 */
function loadYamlFile(filePath, options = {}) {
  // implementation
}
```

**Required fields**: `@param` (every param), `@returns` or `@throws`, `@example` for public APIs.

**Nice-to-have**: Documentation of public APIs.

**Private/Internal**: private can be less detailed but still needs basic JSDoc.

## FoundryVTT Integration: Hooks-Only

**Non-Negotiable Rule**: Do NOT monkey-patch FoundryVTT. Use hooks exclusively:

```javascript
// GOOD - hook-based
Hooks.on('ready', () => {
  const config = Config.getInstance();
  Hooks.call('OMH.ConfigReady', config);
});

// BAD - monkey-patching (FORBIDDEN)
Token.prototype._setOcclusion = function () {
  /* ... */
}; // NEVER DO THIS
Tile.prototype.customOcclusion = true; // NEVER DO THIS
```

**Pattern**: Emit custom hooks prefixed with module name (`OMH.EventName`). Other modules listen via `Hooks.on()`.

## Error Handling & Logging

Use the centralized logger if available; otherwise, use `console` methods with context.

In the latter case, always include the module prefix `[OMH]` in messages:

```javascript
const MODULE_PREFIX = 'OMH';

try {
  loadConfig();
} catch (error) {
  // GOOD - contextual, prefixed
  throw new Error(
    `[${MODULE_PREFIX}] Failed to load config from ${filePath}: ${error.message}`
  );

  // BAD - generic
  throw new Error('Config load failed');
}
```

**Logging levels**:

```javascript
console.debug(`[${MODULE_PREFIX}] Internal detail`); // Dev info
console.info(`[${MODULE_PREFIX}] Config initialized`); // Important events
console.warn(`[${MODULE_PREFIX}] Missing optional file`); // Recoverable issues
console.error(`[${MODULE_PREFIX}] Fatal error:`, error); // Critical failures
```

**Note**: `console.log()` is allowed (no-console: off in ESLint). Use judiciously for FoundryVTT debugging.

## Folder README Files

Every folder **must** have a `README.md` explaining its purpose, contents, and dependencies:

```markdown
# Config Module

**Purpose**: Centralized, immutable configuration singleton

**Contents**:

- `config.ts` - Main Config class
- `constants/` - YAML constant files (namespace-keyed merge)
- `helpers/` - Helper functions for loading/parsing
- `settings/` - User-adjustable settings definitions

**Dependencies**: YAML parser, module manifest, environment variables

**Last Updated**: YYYY-MM-DD
```

Update README whenever files are added/removed or features are added. This is a **documentation contract**.

## Code Style (Enforced)

- **Indentation**: 2 spaces (not tabs)
- **Quotes**: Double quotes for strings (`"string"`)
- **Semicolons**: Required
- **Line length**: 120 characters max; break long lines
- **Trailing commas**: Include in multi-line objects/arrays
- **Arrow functions**: Prefer for callbacks; parentheses optional for single params but use for clarity

```javascript
// GOOD
const config = {
  key1: 'value1',
  key2: 'value2',
};

const numbers = [1, 2, 3].map((n) => n * 2);

// BAD
const config = {
  key1: 'value1',
  key2: 'value2',
}; // Missing comma

const numbers = [1, 2, 3].map((n) => n * 2); // Inconsistent style
```

Run `npm run lint` to check compliance; most issues auto-fix with `npm run lint -- --fix`.

## Build & Run Commands

```bash
# Run all tests (unit, integration, performance, smoke, setup)
npm test

# Run specific test type
npm test -- --project unit
npm test -- --project integration

# Build for production (outputs to dist/)
npm run build

# Lint (ESLint + Prettier)
npm run lint
npm run format

# Watch mode for development
npm run dev
```

## Common Development Workflows

### Adding a New Constant YAML File

1. Create `src/config/constants/myfile.yaml`
2. Define YAML structure:

   ```yaml
   # @file myfile.yaml
   # @description Brief description
   # @path src/config/constants/myfile.yaml

   myKey: myValue
   nestedKey:
     subKey: subValue
   ```

3. It auto-loads as `config.constants.myfile` (namespace-keyed)
4. Update `src/config/constants/README.md` with description
5. Add unit test in `tests/unit/configHelpers.unit.test.mjs`

### Adding a New Setting

1. Edit `src/config/settings/settings.yaml`
2. Add to the `settingsList` array:
   ```yaml
   settingsList:
     - key: myNewSetting
       name: OMH.settings.myNewSetting.name
       hint: OMH.settings.myNewSetting.hint
       scope: world # or 'user'
       config: true # shows in settings UI
       default: false
       type: Boolean
   ```
3. Access via `config.settings` array in code
4. Register with FoundryVTT's settings system in hooks setup
5. Add i18n keys to `lang/en.json`

### Writing a Feature

1. **Plan**: Document in `specs/00X-feature-name/tasks.md` if part of planned work
2. **Write code**: Follow style guide, add file headers, comprehensive JSDoc
3. **Write tests**: Unit tests for logic, integration tests for FoundryVTT interaction
4. **Verify**: Run `npm test` (80%+ coverage), `npm run lint`, `npm run build` (no errors)
5. **Document**: Update folder README if adding files or changing features; inline comments for complex logic
6. **Commit**: Use conventional format (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`)

## Key Imports (Module Aliases)

Configured in `alias.config.mjs`, use these in imports:

```javascript
// Root-relative imports (recommended)
import { config } from '#/config/config.ts';
import { loadYamlFile } from '#/config/helpers/configHelpers.ts';
import { MockActor } from '#tests/mocks/MockActor.mjs';

// Or relative
import { config } from '../../config/config.ts'; // More brittle
```

## Commit Message Format

```
<type>: <short description>

<optional detailed explanation>

Fixes #<issue-number>
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `style`, `chore`

Example:

```
feat: add immutability via Proxy wrapper for config singleton

Prevents accidental mutations of frozen config. Mutation attempts
are logged with context but fail silently (no TypeErrors).

Fixes #42
```

## Debugging Tips

- **Config initialization fails?** Check YAML syntax in `src/config/constants/*.yaml` and `module.json` validity
- **Settings not showing?** Verify `settings.yaml` structure (must have `settingsList` key) and i18n keys in `lang/en.json`
- **Tests fail?** Ensure `MockGlobals` is initialized in `beforeAll()` and reset in `beforeEach()`
- **Build errors?** Run `npm run lint -- --fix` first; check TypeScript errors with `tsc --noEmit`
- **FoundryVTT integration failing?** Verify `Hooks.on('ready', ...)` is called; check browser console in Foundry

## Constitution Alignment

This codebase follows 5 core principles (see `/.specify/memory/constitution.md`):

1. **Modular Architecture**: Single config entry point; composition over inheritance
2. **FoundryVTT Integration**: Hooks-only; no monkey-patching
3. **Configuration Management**: Centralized, immutable, user-configurable
4. **Documentation Excellence**: JSDoc everywhere; README in every folder; inline comments for non-obvious logic
5. **Quality & Maintainability**: 80%+ test coverage; clean enable/disable; performance targets

Ensure new code adheres to these principles.

## PR Checklist

Before submitting a pull request:

- [ ] All files have `@file`, `@description`, `@path` headers
- [ ] All functions/classes have JSDoc with `@param`, `@returns`, `@throws`
- [ ] Naming follows conventions (PascalCase, camelCase, SCREAMING_SNAKE_CASE)
- [ ] Tests added/updated; coverage ≥80%
- [ ] No FoundryVTT monkey-patching; hooks-only integration
- [ ] Error messages include `[OMH]` prefix
- [ ] Folder READMEs updated if files added/removed
- [ ] `npm test` passes (all test types)
- [ ] `npm run lint` passes (no warnings)
- [ ] `npm run build` succeeds (no TypeScript errors)
- [ ] Commit messages follow format (`feat:`, `fix:`, etc.)

---

**Last Updated**: October 30, 2025
**Module Version**: 12.1.0
**Document Version**: 0.1.0
**Reference**: See [docs/STYLE_GUIDE.md](../docs/STYLE_GUIDE.md), [Constitution](../.specify/memory/constitution.md)

## Active Technologies
- JavaScript/Node.js (ES2022, ESM modules with .mjs/.mts extensions) (003-alias-centralization)
- File system - reading/writing JSON and JavaScript configuration files (tsconfig.json, package.json, alias.config.mjs, vite.config.mjs, vitest.config.mjs) (003-alias-centralization)

## Recent Changes
- 003-alias-centralization: Added JavaScript/Node.js (ES2022, ESM modules with .mjs/.mts extensions)
