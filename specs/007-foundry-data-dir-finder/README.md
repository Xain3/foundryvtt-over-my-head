# Feature 007: Foundry Data Directory Finder

**Status**: ✅ Implemented
**Branch**: `007-foundry-data-dir-finder`
**Created**: 2025-11-13
**Documentation Type**: Retroactive

## Overview

Static utility for finding FoundryVTT data directory across platforms (Linux, macOS, Windows) for development and deployment scripts. This feature provides a cross-platform, zero-configuration way for module developers to locate their Foundry installation during build and deployment workflows.

## Documentation

- **[spec.md](./spec.md)** - Complete feature specification with user stories, requirements, and success criteria
- **[checklists/requirements.md](./checklists/requirements.md)** - Specification quality validation checklist

## Implementation

### Files Created

- `src/utils/static/foundryDataDirFinder.ts` - Main implementation
- `src/utils/static/foundryDataDirFinder-types.ts` - Type definitions
- `tests/unit/foundryDataDirFinder.unit.test.mjs` - Unit tests (14 tests, all passing)
- `docs/examples/foundryDataDirFinder-example.mjs` - Usage examples

### Integration

- Integrated with `src/utils/static.ts` (StaticUtils aggregator)
- Documented in `src/utils/static/README.md`
- Accessible via: `StaticUtils.findFoundryDataDir.find()`

## Key Features

1. **Cross-Platform Detection**: Automatically detects Linux, macOS, and Windows installations
2. **Zero Configuration**: Works out-of-the-box without manual path configuration
3. **Multiple Convenience Methods**:
   - `find()` - Returns detailed result object
   - `findPath()` - Returns path string only
   - `getPaths()` - Returns potential paths without checking
4. **Diagnostic Support**: Verbose logging mode for troubleshooting
5. **Custom Overrides**: Supports manual platform/user specification for testing

## Test Results

```
✓ 14 tests passing
✓ All platforms covered (Linux, macOS, Windows)
✓ Edge cases handled
✓ Type safety verified
```

## Usage Example

```typescript
import StaticUtils from '#/utils/static.ts';

// Find Foundry installation
const result = StaticUtils.findFoundryDataDir.find();
if (result.found) {
  console.log(`Found Foundry at: ${result.path}`);
  // Deploy module to: ${result.path}/Data/modules/my-module
}
```

## Notes

- **Retroactive Documentation**: This specification was created after implementation to document existing functionality
- **Node.js Only**: This utility is designed for development/build scripts, not in-browser FoundryVTT code
- **Standard Paths**: Checks documented standard installation locations per platform
- **Graceful Fallback**: Returns `found: false` rather than throwing errors when Foundry is not found
