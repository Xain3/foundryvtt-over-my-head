**Version**: 0.1.0

# .dev/config Directory

This directory contains **development-time configuration files** for tooling, CI/CD pipelines, and maintenance scripts used during the development lifecycle of the Foundry VTT Over My Head module.

## Purpose

`.dev/config/` provides centralized configuration management for development processes and tools that support the project's build, testing, deployment, and release workflows. These configurations are consumed by development scripts, automation tools, and CI/CD pipelines.

## Differences from src/config

| Aspect            | `src/config/`                                         | `.dev/config/`                                          |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| **Scope**         | Runtime behavior                                      | Development workflows                                   |
| **When Used**     | During Foundry VTT execution                          | During development, build, and deployment               |
| **Consumer**      | Module code running in Foundry VTT                    | Development scripts and CI tools                        |
| **Content Type**  | JavaScript modules, YAML constants, manifest data     | Configuration files for tooling (YAML, JSON)            |
| **Purpose**       | Defines module functionality, constants, and behavior | Controls build process, versioning, deployment, testing |
| **Example Files** | `config.mjs`, `constants.yaml`, `module.json`         | Version rules, build settings, CI/CD configurations     |
| **Visibility**    | Loaded into Foundry VTT environment                   | Used by development environment only                    |

### src/config/ (Module Runtime)

- **What it does**: Provides configuration for the Foundry VTT Over My Head module itself
- **Used by**: Module code during runtime in Foundry VTT
- **Examples**: Module constants, API endpoints, feature flags, manifest metadata
- **Impact**: Directly affects how the module behaves in the game

### .dev/config/ (Development Tooling)

- **What it does**: Provides configuration for development tools and processes
- **Used by**: npm scripts, CI/CD workflows, build tools, deployment utilities
- **Examples**: Version bumping rules, build parameters, deployment targets, test configurations
- **Impact**: Affects how the project is built, tested, deployed, and maintained

## Typical File Types

Development configurations in this directory typically include:

- **YAML files** (e.g., `bumper.yaml`, `versioning.yaml`): Configuration for version management and release tools
- **JSON files** (e.g., `deployment.json`, `ci.json`): Build and deployment settings
- **Environment configurations**: Settings specific to different environments (dev, staging, production)
- **Tool-specific configs**: Configurations consumed by third-party development tools

## Best Practices

1. **Keep configurations modular**: Each tool or process should have its own configuration file when possible
2. **Document purpose**: Add comments explaining why each configuration value is set
3. **Version control carefully**: Track configuration changes in git to understand evolution of build/deployment processes
4. **Avoid credentials**: Never store secrets or credentials in this directory; use environment variables instead
5. **Reference in scripts**: Document where each configuration file is referenced in the development scripts

## Integration with Development Scripts

Configurations in this directory are typically read by scripts in `.dev/scripts/` during:

- **Build phase**: Controls how Vite bundles the module
- **Test phase**: Specifies which tests to run and coverage thresholds
- **Deployment phase**: Determines where and how the module is deployed
- **CI/CD phase**: Automates testing, versioning, and release processes

---

**Note**: This directory is excluded from production builds and doesn't affect the runtime behavior of the Foundry VTT module. It is purely for development and maintenance purposes.

```

## Changelog

### 0.1.0 (2025-10-20)

- Added version badge to README
- Initial development configuration documentation

## Changelog

### [0.1.0] - 2025-10-20

- Initial release of development configuration structure
- Added centralized configuration management for development workflows
- Implemented configuration files for build, testing, deployment, and CI/CD processes
```
