/**
 * @file rootMapValidator.js
 * @description This file contains the RootMapValidator class for validating root map configurations.
 * @path /src/context/helpers/validators/rootMapValidator.js
 */

/**
 * @class RootMapValidator
 * @description Validates the arguments and configuration for root map initialization.
 * Ensures that all required components are present and properly structured.
 */
class RootMapValidator {
  static #validateGlobalNamespace(globalNamespace, throwError = true, consoleLog = true, logLevel = 'error') {
    const baseErrorMsg = 'Error while initializing ContextRootMap.';
    if (!globalNamespace) {
      const errorMsg = `${baseErrorMsg} Global namespace must be provided`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }
    if (typeof globalNamespace !== 'object') {
      const errorMsg = `${baseErrorMsg} Global namespace must be an object`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }
    return true;
  }

  static #validateManager(manager, throwError = true, consoleLog = true, logLevel = 'error') {
    const baseErrorMsg = 'Error while initializing ContextRootMap.';
    if (!manager) {
      const errorMsg = `${baseErrorMsg} Manager must be provided`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }
    if (typeof manager !== 'object') {
      const errorMsg = `${baseErrorMsg} Manager must be an object`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }
    return true;
  }

  static #validateManagerModule(manager, throwError = true, consoleLog = true, logLevel = 'error') {
    const baseErrorMsg = 'Error while initializing ContextRootMap.';
    if (!manager.module) {
      const errorMsg = `${baseErrorMsg} Module must be defined in parent manager`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }
    if (typeof manager.module !== 'object') {
      const errorMsg = `${baseErrorMsg} Module must be an object`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }
    return true;
  }

  static #validateManagerRemoteContextDefaults(manager, throwError = true, consoleLog = true, logLevel = 'error') {
    const baseErrorMsg = 'Error while initializing ContextRootMap.';
    if (!manager.remoteContextDefaults) {
      const errorMsg = `${baseErrorMsg} remoteContextDefaults must be defined in parent manager`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }
    if (typeof manager.remoteContextDefaults !== 'object') {
      const errorMsg = `${baseErrorMsg} remoteContextDefaults must be an object`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }
    return true;
  }

  static #validateRootMapDefinition(manager, throwError = true, consoleLog = true, logLevel = 'error') {
    const baseErrorMsg = 'Error while initializing ContextRootMap.';
    if (!manager.remoteContextDefaults.ROOT_MAP) {
      const errorMsg = `${baseErrorMsg} ROOT_MAP must be defined in remoteContextDefaults`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }
    if (typeof manager.remoteContextDefaults.ROOT_MAP !== 'function') {
      const errorMsg = `${baseErrorMsg} ROOT_MAP must be a function`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }
    return true;
  }

  static #validateRootMapResult(globalNamespace, manager, throwError = true, consoleLog = true, logLevel = 'error') {
    const baseErrorMsg = 'Error while initializing ContextRootMap.';
    const module = manager.module;
    let rootMapResult;

    try {
      rootMapResult = manager.remoteContextDefaults.ROOT_MAP(globalNamespace, module);
    } catch (error) {
      const errorMsg = `${baseErrorMsg} ROOT_MAP function threw an error during execution: ${error.message}`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }

    if (typeof rootMapResult !== 'object' || rootMapResult === null) {
      const errorMsg = `${baseErrorMsg} ROOT_MAP must return a non-null object`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }

    if (Object.keys(rootMapResult).length === 0) {
      const errorMsg = `${baseErrorMsg} ROOT_MAP must not return an empty object`;
      if (throwError) throw new Error(errorMsg);
      if (consoleLog) console[logLevel](errorMsg);
      return false;
    }
    return true;
  }

  static validateArgs(globalNamespace, manager, throwError = true, consoleLog = true, logLevel = 'error') {
    if (!this.#validateGlobalNamespace(globalNamespace, throwError, consoleLog, logLevel)) return false;
    if (!this.#validateManager(manager, throwError, consoleLog, logLevel)) return false;
    // Subsequent validations depend on manager being valid
    if (!this.#validateManagerModule(manager, throwError, consoleLog, logLevel)) return false;
    if (!this.#validateManagerRemoteContextDefaults(manager, throwError, consoleLog, logLevel)) return false;
    // Subsequent validations depend on remoteContextDefaults being valid
    if (!this.#validateRootMapDefinition(manager, throwError, consoleLog, logLevel)) return false;
    // Subsequent validations depend on ROOT_MAP being a valid function
    if (!this.#validateRootMapResult(globalNamespace, manager, throwError, consoleLog, logLevel)) return false;

    return true; // All validations passed
  }
}

export default RootMapValidator;
