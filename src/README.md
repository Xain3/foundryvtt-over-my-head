# src Directory

## Purpose

This directory contains the core source code for the "Over My Head" Foundry VTT module. It is structured to organize the module's functionality into logical subdirectories, facilitating maintainability and scalability.

## Structure

- **`main.mjs`**: The entry point of the module, responsible for initializing the `OverMyHead` class and enabling development features.
- **`overMyHead.mjs`**: The central module class that orchestrates startup, configuration, and initialization.
- **`config/`**: Configuration management, including constants parsing from YAML, manifest validation, and global exports.
- **`contexts/`**: Composition-based state management with dot-path access, merging, syncing, and filtering utilities.
- **`handlers/`**: Event handlers extending the base `Handler` class, such as settings and placeable handlers.
- **`helpers/`**: Utility helpers for error formatting, module retrieval, path utilities, and settings management.
- **`utils/`**: Core utilities including logging, initialization, hook formatting, and static proxies.
- **`baseClasses/`**: Base classes like `Handler` for extending functionality.

## Build Process

The source code is bundled using Vite into `dist/main.mjs`, which is referenced in `module.json` for Foundry VTT consumption.

## Conventions

- All files use ES modules syntax.
- Imports leverage configured aliases (e.g., `#config`, `#utils`).
- Follow the project's style guide for naming, documentation, and structure.
