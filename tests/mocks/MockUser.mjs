/**
 * @file MockUser.js
 * @description Mock User class representing players and game masters
 * @path tests/mocks/MockUser.js
 */

import MockDocument from './MockDocument.mjs';

/**
 * Mock User class
 */
class MockUser extends MockDocument {
  constructor(data = {}) {
    super(data);
    this.role = data.role ?? 4; // GAMEMASTER by default for testing
    this.active = data.active ?? true;
    this.character = data.character || null;
  }

  get isGM() {
    return this.role >= 4;
  }
}

export default MockUser;
