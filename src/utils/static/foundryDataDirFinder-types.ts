/**
 * @file foundryDataDirFinder-types.ts
 * @description Type definitions for FoundryDataDirFinder utility
 * @path src/utils/static/foundryDataDirFinder-types.ts
 */

/**
 * Supported platform identifiers for directory finding
 */
export type PlatformType = 'linux' | 'darwin' | 'win32';

/**
 * Configuration options for FoundryDataDirFinder
 */
export interface FinderOptions {
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
