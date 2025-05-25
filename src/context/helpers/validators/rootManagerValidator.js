export default class RootManagerValidator {
  /**
   * Validates that the source string is provided and is a string.
   * @param {*} sourceString
   * @param {string} [operationName]
   * @throws {Error}
   */

  static _validateSource(source, operationName, throwError = true, consoleLog = true, logLevel = 'error') {
    if (!source) {
      if (throwError) {
        throw new Error(`Could not ${operationName} remote context root. Source string must be provided`);
      }
      if (consoleLog) {
        console[logLevel](`Could not ${operationName} remote context root. Source string must be provided`);
      }
      return false;
    }
    if (typeof source !== 'string') {
      if (throwError) {
        throw new Error(`Could not ${operationName} remote context root. Source string must be a valid string, received ${typeof source} instead`);
      }
      if (consoleLog) {
        console[logLevel](`Could not ${operationName} remote context root. Source string must be a valid string, received ${typeof source} instead`);
      }
      return false;
    }
    return true;
  }

  static _validateTarget(target, operationName, throwError = true, consoleLog = true, logLevel = 'error') {
    if (!target) {
      if (throwError) {
        throw new Error(`Could not ${operationName} remote context root. Target object must be provided`);
      }
      if (consoleLog) {
        console[logLevel](`Could not ${operationName} remote context root. Target object must be provided`);
      }
      return false;
    }
    if (typeof target !== 'object' || target === null) {
      if (throwError) {
        throw new Error(`Could not ${operationName} remote context root. Target object must be a valid object, received ${typeof target} instead`);
      }
      if (consoleLog) {
        console[logLevel](`Could not ${operationName} remote context root. Target object must be a valid object, received ${typeof target} instead`);
      }
      return false;
    }
    return true;
  }

  static _validateReturnValue(returnValue, operationName, throwError = true, consoleLog = true, logLevel = 'error') {
    if (returnValue !== undefined && typeof returnValue !== 'boolean') {
      if (throwError) {
        throw new Error(`Could not ${operationName} remote context root. Return value must be a boolean, received ${typeof returnValue} instead`);
      }
      if (consoleLog) {
        console[logLevel](`Could not ${operationName} remote context root. Return value must be a boolean, received ${typeof returnValue} instead`);
      }
      return false;
    }
    return true;
  }

  static _validateSetProperty(setProperty, operationName, throwError = true, consoleLog = true, logLevel = 'error') {
    if (setProperty !== undefined && typeof setProperty !== 'boolean') {
      if (throwError) {
        throw new Error(`Could not ${operationName} remote context root. Set property must be a boolean, received ${typeof setProperty} instead`);
      }
      if (consoleLog) {
        console[logLevel](`Could not ${operationName} remote context root. Set property must be a boolean, received ${typeof setProperty} instead`);
      }
      return false;
    }
    return true;
  }

  static validateSourceString(sourceString, operationName = 'determine', throwError = true, consoleLog = true, logLevel = 'error') {
    if (!sourceString) {
      if (throwError) {
        throw new Error(`Could not ${operationName} remote context root. Source string must be provided`);
      }
      if (consoleLog) {
        console[logLevel](`Could not ${operationName} remote context root. Source string must be provided`);
      }
      return false;
    }
    if (typeof sourceString !== 'string') {
      if (throwError) {
        throw new Error(`Could not ${operationName} remote context root. Source string must be a valid string, received ${typeof sourceString} instead`);
      }
      if (consoleLog) {
        console[logLevel](`Could not ${operationName} remote context root. Source string must be a valid string, received ${typeof sourceString} instead`);
      }
      return false;
    }
    return true;
  }

  /**
   * Validates the arguments for managing a remote context root.
   * @param {Object} params
   * @param {string} params.source
   * @param {Object} params.target
   * @param {boolean} [params.returnValue]
   * @param {boolean} [params.setProperty]
   * @param {string} params.operationName
   * @throws {Error}
   */
  static validateManageRootArgs({ source, target, returnValue, setProperty, operationName }, throwError = true, consoleLog = true, logLevel = 'error') {
    const validSource = this._validateSource(source, operationName, throwError, consoleLog, logLevel);
    const validTarget = this._validateTarget(target, operationName, throwError, consoleLog, logLevel);
    const validReturnValue = this._validateReturnValue(returnValue, operationName, throwError, consoleLog, logLevel);
    const validSetProperty = this._validateSetProperty(setProperty, operationName, throwError, consoleLog, logLevel);
    return validSource && validTarget && validReturnValue && validSetProperty;
  }
}