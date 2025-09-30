/**
 * @file buildUtils.mjs
 * @description Shared utility functions for build process
 * @path scripts/dev/buildUtils.mjs
 */

import fs from 'fs';
import path from 'path';

/**
 * Remove accidental root-level build artifacts that may be produced by external tools.
 * Specifically targets 'main.mjs' and 'main.mjs.map' files in the project root directory.
 * These files are sometimes created by build tools and should not remain in the root.
 * 
 * @export removeRootBuildArtifacts
 * 
 * Files removed:
 * - {projectRoot}/main.mjs
 * - {projectRoot}/main.mjs.map
 * 
 * Error handling:
 * - Logs warnings if removal fails
 * - Does not throw errors to avoid breaking the build process
 * - Logs successful removals for transparency
 * 
 * @example
 * ```javascript
 * import { removeRootBuildArtifacts } from './buildUtils.mjs';
 * 
 * // Clean up before build
 * removeRootBuildArtifacts();
 * ```
 */
export const removeRootBuildArtifacts = () => {
  try {
    const ROOT_MAIN = path.resolve(process.cwd(), 'main.mjs');
    const ROOT_MAP = path.resolve(process.cwd(), 'main.mjs.map');
    const removed = [];
    if (fs.existsSync(ROOT_MAIN)) {
      fs.unlinkSync(ROOT_MAIN);
      removed.push('main.mjs');
    }
    if (fs.existsSync(ROOT_MAP)) {
      fs.unlinkSync(ROOT_MAP);
      removed.push('main.mjs.map');
    }
    if (removed.length) console.log(`Removed root artifacts: ${removed.join(', ')}`);
  } catch (error) {
    console.warn('Cleanup of root artifacts failed:', error);
  }
};
