# Testing Scripts

This directory contains scripts for running tests related to the build and
deployment processes of the Foundry VTT Over My Head module.

## Purpose

The testing scripts provide a centralized way to execute unit, integration,
and performance tests for the development toolchain. This ensures that build
and deployment scripts are thoroughly tested and maintain high quality.

## Directory Structure

- **test-runner.mjs**: Main test runner script that executes tests using
  Vitest, with support for different test types, coverage reporting, and
  watch mode.

## Key Features

- **Comprehensive Testing**: Supports unit, integration, and performance tests.
- **Coverage Reporting**: Generates coverage reports to ensure test completeness.
- **Watch Mode**: Allows continuous testing during development.
- **Flexible Execution**: Run all tests or specific subsets based on needs.

## Usage

Run the test runner from the project root:

```bash
node .dev/scripts/testing/test-runner.mjs [options]
```

### Options

- `--unit`: Run only unit tests
- `--integration`: Run only integration tests
- `--performance`: Run only performance tests
- `--coverage`: Include coverage report
- `--watch`: Run tests in watch mode
- `--help, -h`: Show help message

### Examples

```bash
# Run all tests
node .dev/scripts/testing/test-runner.mjs

# Run unit tests with coverage
node .dev/scripts/testing/test-runner.mjs --unit --coverage

# Run integration tests in watch mode
node .dev/scripts/testing/test-runner.mjs --integration --watch
```

The test runner integrates with the project's Vitest configuration and
respects the test file patterns defined in `vitest.config.mjs`.
