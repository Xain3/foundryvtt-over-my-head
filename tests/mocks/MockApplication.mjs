/**
 * @file MockApplication.mjs
 * @description Mock Application class for UI applications
 * @path tests/mocks/MockApplication.mjs
 */

/**
 * Mock Application class for UI applications
 */
class MockApplication {
  constructor(options = {}) {
    this.options = options;
    this.rendered = false;
    this.element = null;
  }

  async render(force = false) {
    this.rendered = true;
    return this;
  }

  async close() {
    this.rendered = false;
    return this;
  }
}

export default MockApplication;
