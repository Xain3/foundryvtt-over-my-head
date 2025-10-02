#!/usr/bin/env node

/**
 * @file verify-version-consistency.mjs
 * @description Ensures VERSION file and package.json stay in sync for releases.
 * @path .dev/scripts/ci/verify-version-consistency.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import semver from 'semver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Navigate to project root (3 levels up from .dev/scripts/ci/)
const projectRoot = join(__dirname, '..', '..', '..');

const VERSION_FILE = join(projectRoot, 'VERSION');
const PACKAGE_JSON_FILE = join(projectRoot, 'package.json');
const CHECK_CONFIG_FILE = join(projectRoot, '.dev', 'config', 'ci-checks.yaml');

const CheckLevel = Object.freeze({
  OFF: 0,
  DRY_RUN: 1,
  MISSING_FAIL_SILENTLY: 2,
  WARN: 3,
  ERROR: 4,
});

const IssueType = Object.freeze({
  MISSING_FILE: 'missing-file',
  INVALID_SEMVER: 'invalid-semver',
  MISMATCH: 'mismatch',
});

/**
 * @export
 * @returns {number} Numerical check level parsed from ci-checks.yaml configuration.
 */
function loadCheckLevel() {
  try {
    const rawContent = readFileSync(CHECK_CONFIG_FILE, 'utf8');
    const parsedContent = yaml.load(rawContent) ?? {};
    const configuredLevel = Number(parsedContent.checkVersionConsistency);

    if (
      Number.isInteger(configuredLevel) &&
      configuredLevel >= CheckLevel.OFF &&
      configuredLevel <= CheckLevel.ERROR
    ) {
      return configuredLevel;
    }

    console.warn(
      '⚠️ Invalid checkVersionConsistency value; defaulting to strict mode.'
    );
    return CheckLevel.ERROR;
  } catch (error) {
    console.warn(
      `⚠️ Could not read ${CHECK_CONFIG_FILE}; defaulting to strict mode (${error.message}).`
    );
    return CheckLevel.ERROR;
  }
}

function readVersionFile() {
  try {
    return { value: readFileSync(VERSION_FILE, 'utf8').trim() };
  } catch (error) {
    return { error: `Could not read VERSION file: ${error.message}` };
  }
}

function readPackageJsonVersion() {
  try {
    const content = readFileSync(PACKAGE_JSON_FILE, 'utf8');
    const packageData = JSON.parse(content);
    return { value: packageData.version };
  } catch (error) {
    return { error: `Could not read package.json: ${error.message}` };
  }
}

function isValidVersion(version) {
  return semver.valid(version) !== null;
}

function shouldTreatAsError(checkLevel, issueType) {
  if (checkLevel === CheckLevel.DRY_RUN) {
    return false;
  }

  if (checkLevel === CheckLevel.MISSING_FAIL_SILENTLY) {
    return issueType !== IssueType.MISSING_FILE;
  }

  if (checkLevel === CheckLevel.WARN) {
    return false;
  }

  return true;
}

/**
 * @export
 * @returns {{ issues: Array<{ type: string, message: string }> }} Structured version validation issues.
 */
function gatherVersionData() {
  const versionResult = readVersionFile();
  const packageResult = readPackageJsonVersion();
  const issues = collectMissingFileIssues(versionResult, packageResult);

  if (issues.length > 0) {
    return { issues };
  }

  const versionFileContent = versionResult.value;
  const packageJsonVersion = packageResult.value;

  logVersionNumbers(versionFileContent, packageJsonVersion);

  const validationIssues = validateSemanticVersions(
    versionFileContent,
    packageJsonVersion
  );

  issues.push(...validationIssues);

  if (issues.length === 0) {
    console.log('✅ Versions are synchronized');
  }

  return { issues };
}

