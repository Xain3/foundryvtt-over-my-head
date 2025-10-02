# VS Code Configuration

This directory contains Visual Studio Code workspace-specific configuration files for the Foundry VTT Over My Head project.

## Purpose

The `.vscode` directory provides project-specific settings and tasks that ensure a consistent development experience across all team members using VS Code.

## Files

- **settings.json**: Workspace settings that override user settings for this project
- **tasks.json**: Custom tasks for building, testing, and other development operations

## Key Features

### Settings Configuration

The settings.json file typically includes:

- Editor preferences (formatting, indentation)
- Extension recommendations
- Language-specific settings
- Workspace-specific overrides

### Tasks Configuration

The tasks.json file defines:

- Build tasks for the project
- Test execution tasks
- Custom development workflows
- Integration with npm scripts

## Usage

These configurations are automatically applied when opening the project in VS Code:

1. **Settings**: Applied automatically when the workspace is opened
2. **Tasks**: Available in the Command Palette under "Tasks: Run Task" or through keyboard shortcuts

## Customization

To modify these settings:

- Edit the files directly in the `.vscode` directory
- Settings changes affect all team members (commit to version control)
- For personal overrides, use user settings instead

## Best Practices

- Keep settings focused on project needs, not personal preferences
- Document any custom tasks in comments
- Ensure tasks work across different operating systems
- Test configurations on clean environments

See the individual configuration files for detailed settings and task definitions.
