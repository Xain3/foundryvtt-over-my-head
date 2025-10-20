/**
 * @file MockDialog.mjs
 * @description Mock Dialog class for modal dialogs and confirmations
 * @path tests/mocks/MockDialog.mjs
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

import MockApplication from './MockApplication.mjs';

/**
 * Mock Dialog class
 */
class MockDialog extends MockApplication {
  static async wait(config) {
    return new Promise(resolve => {
      const defaultValue = 'default' in config ? config.default : 'ok';
      setTimeout(() => resolve(defaultValue), 10);
    });
  }

  static async confirm(config) {
    return Promise.resolve(true);
  }

  static async prompt(config) {
    const defaultValue = 'default' in config ? config.default : '';
    return Promise.resolve(defaultValue);
  }
}

// Make static methods trackable when vi is available
if (typeof vi !== 'undefined' && vi.fn) {
  MockDialog.wait = createMockFunction(MockDialog.wait);
  MockDialog.confirm = createMockFunction(MockDialog.confirm);
  MockDialog.prompt = createMockFunction(MockDialog.prompt);
}

export default MockDialog;
