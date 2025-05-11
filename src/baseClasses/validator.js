import manifest from '@manifest';
import ErrorHandler from '@utils/static/errorHandler.js';
import Checks from '@/utils/static/checks/checksbak.js';

const moduleManifest = manifest

class ManifestValidator {
  /**
   * Validates that the provided manifest has a validatorSeparator property.
   *
   * @param {object} manifest - The manifest object to validate.
   * @throws {Error} If the manifest does not have a validatorSeparator property.
   */
  static validateSeparator(manifest) {
  if (!manifest.constants.validatorSeparator || typeof manifest.constants.validatorSeparator !== 'string') {
    throw new Error('Invalid manifest: Must have a validatorSeparator property.');
  }
  }

  /**
   * Validates that the provided manifest has a forNameUse property.
   *
   * @param {object} manifest - The manifest object to validate.
   * @throws {Error} If the manifest does not have a forNameUse property.
   */
  static validateForNameUse(manifest) {
  if (!manifest.constants.forNameUse || typeof manifest.constants.forNameUse !== 'string') {
    throw new Error('Invalid manifest: Must have a forNameUse property.');
  }
  }

  /**
   * Validates that the provided manifest has a constants property.
   *
   * @param {object} manifest - The manifest object to validate.
   * @throws {Error} If the manifest does not have a constants property.
   */
  static validateManifestConstants(manifest) {
  if (!manifest.constants || typeof manifest.constants !== 'object') {
    throw new Error('Invalid manifest: Must have a constants property.');
  }
  }

  /**
   * Validates that the provided manifest is a non-null object.
   * Throws an error if the validation fails.
   *
   * @param {object} manifest - The value to validate as a manifest object.
   * @throws {Error} If the manifest is not an object or is null/undefined.
   */
  static validateManifestObject(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Invalid manifest: Must be an object.');
  }
  }

  /**
   * Validates a manifest object by running a series of validation checks.
   *
   * This method performs the following validations:
   * 1. Checks the structure and required properties of the manifest object.
   * 2. Validates constant values within the manifest.
   * 3. Ensures proper usage of the "name" property.
   * 4. Checks for correct separator usage in the manifest.
   *
   * @param {Object} manifest - The manifest object to validate.
   * @throws {Error} If any of the validation checks fail.
   */
  static validateManifest(manifest) {
  ManifestValidator.validateManifestObject(manifest);
  ManifestValidator.validateManifestConstants(manifest);
  ManifestValidator.validateForNameUse(manifest);
  ManifestValidator.validateSeparator(manifest);
  }
}

class ParentObjectValidator {
  /**
   * Validates that the provided parent has a prototype with a name property.
   * Throws an error if the validation fails.
   *
   * @param {*} parent - The value to validate as a parent object.
   * @throws {Error} If the parent does not have a prototype with a name property.
   */
  static validateParentPrototype(parent) {
  if (!parent.prototype || typeof parent.prototype.name !== 'string') {
    throw new Error('Invalid parent: Must have a prototype with a name property.');
  }
  }

  /**
   * Validates that the provided parent is a non-null object.
   * Throws an error if the validation fails.
   *
   * @param {*} parent - The value to validate as an object.
   * @throws {Error} If the parent is not an object or is null/undefined.
   */
  static validateParentIsObject(parent) { // Renamed from validateParentObject
  if (!parent || typeof parent !== 'object') {
    throw new Error('Invalid parent: Must be an object.');
  }
  }

  /**
   * Validates the given parent object by performing a series of checks.
   * Calls specific validation methods to ensure the parent is an object and has the correct prototype.
   *
   * @param {Object} parent - The parent object to validate.
   * @throws {TypeError} If the parent is not a valid object or does not have the expected prototype.
   */
  static validateParentObject(parent) { // This is the main validation method
  ParentObjectValidator.validateParentIsObject(parent); // Call the specific check
  ParentObjectValidator.validateParentPrototype(parent);
  }
}


/**
 * @class Validator
 * @classdesc A base class for performing and managing validations. It provides
 *            functionality for error handling, constructing error messages,
 *            adding validation rules, and running them.
 *
 * @param {object} parent - The parent object or class that is using the validator.
 *                          Used to determine the caller name for error messages.
 * @param {object} [manifest=moduleManifest] - The manifest object for the module,
 *                                             used to retrieve module information
 *                                             for error messages.
 * @param {string} [forNameUse=manifest.constants.forNameUse] - Specifies which
 *                                                              property of the
 *                                                              manifest (e.g., 'title',
 *                                                              'name', 'id') to use
 *                                                              for the module name
 *                                                              in error messages.
 * @param {string} [separator=manifest.constants.validatorSeparator] - The separator
 *                                                                     string used in
 *                                                                     constructing
 *                                                                     error prefixes.
 *
 * @property {Array<Error|string>} errors - An array to store validation errors.
 * @property {string} moduleName - The name of the module, derived from the manifest.
 * @property {string} caller - The name of the class or context using the validator.
 * @property {string} separator - The separator used in error message prefixes.
 * @property {string} errorPrefix - The standard prefix for error messages generated
 *                                  by this validator instance.
 * @property {Array<Function|Object>} validations - A list of validation functions or rules
 *                                                  to be executed.
 */
