# Feature Specification: Alias Configuration Centralization

**Feature Branch**: `003-alias-centralization`
**Created**: 2025-10-31
**Status**: Draft
**Input**: User description: "Centralize alias configuration with validation and sync tooling - aliasing is currently defined in several places (and could be defined in even more if I hadn't already done a centralisation with alias.config.mjs). For example, at the moment both tsconfig.json and package.json set import aliases. I want to use alias.config.mjs as a single source of truth, and create a tests that checks that all other aliases align correctly (each with the idiosyncratic syntax of each file). I might also want a dev script (in .dev/scripts) to quickly update the other files when alias.config.mjs is updated (might also be set up as a vscode task or a husky pre-commit command)."

## Clarifications

### Session 2025-10-31

- Q: Should the pre-commit hook automatically synchronize configuration files, or should it only validate and block commits with clear instructions? → A: Validate-only: Hook validates synchronization and blocks commit with instructions to run sync script if misaligned
- Q: How should the sync script handle conflicts when a configuration file has been manually edited with unsaved changes? → A: Detect and warn: Check file modification times or detect conflicts, skip the file with a warning message
- Q: What specific guidance should validation failure messages provide to developers? → A: Diff plus command: Show diff of expected vs actual, affected file paths, and the exact sync script command to run
- Q: Should the sync script support a dry-run mode that previews changes without applying them? → A: Yes, support dry-run mode
- Q: What level of logging should the validation tests and sync script provide? → A: Standard: Output progress, warnings, errors with details, and summary; support optional verbose flag for detailed debug info

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Automated Alias Validation (Priority: P1)

As a developer, when I run the test suite, the system validates that all alias configurations across different tooling files (tsconfig.json, package.json, vite.config.mjs, vitest.config.mjs) are synchronized with the single source of truth (alias.config.mjs). If any file has misaligned aliases, the test fails with a unified diff showing what needs to be corrected (expected vs. actual configuration).

**Why this priority**: This is the core value proposition - preventing configuration drift and catching errors early in the development workflow. Without this validation, the entire centralization effort is undermined.

**Independent Test**: Can be fully tested by intentionally modifying an alias in one file (e.g., tsconfig.json) and verifying the test suite catches the mismatch and reports it clearly.

**Acceptance Scenarios**:

1. **Given** all alias configurations are synchronized, **When** the test suite runs, **Then** all alias validation tests pass
2. **Given** tsconfig.json has a misaligned alias path, **When** the alias validation test runs, **Then** the test fails with a unified diff (expected vs. actual), the affected file path, and the exact command to run the sync script
3. **Given** vite.config.mjs or vitest.config.mjs has incorrect aliasEntries import, **When** the validation test runs, **Then** the test fails indicating which import is incorrect
4. **Given** package.json imports section is missing an alias, **When** the alias validation test runs, **Then** the test fails indicating which alias is missing
5. **Given** a new alias is added to alias.config.mjs, **When** the alias validation test runs without updating other files, **Then** the test fails indicating the new alias is not propagated

---

### User Story 2 - Automated Alias Synchronization Script (Priority: P2)

As a developer, when I modify alias.config.mjs (add, remove, or change an alias), I can run a script that automatically updates all dependent configuration files (tsconfig.json, package.json, etc.) with the correct syntax for each file type. The script reports which files were updated and what changes were made.

**Why this priority**: This provides convenience and reduces manual work, but the validation (P1) is more critical since it catches errors regardless of how they occur.

**Independent Test**: Can be fully tested by adding a new alias to alias.config.mjs, running the sync script, and verifying all configuration files are updated correctly with proper syntax for each file format.

**Acceptance Scenarios**:

1. **Given** a new alias is added to alias.config.mjs, **When** the sync script runs, **Then** tsconfig.json, package.json, and any other relevant files are updated with the new alias in their respective syntax formats
2. **Given** an alias is removed from alias.config.mjs, **When** the sync script runs, **Then** all configuration files have that alias removed
3. **Given** an alias path is modified in alias.config.mjs, **When** the sync script runs, **Then** all configuration files reflect the updated path
4. **Given** all files are already synchronized, **When** the sync script runs, **Then** no files are modified and the script reports "All aliases already synchronized"
5. **Given** the sync script is run with dry-run flag, **When** changes would be made, **Then** the script displays what would change without modifying any files
6. **Given** the sync script completes successfully, **When** the validation test runs, **Then** all tests pass

---

### User Story 3 - Pre-Commit Hook Integration (Priority: P3)

