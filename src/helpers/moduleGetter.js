import constants from "@/constants/constants";

const MODULES_LOCATION = constants.defaultFoundryModulesLocation || 'game.modules';

export const getModule = (moduleName, globalNamespace = globalThis) => {
  if (typeof moduleName !== 'string') {
    throw new TypeError('moduleName must be a string');
  }
  if (typeof globalNamespace !== 'object') {
    throw new TypeError('globalNamespace must be an object');
  }

  const module = globalNamespace[MODULES_LOCATION]?.get(moduleName);
  if (!module) {
    throw new Error(`Module "${moduleName}" not found in ${MODULES_LOCATION}`);
  }
  return module;
}


