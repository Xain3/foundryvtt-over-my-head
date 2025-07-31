# Validator.validate() Method

The `validate` method is a central entry point for all validation methods in the Validator class. It provides a unified interface for both check methods (which return boolean values) and validation methods (which throw errors on failure).

## Syntax

```javascript
Validator.validate(validationType, { value, name, options })
```

## Parameters

- `validationType` (string): The type of validation to perform
- `value` (*): The value to validate
- `name` (string, optional): Name of the value for error messages (defaults to context-appropriate names)
- `options` (Object, optional): Options specific to the validation type

## Supported Validation Types

### Check Methods (return boolean)

- `isDefined` - Checks if value is not undefined
- `isNull` - Checks if value is null
- `isString` - Checks if value is a string
- `isObject` - Checks if value is an object (supports `expectedPrototypeName` option)
- `isArray` - Checks if value is an array
- `isPlainObject` - Checks if value is a plain object
- `isNumber` - Checks if value is a number (supports `integer`, `float`, `positive`, `negative`, `includeZero` options)
- `isEmpty` - Checks if value is empty (string, array, or object)
- `isBoolean` - Checks if value is a boolean
- `isPrimitive` - Checks if value is a primitive type
- `isReservedKey` - Checks if a key is reserved (supports `classPrototypes`, `additionalReservedKeys`, `instance` options)

### Validation Methods (throw on failure)

- `validateObject` - Validates object structure (supports `allowNull`, `allowEmpty`, `checkKeys` options)
- `validateString` - Validates string type (supports `allowEmpty` option)
- `validateNumber` - Validates number type (supports `isInt`, `min`, `max`, `allowFutureTimestamp` options)
- `validateDate` - Validates date objects or date strings
- `validateArgsObjectStructure` - Validates argument object structure
- `validateSchemaDefinition` - Validates schema definition objects
- `validateStringAgainstPattern` - Validates string against regex pattern (requires `pattern`, `patternDescription` options)
- `validateObjectKeysExist` - Validates object key existence (requires `keysToCheck` option, supports `objectName`)

## Examples

### Basic Type Checking

```javascript
// Check if value is a string
const isString = Validator.validate('isString', { value: 'hello' }); // true

// Check if value is a number with constraints
const isPositiveInt = Validator.validate('isNumber', { 
  value: 42, 
  options: { integer: true, positive: true } 
}); // true
```

### Validation with Error Throwing

```javascript
try {
  // Validate string input
  Validator.validate('validateString', { 
    value: userInput, 
    name: 'username' 
  });
  
  // Validate number range
  Validator.validate('validateNumber', { 
    value: age, 
    name: 'age',
    options: { min: 0, max: 120 }
  });
  
  console.log('Validation passed!');
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

### Pattern Validation

```javascript
// Validate email format
Validator.validate('validateStringAgainstPattern', { 
  value: email, 
  name: 'email',
  options: { 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
    patternDescription: 'a valid email format' 
  }
});
```

### Object Validation

```javascript
// Validate object structure and required keys
Validator.validate('validateObject', { 
  value: userData, 
  name: 'userData',
  options: { allowEmpty: false }
});

Validator.validate('validateObjectKeysExist', { 
  value: userData,
  options: { 
    keysToCheck: ['name', 'email', 'age'],
    objectName: 'user data'
  }
});
```

## Error Handling

- Check methods return `true` or `false`
- Validation methods return `void` on success or throw descriptive errors on failure
- Error messages include the provided name and specific validation details
- Unsupported validation types throw an error listing all available types

## Benefits

1. **Unified Interface**: Single method for all validation needs
2. **Consistent Error Messages**: Standardized error formatting across all validations
3. **Flexible Options**: Each validation type supports its specific options
4. **Type Safety**: Clear distinction between check and validation methods
5. **Extensible**: Easy to add new validation types to the central mapping
