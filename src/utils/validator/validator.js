import ManifestValidator from './manifestValidator.js';
import ParentObjectValidator from './parentObjectValidator.js';
import ErrorManager from './validatorErrorManager.js';
import manifest from '@manifest'

const moduleManifest = manifest

/**
 * @class Validator
 * @description A flexible validator class that runs a series of checks and handles errors
 *              based on configuration. It utilizes ManifestValidator, ParentObjectValidator,
 *              and ErrorManager.
 *
 * @param {object} [options={}] Configuration options for the validator.
 * @param {object} [options.manifest] Optional manifest object (e.g., from module.json).
 *                                    If not provided, defaults to the module's manifest.
 *                                    If provided and valid, `moduleName` and `separator` for
 *                                    ErrorManager will be derived from it. Fallbacks are used otherwise.
 * @param {object} [options.errorManagerOptions={}] Options to pass to the internal ErrorManager instance.
 *                                    These can override settings derived from the manifest or fallbacks.
 *   @param {string} [options.errorManagerOptions.moduleName] Overrides module name.
 *   @param {string} [options.errorManagerOptions.callerName='run'] Default caller name for errors.
 *   @param {string} [options.errorManagerOptions.separator] Overrides separator.
 * @param {boolean} [options.throwOnError=false] If true, the `run()` method will throw an error
 *                                               if any validation check fails. The error will contain
 *                                               all formatted error messages.
 * @param {'boolean'|'errorsArray'|'formattedMessage'} [options.errorReturnType='boolean']
 *        Determines what the `run()` method returns if `throwOnError` is false and validation fails:
 *        - 'boolean': returns `false`.
 *        - 'errorsArray': returns an array of formatted error strings from ErrorManager.
 *        - 'formattedMessage': returns a single string with all error messages formatted by ErrorManager.
 *        If all checks pass, `run()` returns `true`.
 */
class Validator {
  #errorManager;
  #checks = [];
  #throwOnError;
  #errorReturnType;

