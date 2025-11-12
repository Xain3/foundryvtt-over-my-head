/**
 * @file moduleNameResolver-types.ts
 * @description Type definitions for module name resolution
 * @path src/utils/static/moduleNameResolver-types.ts
 */

/**
 * Descriptor containing module metadata fields.
 */
export interface ModuleDescriptor {
  id?: string;
  title?: string;
  shortName?: string;
}

/**
 * Configuration object for module name resolution strategies.
 */
export interface ModuleNameResolverConfig {
  moduleManagement?: {
    referToModuleBy?: string;
  };
  module?: ModuleDescriptor;
}
