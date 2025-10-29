# Style Guide Quick Reference

**Handy cheat sheet for Vision with Fade module development.**

---

## File Headers (REQUIRED)

### JavaScript/TypeScript

```javascript
/**
 * @file filename.mjs
 * @description What this file does
 * @path src/path/to/filename.mjs
 */
```

### YAML

```yaml
# @file filename.yaml
# @description What this file does
# @path src/path/to/filename.yaml
```

---

## Naming Conventions

| Type           | Convention                  | Example          |
| -------------- | --------------------------- | ---------------- |
| Class          | PascalCase                  | `ConfigManager`  |
| Function       | camelCase                   | `loadConfig()`   |
| Variable       | camelCase                   | `isReady`        |
| Constant       | SCREAMING_SNAKE_CASE        | `MAX_RETRIES`    |
| Env Variable   | PREFIX_SCREAMING_SNAKE_CASE | `VWF_DEBUG_MODE` |
| Hook           | PascalCase                  | `SettingsReady`  |
| File (JS)      | camelCase.mjs               | `config.mjs`     |
| File (TS)      | camelCase.mts               | `config.ts`     |
| Private member | `_name` or `#name`          | `_internal`      |

---

## Code Style

- **Indentation**: 2 spaces (NO TABS)
- **Quotes**: Double `"string"`
- **Semicolons**: Always required
- **Line length**: Max 120 characters
- **Trailing commas**: Include in multi-line structures
- **Arrow functions**: Prefer for callbacks

```javascript
// Good - flexible parentheses based on readability
const result = array.map((item) => item * 2);
const filtered = array.filter((item) => item > 10);
const config = {
  key1: 'value1',
  key2: 'value2',
};

// Bad
const result = array.map(function (item) {
  return item * 2;
});
const config = {
  key1: 'value1',
  key2: 'value2',
};
```

---

## Documentation (REQUIRED)

### Function

```javascript
/**
 * Loads configuration from a YAML file.
 *
 * @param {string} filePath - Path to the file
 * @param {Object} options - Optional settings
 * @returns {Object} Parsed configuration
 * @throws {Error} If file is malformed
 */
function loadConfig(filePath, options) {}
```

### Class

```javascript
/**
 * Manages module configuration.
 *
 * Loads and merges config from YAML, JSON, and environment variables.
 * The config is frozen after initialization.
 *
 * @class Config
 * @singleton
 */
class Config {}
```

### Inline Comments

```javascript
// Only explain WHY, not WHAT
// We namespace-key the merge to prevent collisions between config files
const merged = mergeNamespaced(files);
```

---

## Error Handling & Logging

### Error Messages

Always include module prefix and context:

```javascript
const MODULE_PREFIX = 'VWF';

throw new Error(
  `[${MODULE_PREFIX}] Failed to load ${filePath}: ${error.message}`
);
```

**Fail-fast**: Throw errors immediately; don't silently degrade.

### Console Logging

Console logging is allowed (ESLint: `no-console: off`). Use appropriately:

```javascript
console.debug(`[VWF] Debug info`);
console.info(`[VWF] Important state`);
console.warn(`[VWF] Warning`);
console.error(`[VWF] Error:`, error);
```

---

## Testing

Test file patterns (per ESLint config):

- `*.test.mjs` - Generic test
- `*.unit.test.mjs` - Unit test
- `*.int.test.mjs` - Integration test
- `*.performance.test.mjs` - Performance test
- `*.smoke.test.mjs` - Smoke test
- `*.setup.test.mjs` - Setup/fixture test

Requirements:

- Coverage: ≥80%
- All public APIs tested
- Test file co-located with source

```javascript
describe('Config', () => {
  it('returns singleton instance', () => {
    expect(Config.getInstance()).toBe(Config.getInstance());
  });
});
```

---

## FoundryVTT Integration

**ONLY use hooks**—no monkey-patching:

```javascript
// Good
Hooks.on('ready', () => {
  console.log('[VWF] Module ready');
});

// Bad
Token.prototype._setOcclusion = function () {
  /* ... */
};
```

---

## Imports Order

```javascript
// 1. Built-in
import * as fs from 'fs';

// 2. External
import * as yaml from 'yaml';

// 3. Local
import { Config } from './config.ts';
```

---

## Quick Checklist

- [ ] File has `@file`, `@description`, `@path` header
- [ ] Functions/classes have JSDoc comments
- [ ] Naming follows conventions
- [ ] 2-space indentation
- [ ] Errors include `[VWF]` prefix
- [ ] No FoundryVTT monkey-patching (hooks only)
- [ ] Tests added for new code
- [ ] Folder README updated if files added

---

**Full Style Guide**: See [STYLE_GUIDE.md](./STYLE_GUIDE.md)
**Constitution**: See [constitution.md](../.specify/memory/constitution.md)
