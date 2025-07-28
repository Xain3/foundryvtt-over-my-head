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

  #### Commit Messages ####
- Use the present tense for commit messages (e.g., "Add feature" instead of "Added feature").
- Use the imperative mood for commit messages (e.g., "Fix bug" instead than "Fixed bug").
- Avoid using first-person pronouns like 'I' or 'we'.
- Use a short summary (50 characters or less) for the commit message.
- Use a longer description (72 characters or less per line) for the commit message body, if necessary.
- Ensure that the message is clear and easy to understand.
- The body can be structured with markdown for better readability.
- The body should start with the main changes made in the commit, and then add any additional context or information that may be useful for understanding the commit.
- Use bullets for lists in the commit message body, if necessary.
- Separate the summary from the body with a blank line.
- Use the body to explain the "why" behind the changes, not just the "what".
- Use the body to provide context, motivation, and any relevant information that may help others understand the changes.
- Use the body to explain any breaking changes, if applicable.
- Use the body to explain any related issues or pull requests, if applicable.
- Use the body to explain any relevant links or references, if applicable.
- Use the body to explain any relevant context or background information, if applicable.
- Use the body to explain any relevant implementation details, if applicable.
- Use the body to explain any relevant testing details, if applicable.
- Use the body to explain any relevant performance considerations, if applicable.
- Use the body to explain any relevant security considerations, if applicable.
- Use the body to explain any relevant compatibility considerations, if applicable.
- Use the body to explain any relevant deployment considerations, if applicable.
- Use the body to explain any relevant documentation considerations, if applicable.
- Use the body to explain any relevant code style considerations, if applicable.
- Use the body to explain any relevant code quality considerations, if applicable.
- Use bullet points for the commit message body, if necessary.
- Use the following format for commit messages:
  ```
  <type>(<scope>): <subject>

  <body>
  ```
- The `<type>` can be one of the following:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation only changes
  - `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
  - `refactor`: A code change that neither fixes a bug nor adds a feature
  - `perf`: A code change that improves performance
  - `test`: Adding missing tests or correcting existing tests
  - `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
  - `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
  - `chore`: Other changes
- The `<scope>` is optional and can be used to indicate the area of the codebase that the commit affects (e.g., `ui`, `api`, `database`, etc.).
- The `<subject>` is a brief summary of the changes made in the commit.
- The `<body>` is an optional longer description of the changes made in the commit. It can include details about the motivation for the changes, any relevant context, and any other information that may be useful for understanding the commit.
- If the commit is a work in progress, use 'WIP' in the message.
- If the commit is a merge, use 'Merge branch <branch_name>'.
- If the commit is a revert, use 'Revert <commit_hash>'.
