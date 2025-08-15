<!-- markdownlint-disable MD022 MD026 MD032 MD024 MD031 MD040 -->
# Static Utilities

This folder contains static utility classes that provide common functionality for data validation, object manipulation, and other utility operations. All utilities are designed to be stateless and can be used throughout the application without instantiation (except where noted).

## 📁 Folder Structure

```
src/utils/static/
├── README.md                   # This documentation
├── static.js                   # Central entry point (StaticUtils)
├── static.unit.test.js         # StaticUtils tests
├── validator.js                # Data validation utilities
├── validator.unit.test.js      # Validator tests
├── unpacker.js                 # Object property unpacking utilities
├── unpacker.unit.test.js       # Unpacker tests
├── gameManager.js              # Game module management utilities
├── gameManager.unit.test.js    # GameManager tests
├── errorFormatter.js           # Error formatting utilities
├── errorFormatter.unit.test.js # ErrorFormatter tests
├── localizer.js                # Localization utilities
├── localizer.unit.test.js      # Localizer tests
├── hooksLogger.js              # Hook logging and debugging utilities
└── hooksLogger.unit.test.js    # HooksLogger tests
```

## 🚀 Quick Start

### Using StaticUtils (Recommended)

The `StaticUtils` class provides a unified interface to all static utilities:

```javascript
import StaticUtils from '@/utils/static/static.js';

// Validation
const isValid = StaticUtils.validate('isString', { value: 'hello' }); // true
StaticUtils.validate('validateNumber', { value: age, name: 'age', options: { min: 0 } });

// Object unpacking
const instance = {};
const data = { title: 'Test', version: '1.0.0' };
StaticUtils.unpack(data, instance);
// instance now has: instance.title, instance.version

// Game module management
const module = StaticUtils.getModuleObject('my-module-id');
StaticUtils.writeToModuleObject('my-module', 'customData', { setting: true });
const data = StaticUtils.readFromModuleObject('my-module', 'customData');
// Read a setting directly via StaticUtils (proxy to GameManager)
const debugMode = StaticUtils.getSetting('foundryvtt-over-my-head', 'debugMode');

// Error formatting
try {
  throw new Error('Something went wrong');
} catch (error) {
  const formatted = StaticUtils.formatError(error, { includeStack: true });
  console.error(formatted);
}

// Localization
const welcomeText = StaticUtils.localize('MYMODULE.welcome');
const greeting = StaticUtils.formatLocalized('MYMODULE.greeting', { name: 'Player' });
if (StaticUtils.hasLocalization('MYMODULE.optionalText')) {
  const optionalText = StaticUtils.localize('MYMODULE.optionalText');
}
// Localizer alias is available at StaticUtils.localizer (class reference)
const fromAlias = StaticUtils.localizer.localize('MYMODULE.title');

// Get available utilities info
const info = StaticUtils.getUtilityInfo();
console.log(info.utilities); // ['Validator', 'Unpacker', 'GameManager', 'ErrorFormatter', 'Localizer', 'HooksLogger']
```

### Using Individual Classes

You can also import and use individual utility classes directly:

```javascript
import { Validator } from '@/utils/static/validator.js';
import Unpacker from '@/utils/static/unpacker.js';
import GameManager from '@/utils/static/gameManager.js';
import { formatError } from '@/utils/static/errorFormatter.js';
import Localizer from '@/utils/static/localizer.js';

// Direct validation
const isString = Validator.isString('hello'); // true
Validator.validateObject(obj, 'testObject');

// Direct unpacking
const unpacker = new Unpacker();
unpacker.unpack(data, instance);

// Direct game management
const module = GameManager.getModuleObject('my-module');
GameManager.writeToModuleObject('my-module', 'key', 'value');

// Direct error formatting
const formatted = formatError(error, { includeStack: true });

// Direct localization
const localizer = new Localizer();
const text = localizer.localize('MYMODULE.title');
const staticText = Localizer.localize('MYMODULE.greeting');
```

## 📚 Available Utilities

### 1. StaticUtils (Entry Point)

**File**: `static.js`
**Purpose**: Central entry point providing unified access to all static utilities.

