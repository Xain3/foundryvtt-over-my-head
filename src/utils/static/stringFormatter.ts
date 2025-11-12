/**
 * @file stringFormatter.ts
 * @description Pure string formatting utility with prefix/suffix support.
 * @path src/utils/static/stringFormatter.ts
 */

import type { FormatOptions } from './stringFormatter-types.ts';

/**
 * Formats a string by prepending an optional prefix and/or appending an optional suffix.
 *
 * This is a pure utility function with zero dependencies. It applies formatting in order:
 * 1. Prepend prefix (if provided)
 * 2. Append suffix (if provided)
 *
 * @param {string} base - The base string to format
 * @param {FormatOptions} [options] - Optional formatting configuration
 * @param {string} [options.prefix] - String to prepend
 * @param {string} [options.suffix] - String to append
 * @returns {string} The formatted string with prefix and/or suffix applied
 *
 * @example
 * // Prefix only
 * formatString('world', { prefix: 'hello-' }); // 'hello-world'
 *
 * @example
 * // Suffix only
 * formatString('world', { suffix: '!' }); // 'world!'
 *
 * @example
 * // Both prefix and suffix
 * formatString('world', { prefix: 'hello-', suffix: '!' }); // 'hello-world!'
 *
 * @example
 * // No options (identity)
 * formatString('world'); // 'world'
 */
export function formatString(base: string, options?: FormatOptions): string {
  let result = '';

  // Apply prefix if provided
  if (options?.prefix) {
    result += options.prefix;
  }

  // Append base string
  result += base;

  // Apply suffix if provided
  if (options?.suffix) {
    result += options.suffix;
  }

  return result;
}

// Re-export types for convenience
export type { FormatOptions } from './stringFormatter-types.ts';
