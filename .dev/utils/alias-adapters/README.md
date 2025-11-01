# Alias Adapters

**Purpose**: Modular adapters for reading and writing alias configurations across different file formats

**Contents**:

- `base-adapter.mjs` - Base adapter class with common interface
- `adapter-registry.mjs` - Registry for managing and looking up adapters
- `jsonc-helpers.mjs` - Helper functions for parsing JSONC files
- `normalization-helpers.mjs` - Helper functions for normalizing alias formats
- `tsconfig-adapter.mjs` - TypeScript configuration adapter
- `package-json-adapter.mjs` - Node.js package.json adapter
- `vite-adapter.mjs` - Vite configuration adapter
- `vitest-adapter.mjs` - Vitest configuration adapter

**Key Concepts**:

- **Adapter Pattern**: Each configuration file format has its own adapter class
- **Normalization**: All adapters convert to/from a common interchange format
- **Registry**: Centralized registration and lookup of adapters
- **Format Preservation**: Adapters preserve comments, indentation, and formatting

**Dependencies**:

- Node.js built-in modules (fs, path)
- alias.config.mjs (source of truth)

**Adding New Adapters**:
See [docs/alias-adapter-interface.md](../../../docs/alias-adapter-interface.md) for complete interface documentation.

**Last Updated**: 2025-10-31
**Version**: 12.1.0