#### Key Features:
- ✅ Unified interface for all static utilities
- ✅ Convenient proxy methods for common operations
- ✅ Utility discovery and information methods
- ✅ Consistent error handling and reporting

#### Main Methods:
- `validate(validationType, {value, name, options})` - Unified validation interface
- `unpack(object, instance, objectName)` - Object property unpacking
- `formatError(error, options)` - Error formatting with module context
- `localize(stringId, i18nInstance)` - String localization
- `formatLocalized(stringId, data, i18nInstance)` - Localized string formatting with variables
- `hasLocalization(stringId, i18nInstance)` - Check if localization key exists
- `getModuleObject(moduleIdentifier)` - Get module object
- `getSetting(moduleId, key)` - Read a module setting value
- `writeToModuleObject(moduleIdentifier, key, value)` - Write to module object
- `readFromModuleObject(moduleIdentifier, key)` - Read from module object
- `getAvailableValidationTypes()` - Get list of validation types
- `getUtilityInfo()` - Get utility information

### 2. Validator

**File**: `validator.js`
**Purpose**: Comprehensive data validation and type checking utilities.

#### Key Features:
- ✅ **21 validation methods** covering all common use cases
- ✅ **Type checking methods** (isString, isObject, isArray, etc.)
- ✅ **Validation methods** with error throwing (validateString, validateNumber, etc.)
- ✅ **Central validate() method** as unified entry point
- ✅ **Flexible options** for customized validation rules
- ✅ **Comprehensive error messages** with context

#### Validation Categories:

**Type Checkers** (return boolean):
- `isDefined`, `isNull`, `isString`, `isObject`, `isArray`
- `isPlainObject`, `isNumber`, `isEmpty`, `isBoolean`, `isPrimitive`
- `isReservedKey`

**Validators** (throw on failure):
- `validateObject`, `validateString`, `validateNumber`, `validateDate`
- `validateArgsObjectStructure`, `validateSchemaDefinition`
- `validateStringAgainstPattern`, `validateObjectKeysExist`

#### Usage Examples:

```javascript
// Type checking
if (Validator.isString(value) && !Validator.isEmpty(value)) {
  // Process valid non-empty string
}

// Validation with error throwing
Validator.validateString(userInput, 'username', { allowEmpty: false });
Validator.validateNumber(age, 'age', { min: 0, max: 120 });

// Pattern validation
Validator.validateStringAgainstPattern(
  email,
  'email',
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  'a valid email format'
);

// Central validate method
Validator.validate('isNumber', {
  value: 42,
  options: { integer: true, positive: true }
}); // true

Validator.validate('validateObject', {
  value: userData,
  name: 'userData',
  options: { allowEmpty: false }
}); // throws on failure
```

### 3. Unpacker

**File**: `unpacker.js`
**Purpose**: Utility for transferring properties from plain objects to class instances.

#### Key Features:
- ✅ **Property transfer** from objects to instances
- ✅ **Symbol key support** handles both string and symbol properties
- ✅ **Input validation** with comprehensive error checking
- ✅ **Error logging** with contextual information
- ✅ **Safe operation** handles frozen objects gracefully

#### Usage Examples:

```javascript
const unpacker = new Unpacker();

// Basic usage
const instance = {};
const data = { title: 'Module', version: '1.0.0', active: true };
unpacker.unpack(data, instance);
// Result: instance.title, instance.version, instance.active are now available

// With custom error reporting
class MyModule {}
const module = new MyModule();
const moduleData = { id: 'test', config: { setting: true } };
unpacker.unpack(moduleData, module, 'module configuration');

// Symbol key support
const sym = Symbol('privateData');
const objWithSymbols = {
  publicProp: 'visible',
  [sym]: 'hidden'
};
unpacker.unpack(objWithSymbols, instance);
// Both instance.publicProp and instance[sym] are available
```

### 4. GameManager

**File**: `gameManager.js`
**Purpose**: Static utility class for managing game modules and remote contexts.

