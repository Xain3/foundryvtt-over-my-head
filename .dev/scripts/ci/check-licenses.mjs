#!/usr/bin/env node

/**
 * @file check-licenses.mjs
 * @description Placeholder license compliance gate leveraged by CI workflows.
 * @path .dev/scripts/ci/check-licenses.mjs
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const SCRIPT_PATH = new URL(import.meta.url).pathname;
const SCRIPT_DIR = path.dirname(SCRIPT_PATH);
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..');
const CHECK_CONFIG_FILE = path.join(
  PROJECT_ROOT,
  '.dev',
  'config',
  'ci-checks.yaml'
);

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const NC = '\x1b[0m';

let VERBOSE = false;
let DRY_RUN = false;

const args = process.argv.slice(2);

function usage() {
  console.log(`
Usage: node ${path.basename(SCRIPT_PATH)} [OPTIONS]

License checking script for dependency and code license compliance.

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose output
    --dry-run       Show what would be checked without running actual scans

EXAMPLES:
    node ${path.basename(SCRIPT_PATH)}                  # Run basic license check
    node ${path.basename(SCRIPT_PATH)} --verbose        # Run with detailed output
    node ${path.basename(SCRIPT_PATH)} --dry-run        # Preview what will be checked

TODO: This is currently a placeholder implementation.
Future enhancements should include:
- Integration with license scanning tools (e.g., FOSSA, Black Duck, licensee)
- Dependency license analysis for npm/pip/cargo packages
- Source code license header validation
- Configurable license allowlist/denylist
- Integration with CI/CD pipeline
- SPDX license identifier support
`);
}

for (let i = 0; i < args.length; i += 1) {
  switch (args[i]) {
    case '-h':
    case '--help':
      usage();
      process.exit(0);
      break;
    case '-v':
    case '--verbose':
      VERBOSE = true;
      break;
    case '--dry-run':
      DRY_RUN = true;
      break;
    default:
      console.error(`${RED}Error: Unknown option ${args[i]}${NC}`);
      usage();
      process.exit(1);
  }
}

function logInfo(message) {
  console.log(`${GREEN}[INFO]${NC} ${message}`);
}

function logError(message) {
  console.error(`${RED}[ERROR]${NC} ${message}`);
}

function logWarn(message) {
  console.log(`${YELLOW}[WARN]${NC} ${message}`);
}

function logVerbose(message) {
  if (VERBOSE) {
    console.log(`${YELLOW}[VERBOSE]${NC} ${message}`);
  }
}

const LicenseCheckLevel = Object.freeze({
  OFF: 0,
  DRY_RUN: 1,
  FAIL_SILENTLY: 2,
  WARN: 3,
  ERROR: 4,
});

const IssueType = Object.freeze({
  MISSING_LICENSE_FILE: 'missing-license-file',
});

/**
 * @export
 * @returns {number} Configured license check level based on ci-checks.yaml settings.
 */
function loadCheckConfiguration() {
  try {
    const rawContent = fs.readFileSync(CHECK_CONFIG_FILE, 'utf8');
    const parsedContent = yaml.load(rawContent) ?? {};
    const configuredValue = parsedContent.checkLicenses;

    if (
      typeof configuredValue === 'number' &&
      Number.isInteger(configuredValue) &&
      configuredValue >= LicenseCheckLevel.OFF &&
      configuredValue <= LicenseCheckLevel.ERROR
    ) {
      return configuredValue;
    }

    if (typeof configuredValue === 'boolean') {
      return configuredValue ? LicenseCheckLevel.ERROR : LicenseCheckLevel.OFF;
    }

    logWarn(
      `checkLicenses not set or invalid in ${CHECK_CONFIG_FILE}; defaulting to strict mode.`
    );
    return LicenseCheckLevel.ERROR;
  } catch (error) {
    logWarn(
      `Could not read ${CHECK_CONFIG_FILE}: ${error.message}. Assuming strict mode.`
    );
    return LicenseCheckLevel.ERROR;
  }
}

function runDryRunSummary() {
  logInfo('DRY RUN: Would perform the following checks:');
  console.log('  - Scan package.json dependencies for license information');
  console.log('  - Check for LICENSE file in project root');
  console.log('  - Validate license headers in source files');
  console.log('  - Generate license compliance report');
}

function assessProjectLicenseFile() {
  const licensePath = path.join(PROJECT_ROOT, 'LICENSE');

  if (fs.existsSync(licensePath)) {
    logInfo('Found project LICENSE file');
    logVerbose(`License file: ${licensePath}`);
    return null;
  }

  return {
    type: IssueType.MISSING_LICENSE_FILE,
    message: 'No LICENSE file found in project root',
  };
}

function checkPackageJson() {
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  logInfo('Found package.json - would scan npm dependencies');
  logVerbose(`Package file: ${packageJsonPath}`);
  logInfo('TODO: Implement npm dependency license scanning');
}

function checkPythonArtifacts() {
  const pythonFiles = ['requirements.txt', 'pyproject.toml'];
  const hasPython = pythonFiles.some((file) =>
    fs.existsSync(path.join(PROJECT_ROOT, file))
  );

  if (!hasPython) {
    return;
  }

  logInfo('Found Python package files - would scan Python dependencies');
  logInfo(
    'TODO: Implement Python dependency license scanning (pip-licenses, etc.)'
  );
}

