# FoundryVTT OverMyHead Module

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

OverMyHead is a FoundryVTT (Foundry Virtual Tabletop) module that enables overhead tiles to have occlusion mode of "Vision" and "Fade". This is a JavaScript ES module that runs within the FoundryVTT environment and cannot be executed standalone.

## Working Effectively

### Environment Setup and Dependencies
- Ensure Node.js v20+ is available: `node --version` (confirmed: v20.19.4)
- Ensure npm v10+ is available: `npm --version` (confirmed: v10.8.2)
- Install all dependencies: `npm install` -- takes 3-5 seconds on clean install. NEVER CANCEL. Set timeout to 60+ seconds.
  - Expect deprecation warnings for rimraf, glob, eslint, and other packages - these are normal
  - Expect 2 vulnerabilities (1 low, 1 moderate) - run `npm audit fix` if needed
  - Dependencies are lightweight - only testing/linting tools, no runtime dependencies

### Testing and Validation
- **CRITICAL**: This module CANNOT be run standalone with `node src/main.js` - it requires FoundryVTT environment
- Test configuration exists but no actual tests: `npm test` -- fails with "No tests found" message
- Test infrastructure is configured for Jest with Babel transpilation
- Available test commands (all currently non-functional):
  - `npm run test:unit` -- configured for `**/*.unit.test.js` files (none exist)
  - `npm run test:integration` -- configured for `**/*.int.test.js` files (none exist)  
  - `npm run test:functional` -- returns "Functional tests not configured"
  - `npm run test:performance` -- returns "Performance tests not configured"

### Linting
- ESLint v8.57.1 is available but NO configuration file exists
- `npx eslint src/` -- FAILS with "ESLint couldn't find a configuration file"
- To set up ESLint: run `npm init @eslint/config` first, then lint normally
- DO NOT attempt to lint without setting up configuration first

### Module Structure
- Entry point: `src/main.js` (ES module loaded by FoundryVTT)
- Module manifest: `module.json` (FoundryVTT module configuration)
- Babel configuration: `babel.config.js` (transpilation and path aliases)
- Jest configuration: `jest.config.js` (testing setup)
- Path aliases configured in both `babel.config.js` and `jsconfig.json`:
  - `@manifest` maps to `module.json`
  - `@/*` maps to `src/*`
  - Additional aliases for subdirectories in src/

## Validation Requirements

### Manual Testing in FoundryVTT
- **ALWAYS** test changes within a FoundryVTT environment
- Install the module in FoundryVTT using the local development path or by copying files to FoundryVTT's Data/modules directory
- **Complete End-to-End Test Scenario** (ALWAYS perform after changes):
  1. Start FoundryVTT and create/open a world
  2. Enable the OverMyHead module in Module Management
  3. Create a new scene with a basic map
  4. Add an overhead tile (any image) covering part of the map
  5. Select the tile → Configure → Overhead tab
  6. Set Occlusion Mode to "Vision" 
  7. Verify the "Also Fade" checkbox appears (this is the core functionality)
  8. Place a token on the scene  
  9. Test Vision mode: Move token - roof should block line of sight areas
  10. Enable "Also Fade" checkbox and test: Roof should become transparent when token has line of sight
  11. Verify no JavaScript errors in browser console (F12 → Console)

### Development Workflow Validation Steps
- After making changes to `src/main.js`, always:
  1. Copy updated files to FoundryVTT modules directory OR restart FoundryVTT if using symlink
  2. Refresh browser or restart FoundryVTT
  3. Check browser console for JavaScript errors (F12 → Console → check for red errors)
  4. Run the complete end-to-end test scenario above
  5. Test edge cases: overlapping tiles, multiple overhead tiles, different tile sizes

## Important Files and Locations

### Frequently Modified Files
- `src/main.js` -- Main module logic and initialization
- `module.json` -- Module metadata and FoundryVTT configuration
- `babel.config.js` -- If adding new path aliases or build configuration

### Configuration Files
- `jest.config.js` -- Test configuration (coverage thresholds set to 80-90%)
- `jsconfig.json` -- IDE support for path aliases
- `package.json` -- Dependencies and npm scripts

### Missing but Referenced Files
- `styles/foundryvtt-over-my-head.css` -- Referenced in module.json but does not exist
- `lang/en.json` -- Referenced in module.json but does not exist
- Any ESLint configuration file

## Common Tasks

### Adding New Tests
- Create test files with `.unit.test.js` or `.int.test.js` extensions in the `tests/` directory
- Use Jest with ES6 imports: `import { jest } from '@jest/globals';`
- Tests use Jest with Babel transpilation - all path aliases available (e.g., `import manifest from "@manifest"`)
- Coverage thresholds are enforced: 80% branches, 85% functions, 90% lines/statements
- **Example basic test**:
```javascript
import { jest } from '@jest/globals';
import manifest from '@manifest';

test('module manifest loads correctly', () => {
  expect(manifest.name).toBe('foundryvtt-over-my-head');
  expect(manifest.version).toBeDefined();
});
```

### Setting Up Linting
- Run `npm init @eslint/config` to create ESLint configuration
- Interactive setup takes 30+ seconds - respond to prompts:
  - What to lint: JavaScript  
  - How to use: To check syntax and find problems
  - Module type: JavaScript modules (import/export)
  - Framework: None of these
  - TypeScript: No
  - Where code runs: Browser (and Node if desired)
  - Package manager: npm
