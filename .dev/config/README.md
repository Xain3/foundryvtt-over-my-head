# Development Configuration Files

This directory contains YAML and JSON configuration files that control various
aspects of the Foundry VTT Over My Head module's development behavior,
tooling, and maintenance operations.

## Overview

The configuration files in this directory are used by various development
scripts and tools throughout the project to:

- Manage version bumping across multiple file types (package.json,
  module.json, README.md, etc.)

## Structure

### `bump-version.yaml`

**Purpose**: Configures automated version bumping across multiple file types
and formats. **Used by**:
`.dev/scripts/ci/bump-version.mjs` **Key sections**:

- **`filesToBump`**: Defines mandatory and optional files to update during
  version bumps
  - `mandatory`: Files that must exist (e.g., `package.json`)
  - `optional`: Files that are updated if present (e.g., `VERSION`,
    `README.md`, `package-lock.json`)
- **`rules`**: Specific rules for different file types
  - `README.md`: Uses prefix pattern to match version headers (e.g., "# Version: 1.0.0")
  - `.json$`: Updates version keys in JSON files (e.g., package.json, module.json)
  - `.toml$`: Updates version in TOML files with section support
  - `.ini$`: Updates version in INI files
- **`process`**: Custom processing scripts for complex file handling **Example usage**:

```bash
# Bump patch version for all files
node .dev/scripts/ci/bump-version.mjs patch
# Bump specific file only
node .dev/scripts/ci/bump-version.mjs minor --file package.json
# Dry run to see what would change
node .dev/scripts/ci/bump-version.mjs 1.2.3 --dry-run
```

## Usage Examples

### Version Management

```bash
# Update all files to next patch version
npm run release:bump patch
# Update only package.json to version 2.0.0
node .dev/scripts/ci/bump-version.mjs 2.0.0 --file package.json
# Preview changes without applying them
node .dev/scripts/ci/bump-version.mjs minor --dry-run
```

## Customization

### Adding New File Types

To support additional file types in version bumping:

1. Add the file pattern to `filesToBump.optional`
2. Define rules in the `rules` section
3. For complex processing, add entries to `process` Example:

```yaml
filesToBump:
  optional:
    - 'my-config.xml'
rules:
  '.xml$':
    xpath: '//version'
    attribute: 'value'
process:
  'complex-config.xml': '.dev/scripts/ci/custom-xml-processor.mjs'
```

## Best Practices

1. **Test configurations**: Use `--dry-run` options when available
2. **Version control**: Keep configuration changes in separate commits
3. **Documentation**: Update this README when adding new configurations
4. **Validation**: Run validation scripts after configuration changes
5. **Backup**: Create backups before running cleanup operations

## Troubleshooting

### Version Bumping Issues

- **File not found**: Check if file exists in the expected location
- **No version found**: Verify the file format matches the configured rules
- **Custom script fails**: Check script permissions and dependencies

## Differences from src/config

This `.dev/config/` directory contains **development-time configurations** for
tooling and maintenance processes, while `src/config/` contains **runtime
configurations** for the Foundry VTT module itself.

### .dev/config/ (Development Tooling)

- **Purpose**: Controls development workflows, CI/CD pipelines, and maintenance scripts
- **Examples**: Version bumping rules, build configurations, deployment settings
- **Files**: YAML/JSON configs for tools like bump-version, CI scripts, etc.
- **Usage**: Read by development scripts during build, test, and release processes
- **Scope**: Affects how the project is developed and maintained

### src/config/ (Module Runtime)

- **Purpose**: Defines the module's behavior, constants, and manifest at runtime
- **Examples**: Module constants from YAML, validated manifest from module.json
- **Files**: JavaScript modules that parse and provide configuration to the module
- **Usage**: Imported by module code during Foundry VTT execution
- **Scope**: Affects how the Over My Head module functions in Foundry VTT

**Key Distinction**: `.dev/config/` configures the development environment and
processes, while `src/config/` configures the actual module functionality.
