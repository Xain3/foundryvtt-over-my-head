# Dev Container Configuration

This directory contains configuration files for the VS Code Development Container used in this project.

## Purpose

The dev container provides a consistent, isolated development environment that includes all necessary tools, dependencies, and configurations. This ensures that all developers work in the same environment regardless of their local machine setup.

## Files

- **devcontainer.json**: Main configuration file defining the container image, extensions, settings, and mount points.
- **devcontainer-setup.sh**: Setup script that runs when the container is created, installing additional tools or configurations.
- **.zshrc**: Zsh shell configuration for the development environment.

## Key Features

- **Isolated Environment**: All development happens inside a Docker container.
- **Pre-installed Tools**: Includes Node.js, npm, TypeScript, ESLint, Git, and other development tools.
- **VS Code Integration**: Seamless integration with VS Code for editing, debugging, and terminal access.
- **Consistent Setup**: Ensures all team members have identical development environments.

## Usage

To use the dev container:

1. Open the project in VS Code
2. When prompted, click "Reopen in Container" or use Command Palette: "Dev Containers: Reopen in Container"
3. VS Code will build and start the container, then reopen the project inside it

The container includes Foundry VTT development tools and is configured for the project's specific needs.
