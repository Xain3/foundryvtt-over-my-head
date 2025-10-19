# Build Scripts

This directory contains scripts and utilities for building the Foundry VTT Over My Head module.

## Purpose

The build scripts handle the compilation and bundling process using Vite, providing both one-time builds and watch mode for development.

## Components

-

## Key Features

- **Watch Mode**: Continuous building during development with automatic rebuilds on file changes.
- **Custom Actions**: Support for pre-build and post-build hooks for integration with deployment or other processes.
- **Artifact Management**: Functions to remove build artifacts to maintain clean workspaces.

## Usage

These scripts are used by the main build process and development workflow. The `ModuleBuilder` class provides a clean API for building the module with various options.
