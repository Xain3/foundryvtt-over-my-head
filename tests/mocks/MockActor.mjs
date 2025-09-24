/**
 * @file MockActor.mjs
 * @description Mock Actor class representing characters, NPCs, and other actors
 * @path tests/mocks/MockActor.mjs
 */

import MockDocument from './MockDocument.mjs';
import MockCollection from './MockCollection.mjs';

/**
 * Mock Actor class
 */
class MockActor extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.type = data.type || 'character';
    this.system = data.system || {};
    this.items = new MockCollection();
    this.effects = new MockCollection();
  }

  /**
   * Get actor items by type
   * @param {string} type - Item type
   * @returns {Array} Array of items
   */
  itemTypes(type) {
    return this.items.filter(item => item.type === type);
  }
}

export default MockActor;
