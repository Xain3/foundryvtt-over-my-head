# Utilities

This directory contains utility scripts and helpers used by the build and deployment processes.

## Purpose

The utilities provide common functionality for finding directories, managing modules, resolving references, and formatting/linting code during development.

## Components

- **userDataDirFinder.mjs**: Locates the Foundry VTT user data directory across different operating systems and installation methods.
- **moduleDirManager.mjs**: Manages module directory creation and validation within the Foundry VTT data structure.
- **resolveImageReference.mjs**: Handles resolution and validation of image references for the module.
- **format-wrapper.sh**: Shell wrapper for running code formatting tools.
- **lint-wrapper.sh**: Shell wrapper for running linting tools.

## Key Features

- **Cross-Platform Support**: Directory finding works on Windows, macOS, and Linux.
- **Validation**: Includes validation logic for paths, references, and module structures.
- **Shell Integration**: Wrappers for integrating formatting and linting into the development workflow.

## Usage

These utilities are imported and used by the build and deployment scripts to handle common tasks like directory management and code quality checks.
