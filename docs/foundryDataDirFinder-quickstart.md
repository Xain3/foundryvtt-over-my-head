/\*\*

- @file foundryDataDirFinder-quickstart.md
- @description Quickstart guide for locating FoundryVTT data directories
- @path docs/foundryDataDirFinder-quickstart.md
  \*/

# Foundry Data Directory Finder - Quickstart

**Purpose**: Automatically locate your FoundryVTT data directory across Linux, macOS, and Windows—perfect for build scripts, deployment automation, and development tools.

**Ideal For**: Module developers, CI/CD pipelines, automated deployment scripts, and build tooling.

⚠️ **Note**: This utility is for Node.js environments only (development/build scripts). For browser/FoundryVTT runtime code, use `game.data.path` or `CONFIG.path` APIs instead.

---

## Basic Usage

### Find the FoundryVTT Data Directory

```javascript
import StaticUtils from '#/utils/static.ts';
import { config } from '#/config/config.ts';

// Simple usage - returns a result object
const result = StaticUtils.findFoundryDataDir.find({ config });

if (result.found) {
  console.log(`✓ Found at: ${result.path}`);
  console.log(`  Platform: ${result.platform}`);
} else {
  console.log('✗ Not found. Checked paths:');
  result.checkedPaths.forEach((p) => console.log(`  - ${p}`));
}
```

### Get Just the Path String

```javascript
const path = StaticUtils.findFoundryDataDir.findPath({ config });

if (path) {
  console.log(`Path: ${path}`);
} else {
  console.log('Not found');
}
```

### Get Potential Paths Without Checking

```javascript
// Returns all candidates in precedence order without filesystem access
const paths = StaticUtils.findFoundryDataDir.getPaths({
  config,
  platform: 'linux',
  user: 'developer',
});

console.log(paths);
// Output: ['/explicit/path', '/env/path', '/config/path', '/default/path', ...]
```

---

## Override Precedence

The utility checks candidates in this order (first match wins):

1. **Explicit Path Argument** - `options.path`
2. **Environment Variable** - `FOUNDRY_DATA_DIR` or `OMH_FOUNDRY_DATA_DIR`
3. **Config Environment** - `config.env.OMH_FOUNDRY_DATA_DIR`
4. **Config Constants** - `config.constants.paths.foundryDataDirPath`
5. **Config Defaults** - `config.constants.defaults.paths.foundryDataDirPath`
6. **Platform Defaults** - Built-in standard paths for your OS

### Example: Using Explicit Override

```javascript
// This takes highest priority
const result = StaticUtils.findFoundryDataDir.find({
  config,
  path: '/custom/foundry/data',
});
```

### Example: Using Environment Variable

```bash
export FOUNDRY_DATA_DIR="/home/user/FoundryVTT"
```

```javascript
// Automatically picks up the env var
const result = StaticUtils.findFoundryDataDir.find({ config });
```

---

## Platform-Specific Defaults

Automatically detected based on your OS:

| Platform    | Default Path                                             |
| ----------- | -------------------------------------------------------- |
| **Linux**   | `/home/{user}/.local/share/FoundryVTT` or `~/FoundryVTT` |
| **macOS**   | `/Users/{user}/Library/Application Support/FoundryVTT`   |
| **Windows** | `%LOCALAPPDATA%/FoundryVTT`                              |

### Override Platform Detection

```javascript
// Useful for testing or CI/CD environments
const result = StaticUtils.findFoundryDataDir.find({
  config,
  platform: 'linux', // Force Linux paths
  user: 'testuser', // Force specific user
});
```

---

## Common Use Cases

### 1. Build Script Deployment

```javascript
import StaticUtils from '#/utils/static.ts';
import { config } from '#/config/config.ts';
import { copySync } from 'fs-extra';
import { join } from 'path';

const dataDir = StaticUtils.findFoundryDataDir.findPath({ config });

if (!dataDir) {
  console.error('Could not locate FoundryVTT data directory');
  process.exit(1);
}

const modulePath = join(dataDir, 'Data/modules/my-module');
copySync('./dist', modulePath);
console.log(`✓ Deployed to ${modulePath}`);
```

### 2. Development with Verbose Logging

```javascript
// See detailed search information for debugging
const result = StaticUtils.findFoundryDataDir.find({
  config,
  verbose: true,
});

// Output: [FoundryDataDirFinder] Checking /home/user/.local/share/FoundryVTT...
// Output: [FoundryDataDirFinder] Found! /home/user/.local/share/FoundryVTT
```

### 3. CI/CD Pipeline with Explicit Path

```javascript
// GitHub Actions or similar CI/CD
const ciPath = process.env.FOUNDRY_DATA_DIR_CI;
const result = StaticUtils.findFoundryDataDir.find({
  config,
  path: ciPath, // Takes highest priority
});
```

### 4. Multi-Platform Testing

```javascript
// Test your script on all platforms
const platforms = ['linux', 'darwin', 'win32'];

platforms.forEach((platform) => {
  const paths = StaticUtils.findFoundryDataDir.getPaths({
    config,
    platform,
    user: 'testuser',
  });
  console.log(`${platform}: ${paths.join(', ')}`);
});
```

---

## Return Value Reference

### `FindResult` Object (from `find()`)

