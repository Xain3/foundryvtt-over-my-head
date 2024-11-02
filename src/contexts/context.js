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
   * @param {...string} path - The path to the value. If omitted, the key is registered at the top level.
   */
  fetchStateAtPath(path) {
    let obj = this.state;
    for (let i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]];
    }
    return obj;
  }

  set(key, value, ...path) {
    if (path.length > 0) {
      let obj = this.fetchStateAtPath(path);
      obj[path[path.length - 1]] = value;
      return;
    }
    this.state[key] = value;
  }


  /**
   * Get a value from the context state.
   * @param {string} key - The key for the state value.
   * @returns {*} The value associated with the key.
   * @param {...string} path - The path to the value. If omitted, the key is fetched at the top level.
   */
  get(key, ...path) {
    if (path.length > 0) {
      let obj = this.fetchStateAtPath(path);
      return obj;
    }
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
