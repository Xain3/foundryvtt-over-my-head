# Feature Specification: Foundry Data Directory Finder

**Feature Branch**: `007-foundry-data-dir-finder`
**Created**: 2025-11-13
**Status**: Implemented (Retroactive Documentation)
**Input**: User description: "Static utility for finding FoundryVTT data directory across platforms (Linux, macOS, Windows) for development and deployment scripts"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Locate Foundry Installation for Deployment (Priority: P1)

A module developer runs a build script that needs to deploy the compiled module to the FoundryVTT installation on their local development machine. The script needs to automatically find the Foundry data directory without requiring manual configuration.

**Why this priority**: This is the core use case that directly supports the development workflow. Without this capability, developers must manually configure paths, which is error-prone and not portable across different machines or platforms.

**Independent Test**: Can be fully tested by running the finder utility on a machine with FoundryVTT installed and verifying it returns the correct data directory path. Delivers immediate value by eliminating manual path configuration.

**Acceptance Scenarios**:

1. **Given** FoundryVTT is installed in the standard location on Linux, **When** the finder utility runs, **Then** it returns the path `/home/{user}/.local/share/FoundryVTT`
2. **Given** FoundryVTT is installed in the standard location on macOS, **When** the finder utility runs, **Then** it returns the path `/Users/{user}/Library/Application Support/FoundryVTT`
3. **Given** FoundryVTT is installed in the standard location on Windows, **When** the finder utility runs, **Then** it returns the path `%LOCALAPPDATA%/FoundryVTT`
4. **Given** an explicit path argument is supplied, **When** the finder utility runs, **Then** it resolves immediately with that path and marks lower-priority sources as unused
5. **Given** FoundryVTT is not installed, **When** the finder utility runs, **Then** it returns an empty result with `found: false`

---

### User Story 2 - Cross-Platform Development (Priority: P2)

A module maintainer works on multiple operating systems (Linux workstation, macOS laptop, Windows test machine). They want their build scripts to work seamlessly across all platforms without platform-specific configuration files.

**Why this priority**: Supports professional development workflows where developers use multiple machines. Improves portability and reduces friction when switching between development environments.

**Independent Test**: Can be tested by running the same build script on Linux, macOS, and Windows machines and verifying it correctly locates Foundry on each platform without configuration changes.

**Acceptance Scenarios**:

1. **Given** the same build script runs on Linux and macOS, **When** the finder executes, **Then** it automatically detects the platform and checks platform-appropriate paths
2. **Given** a developer specifies a custom platform, **When** the finder runs with platform override, **Then** it searches only the paths for that specific platform
3. **Given** non-standard installation paths exist on Linux, **When** the finder runs, **Then** it checks multiple common locations (`~/.local/share/FoundryVTT`, `~/FoundryVTT`, `/local/FoundryVTT`)

---

### User Story 3 - Hierarchical Overrides & Diagnostics (Priority: P3)

A developer troubleshoots why their deployment script cannot find the FoundryVTT installation or needs to understand how overrides were applied. They need detailed information about which sources were evaluated, the precedence order, and why the search succeeded or failed.

**Why this priority**: Enhances debugging and troubleshooting capabilities. While not critical for basic operation, it significantly improves developer experience when issues occur.

**Independent Test**: Can be tested by running the finder with verbose mode enabled and verifying that detailed search information is logged, including all checked paths and the search outcome.

**Acceptance Scenarios**:

1. **Given** verbose mode is enabled, **When** the finder executes, **Then** it logs each override source and candidate path as it's evaluated
2. **Given** both an explicit path and environment overrides exist, **When** the finder executes, **Then** it returns the explicit path and reports that lower-priority candidates were skipped
3. **Given** no installation is found and verbose mode is enabled, **When** the finder completes, **Then** it reports all sources that were evaluated along with their candidate paths and confirms none were valid
4. **Given** an installation is found via configuration overrides with verbose mode, **When** the finder completes, **Then** it logs the configuration source, selected path, and confirms it's a valid directory

---

### User Story 4 - Custom Installation Paths (Priority: P3)

A developer or CI/CD system has FoundryVTT installed in a non-standard location or needs to test against multiple Foundry installations. They want to override the automatic detection with custom parameters.

**Why this priority**: Supports advanced use cases and CI/CD environments where Foundry might be installed in custom locations. Provides flexibility for complex development setups.

**Independent Test**: Can be tested by passing custom user/platform parameters and verifying the finder uses those values instead of auto-detection.

**Acceptance Scenarios**:

1. **Given** a custom username is provided, **When** the finder runs, **Then** it constructs paths using the provided username instead of detecting it
2. **Given** a custom platform is specified, **When** the finder runs, **Then** it only checks paths for that platform regardless of the actual OS
3. **Given** the finder needs to return potential paths without checking existence, **When** `getPaths()` is called, **Then** it returns all override candidates in precedence order followed by platform-appropriate defaults without filesystem access

---

### Edge Cases

