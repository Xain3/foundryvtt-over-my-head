/**
 * @file foundryDataDirFinder-example.mjs
 * @description Example usage of the foundryDataDirFinder utility
 * @path docs/examples/foundryDataDirFinder-example.mjs
 */

// This example shows how to use the foundryDataDirFinder utility
// from the static utilities folder in development/build scripts

import StaticUtils from '../src/utils/static.ts';
import { config } from '../src/config/config.ts';

// Example 1: Simple usage with defaults
console.log('=== Example 1: Simple Usage ===');
const result = StaticUtils.findFoundryDataDir.find({ config });
if (result.found) {
  console.log(`✓ Found FoundryVTT at: ${result.path}`);
  console.log(`  Platform: ${result.platform}`);
  console.log(`  Checked ${result.checkedPaths.length} paths`);
} else {
  console.log('✗ FoundryVTT data directory not found');
  console.log(`  Checked paths:`);
  result.checkedPaths.forEach((path) => console.log(`    - ${path}`));
}

// Example 2: Get just the path string
console.log('\n=== Example 2: Get Path String ===');
const path = StaticUtils.findFoundryDataDir.findPath({ config });
if (path) {
  console.log(`✓ Path: ${path}`);
} else {
  console.log('✗ Not found');
}

// Example 3: Custom platform and user with verbose logging
console.log('\n=== Example 3: Custom Platform/User ===');
StaticUtils.findFoundryDataDir.find({
  config,
  platform: 'linux',
  user: 'developer',
  verbose: true,
});

// Example 4: Get potential paths without checking
console.log('\n=== Example 4: Get Potential Paths ===');
const linuxPaths = StaticUtils.findFoundryDataDir.getPaths({
  config,
  platform: 'linux',
  user: 'testuser',
});
console.log('Linux paths:', linuxPaths);

const macPaths = StaticUtils.findFoundryDataDir.getPaths({
  config,
  platform: 'darwin',
  user: 'testuser',
});
console.log('macOS paths:', macPaths);

const winPaths = StaticUtils.findFoundryDataDir.getPaths({
  config,
  platform: 'win32',
  user: 'testuser',
});
console.log('Windows paths:', winPaths);

// Example 5: Usage in a build script (demonstration only)
console.log('\n=== Example 5: Build Script Usage ===');
console.log('In a real build script, you would:');
console.log('1. Find the Foundry data directory');
console.log('2. Construct the module path');
console.log('3. Copy your dist files to that location');
console.log('\nExample pseudocode:');
console.log(
  '  const foundryDir = StaticUtils.findFoundryDataDir.findPath({ config });'
);
console.log('  const modulePath = `${foundryDir}/Data/modules/my-module`;');
console.log('  copyFiles(distDir, modulePath);');

// Example 6: Override hierarchy demonstration
console.log('\n=== Example 6: Override Hierarchy ===');
process.env.FOUNDRY_DATA_DIR = '/env/foundry';
const overrideResult = StaticUtils.findFoundryDataDir.find({
  config,
  path: '/explicit/foundry',
});
console.log('Override path resolved to:', overrideResult.path);
