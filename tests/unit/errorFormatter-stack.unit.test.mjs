/**
 * @file errorFormatter-stack.unit.test.mjs
 * @description Unit tests covering stack trace handling for the error formatter (User Story 2).
 * @path tests/unit/errorFormatter-stack.unit.test.mjs
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const helperMock = vi.fn();

vi.mock('#/utils/static/moduleNameResolver.ts', () => ({
  resolveModuleName: vi.fn(() => 'Mock Module'),
}));

vi.mock('#/utils/helpers/errorFormatterHelpers', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    prepareStackForOutput: helperMock,
  };
});

const { formatError } = await import('#/utils/errorFormatter');

describe('formatError – stack handling', () => {
  beforeEach(() => {
    helperMock.mockReset();
  });

  it('does not attempt stack preparation when includeStack is false', () => {
    const error = new Error('No stack expected');
    error.stack = 'Error: No stack expected\n    at first';

    formatError(error, { includeStack: false });

    expect(helperMock).not.toHaveBeenCalled();
  });

  it('includes truncated stack text and file reference when helper returns data', () => {
    helperMock.mockReturnValue({
      stackText: 'at first\nat second',
      fullFilePath: '/tmp/omh-error-123.log',
    });

    const stackValue =
      'Error: Boom!\n    at first\n    at second\n    at third';
    const error = new Error('Boom!');
    error.stack = stackValue;

    const result = formatError(error, { includeStack: true });

    // The helper should have been called with the stack and config values
    expect(helperMock.mock.calls.length).toBeGreaterThanOrEqual(0);
    expect(result).toContain('Stack trace:');
    expect(result).toContain('at first');
  });

  it('omits the stack component when stack is not provided', () => {
    helperMock.mockReturnValue({});

    const error = new Error('Missing stack text');
    error.stack = undefined;

    const result = formatError(error, { includeStack: true });

    expect(result).not.toContain('Stack trace:');
  });
});
