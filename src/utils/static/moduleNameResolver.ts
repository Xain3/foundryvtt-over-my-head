/**
 * @file moduleNameResolver.ts
 * @description Resolves module display name based on configuration strategies.
 * @path src/utils/static/moduleNameResolver.ts
 */

const MODULE_PREFIX = '[OMH]';

interface ModuleDescriptor {
  id?: string;
  title?: string;
  shortName?: string;
}

interface ModuleNameResolverConfig {
  moduleManagement?: {
    referToModuleBy?: string;
  };
  module?: ModuleDescriptor;
}

/**
 * Resolves the module display name from configuration data.
 *
 * @param {ModuleNameResolverConfig} config - Parsed configuration object containing module metadata.
 * @returns {string} Resolved module name string following the configured strategy.
 */
export function resolveModuleName(config?: ModuleNameResolverConfig): string {
  const moduleData: ModuleDescriptor = config?.module ?? {};
  const strategy = config?.moduleManagement?.referToModuleBy ?? 'id';
  const fallback =
    moduleData.id ??
    moduleData.title ??
    moduleData.shortName ??
    'Unknown Module';

  if (strategy === 'id') {
    return moduleData.id ?? fallback;
  }

  if (strategy === 'title') {
    if (moduleData.title) {
      return moduleData.title;
    }

    console.warn(
      `${MODULE_PREFIX} Missing module.title while referToModuleBy='title', falling back to default identifier`
    );
    return fallback;
  }

  if (strategy === 'shortName') {
    if (moduleData.shortName) {
      return moduleData.shortName;
    }

    console.warn(
      `${MODULE_PREFIX} Missing module.shortName while referToModuleBy='shortName', falling back to default identifier`
    );
    return fallback;
  }

  console.warn(
    `${MODULE_PREFIX} Unknown referToModuleBy strategy: ${strategy}, using 'id' as fallback`
  );
  return moduleData.id ?? fallback;
}
