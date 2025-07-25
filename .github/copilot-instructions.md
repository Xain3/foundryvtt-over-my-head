### Javascript Settings ###
- Use ES6 syntax for all code.
- Use `const` and `let` instead of `var`.
- Use arrow functions instead of function expressions.
- Use template literals instead of string concatenation.
- Use destructuring assignment for objects and arrays.
- Use async/await for asynchronous code instead of callbacks or promises.
- Use `import` and `export` for module imports and exports.
- Use `class` syntax for creating classes.

  #### Code Style ####
- Prefer 2-space indentation over tabs.
- Prepend the file with a comment block that includes the file name, description, and path, in the format:
  ```javascript
  /**
  * @file the file name
  * @description This file contains a function to get the context of a given element.
  * @path the relative path from the project root to the file
  */

  {{{Imports}}}

  {{{Jest Mocks}}}

  {{{Code}}}

  ```
This comment block should be placed at the top of the file, before any other code, imports or comments.
- Put private functions or methods at the top of the file, and public functions at the bottom. This can help improve organization and readability.
- When possible, put functions or methods that are called inside other functions at before the function(s) that call them (unless the caller is a constructor). This can help improve organization and readability.
- When many functions or methods are defined in a single file, consider grouping them by functionality or purpose. This can help improve organization and readability.
- When several functions or methods in a single file are related, consider using a class to group them together. This can help improve organization and readability.
- When several functions or methods in a single file are similar, consider using a higher-order function to select them. This can help improve organization and readability.

  #### JSDoc Comments ####
- Use JSDoc comments for function documentation.
- Write JSDoc for classes.
- Properties should be documented in the class JSDoc comment or in the class or constructor’s main JSDoc block
- JSDoc for classes inheriting from another class should include the parent class name and indicate the inherited methods and properties that are used or overridden within the class.
- Write JSDoc comments for all functions, including parameters (using `@param`) and return (using `@returns`) types.
- For exported classes, functions, and variables, use `@export` to indicate that they are part of the public API.
- For exported class, include the public API in the JSDoc comment block.

  #### Conditional Statements ####
- For simple flag checks, use a single line if statement (for example `if (flag) doSomething();`). Single-line if statements should not be used for complex conditions, or for long variable names.

_Correct usage:_
```javascript
if (flag) doSomething();
```

_Incorrect usage:_
```javascript
if (flag && flag2 && veryLongFlag3) doAVeryLongFunctionNameWith(a, lotta, parameters);
```

- For complex conditions, use a multi-line if statement.
```javascript
if (flag && flag2 && veryLongFlag3) {
  doAVeryLongFunctionNameWith(a, lotta, parameters);
} else {
  doSomethingElse();
}
```

#### Naming Conventions ####
- Use camelCase for variable and function names.
- Use PascalCase for class names.
- Use UPPER_SNAKE_CASE for constants.
- Use meaningful names for variables and functions.
- Avoid using single-letter variable names, except for loop counters (e.g., `i`, `j`, `k`).
- Use `is` or `has` prefix for boolean variables and functions (e.g., `isValid`, `hasPermission`).
- Use `get` prefix for getter functions (e.g., `getUser`, `getData`).
- Use `set` prefix for setter functions (e.g., `setUser`, `setData`).
- Use `on` prefix for event handler functions (e.g., `onClick`, `onChange`).
- Use `handle` prefix for functions that handle events (e.g., `handleClick`, `handleChange`).
- Use `create` prefix for functions that create objects (e.g., `createUser`, `createData`).
- Use `update` prefix for functions that update objects (e.g., `updateUser`, `updateData`).
- Use `delete` prefix for functions that delete objects (e.g., `deleteUser`, `deleteData`).
- Use `validate` prefix for functions that validate data (e.g., `validateUser`, `validateData`).
- Use `format` prefix for functions that format data (e.g., `formatDate`, `formatCurrency`).
- Use `parse` prefix for functions that parse data (e.g., `parseDate`, `parseCurrency`).
- Use `calculate` prefix for functions that perform calculations (e.g., `calculateTotal`, `calculateAverage`).

