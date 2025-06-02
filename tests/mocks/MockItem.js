/**
 * @file MockItem.js
 * @description Mock Item class representing equipment, spells, features, and other items
 * @path tests/mocks/MockItem.js
 */

import MockDocument from './MockDocument.js';

/**
 * Mock Item class
 */
class MockItem extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.type = data.type || 'equipment';
    this.system = data.system || {};
  }
}

export default MockItem;
