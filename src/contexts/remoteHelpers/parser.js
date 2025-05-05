const validKeys = ['string', 'number', 'symbol'];

/**
 * Utility class for parsing key paths into arrays of keys.
 * Supports string paths (e.g., "a.b.c"), arrays of keys, and single key values.
 *
 * @class
 */
class KeyPathParser {
  
    
  static validKeyTypes = validKeys;

/**
 * Parses a key or path into an array of keys.
 *
 * @param {string|number|symbol|Array<string|number|symbol>} keyOrPath - The key or path to parse. Can be a dot-separated string, a single key, or an array of keys.
 * @returns {Array<string|number|symbol>} An array of keys representing the parsed path.
 * @throws {Error} Throws an error if the input type is not a string, number, symbol, or array.
 */
  static parse(keyOrPath) {
        if (typeof keyOrPath === 'string') {
            return keyOrPath.split('.'); // Split the string into an array of keys
        }
        if (Array.isArray(keyOrPath)) {
            return keyOrPath; // Return the array as is
        }
        if (this.validKeyTypes.includes(typeof keyOrPath)) {
            return [keyOrPath]; // Wrap the key in an array
        }
        throw new Error(`Invalid keyOrPath type: ${typeof keyOrPath}. Must be a string, number, symbol, or array.`);
    
    }
  }

  export default KeyPathParser;