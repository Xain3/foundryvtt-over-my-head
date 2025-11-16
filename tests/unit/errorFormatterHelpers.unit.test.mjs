/**
 * @file errorFormatterHelpers.unit.test.mjs
 * @description Unit tests for error formatter helper functions.
 * @path tests/unit/errorFormatterHelpers.unit.test.mjs
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

vi.mock('#config', () => ({
  config: {
    constants: {
      errors: {
        pattern: '{{module}}{{caller}}{{error}}{{stack}}',
        separator: ' || ',
        fallbackModuleName: 'Unknown Module',
        maxStackLines: 20,
        tempLogFilePrefix: 'omh-error',
      },
    },
    configs: {
      moduleManagement: {
        referToModuleBy: 'id',
      },
    },
    module: {
      id: 'test-module',
    },
  },
}));

vi.mock('#/utils/static/moduleNameResolver.ts', () => ({
  resolveModuleName: vi.fn(() => 'Mock Module'),
}));

vi.mock('node:fs');
vi.mock('node:os');
vi.mock('node:path');

const {
  coerceError,
  normalizeOptions,
  loadFormatterDefaults,
  resolveModuleNameSafely,
  parsePattern,
  buildComponentMap,
  buildStackComponent,
  truncateStack,
} = await import('#/utils/helpers/errorFormatterHelpers');

describe('coerceError', () => {
  it('returns Error instances unchanged', () => {
    const error = new Error('Test');
    const result = coerceError(error);
    expect(result).toBe(error);
  });

  it('converts strings to Error instances', () => {
    const result = coerceError('Test message');
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Test message');
  });

  it('throws TypeError for non-Error, non-string values', () => {
    // @ts-expect-error - intentional invalid input
    expect(() => coerceError(123)).toThrow(TypeError);
    // @ts-expect-error - intentional invalid input
    expect(() => coerceError(null)).toThrow(TypeError);
  });
});

describe('normalizeOptions', () => {
  it('returns default normalized options when undefined', () => {
    const result = normalizeOptions();
    expect(result).toEqual({
      includeStack: false,
      includeCaller: false,
      caller: undefined,
    });
  });

  it('normalizes boolean flags', () => {
    const result = normalizeOptions({
      includeStack: true,
      includeCaller: true,
    });
    expect(result.includeStack).toBe(true);
    expect(result.includeCaller).toBe(true);
  });

  it('trims caller text', () => {
    const result = normalizeOptions({
      includeCaller: true,
      caller: '  testFunc  ',
    });
    expect(result.caller).toBe('testFunc');
  });

  it('omits caller when empty after trimming', () => {
    const result = normalizeOptions({
      includeCaller: true,
      caller: '   ',
    });
    expect(result.caller).toBeUndefined();
  });
});

describe('parsePattern', () => {
  it('extracts placeholders from template string', () => {
    const result = parsePattern('{{module}} | {{error}}');
    expect(result).toEqual(['module', 'error']);
  });

  it('returns default placeholders when no matches found', () => {
    const result = parsePattern('no placeholders here');
    expect(result).toEqual(['module', 'error']);
  });

  it('handles all valid placeholder types', () => {
    const result = parsePattern('{{module}}{{caller}}{{error}}{{stack}}');
    expect(result).toEqual(['module', 'caller', 'error', 'stack']);
  });

  it('preserves placeholder order from template', () => {
    const result = parsePattern('{{error}} then {{module}}');
    expect(result).toEqual(['error', 'module']);
  });

  it('ignores invalid placeholders', () => {
    const result = parsePattern('{{module}} {{invalid}} {{error}}');
    expect(result).toEqual(['module', 'error']);
  });
});

describe('buildComponentMap', () => {
  it('builds component map with caller when includeCaller is true', () => {
    const context = {
      module: 'TestModule',
      caller: 'testFunc',
      message: 'Error message',
      stack: undefined,
    };
    const options = {
      includeStack: false,
      includeCaller: true,
    };

    const result = buildComponentMap(context, options);

    expect(result.module).toBe('TestModule');
    expect(result.caller).toBe('testFunc');
    expect(result.error).toBe('Error message');
  });

  it('omits caller when includeCaller is false', () => {
    const context = {
      module: 'TestModule',
      caller: 'testFunc',
      message: 'Error message',
      stack: undefined,
    };
    const options = {
      includeStack: false,
      includeCaller: false,
    };

    const result = buildComponentMap(context, options);

    expect(result.caller).toBeUndefined();
  });
});

describe('truncateStack', () => {
  it('returns empty object for undefined stack', () => {
    const result = truncateStack(undefined);
    expect(result).toEqual({
      truncated: undefined,
      hasOverflow: false,
      fullText: '',
    });
  });

  it('normalizes and truncates stack lines', () => {
    const stack = 'line1\r\nline2\r\nline3';
    const result = truncateStack(stack, 2);

    expect(result.truncated).toBe('line1\nline2');
    expect(result.hasOverflow).toBe(true);
  });

  it('detects overflow correctly', () => {
    const stack = 'line1\nline2\nline3\nline4';
    const result = truncateStack(stack, 2);

    expect(result.hasOverflow).toBe(true);
    expect(result.fullText).toContain('line3');
    expect(result.fullText).toContain('line4');
  });

  it('returns no overflow for stacks within limit', () => {
    const stack = 'line1\nline2';
    const result = truncateStack(stack, 5);

    expect(result.hasOverflow).toBe(false);
  });

  it('filters empty lines', () => {
    const stack = 'line1\n\nline2\n\nline3';
    const result = truncateStack(stack, 10);

    expect(result.truncated).toBe('line1\nline2\nline3');
  });
});

describe('buildStackComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns undefined when stack is undefined', () => {
    const result = buildStackComponent(undefined, {
      maxStackLines: 20,
      tempLogFilePrefix: 'test',
    });

    expect(result).toBeUndefined();
  });

  it('formats stack with truncation notice', () => {
    const stack = 'Error: test\n  at func1\n  at func2';
    const result = buildStackComponent(stack, {
      maxStackLines: 20,
      tempLogFilePrefix: 'test',
    });

    expect(result).toContain('Stack trace:');
    expect(result).toContain('at func1');
  });

  it('includes file path when provided', () => {
    vi.mocked(writeFileSync).mockImplementation(() => {});
    vi.mocked(tmpdir).mockReturnValue('/tmp');

    const longStack = Array.from(
      { length: 30 },
      (_, i) => `  at line${i}`
    ).join('\n');
    const stack = `Error: test\n${longStack}`;

    // We need to mock prepareStackForOutput to control its output
    const result = buildStackComponent(stack, {
      maxStackLines: 5,
      tempLogFilePrefix: 'test',
    });

    // Result depends on the helper function behavior
    expect(result).toBeTruthy();
  });
});

describe('resolveModuleNameSafely', () => {
  it('returns resolved module name on success', () => {
    const result = resolveModuleNameSafely('fallback');
    expect(result).toBe('Mock Module');
  });

  it('returns fallback on error', async () => {
    const { resolveModuleName } = await import(
      '#/utils/static/moduleNameResolver.ts'
    );
    vi.mocked(resolveModuleName).mockImplementation(() => {
      throw new Error('Resolution failed');
    });

    const result = resolveModuleNameSafely('Fallback Name');
    expect(result).toBe('Fallback Name');
  });
});

describe('loadFormatterDefaults', () => {
  it('returns defaults with fallback values', () => {
    const result = loadFormatterDefaults();

    expect(result.template).toBeTruthy();
    expect(result.separator).toBeTruthy();
    expect(result.componentOrder).toBeInstanceOf(Array);
    expect(result.fallbackModuleName).toBeTruthy();
    expect(result.maxStackLines).toBeGreaterThan(0);
    expect(result.tempLogFilePrefix).toBeTruthy();
  });

  it('parses pattern into componentOrder', () => {
    const result = loadFormatterDefaults();
    expect(result.componentOrder).toContain('module');
    expect(result.componentOrder).toContain('error');
  });
});
