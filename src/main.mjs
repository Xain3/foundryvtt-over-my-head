/**
 * @file Main Module Entry Point
 * @description Module initialization and configuration loading
 * @path src/main.mjs
 */

// Import and initialize the configuration singleton on module load
import { config } from './config/config.ts';

/**
 * Main module initialization function
 * Called when module loads; ensures configuration is ready for the module
 */
function main() {
  console.log('[OMH] Main module initializing...');
  console.info(config.toString());
  console.log('Hello, World!');
}

// Initialize on module load
main();

export default config;
