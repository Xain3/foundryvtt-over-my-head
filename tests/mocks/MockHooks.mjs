/**
 * @file MockHooks.mjs
 * @description Mock Hooks system for event handling
 * @path tests/mocks/MockHooks.mjs
 */

import { vi } from 'vitest';

/**
 * Create a mock function that uses vi.fn() when available, otherwise a regular function
 * @param {Function} implementation - The function implementation
 * @returns {Function} Mock function or vi spy
 */
const createMockFunction = (implementation = () => {}) => {
  if (typeof vi !== 'undefined' && vi.fn) {
    return vi.fn(implementation);
  }
  return implementation;
};

/**
 * Mock Hooks system for event handling
 */
class MockHooks {
  constructor() {
    this.events = new Map();
  }

  static on(event, callback) {
    if (!this._instance) this._instance = new MockHooks();
    if (!this._instance.events.has(event)) {
      this._instance.events.set(event, []);
    }
    this._instance.events.get(event).push(callback);
  }

  static once(event, callback) {
    if (!this._instance) this._instance = new MockHooks();
    if (!this._instance.events.has(event)) {
      this._instance.events.set(event, []);
    }

    // Wrap the callback to remove itself after execution
    const wrappedCallback = (...args) => {
      this.off(event, wrappedCallback);
      return callback(...args);
    };

    this._instance.events.get(event).push(wrappedCallback);
  }

  static off(event, callback) {
    if (!this._instance) return;
    const callbacks = this._instance.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  static call(event, ...args) {
    if (!this._instance) return true;
    const callbacks = this._instance.events.get(event) || [];
    for (const callback of callbacks) {
      try {
        const result = callback(...args);
        if (result === false) return false;
      } catch (error) {
        console.error(`Hook error in ${event}:`, error);
      }
    }
    return true;
  }

  static callAll(event, ...args) {
    return this.call(event, ...args);
  }
}

// Make static methods trackable when vi is available
if (typeof vi !== 'undefined' && vi.fn) {
  MockHooks.on = createMockFunction(MockHooks.on);
  MockHooks.once = createMockFunction(MockHooks.once);
  MockHooks.off = createMockFunction(MockHooks.off);
  MockHooks.call = createMockFunction(MockHooks.call);
  MockHooks.callAll = createMockFunction(MockHooks.callAll);
}

export default MockHooks;
