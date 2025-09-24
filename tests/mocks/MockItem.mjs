/**
 * @file MockItem.mjs
 * @description Mock Item class representing equipment, spells, features, and other items
 * @path tests/mocks/MockItem.mjs
 */

import MockDocument from './MockDocument.mjs';

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