- What happens when the FoundryVTT directory exists but is not readable due to permissions?
- How does the system handle paths that exist but are files instead of directories?
- What happens when environment variables (like `LOCALAPPDATA` on Windows) are not set?
- How does the finder behave in containerized or sandboxed environments without filesystem access?
- What happens when multiple potential paths exist (e.g., both `~/.local/share/FoundryVTT` and `~/FoundryVTT`)?
- How does the system respond when an explicit override path is provided but cannot be accessed or does not exist?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST detect the current platform (Linux, macOS, Windows) automatically without manual configuration
- **FR-002**: System MUST check platform-specific standard installation paths for FoundryVTT
- **FR-003**: System MUST return a result object indicating whether a valid directory was found
- **FR-004**: System MUST support manual override of platform and username parameters for testing and CI/CD scenarios
- **FR-005**: System MUST provide verbose logging option for debugging and troubleshooting
- **FR-006**: System MUST check multiple common installation locations per platform in priority order
- **FR-007**: System MUST verify that found paths are actual directories (not files)
- **FR-008**: System MUST work in Node.js environments (development/build scripts)
- **FR-009**: System MUST provide three convenience methods: full result object, path string only, and potential paths without checking
- **FR-010**: System MUST handle missing environment variables gracefully (e.g., LOCALAPPDATA on Windows)
- **FR-011**: System MUST return all checked paths in the result for diagnostic purposes
- **FR-012**: System MUST integrate with the existing StaticUtils aggregator class
- **FR-013**: System MUST include comprehensive type definitions separate from implementation
- **FR-014**: System MUST be stateless and not require instantiation
- **FR-015**: System MUST accept an explicit path override argument that supersedes all other detection strategies
- **FR-016**: System MUST evaluate direct environment variables (e.g., `FOUNDRY_DATA_PATH`) before configuration-driven overrides
- **FR-017**: System MUST support configuration-based overrides via both `config.env` and `config.constants` when a config singleton is provided
- **FR-018**: System MUST return candidate paths in deterministic precedence order without duplicates when using `getPaths()`

### Key Entities _(include if feature involves data)_

- **FindResult**: Result object containing the found path (or empty string), found status boolean, detected platform, and list of all checked paths
- **FinderOptions**: Configuration object allowing optional overrides for platform, username, and verbose logging
- **PlatformType**: Union type representing supported platforms (linux, darwin, win32)
- **ConfigSingleton**: Optional immutable configuration source supplying `env` and `constants` overrides consumed by the finder

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developer can locate Foundry installation without manual configuration in under 100ms
- **SC-002**: Utility correctly identifies standard Foundry installations on 100% of tested platforms (Linux, macOS, Windows)
- **SC-003**: Build scripts using the utility work across all three supported platforms without modification
- **SC-004**: When Foundry is not installed, the utility returns clear negative result (found: false) without throwing errors
- **SC-005**: Verbose logging provides sufficient information to diagnose 100% of path detection failures
- **SC-006**: Utility handles all documented edge cases gracefully without crashing
- **SC-007**: All three convenience methods (find, findPath, getPaths) provide appropriate level of detail for their use case
- **SC-008**: Integration tests verify correct behavior on each supported platform
- **SC-009**: Unit test coverage reaches at least 80% for all implementation code
- **SC-010**: Documentation clearly explains Node.js-only limitation and when NOT to use the utility
- **SC-011**: Automated tests validate override precedence order (argument → environment → config env → config constants → defaults)
- **SC-012**: Finder resolves override-sourced paths in under 50ms on reference hardware during performance tests

## Assumptions

1. **Standard Installation Paths**: Assumes FoundryVTT users install in documented standard locations for their platform
2. **Node.js Environment**: Utility is designed for development/build scripts only, not in-browser FoundryVTT runtime
3. **Filesystem Access**: Assumes the Node.js process has read permissions to check standard installation directories
4. **Environment Variables**: On Windows, assumes `LOCALAPPDATA` environment variable is available (standard in Windows)
5. **User Detection**: Assumes `os.userInfo()` or fallback environment variables (`USER`, `USERNAME`) are available
6. **Priority Order**: Returns the first valid path following the documented precedence (explicit argument → environment → config env → config constants → platform defaults)
7. **Config Availability**: Assumes consumers that need configuration-driven overrides provide the config singleton; utility operates without it by falling back to other sources

## Out of Scope

- **Browser Environment Support**: This utility is explicitly NOT designed for browser/FoundryVTT runtime use
- **Custom Installation Detection**: Does not scan entire filesystem to find non-standard installations
- **Installation Validation**: Does not verify the directory contains a valid FoundryVTT installation (only checks directory existence)
- **Multi-Version Support**: Does not handle scenarios where multiple FoundryVTT versions are installed
- **Configuration Persistence**: Does not save or cache found paths for future use
- **GUI Integration**: No graphical interface for path selection or configuration
- **Network Paths**: Does not support network-mounted or remote FoundryVTT installations

## Dependencies

- **Node.js**: Requires Node.js environment with `fs`, `os`, and `path` modules
- **StaticUtils Class**: Integrates with existing static utilities aggregator
- **Type System**: Requires TypeScript type definitions for type safety
- **Testing Framework**: Requires Vitest for unit and integration testing

## Risks & Mitigations

| Risk                            | Impact                             | Mitigation                                                       |
| ------------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| Non-standard installation paths | Utility fails to find Foundry      | Support custom path overrides; document standard paths           |
| Permission issues               | Cannot read installation directory | Graceful error handling; return found: false instead of throwing |
| Platform detection failure      | Incorrect paths checked            | Fallback to Linux defaults; allow manual platform override       |
| Environment variable missing    | Cannot construct paths (Windows)   | Check for variable existence; return empty result gracefully     |
| Multiple installations          | Wrong installation selected        | Use documented priority order; allow manual override if needed   |
