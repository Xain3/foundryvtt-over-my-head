/**
 * @file moduleGetter.js
 * @description This file contains a function to get a module from the Foundry VTT modules collection.
 * @path src/helpers/moduleGetter.js
 */

import constants from "@/constants/constants";
import { resolvePath } from "./resolvePath.js";

/**
 * Retrieves a module by name from the global modules collection.
 *
 * @param {string} moduleName - The name of the module to retrieve
 * @param {object} [globalNamespace=globalThis] - The global namespace object to search in
 * @returns {*} The requested module object or null if not found
 * @throws {TypeError} When moduleName is not a string or globalNamespace is not an object
 */
export const getModule = (moduleName, globalNamespace = globalThis) => {
  if (typeof moduleName !== 'string') {
    throw new TypeError('moduleName must be a string');
  }

  if (typeof globalNamespace !== 'object' || globalNamespace === null) {
    throw new TypeError('globalNamespace must be an object');
  }

  const modulesLocation = constants.defaultFoundryModulesLocation || 'game.modules';
  const modulesCollection = resolvePath(modulesLocation, { namespace: globalNamespace });
  if (!modulesCollection || typeof modulesCollection.get !== 'function') {
    return null;
  }

  return modulesCollection.get(moduleName) || null;
};