function checkCargoArtifacts() {
  const cargoTomlPath = path.join(PROJECT_ROOT, 'Cargo.toml');

  if (!fs.existsSync(cargoTomlPath)) {
    return;
  }

  logInfo('Found Cargo.toml - would scan Rust dependencies');
  logInfo(
    'TODO: Implement Rust dependency license scanning (cargo-license, etc.)'
  );
}

function findSourceFiles(dir, results = []) {
  const items = fs.readdirSync(dir);
  const excludes = ['node_modules', '.git'];
  const extensions = ['.js', '.ts', '.py', '.rs', '.go'];

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludes.includes(item)) {
        findSourceFiles(fullPath, results);
      }

      continue;
    }

    if (stat.isFile()) {
      const ext = path.extname(item);

      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

function scanSourceFiles() {
  logInfo('Checking for common license compliance issues...');

  try {
    const sourceFiles = findSourceFiles(PROJECT_ROOT);

    if (sourceFiles.length > 0) {
      logInfo(
        `Found ${sourceFiles.length} source files to check for license headers`
      );
      logInfo('TODO: Implement license header validation for source files');
      return;
    }

    logInfo('No source files found - template repository');
  } catch (error) {
    logWarn(`Error scanning source files: ${error.message}`);
  }
}

function inspectPackageManagers() {
  checkPackageJson();
  checkPythonArtifacts();
  checkCargoArtifacts();
}

/**
 * @export
 * @returns {Array<{type: string, message: string}>} Collected license issues discovered during checks.
 */
function performLicenseChecks() {
  logInfo('Starting license compliance check...');
  logVerbose(`Project root: ${PROJECT_ROOT}`);

  const issues = [];
  const licenseIssue = assessProjectLicenseFile();

  if (licenseIssue) {
    issues.push(licenseIssue);
  }

  inspectPackageManagers();
  scanSourceFiles();

  return issues;
}

function shouldTreatAsError(level, issueType, isDryRun) {
  if (isDryRun || level === LicenseCheckLevel.DRY_RUN) {
    return false;
  }

  if (level === LicenseCheckLevel.FAIL_SILENTLY) {
    return issueType !== IssueType.MISSING_LICENSE_FILE;
  }

  if (level === LicenseCheckLevel.WARN) {
    return false;
  }

  return level === LicenseCheckLevel.ERROR;
}

/**
 * @export
 * @param {Array<{type: string, message: string}>} issues Issues found during the check run.
 * @param {number} level Configured severity level from ci-checks.yaml.
 * @param {boolean} isDryRun Indicates whether execution runs in dry-run mode.
 * @returns {{ shouldExit: boolean, suppressedCount: number }} Aggregated error/suppression information.
 */
function reportIssues(issues, level, isDryRun) {
  let shouldExit = false;
  let suppressedCount = 0;

  for (const issue of issues) {
    const treatAsError = shouldTreatAsError(level, issue.type, isDryRun);
    const suppressed =
      !isDryRun &&
      level === LicenseCheckLevel.FAIL_SILENTLY &&
      issue.type === IssueType.MISSING_LICENSE_FILE &&
      !VERBOSE;

    if (!suppressed) {
      const suffix =
        isDryRun || level === LicenseCheckLevel.DRY_RUN ? ' [dry-run]' : '';
      const message = `${issue.message}${suffix}`;

      if (treatAsError) {
        logError(message);
      } else {
        logWarn(message);
      }

      if (issue.type === IssueType.MISSING_LICENSE_FILE) {
        logWarn(
          'Add a LICENSE file at the project root to resolve this issue.'
        );
      }
    } else {
      suppressedCount += 1;
    }

    shouldExit = shouldExit || treatAsError;
  }

  return { shouldExit, suppressedCount };
}

/**
 * @export
 * @returns {void}
 */
function main() {
  logVerbose(`Script: ${SCRIPT_PATH}`);
  logVerbose(`Arguments: ${args.join(' ')}`);

  const checkLevel = loadCheckConfiguration();

  if (DRY_RUN) {
    runDryRunSummary();
    return;
  }

  if (checkLevel === LicenseCheckLevel.OFF) {
    logInfo(`License check skipped via configuration (${CHECK_CONFIG_FILE}).`);
    return;
  }

  const effectiveDryRun = checkLevel === LicenseCheckLevel.DRY_RUN;
  const issues = performLicenseChecks();

  logVerbose(
    'NOTE: This is a placeholder implementation. Integrate with actual license scanning tools for production use.'
  );

  if (issues.length === 0) {
    if (effectiveDryRun) {
      logInfo('License check completed (dry run); no issues detected.');
    } else {
      logInfo('License check completed successfully');
    }
    return;
  }

  const { shouldExit, suppressedCount } = reportIssues(
    issues,
    checkLevel,
    effectiveDryRun
  );

  if (shouldExit) {
    logError('License check failed due to detected issues.');
    process.exit(1);
  }

  if (effectiveDryRun) {
    logInfo('License check completed in dry-run mode; failures suppressed.');
    return;
  }

  if (checkLevel === LicenseCheckLevel.FAIL_SILENTLY && suppressedCount > 0) {
    logInfo('License issues detected but suppressed by configuration.');
    return;
  }

  if (checkLevel === LicenseCheckLevel.WARN) {
    logWarn('License check completed with warnings.');
    return;
  }

  logInfo(
    'License check completed; issues reported as warnings per configuration.'
  );
}

export {
  LicenseCheckLevel,
  IssueType,
  loadCheckConfiguration,
  performLicenseChecks,
  reportIssues,
  main,
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
