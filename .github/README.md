# GitHub Configuration

This directory contains GitHub-specific configuration files and workflows for the Foundry VTT Over My Head repository.

## Purpose

The `.github` directory houses configurations that integrate with GitHub's features, including automated workflows, dependency management, and AI assistance tools.

## Directory Structure

- **workflows/**: GitHub Actions workflow files for CI/CD automation
- **chatmodes/**: Custom chat modes for GitHub Copilot interactions
- **copilot-instructions.md**: Instructions for GitHub Copilot to understand the project structure and conventions
- **dependabot.yml**: Configuration for automated dependency updates

## Components

### Workflows

- **delete-tests.yml**: Workflow for cleaning up test artifacts or environments
- **run-ci-checks.yml**: Main CI workflow for running tests, linting, and validation on pull requests and pushes

### Chat Modes

- **Commit Writer.chatmode.md**: Custom chat mode for generating commit messages following project conventions

### Configuration Files

- **copilot-instructions.md**: Comprehensive guide for AI coding assistants, including architecture, patterns, and development workflows
- **dependabot.yml**: Automated dependency update configuration with schedules and grouping rules

## Key Features

- **Automated CI/CD**: Workflows ensure code quality and automate testing/deployment
- **AI-Assisted Development**: Copilot instructions and chat modes improve AI coding assistance
- **Dependency Management**: Dependabot keeps dependencies up-to-date and secure
- **Project Consistency**: Standardized commit messages and development practices

## Usage

These configurations are automatically used by GitHub:

- Workflows run on specified triggers (pushes, PRs, releases)
- Copilot uses the instructions for context-aware code suggestions
- Dependabot creates PRs for dependency updates
- Chat modes can be selected in GitHub Copilot Chat for specialized interactions

See individual files for detailed configuration and customization options.
