/**
 * @file MockCollection.js
 * @description Mock Collection class that extends Map to simulate Foundry's Collection behavior
 * @path tests/mocks/MockCollection.js
 */

/**
 * Mock Collection class that extends Map to simulate Foundry's Collection behavior
 */
class MockCollection extends Map {
  constructor(entries = []) {
    super(entries);
  }

  /**
   * Find an entity by a predicate function
   * @param {Function} predicate - Function to test each element
   * @returns {*} The first element that matches the predicate
   */
  find(predicate) {
    for (const [key, value] of this) {
      if (predicate(value, key)) return value;
    }
    return undefined;
  }

  /**
   * Filter entities by a predicate function
   * @param {Function} predicate - Function to test each element
   * @returns {Array} Array of elements that match the predicate
   */
  filter(predicate) {
    const results = [];
    for (const [key, value] of this) {
      if (predicate(value, key)) results.push(value);
    }
    return results;
  }

  /**
   * Get entity by ID
   * @param {string} id - The entity ID
   * @returns {*} The entity or undefined
   */
  get(id) {
    return super.get(id);
  }

  /**
   * Convert collection to array
   * @returns {Array} Array of collection values
   */
  toArray() {
    return Array.from(this.values());
  }

  /**
   * Get collection contents
   * @returns {Array} Array of collection values
   */
  get contents() {
    return this.toArray();
  }
}

export default MockCollection;
