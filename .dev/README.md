**Version**: 0.1.0

# .dev Directory

This directory contains development scripts

## Purpose

The `.dev` folder houses scripts that support the development workflow, including:

- **Build Scripts** (`scripts/build/`): Utilities for building the module bundle using Vite, including module builder and build utilities.
- **Deployment Scripts** (`scripts/deployment/`): Tools for deploying the built module to Foundry VTT's data directory, including the main `buildAndDeploy.mjs` script that handles watch mode, deployment via ModuleDeployer, and cleanup of root artifacts.
- **Testing Scripts** (`scripts/testing/`): Test runner for executing unit, integration, and performance tests using Vitest, with support for coverage reporting and watch mode.
- **CI Scripts** (`scripts/ci/`): Continuous Integration scripts for automated testing, building, and deployment pipelines.
- **Utilities** (`scripts/deployment/utilities/`): Helper scripts for finding user data directories, managing module directories, resolving image references, and validation.

## Key Features

- **Modular Structure**: Organized into subdirectories for build, deployment, testing, CI, and utilities.
- **Cross-Platform Support**: Utilities for handling different operating systems and Foundry VTT installation methods.
- **Automated Workflows**: CI scripts for automated testing, code quality checks, version management, and release processes.
- **Development Efficiency**: Watch modes for build and testing to streamline the development process.

## Usage

These scripts are typically invoked through npm scripts defined in `package.json`:

- `npm run dev`: Runs the development watch and deploy process
- `npm run build`: Builds the module for production

See the main project README.md for detailed development setup instructions.

## Changelog

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial .dev directory documentation
