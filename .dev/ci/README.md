**Version**: 0.1.0

# CI Scripts

This directory contains Continuous Integration scripts for automated testing, building, and deployment pipelines.

## Purpose

The CI scripts automate the quality assurance and deployment processes for the Foundry VTT Over My Head module. They ensure code quality, run tests, and handle automated releases.

## Existing Scripts

This directory contains the following CI helper scripts:

-

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

### Running Tests

Unit tests for CI scripts can be run with:

```bash
npx vitest run .dev/scripts/ci/*.unit.test.mjs
```

## Changelog

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial CI scripts directory documentation
