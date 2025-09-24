import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { formatError } from './errorFormatter.mjs';

/**
 * @file errorFormatter.test.mjs
 * @description Unit tests for the errorFormatter helper re-export.
 * @path src/helpers/errorFormatter.test.mjs
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