#### Function Length ####
- Functions should be kept short and focused on a single task.
- If a function is longer than 20 lines, consider breaking it into smaller functions.
- Avoid deeply nested functions. If a function has more than 3 levels of nesting, consider refactoring it.
- Use early returns to reduce nesting and improve readability.
- Avoid using `else` statements after `if` statements that return or throw an error. This can help reduce nesting and improve readability.

#### Code Quality ####
- Avoid using `eval` and `with` statements. These can lead to security vulnerabilities and make code harder to read and maintain.
- Use `switch` statements for multiple conditions instead of multiple `if` statements.
- Use `for...of` or `forEach` for iterating over arrays instead of `for` loops.
- Use `for...in` for iterating over object properties instead of `for` loops.
- Use `map`, `filter`, and `reduce` for array transformations instead of `for` loops.
- Use `find` and `some` for searching arrays instead of `for` loops.
- Use `every` for checking all elements in an array instead of `for` loops.
- Use `includes` for checking if an array contains a value instead of `for` loops.
- Use `Object.keys`, `Object.values`, and `Object.entries` for iterating over objects instead of `for` loops.
- Use `Object.assign` or the spread operator for merging objects instead of `for` loops.
- Use `Object.freeze` for making objects immutable instead of `for` loops.
- Use `Object.seal` for preventing new properties from being added to an object instead of `for` loops.

#### Error Handling ####
- Use `try...catch` for error handling.
- Use `throw` for throwing errors.
- Use `console.error` for logging errors.
- Use `console.warn` for logging warnings.
- Use `console.info` for logging informational messages.
- Use `console.debug` for logging debug messages.
- Use `console.log` for logging general messages.
- Use `console.table` for logging arrays and objects in a table format.
- Use `console.group` and `console.groupEnd` for grouping log messages.

#### Testing ####
- Write unit tests for all functions and classes.
- Unit tests should be independent and not rely on external resources (e.g., databases, APIs).
- Unit test files are named with the `.unit.test.js` suffix and are placed in the same directory as the tested file.
- Integration test files are named with the `.int.test.js` suffix and are placed in the `tests/integration` directory.
- Setup test files are named with the `.setup.test.js` suffix and are placed in the `tests/setup` directory.
- Use `beforeEach` and `afterEach` for setup and teardown of tests.
- Use `beforeAll` and `afterAll` for setup and teardown of tests that run once for all tests.
- Use `expect` for assertions in tests.
- Use `toBe` for checking primitive values.
- Use `toEqual` for checking objects and arrays.
- Use `toBeTruthy` and `toBeFalsy` for checking truthy and falsy values.
- Use `toBeNull` for checking null values.
- Use `toBeUndefined` for checking undefined values.
- Use `toBeDefined` for checking defined values.
- Use `toBeInstanceOf` for checking instance of a class.
- Use `toHaveLength` for checking length of arrays and strings.
- Use `toHaveProperty` for checking properties of objects.
- Use `toThrow` for checking if a function throws an error.
- Use `toMatch` for checking if a string matches a regular expression.
- Use `toContain` for checking if an array contains a value.
- Use `Jest` for unit testing.
- Use `describe` for grouping related tests.
- Prefer `it` instead of `test` for defining individual tests.
- Aim for 100% test coverage, but prioritize meaningful tests over achieving coverage metrics.
- Tests for functions should aim to include:
  - Input validation
  - Successful cases
  - Error cases and handling
  - Edge cases
  - Constants integration
  - Alternative constants configuration
  - Real-world scenarios
  - Any other relevant scenarios that ensure the function behaves as expected in all situations.

- Tests for classes should aim to include:
  - Initialization and setup
  - Constructor parameter validation
  - Method functionality
  - Property access and modification
  - Inheritance behavior (if applicable)
  - State management
  - Error cases and handling
  - Edge cases
  - Constants integration
  - Alternative constants configuration
  - Real-world scenarios
  - Any other relevant scenarios that ensure the class behaves as expected in all situations.