class Validator {
  #manifest;

  constructor(
  parent,
  manifest = moduleManifest,
  forNameUse = manifest.constants.forNameUse,
  separator = manifest.constants.validatorSeparator,
  ) {
  this.errors = []; // Initialize errors before validation
  this.#validateOwnArgs(parent, manifest, forNameUse, separator);
  this.#manifest = manifest;
  this.moduleName = this.#retrieveModuleName(forNameUse);
  this.caller = parent?.prototype?.name || 'Validator'; // Safer access
  this.separator = separator;
  this.errorPrefix = this.constructErrorPrefix();
  this.validations = [];
  this.errorHandler = ErrorHandler;
  this.checks = Checks;
  // this.errors is already initialized
  }

  /**
   * Handles an error according to the specified behaviour and options.
   *
   * @param {string} behaviour - The behaviour to use when handling the error.
   * @param {any} error - The error to handle.
   * @param {Object} options - Additional options for error handling.
   * @param {boolean} [options.alsoReturn=true] - Whether to also return the error.
   * @param {boolean} [options.addPrefix=true] - Whether to add a prefix to the error message.
   * @param {Array} [options.errorList=this.errors] - The list to which errors are added.
   * @param {string} [options.errorPrefix=this.errorPrefix] - The prefix to add to error messages.
   * @param {string} [options.customSuffix=""] - A custom suffix to append to the error message.
   */
  handleError(
  behaviour,
  error,
  {
  alsoReturn = true,
  addPrefix = true,
  errorList = this.errors,
  errorPrefix = this.errorPrefix,
  customSuffix = ""
  }) {
  this.errorHandler.handle(
  behaviour,
  error,
  {
    alsoReturn,
    addPrefix,
    errorList,
    errorPrefix,
    customSuffix
  })
  }