#### Key Features:
- ✅ **Static module management** - no instantiation required
- ✅ **Flexible module identification** - supports strings, manifest objects, and module.json objects
- ✅ **Module operations** - read, write, and check existence
- ✅ **Error handling** - comprehensive error checking and logging
- ✅ **FoundryVTT integration** - seamless integration with FoundryVTT game object

#### Main Methods:
- `getModuleObject(moduleIdentifier)` - Get module object by ID or manifest
- `writeToModuleObject(moduleIdentifier, key, value)` - Write data to module
- `readFromModuleObject(moduleIdentifier, key)` - Read data from module
- `moduleExists(moduleIdentifier)` - Check if module exists
- `getUtilityInfo()` - Get utility information

#### Usage Examples:

```javascript
// Get module by string ID
const module = GameManager.getModuleObject('my-module-id');

// Get module using manifest object
import manifest from './manifest.js';
const module = GameManager.getModuleObject(manifest);

// Get module using module.json
import moduleJson from './module.json';
const module = GameManager.getModuleObject(moduleJson);

// Write custom data to module
GameManager.writeToModuleObject('my-module', 'settings', {
  enabled: true,
  level: 5
});

// Read custom data from module
const settings = GameManager.readFromModuleObject('my-module', 'settings');

// Check if module exists
if (GameManager.moduleExists('optional-module')) {
  // Module is available, safe to use
  GameManager.writeToModuleObject('optional-module', 'integration', true);
}

// Using with manifest objects
const manifest = { id: 'foundryvtt-over-my-head', name: 'OverMyHead' };
if (GameManager.moduleExists(manifest)) {
  const moduleData = GameManager.readFromModuleObject(manifest, 'customConfig');
}
```

### 7. HooksLogger

**File**: `hooksLogger.js`
**Purpose**: Static utility class for logging and debugging Foundry VTT hook calls with proxy support and in-place modification.

#### Key Features

- ✅ **Hook Call Logging** - Log hook calls without modifying original functionality
- ✅ **In-place Proxy Support** - Automatically modifies objects by assigning proxies to their properties
- ✅ **Configurable Logging** - Control log levels, prefixes, and filtering
- ✅ **Foundry VTT Integration** - Specialized support for Foundry VTT's hook system with duck typing
- ✅ **Debug Filtering** - Filter hooks by name patterns for targeted debugging
- ✅ **Robust Validation** - Duck typing validation for better compatibility

#### Main Methods

- `createHookProxy(hookObject, functionName, options)` - Create a proxy that logs hook calls and modifies object in-place
- `createHookLogger(logLevel, prefix, filter)` - Create a logger function for hooks
- `proxyFoundryHooks(options)` - Convenience method for proxying Foundry's Hooks functions in-place
- `isHooksAvailable()` - Check if Foundry VTT Hooks object is available and functional
- `getUtilityInfo()` - Get utility information

#### Usage Examples

```javascript
import HooksLogger from '@/utils/static/hooksLogger.js';

// Basic in-place hook proxy for debugging
HooksLogger.createHookProxy(Hooks, 'call', {
  logLevel: 'debug',
  prefix: 'Hook Debug'
});
// Hooks.call is now proxied automatically

// Get proxy without modifying original (for manual assignment)
const proxy = HooksLogger.createHookProxy(Hooks, 'call', {
  logLevel: 'debug',
  prefix: 'OMH Hook',
  filter: (hookName) => hookName.startsWith('OMH.'),
  logResult: true,
  returnProxy: true
});
// Hooks.call is unchanged, use 'proxy' manually

// Create a simple logger function
const hookLogger = HooksLogger.createHookLogger('debug', 'Custom Hook',
  (hookName) => hookName.includes('ready')
);

// Use as a hook listener
Hooks.on('ready', hookLogger);
Hooks.on('init', hookLogger);

// Convenience method for Foundry hook debugging (in-place modification)
Hooks.once('init', () => {
  if (debugMode) {
    const success = HooksLogger.proxyFoundryHooks({
      enabled: true,
      logLevel: 'debug',
      moduleFilter: 'OMH.',
      functions: { call: true, callAll: true }
    });

    if (success) {
      console.log('Hook logging enabled successfully');
    }
  }
});

// Check if Hooks is available before using
if (HooksLogger.isHooksAvailable()) {
  HooksLogger.proxyFoundryHooks({ moduleFilter: 'myModule.' });
} else {
  // Use Hooks.once('init') for proper timing
  Hooks.once('init', () => HooksLogger.proxyFoundryHooks());
}
```