  constructor({
    manifest = moduleManifest,
    errorManagerOptions = {},
    throwOnError = false,
    errorReturnType = 'boolean'
  } = {}) {
    let derivedModuleName = 'Unknown module';
    let derivedSeparator = ' || ';

    if (manifest) {
      try {
        // Validate the manifest. This ensures manifest.constants.validatorSeparator and an ID field exist if valid.
        ManifestValidator.validateManifest(manifest);
        derivedModuleName = this.#deriveModuleName(manifest);
        derivedSeparator = manifest.constants.validatorSeparator; // Guaranteed by successful validateManifest
      } catch (validationError) {
        // Manifest provided for configuration was invalid or incomplete.
        // Silently use fallbacks. For debugging, a console.warn could be added here:
        // console.warn('Validator constructor: Provided manifest for configuration was invalid. Using fallback ErrorManager settings.', validationError);
      }
    }

    // Defaults derived from manifest or fallbacks
    const defaultErrorManagerSettings = {
      moduleName: derivedModuleName,
      callerName: 'run', // Specific to Validator's run method context
      separator: derivedSeparator,
    };

    // User-provided errorManagerOptions override these manifest-derived/fallback defaults
    this.#errorManager = new ErrorManager({
      ...defaultErrorManagerSettings,
      ...errorManagerOptions,
    });

    this.#throwOnError = throwOnError;

    const validReturnTypes = ['boolean', 'errorsArray', 'formattedMessage'];
    if (!validReturnTypes.includes(errorReturnType)) {
      // This is a setup error, should probably always throw.
      throw new Error(`Validator constructor: Invalid errorReturnType '${errorReturnType}'. Must be one of: ${validReturnTypes.join(', ')}`);
    }
    this.#errorReturnType = errorReturnType;
  }

  /**
   * Derives the module name from a manifest object based on the specified reference key.
   *
   * @private
   * @param {Object} manifest - The manifest object containing module metadata.
   * @param {string} [manifest.id] - The module's unique identifier.
   * @param {string} [manifest.name] - The module's name.
   * @param {string} [manifest.title] - The module's title.
   * @param {string} [manifest.referToModuleBy] - The preferred property to reference the module by ('id', 'name', or 'title').
   * @returns {string} The derived module name, or 'Unknown module' if none is found.
   */
  #deriveModuleName(manifest) {
    const defaultName = manifest.id || manifest.name || manifest.title || 'Unknown module';
    let referBy = '';
    if (manifest && manifest.referToModuleBy) {
      referBy = manifest.referToModuleBy;
    }
    switch (referBy) {
      case 'id':
        return manifest.id || defaultName;
      case 'name':
        return manifest.name || defaultName;
      case 'title':
        return manifest.title || defaultName;
      default:
        return defaultName;
    }
  }

  /**
   * Clears all registered checks and any accumulated errors from the internal ErrorManager.
   * Useful for reusing the Validator instance for a new set of validations.
   * @returns {Validator} The Validator instance for chaining.
   */
  reset() {
    this.#checks = [];
    // Assuming ErrorManager.errors is a public array or has a clear method.
    // Based on ErrorManager's JSDoc, 'errors' is a public property.
    this.#errorManager.errors = [];
    return this;
  }

  /**
   * Adds a custom validation check.
   * Can accept either a validation function or a Zod-like schema object with its corresponding data.
   * @param {string} checkName - A descriptive name for the check (e.g., "User Input Validation").
   *                             This name will be used as a custom prefix for error messages from this check.
   * @param {Function|{parse: Function}} funcOrSchema - A validation function that performs the validation and
   *                                                    should throw an error if validation fails, OR a Zod-like
   *                                                    schema object (must have a `parse` method).
   * @param {*} [dataToValidate] - Optional. If `funcOrSchema` is a Zod-like schema, this is the data to be
   *                               validated against it. This argument is ignored if `funcOrSchema` is a function.
   *                               If `funcOrSchema` is a schema and this argument is not provided (i.e., fewer than
   *                               3 arguments are passed to `addCheck`), an error will be thrown. To validate
   *                               `undefined` against a schema, explicitly pass `undefined` as this argument.
   * @returns {Validator} The Validator instance for chaining.
   * @throws {Error} if `checkName` is invalid, or if `funcOrSchema` is not a function or a valid schema,
   *                 or if `funcOrSchema` is a schema but `dataToValidate` is not provided appropriately.
   */
  addCheck(checkName, funcOrSchema, dataToValidate) {
    if (typeof checkName !== 'string' || checkName.trim() === '') {
      throw new Error('Validator.addCheck: checkName must be a non-empty string.');
    }

    let validationFunction;
    let isZodWrapper = false; // Flag to indicate if this check wraps a Zod schema

    if (typeof funcOrSchema === 'function') {
      validationFunction = funcOrSchema;
      // dataToValidate is ignored if funcOrSchema is a function, which is the intended behavior.
    } else if (typeof funcOrSchema === 'object' && funcOrSchema !== null && typeof funcOrSchema.parse === 'function') {
      // It's a Zod-like schema object
      // We require dataToValidate to be explicitly passed for schemas.
      // arguments.length < 3 means dataToValidate was not passed at all.
      // If arguments.length is 3, dataToValidate could be undefined, which is allowed (schema.parse(undefined)).
      if (arguments.length < 3) {
        throw new Error(
          `Validator.addCheck ('${checkName}'): Zod-like schema provided but 'dataToValidate' argument is missing. ` +
          `To validate against 'undefined', explicitly pass 'undefined' as the third argument.`
        );
      }
      validationFunction = () => funcOrSchema.parse(dataToValidate);
      isZodWrapper = true;
    } else {
      throw new Error(
        `Validator.addCheck ('${checkName}'): funcOrSchema must be a function or a Zod-like schema object (with a 'parse' method).`
      );
    }

    this.#checks.push({ name: checkName, fn: validationFunction, isZodWrapper });
    return this;
  }

  /**
   * Adds a manifest validation check using ManifestValidator.
   * @param {object} manifestObject - The manifest object to validate.
   * @param {string} [checkName='ManifestValidation'] - Name for this check.
   * @returns {Validator} The Validator instance for chaining.
   */
  addManifestCheck(manifestObject, checkName = 'ManifestValidation') {
    return this.addCheck(checkName, () => ManifestValidator.validateManifest(manifestObject));
  }

  /**
   * Adds a parent object validation check using ParentObjectValidator.
   * @param {object} parentObject - The parent object to validate.
   * @param {string} [checkName='ParentObjectValidation'] - Name for this check.
   * @returns {Validator} The Validator instance for chaining.
   */
  addParentObjectCheck(parentObject, checkName = 'ParentObjectValidation') {
    return this.addCheck(checkName, () => ParentObjectValidator.validateParentObject(parentObject));
  }

  /**
   * Runs all added validation checks.
   * Before running, it clears any errors from previous runs from its internal ErrorManager
   * if the Validator instance is being reused (implicitly handled by `reset()` or if `run()` is called multiple times).
   * For a single `run` cycle, errors are accumulated for that cycle. If `run` is called again without `reset`,
   * new errors will be added to the ErrorManager. Consider calling `reset()` before `run()` if you intend
   * a fresh validation cycle on a reused Validator instance.
   * This implementation clears errors at the beginning of each `run` to ensure a clean slate for the current validation.
   *
   * @returns {boolean|string[]|string}
   *          - `true` if all checks pass.
   *          - If checks fail and `throwOnError` is `false`:
   *            - `false` if `errorReturnType` is 'boolean'.
   *            - An array of formatted error strings (from ErrorManager) if `errorReturnType` is 'errorsArray'.
   *            - A single newline-separated string of all formatted errors (from ErrorManager) if `errorReturnType` is 'formattedMessage'.
   * @throws {Error} If `throwOnError` is `true` and any check fails. The error message will be a
   *                 formatted string of all errors from ErrorManager, and the error object will have a `details`
   *                 property with the array of raw (formatted) error messages.
   */
  run() {
    // Clear errors from the instance's error manager for the current run.
    this.#errorManager.errors = [];

    for (const check of this.#checks) {
      try {
        check.fn(); // Execute the validation function
      } catch (error) {
        let messageForManager = error; // Default to passing the whole error object

        // Check if it's a Zod-like error (has 'issues' array and 'issues' is an array with items)
        // This duck-typing approach allows handling errors from Zod or similar validation libraries
        // without a direct dependency on them.
        if (error && Array.isArray(error.issues) && error.issues.length > 0) {
          // Format Zod issues into a more readable string
          const formattedZodIssues = error.issues
            .map(issue => {
              const path = issue.path.join('.');
              // Zod issue messages are usually descriptive.
              return `${path ? path + ': ' : ''}${issue.message}`;
            })
            .join('; '); // Join multiple issues with a semicolon and space

          if (formattedZodIssues) {
            messageForManager = formattedZodIssues;
          } else if (error.message) {
            // Fallback to error.message if formatting produced an empty string (unlikely for Zod)
            messageForManager = error.message;
          }
          // If formattedZodIssues is empty and no error.message, messageForManager remains the original error object.
        } else if (error.message) {
          // Not a Zod-like error with issues, but it has a .message property. Use that.
          messageForManager = error.message;
        }
        // If it's an error object without .issues and without .message,
        // messageForManager remains the original error object.
        // ErrorManager will then likely convert it to a string or use a default representation.

        this.#errorManager.addError({
          errorOrMessage: messageForManager, // This can be a string (formatted) or an Error object
          customPrefix: check.name,
        });
      }
    }

    if (this.#errorManager.hasErrors()) {
      if (this.#throwOnError) {
        const errorMessage = this.#errorManager.getFormattedErrors();
        const validationError = new Error(errorMessage);
        // Attach raw errors for more detailed programmatic access if needed
        validationError.details = this.#errorManager.getErrors();
        throw validationError;
      }

      switch (this.#errorReturnType) {
        case 'errorsArray':
          return this.#errorManager.getErrors();
        case 'formattedMessage':
          return this.#errorManager.getFormattedErrors();
        case 'boolean':
        default:
          return false;
      }
    }

    return true; // All checks passed
  }

  /**
   * Gets the array of formatted error messages accumulated by the ErrorManager
   * during the last `run()`.
   * @returns {string[]} An array of error messages. Empty if no errors or `run()` not called/cleared.
   */
  getErrors() {
    return this.#errorManager.getErrors();
  }

  /**
   * Gets a single string containing all formatted error messages accumulated by the ErrorManager
   * during the last `run()`, typically newline-separated.
   * @returns {string} The formatted error messages. Empty if no errors or `run()` not called/cleared.
   */
  getFormattedErrors() {
    return this.#errorManager.getFormattedErrors();
  }

  /**
   * Checks if there were any errors accumulated by the ErrorManager during the last `run()`.
   * @returns {boolean} True if errors were found, false otherwise.
   */
  hasErrors() {
    return this.#errorManager.hasErrors();
  }
}

export default Validator;