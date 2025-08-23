import { formatError } from './errorFormatter.js';

/**
 * @file errorFormatter.test.js
 * @description Unit tests for the errorFormatter helper re-export.
 * @path src/helpers/errorFormatter.test.js
 */


describe('formatError (re-export)', () => {
  it('should be defined and be a function', () => {
    expect(formatError).toBeDefined();
    expect(typeof formatError).toBe('function');
  });

  it('should format an Error object as expected', () => {
    const error = new Error('Test error');
    const result = formatError(error, { includeStack: false });
    expect(typeof result).toBe('string');
    expect(result).toMatch(/Test error/);
  });

  it('should format a string error as expected', () => {
    const result = formatError('A string error', { includeStack: false });
    expect(typeof result).toBe('string');
    expect(result).toMatch(/A string error/);
  });
});