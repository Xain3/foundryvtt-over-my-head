/**
 * @file normalization-helpers.mjs
 * @description Helper functions for normalizing alias configurations between different formats
 * @path .dev/utils/alias-adapters/normalization-helpers.mjs
 */

/**
 * Normalizes an alias configuration from alias.config.mjs format to interchange format.
 *
 * @param {Array<{find: string, replacement: string}>} aliasEntries - Array of alias entries from alias.config.mjs
 * @param {string} projectRoot - Absolute path to project root directory
 * @returns {Object} Normalized aliases in format { "#/": "./src/", "#tests/": "./tests/" }
 *
 * @example
 * const aliases = normalizeFromAliasConfig([
 *   { find: "#", replacement: "/abs/path/to/src" },
 *   { find: "#tests", replacement: "/abs/path/to/tests" }
 * ], "/abs/path");
 * // Returns: { "#/": "./src/", "#tests/": "./tests/" }
 */
export function normalizeFromAliasConfig(aliasEntries, projectRoot) {
  const normalized = {};

  for (const entry of aliasEntries) {
    // Ensure find key ends with /
    const key = entry.find.endsWith('/') ? entry.find : `${entry.find}/`;

    // Convert absolute path to relative path from project root
    let relativePath = entry.replacement;
    if (relativePath.startsWith(projectRoot)) {
      relativePath = './' + relativePath.slice(projectRoot.length + 1);
    } else if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }

    // Ensure relative path ends with /
    if (!relativePath.endsWith('/')) {
      relativePath += '/';
    }

    normalized[key] = relativePath;
  }

  return normalized;
}

/**
 * Normalizes TypeScript paths format to interchange format.
 * Converts { "#/*": ["./src/*"] } to { "#/": "./src/" }
 *
 * @param {Object} paths - TypeScript compilerOptions.paths object
 * @returns {Object} Normalized aliases
 *
 * @example
 * const aliases = normalizeFromTsConfigPaths({ "#/*": ["./src/*"], "#tests/*": ["./tests/*"] });
 * // Returns: { "#/": "./src/", "#tests/": "./tests/" }
 */
export function normalizeFromTsConfigPaths(paths) {
  const normalized = {};

  for (const [key, value] of Object.entries(paths)) {
    // Remove /* from key
    const cleanKey = key.replace(/\/\*$/, '/');

    // Take first path from array and remove /*
    let cleanValue = Array.isArray(value) ? value[0] : value;
    cleanValue = cleanValue.replace(/\/\*$/, '/');

    normalized[cleanKey] = cleanValue;
  }

  return normalized;
}

/**
 * Normalizes TypeScript paths format from interchange format.
 * Converts { "#/": "./src/" } to { "#/*": ["./src/*"] }
 *
 * @param {Object} normalized - Normalized aliases
 * @returns {Object} TypeScript paths format
 *
 * @example
 * const paths = normalizeToTsConfigPaths({ "#/": "./src/", "#tests/": "./tests/" });
 * // Returns: { "#/*": ["./src/*"], "#tests/*": ["./tests/*"] }
 */
export function normalizeToTsConfigPaths(normalized) {
  const paths = {};

  for (const [key, value] of Object.entries(normalized)) {
    // Add /* to both key and value
    const tsKey = key.replace(/\/$/, '/*');
    const tsValue = value.replace(/\/$/, '/*');

    paths[tsKey] = [tsValue];
  }

  return paths;
}

/**
 * Normalizes package.json imports format (already in correct format, but validate).
 *
 * @param {Object} imports - package.json imports object
 * @returns {Object} Normalized aliases
 *
 * @example
 * const aliases = normalizeFromPackageJsonImports({ "#/": "./src/", "#tests/": "./tests/" });
 * // Returns: { "#/": "./src/", "#tests/": "./tests/" }
 */
export function normalizeFromPackageJsonImports(imports) {
  // package.json imports format matches our interchange format
  // Just validate and return
  const normalized = {};

  for (const [key, value] of Object.entries(imports)) {
    // Skip non-alias entries (like #package.json)
    if (!key.startsWith('#') || key === '#package.json') {
      continue;
    }

    normalized[key] = value;
  }

  return normalized;
}

/**
 * Normalizes to package.json imports format (same as interchange format).
 *
 * @param {Object} normalized - Normalized aliases
 * @returns {Object} package.json imports format
 *
 * @example
 * const imports = normalizeToPackageJsonImports({ "#/": "./src/", "#tests/": "./tests/" });
 * // Returns: { "#/": "./src/", "#tests/": "./tests/" }
 */
export function normalizeToPackageJsonImports(normalized) {
  // Interchange format matches package.json imports format
  return { ...normalized };
}

/**
 * Compares two normalized alias objects and returns differences.
 *
 * @param {Object} current - Current aliases
 * @param {Object} expected - Expected aliases
 * @returns {Object} Diff object with missing, extra, and mismatched keys
 *
 * @example
 * const diff = compareAliases(
 *   { "#/": "./src/" },
 *   { "#/": "./src/", "#tests/": "./tests/" }
 * );
 * // Returns: { missing: ["#tests/"], extra: [], mismatched: [] }
 */
export function compareAliases(current, expected) {
  const missing = [];
  const extra = [];
  const mismatched = [];

  // Check for missing and mismatched keys
  for (const [key, expectedValue] of Object.entries(expected)) {
    if (!(key in current)) {
      missing.push(key);
    } else if (current[key] !== expectedValue) {
      mismatched.push({
        key,
        currentValue: current[key],
        expectedValue,
      });
    }
  }

  // Check for extra keys
  for (const key of Object.keys(current)) {
    if (!(key in expected)) {
      extra.push(key);
    }
  }

  return { missing, extra, mismatched };
}

/**
 * Formats a unified diff output for validation error messages.
 *
 * @param {Object} diff - Diff object from compareAliases
 * @param {Object} current - Current aliases
 * @param {Object} expected - Expected aliases
 * @returns {string} Formatted diff string
 *
 * @example
 * const diffStr = formatDiff(diff, current, expected);
 */
export function formatDiff(diff, current, expected) {
  let output = '';

  if (diff.missing.length > 0) {
    output += `\nMissing aliases:\n`;
    for (const key of diff.missing) {
      output += `  + ${key} → ${expected[key]}\n`;
    }
  }

  if (diff.extra.length > 0) {
    output += `\nExtra aliases:\n`;
    for (const key of diff.extra) {
      output += `  - ${key} → ${current[key]}\n`;
    }
  }

  if (diff.mismatched.length > 0) {
    output += `\nMismatched aliases:\n`;
    for (const { key, currentValue, expectedValue } of diff.mismatched) {
      output += `  ${key}:\n`;
      output += `    - ${currentValue}\n`;
      output += `    + ${expectedValue}\n`;
    }
  }

  return output;
}
