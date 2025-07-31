/**
 * @file validator-usage.js
 * @description Example usage of the Validator.validate() method
 * @path examples/validator-usage.js
 */

import { Validator } from '../src/utils/static/validator.js';

// Example usage of the new validate() method

console.log('=== Validator.validate() Usage Examples ===\n');

// 1. Check methods (return boolean)
console.log('1. Check Methods:');

// Basic type checking
console.log('  isDefined("hello"):', Validator.validate('isDefined', { value: 'hello' })); // true
console.log('  isString(123):', Validator.validate('isString', { value: 123 })); // false
console.log('  isNumber(42):', Validator.validate('isNumber', { value: 42 })); // true

// Array and object checking
console.log('  isArray([1,2,3]):', Validator.validate('isArray', { value: [1, 2, 3] })); // true
console.log('  isObject({}):', Validator.validate('isObject', { value: {} })); // true
console.log('  isEmpty(""):', Validator.validate('isEmpty', { value: '' })); // true

// Number validation with options
console.log('  isNumber(42, {integer: true}):', 
  Validator.validate('isNumber', { 
    value: 42, 
    options: { integer: true } 
  })); // true

console.log('  isNumber(3.14, {integer: true}):', 
  Validator.validate('isNumber', { 
    value: 3.14, 
    options: { integer: true } 
  })); // false

console.log('\n2. Validation Methods (throw on failure):');

// String validation
try {
  Validator.validate('validateString', { value: 'hello', name: 'userInput' });
  console.log('  ✓ String validation passed');
} catch (error) {
  console.log('  ✗ String validation failed:', error.message);
}

try {
  Validator.validate('validateString', { value: 123, name: 'userInput' });
  console.log('  ✓ String validation passed');
} catch (error) {
  console.log('  ✗ String validation failed:', error.message);
}

// Object validation with options
try {
  Validator.validate('validateObject', { 
    value: { key: 'value' }, 
    name: 'configObject',
    options: { allowEmpty: false }
  });
  console.log('  ✓ Object validation passed');
} catch (error) {
  console.log('  ✗ Object validation failed:', error.message);
}

// Number validation with constraints
try {
  Validator.validate('validateNumber', { 
    value: 15, 
    name: 'age',
    options: { min: 18, max: 100 }
  });
  console.log('  ✓ Number validation passed');
} catch (error) {
  console.log('  ✗ Number validation failed:', error.message);
}

// Pattern validation
try {
  Validator.validate('validateStringAgainstPattern', { 
    value: 'hello', 
    name: 'username',
    options: { 
      pattern: /^[a-z]+$/, 
      patternDescription: 'lowercase letters only' 
    }
  });
  console.log('  ✓ Pattern validation passed');
} catch (error) {
  console.log('  ✗ Pattern validation failed:', error.message);
}

// Key existence validation
try {
  Validator.validate('validateObjectKeysExist', { 
    value: { name: 'John', age: 30 }, 
    name: 'userObject',
    options: { 
      keysToCheck: ['name', 'email'],
      objectName: 'user data'
    }
  });
  console.log('  ✓ Key existence validation passed');
} catch (error) {
  console.log('  ✗ Key existence validation failed:', error.message);
}

console.log('\n3. Usage Patterns:');

// Validation in a function
function processUserData(userData) {
  try {
    // Validate that userData is an object
    Validator.validate('validateObject', { 
      value: userData, 
      name: 'userData' 
    });
    
    // Validate required keys exist
    Validator.validate('validateObjectKeysExist', { 
      value: userData, 
      options: { keysToCheck: ['name', 'email'] }
    });
    
    // Validate name is a non-empty string
    Validator.validate('validateString', { 
      value: userData.name, 
      name: 'name' 
    });
    
    // Validate email format
    Validator.validate('validateStringAgainstPattern', { 
      value: userData.email, 
      name: 'email',
      options: { 
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
        patternDescription: 'a valid email format' 
      }
    });
    
    console.log('  ✓ User data validation passed');
    return true;
  } catch (error) {
    console.log('  ✗ User data validation failed:', error.message);
    return false;
  }
}

// Test the function
console.log('\n  Testing processUserData():');
processUserData({ name: 'John', email: 'john@example.com' }); // Should pass
processUserData({ name: 'John' }); // Should fail - missing email
processUserData({ name: 'John', email: 'invalid-email' }); // Should fail - invalid email

console.log('\n=== End Examples ===');
