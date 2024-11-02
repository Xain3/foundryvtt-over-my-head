// ./src/contexts/context.js

import moduleConfig from '../../config/config.js';

/**
 * Initial state of the context.
 * @type {Object}
 * @property {boolean} settingsReady - Whether the settings are ready.
 * @property {Object} config - The module config.
 */
const initialState = {
  settingsReady: false,
  config: moduleConfig
};

/**
 * Class representing a context with a state to be
 * shared across the module.
 */
class Context {
  /**
   * Create a context.
   * @param {Object} initialState - The initial state of the context.
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
  };

  logState(){
    console.log(this.state);
  }
}


const context = new Context(initialState);

export default context
