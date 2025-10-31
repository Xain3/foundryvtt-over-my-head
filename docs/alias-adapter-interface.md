````markdown
# Adapter Interface Contract

**Feature**: 003-alias-centralization
**Date**: 2025-10-31
**Version**: 1.0.0

This document defines the contract (interface) that all configuration file adapters must implement to participate in the alias synchronization system.

---

## Overview

The adapter interface provides a standardized way to read, write, and validate alias configurations across different file formats (JSON, JSONC, JavaScript modules, etc.). Each adapter encapsulates format-specific logic while presenting a uniform API to the sync and validation systems.

For complete details, examples, and testing guidelines, see the full contract at:
`/workspaces/foundryvtt-over-my-head/specs/003-alias-centralization/contracts/adapter-interface.md`

---

## Quick Reference

### Required Methods

1. **`getFormat(): string`** - Returns unique format identifier
2. **`getFilePaths(): string[]`** - Returns array of absolute file paths
3. **`async read(): Promise<NormalizedAliases>`** - Reads and normalizes aliases
4. **`async write(aliases): Promise<void>`** - Writes normalized aliases to file
5. **`async validate(expected): Promise<ValidationResult>`** - Compares current to expected

### Normalized Aliases Format

```javascript
{
  "#/": "./src/",
  "#tests/": "./tests/",
  "#mocks/": "./tests/mocks/"
}
```

### Implementation Checklist

- [ ] Extend `BaseConfigAdapter` class
- [ ] Implement all required methods
- [ ] Preserve file formatting (comments, indentation, EOL)
- [ ] Add comprehensive unit tests (≥80% coverage)
- [ ] Register with `adapterRegistry.register(new MyAdapter())`
- [ ] Update validation tests
- [ ] Document in `.dev/utils/alias-adapters/README.md`

---

**For full documentation, examples, and testing guidelines**, see:
`specs/003-alias-centralization/contracts/adapter-interface.md`

**Contract Version**: 1.0.0
**Last Updated**: 2025-10-31
````
