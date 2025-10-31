**Version**: 0.2.0

# Project Setup Tests

This folder contains tests to verify the correct setup and configuration of the Foundry VTT Over My Head project. These tests ensure that the development environment, dependencies, build processes, aliasing, and other project configurations are properly established and functioning as expected.

Running these tests helps confirm that new contributors can set up the project correctly and that the project's infrastructure remains stable across different environments.

## Test Categories

### Alias Synchronization (`alias-sync.setup.test.mjs`)

Validates that all configuration files maintain synchronized alias definitions with `alias.config.mjs` as the single source of truth. This test:

- Compares `tsconfig.json` paths section with `alias.config.mjs`
- Compares `package.json` imports section with `alias.config.mjs`
- Verifies Vite and Vitest configs correctly import from `alias.config.mjs`
- Provides clear error messages with diff output and fix commands when drift is detected

**Running**:

```bash
npm test -- --project "project setup" tests/project-setup-tests/alias-sync.setup.test.mjs
```

## Changelog

### 0.2.0 (2025-10-31)

- Added alias synchronization test documentation
- Added test categories section with running instructions

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial project setup tests directory documentation
