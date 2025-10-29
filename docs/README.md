**Version**: 1.0.0

# Documentation

This folder contains module documentation, including API references, guides, and development standards.

## Contents

### Development Standards

- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)** - Comprehensive style guide derived from the [Constitution](../.specify/memory/constitution.md)
  - File headers and structure requirements
  - JavaScript/TypeScript conventions
  - Naming conventions
  - Documentation standards (JSDoc, inline comments)
  - Code organization and single responsibility
  - Error handling and logging
  - Testing standards
  - FoundryVTT integration guidelines (hooks-only approach)
  - Commit and PR guidelines

- **[STYLE_GUIDE_QUICK_REFERENCE.md](./STYLE_GUIDE_QUICK_REFERENCE.md)** - Quick cheat sheet for quick lookup
  - File header templates
  - Naming conventions table
  - Code style rules
  - Common patterns and examples
  - Quick checklist

### FoundryVTT API Documentation

- `foundry-vtt-api/`: Comprehensive API references and guides for Foundry VTT version 13
  - `foundry-vtt-v13-api-reference.md` - API reference
  - `foundry-vtt-v13-class-hierarchy.md` - Class hierarchy
  - `foundry-vtt-v13-developer-guide.md` - Developer guide
  - `foundry-vtt-v13-quick-reference.md` - Quick reference
  - `README.md` - Overview of Foundry VTT API documentation

## Quick Start for Contributors

1. Read the [STYLE_GUIDE_QUICK_REFERENCE.md](./STYLE_GUIDE_QUICK_REFERENCE.md) (5 min)
2. Keep [STYLE_GUIDE.md](./STYLE_GUIDE.md) handy while coding
3. Reference the [Constitution](../.specify/memory/constitution.md) for architectural decisions
4. Review [Contributing Guidelines](#) before submitting PRs

## Key Principles (from Constitution)

- **Modular Architecture**: Single point of entry for config; composition over inheritance
- **FoundryVTT Integration**: Hooks-only; no monkey-patching
- **Configuration Management**: Centralized, documented, user-configurable
- **Documentation Excellence**: Inline JSDoc, README in every folder, discoverable
- **Quality & Maintainability**: ≥80% test coverage, clean enable/disable, best practices

## Changelog

### 1.0.0 (2025-10-20)

- Added comprehensive STYLE_GUIDE.md with full standards documentation
- Added STYLE_GUIDE_QUICK_REFERENCE.md for quick lookup
- Added this updated README with development standards links
- Established JS file header format: `@file`, `@description`, `@path`

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial documentation structure
