# Static Utilities

This folder contains static utility classes that provide common functionality for data validation, object manipulation, and other utility operations. All utilities are designed to be stateless and can be used throughout the application without instantiation (except where noted).

## 📁 Folder Structure

```
src/utils/static/
├── README.md                   # This documentation
├── static.js                   # Central entry point (StaticUtils)
├── validator.js                # Data validation utilities
├── validator.unit.test.js      # Validator tests
├── unpacker.js                 # Object property unpacking utilities
└── unpacker.unit.test.js       # Unpacker tests
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

// Get available utilities info
const info = StaticUtils.getUtilityInfo();
console.log(info.utilities); // ['Validator', 'Unpacker']
```

### Using Individual Classes

You can also import and use individual utility classes directly:

```javascript
import { Validator } from '@/utils/static/validator.js';
import Unpacker from '@/utils/static/unpacker.js';

// Direct validation
const isString = Validator.isString('hello'); // true
Validator.validateObject(obj, 'testObject');

// Direct unpacking
const unpacker = new Unpacker();
unpacker.unpack(data, instance);
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

## 🧪 Testing

All utilities have comprehensive unit tests with 100% coverage:

```bash
# Run all static utility tests
npm test -- src/utils/static/

# Run specific utility tests
npm test -- src/utils/static/validator.unit.test.js
npm test -- src/utils/static/unpacker.unit.test.js

# Run with coverage
npm test -- src/utils/static/ --coverage
```

### Test Coverage:
- **Validator**: 126 tests covering all methods, edge cases, and error scenarios
- **Unpacker**: 15 tests covering functionality, error handling, and edge cases
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
