#!/usr/bin/env node
/**
 * @file sync-aliases.mjs
 * @description Synchronizes alias configurations from alias.config.mjs to all dependent configuration files
 * @path .dev/scripts/sync-aliases.mjs
 */

import { resolve } from 'path';
import { existsSync, statSync } from 'fs';
import process from 'process';
import { AdapterRegistry } from '../utils/alias-adapters/adapter-registry.mjs';
import { TsConfigAdapter } from '../utils/alias-adapters/tsconfig-adapter.mjs';
import { PackageJsonAdapter } from '../utils/alias-adapters/package-json-adapter.mjs';
import { normalizeFromAliasConfig } from '../utils/alias-adapters/normalization-helpers.mjs';
import aliasEntries from '../../alias.config.mjs';

const MODULE_PREFIX = 'OMH';

/**
 * Parses command-line arguments.
 *
 * @returns {Object} Parsed arguments { dryRun, verbose }
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
  };
}

/**
 * Logs message with module prefix.
 *
 * @param {string} message - Message to log
 * @param {boolean} verbose - Whether verbose logging is enabled
 */
function log(message, verbose = false) {
  if (!verbose) {
    console.log(`[${MODULE_PREFIX}] ${message}`);
  }
}

/**
 * Logs verbose message.
 *
 * @param {string} message - Message to log
 * @param {boolean} verbose - Whether verbose logging is enabled
 */
function logVerbose(message, verbose) {
  if (verbose) {
    console.log(`[${MODULE_PREFIX}] ${message}`);
  }
}

/**
 * Checks if file was recently modified (within last 10 seconds).
 *
 * @param {string} filePath - Absolute file path
 * @returns {boolean} True if file was modified within last 10 seconds
 */
function wasRecentlyModified(filePath) {
  if (!existsSync(filePath)) {
    return false;
  }

  const stats = statSync(filePath);
  const now = Date.now();
  const mtime = stats.mtimeMs;
  const diffSeconds = (now - mtime) / 1000;

  return diffSeconds < 10;
}

/**
 * Synchronizes aliases to all registered adapters.
 *
 * @param {Object} options - Sync options
 * @param {boolean} options.dryRun - Preview changes without writing
 * @param {boolean} options.verbose - Enable verbose logging
 * @returns {Promise<Object>} Sync results
 */
async function syncAliases(options = {}) {
  const { dryRun = false, verbose = false } = options;
  const projectRoot = resolve(process.cwd());

  logVerbose(`Project root: ${projectRoot}`, verbose);
  logVerbose(`Dry-run mode: ${dryRun}`, verbose);

  // Normalize expected aliases from alias.config.mjs
  const expectedAliases = normalizeFromAliasConfig(aliasEntries, projectRoot);

  logVerbose(
    `Expected aliases: ${JSON.stringify(expectedAliases, null, 2)}`,
    verbose
  );

  // Register adapters (only writable ones - skip vite/vitest)
  const registry = new AdapterRegistry();
  registry.clear();
  registry.register(new TsConfigAdapter(projectRoot));
  registry.register(new PackageJsonAdapter(projectRoot));

  log(`Processing ${registry.getAll().length} configuration files...`);

  const results = [];
  let updatedCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const adapter of registry.getAll()) {
    const format = adapter.getFormat();
    const filePaths = adapter.getFilePaths();

    log(`Processing ${format} (${filePaths[0]})...`);

    try {
      // Check for recent modifications (conflict detection)
      const recentlyModified = filePaths.some(wasRecentlyModified);
      if (recentlyModified && !dryRun) {
        log(
          `  ⚠ Skipped (file modified within last 10 seconds - possible conflict)`
        );
        skippedCount++;
        results.push({
          format,
          status: 'skipped',
          changed: false,
          message: 'File recently modified',
        });
        continue;
      }

      // Validate current state
      const validation = await adapter.validate(expectedAliases);

      if (validation.valid) {
        log(`  ✓ Already synchronized`);
        results.push({
          format,
          status: 'ok',
          changed: false,
        });
        continue;
      }

      // Show diff in verbose mode
      if (verbose) {
        logVerbose(`  Diff:${validation.diff.formatted}`, verbose);
      }

      if (dryRun) {
        log(`  → Would update (dry-run mode)`);
        results.push({
          format,
          status: 'would-update',
          changed: false,
          diff: validation.diff,
        });
      } else {
        await adapter.write(expectedAliases);
        log(`  ✓ Updated successfully`);
        updatedCount++;
        results.push({
          format,
          status: 'updated',
          changed: true,
        });
      }
    } catch (error) {
      log(`  ✗ Error: ${error.message}`);
      errorCount++;
      results.push({
        format,
        status: 'error',
        changed: false,
        error: error.message,
      });
    }
  }

  // Print summary
  console.log('');
  if (dryRun) {
    log(
      `Summary: ${updatedCount} would be updated, ${errorCount} errors, ${registry.getAll().length} total (dry-run mode)`
    );
  } else {
    log(
      `Summary: ${updatedCount} updated, ${skippedCount} skipped, ${errorCount} errors, ${registry.getAll().length} total`
    );
  }

  return {
    success: errorCount === 0,
    updatedCount,
    errorCount,
    skippedCount,
    results,
  };
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs();

  syncAliases(args)
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error(`[${MODULE_PREFIX}] Fatal error: ${error.message}`);
      process.exit(1);
    });
}

export { syncAliases };
