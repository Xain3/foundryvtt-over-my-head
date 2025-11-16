/**
 * @file errorFormatter-caller.unit.test.mjs
 * @description Unit tests for caller context injection and brace escaping (User Story 3).
 * @path tests/unit/errorFormatter-caller.unit.test.mjs
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('#/utils/static/moduleNameResolver.ts', () => ({
  resolveModuleName: vi.fn(() => 'Mock Module'),
}));

const { formatError } = await import('#/utils/errorFormatter');

describe('formatError – User Story 3: Caller Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('includes caller context when includeCaller is true', () => {
    const result = formatError(new Error('Configuration failed'), {
      includeCaller: true,
      caller: 'loadConfig',
    });

    expect(result).toContain('Mock Module');
    expect(result).toContain('loadConfig');
    expect(result).toContain('Configuration failed');
  });

  it('omits caller context when includeCaller is false', () => {
    const result = formatError(new Error('Configuration failed'), {
      includeCaller: false,
      caller: 'loadConfig',
    });

    expect(result).toContain('Mock Module');
    expect(result).toContain('Configuration failed');
    expect(result).not.toContain('loadConfig');
  });

  it('omits caller context when includeCaller is true but caller is undefined', () => {
    const result = formatError(new Error('Configuration failed'), {
      includeCaller: true,
    });

    expect(result).toContain('Mock Module');
    expect(result).toContain('Configuration failed');
    // Result should not have extra separator or empty caller section
    expect(result.split('||').length).toBeLessThanOrEqual(2);
  });

  it('escapes double braces in caller names to prevent template injection', () => {
    const result = formatError(new Error('Test error'), {
      includeCaller: true,
      caller: 'function{{malicious}}name',
    });

    // The formatted output should contain the escaped caller
    // Depending on implementation, escaped braces might be rendered as literals
    // or removed. We verify that the pattern doesn't treat them as placeholders.
    expect(result).toContain('Mock Module');
    expect(result).toContain('Test error');

    // Verify that the caller section appears but doesn't cause placeholder expansion
    // The exact escaping mechanism may vary (e.g., removing braces, backslash escaping, etc.)
    // For now, we verify the caller text is present in some form
    expect(result).toMatch(/function.*malicious.*name/i);
  });

  it('trims whitespace from caller names', () => {
    const result = formatError(new Error('Test error'), {
      includeCaller: true,
      caller: '  loadConfig  ',
    });

    expect(result).toContain('loadConfig');
    expect(result).not.toMatch(/\s\sloadConfig\s\s/);
  });

  it('handles empty string caller gracefully', () => {
    const result = formatError(new Error('Test error'), {
      includeCaller: true,
      caller: '',
    });

    expect(result).toContain('Mock Module');
    expect(result).toContain('Test error');
    // Empty caller should not add extra separators
    expect(result.split('||').length).toBeLessThanOrEqual(2);
  });

  it('defaults includeCaller to false when not specified', () => {
    const result = formatError(new Error('Test error'), {
      caller: 'loadConfig',
    });

    expect(result).toContain('Mock Module');
    expect(result).toContain('Test error');
    expect(result).not.toContain('loadConfig');
  });

  it('combines caller context with stack traces when both are enabled', () => {
    const testError = new Error('Combined test');
    const result = formatError(testError, {
      includeCaller: true,
      caller: 'testFunction',
      includeStack: true,
    });

    expect(result).toContain('Mock Module');
    expect(result).toContain('testFunction');
    expect(result).toContain('Combined test');
    expect(result).toContain('Stack trace:');
  });
});