```typescript
{
  path: string;           // Full path to data directory, or empty if not found
  found: boolean;         // True if directory exists and is valid
  platform: PlatformType; // Detected or provided platform ('linux' | 'darwin' | 'win32')
  checkedPaths: string[]; // Array of all paths that were evaluated
}
```

### `string` (from `findPath()`)

Returns the path directly, or empty string if not found.

### `string[]` (from `getPaths()`)

Array of potential paths in precedence order.

---

## Result Properties

### `result.path`

The resolved path to the FoundryVTT data directory.

```javascript
if (result.found) {
  console.log(result.path); // e.g., "/home/user/.local/share/FoundryVTT"
}
```

### `result.found`

Boolean indicating whether a valid directory was found.

```javascript
if (!result.found) {
  console.error('FoundryVTT not found. Install it or set FOUNDRY_DATA_DIR.');
}
```

### `result.platform`

The platform used for path detection (useful for diagnostics).

```javascript
console.log(`Detected platform: ${result.platform}`); // "linux", "darwin", or "win32"
```

### `result.checkedPaths`

All paths that were evaluated (useful for debugging why search failed).

```javascript
result.checkedPaths.forEach((path) => {
  console.log(`Checked: ${path}`);
});
```

---

## Troubleshooting

### Utility returns `found: false`

**Issue**: Directory not found at any checked location.

**Solutions**:

1. **Verify Installation**: Confirm FoundryVTT is actually installed on your system.

2. **Enable Verbose Mode**: See which paths were checked and where it failed.

   ```javascript
   const result = StaticUtils.findFoundryDataDir.find({
     config,
     verbose: true,
   });
   ```

3. **Set Environment Variable**: Explicitly point to your Foundry directory.

   ```bash
   export FOUNDRY_DATA_DIR="/path/to/FoundryVTT"
   ```

4. **Use Explicit Path**: Override detection completely.

   ```javascript
   const result = StaticUtils.findFoundryDataDir.find({
     config,
     path: '/path/to/FoundryVTT',
   });
   ```

### Path is checked but directory doesn't exist

**Issue**: Utility found a path candidate but the directory doesn't actually exist there.

**Solution**: The utility verifies directories exist before returning them. If a path is in `checkedPaths` but not `result.path`, it doesn't exist. Check for:

- Typos in environment variables
- Symlinks that may not be resolved
- Permission issues (utility can't read the directory)

### Different results on different machines

**Issue**: Script works on Linux but not Windows.

**Solutions**:

1. **Use Explicit Path for CI/CD**: Don't rely on auto-detection in shared environments.

   ```javascript
   const path = process.env.CI
     ? process.env.FOUNDRY_PATH
     : StaticUtils.findFoundryDataDir.findPath({ config });
   ```

2. **Verify Platform Detection**: Check what platform is being detected.

   ```javascript
   const result = StaticUtils.findFoundryDataDir.find({
     config,
     verbose: true, // Shows detected platform
   });
   ```

3. **Understand Platform Defaults**: Different OSes use different standard locations. See "Platform-Specific Defaults" above.

---

## API Methods Summary

| Method              | Returns      | Use When                                           |
| ------------------- | ------------ | -------------------------------------------------- |
| `find(options)`     | `FindResult` | You need path + metadata (platform, checked paths) |
| `findPath(options)` | `string`     | You only need the path string                      |
| `getPaths(options)` | `string[]`   | You want all candidates in precedence order        |

---

## Configuration Integration

The utility integrates with the config singleton to support overrides at multiple levels:

```javascript
// config.constants.defaults.paths provides fallback paths with templates
config.constants.defaults.paths.foundryDataDirPath;

// config.env provides environment-level overrides
config.env.OMH_FOUNDRY_DATA_DIR;

// config.constants provides application-level configuration
config.constants.paths.foundryDataDirPath;
```

These are automatically evaluated in precedence order—no special configuration needed.

---

## Full Example

```javascript
/**
 * Deploy module to FoundryVTT with automatic path detection
 */
import StaticUtils from '#/utils/static.ts';
import { config } from '#/config/config.ts';
import { copySync, rmSync } from 'fs';
import { join } from 'path';

async function deployModule() {
  // Find Foundry directory
  const result = StaticUtils.findFoundryDataDir.find({
    config,
    verbose: true, // Show search progress
  });

  if (!result.found) {
    console.error('❌ FoundryVTT data directory not found');
    console.error(
      'Set FOUNDRY_DATA_DIR environment variable or install FoundryVTT'
    );
    process.exit(1);
  }

  console.log(`✓ Found FoundryVTT at: ${result.path}`);

  // Build and deploy
  const moduleName = 'my-awesome-module';
  const modulePath = join(result.path, 'Data/modules', moduleName);

  try {
    // Clean previous build
    rmSync(modulePath, { recursive: true, force: true });

    // Copy new build
    copySync('./dist', modulePath);
    console.log(`✓ Deployed to ${modulePath}`);
  } catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

deployModule();
```

---

## Learn More

- **Implementation**: See `src/utils/static/foundryDataDirFinder.ts`
- **Types**: See `src/utils/static/foundryDataDirFinder-types.ts`
- **Tests**: See `tests/unit/foundryDataDirFinder.unit.test.mjs` for comprehensive examples
- **Examples**: See `docs/examples/foundryDataDirFinder-example.mjs`
- **Specification**: See `specs/007-foundry-data-dir-finder/spec.md`

---

**Last Updated**: November 13, 2025
**Module Version**: 12.1.0
