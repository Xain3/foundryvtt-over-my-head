# Deployment Scripts

This directory contains scripts for deploying the built Foundry VTT Over My Head module to the user's Foundry VTT data directory.

## Purpose

The deployment scripts automate the process of copying the built module to the correct location in Foundry VTT's user data directory, making development and testing seamless.

## Components

- **buildAndDeploy.mjs**: Main orchestrator that combines building and deployment. Locates the user data directory, manages module directories, builds the module, and deploys it with cleanup.
- **deployer.mjs**: Handles the actual deployment logic, copying files to the module directory and managing deployment state.

## Key Features

- **Automatic Directory Detection**: Automatically finds the Foundry VTT user data directory across different platforms.
- **Integrated Build and Deploy**: Combines building and deployment in a single process for development workflows.
- **Artifact Cleanup**: Removes build artifacts from the root directory to keep the workspace clean.
- **Watch Mode Support**: Works with build watch mode for continuous deployment during development.

## Usage

The `BuildAndDeploy` class is used by the `npm run dev` command to provide a complete development experience with automatic deployment after each build.
