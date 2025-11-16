/**
 * @file errorFormatter-basic.unit.test.mjs
 * @description Baseline unit tests for the error formatter (User Story 1).
 * @path tests/unit/errorFormatter-basic.unit.test.mjs
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('#/utils/static/moduleNameResolver.ts', () => ({
  resolveModuleName: vi.fn(() => 'Mock Module'),
}));

const { resolveModuleName } = await import(
  '#/utils/static/moduleNameResolver.ts'
);
const { formatError } = await import('#/utils/errorFormatter');

describe('formatError – User Story 1', () => {
  it('formats Error instances with the module prefix and message', () => {
    const result = formatError(new Error('Configuration failed'));

    expect(result).toContain('Mock Module');
    expect(result).toContain('Configuration failed');
    expect(vi.mocked(resolveModuleName)).toHaveBeenCalledTimes(1);
  });

  it('coerces string inputs into Error instances before formatting', () => {
    const result = formatError('Loader issue');

    expect(result).toContain('Mock Module');
    expect(result).toContain('Loader issue');
  });

  it('throws TypeError when provided value cannot be coerced', () => {
    // @ts-expect-error - intentional invalid input for runtime validation
    expect(() => formatError(undefined)).toThrow(TypeError);
  });

  it('falls back to placeholder text when error message is empty', () => {
    const result = formatError(new Error(''));

    expect(result).toContain('Mock Module');
    expect(result).toContain('[No error message provided]');
  });
});
