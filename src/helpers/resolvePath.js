/**
 * @file resolvePath.js
 * @description This file contains a function to resolve dot-notation paths with optional chaining support.
 * @path src/helpers/resolvePath.js
 */

/**
 * Resolves a dot-notation path with optional chaining support
 * @param {Object} obj - The root object
 * @param {string} path - The path to resolve (e.g., "game?.user")
 * @returns {*} The resolved value
 *
 * @example
 * const obj = { a: { b: { c: 42 } } };
 * const value = resolvePath(obj, 'a.b.c'); // 42
 * const value2 = resolvePath(obj, 'a.b.d'); // undefined
 * const value3 = resolvePath(obj, 'a.b.c?'); // 42
 * const value4 = resolvePath(obj, 'a.b.d?'); // undefined
 */
const resolvePath = (obj, path) => {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (part.endsWith('?')) {
      const prop = part.slice(0, -1);
      current = current?.[prop];
    } else {
      current = current?.[part];
    }

    if (current === undefined || current === null) break;
  }

  return current;
};

export default resolvePath;