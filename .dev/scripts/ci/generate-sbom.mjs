#!/usr/bin/env node

/**
 * @file generate-sbom.mjs
 * @description Stub SBOM generation utility with optional syft integration.
 * @path .dev/scripts/ci/generate-sbom.mjs
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..');

/**
 * @export
 * @param {string} command CLI command to verify.
 * @returns {boolean} Whether the provided command is available on PATH.
 */
function isCommandAvailable(command) {
  try {
    execSync(`${command} --version`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * @export
 * @returns {void}
 */
function generateSbom() {
  console.log('SBOM Generation Stub');
  console.log('====================');
  console.log(`Project: ${path.basename(PROJECT_ROOT)}`);
  console.log(`Date: ${new Date().toISOString()}`);
  console.log('');

  if (isCommandAvailable('syft')) {
    console.log('✅ syft is available - generating SBOM...');

    try {
      process.chdir(PROJECT_ROOT);
      execSync('syft packages . -o json=sbom.json -o table', {
        stdio: 'inherit',
      });
      console.log('📄 SBOM generated: sbom.json');
    } catch (error) {
      console.error('❌ Error running syft:', error.message);
    }
  } else {
    console.log(
      '⚠️  syft not installed - generating basic dependency list instead'
    );
    console.log('');
    console.log('To install syft for full SBOM generation:');
    console.log(
      '  curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin'
    );
    console.log('');

    const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      console.log('Current dependencies (package.json):');

      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8')
        );
        const devDependencies = packageJson.devDependencies || {};

        if (Object.keys(devDependencies).length > 0) {
          console.log('Development dependencies:');
          Object.entries(devDependencies).forEach(([name, version]) => {
            console.log(`  ${name}: ${version}`);
          });
        } else {
          console.log('  No development dependencies found');
        }

        const dependencies = packageJson.dependencies || {};

        if (Object.keys(dependencies).length > 0) {
          console.log('Runtime dependencies:');
          Object.entries(dependencies).forEach(([name, version]) => {
            console.log(`  ${name}: ${version}`);
          });
        } else {
          console.log('  No runtime dependencies found');
        }
      } catch (error) {
        console.log('  Error reading package.json:', error.message);
      }
    } else {
      console.log('  No package.json found');
    }
  }

  console.log('');
  console.log('For vulnerability scanning, consider using:');
  console.log('  grype . (requires grype installation)');
  console.log('  npm audit (for npm dependencies)');
  console.log('');
  console.log('TODO: Integrate SBOM generation into CI pipeline');
  console.log(
    'TODO: Add support for other package managers (pip, cargo, etc.)'
  );
}

/**
 * @export
 * @returns {void}
 */
function main() {
  generateSbom();
}

export { isCommandAvailable, generateSbom, main };

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
