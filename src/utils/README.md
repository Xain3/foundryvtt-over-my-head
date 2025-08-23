# Utils

This directory contains utility classes and functions that provide core functionality for module initialization, logging, hook formatting, and general utility operations. The utils are organized into specialized utilities for module lifecycle management and static utilities for data operations.

## Overview (Updated for Multi-Function Proxy Mapping)

The utils are organized into functional categories:

- **Module Lifecycle**: [`Initializer`](#initializer), [`Logger`](#logger)
- **Hook Management**: [`HookFormatter`](#hookformatter)
- **General Utilities**: Utils (entry point in `utils.js`)
- **Static Utilities**: [`static/`](#static-utilities)

Note: Static utilities now expose a convenience alias `localizer` for the Localizer class at `Utils.static.localizer`.

## 📁 Folder Structure

```text
src/utils/
├── README.md                   # This documentation
├── initializer.js              # Module initialization orchestration
├── initializer.unit.test.js    # Initializer tests
├── logger.js                   # Module-specific logging
├── logger.unit.test.js         # Logger tests
├── hookFormatter.js            # Hook name formatting utilities
├── hookFormatter.unit.test.js  # HookFormatter tests
├── utils.js                    # General utility functions
├── utils.unit.test.js          # Utils tests
└── static/                     # Static utility classes (see static/README.md)
    ├── README.md               # Static utilities documentation
    ├── static.js               # Central entry point for static utils
    ├── validator.js            # Data validation utilities
    ├── unpacker.js             # Object property unpacking
    ├── gameManager.js          # Game module management
    ├── errorFormatter.js       # Error formatting utilities
    ├── localizer.js            # Localization utilities
    └── *.unit.test.js          # Comprehensive test coverage
```

## 🚀 Quick Start

### Using Utils Entry Point (Recommended)

```javascript
import Utils from '@/utils/utils.js';

// Access all utilities through unified interface
const logger = Utils.createLogger(constants, manifest, formatError);
const initializer = Utils.createInitializer(constants, manifest, logger, formatError, formatHook);

// Access static utilities
const isValid = Utils.validate('isString', { value: 'test' });
Utils.unpack(data, instance);
const module = Utils.getModuleObject('my-module');

```

### Utilities Facade (formatHookName, initializeContext, logging)

```javascript
import Utilities from '@/utils/utils.js';

// Create a Utilities instance (facade over logger/initializer/hookFormatter)
const utils = new Utilities(constants, manifest);

// Hook name formatting via Utilities facade
const hookName = utils.formatHookName('ready'); // e.g., 'OMH.ready'

// Initialize context objects via initializer shortcut (immediate)
utils.initializeContext({ constants, manifest, logger: utils.logger, formatError: utils.formatError });

// Convenience logging methods
utils.log('Info message');
utils.logWarning('Something to watch');
utils.logError('Something went wrong');
utils.logDebug('Detailed debug info');
```

### Direct Imports for Specific Use Cases

```javascript
import Initializer from '@/utils/initializer.js';
import Logger from '@/utils/logger.js';
import { formatHook } from '@/utils/hookFormatter.js';
import StaticUtils from '@/utils/static/static.js';

// Module initialization
const initializer = new Initializer(constants, manifest, logger, formatError, formatHook);
// Initialize immediately
initializer.initializeContext({ /* your Context params */ });
```

## Core Utilities

### Initializer

**File**: [`initializer.js`](initializer.js)
**Dependencies**: `Context`, `SettingsHandler`, `Logger`, `HookFormatter`
**Exports**: `Initializer` (class)

Orchestrates the complete module initialization workflow, including context setup and settings registration with proper Foundry VTT hook integration.

#### Initializer Key Features

- **Context Initialization**: Creates and configures context objects with validation
- **Settings Registration**: Handles module settings registration and localization
- **Hook Integration**: Properly integrates with Foundry VTT's hook system
- **Development Features**: Enables development-specific features like hook logging
- **Error Handling**: Comprehensive error handling with logging
- **i18n Support**: Can defer until i18n system is ready using `waitHook`

#### Initializer Public API

```javascript
// Core initialization methods
initializeContext(initParams?, waitHook=false)
initializeSettings(SettingsHandlerOrInstance, utils?, waitHook=false)
initializeDevFeatures(utils, filter)

// Internal/testing helpers
initializeContextObject(params)
_initializeContextObject(params)
_registerSettings(SettingsHandlerOrInstance, utils?)
```

#### Initializer Example Usage

```javascript
import Initializer from '@/utils/initializer.js';
import Context from '@/contexts/context.js';
import SettingsHandler from '@/handlers/settingsHandler.js';

// Create initializer
const initializer = new Initializer(
  constants,
  manifest,
  logger,
  formatError,
  formatHook
);

// Initialize context immediately
const contextInitParams = { /* your Context params */ };
initializer.initializeContext(contextInitParams);

// Defer initialization until i18nInit
initializer.initializeContext(contextInitParams, true);

// Initialize settings immediately with SettingsHandler class or instance
initializer.initializeSettings(SettingsHandler);

// Defer settings registration until i18nInit
initializer.initializeSettings(SettingsHandler, undefined, true);

// Access initialized context (after immediate init, or after i18nInit fires)
console.log(initializer.context);
```

#### Workflow Integration

```javascript
// Defer context init until i18n is ready
Hooks.once('i18nInit', () => {
  initializer.initializeContext(contextInitParams, true);
});

Hooks.once('init', () => {
  logger.log('Initializing settings...');

  try {
    // Initialize settings with localization (defer until i18nInit)
    initializer.initializeSettings(SettingsHandler, undefined, true);

    logger.log('Settings initialized successfully');
  } catch (error) {
    logger.error(`Settings initialization failed: ${Utils.formatError(error)}`);
    throw error;
  }
});
```

### Logger

**File**: [`logger.js`](logger.js)
**Dependencies**: `GameManager`
**Exports**: `Logger` (class)

Provides module-specific logging with configurable debug mode, automatic message prefixing, and integration with Foundry VTT's module settings system.

#### Logger Key Features

- **Module Prefixing**: Automatically prefixes all log messages with module name
- **Debug Mode Support**: Configurable debug logging with settings integration
- **Log Levels**: Support for log, error, warn, and debug message types
- **Settings Integration**: Automatically detects debug mode from module settings
- **Fallback Handling**: Graceful handling when settings are unavailable

#### Logger Public API

```javascript
// Logging methods
log(message)          // General logging
error(message)        // Error logging
warn(message)         // Warning logging
debug(message)        // Debug logging (only when debug mode enabled)

// Debug mode management
isDebugEnabled()      // Check current debug mode status
```

#### Logger Example Usage

```javascript
import Logger from '@/utils/logger.js';

// Create logger
const logger = new Logger(constants, manifest, formatError);

// Basic logging
logger.log('Module initialization started');
logger.warn('Configuration missing, using defaults');
logger.error('Failed to load resource');

// Debug logging (only shows when debug mode enabled)
logger.debug('Processing user input:', userInput);
logger.debug('Context state:', context);

// Check debug status
if (logger.isDebugEnabled()) {
  logger.debug('Debug mode is active');
  // Perform expensive debug operations only when needed
}

// Integration with error handling
try {
  await someAsyncOperation();
} catch (error) {
  logger.error(`Operation failed: ${formatError(error)}`);
  throw error;
}
```

#### Debug Mode Configuration

The Logger automatically detects debug mode from multiple sources:
**Unified Interface**: Single import point for all utility functionality, including multi-function proxy mapping
**Factory Methods**: Convenient methods for creating utility instances, including multi-function proxies

#### Message Format

All log messages are automatically formatted with the module prefix:

```javascript
logger.log('Context initialized');
// Output: "OverMyHead | Context initialized"

logger.debug('Processing data');
// Output: "OverMyHead | Processing data" (only if debug mode enabled)
```

### HookFormatter

**File**: [`hookFormatter.js`](hookFormatter.js)
**Dependencies**: `constants`
**Exports**: `formatHook` (function)

Formats hook names according to Foundry VTT conventions with module prefixing and context support.

#### HookFormatter Key Features

- **Module Prefixing**: Automatically adds module prefix to hook names
- **Context Support**: Handles context-specific hooks with proper formatting
- **Convention Compliance**: Follows Foundry VTT hook naming conventions
- **Validation**: Input validation with meaningful error messages

#### HookFormatter Public API

```javascript
formatHook(hookBase, hookType, context?)
// hookBase: Base identifier for the hook
// hookType: Type of hook (e.g., 'init', 'ready', 'update')
// context: Optional context identifier
```

#### HookFormatter Example Usage

```javascript
import { formatHook } from '@/utils/hookFormatter.js';

// Basic hook formatting
const initHook = formatHook('myModule', 'init');
// Result: "myModuleInit"

const readyHook = formatHook('myModule', 'ready');
// Result: "myModuleReady"

// Context-specific hooks
const contextHook = formatHook('context', 'update', 'player');
// Result: "contextUpdatePlayer"

const dataHook = formatHook('data', 'changed', 'inventory');
// Result: "dataChangedInventory"

// Integration with hook registration
Hooks.on(formatHook('module', 'ready'), () => {
  console.log('Module is ready');
});

Hooks.call(formatHook('context', 'updated', 'player'), contextData);
```

#### Hook Naming Conventions

The formatter follows these conventions:

- **Base Format**: `{modulePrefix}{hookBase}{hookType}[{context}]`
- **CamelCase**: All parts are converted to camelCase
- **No Separators**: No hyphens, underscores, or dots in final hook name
- **Context Suffix**: Context is appended as a capitalized suffix when provided

const logger = Utils.createLogger(constants, manifest, formatError); // Updated for multi-function proxy mapping

**File**: [`utils.js`](utils.js)
**Dependencies**: All utils and static utilities
**Exports**: `Utils` (class)

Central entry point providing unified access to all utility functionality, including factory methods for creating utility instances and proxy methods for static utilities.

#### Key Features

- **Unified Interface**: Single import point for all utility functionality
- **Factory Methods**: Convenient methods for creating utility instances
- **Static Proxy**: Direct access to static utility methods
const proxiedHooksCall = Utils.createHookProxy(Hooks.call, {

#### Public API

```javascript
// Factory methods for utility instances
static createLogger(constants, manifest, formatError)
static createInitializer(constants, manifest, logger, formatError, formatHook)

// Hook formatting
static formatHook(hookBase, hookType, context?)

// Proxy methods to static utilities (validation, unpacking, etc.)
static validate(validationType, options)
static unpack(object, instance, objectName?)
static formatError(error, options?)
static localize(stringId, i18nInstance?)
static formatLocalized(stringId, data, i18nInstance?)
static hasLocalization(stringId, i18nInstance?)
static getModuleObject(moduleIdentifier)
static writeToModuleObject(moduleIdentifier, key, value)
static readFromModuleObject(moduleIdentifier, key)
static getAvailableValidationTypes()

// Hook logging and debugging
static createHookProxy(hookFunction, options)
static createHookLogger(logLevel, prefix, filter)
static proxyFoundryHooks(options)

// Utility information
static getUtilityInfo()
```

#### Utils Example Usage

```javascript
import Utils from '@/utils/utils.js';

// Create utility instances
const logger = Utils.createLogger(constants, manifest, formatError);
const initializer = Utils.createInitializer(
  constants,
  manifest,
  logger,
  formatError,
  formatHook
);

// Format hooks
const hookName = Utils.formatHook('module', 'ready');

// Use static utilities
// Hook formatting
const hookName = Utils.formatHook('module', 'ready');

// Use static utilities
const isValid = Utils.validate('isString', { value: input });
Utils.unpack(moduleData, instance);
const module = Utils.getModuleObject('my-module');

// Hook logging and debugging
const proxiedHooksCall = Utils.createHookProxy(Hooks.call, {
  logLevel: 'debug',
  filter: (hookName) => hookName.startsWith('OMH.')
});
const hookLogger = Utils.createHookLogger('debug', 'MyModule');

// Localization

// Localization
const text = Utils.localize('MYMODULE.welcome');
const formatted = Utils.formatLocalized('MYMODULE.greeting', { name: 'Player' });

// Get utility information
const info = Utils.getUtilityInfo();
console.log('Available utilities:', info.utilities);
```

### Static Utilities

**Directory**: [`static/`](static/)
**Entry Point**: [`static/static.js`](static/static.js)

Collection of static utility classes for data validation, object manipulation, error formatting, localization, and game module management. See [`static/README.md`](static/README.md) for detailed documentation.

#### Quick Access via Utils

```javascript
import Utils from '@/utils/utils.js';

// All static utility functionality is available through Utils
const validated = Utils.validate('isObject', { value: config });
const formatted = Utils.formatError(error, { includeStack: true });
const localized = Utils.localize('MYMODULE.title');
```

## Integration and Workflows

### Complete Module Initialization Workflow

```javascript
import Utils from '@/utils/utils.js';
import Context from '@/contexts/context.js';
import SettingsHandler from '@/handlers/settingsHandler.js';

// Setup utilities
const logger = Utils.createLogger(constants, manifest, formatError);
const initializer = Utils.createInitializer(
  constants,
  manifest,
  logger,
  formatError,
  formatHook
);

// Foundry VTT hook integration
Hooks.once('i18nInit', () => {
  logger.log('Initializing settings...');

  try {
    // Initialize context
  const contextParams = { /* your Context params */ };
  initializer.initializeContext(contextParams, true);

    logger.log('Context initialized successfully');
  } catch (error) {
    logger.error(`Context initialization failed: ${Utils.formatError(error)}`);
    throw error;
  }
});

Hooks.once('init', () => {
  logger.log('Initializing settings...');

  try {
  // Initialize settings with localization (defer until i18nInit)
  initializer.initializeSettings(SettingsHandler, undefined, true);

    logger.log('Settings initialized successfully');
  } catch (error) {
    logger.error(`Settings initialization failed: ${Utils.formatError(error)}`);
    throw error;
  }
});

Hooks.once('ready', () => {
  logger.log(`${manifest.title} v${manifest.version} is ready!`);

  if (logger.isDebugEnabled()) {
    logger.debug('Module context:', initializer.context);
    logger.debug('Available utilities:', Utils.getUtilityInfo());
  }
});
```

### Custom Hook Management

```javascript
// Define custom hooks for module events
const HOOKS = {
  MODULE_INIT: Utils.formatHook('module', 'init'),
  MODULE_READY: Utils.formatHook('module', 'ready'),
  CONTEXT_UPDATE: Utils.formatHook('context', 'update'),
  SETTINGS_CHANGE: Utils.formatHook('settings', 'change'),
  DATA_SYNC: Utils.formatHook('data', 'sync', 'remote')
};

// Register hook listeners
Hooks.on(HOOKS.CONTEXT_UPDATE, (contextData) => {
  logger.debug('Context updated:', contextData);
});

Hooks.on(HOOKS.SETTINGS_CHANGE, (setting, value) => {
  logger.log(`Setting ${setting} changed to:`, value);
});

// Fire custom hooks
Hooks.call(HOOKS.CONTEXT_UPDATE, initializer.context);
Hooks.call(HOOKS.DATA_SYNC, syncData);
```

### Error Handling and Logging Pattern

```javascript
// Standardized error handling across the module
async function performOperation(operationName, operation) {
  logger.debug(`Starting ${operationName}...`);

  try {
    const result = await operation();
    logger.log(`${operationName} completed successfully`);
    return result;
  } catch (error) {
    const formattedError = Utils.formatError(error, {
      includeStack: logger.isDebugEnabled(),
      caller: operationName
    });

    logger.error(`${operationName} failed: ${formattedError}`);
    throw error;
  }
}

// Usage (immediate)
initializer.initializeContext(contextParams);
initializer.initializeSettings(SettingsHandler);
```

### Validation and Data Processing

```javascript
// Comprehensive data validation and processing
function processModuleData(rawData, moduleName) {
  logger.debug('Processing module data...');

  // Validate input data
  Utils.validate('validateObject', {
    value: rawData,
    name: 'moduleData',
    options: { allowEmpty: false }
  });

  // Validate required fields
  // Create and populate instance
  const moduleInstance = {};
  Utils.unpack(rawData, moduleInstance, 'module configuration');

  // Validate processed data
  logger.log(`Successfully processed data for module: ${moduleInstance.title}`);
  return moduleInstance;
}

```text
Utils (Entry Point)
├── Initializer
│   ├── Logger
│   │   └── GameManager (static)
│   ├── HookFormatter
│   │   └── constants
│   └── Static utilities (validation, error formatting)
├── Logger
│   └── GameManager (static)
├── HookFormatter
│   └── constants
└── Static Utilities (static/)
    ├── StaticUtils (Entry Point)
    ├── Validator
    ├── Unpacker
    ├── GameManager
    ├── ErrorFormatter
    └── Localizer
```

### Interaction Flow

```text
1. Utils (Central Entry Point)
   ↓ provides factory methods and proxy access
2. Initializer (Orchestration)
   ↓ coordinates module lifecycle
3. Logger (Monitoring)
   ↓ provides feedback and debugging
4. Static Utilities (Foundation)
   └ provide core data operations
```

### Module Lifecycle Integration

```text
Foundry VTT Hooks → Utils → Initializer → Context & Settings
                     ↓
                  Logger → Debug & Error Reporting
                     ↓
               Static Utils → Data Operations
```

## Error Handling

All utilities implement comprehensive error handling:

- **Debug Support**: Enhanced error information when debug mode is enabled

## Testing

The utils include comprehensive test coverage:

- **Unit Tests**: Individual utility testing (`*.unit.test.js`)
- **Integration Tests**: Cross-utility interaction testing
- **Mock Support**: Foundry VTT environment simulation
- **Coverage Metrics**: 100% line, branch, and function coverage

### Test Statistics

- **Initializer**: 311 test lines covering initialization workflow, error handling, and edge cases

### Running Tests

```bash
# Run all utils tests
npm test -- src/utils

# Run specific utility tests
npm test -- src/utils/initializer.unit.test.js
npm test -- src/utils/logger.unit.test.js
npm test -- src/utils/hookFormatter.unit.test.js

# Run static utilities tests
npm test -- src/utils/static/

# Run with coverage
npm test -- src/utils/ --coverage

Use `Utils` as the single entry point when importing from outside the utils folder:

```javascript
import Utils from '@/utils/utils.js';

// Create instances
const logger = Utils.createLogger(constants, manifest, formatError);
const initializer = Utils.createInitializer(constants, manifest, logger, formatError, formatHook);

// Use proxy methods
const validated = Utils.validate('isString', { value: input });
const hookName = Utils.formatHook('module', 'ready');
```

```javascript
import Logger from './logger.js';
import { formatHook } from './hookFormatter.js';
import StaticUtils from './static/static.js';
```


### Performance Considerations

- **Lazy Instantiation**: Create utility instances only when needed
- **Debug Mode**: Use `logger.isDebugEnabled()` to avoid expensive debug operations
- **Batch Operations**: Group related operations to minimize overhead
- **Static Methods**: Prefer static utilities for stateless operations

### Best Practices

1. **Use Utils entry point** for external imports to maintain consistency
2. **Enable debug mode** during development for enhanced logging
3. **Validate inputs early** using static validators before processing
4. **Handle errors gracefully** with proper logging and user feedback
5. **Follow hook conventions** using formatHook for all custom hooks
6. **Test with mocks** to ensure robustness across different environments

## Configuration Integration

The utils integrate with the module's configuration system:

- **Constants**: All utilities use `constants.yaml` for configuration
- **Manifest**: Module metadata is consistently accessed via manifest object
- **Settings**: Logger integrates with Foundry VTT settings for debug mode
- **Hooks**: HookFormatter uses configured module prefix from constants

This ensures consistent behavior and centralized configuration management.

## Future Extensions

The utils are designed for extensibility:

1. **New Utilities**: Additional utilities can be added and integrated via Utils class
2. **Enhanced Logging**: Logger can be extended with additional log levels or outputs
3. **Hook Patterns**: HookFormatter can support additional hook naming patterns
4. **Static Utilities**: New static utilities can be added to the static/ folder
5. **Initialization Steps**: Initializer can be extended with additional workflow steps

## API Reference

For detailed API documentation, see the JSDoc comments in each file:

- [Utils API](./utils.js) - Central entry point and factory methods
- [Initializer API](./initializer.js) - Module initialization orchestration
- [Logger API](./logger.js) - Module-specific logging functionality
- [HookFormatter API](./hookFormatter.js) - Hook name formatting utilities
- [Static Utilities API](./static/README.md) - Complete static utilities documentation

## Contributing

When adding new utilities:

1. **Follow existing patterns** for consistency with other utilities
2. **Add comprehensive tests** with edge cases and error scenarios
3. **Include JSDoc documentation** with detailed examples
4. **Update Utils class** to include new utility in the entry point
5. **Update this README** with new functionality and examples
6. **Consider dependencies** and avoid circular imports

## Version History

- **v1.0.0** - Initial implementation with basic utility structure
- **v1.1.0** - Added Initializer for module lifecycle management
- **v1.2.0** - Added Logger with debug mode and settings integration
- **v1.3.0** - Added HookFormatter for standardized hook naming
- **v1.4.0** - Added Utils entry point as unified interface
- **v1.5.0** - Enhanced documentation and comprehensive examples
