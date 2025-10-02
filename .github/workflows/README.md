# GitHub Actions Workflows

This directory contains GitHub Actions workflow files that automate CI/CD processes for the Foundry VTT Over My Head repository.

## Purpose

These workflows ensure code quality, automate testing, and handle deployment processes. They run automatically on various triggers like pull requests, pushes, and releases.

## Workflows

### delete-tests.yml

Cleans up test-related artifacts and environments after CI runs. This helps maintain a clean workspace and prevents accumulation of temporary files.

**Triggers:**

- Manual dispatch
- Scheduled cleanup

**Actions:**

- Removes test artifacts
- Cleans up temporary environments
- Frees up storage space

### run-ci-checks.yml

The main CI workflow that runs comprehensive checks on code changes.

**Triggers:**

- Pull requests (opened, synchronized, reopened)
- Pushes to main branch
- Manual dispatch

**Actions:**

- Installs dependencies
- Runs linting and formatting checks
- Executes unit and integration tests
- Validates build process
- Performs security scans
- Checks code coverage

## Key Features

- **Automated Quality Assurance**: Ensures all code meets quality standards before merging
- **Multi-Platform Testing**: Tests across different environments and Node.js versions
- **Parallel Execution**: Runs checks in parallel for faster feedback
- **Status Reporting**: Provides detailed reports on checks and test results

## Usage

Workflows are automatically triggered by GitHub based on the configured events. You can also manually trigger workflows from the Actions tab in the repository.

For workflow customization or troubleshooting, refer to the individual workflow files and GitHub Actions documentation.
