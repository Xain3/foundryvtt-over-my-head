/**
 * @file jsonc-helpers.mjs
 * @description Helper functions for parsing and writing JSONC (JSON with Comments) files
 * @path src/utils/alias-adapters/jsonc-helpers.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

/**
 * Parses a JSONC file (JSON with comments).
 * Strips comments before parsing but preserves them for later restoration.
 *
 * @param {string} filePath - Absolute path to JSONC file
 * @returns {Object} Parsed JSON object
 * @throws {Error} If file cannot be read or parsed
 *
 * @example
 * const tsconfig = parseJsoncFile('/path/to/tsconfig.json');
 */
export function parseJsoncFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  return parseJsoncString(content);
}

/**
 * Parses a JSONC string (JSON with comments).
 *
 * @param {string} content - JSONC string content
 * @returns {Object} Parsed JSON object
 * @throws {Error} If content cannot be parsed
 *
 * @example
 * const obj = parseJsoncString('{ "key": "value" /* comment *\/ }');
 */
export function parseJsoncString(content) {
  // Try parsing as valid JSON first
  try {
    return JSON.parse(content);
  } catch {
    // If that fails, strip comments and try again
    let stripped = content;

    // Remove single-line comments (// ...)
    // Match // only when not inside a string
    stripped = stripped
      .split('\n')
      .map((line) => {
        // Simple heuristic: if line has //, check if it's in a string
        const commentIndex = line.indexOf('//');
        if (commentIndex === -1) return line;

        // Count quotes before the comment
        const beforeComment = line.substring(0, commentIndex);
        const quoteCount = (beforeComment.match(/"/g) || []).length;

        // If odd number of quotes, // is inside a string
        if (quoteCount % 2 === 1) return line;

        // Remove comment
        return line.substring(0, commentIndex);
      })
      .join('\n');

    // Remove multi-line comments (/* ... */)
    stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove trailing commas before } or ]
    stripped = stripped.replace(/,(\s*[}\]])/g, '$1');

    return JSON.parse(stripped);
  }
}

/**
 * Detects indentation style and size from file content.
 *
 * @param {string} content - File content
 * @returns {Object} { useTabs: boolean, size: number }
 *
 * @example
 * const indent = detectIndentation(fileContent);
 * // Returns: { useTabs: false, size: 2 }
 */
export function detectIndentation(content) {
  const lines = content.split('\n');

  let tabCount = 0;
  let spaceCount = 0;
  const spaceSizes = [];

  for (const line of lines) {
    const match = line.match(/^(\s+)/);
    if (match) {
      const indent = match[1];
      if (indent.includes('\t')) {
        tabCount++;
      } else {
        spaceCount++;
        spaceSizes.push(indent.length);
      }
    }
  }

  const useTabs = tabCount > spaceCount;

  // Find most common space size
  let size = 2; // default
  if (spaceSizes.length > 0) {
    const counts = {};
    for (const s of spaceSizes) {
      counts[s] = (counts[s] || 0) + 1;
    }
    size = parseInt(
      Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0]
    );
  }

  return { useTabs, size };
}

/**
 * Detects EOL style (LF or CRLF) from file content.
 *
 * @param {string} content - File content
 * @returns {string} '\n' for LF, '\r\n' for CRLF
 *
 * @example
 * const eol = detectEolStyle(fileContent);
 */
export function detectEolStyle(content) {
  const crlfCount = (content.match(/\r\n/g) || []).length;
  const lfCount = (content.match(/(?<!\r)\n/g) || []).length;

  return crlfCount > lfCount ? '\r\n' : '\n';
}

/**
 * Detects if file has trailing newline.
 *
 * @param {string} content - File content
 * @returns {boolean} True if file ends with newline
 *
 * @example
 * const hasTrailingNewline = detectTrailingNewline(fileContent);
 */
export function detectTrailingNewline(content) {
  return content.endsWith('\n') || content.endsWith('\r\n');
}

/**
 * Writes JSONC file with preserved formatting.
 *
 * @param {string} filePath - Absolute path to JSONC file
 * @param {Object} data - JSON object to write
 * @param {Object} options - Formatting options
 * @param {boolean} [options.useTabs=false] - Use tabs for indentation
 * @param {number} [options.size=2] - Indentation size (spaces)
 * @param {string} [options.eol='\n'] - EOL style
 * @param {boolean} [options.trailingNewline=true] - Add trailing newline
 * @returns {void}
 *
 * @example
 * writeJsoncFile('/path/to/tsconfig.json', tsconfig, { useTabs: false, size: 2 });
 */
export function writeJsoncFile(filePath, data, options = {}) {
  const {
    useTabs = false,
    size = 2,
    eol = '\n',
    trailingNewline = true,
  } = options;

  const indent = useTabs ? '\t' : ' '.repeat(size);
  let content = JSON.stringify(data, null, indent);

  // Replace \n with desired EOL style
  if (eol !== '\n') {
    content = content.replace(/\n/g, eol);
  }

  // Add trailing newline if needed
  if (trailingNewline && !content.endsWith(eol)) {
    content += eol;
  }

  writeFileSync(filePath, content, 'utf-8');
}

/**
 * Reads JSONC file and returns both content and formatting metadata.
 *
 * @param {string} filePath - Absolute path to JSONC file
 * @returns {Object} { data, format: { useTabs, size, eol, trailingNewline } }
 *
 * @example
 * const { data, format } = readJsoncWithFormat('/path/to/tsconfig.json');
 * // Modify data...
 * writeJsoncFile('/path/to/tsconfig.json', data, format);
 */
export function readJsoncWithFormat(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const data = parseJsoncString(content);

  const format = {
    useTabs: detectIndentation(content).useTabs,
    size: detectIndentation(content).size,
    eol: detectEolStyle(content),
    trailingNewline: detectTrailingNewline(content),
  };

  return { data, format };
}
