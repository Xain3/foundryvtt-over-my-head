import constants from "@/constants/constants";
import { resolvePath } from "./resolvePath.js";

const MODULES_LOCATION = constants.defaultFoundryModulesLocation || 'game.modules';

/**
 * Retrieves a module by name from the global modules collection.
 *
 * @param {string} moduleName - The name of the module to retrieve
 * @param {object} [globalNamespace=globalThis] - The global namespace object to search in
 * @returns {*} The requested module object
 * @throws {TypeError} When moduleName is not a string or globalNamespace is not an object
 * @throws {Error} When the module is not found or the modules collection is invalid
 */
export const getModule = (moduleName, globalNamespace = globalThis) => {
  if (typeof moduleName !== 'string') {
    throw new TypeError('moduleName must be a string');
  }

  if (typeof globalNamespace !== 'object' || globalNamespace === null) {
    throw new TypeError('globalNamespace must be an object');
  }

  const modulesCollection = resolvePath(globalNamespace, MODULES_LOCATION);
  if (!modulesCollection || typeof modulesCollection.get !== 'function') {
    throw new Error(`Module "${moduleName}" not found in ${MODULES_LOCATION}`);
  }

  const module = modulesCollection.get(moduleName);
  if (module === null || module === undefined) {
    throw new Error(`Module "${moduleName}" not found in ${MODULES_LOCATION}`);
  }
  return module;
}


