/**
 * @file MockDocument.js
 * @description Mock Document class representing Foundry Document entities
 * @path tests/mocks/MockDocument.js
 */

/**
 * Create a mock function that uses jest.fn() when available, otherwise a regular function
 * @param {Function} implementation - The function implementation
 * @returns {Function} Mock function or jest spy
 */
const createMockFunction = (implementation = () => {}) => {
  if (typeof jest !== 'undefined' && jest.fn) {
    return jest.fn(implementation);
  }
  return implementation;
};

/**
 * Mock Document class representing Foundry Document entities
 */
class MockDocument {
  constructor(data = {}, options = {}) {
    this.id = data.id || `mock-${Math.random().toString(36).substr(2, 9)}`;
    this.name = data.name || 'Mock Document';
    this.data = { ...data };
    this.flags = data.flags || {};
    this.permission = data.permission || 3; // OWNER permission
    this.sort = data.sort || 0;
    this.folder = data.folder || null;
    this._source = { ...data };
  }

  /**
   * Get a flag value
   * @param {string} scope - The flag scope
   * @param {string} key - The flag key
   * @returns {*} The flag value
   */
  getFlag(scope, key) {
    return this.flags[scope]?.[key];
  }

  /**
   * Set a flag value
   * @param {string} scope - The flag scope
   * @param {string} key - The flag key
   * @param {*} value - The flag value
   * @returns {Promise<MockDocument>} Updated document
   */
  async setFlag(scope, key, value) {
    if (!this.flags[scope]) this.flags[scope] = {};
    this.flags[scope][key] = value;
    return this;
  }

  /**
   * Update the document
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<MockDocument>} Updated document
   */
  async update(data, options = {}) {
    Object.assign(this.data, data);
    return this;
  }

  /**
   * Delete the document
   * @param {Object} options - Delete options
   * @returns {Promise<MockDocument>} Deleted document
   */
  async delete(options = {}) {
    return this;
  }
}

// Make prototype methods trackable when jest is available
if (typeof jest !== 'undefined' && jest.fn) {
  const originalUpdate = MockDocument.prototype.update;
  const originalDelete = MockDocument.prototype.delete;
  const originalSetFlag = MockDocument.prototype.setFlag;
  
  MockDocument.prototype.update = createMockFunction(originalUpdate);
  MockDocument.prototype.delete = createMockFunction(originalDelete);
  MockDocument.prototype.setFlag = createMockFunction(originalSetFlag);
}

export default MockDocument;
