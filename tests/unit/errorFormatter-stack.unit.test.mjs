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

vi.mock('#/utils/helpers/errorFormatterHelpers.mts', () => ({
  prepareStackForOutput: helperMock,
}));

const { formatError } = await import('#/utils/errorFormatter.mts');

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

    expect(helperMock).toHaveBeenCalledWith(stackValue, 20, 'omh-error');
    expect(result).toContain('Stack trace:');
    expect(result).toContain('at first');
    expect(result).toContain('[Full trace: /tmp/omh-error-123.log]');
  });

  it('omits the stack component when helper returns no stackText', () => {
    helperMock.mockReturnValue({});

    const error = new Error('Missing stack text');
    error.stack = 'Error: Missing stack text';

    const result = formatError(error, { includeStack: true });

    expect(result).not.toContain('Stack trace:');
  });
});
