/**
 * @file stringFormatter.unit.test.mjs
 * @description Unit tests for the string formatting utility.
 * @path tests/unit/stringFormatter.unit.test.mjs
 */

import { describe, it, expect } from 'vitest';
import { formatString } from '#/utils/static/stringFormatter.ts';

describe('String Formatter', () => {
  describe('formatString()', () => {
    it('should apply prefix only', () => {
      const result = formatString('world', { prefix: 'hello-' });
      expect(result).toBe('hello-world');
    });

    it('should apply suffix only', () => {
      const result = formatString('world', { suffix: '!' });
      expect(result).toBe('world!');
    });

    it('should apply both prefix and suffix', () => {
      const result = formatString('world', { prefix: 'hello-', suffix: '!' });
      expect(result).toBe('hello-world!');
    });

    it('should return base string unchanged when no options provided', () => {
      const result = formatString('world');
      expect(result).toBe('world');
    });

    it('should handle empty string with prefix and suffix', () => {
      const result = formatString('', { prefix: 'p', suffix: 's' });
      expect(result).toBe('ps');
    });

    it('should handle empty options object (identity operation)', () => {
      const result = formatString('world', {});
      expect(result).toBe('world');
    });
  });
});
