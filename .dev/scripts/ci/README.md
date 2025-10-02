# CI Scripts

This directory contains Continuous Integration scripts for automated testing, building, and deployment pipelines.

## Purpose

The CI scripts automate the quality assurance and deployment processes for the Foundry VTT Over My Head module. They ensure code quality, run tests, and handle automated releases.

## Existing Scripts

This directory contains the following CI helper scripts:

- **`bump-version.mjs`**: Version bump script for the hybrid release flow. Handles version bumping across multiple files based on `bump-version.yaml` config. Supports patch, minor, major, alpha, beta, and explicit version setting.

- **`check-licenses.mjs`**: Placeholder license compliance gate leveraged by CI workflows. Performs basic license checks including project LICENSE file validation and dependency scanning preparation.

- **`generate-sbom.mjs`**: SBOM (Software Bill of Materials) generation stub with syft integration. Generates security-focused inventory of software components.

- **`verify-version-consistency.mjs`**: Ensures version consistency between VERSION file and package.json. Validates that version numbers are aligned across project files.

Each script includes comprehensive unit tests (`.unit.test.mjs` files) for reliability and maintainability.

## Key Features

- **Automated Testing**: Runs test suites across different environments
- **Code Quality**: Enforces linting, formatting, and style guidelines
- **Version Management**: Automated version bumping and consistency checks
- **License Compliance**: Basic license validation and dependency scanning
- **Security**: SBOM generation for software component inventory
- **Cross-Platform**: Ensures compatibility across supported platforms
- **Release Automation**: Handles versioning, tagging, and publishing

## Usage

CI scripts are executed by continuous integration services (GitHub Actions, etc.) and are triggered by:

- Pull requests
- Pushes to main branch
- Release creation
- Manual triggers

Scripts follow the project's coding standards and integrate with the existing build and deployment tooling.

### Running Scripts

Scripts can be run directly via Node.js:

```bash
# Version bumping
node .dev/scripts/ci/bump-version.mjs patch
node .dev/scripts/ci/bump-version.mjs 1.2.3 --dry-run

# License checking
node .dev/scripts/ci/check-licenses.mjs --verbose

# SBOM generation
node .dev/scripts/ci/generate-sbom.mjs

# Version verification
node .dev/scripts/ci/verify-version-consistency.mjs
```

### Running Tests

Unit tests for CI scripts can be run with:

```bash
npx vitest run .dev/scripts/ci/*.unit.test.mjs
```
