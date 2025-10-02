# Validation

This directory contains validation utilities and scripts for ensuring the integrity and correctness of the Foundry VTT Over My Head module.

## Purpose

The validation scripts provide checks and validations for various aspects of the module, including paths, references, configurations, and build outputs.

## Components

Validation logic is integrated into various utilities, including:

- Path and directory validation in `moduleDirManager.mjs`
- Image reference validation in `resolveImageReference.mjs`
- Configuration and manifest validation

## Key Features

- **Path Validation**: Ensures correct directory structures and file paths.
- **Reference Validation**: Validates image and asset references.
- **Configuration Checks**: Verifies module configuration and manifest integrity.

## Usage

Validation is performed automatically during build and deployment processes to catch issues early in development.
