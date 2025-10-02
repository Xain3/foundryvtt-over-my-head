# Development Scripts

This directory contains all development scripts and utilities for the
Foundry VTT Over My Head module.

## Purpose

The scripts directory houses the complete development toolchain, including
build, deployment, testing, utility functions, and validation logic. These
scripts support the entire development lifecycle from building to deploying
the module.

## Directory Structure

- **build/**: Scripts for building the module using Vite, including watch
  mode and custom build actions.
- **deployment/**: Scripts for deploying the built module to Foundry VTT's
  user data directory.
- **testing/**: Scripts for running tests related to build and deployment
  processes.
- **utilities/**: Common utility functions for directory management,
  reference resolution, and code quality tools.
- **validation/**: Validation utilities for ensuring correctness of paths,
  references, and configurations.

## Key Features

- **Integrated Workflow**: Scripts work together to provide a seamless
  development experience.
- **Cross-Platform**: Utilities handle different operating systems and
  Foundry VTT installations.
- **Automated Processes**: Build and deployment are automated for efficient
  development.
- **Quality Assurance**: Testing, validation, and linting tools ensure code
  quality.

## Usage

These scripts are invoked through npm scripts defined in `package.json`:

- `npm run build`: Production build
- `npm run dev`: Development watch mode with automatic deployment
- Code quality tools are integrated into the development workflow

See individual subdirectory READMEs for detailed information about specific components.