As a developer, when I attempt to commit changes that include modifications to alias.config.mjs, a pre-commit hook automatically runs the sync script and/or validation test to ensure all configuration files remain synchronized. If validation fails, the commit is blocked with instructions on how to fix the issue.

**Why this priority**: This provides an additional safety net, but is lower priority than the core validation and sync functionality. Developers can manually run tests before committing.

**Independent Test**: Can be fully tested by modifying alias.config.mjs, attempting to commit without running the sync script, and verifying the pre-commit hook either auto-syncs or blocks the commit with helpful guidance.

**Acceptance Scenarios**:

1. **Given** alias.config.mjs has been modified, **When** a commit is attempted, **Then** the pre-commit hook validates alias synchronization
2. **Given** alias synchronization validation fails, **When** a commit is attempted, **Then** the commit is blocked with a clear error message and instructions to run the sync script manually
3. **Given** all aliases are synchronized, **When** a commit is attempted, **Then** the commit proceeds normally without modification

---

### User Story 4 - VS Code Task Integration (Priority: P3)

As a developer using VS Code, I can run a task from the command palette (Ctrl+Shift+P → Tasks: Run Task → "Sync Aliases") that executes the alias synchronization script and displays results in the terminal panel.

**Why this priority**: This provides IDE convenience but doesn't add core functionality beyond the sync script (P2). Nice-to-have for workflow optimization.

**Independent Test**: Can be fully tested by opening VS Code, running the "Sync Aliases" task from the task runner, and verifying it executes the sync script and displays output correctly.

**Acceptance Scenarios**:

1. **Given** VS Code is open with the project, **When** the "Sync Aliases" task is run from the command palette, **Then** the sync script executes and output is displayed in the terminal panel
2. **Given** the sync script makes changes, **When** the task completes, **Then** VS Code prompts to reload or shows which files were modified
3. **Given** the sync script finds no changes needed, **When** the task completes, **Then** a success message is displayed indicating all aliases are synchronized

---

### User Story 5 - Extensibility for New Configuration File Types (Priority: P2)

As a developer, when the project adopts a new build tool or framework that requires alias configuration (e.g., webpack, esbuild, rollup), I can easily add support for that configuration file type by following clear extension guidelines. The validation and sync systems recognize and process the new file type without requiring substantial refactoring.

**Why this priority**: This ensures the system remains valuable as the project evolves and new tooling is adopted. While not immediately needed, ease of extensibility is critical for long-term maintainability.

**Independent Test**: Can be fully tested by creating documentation for adding a new adapter, then following that documentation to add support for a hypothetical configuration file format and verifying validation/sync work correctly.

**Acceptance Scenarios**:

1. **Given** a new configuration file type is needed, **When** a developer follows the extension documentation, **Then** they can add support for the new file type in under 30 minutes
2. **Given** a new file adapter is added, **When** validation tests run, **Then** the new file type is included in validation checks
3. **Given** a new file adapter is added, **When** the sync script runs, **Then** the new file type is updated along with existing files
4. **Given** documentation for extension exists, **When** a developer reviews it, **Then** they understand what interfaces to implement and where to register the new adapter
5. **Given** the system architecture uses adapters, **When** a new file type is added, **Then** no changes are required to the core validation or sync logic

---

### Edge Cases