### 5. ErrorFormatter

**File**: `errorFormatter.js`
**Purpose**: Static utility for formatting error messages with module context and structured output.

#### Key Features:
- ✅ **Module-aware error formatting** - Automatically includes module context
- ✅ **Configurable stack traces** - Optional stack trace inclusion
- ✅ **Caller context** - Optional caller information for debugging
- ✅ **Pattern-based formatting** - Uses configurable templates for consistent output
- ✅ **Error validation** - Ensures proper error objects before formatting

#### Main Methods:
- `formatError(error, options)` - Format error with module context
- `getModuleName()` - Get the current module name for context

#### Usage Examples:

```javascript
import { formatError } from '@/utils/static/errorFormatter.js';

// Basic error formatting
try {
  throw new Error('Something went wrong');
} catch (error) {
  const formatted = formatError(error);
  console.error(formatted); // [ModuleName] Something went wrong
}

// With stack trace and caller info
const formatted = formatError(error, {
  includeStack: true,
  includeCaller: true,
  caller: 'MyFunction'
});
// Output: [ModuleName] MyFunction: Something went wrong
//         Call Stack: ...
```

### 6. Localizer

**File**: `localizer.js`
**Purpose**: Interface for Foundry VTT's i18n localization system with static and instance methods.

#### Key Features:
- ✅ **FoundryVTT integration** - Seamless integration with game.i18n
- ✅ **Instance and static methods** - Flexible usage patterns
- ✅ **Variable substitution** - Support for dynamic string formatting
- ✅ **Key existence checking** - Validate localization keys before use
- ✅ **Fallback handling** - Graceful handling when i18n not available

#### Main Methods:
- `localize(stringId)` - Translate a localization key
- `format(stringId, data)` - Translate with variable substitution
- `has(stringId)` - Check if localization key exists
- `static localize(stringId, i18nInstance)` - Static localization method
- `static format(stringId, data, i18nInstance)` - Static formatting method

#### Usage Examples:

```javascript
import Localizer from '@/utils/static/localizer.js';

// Instance usage
const localizer = new Localizer();
const welcomeText = localizer.localize('MYMODULE.welcome');
const greeting = localizer.format('MYMODULE.greeting', { name: 'Player' });

// Static usage
const text = Localizer.localize('MYMODULE.title');
const formatted = Localizer.format('MYMODULE.playerCount', { count: 5 });

// Check if key exists
if (localizer.has('MYMODULE.optionalText')) {
  const optionalText = localizer.localize('MYMODULE.optionalText');
}

// With custom i18n instance
const customLocalizer = new Localizer(customI18nInstance);
const text = customLocalizer.localize('CUSTOM.key');
```

## 🧪 Testing

All utilities have comprehensive unit tests with 100% coverage:

```bash
# Run all static utility tests
npm test -- src/utils/static/

# Run specific utility tests
npm test -- src/utils/static/validator.unit.test.js
npm test -- src/utils/static/unpacker.unit.test.js
npm test -- src/utils/static/gameManager.unit.test.js
npm test -- src/utils/static/errorFormatter.unit.test.js
npm test -- src/utils/static/localizer.unit.test.js
npm test -- src/utils/static/static.unit.test.js

# Run with coverage
npm test -- src/utils/static/ --coverage
```

### Test Coverage:
- **Validator**: 126 tests covering all methods, edge cases, and error scenarios
- **Unpacker**: 15 tests covering functionality, error handling, and edge cases
- **GameManager**: 25+ tests covering module management, error handling, and edge cases
- **ErrorFormatter**: Unit tests covering error formatting, validation, and edge cases
- **Localizer**: Unit tests covering localization methods, static methods, and error handling
- **HooksLogger**: 50+ tests covering proxy creation, logging, filtering, and Foundry VTT integration
- **StaticUtils**: Unit tests covering central entry point and utility integration
- **Combined**: 100% line, branch, and function coverage

