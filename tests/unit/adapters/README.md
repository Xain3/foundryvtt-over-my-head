# Adapter Unit Tests

**Purpose**: Unit tests for alias configuration file adapters

**Contents**:

- `base-adapter.unit.test.mjs` - Tests for BaseConfigAdapter class
- `adapter-registry.unit.test.mjs` - Tests for AdapterRegistry
- `jsonc-helpers.unit.test.mjs` - Tests for JSONC parsing helpers
- `normalization-helpers.unit.test.mjs` - Tests for normalization helpers
- `tsconfig-adapter.unit.test.mjs` - Tests for TsConfigAdapter
- `package-json-adapter.unit.test.mjs` - Tests for PackageJsonAdapter
- `vite-adapter.unit.test.mjs` - Tests for ViteConfigAdapter
- `vitest-adapter.unit.test.mjs` - Tests for VitestConfigAdapter

**Testing Strategy**:

- Mock file system operations using Vitest's vi.mock
- Test normalization logic with various input formats
- Verify format preservation (comments, indentation, EOL)
- Test error handling for malformed files

**Running Tests**:

```bash
# Run all adapter tests
npm test -- --project unit tests/unit/adapters/

# Run specific adapter test
npm test -- --project unit tests/unit/adapters/tsconfig-adapter.unit.test.mjs
```

**Last Updated**: 2025-10-31
**Version**: 12.1.0