- What happens when alias.config.mjs has invalid syntax or cannot be parsed?
- What happens when a configuration file (e.g., tsconfig.json) has custom comments or formatting that should be preserved?
- What happens when a configuration file is missing entirely (e.g., no tsconfig.json in the project)?
- What happens when alias.config.mjs defines an alias pattern that cannot be represented in one of the target file formats?
- What happens when multiple aliases map to the same directory with different path syntax (e.g., trailing slash vs. no trailing slash)?
- What happens when the sync script is run while a configuration file is open in an editor with unsaved changes? → The sync script detects potential conflicts (by checking file modification timestamps for changes within last 10 seconds), skips the file with a clear warning message (including file path and timestamp), and continues processing other files
- What happens when running tests in CI/CD environments where files may be read-only?
- What happens when a new configuration file type is added but lacks proper adapter registration?
- What happens when two adapters claim to handle the same configuration file?
- What happens when an adapter throws an error during validation or sync operations?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST parse alias.config.mjs and extract all alias definitions (find/replacement pairs)
- **FR-002**: System MUST validate that tsconfig.json paths section matches all aliases from alias.config.mjs in TypeScript path mapping syntax
- **FR-003**: System MUST validate that package.json imports section matches all aliases from alias.config.mjs in Node.js subpath imports syntax
- **FR-004**: System MUST validate that vite.config.mjs correctly imports and uses aliasEntries from alias.config.mjs (parsing import statement and verifying alias consistency)
- **FR-005**: System MUST validate that vitest.config.mjs correctly imports and uses aliasEntries from alias.config.mjs (parsing import statement and verifying alias consistency)
- **FR-006**: Validation tests MUST fail with unified diff output (showing expected vs. actual configuration in human-readable format), affected file paths, and the exact sync script command to run when misalignment is detected
- **FR-007**: Validation tests MUST pass when all alias configurations are synchronized with alias.config.mjs
- **FR-008**: Sync script MUST read alias.config.mjs and update tsconfig.json paths section with proper TypeScript syntax
- **FR-009**: Sync script MUST read alias.config.mjs and update package.json imports section with proper Node.js syntax
- **FR-010**: Sync script MUST preserve existing formatting, comments, and other content in configuration files when updating alias sections
- **FR-011**: Sync script MUST report which files were modified and what changes were made
- **FR-011a**: Sync script MUST detect potential conflicts by checking file modification timestamps; if a file was modified within the last 10 seconds, skip it with a clear warning message (\"[OMH] Skipping {file}: modified {seconds}s ago; manual update may be in progress. Try again after changes are saved.\") to prevent data loss
- **FR-012**: Sync script MUST exit with error code if any file update fails
- **FR-013**: Sync script MUST be executable from command line with a clear interface
- **FR-013a**: Sync script MUST support a dry-run mode that previews changes without applying them, allowing developers to verify changes before committing to the operation
- **FR-013b**: Sync script and validation tests MUST provide standard logging output (progress, warnings, errors with details, and summary) with optional verbose flag for detailed debugging information
- **FR-014**: System MUST support pre-commit hook integration that runs validation (not auto-sync) and blocks commits with clear instructions if synchronization fails
- **FR-015**: System MUST provide VS Code task configuration that can be run from the command palette
- **FR-016**: Validation tests MUST be organized in the appropriate test directory following project conventions (tests/project-setup-tests/ or similar)
- **FR-017**: Sync script MUST be located in .dev/scripts/ following project structure conventions
- **FR-018**: All scripts and tests MUST follow the project's file header requirements (file, description, path comments); executable scripts must include shebang line (e.g., `#!/usr/bin/env -S node --loader ts-node/esm`)
- **FR-019**: System MUST handle the case where an alias is defined in alias.config.mjs but a target configuration file format does not support that alias pattern; adapters MUST log warning (\"[OMH] Adapter {adapter}: Cannot represent alias {name} in this file format; skipping\") and continue processing other files
- **FR-020**: Documentation MUST be updated to explain the alias centralization system, how to add new aliases, and how to run validation/sync
- **FR-021**: System MUST use a modular architecture that separates configuration file type handling into discrete, pluggable components
- **FR-022**: System MUST provide clear interfaces or patterns for adding support for new configuration file types
- **FR-023**: Documentation MUST include extension guidelines explaining how to add support for new configuration file types
- **FR-024**: Adding support for a new configuration file type MUST NOT require changes to core validation or sync logic
- **FR-025**: System MUST provide a registry or discovery mechanism for configuration file adapters

### Key Entities

- **Alias Configuration**: Represents a mapping from an alias identifier (e.g., "#/", "#tests/") to a file system path (e.g., "./src/", "./tests/"). Contains the canonical definition in alias.config.mjs.

- **Configuration File Adapter**: Represents the logic for reading/writing alias configurations in a specific file format (TypeScript, Node.js imports, etc.). Each adapter knows the syntax rules for one configuration file type.

- **Validation Report**: Represents the result of comparing alias configurations across files, containing details about which aliases are misaligned and what the differences are.

- **Sync Operation**: Represents the process of reading alias.config.mjs and updating one or more configuration files. Contains metadata about which files were modified and what changes were applied.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developers can add a new alias to alias.config.mjs and have validation tests fail in under 5 seconds, clearly indicating which files need updates
- **SC-002**: Developers can run the sync script and have all configuration files updated correctly in under 3 seconds
- **SC-003**: 100% of alias-related configuration drift is detected by automated tests before code is merged
- **SC-004**: Manual alias synchronization effort is reduced to zero (developers only edit alias.config.mjs)
- **SC-005**: Configuration file format errors (syntax mistakes in TypeScript paths, Node.js imports, etc.) are eliminated through automation
- **SC-006**: Pre-commit hooks prevent 100% of commits that would introduce alias configuration drift
- **SC-007**: Onboarding documentation (main README \"Getting Started\" section) clearly explains the centralized alias system in under 200 words, enabling new developers to understand the approach within 2 minutes
- **SC-008**: Developers can add support for a new configuration file type in under 30 minutes by following extension documentation
- **SC-009**: Adding support for new configuration file types requires zero changes to core validation and sync logic

## Assumptions

- Alias definitions in alias.config.mjs follow a consistent structure (object with `find` and `replacement` properties)
- The project uses the existing alias.config.mjs file that already defines aliases for `#`, `#src`, `#tests`, and `#mocks`
- TypeScript configuration (tsconfig.json) supports the `paths` compiler option for alias mappings
- Node.js package.json supports the `imports` field for subpath imports (Node.js 12.20.0+)
- Vite and Vitest configurations already correctly import and use aliasEntries from alias.config.mjs
- The project uses ESM (ES Modules) as indicated by `"type": "module"` in package.json
- Git is used for version control and supports pre-commit hooks (via husky or similar)
- VS Code is the primary development environment for most contributors
- Configuration files are UTF-8 encoded and use standard JSON/JavaScript formatting
- The project follows the established testing conventions (tests/project-setup-tests/, tests/unit/, etc.)

## Dependencies

- Existing alias.config.mjs file as the source of truth
- Node.js file system APIs for reading/writing configuration files
- JSON parsing for package.json and tsconfig.json
- JavaScript module imports for reading alias.config.mjs
- Test framework (Vitest) for validation tests
- Shell scripting or Node.js for the sync script
- Husky (or similar) for pre-commit hook management
- VS Code tasks.json configuration for IDE integration

## Scope

### In Scope

- Creating validation tests for alias synchronization across tsconfig.json, package.json, and any other configuration files that define aliases
- Creating a sync script that updates configuration files based on alias.config.mjs
- Designing a modular, extensible architecture using adapters or similar patterns for handling different configuration file types
- Documenting how to extend the system to support new configuration file types
- Setting up pre-commit hooks to validate or auto-sync alias configurations
- Creating VS Code task configuration for running the sync script
- Documenting the centralized alias system and developer workflow
- Ensuring all scripts follow project coding standards (file headers, naming conventions, etc.)

### Out of Scope

- Modifying the structure or content of alias.config.mjs itself (it's already established)
- Adding new aliases (this is a future operation, but the feature enables it)
- Validating that code correctly uses the aliases (this is handled by TypeScript, ESLint, etc.)
- Creating aliases for configuration files beyond those currently in use (e.g., webpack, rollup, etc. that aren't part of the project)
- Migrating existing code to use the centralized aliases (code already uses them)
- Real-time IDE integration that updates files on save (VS Code task is manual execution)
- Handling alias conflicts or validation beyond path mapping (e.g., ensuring no circular dependencies)

## Notes

- The project already has significant infrastructure for this feature: alias.config.mjs exists, vite and vitest already import it, and tsconfig.json + package.json already define aliases
- The main gap is validation testing and automation to keep everything synchronized
- The sync script could be implemented in either Node.js or shell script; Node.js may be preferable for better JSON manipulation and cross-platform compatibility
- **Extensibility is a key architectural requirement**: While only tsconfig.json and package.json need sync initially, the system should use an adapter pattern or similar approach to make adding new file types straightforward
- Each configuration file type should have a dedicated adapter that knows how to read, validate, and write aliases in that file's specific syntax
- Extension documentation should include: interface/pattern to implement, where to register the adapter, and an example showing how to add support for a hypothetical new file type
- Future configuration files that might need support include: webpack.config.js, rollup.config.js, esbuild config, jest.config.js, or framework-specific configs
- Pre-commit hooks should be carefully designed to not slow down the commit process excessively (validation should be fast)
- Pre-commit hook uses validate-only approach: blocks commits with clear instructions rather than auto-syncing to avoid surprising developers and maintain explicit control
- The project uses vitest for testing, so validation tests should be written as vitest test files
- Follow the project's test naming conventions (\*.setup.test.mjs for project setup/structure tests)
- All new scripts and tests must include the mandatory file headers as specified in the style guide
- Validation diff output MUST use unified diff format (3 lines context before/after differences) for human readability
- Unsupported alias handling: adapters should gracefully skip aliases they cannot represent, with clear warning messages prefixed with `[OMH]`
