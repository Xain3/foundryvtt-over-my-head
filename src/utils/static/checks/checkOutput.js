/**
 * @class CheckOutput
 * @classdesc
 * Manages the execution and results of a series of check functions.
 * It initializes with various parameters related to checks and their expected states,
 * and provides methods to add, run, and track the outcomes of these checks.
 * The class also handles errors gracefully, both during initialization and check execution.
 *
 * @property {Error[]} initializationErrors - Stores any errors encountered during the initialization or reset
 *           of the CheckOutput instance. These are internal errors related to the setup of CheckOutput
 *           itself (e.g., invalid arguments passed to the constructor or reset method).
 * @property {Function[]} checks - An array of functions to be executed as checks. Initialized from the `checks` constructor parameter.
 * @property {Array} successful - An array storing checks (typically functions) that executed successfully. Initialized from the `successful` constructor parameter.
 * @property {Array} failed - An array storing checks (typically functions) that failed during execution. Initialized from the `failed` constructor parameter.
 * @property {Error[]} errors - An array storing errors thrown by failed checks during their execution via `runChecks`. Initialized from the `errors` constructor parameter.
 * @property {any[]} args - An array storing arguments associated with the checks. Initialized from the `args` constructor parameter.
 * @property {any[]} values - An array storing values used or processed by the checks. Initialized from the `values` constructor parameter.
 * @property {Object[]} containers - An array storing container objects related to the checks. Initialized from the `containers` constructor parameter.
 * @property {string[]} allowedTypes - An array storing allowed type strings, potentially for validation within checks. Initialized from the `allowedTypes` constructor parameter.
 * @property {any[]} results - An array storing the results returned by the checks. Initialized from the `results` constructor parameter.
 * @property {boolean|undefined} outcome - The overall outcome of all checks.
 *           It is `true` if `runChecks()` results in one or more successful checks and no failed checks.
 *           It is `false` if `runChecks()` results in any failed checks.
 *           It is `undefined` initially, if no checks are run, or if checks run but result in no successes and no failures.
 *
 * @property {Class<Error & {name: 'InitializationError'}>} InitializationError
 *           A nested class definition for custom errors that occur during the initialization or resetting of a `CheckOutput` instance.
 *           Instances of this error indicate issues with the parameters provided to the constructor or `reset` method.
 *           The error message will be prefixed with 'Error in initializing or resetting CheckOutput: '.
 *           Inherits from `Error`.
 *           @param {string} message - The specific error message detailing the initialization issue.
 *
 * @constructor
 * @param {object} params - The parameters for initializing the CheckOutput instance.
 * @param {Function|Function[]} params.checks - A single check function or an array of check functions.
 *                                             If not a function or a non-empty array of functions, an `InitializationError` is recorded and `this.checks` becomes an empty array.
 * @param {Array} [params.successful=[]] - An initial array of successful checks. If not an array, an `InitializationError` is recorded and `this.successful` becomes an empty array.
 * @param {Array} [params.failed=[]] - An initial array of failed checks. If not an array, an `InitializationError` is recorded and `this.failed` becomes an empty array.
 * @param {Array} [params.errors=[]] - An initial array of errors encountered during checks. If not an array, an `InitializationError` is recorded and `this.errors` becomes an empty array.
 * @param {any[]|Object} [params.args=[]] - Initial arguments for checks. If a single object is provided, it's wrapped in an array. If not an array or object, an `InitializationError` is recorded and `this.args` becomes an empty array.
 * @param {any|any[]} [params.values=[]] - Initial values for checks. If a single value (object, string, number, boolean, function, null) is provided, it's wrapped in an array. If not an array or a supported single type, an `InitializationError` is recorded and `this.values` becomes an empty array.
 * @param {Object|Object[]} [params.containers=[]] - Initial containers for checks. If a single object is provided, it's wrapped in an array. If not an array or object, an `InitializationError` is recorded and `this.containers` becomes an empty array.
 * @param {string|string[]} [params.allowedTypes=[]] - Initial allowed types. If a single string is provided, it's wrapped in an array. If not an array or string, an `InitializationError` is recorded and `this.allowedTypes` becomes an empty array.
 * @param {Array} [params.results=[]] - Initial results of checks. If not an array, an `InitializationError` is recorded and `this.results` becomes an empty array.
 * @param {string} [params.ifInitializationErrors='throw'] - Determines the behavior when initialization errors occur. If set to 'throw', an error is thrown. If set to 'return', the method returns false.
 *
 * Public Methods:
 * - `addChecks(checks)`: Adds one or multiple checks to the current instance.
 * - `runChecks()`: Executes all checks and updates the successful, failed, and errors arrays accordingly.
 * - `addSuccessful(check)`: Adds a check to the list of successful checks.
 * - `addFailed(check)`: Adds a failed check to the list of failed checks.
 * - `addValue(values)`: Adds a value or an array of values to the values array.
 * - `addResult(results)`: Adds a result to the results array.
 * - `addArg(args)`: Adds an argument to the list of arguments.
 * - `addError(errors)`: Adds one or more errors to the internal errors array.
 * - `setOutcome(outcome)`: Sets the outcome value for this instance.
 * - `success()`: Marks the overall outcome as successful.
 * - `failure()`: Marks the overall outcome as a failure.
 * - `reset(checks, successful, failed, errors, args, values, containers, allowedTypes, results)`: Resets the internal state of the object with the provided arrays or default empty arrays.
 */
