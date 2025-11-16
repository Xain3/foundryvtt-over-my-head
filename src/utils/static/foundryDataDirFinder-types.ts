/**
 * @file foundryDataDirFinder-types.ts
 * @description Type definitions for FoundryDataDirFinder utility
 * @path src/utils/static/foundryDataDirFinder-types.ts
 */

/**
 * Supported platform identifiers for directory finding
 * @export
 */
export type PlatformType = 'linux' | 'darwin' | 'win32';

/**
 * Minimal configuration shape for resolving Foundry data directory overrides.
 * @export
 */
export interface FinderConfig {
  prefix?: string;
  env?: Record<string, string>;
  constants?: Record<string, unknown>;
}

/**
 * Configuration options for FoundryDataDirFinder
 * @export
 */
export interface FinderOptions {
  /**
   * Explicit path to use for the Foundry data directory.
   * When provided, this takes highest precedence.
   */
  path?: string;

  /**
   * Optional config object providing env and constant overrides.
   * Defaults to the module config when available.
   */
  config?: FinderConfig;

  /**
   * The platform identifier ('linux', 'darwin', 'win32')
   * @default Detected from os.platform()
   */
  platform?: PlatformType;

  /**
   * The username to use for path construction
   * @default Detected from os.userInfo() or environment variables
   */
  user?: string;

  /**
   * Enable verbose logging during directory search
   * @default false
   */
  verbose?: boolean;
}

/**
 * Result of a directory search operation
 * @export
 */
export interface FindResult {
  /**
   * The path to the found directory, or empty string if not found
   */
  path: string;

  /**
   * Whether the directory was found
   */
  found: boolean;

  /**
   * The platform where the search was performed
   */
  platform: PlatformType;

  /**
   * All paths that were checked during the search
   */
  checkedPaths: string[];
}
