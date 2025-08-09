# Settings Helpers Module

## Overview

The Settings Helpers module provides a comprehensive toolkit for managing Foundry VTT settings with three specialized classes that work together to validate, parse, and register module settings. This implementation includes robust support for automatic hook triggering when settings change, providing a powerful way to respond to configuration changes throughout the module.

## Architecture

### Class Structure
- **`SettingsChecker`**: Validates setting objects against required keys and nested properties
- **`SettingsParser`**: Parses settings definitions and sets up automatic hook triggering
- **`SettingsRegistrar`**: Registers settings with the Foundry VTT game settings system

### Workflow
1. **Validation**: `SettingsChecker` validates setting format and required fields
2. **Parsing**: `SettingsParser` processes settings and configures hook triggers
3. **Registration**: `SettingsRegistrar` registers settings with Foundry VTT
andler
## Classes Documentation

### 1. SettingsChecker

A utility class for validating settings objects against required keys and nested properties.

#### Features
- Validates setting object format
- Supports nested property validation using dot notation (e.g., `config.type`)
- Returns detailed validation results with success flags and error messages

#### Usage
```javascript
import SettingsChecker from './settingsChecker';

const setting = {
  key: 'debugMode',
  config: {
    name: 'Debug Mode',
    type: Boolean,
    default: false
  }
};

const requiredKeys = ['key', 'config.name', 'config.type'];
const result = SettingsChecker.check(setting, requiredKeys);

if (result.success) {
  console.log('Setting is valid');
} else {
  console.error('Validation failed:', result.message);
}
```

### 2. SettingsParser

Enhanced parser with robust support for automatic hook triggering when settings change.

#### Key Features

##### Automatic Hook Generation
- Settings can specify `sendHook: true` to automatically trigger hooks on value changes
- Hook names are automatically formatted using the module's `HookFormatter` utility
- Hooks follow the pattern: `{modulePrefix}.setting.{settingKey}` or `{modulePrefix}.setting.{customHookName}`

##### Scope-Aware Hook Calls
- **Client/User Scope**: Uses `Hooks.call()` (affects only the current client)
- **World Scope**: Uses `Hooks.callAll()` (affects all connected clients)
- **Default Scope**: Falls back to `world` scope if not specified

##### Robust Error Handling
- Graceful handling of hook formatting failures
- Try-catch blocks around hook calls to prevent crashes
- Comprehensive logging for debugging
- Automatic fallback behavior when hook setup fails

##### Foundry VTT API Compliance
- Fully compatible with Foundry's `SettingConfig` interface
- Properly replaces custom configuration with standard `onChange` function
- Clean removal of custom properties before registration

#### Configuration Format

##### Basic Hook Configuration
```yaml
settings:
  settingsList:
    - key: "debugMode"
      config:
        name: "Debug Mode"
        hint: "Enable or disable debug mode"
        scope: "client"
        config: true
        type: Boolean
        default: false
        onChange:
          sendHook: true
          # hookName defaults to setting key if not specified
```

##### Custom Hook Name
```yaml
settings:
  settingsList:
    - key: "behaviorTokens"
      config:
        name: "Token Behavior"
        hint: "Configure token behavior settings"
        scope: "world"
        config: true
        type: String
        default: "default"
        onChange:
          sendHook: true
          hookName: "tokenBehaviorChanged"
```

### 3. SettingsRegistrar

A class for registering Foundry VTT settings with comprehensive error handling and batch processing capabilities.

#### Key Features

##### Individual Setting Registration
- Validates settings before registration
- Provides detailed success/failure feedback
- Handles Foundry VTT API errors gracefully

##### Batch Registration
- Supports both array and object input formats
- Processes multiple settings with aggregate results
- Continues processing even if individual settings fail

##### Namespace Management
- Automatic namespace detection from module configuration
- Support for custom namespace override
- Proper integration with Foundry VTT's module system

##### Enhanced Error Handling
- Warning logs for invalid setting objects
- Comprehensive validation checks
- Meaningful error messages for debugging

#### Usage Examples

##### Single Setting Registration
```javascript
import SettingsRegistrar from './settingsRegistrar';

const registrar = new SettingsRegistrar(config, context, utils);

const setting = {
  key: 'debugMode',
  config: {
    name: 'Debug Mode',
    scope: 'client',
    config: true,
    type: Boolean,
    default: false
  }
};

const result = registrar.registerSetting(setting);
if (result.success) {
  console.log(result.message); // "Setting debugMode registered successfully."
} else {
  console.error(result.message);
}
```

##### Batch Registration
```javascript
const settings = [
  { key: 'setting1', config: { name: 'Setting 1', type: Boolean, default: true } },
  { key: 'setting2', config: { name: 'Setting 2', type: String, default: 'value' } }
];

const result = registrar.register(settings);
console.log(`Registered ${result.successCounter} out of ${result.counter} settings`);
```

