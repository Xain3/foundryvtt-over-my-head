import manifest from '@manifest';

const moduleManifest = manifest

function handleValidationError
(behaviour, error, {
  alsoReturn = true,
  addPrefix = true,
  errorList = [],
  errorPrefix = "",
  customSuffix = ""
}) {
  const message = addPrefix ? `${errorPrefix}${error.message}${customSuffix}` : error.message;
  switch (behaviour) {
    case 'throw':
      error.message = message;
      throw error;
    case 'logError':
      console.error(message);
      if (alsoReturn) return false
      break;
    case 'warn':
      console.warn(message);
      if (alsoReturn) return false
      break;
    case 'log':
      console.log(message);
      if (alsoReturn) return false
      break;
    case 'logAndThrow':
      console.error(message);
      throw error;
    case 'append':
      error.message = message;
      errorList.push(error);
      if (alsoReturn) return false
      break;
    case 'return':
      return false;
    default:
      console.error(message);
      if (alsoReturn) return false
      break;
  }
}

class ManifestValidator {

  static validateSeparator(manifest) {
    if (!manifest.constants.validatorSeparator || typeof manifest.constants.validatorSeparator !== 'string') {
      throw new Error('Invalid manifest: Must have a validatorSeparator property.');
    }
  }

  static validateForNameUse(manifest) {
    if (!manifest.constants.forNameUse || typeof manifest.constants.forNameUse !== 'string') {
      throw new Error('Invalid manifest: Must have a forNameUse property.');
    }
  }

  static validateManifestConstants(manifest) {
    if (!manifest.constants || typeof manifest.constants !== 'object') {
      throw new Error('Invalid manifest: Must have a constants property.');
    }
  }

  static validateManifestObject(manifest) {
    if (!manifest || typeof manifest !== 'object') {
      throw new Error('Invalid manifest: Must be an object.');
    }
  }

  static validateManifest(manifest) {
    ManifestValidator.validateManifestObject(manifest);
    ManifestValidator.validateManifestConstants(manifest);
    ManifestValidator.validateForNameUse(manifest);
    ManifestValidator.validateSeparator(manifest);
  }
}

class ParentObjectValidator {
  static validateParentPrototype(parent) {
    if (!parent.prototype || typeof parent.prototype.name !== 'string') {
      throw new Error('Invalid parent: Must have a prototype with a name property.');
    }
  }

  static validateParentIsObject(parent) { // Renamed from validateParentObject
    if (!parent || typeof parent !== 'object') {
      throw new Error('Invalid parent: Must be an object.');
    }
  }

  static validateParentObject(parent) { // This is the main validation method
    ParentObjectValidator.validateParentIsObject(parent); // Call the specific check
    ParentObjectValidator.validateParentPrototype(parent);
  }
}


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
  // this.errors is already initialized
  }

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
    handleValidationError(
    behaviour,
    error,
    {
      alsoReturn,
      addPrefix,
      errorList,
      errorPrefix,
      customSuffix
    }
    )
  }

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

  #generateErrorPrefix(forNameUse, manifest, parent, separator) {
    const moduleName = this.#retrieveModuleName(forNameUse, manifest);
    const callerName = parent?.prototype?.name || 'unknown'; // Safer access
    // Use the separator parameter directly
    return this.constructErrorPrefix(moduleName, callerName, separator);
  }

  #validateOwnArgs(parent, manifest, forNameUse, separator) {
    const constructorErrorPrefix = this.#generateErrorPrefix(forNameUse, manifest, parent, separator);

    // Validate manifest, passing the generated prefix for consistent error messages
    this.#validateManifest(manifest, 'throw', { errorPrefix: constructorErrorPrefix });

    // Validate parent object, append errors to this.errors using the generated prefix
    this.#validateParentObject(parent, 'append', { errorList: this.errors, errorPrefix: constructorErrorPrefix });
  }

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

  constructErrorPrefix(moduleName = this.moduleName, caller = this.caller, separator = this.separator) {
  return `${moduleName}${separator}${caller}${separator}`;
  }

  addValidation(validation) {
  this.validations.push(validation);
  }

  runValidations(validationsList = this.validations, errorList = this.errors) {
  validationsList.forEach((validation) => {
    try {
      validation();
    } catch (error) {
      this.#handleValidationError('append', error, {errorList});
    }
  });
  }

  validate() {
  return this.validations.every((validation) => validation());
  }
}