# Config System

This directory contains the complete configuration management system for the Foundry VTT module. The system provides centralized configuration management through a unified Config class, YAML-based configuration files, and comprehensive validation for module manifests.

## 📁 Directory Structure

```text
src/config/
├── config.mjs                # Central configuration class - unified access point
└── helpers/                  # Helper classes and utilities
    ├── constantsBuilder.mjs   # Core builder for constants management
    ├── constantsGetter.mjs    # File reading utilities for YAML files
    ├── constantsParser.mjs    # YAML parsing with advanced features
    ├── manifestParser.mjs     # Manifest validation and processing
    ├── README.md            # Detailed helper documentation
    └── *.unit.test.mjs       # Comprehensive test suites for each helper
```

## 🎯 System Overview

The config system is built around a centralized architecture that provides unified access to all configuration data:

1. **Configuration Source**: Configuration files (primarily `constants.yaml` and `module.json`)
2. **Environment Loading**: Environment-specific overrides and merging
3. **Parsing Engine**: YAML processing with advanced features
4. **Core Builder**: Main orchestration and caching for constants management
5. **Validation Layer**: Manifest validation and immutability
6. **Module APIs**: Specialized exports for different needs
7. **Unified Interface**: Central access point for all configuration (`config.mjs`)
8. **Singleton Pattern**: Pre-instantiated config object for consistent access

## Differences from .dev/config

This `src/config/` directory contains **runtime configurations** for the Foundry VTT Over My Head module itself,
while `.dev/config/` contains **development-time configurations** for tooling and maintenance processes.

### src/config/ (Module Runtime)

- **Purpose**: Defines the module's behavior, constants, and manifest at runtime
- **Examples**: Module constants from YAML, validated manifest from module.json
- **Files**: JavaScript modules that parse and provide configuration to the module
- **Usage**: Imported by module code during Foundry VTT execution
- **Scope**: Affects how the Over My Head module functions in Foundry VTT

### .dev/config/ (Development Tooling)

- **Purpose**: Controls development workflows, CI/CD pipelines, and maintenance scripts
- **Examples**: Version bumping rules, build configurations, deployment settings
- **Files**: YAML/JSON configs for tools like bump-version, CI scripts, etc.
- **Usage**: Read by development scripts during build, test, and release processes
- **Scope**: Affects how the project is developed and maintained

**Key Distinction**: `src/config/` configures the actual module functionality, while `.dev/config/` configures the development environment and processes.

## 📚 Core Modules

## 🔧 Helper System

The `helpers/` directory contains specialized classes that power the config system. Each helper has a specific responsibility and can be used independently or together.

### Quick Helper Reference

| Helper     | Purpose                   | Key Methods                |
| ---------- | ------------------------- | -------------------------- |
| `Helper 1` | Helps doing something     | `.doSomething()`           |
| `Helper 2` | Assists with another task | `.assistWithAnotherTask()` |

For detailed helper documentation, see [`helpers/README.md`](helpers/README.md).

## ⚙️ Configuration Structure

The system aggregates configuration from sources in `src/config/`. The YAML structure supports:

## 📋 Best Practices

### Configuration Access

1. **Use Config Instance**: Always use the config instance for new code - `import config from './config/config.mjs'`
2. **Single Import Pattern**: Use one import for all configuration needs throughout your modules
3. **Consistent Access Pattern**: Use `config.x` and `config.x` throughout
4. **Avoid Direct Imports**: Avoid importing constants.mjs and manifest.mjs directly in new code
5. **Global Export**: Use `config.exportConstants()` early in module initialization for external access

### Global Constants Export

1. **Early Export**: Call `config.exportConstants()` during module initialization (Hooks.once('init'))
2. **Single Call**: Only call exportConstants once per session - method handles duplicate calls safely
3. **External Access**: Use for making constants available to external modules or debugging
4. **Safe Usage**: Method prevents overwriting existing global constants

### Performance Optimization

1. **Singleton Pattern**: The config instance is created once and reused across the entire module
2. **Cache Frequently Used Values**: Store frequently accessed values in local variables
3. **Avoid Deep Access**: Destructure nested values for repeated use
4. **Monitor Memory**: Be aware that frozen objects persist in memory

### Development Workflow

1. **Test Configuration**: Validate YAML changes with tests before deployment
2. **Version Control**: Track changes to `constants.yaml` carefully
3. **Documentation**: Update documentation when adding new configuration sections
4. **Migration**: Use config instance for all new code, migrate existing code gradually

### Error Handling

1. **Early Initialization**: Import config early to catch configuration errors
2. **Graceful Degradation**: Handle configuration errors appropriately for your use case
3. **Meaningful Messages**: Use the built-in error messages for debugging
4. **Testing**: Test error scenarios with invalid configurations

---

For detailed information about the helper classes and their APIs, see the [Helper Documentation](helpers/README.md).