function collectMissingFileIssues(versionResult, packageResult) {
  const issues = [];

  if (versionResult.error) {
    issues.push({ type: IssueType.MISSING_FILE, message: versionResult.error });
  }

  if (packageResult.error) {
    issues.push({ type: IssueType.MISSING_FILE, message: packageResult.error });
  }

  return issues;
}

function logVersionNumbers(versionFileContent, packageJsonVersion) {
  console.log(`📄 VERSION file: ${versionFileContent}`);
  console.log(`📦 package.json: ${packageJsonVersion}`);
}

function validateSemanticVersions(versionFileContent, packageJsonVersion) {
  const issues = [];

  validateVersionValue(issues, 'VERSION file', versionFileContent);
  validateVersionValue(issues, 'package.json', packageJsonVersion);

  if (issues.length === 0 && versionFileContent !== packageJsonVersion) {
    issues.push({
      type: IssueType.MISMATCH,
      message: `Version mismatch! VERSION file: ${versionFileContent}, package.json: ${packageJsonVersion}`,
    });
  }

  return issues;
}

function validateVersionValue(issues, label, version) {
  if (!isValidVersion(version)) {
    issues.push({
      type: IssueType.INVALID_SEMVER,
      message: `${label} contains invalid semver: ${version}`,
    });
    return;
  }

  console.log(`✅ ${label} contains valid semver`);
}

/**
 * @export
 * @param {Array<{ type: string, message: string }>} issues Issues detected during version validation.
 * @param {number} checkLevel Severity level controlling enforcement behaviour.
 * @returns {{ shouldExit: boolean, suppressedCount: number }} Aggregated outcome from issue reporting.
 */
function reportIssues(issues, checkLevel) {
  let shouldExit = false;
  let suppressedCount = 0;

  for (const issue of issues) {
    const treatAsError = shouldTreatAsError(checkLevel, issue.type);
    const isSuppressed =
      checkLevel === CheckLevel.MISSING_FAIL_SILENTLY &&
      issue.type === IssueType.MISSING_FILE;

    if (!isSuppressed) {
      const logger = treatAsError ? console.error : console.warn;
      const prefix = treatAsError ? '❌' : '⚠️';
      const suffix = checkLevel === CheckLevel.DRY_RUN ? ' [dry-run]' : '';

      logger(`${prefix}${suffix} ${issue.message}`);

      if (issue.type === IssueType.MISMATCH) {
        logger(
          `${prefix}${suffix} Run the version bump script to synchronize versions.`
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
  const checkLevel = loadCheckLevel();

  if (checkLevel === CheckLevel.OFF) {
    console.log('ℹ️ Version consistency check disabled via ci-checks.yaml.');
    return;
  }

  if (checkLevel === CheckLevel.DRY_RUN) {
    console.log('ℹ️ Version consistency check running in dry-run mode.');
  }

  console.log('🔍 Verifying version consistency...');

  const { issues } = gatherVersionData();

  if (issues.length === 0) {
    console.log('\n🎉 Version verification passed!');
    return;
  }

  const { shouldExit, suppressedCount } = reportIssues(issues, checkLevel);

  if (shouldExit) {
    console.log('\n💥 Version verification failed!');
    process.exit(1);
  }

  if (checkLevel === CheckLevel.DRY_RUN) {
    console.log(
      '\nℹ️ Version verification completed (dry run); no failures recorded.'
    );
    return;
  }

  if (checkLevel === CheckLevel.MISSING_FAIL_SILENTLY) {
    if (suppressedCount > 0) {
      console.log(
        '\nℹ️ Version verification issues suppressed by configuration.'
      );
    }
    return;
  }

  if (checkLevel === CheckLevel.WARN) {
    console.log('\nℹ️ Version verification completed with warnings.');
    return;
  }

  console.log(
    '\nℹ️ Version verification completed with warnings; failing suppressed by configuration.'
  );
}

export {
  CheckLevel,
  IssueType,
  loadCheckLevel,
  gatherVersionData,
  reportIssues,
  main,
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
