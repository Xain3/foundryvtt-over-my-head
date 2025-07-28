/**
 * Simple test to debug Jest integration
 */

import { JSDOM } from 'jsdom';
import Context from '../../src/contexts/context.js';
import RootMapParser from '../../src/helpers/rootMapParser.js';

// Mock RootMapParser to return real DOM storage objects
jest.mock('../../src/helpers/rootMapParser.js', () => ({
  parse: jest.fn()
}));

describe('Simple Test with RootMapParser Mock', () => {
  beforeEach(() => {
    RootMapParser.parse.mockClear();
  });

  it('should pass', () => {
    expect(true).toBe(true);
  });
});