  /**
   * Validates the manifest object.
   * This method checks if the manifest is a valid object and contains the required properties.
   *
   * @private
   * @param {object} manifest - The manifest object to validate.
   * @param {string} behavior - The behavior to follow in case of validation failure.
   * @param {object} handlerOptions - Additional options for error handling.
   * @param {string} handlerOptions.errorPrefix - The prefix to prepend to error messages.
   * @returns {void}
   * @throws {Error} Throws an error if the manifest is invalid.
   */
  #validateManifest(manifest, behavior = 'throw', options = {}) { // Added options for errorPrefix
  try {
    ManifestValidator.validateManifest(manifest);
  } catch (error) {
    handleValidationError( behavior, error, options ) // Pass options (e.g., errorPrefix)
  }
  }

  #validateParentObject(parent, behavior = 'log', args) {
  try {
  ParentObjectValidator.validateParentObject(parent);
  } catch (error) {
  this.handleError(behavior, error, {...args});
  }
  }

  /**
   * Generates an error prefix string based on the provided parameters.
   *
   * @private
   * @param {string} forNameUse - The name to use for the module.
   * @param {object} manifest - The manifest object to use.
   * @param {object} parent - The parent object to use.
   * @param {string} separator - The separator to use in the error prefix.
   * @returns {string} The generated error prefix.
   */
  #generateErrorPrefix(forNameUse, manifest, parent, separator) {
  const moduleName = this.#retrieveModuleName(forNameUse, manifest);
  const callerName = parent?.prototype?.name || 'unknown'; // Safer access
  // Use the separator parameter directly
  return this.constructErrorPrefix(moduleName, callerName, separator);
  }

  /**
   * Validates the constructor arguments for the Validator class.
   *
   * @private
   * @param {object} parent - The parent object to validate.
   * @param {object} manifest - The manifest object to validate.
   * @param {string} forNameUse - The name to use for the module.
   * @param {string} separator - The separator to use in the error prefix.
   * @throws {Error} Throws an error if the validation fails.
   * @returns {void}
   */
  #validateOwnArgs(parent, manifest, forNameUse, separator) {
  const constructorErrorPrefix = this.#generateErrorPrefix(forNameUse, manifest, parent, separator);

  // Validate manifest, passing the generated prefix for consistent error messages
  this.#validateManifest(manifest, 'throw', { errorPrefix: constructorErrorPrefix });

  // Validate parent object, append errors to this.errors using the generated prefix
  this.#validateParentObject(parent, 'throw', { errorList: this.errors, errorPrefix: constructorErrorPrefix });

  return true
  }

  /**
   * Retrieves the module name based on the provided forNameUse.
   *
   * @private
   * @param {string} forNameUse
   * @param {object} manifest
   * @returns {string} The module name based on the provided forNameUse.
   */
  #retrieveModuleName(forNameUse, manifest = this.#manifest) {
  switch (forNameUse) {
  case 'title':
  return manifest.title;
  case 'name':
  return manifest.name;
  case 'shortName':
  return manifest.shortName;
  case 'id':
  return manifest.id;
  }
  }

  /**
   * Constructs a standardized error prefix string using the module name, caller, and separator.
   *
   * @param {string} [moduleName=this.moduleName] - The name of the module. Defaults to the instance's moduleName property.
   * @param {string} [caller=this.caller] - The name of the caller. Defaults to the instance's caller property.
   * @param {string} [separator=this.separator] - The separator string to use between parts. Defaults to the instance's separator property.
   * @returns {string} The constructed error prefix in the format: `${moduleName}${separator}${caller}${separator}`.
   */
  constructErrorPrefix(moduleName = this.moduleName, caller = this.caller, separator = this.separator) {
  return `${moduleName}${separator}${caller}${separator}`;
  }

  /**
   * Adds a validation function or rule to the list of validations.
   *
   * @param {Function|Object} validation - The validation function or rule to add.
   */
  addValidation(validation) {
  this.validations.push(validation);
  }

  /**
   * Handles the return value of a validation process based on the specified return mode.
   *
   * @private
   * @param {Array} errorList - The list of validation errors.
   * @param {'bool'|'list'|'setProperty'|'throw'} returnMode - Determines how to handle the error list:
   *   - 'bool': Returns true if there are no errors, false otherwise.
   *   - 'list': Returns the error list as is.
   *   - 'setProperty': Sets the `errors` property to the error list and returns it.
   *   - 'throw': Throws an Error if there are any errors in the list.
   * @returns {boolean|Array} Returns a boolean, the error list, or nothing if an error is thrown.
   * @throws {Error} Throws an error if returnMode is 'throw' and errors are present.
   */
  #handleErrorListReturnMode(errorList, returnMode) {
  switch (returnMode) {
    case 'bool':
    return (errorList.length === 0);
    case 'list':
    return errorList;
    case 'setProperty':
    this.errors = errorList;
    return errorList;
    case 'throw':
    if (errorList.length > 0) {
      const error = new Error('Validation errors occurred');
      error.errors = errorList;
      throw error;
    }
    break;
    default:
    console.warn(`Unknown returnMode: ${returnMode}. Defaulting to 'bool'.`);
    return (errorList.length === 0);
  }
  }

  /**
   * Runs a list of validation functions, collects errors, and returns the result based on the specified return mode.
   *
   * @param {Function[]} [validationsList=this.validations] - An array of validation functions to execute.
   * @param {Array} [errorList=this.errors] - An array to collect errors encountered during validation.
   * @param {'bool'|'list'|'throw'} [returnMode='bool'] - Determines the return type:
   *   - 'bool': returns true if no errors, false otherwise,
   *   - 'list': returns the list of errors,
   *   - 'throw': throws an error if any validations fail.
   * @returns {boolean|Array|void} Returns true if all validations pass, otherwise returns or throws errors based on returnMode.
   */
  runValidations(validationsList = this.validations, errorList = this.errors, returnMode = 'bool') {
  if (validationsList.length === 0) {
    console.warn('No validations to run.');
    return true;
  }
  validationsList.forEach((validation) => {
    try {
    validation();
    } catch (error) {
    this.handleError('append', error, {errorList});
  }
  });
  if (errorList.length > 0) {
    return this.#handleErrorListReturnMode(errorList, returnMode);
  } else {
    return true;
  }
  }

  /**
   * Validates the provided validations list and updates the error list.
   * This method is designed to be flexible and can be used in various contexts.
   * In the base class, it is a wrapper around runValidations.
   * In subclasses, it can be overridden to provide specific validation logic.
   *
   * @param {Array} [validationsList=this.validations] - The list of validation functions or rules to apply.
   * @param {Array} [errorList=this.errors] - The array to collect validation error messages.
   * @param {string} [returnMode='bool'] - Determines the return type; typically 'bool' for boolean or other modes as supported.
   * @returns {*} The result of the validation process, type depends on returnMode.
   */
  validate(validationsList = this.validations, errorList = this.errors, returnMode = 'bool') {
  const result = this.runValidations(validationsList, errorList, returnMode);
  if (result === false) {
    console.error('Validation failed:', errorList);
  }
  return result;
  }
}

export default Validator;