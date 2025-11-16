/**
 * @file errorFormatter.int.test.mjs
 * @description Integration tests validating stack trace persistence to temp files.
 * @path tests/integration/errorFormatter.int.test.mjs
 */

import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, readFileSync, rmSync } from 'node:fs';

import { formatError } from '#/utils/errorFormatter';

const createdFiles = [];

describe('formatError integration – stack traces', () => {
  afterEach(() => {
    while (createdFiles.length > 0) {
      const filePath = createdFiles.pop();
      if (filePath && existsSync(filePath)) {
        rmSync(filePath);
      }
    }
  });

  it('writes overflow stack traces to a temp file and references the path in output', () => {
    const stackLines = Array.from(
      { length: 25 },
      (_, index) => `    at testStep${index}`
    );
    const rawStack = ['Error: Integration failure', ...stackLines].join('\n');
    const error = new Error('Integration failure');
    error.stack = rawStack;

    const result = formatError(error, { includeStack: true });

    expect(result).toContain('Stack trace:');
    expect(result).toContain('testStep0');
    expect(result).toContain('testStep18');
    expect(result).not.toContain('testStep24');

    const match = result.match(/\[Full trace: ([^\]]+)\]/);
    expect(match).not.toBeNull();
    if (!match) {
      return;
    }

    const [, filePath] = match;
    createdFiles.push(filePath);

    expect(existsSync(filePath)).toBe(true);

    const fileContents = readFileSync(filePath, 'utf8');
    const persistedLines = fileContents.split('\n');

    expect(persistedLines.length).toBeGreaterThan(20);
    expect(persistedLines[0]).toContain('Error: Integration failure');
    expect(persistedLines.some((line) => line.includes('testStep24'))).toBe(
      true
    );
  });
});
