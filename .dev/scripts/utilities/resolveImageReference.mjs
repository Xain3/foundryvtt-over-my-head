#!/usr/bin/env node

/**
 * @file resolveImageReference.mjs
 * @description Utility to resolve user-provided values into a canonical Docker image reference for the community Foundry VTT image (`felddy/foundryvtt`).
 * @path .dev/scripts/utilities/resolveImageReference.mjs
 */

import process from 'node:process';

/**
 * Base repository for Foundry VTT images.
 * @link https://hub.docker.com/r/felddy/foundryvtt
 * @link https://github.com/felddy/foundryvtt-docker
 * @constant {string}
 */
const BASE_REPO = 'felddy/foundryvtt';

/**
 * Default version to use when no value is provided.
 * @constant {string}
 */
const DEFAULT_VERSION = 'release';

/**
 * Known aliases mapping to concrete tags published under the base repo.
 * @constant {Object<string, string>}
 */
const VERSION_ALIASES = {
  release: 'release',
  dev: 'develop',
  nightly: 'nightly',
  stable: 'release',
  latest: 'release',
};

/**
 * Precompiled validation patterns (anchored) to avoid recompiling each call.
 * VERSION_PATTERN matches 1-3 numeric segments (e.g. 10, 10.1, 10.1.2)
 * ALIAS_PATTERN matches alphanumeric strings with optional dashes.
 */
// Pattern segments — single source-of-truth fragments used to build both
// anchored RegExp objects and composed regexes.
const VERSION_SEGMENT = '\\d+(?:\\.\\d+){0,2}';
const ALIAS_SEGMENT = '[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*';

// Anchored RegExp objects for validation of raw values.
const VERSION_PATTERN = new RegExp(`^(?:${VERSION_SEGMENT})$`);
const ALIAS_PATTERN = new RegExp(`^(?:${ALIAS_SEGMENT})$`);

// Escape the base repo for use inside a regex and precompile the community image regex.
const ESCAPED_BASE_REPO = BASE_REPO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const COMMUNITY_IMAGE_REGEX = new RegExp(
  `^${ESCAPED_BASE_REPO}:(?:${VERSION_SEGMENT}|${ALIAS_SEGMENT})$`
);

/**
 * Resolve a provided value into a canonical Foundry VTT Docker image reference.
 *
 * Examples:
 *  - `resolveImageReference('dev')` -> `felddy/foundryvtt:develop`
 *  - `resolveImageReference('10.291')` -> `felddy/foundryvtt:10.291`
 *  - `resolveImageReference('felddy/foundryvtt:release')` -> `felddy/foundryvtt:release`
 *  - `resolveImageReference()` -> `felddy/foundryvtt:release` (default)
 *
 * @param {string} [arg] - Version, alias, or full image tag.
 * @returns {string} Canonical Docker image reference.
 * @throws {TypeError} If `arg` is provided but not a string.
 * @throws {Error} If `arg` cannot be resolved to a valid image reference.
 */
function resolveImageReference(arg, exportImageToEnv = false) {
  if (arg !== undefined && typeof arg !== 'string') {
    throw new TypeError(
      'resolveImageReference: argument must be a string when provided'
    );
  }

  const raw = typeof arg === 'string' ? arg : '';
  const trimmed = raw.trim();
  const value = trimmed === '' ? DEFAULT_VERSION : trimmed;

  let output = (value) => {
    if (exportImageToEnv) {
      process.env.FOUNDRY_IMAGE = value;
    }
    return value;
  };

  // If it's already a valid community image reference, return it unchanged.
  if (COMMUNITY_IMAGE_REGEX.test(value)) {
    return output(value);
  }

  // If it's a known alias, map it to the configured tag.
  if (Object.prototype.hasOwnProperty.call(VERSION_ALIASES, value)) {
    return output(`${BASE_REPO}:${VERSION_ALIASES[value]}`);
  }

  // If it matches a numeric version pattern, use it as a tag.
  if (VERSION_PATTERN.test(value)) {
    return output(`${BASE_REPO}:${value}`);
  }

  // If it matches a generic alias/tag pattern (alphanumeric and dashes), use it.
  if (ALIAS_PATTERN.test(value)) {
    return output(`${BASE_REPO}:${value}`);
  }

  // Nothing matched — provide a helpful error message.
  throw new Error(
    `Invalid FOUNDRY_IMAGE argument: "${arg}". Valid values: a full image tag like "${BASE_REPO}:release", a numeric version like "10.291", or an alias such as "release" or "dev".`
  );
}

export default resolveImageReference;
export { BASE_REPO, DEFAULT_VERSION, VERSION_ALIASES, resolveImageReference };

// CLI entry: allow running as a script to resolve and optionally export
const isMain =
  process.argv[1] && process.argv[1].includes('resolveImageReference.mjs');

if (isMain) {
  const printHelp = () => {
    console.log(
      [
        'Usage: resolveImageReference [options] [value]',
        '',
        'Resolve a Foundry VTT Docker image reference for felddy/foundryvtt.',
        '',
        'Positional:',
        '  value                 Version/alias or full tag (e.g., 10.291, dev, felddy/foundryvtt:release)',
        '',
        'Options:',
        '  -v, --value <value>   Provide the value via flag (alternative to positional)',
        '  -e, --export-env      Export resolved image to FOUNDRY_IMAGE env var',
        '  -h, --help            Show this help message',
        '',
        'Resolution order:',
        '  1) --value flag, 2) positional arg, 3) $FOUNDRY_IMAGE, 4) default (release)',
      ].join('\n')
    );
  };

  const args = process.argv.slice(2);
  let valueArg;
  let exportEnv = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-h' || a === '--help') {
      printHelp();
      process.exit(0);
    } else if (a === '-e' || a === '--export-env') {
      exportEnv = true;
    } else if (a === '-v' || a === '--value') {
      const next = args[i + 1];
      if (!next || next.startsWith('-')) {
        console.error('Error: --value requires an argument');
        process.exit(2);
      }
      valueArg = next;
      i++;
    } else if (!a.startsWith('-') && valueArg === undefined) {
      valueArg = a;
    } else {
      console.error(`Unknown option: ${a}`);
      process.exit(2);
    }
  }

  if (valueArg === undefined) {
    valueArg = process.env.FOUNDRY_IMAGE || '';
  }

  let resolved;
  try {
    resolved = resolveImageReference(valueArg, exportEnv);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  console.log(`FOUNDRY_IMAGE=${resolved}`);
  if (exportEnv) {
    process.env.FOUNDRY_IMAGE = resolved;
    console.log('# Exported to environment variable FOUNDRY_IMAGE');
  }
}
