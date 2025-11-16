/**
 * @file Main Module Entry Point
 * @description Module initialization and configuration loading
 * @path src/main.mjs
 */

// Import and initialize the configuration singleton on module load
import OMH from './omh.mjs';

export { formatError } from './utils/errorFormatter.mts';

/**
 * Main module initialization function
 * Called when module loads; ensures configuration is ready for the module
 */
function main() {
  /* eslint-disable no-unused-vars */
  const omh = new OMH();
}

// Initialize on module load
main();
