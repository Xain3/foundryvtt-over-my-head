# .dev Directory

This directory contains development scripts and utilities for the Foundry VTT Over My Head module.

## Purpose

The `.dev` folder houses scripts that support the development workflow, including:

- **Build Scripts** (`scripts/build/`): Utilities for building the module bundle using Vite, including module builder and build utilities.
- **Deployment Scripts** (`scripts/deployment/`): Tools for deploying the built module to Foundry VTT's data directory, including the main `buildAndDeploy.mjs` script that handles watch mode, deployment via ModuleDeployer, and cleanup of root artifacts.
- **Utilities** (`scripts/deployment/utilities/`): Helper scripts for finding user data directories, managing module directories, resolving image references, and validation.

## Key Features

- **Automated Deployment**: The deployment scripts automatically locate the Foundry VTT data directory and deploy the module during development.
- **Watch Mode**: Supports continuous building and deployment during development with `npm run dev`.
- **Artifact Management**: Cleans up build artifacts between deployments to maintain a clean workspace.

## Usage

These scripts are typically invoked through npm scripts defined in `package.json`:

- `npm run dev`: Runs the development watch and deploy process
- `npm run build`: Builds the module for production

See the main project README.md for detailed development setup instructions.