## Implementation Details

### Factory Pattern (SettingsParser)

The `onChangeActions` factory creates closure functions that capture the hook name and scope:

```javascript
const onChangeActions = {
  onChangeSendHook: (hookName, scope) => {
    return (value) => {
      try {
        if (scope === "client" || scope === "user") {
          Hooks.call(hookName, value);
        } else {
          Hooks.callAll(hookName, value);
        }
      } catch (error) {
        console.error(`Failed to trigger hook ${hookName} for setting change:`, error);
      }
    };
  }
};
```

### Hook Name Formatting

The hook name formatting follows this logic:

1. If `hookName` is specified in configuration, use it
2. If `hookName` is empty/undefined, fall back to the setting's `key`
3. Prefix with `"setting."` and format using `utils.formatHookName()`
4. Result format: `{modulePrefix}.setting.{hookName}`

### Error Recovery

- If hook name formatting fails, the setting is still processed but without hook functionality
- Warnings are logged for debugging purposes
- Settings continue to work normally even if hook setup fails

## Integration Example

Here's how all three classes work together:

```javascript
import SettingsChecker from './settingsChecker';
import SettingsParser from './settingsParser';
import SettingsRegistrar from './settingsRegistrar';

// 1. Validation with SettingsChecker
const requiredKeys = ['key', 'config.name', 'config.type'];
const isValid = SettingsChecker.check(setting, requiredKeys);

if (isValid.success) {
  // 2. Parse with hook setup using SettingsParser
  const parser = new SettingsParser(config, context, utils);
  const parseResult = parser.parse([setting]);

  // 3. Register with Foundry VTT using SettingsRegistrar
  const registrar = new SettingsRegistrar(config, context, utils);
  const registerResult = registrar.register([setting]);

  console.log(`Successfully processed ${registerResult.successCounter} settings`);
}
```

## Hook Constants

The following hook constant should be added to `constants.yaml`:

```yaml
hooks:
  setting: ".setting"  # Base hook for setting changes
```

This creates hooks with names like: `OMH.setting.debugMode`, `OMH.setting.tokenBehaviorChanged`, etc.

## Usage Examples

### Listening for Setting Changes

```javascript
// Listen for debug mode changes
Hooks.on('OMH.setting.debugMode', (newValue) => {
  console.log(`Debug mode changed to: ${newValue}`);
  if (newValue) {
    enableDebugLogging();
  } else {
    disableDebugLogging();
  }
});

// Listen for token behavior changes
Hooks.on('OMH.setting.tokenBehaviorChanged', (newBehavior) => {
  console.log(`Token behavior changed to: ${newBehavior}`);
  updateTokenHandlers(newBehavior);
});
```

### Setting Values

```javascript
// These will automatically trigger the hooks
await game.settings.set('over-my-head', 'debugMode', true);
await game.settings.set('over-my-head', 'behaviorTokens', 'onlyActive');
```

## Testing

The implementation includes comprehensive test coverage for all three classes:

### SettingsChecker Tests

- Validates basic format validation
- Tests nested property validation using dot notation
- Verifies error handling for missing properties

### SettingsParser Tests

- Validates basic parsing functionality
- Tests hook generation for different scopes
- Verifies proper hook calling behavior
- Tests error handling for hook failures
- Validates fallback behaviors

### SettingsRegistrar Tests

- Tests individual and batch registration
- Validates namespace handling
- Tests error handling and recovery
- Verifies integration with Foundry VTT API

### Running Tests

```bash
# Run all settings helper tests
npm test -- --testPathPattern=settings

# Run specific class tests
npm test -- --testPathPattern=settingsChecker
npm test -- --testPathPattern=settingsParser
npm test -- --testPathPattern=settingsRegistrar
```

## Benefits

1. **Modular Architecture**: Separation of concerns with three specialized classes
2. **Reactive Configuration**: Settings can automatically trigger system updates
3. **Robust Validation**: Comprehensive validation before processing
4. **Decoupled Architecture**: Components can listen for setting changes without tight coupling
5. **Error Resilience**: Robust error handling prevents configuration issues from breaking the module
6. **Foundry Compliance**: Full compatibility with Foundry VTT's settings system
7. **Developer Experience**: Clear, declarative configuration format

## Migration Guide

### For Existing Settings

1. Validate using `SettingsChecker` against required keys
2. Add `onChange: { sendHook: true }` to any setting that should trigger hooks
3. Optionally specify a custom `hookName` if the default (setting key) isn't suitable
4. Use `SettingsRegistrar` for consistent registration handling

### For New Settings

1. Follow the configuration format outlined above
2. Consider which scope is appropriate for your setting
3. Choose meaningful hook names that describe the change being made
4. Use the integrated workflow: validate → parse → register

This implementation provides a powerful, reliable foundation for reactive configuration management in your Foundry VTT module with clear separation of concerns and comprehensive error handling.
