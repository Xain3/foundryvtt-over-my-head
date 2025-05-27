/**
 * @file rootMapParser.js
 * @description This file contains the ExternalContextRootMap class for managing external context root mappings.
 * @path /src/context/helpers/rootMapParser.js
 */

import RootMapValidator from "./validators/rootMapValidator";
import constants from "../../constants/constants.js";

/**
 * @class ExternalContextRootMap
 * @description Manages mappings for external context roots, determining which external objects
 * should be used as storage locations for context data. Uses the ROOT_MAP configuration from constants
 * to resolve string paths to actual objects in the global namespace.
 */
class ExternalContextRootMap {
  /**
   * Creates an instance of ExternalContextRootMap
   * @param {object} globalNamespace - The global namespace object (typically window)
   * @param {object} module - The module object
   * @param {function} [rootMapBuilder] - Optional custom root map builder function
   */
  constructor(globalNamespace, module, rootMapBuilder) {
    const defaultRootMapBuilder = this.#createDefaultRootMapBuilder();
    const actualRootMapBuilder = rootMapBuilder || defaultRootMapBuilder;
    
    RootMapValidator.validateArgs(
      globalNamespace,
      { module, remoteContextDefaults: { ROOT_MAP: actualRootMapBuilder } },
      true, // throwError
      true, // consoleLog
      'error' // logLevel
    );
    
    this.globalNamespace = globalNamespace;
    this.module = module;
    this.rootMapBuilder = actualRootMapBuilder;
    this.rootMap = this.getMap(globalNamespace, this.module);
  }

  /**
   * Creates the default root map builder that uses constants configuration
   * @returns {function} Root map builder function
   * @private
   */
  #createDefaultRootMapBuilder() {
    return (globalNamespace, module) => {
      const rootMapConfig = constants.context.external.rootMap;
      const resolvedMap = {};
      
      for (const [key, path] of Object.entries(rootMapConfig)) {
        resolvedMap[key] = this.#resolvePath(path, globalNamespace, module);
      }
      
      return resolvedMap;
    };
  }

  /**
   * Resolves a string path to an actual object reference
   * @param {string} path - The path to resolve (e.g., "globalNamespace.game")
   * @param {object} globalNamespace - The global namespace object
   * @param {object} module - The module object
   * @returns {*} The resolved object or null if invalid
   * @private
   */
  #resolvePath(path, globalNamespace, module) {
    if (path === null) return null;
    if (path === "module") return module;
    
    // Replace globalNamespace reference with actual object
    const resolvedPath = path.replace("globalNamespace", "globalNamespace");
    
    try {
      // Use Function constructor to safely evaluate the path
      const resolver = new Function('globalNamespace', 'module', `return ${resolvedPath}`);
      return resolver(globalNamespace, module);
    } catch (error) {
      console.warn(`Failed to resolve path "${path}":`, error);
      return null;
    }
  }

  /**
   * Gets the resolved root map
   * @param {object} [globalNamespace] - Optional global namespace override
   * @param {object} [module] - Optional module override
   * @returns {object} The resolved root map
   */
  getMap(globalNamespace = this.globalNamespace, module = this.module) {
    return this.rootMapBuilder(globalNamespace, module);
  }
}

export default ExternalContextRootMap;