- After setup, use `npx eslint src/` to lint the source code
- **WARNING**: ESLint 8.x compatibility issues may occur with generated config

### Creating Production Builds
- **No build step required** - FoundryVTT loads ES modules directly
- For distribution: zip the entire repository excluding node_modules, .git, tests, and development files
- Use .gitignore patterns to determine what to include in distributions

### Debugging Module Issues
- **Primary debugging location**: FoundryVTT browser console (F12 → Console tab)
- Common error patterns:
  - `ERR_INVALID_MODULE_SPECIFIER` → Module resolution issue, check path aliases in babel.config.js
  - Module not loading → Check `module.json` syntax and file paths
  - `TypeError: Cannot read property` → FoundryVTT API compatibility issue
  - Silent failures → Check FoundryVTT version compatibility (requires v12+)
- FoundryVTT development tools:
  - Enable Developer Mode in FoundryVTT settings for enhanced debugging
  - Use `game.modules.get("foundryvtt-over-my-head")` in console to inspect module state
  - Check `ui.notifications` for FoundryVTT error messages

### FoundryVTT Development Environment
- **CRITICAL**: Requires FoundryVTT v12+ (module.json specifies minimum: "12", verified: "12")
- Install module by copying entire repository to `[FoundryVTT Data]/modules/foundryvtt-over-my-head/`
- Alternative: Create symlink from FoundryVTT modules directory to development repository
- Module auto-reloads on browser refresh, but FoundryVTT restart may be required for manifest changes
- Test in multiple browsers - FoundryVTT behaves differently in Chrome vs Firefox vs Safari

## Commands That DO NOT Work

- `node src/main.js` -- FAILS: ES module path resolution requires FoundryVTT environment (ERR_INVALID_MODULE_SPECIFIER)
- `npm test` without actual test files -- FAILS: "No tests found" (exits with code 1)
- `npm test` with insufficient coverage -- FAILS: Coverage thresholds not met (exits with code 1)
- `npx eslint src/` -- FAILS: No ESLint configuration file
- Any standalone execution of the module code outside FoundryVTT
- Direct import of `@manifest` alias outside of Babel transpilation context

## Repository Structure
```
.
├── .github/                 # GitHub workflows and configuration
│   └── copilot-instructions.md
├── src/
│   └── main.js             # Main module entry point
├── tests/                  # Test directory (currently empty except README.md)
├── babel.config.js         # Babel transpilation configuration  
├── jest.config.js          # Jest testing configuration
├── jsconfig.json           # JavaScript project configuration
├── module.json             # FoundryVTT module manifest
├── package.json            # npm configuration and scripts
└── README.md               # Module documentation

Missing directories referenced in module.json:
├── styles/                 # CSS files (referenced but missing)
└── lang/                   # Localization files (referenced but missing)
```

## Frequently Used Command Outputs

### Repository Root Structure
```bash
$ ls -la
total 304
drwxr-xr-x   7 runner docker   4096 .
drwxr-xr-x   3 runner docker   4096 ..
drwxr-xr-x   7 runner docker   4096 .git
-rw-r--r--   1 runner docker     16 .gitattributes
-rw-r--r--   1 runner docker     53 .gitignore
-rw-r--r--   1 runner docker    925 README.md
-rw-r--r--   1 runner docker    863 babel.config.js
-rw-r--r--   1 runner docker   1177 jest.config.js
-rw-r--r--   1 runner docker    637 jsconfig.json
-rw-r--r--   1 runner docker   1102 module.json
drwxr-xr-x 308 runner docker  12288 node_modules
-rw-r--r--   1 runner docker 246548 package-lock.json
-rw-r--r--   1 runner docker    807 package.json
drwxr-xr-x   2 runner docker   4096 src
drwxr-xr-x   2 runner docker   4096 tests
```

### Available npm Scripts
```bash
$ npm run
Lifecycle scripts included in undefined:
  test
    jest --coverage
available via `npm run-script`:
  test:unit
    jest --testMatch="**/*.unit.test.js" --coverage
  test:integration
    jest --testMatch="**/*.int.test.js"
  test:functional
    echo 'Functional tests not configured' && exit 0
  test:performance
    echo 'Performance tests not configured' && exit 0
```

### Module Manifest Summary
```json
{
  "name": "foundryvtt-over-my-head",
  "title": "OverMyHead", 
  "version": "12.0.1-alpha1",
  "compatibility": { "minimum": "12", "verified": "12" },
  "esmodules": ["src/main.js"],
  "styles": ["styles/foundryvtt-over-my-head.css"]
}
```

## CRITICAL: Timing and Cancellation Warnings

- **NEVER CANCEL** `npm install` -- takes 3-5 seconds on clean install, set timeout to 60+ seconds for safety
- Jest operations complete in 1-2 seconds when tests exist
- ESLint config setup is interactive - allow 30+ seconds for user input
- FoundryVTT module loading and testing requires manual verification in the game environment
- Build operations are minimal due to ES module structure - no bundling requiredsting requires manual verification in the game environment
- Build operations are minimal due to ES module structure - no bundling requiredequired