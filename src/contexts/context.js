// ./src/contexts/context.js

import configs from '../../config/configs.js';

const initialState = {
  settingsReady: false,
  configs: configs
};

/**
 * Class representing a context with a state to be
 * shared across the module.
 */
class Context {
  /**
   * Create a context.
   */
  constructor(initialState) {
    this.initialState = initialState;
    this.state = { ...initialState };
  }

  /**
   * Set a value in the context state.
   * @param {string} key - The key for the state value.
   * @param {*} value - The value to set.
   */
  set(key, value) {
    this.state[key] = value;
  }

  /**
   * Get a value from the context state.
   * @param {string} key - The key for the state value.
   * @returns {*} The value associated with the key.
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Get the entire context state.
   * @returns {Object} The context state.
   */
  getState() {
    return this.state;
  }

  initializeState() {
    this.state = { ...this.initialState };
  }
}


const context = new Context(initialState);

export default context