class CheckOutput {
  constructor({
    checks,
    successful = [],
    failed = [],
    errors = [], // errors encountered during the checks
    args = [], // arguments passed to each check
    values = [], // values passed to each check
    containers = [], // containers passed to each check
    allowedTypes = [], // allowed types for each check
    results = [], // results of each check
    ifInitializationErrors = 'throw', // flag to throw an error if initialization errors occur
  }) {
    this.initializationErrors = []; // internal errors encountered during the checks
    this.checks = this.#initializeChecks(checks); // array of checks to be performed
    this.successful = this.#initializeSuccessful(successful); // successful checks
    this.failed = this.#initializeFailed(failed); // failed checks
    this.errors = this.#initializeErrors(errors); // errors encountered during the checks
    this.args = this.#initializeArgs(args); // arguments passed to each check
    this.values = this.#initializeValues(values); // values passed to each check
    this.containers = this.#initializeContainers(containers); // containers passed to each check
    this.allowedTypes = this.#initializeAllowedTypes(allowedTypes); // allowed types for each check
    this.results = this.#initializeResults(results); // results of each check
    this.outcome = undefined; // overall outcome of the checks (true or false)
    this.#checkCorrectInitialization(ifInitializationErrors); // check for any initialization errors
  }

  #handleInitializationErrors(ifInitializationErrors) {
    switch (ifInitializationErrors) {
      case 'throw':
        throw new InitializationError('Initialization errors occurred');
      case 'return':
        return false;
      case 'warn':
        console.warn('Initialization errors occurred:', this.initializationErrors);
        break;
      case 'log':
        console.log('Initialization errors occurred:', this.initializationErrors);
        break;
      case 'silent':
        // Do nothing, errors are ignored
        break;
      default:
        console.error('Initialization errors occurred:', this.initializationErrors);
    }
  }

  #checkCorrectInitialization(ifInitializationErrors) {
    if (this.initializationErrors.length > 0) {
      this.#handleInitializationErrors(ifInitializationErrors);
      return false;
    }
    return true;
  }

  InitializationError = class extends Error {
    constructor(message) {
      const errorMessage = 'Error in initializing or resetting CheckOutput: ' + message + "\n Returning empty arrays";
      super(errorMessage);
      this.name = 'InitializationError';
    }
  }

  /**
   * Initializes and validates the provided checks.
   *
   * @private
   * @param {Function|Function[]} checks - A single check function or an array of check functions.
   * @returns {Function[]} An array of check functions.
   * @throws {Error} If the input is not a function or an array of functions, or if the array is empty or contains non-function elements.
   */
  #initializeChecks(checks) {
    try {
      if (Array.isArray(checks)) {
        if (checks.length === 0) {
          throw new InitializationError('Checks array cannot be empty');
        }
        if (!checks.every((check) => typeof check === 'function')) {
          throw new InitializationError('All checks must be functions');
        }
        return checks;
      } else if (typeof checks === 'function') {
        return [checks];
      } else {
        throw new InitializationError('Invalid checks: must be an array or a function');
      }
    } catch (error) {
      this.initializationErrors.push(error);
      return []; // Return an empty array to indicate no valid checks
    }
  }

  /**
   * Validates that the provided `successful` parameter is an array.
   *
   * @private
   * @param {any} successful - The value to validate as an array.
   * @returns {Array} The validated array if `successful` is an array.
   * @throws {Error} Throws an error if `successful` is not an array.
   */
  #initializeSuccessful(successful) {
    try {
      if (Array.isArray(successful)) {
        return successful;
      } else {
        throw new InitializationError('Invalid successful: must be an array');
      }
    } catch (error) {
      this.initializationErrors.push(error);
      return []; // Return an empty array to indicate no valid successful checks
    }
  }
  /**
   * Initializes and validates the 'failed' parameter.
   * Ensures that the provided argument is an array.
   *
   * @param {any} failed - The value to validate as an array.
   * @returns {Array} The validated array if input is an array.
   * @throws {Error} Throws an error if 'failed' is not an array.
   */
  #initializeFailed(failed) {
    try {
      if (Array.isArray(failed)) {
        return failed;
      } else {
        throw new InitializationError('Invalid failed: must be an array');
      }
    } catch (error) {
      this.initializationErrors.push(error);
      return []; // Return an empty array to indicate no valid failed checks
    }
  }
  /**
   * Validates that the provided `errors` parameter is an array and returns it.
   * Throws an error if the input is not an array.
   *
   * @param {any} errors - The value to validate as an array of errors.
   * @returns {Array} The validated array of errors.
   * @throws {Error} If `errors` is not an array.
   */
  #initializeErrors(errors) {
    try {
      if (Array.isArray(errors)) {
        return errors;
      } else {
        throw new InitializationError('Invalid errors: must be an array');
      }
    } catch (error) {
      this.initializationErrors.push(error);
      return []; // Return an empty array to indicate no valid errors
    }
  }

  /**
   * Initializes the arguments by ensuring they are returned as an array.
   *
   * @param {any[]|Object} args - The arguments to initialize, which can be an array or an object.
   * @returns {any[]} The arguments wrapped in an array if necessary.
   * @throws {InitializationError} Throws an error if args is neither an array nor an object.
   */
  #initializeArgs(args) {
    try {
      if (Array.isArray(args)) {
        return args;
      } else if (typeof args === 'object') {
        return [args];
      } else {
        throw new InitializationError('Invalid args: must be an array or an object');
      }
    } catch (error) {
      this.initializationErrors.push(error);
      return []; // Return an empty array to indicate no valid args
    }
  }

  #checkSingleValues(values) {
    if (Array.isArray(values)) {
      return false;
    }
    switch (typeof values) {
      case 'object':
        return true;
      case 'string':
        return true;
      case 'number':
        return true;
      case 'boolean':
        return true;
      case 'function':
        return true;
      case null:
        return true;
    }
  }

  /**
   * Normalizes the input `values` into an array.
   *
   * - If `values` is already an array, returns it as-is.
   * - If `values` is an object, string, number, boolean, or function, wraps it in an array.
   * - Throws an error if `values` is of an unsupported type.
   *
   * @param {*} values - The value(s) to normalize into an array.
   * @returns {Array} The normalized array of values.
   * @throws {InitializationError} If `values` is not an array, object, string, number, boolean, or function.
   */
  #initializeValues(values) {
    try {
      if (Array.isArray(values)) {
        return values;
      } else if (this.#checkSingleValues(values)) {
        return [values];
      }
      throw new InitializationError('Invalid values: must be an array');
    } catch (error) {
      this.initializationErrors.push(error);
      return []; // Return an empty array to indicate no valid values
    }
  }
  /**
   * Initializes the containers by ensuring the input is returned as an array.
   *
   * @private
   * @param {Object|Object[]} containers - The container(s) to initialize. Can be a single object or an array of objects.
   * @returns {Object[]} An array of container objects.
   * @throws {InitializationError} Throws an error if the input is neither an array nor an object.
   */
  #initializeContainers(containers) {
    try {
      if (Array.isArray(containers)) {
        return containers;
      } else if (typeof containers === 'object') {
        return [containers];
      } else {
        throw new InitializationError('Invalid containers: must be an array or an object');
      }
    } catch (error) {
      this.initializationErrors.push(error);
      return []; // Return an empty array to indicate no valid containers
    }
  }
  /**
   * Initializes the allowed types by ensuring the input is returned as an array.
   *
   * @param {string|string[]} allowedTypes - The allowed types, either as a string or an array of strings.
   * @returns {string[]} An array of allowed types.
   * @throws {InitializationError} If allowedTypes is neither a string nor an array.
   */
  #initializeAllowedTypes(allowedTypes) {
    try {
      if (Array.isArray(allowedTypes)) {
        return allowedTypes;
      } else if (typeof allowedTypes === 'string') {
        return [allowedTypes];
      } else {
        throw new InitializationError('Invalid allowedTypes: must be an array or a string');
      }
    } catch (error) {
      this.initializationErrors.push(error);
      return []; // Return an empty array to indicate no valid allowed types

    }
  }
  /**
   * Validates that the provided results parameter is an array.
   *
   * @private
   * @param {*} results - The results to validate.
   * @returns {Array} The validated results array.
   * @throws {InitializationError} If results is not an array.
   */
  #initializeResults(results) {
    try {
      if (Array.isArray(results)) {
        return results;
      } else {
        throw new InitializationError('Invalid results: must be an array');
      }
    } catch (error) {
      this.initializationErrors.push(error);
      return []; // Return an empty array to indicate no valid results
    }
  }

  /**
   * Adds a check function to the list of checks.
   *
   * @private
   * @param {Function} check - The check function to add.
   * @throws {TypeError} Throws if the provided check is not a function.
   */
  #addCheck(check) {
    const typeErrorPrefix = 'Error when adding check: ';
    if (typeof check !== 'function') {
      throw new TypeError(typeErrorPrefix + 'Check must be a function');
    }
    this.this.checks.push(check);
  }
  /**
   * Adds one or multiple checks to the current instance.
   * If an array of checks is provided, each check is added individually.
   * Otherwise, a single check is added.
   *
   * @param {Function|Function[]} checks - A single check function or an array of check functions to add.
   */
  addChecks(checks) {
    if (Array.isArray(checks)) {
      for (const check of checks) {
        this.#addCheck(check);
      }
    } else {
      this.#addCheck(checks);
    }
  }

  /**
   * Runs all checks in the checks array.
   * If a check fails, it is added to the failed array and an error is recorded.
   * If a check succeeds, it is added to the successful array.
   * The overall outcome is set based on the results of the checks.
   *
   * @returns {boolean} True if all checks passed, false otherwise.
   */
  runChecks() {
    if (this.checks.length === 0) {
      this.setOutcome(undefined);
      console.warn('No checks to run');
      return false;
    }
    for (const check of this.checks) {
      try {
        check();
        this.addSuccessful(check);
      } catch (error) {
        this.addFailed(check);
        this.addError(error);
      }
    }
    if (this.failed.length > 0) {
      this.failure();
      return false;
    } else if (this.successful.length > 0) {
      this.success();
      return true;
    } else {
      this.setOutcome(undefined);
      return false;
    }
  }
  /**
   * Adds a check to the list of successful checks.
   *
   * @param {Object} check - The check object to add to the successful list.
   */
  addSuccessful(check) {
    this.successful.push(check);
  }
  /**
   * Adds a failed check to the list of failed checks.
   *
   * @param {any} check - The check to add to the failed checks array.
   */
  addFailed(check) {
    this.failed.push(check);
  }
  /**
   * Adds a value or an array of values to the `values` array.
   * If the value passes the `#checkSingleValues` check, it is added directly.
   * If the value is an array, its elements are spread and added.
   *
   * @param {*} values - The value or array of values to add.
   */
  addValue(values) {
    if (this.#checkSingleValues(values)) {
      this.values.push(values);
      return;
    }
    if (Array.isArray(values)) {
      this.values.push(...values);
      return;
    }
  }
  /**
   * Adds a result to the results array.
   *
   * @param {*} results - The result or results to add.
   */
  addResult(results) {
    if (Array.isArray(results)) {
      this.results.push(...results);
      return;
    }
    this.results.push(results);
  }
  /**
   * Adds an argument to the list of arguments.
   *
   * @param {*} args - The argument or arguments to add.
   */
  addArg(args) {
    if (Array.isArray(args)) {
      this.args.push(...args);
      return;
    }
    this.args.push(args);
  }

  /**
   * Adds one or more errors to the internal errors array.
   *
   * @param {Error|Error[]} errors - A single error or an array of errors to add.
   */
  addError(errors) {
    if (Array.isArray(errors)) {
      this.errors.push(...errors);
      return;
    }
    this.errors.push(errors);
  }
  /**
   * Sets the outcome value for this instance.
   *
   * @param {*} outcome - The outcome to assign.
   */
  setOutcome(outcome) {
    this.outcome = outcome;
  }
  /**
   * Marks the overall outcome as successful by setting the outcome to true.
   * @returns {void}
   */
  success() {
    this.setOutcome(true);
  }
  /**
   * Marks the overall outcome as a failure by setting the outcome to false.
   * Typically used to indicate that a check did not succeed.
   */
  failure() {
    this.setOutcome(false);
  }
  /**
   * Resets the internal state of the object with the provided arrays or default empty arrays.
   *
   * @param {Array} [checks=[]] - The list of checks to initialize.
   * @param {Array} [successful=[]] - The list of successful checks to initialize.
   * @param {Array} [failed=[]] - The list of failed checks to initialize.
   * @param {Array} [errors=[]] - The list of errors to initialize.
   * @param {Array} [args=[]] - The list of arguments to initialize.
   * @param {Array} [values=[]] - The list of values to initialize.
   * @param {Array} [containers=[]] - The list of containers to initialize.
   * @param {Array} [allowedTypes=[]] - The list of allowed types to initialize.
   * @param {Array} [results=[]] - The list of results to initialize.
   * @param {string} [ifInitializationErrors='warn'] - The behavior when initialization errors occur.
   */
  reset(
    checks,
    successful = [],
    failed = [],
    errors = [],
    args = [],
    values = [],
    containers = [],
    allowedTypes = [],
    results = [],
    ifInitializationErrors = 'warn'
  ) {
    this.initializationErrors = [];
    this.checks = this.#initializeChecks(checks);
    this.successful = this.#initializeSuccessful(successful);
    this.failed = this.#initializeFailed(failed);
    this.errors = this.#initializeErrors(errors);
    this.args = this.#initializeArgs(args);
    this.values = this.#initializeValues(values);
    this.containers = this.#initializeContainers(containers);
    this.allowedTypes = this.#initializeAllowedTypes(allowedTypes);
    this.results = this.#initializeResults(results);
    this.outcome = undefined;
    this.#checkCorrectInitialization(ifInitializationErrors);
  }
}

export default CheckOutput;