## 🎯 Best Practices

### 1. Import Strategy

**Recommended**: Use StaticUtils for convenience
```javascript
import StaticUtils from '@/utils/static/static.js';
StaticUtils.validate('isString', { value: input });
```

**Alternative**: Direct imports for specific use cases
```javascript
import { Validator } from '@/utils/static/validator.js';
Validator.isString(input);
```

### 2. Validation Patterns

**Defensive Programming**:
```javascript
// Check first, then process
if (StaticUtils.validate('isObject', { value: config })) {
  processConfig(config);
}

// Or validate with errors for required inputs
StaticUtils.validate('validateObject', {
  value: config,
  name: 'configuration'
});
```

**Complex Validation**:
```javascript
// Use the central validate method for consistency
function validateUserData(userData) {
  StaticUtils.validate('validateObject', { value: userData, name: 'userData' });
  StaticUtils.validate('validateObjectKeysExist', {
    value: userData,
    options: { keysToCheck: ['name', 'email'] }
  });
  StaticUtils.validate('validateStringAgainstPattern', {
    value: userData.email,
    name: 'email',
    options: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternDescription: 'a valid email format'
    }
  });
}
```

### 3. Error Handling

```javascript
try {
  StaticUtils.validate('validateString', { value: input, name: 'userInput' });
  StaticUtils.unpack(data, instance, 'module data');
} catch (error) {
  // Errors include context and suggestions
  console.error('Validation failed:', error.message);
  // Handle specific error types if needed
  if (error instanceof TypeError) {
    // Handle type errors
  }
}
```

## 🔧 Configuration and Options

### Validator Options

Many validation methods accept options for customization:

```javascript
// Number validation with constraints
StaticUtils.validate('isNumber', {
  value: 42,
  options: {
    integer: true,      // Must be integer
    positive: true,     // Must be positive
    includeZero: false  // Zero not allowed
  }
});

// Object validation with flexibility
StaticUtils.validate('validateObject', {
  value: obj,
  name: 'config',
  options: {
    allowNull: true,    // Allow null values
    allowEmpty: false,  // Don't allow empty objects
    checkKeys: true     // Validate key types
  }
});
```

### String Pattern Validation

```javascript
// Custom pattern validation
StaticUtils.validate('validateStringAgainstPattern', {
  value: input,
  name: 'identifier',
  options: {
    pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
    patternDescription: 'a valid identifier (letter followed by letters, numbers, or underscores)',
    stringValidationOptions: { allowEmpty: false }
  }
});
```

## 🚨 Common Gotchas

1. **Validator methods are static** - No need to instantiate
2. **Unpacker requires instantiation** - Create with `new Unpacker()`
3. **Symbol keys** - Unpacker handles both string and symbol keys
4. **Error context** - Always provide meaningful names for better error messages
5. **Type vs Validation** - Check methods return boolean, validate methods throw errors

## 🔄 Future Extensions

The static utilities are designed to be easily extensible:

1. **New validation types** can be added to the Validator class
2. **Additional unpacking strategies** can be implemented in Unpacker
3. **New utility classes** can be added and integrated via StaticUtils
4. **Options and configurations** can be extended without breaking existing code

## 📖 API Reference

For detailed API documentation, see the JSDoc comments in each file:
- [StaticUtils API](./static.js) - Central entry point methods
- [Validator API](./validator.js) - All validation methods with examples
- [Unpacker API](./unpacker.js) - Object unpacking functionality
- [GameManager API](./gameManager.js) - Game module management functionality

## 🤝 Contributing

When adding new utilities:

1. **Follow the existing patterns** for consistency
2. **Add comprehensive tests** with edge cases
3. **Include JSDoc documentation** with examples
4. **Update StaticUtils** to include new utilities
5. **Update this README** with new functionality

## 📝 Version History

- **v1.0.0** - Initial implementation with Validator and Unpacker
- **v1.1.0** - Added central validate() method to Validator
- **v1.2.0** - Enhanced StaticUtils as unified entry point
- **v1.3.0** - Added comprehensive documentation and examples
