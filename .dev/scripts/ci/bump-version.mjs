#!/usr/bin/env node

/**
 * @file bump-version.mjs
 * @description Version bump script for hybrid release flow with flexible file handling.
 * @path .dev/scripts/ci/bump-version.mjs
 */

/**
 * Version bump script for the hybrid release flow
 *
 * This script handles version bumping across multiple files based on bump-version.yaml config.
 * It supports patch, minor, major, alpha, beta, and explicit version setting.
 *
 * Usage:
 *   node bump-version.mjs patch|minor|major|alpha|beta
 *   node bump-version.mjs x.y.z
 *   BUMP=patch node bump-version.mjs
 *   VERSION=x.y.z node bump-version.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import semver from 'semver';
import yaml from 'js-yaml';
import ini from 'ini';
import toml from '@iarna/toml';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Navigate to project root (3 levels up from .dev/scripts/ci/)
const projectRoot = join(__dirname, '..', '..', '..');

const CONFIG_FILE = join(projectRoot, '.dev/config/bump-version.yaml');
const VERSION_FILE = join(projectRoot, 'VERSION');

/**
 * Load bump configuration from YAML
 */
export function loadConfig() {
  try {
    const content = readFileSync(CONFIG_FILE, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.error('❌ Could not load bump config:', error.message);
    process.exit(1);
  }
}

/**
 * Read current version from VERSION file
 */
export function getCurrentVersion() {
  try {
    return readFileSync(VERSION_FILE, 'utf8').trim();
  } catch (error) {
    console.error('❌ Could not read VERSION file:', error.message);
    process.exit(1);
  }
}

/**
 * Update version in a file based on its type and rules
 */
export function updateFileVersion(
  filePath,
  newVersion,
  currentVersion,
  config,
  dryRun = false
) {
  const ext = extname(filePath).toLowerCase();
  const fullPath = join(projectRoot, filePath);

  // Check if there's a custom process script for this file
  const processRules = config.process || {};
  if (processRules[filePath]) {
    const scriptPath = join(projectRoot, processRules[filePath]);
    if (existsSync(scriptPath)) {
      console.log(
        `🔧 Processing ${filePath} with custom script: ${scriptPath}`
      );
      if (!dryRun) {
        // Execute the custom script
        const result = spawnSync(
          'node',
          [scriptPath, filePath, newVersion, currentVersion],
          {
            stdio: 'inherit',
          }
        );
        if (result.status !== 0) {
          throw new Error(`Custom script failed for ${filePath}`);
        }
      } else {
        console.log(`🧪 Would run custom script for ${filePath}`);
      }
      return;
    } else {
      console.warn(
        `⚠️  Custom script not found: ${scriptPath}, falling back to default processing`
      );
    }
  }

  // Get rules for this file
  const rules = config.rules || {};
  let fileRule = rules[filePath]; // Specific file rule
  if (!fileRule) {
    // Find pattern-based rule
    for (const [pattern, rule] of Object.entries(rules)) {
      if (pattern.startsWith('.') && filePath.endsWith(pattern)) {
        fileRule = rule;
        break;
      }
    }
  }

  try {
    let content = readFileSync(fullPath, 'utf8');
    let updated = false;

    if (fileRule) {
      // Use rule-based processing
      if (fileRule.prefix_pattern && ext === '.md') {
        const fullRegex = new RegExp(
          fileRule.prefix_pattern + currentVersion.replace(/\./g, '\\.'),
          'g'
        );
        content = content.replace(fullRegex, (match) => {
          // Replace just the version part, keeping the prefix
          return match.replace(currentVersion, newVersion);
        });
        updated = true;
      } else if (fileRule.key && ext === '.json') {
        const data = JSON.parse(content);
        const keys = fileRule.key.split('.');
        let obj = data;
        for (let i = 0; i < keys.length - 1; i++) {
          obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = newVersion;
        content = JSON.stringify(data, null, 2) + '\n';
        updated = true;
      } else if (fileRule.root && ext === '.json') {
        const data = JSON.parse(content);
        data.version = newVersion;
        content = JSON.stringify(data, null, 2) + '\n';
        updated = true;
      } else if (fileRule.key && ext === '.toml') {
        const data = toml.parse(content);
        const sections = fileRule.section || [];
        let found = false;
        for (const section of sections) {
          const secKeys = section.split('.');
          let obj = data;
          for (const key of secKeys) {
            if (!obj[key]) break;
            obj = obj[key];
          }
          if (obj && obj[fileRule.key]) {
            obj[fileRule.key] = newVersion;
            found = true;
            break;
          }
        }
        if (!found && data[fileRule.key]) {
          data[fileRule.key] = newVersion;
          found = true;
        }
        if (found) {
          content = toml.stringify(data);
          updated = true;
        }
      } else if (fileRule.key && ext === '.ini') {
        const data = ini.parse(content);
        const section = fileRule.section;
        if (section && data[section] && data[section][fileRule.key]) {
          data[section][fileRule.key] = newVersion;
          content = ini.stringify(data);
          updated = true;
        } else if (data[fileRule.key]) {
          data[fileRule.key] = newVersion;
          content = ini.stringify(data);
          updated = true;
        }
      }
    } else {
      // Fallback to original logic
      if (ext === '.json') {
        const data = JSON.parse(content);
        if (data.version) {
          data.version = newVersion;
          content = JSON.stringify(data, null, 2) + '\n';
          updated = true;
        }
      } else if (ext === '.ini') {
        const data = ini.parse(content);
        if (data.app && data.app.version) {
          data.app.version = newVersion;
        } else if (data.version) {
          data.version = newVersion;
        }
        content = ini.stringify(data);
        updated = true;
      } else if (ext === '.toml') {
        const data = toml.parse(content);
        if (data.tool && data.tool.poetry && data.tool.poetry.version) {
          data.tool.poetry.version = newVersion;
        } else if (data.package && data.package.version) {
          data.package.version = newVersion;
        } else if (data.version) {
          data.version = newVersion;
        }
        content = toml.stringify(data);
        updated = true;
      } else if (filePath === 'VERSION') {
        content = newVersion + '\n';
        updated = true;
      } else if (ext === '.md') {
        const versionRegex = new RegExp(
          currentVersion.replace(/\./g, '\\.'),
          'g'
        );
        content = content.replace(versionRegex, newVersion);
        updated = true;
      } else {
        content = content.replace(new RegExp(currentVersion, 'g'), newVersion);
        updated = true;
      }
    }

    if (updated) {
      if (!dryRun) {
        writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated ${filePath}`);
      } else {
        console.log(`🧪 Would update ${filePath}`);
      }
    } else {
      console.warn(`⚠️  No version found to update in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to update ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Validate that a version string is valid semver
 */
function isValidVersion(version) {
  return semver.valid(version) !== null;
}

/**
 * Determine new version based on bump type or explicit version
 */
function getNewVersion(currentVersion, bumpTypeOrVersion) {
  // If it looks like a version (x.y.z format), treat as explicit version
  if (isValidVersion(bumpTypeOrVersion)) {
    return bumpTypeOrVersion;
  }

  // Otherwise treat as bump type
  const bumpType = bumpTypeOrVersion;

  switch (bumpType) {
    case 'patch':
      return semver.inc(currentVersion, 'patch');
    case 'minor':
      return semver.inc(currentVersion, 'minor');
    case 'major':
      return semver.inc(currentVersion, 'major');
    case 'alpha':
      return semver.inc(currentVersion, 'prerelease', 'alpha');
    case 'beta':
      return semver.inc(currentVersion, 'prerelease', 'beta');
    default:
      console.error(`❌ Invalid bump type: ${bumpType}`);
      console.error(
        'Valid options: patch, minor, major, alpha, beta, or explicit version (x.y.z)'
      );
      process.exit(1);
  }
}

/**
 * Main function
 */
export function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let bumpTypeOrVersion = process.env.VERSION || process.env.BUMP;
  let dryRun = process.env.DRY_RUN === 'true';
  let specificFile = null;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--file' || arg === '-f') {
      if (i + 1 < args.length) {
        specificFile = args[i + 1];
        i++; // Skip next arg
      } else {
        console.error('❌ --file option requires a file path');
        process.exit(1);
      }
    } else if (!bumpTypeOrVersion) {
      bumpTypeOrVersion = arg;
    }
  }

  if (!bumpTypeOrVersion) {
    console.error('❌ No bump type or version specified');
    console.error(
      'Usage: node bump-version.mjs patch|minor|major|alpha|beta|x.y.z [--dry-run] [--file <filepath>]'
    );
    console.error(
      '   or: BUMP=patch node bump-version.mjs [--file <filepath>]'
    );
    console.error(
      '   or: VERSION=x.y.z node bump-version.mjs [--file <filepath>]'
    );
    console.error(
      '   or: DRY_RUN=true node bump-version.mjs patch [--file <filepath>]'
    );
    console.error('');
    console.error('Examples:');
    console.error('  node bump-version.mjs patch');
    console.error('  node bump-version.mjs 1.2.3 --dry-run');
    console.error('  node bump-version.mjs minor --file package.json');
    console.error('  node bump-version.mjs patch --file VERSION --dry-run');
    process.exit(1);
  }

  if (dryRun) {
    console.log('🧪 Running in DRY-RUN mode - no files will be modified');
  }

  console.log('🔄 Starting version bump process...');

  // Load configuration
  const config = loadConfig();
  const filesToBump = config.filesToBump || {};
  const mandatoryFiles = filesToBump.mandatory || [];
  const optionalFiles = filesToBump.optional || [];

  // Read current version
  const currentVersion = getCurrentVersion();
  console.log(`📖 Current version: ${currentVersion}`);

  // Calculate new version
  const newVersion = getNewVersion(currentVersion, bumpTypeOrVersion);

  if (!newVersion) {
    console.error('❌ Failed to calculate new version');
    process.exit(1);
  }

  console.log(`🎯 New version: ${newVersion}`);

  if (specificFile) {
    // Process only the specific file
    console.log(`🎯 Processing only: ${specificFile}`);
    const fullPath = join(projectRoot, specificFile);
    if (!existsSync(fullPath)) {
      console.error(`❌ File not found: ${specificFile}`);
      process.exit(1);
    }
    updateFileVersion(specificFile, newVersion, currentVersion, config, dryRun);
    console.log(
      `🚀 Version bump complete for ${specificFile}: ${currentVersion} → ${newVersion}`
    );
  } else {
    // Process all files as before
    // Process mandatory files
    for (const file of mandatoryFiles) {
      const fullPath = join(projectRoot, file);
      if (!existsSync(fullPath)) {
        console.error(`❌ Mandatory file not found: ${file}`);
        process.exit(1);
      }
      updateFileVersion(file, newVersion, currentVersion, config, dryRun);
    }

    // Process optional files
    for (const file of optionalFiles) {
      const fullPath = join(projectRoot, file);
      if (existsSync(fullPath)) {
        updateFileVersion(file, newVersion, currentVersion, config, dryRun);
      } else {
        console.log(`ℹ️  Optional file not found, skipping: ${file}`);
      }
    }

    console.log(`🚀 Version bump complete: ${currentVersion} → ${newVersion}`);
  }
}

export {
  loadConfig,
  getCurrentVersion,
  updateFileVersion,
  getNewVersion,
  main,
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
